/* ══════════════════════════════════════════════════════════════════════
 * المبيعات والأرباح — لوحة المدير فقط
 * الإيراد من store_orders (المنجزة)، ورأس المال من product_costs (يُدخل من نموذج المنتج)،
 * وتكلفة كل بند تُثبَّت في order_costs عند إنجاز الطلب (أو يدخلها المدير يدوياً من هنا).
 * product_costs و order_costs قراءتها للمدير فقط (database.rules.json).
 * ══════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';
    const { $, esc, ADMIN_EMAIL } = window.ZoodnyAccount;

    var orders = [], topups = [], orderCosts = {};
    var have = { o: false, t: false, c: false };
    var listening = false, refs = [];
    var lastReport = null;

    function num(v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; }
    function money(n) { n = Math.round(num(n) * 100) / 100; return (n < 0 ? '-' : '') + Math.abs(n).toFixed(2) + '$'; }
    function pct(n) { return isFinite(n) ? (Math.round(n * 10) / 10) + '%' : '—'; }
    function isAdmin() {
        var u = auth.currentUser;
        return !!u && String(u.email || '').toLowerCase() === String(ADMIN_EMAIL).toLowerCase();
    }
    function safeKey(id) { return String(id).replace(/[.#$\[\]\/]/g, '_'); }
    function norm(s) { return String(s || '').split(' | ')[0].replace(/\s+/g, ' ').trim().toLowerCase(); }

    // ═══════════════ تحميل البيانات (عند فتح التبويب فقط) ═══════════════
    function start() {
        if (listening || !isAdmin()) return;
        listening = true;
        function listen(path, onVal, flag) {
            var r = dbRef(path);
            r.on('value', function (snap) { onVal(snap); have[flag] = true; render(); }, function (err) {
                have[flag] = true;
                console.error('reports: تعذر قراءة ' + path, err);
                if (path === 'order_costs') showRulesWarning();
                render();
            });
            refs.push(r);
        }
        listen('store_orders', function (snap) {
            orders = [];
            snap.forEach(function (c) { var v = c.val(); if (v && typeof v === 'object') orders.push(Object.assign({}, v, { _key: c.key })); });
            orders.sort(function (a, b) { return num(b.ts) - num(a.ts); });
        }, 'o');
        listen('topup_orders', function (snap) {
            topups = [];
            snap.forEach(function (c) { var v = c.val(); if (v && typeof v === 'object') topups.push(v); });
        }, 't');
        listen('order_costs', function (snap) { orderCosts = snap.val() || {}; }, 'c');
    }
    function stop() {
        refs.forEach(function (r) { try { r.off(); } catch (e) {} });
        refs = []; listening = false; orders = []; topups = []; orderCosts = {};
        have = { o: false, t: false, c: false };
    }
    auth.onAuthStateChanged(function () { if (!isAdmin()) stop(); });
    document.addEventListener('zoodny:costs', function () { render(); });

    var rulesWarned = false;
    function showRulesWarning() {
        if (rulesWarned) return; rulesWarned = true;
        if (typeof showToast === 'function') showToast('لم تُنشر قواعد Firebase الجديدة بعد (product_costs و order_costs) — انسخ database.rules.json إلى Firebase', 'error');
    }

    // ═══════════════ حساب رأس مال كل بند ═══════════════
    var GROUP_SRC = ['premiumActivationsData', 'vpnData', 'electronicPaymentData'];

    function entries(srcKey) {
        var all = (window.ZoodnyCosts && window.ZoodnyCosts.all()) || {};
        var m = all[srcKey] || {};
        return Object.keys(m).map(function (k) { return Object.assign({ _k: k }, m[k]); });
    }
    function byName(list, name) { return list.filter(function (e) { return norm(e.name) === name; }); }
    function sameCost(list, field) {
        var vals = list.map(function (x) { return x[field]; }).filter(function (v) { return typeof v === 'number'; });
        if (!vals.length) return null;
        return vals.every(function (v) { return v === vals[0]; }) ? vals[0] : null;   // أسماء مكررة بأسعار مختلفة ← غير محدد
    }

    function groupedRowCost(item, name) {
        var pid = item.pid !== undefined ? String(item.pid) : '';
        var byPid = [], byNm = [];
        GROUP_SRC.forEach(function (sk) {
            entries(sk).forEach(function (e) {
                var rows = e.rows || {};
                Object.keys(rows).forEach(function (rk) {
                    var r = rows[rk];
                    if (!r || typeof r.cost !== 'number') return;
                    if (pid && r.id !== null && r.id !== undefined &&
                        (String(r.id) === pid || safeKey(e._k + '__' + r.id) === safeKey(pid) || safeKey(String(r.id)) === safeKey(pid))) byPid.push(r);
                    if (norm(r.name) === name) byNm.push(r);
                });
            });
        });
        var both = byPid.filter(function (r) { return byNm.indexOf(r) !== -1; });
        return sameCost(both, 'cost') !== null ? sameCost(both, 'cost') : (sameCost(byNm, 'cost') !== null ? sameCost(byNm, 'cost') : sameCost(byPid, 'cost'));
    }

    // يُرجع تكلفة البند كاملاً (لكل الكمية) أو null إن لم يُحدَّد رأس المال
    function resolveCurrentCost(item) {
        if (!item) return null;
        var name = norm(item.productName), qty = num(item.quantity) || 1, cat = item.category || '';
        var c;

        if (cat === 'rased') return null;   // أسعار الرصيد ثابتة في الكود — تُدخل تكلفتها يدوياً

        if (cat === 'games') {
            var gv = String(item.gameValue || '').trim();
            var games = byName(entries('gamesData'), name);
            if (!games.length) games = entries('gamesData').filter(function (x) { return name.indexOf(norm(x.name)) === 0; });
            for (var i = 0; i < games.length; i++) {
                var rows = games[i].rows || {};
                for (var rk in rows) {
                    var r = rows[rk];
                    if (r && typeof r.cost === 'number' && (String(r.value) === gv || norm(r.name) === norm(gv))) return r.cost * qty;
                }
            }
            return null;
        }
        if (cat === 'app') {
            c = sameCost(byName(entries('appsData'), name), 'unitCost');
            return c === null ? null : c * num(item.appValue || 0) * qty;
        }
        if (cat === 'social-media') {
            c = sameCost(byName(entries('products'), name), 'costBase');
            return c === null ? null : c * num(item.customQuantity || 0) / 1000;
        }
        var isGroupCat = /بريميوم|VPN|الدفع/.test(cat);
        if (isGroupCat) {
            c = groupedRowCost(item, name);
            if (c !== null) return c * qty;
        }
        var flat = byName(entries('products'), name);
        var flatSameCat = flat.filter(function (x) { return x.category === cat; });
        c = sameCost(flatSameCat.length ? flatSameCat : flat, 'cost');
        if (c !== null) return c * qty;
        if (!isGroupCat) { c = groupedRowCost(item, name); if (c !== null) return c * qty; }
        return null;
    }

    function lineCost(orderKey, itemKey, item) {
        var oc = orderCosts[safeKey(orderKey)] && orderCosts[safeKey(orderKey)][itemKey];
        if (oc && typeof oc.cost === 'number') return { cost: oc.cost, src: oc.manual ? 'manual' : 'saved' };
        var c = resolveCurrentCost(item);
        return c === null ? { cost: null, src: 'none' } : { cost: Math.round(c * 10000) / 10000, src: 'current' };
    }

    // ── تثبيت التكلفة عند إنجاز الطلب: تغيير رأس المال لاحقاً لا يغيّر أرباح الطلبات السابقة ──
    function snapshotOrder(orderKey) {
        if (!isAdmin()) return;
        dbRef('store_orders/' + orderKey).once('value').then(function (snap) {
            var o = snap.val(); if (!o || !o.items) return;
            return dbRef('order_costs/' + safeKey(orderKey)).once('value').then(function (cs) {
                var existing = cs.val() || {}, upd = {};
                Object.keys(o.items).forEach(function (k) {
                    if (existing[k] && typeof existing[k].cost === 'number') return;
                    var c = resolveCurrentCost(o.items[k]);
                    if (c !== null) upd[k] = { cost: Math.round(c * 10000) / 10000, ts: Date.now() };
                });
                if (Object.keys(upd).length) return dbRef('order_costs/' + safeKey(orderKey)).update(upd);
            });
        }).catch(function (err) { console.warn('snapshot cost failed', err); });
    }
    var origUpdate = window.admUpdateOrderStatus;
    if (typeof origUpdate === 'function') {
        window.admUpdateOrderStatus = function (orderKey, status) {
            var r = origUpdate.apply(this, arguments);
            if (status === 'done') snapshotOrder(orderKey);
            return r;
        };
    }

    window.rptEditCost = function (orderKey, itemKey) {
        var o = orders.filter(function (x) { return x._key === orderKey; })[0];
        var item = o && o.items && o.items[itemKey];
        if (!item) return;
        var cur = lineCost(orderKey, itemKey, item);
        var v = prompt('رأس مال (تكلفة) هذا البند بالكامل بالدولار:\n' + (item.productName || '') + ' — الكمية: ' + (item.quantity || 1) +
            ' — سعر البيع: ' + money(item.totalItem || num(item.price) * (num(item.quantity) || 1)) +
            '\n\nاترك الحقل فارغاً لإلغاء التكلفة اليدوية والعودة للحساب التلقائي.', cur.cost !== null ? cur.cost : '');
        if (v === null) return;
        saveManualCost(orderKey, itemKey, v);
    };
    function saveManualCost(orderKey, itemKey, raw) {
        var ref = dbRef('order_costs/' + safeKey(orderKey) + '/' + itemKey);
        var s = String(raw).trim().replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 0x0660); }).replace(/[٫,]/g, '.').replace(/[$\s]/g, '');
        if (s === '') { ref.remove(); return; }
        var n = Number(s);
        if (!/^\d*\.?\d+$/.test(s) || isNaN(n) || n < 0) { alert('اكتب رقماً صحيحاً (مثال: 2.5)'); return; }
        ref.set({ cost: n, manual: true, ts: Date.now() }).then(function () {
            if (typeof showToast === 'function') showToast('تم حفظ التكلفة', 'success');
        }).catch(function (err) {
            alert('تعذر الحفظ — تأكد من نشر قواعد Firebase الجديدة.\n' + (err && err.message ? err.message : err));
        });
    }
    window.rptSaveInline = function (btn) {
        var inp = btn.parentNode.querySelector('input');
        if (inp) saveManualCost(btn.dataset.o, btn.dataset.i, inp.value);
    };

    // ═══════════════ الفترة الزمنية ═══════════════
    function dayStart(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); }
    function getRange() {
        var p = $('rptPeriod').value, now = new Date(), t0 = dayStart(now), DAY = 86400000;
        switch (p) {
            case 'today': return { from: t0, to: t0 + DAY, label: 'اليوم' };
            case 'yesterday': return { from: t0 - DAY, to: t0, label: 'أمس' };
            case '7d': return { from: t0 - 6 * DAY, to: t0 + DAY, label: 'آخر 7 أيام' };
            case '30d': return { from: t0 - 29 * DAY, to: t0 + DAY, label: 'آخر 30 يوماً' };
            case 'month': return { from: new Date(now.getFullYear(), now.getMonth(), 1).getTime(), to: new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime(), label: 'هذا الشهر' };
            case 'lastMonth': return { from: new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime(), to: new Date(now.getFullYear(), now.getMonth(), 1).getTime(), label: 'الشهر الماضي' };
            case 'year': return { from: new Date(now.getFullYear(), 0, 1).getTime(), to: new Date(now.getFullYear() + 1, 0, 1).getTime(), label: 'هذه السنة' };
            case 'custom': {
                var f = $('rptFrom').value, t = $('rptTo').value;
                var from = f ? new Date(f + 'T00:00:00').getTime() : -Infinity;
                var to = t ? new Date(t + 'T00:00:00').getTime() + DAY : Infinity;
                return { from: from, to: to, label: 'فترة مخصصة' };
            }
            default: return { from: -Infinity, to: Infinity, label: 'كل الفترات', all: true };
        }
    }
    function inRange(ts, r) {
        if (r.all) return true;
        ts = num(ts);
        return ts > 0 && ts >= r.from && ts < r.to;
    }
    var DATE_LOC = 'ar-SY-u-nu-latn';
    function fmtDate(ts, withTime) {
        if (!num(ts)) return '—';
        var d = new Date(num(ts));
        try {
            return withTime ? d.toLocaleString(DATE_LOC, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                            : d.toLocaleDateString(DATE_LOC, { year: 'numeric', month: 'long', day: 'numeric' });
        } catch (e) { return d.toISOString().slice(0, 10); }
    }
    function dayKey(ts) {
        var d = new Date(num(ts));
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    function rangeText(r) {
        if (r.all) return 'كل الفترات';
        var f = isFinite(r.from) ? fmtDate(r.from) : 'البداية';
        var t = isFinite(r.to) ? fmtDate(r.to - 1) : 'اليوم';
        return f === t ? f : ('من ' + f + ' إلى ' + t);
    }

    function catLabel(cat) {
        var M = { 'games': 'شحن الألعاب', 'app': 'شحن التطبيقات', 'rased': 'رصيد موبايل', 'social-media': 'خدمات السوشال ميديا' };
        if (M[cat]) return M[cat];
        try {
            var c = (typeof categories !== 'undefined' ? categories : []).filter(function (x) { return x.id === cat; })[0];
            if (c && c.name) return c.name;
        } catch (e) {}
        return cat || 'غير مصنف';
    }
    function itemDetail(it) {
        var d = [];
        if (it.gameValue) d.push(it.gameValue);
        if (it.appValue) d.push('الكمية: ' + it.appValue);
        if (it.customQuantity && it.category === 'social-media') d.push(it.customQuantity + ' متابع/تفاعل');
        if (it.creditValue) d.push(it.creditValue);
        return d.join(' · ');
    }

    // ═══════════════ بناء التقرير ═══════════════
    function build() {
        var r = getRange();
        var inclProc = $('rptInclProcessing').checked;
        var sold = [], rejected = [], open = [];
        orders.forEach(function (o) {
            if (!inRange(o.ts, r)) return;
            var st = o.status || 'pending';
            if (st === 'done' || (inclProc && st === 'processing')) sold.push(o);
            else if (st === 'rejected') rejected.push(o);
            else open.push(o);
        });

        var lines = [];
        sold.forEach(function (o) {
            var items = o.items && typeof o.items === 'object' ? o.items : null;
            var keys = items ? Object.keys(items) : [];
            if (!keys.length) {
                lines.push({ o: o, key: '_order', item: { productName: 'طلب بدون تفاصيل', quantity: 1, category: '' }, qty: 1, rev: num(o.total), cost: null, src: 'none' });
                return;
            }
            keys.sort(function (a, b) { return (parseInt(a.replace(/\D/g, ''), 10) || 0) - (parseInt(b.replace(/\D/g, ''), 10) || 0); });
            keys.forEach(function (k) {
                var it = items[k] || {};
                var qty = num(it.quantity) || 1;
                var rev = it.totalItem !== undefined ? num(it.totalItem) : num(it.price) * qty;
                var lc = lineCost(o._key, k, it);
                lines.push({ o: o, key: k, item: it, qty: qty, rev: rev, cost: lc.cost, src: lc.src });
            });
        });

        var T = { revenue: 0, costKnown: 0, revKnown: 0, revUnknown: 0, items: 0, unknownLines: 0 };
        var byProd = {}, byCat = {}, byDay = {}, byCust = {};
        lines.forEach(function (l) {
            var known = l.cost !== null;
            var profit = known ? l.rev - l.cost : 0;
            T.revenue += l.rev; T.items += l.qty;
            if (known) { T.costKnown += l.cost; T.revKnown += l.rev; } else { T.revUnknown += l.rev; T.unknownLines++; }

            var cat = l.item.category || '';
            var pk = norm(l.item.productName) + '|' + cat;
            var P = byProd[pk] || (byProd[pk] = { name: String(l.item.productName || '').split(' | ')[0], cat: cat, qty: 0, rev: 0, cost: 0, profit: 0, unknown: 0 });
            P.qty += l.qty; P.rev += l.rev; if (known) { P.cost += l.cost; P.profit += profit; } else P.unknown++;

            var C = byCat[cat] || (byCat[cat] = { cat: cat, qty: 0, rev: 0, cost: 0, profit: 0, unknown: 0 });
            C.qty += l.qty; C.rev += l.rev; if (known) { C.cost += l.cost; C.profit += profit; } else C.unknown++;

            var dk = num(l.o.ts) ? dayKey(l.o.ts) : 'بدون تاريخ';
            var D = byDay[dk] || (byDay[dk] = { day: dk, ts: num(l.o.ts), orders: {}, rev: 0, cost: 0, profit: 0 });
            D.orders[l.o._key] = 1; D.rev += l.rev; if (known) { D.cost += l.cost; D.profit += profit; }

            var ck = l.o.uid || l.o.email || l.o.name || 'unknown';
            var U = byCust[ck] || (byCust[ck] = { name: l.o.name || l.o.email || 'غير معروف', phone: l.o.phone || '', orders: {}, rev: 0, profit: 0 });
            U.orders[l.o._key] = 1; U.rev += l.rev; if (known) U.profit += profit;
        });
        T.profit = T.revKnown - T.costKnown;
        T.margin = T.revKnown > 0 ? T.profit / T.revKnown * 100 : NaN;
        T.orders = sold.length;
        T.avgOrder = sold.length ? T.revenue / sold.length : 0;
        T.avgProfit = sold.length ? T.profit / sold.length : 0;
        T.customers = Object.keys(byCust).length;
        T.rejectedCount = rejected.length;
        T.rejectedValue = rejected.reduce(function (s, o) { return s + num(o.total); }, 0);
        T.openCount = open.length;
        T.openValue = open.reduce(function (s, o) { return s + num(o.total); }, 0);
        var acceptedTopups = topups.filter(function (t) { return t.status === 'accepted' && inRange(t.ts || num(String(t.reqId || '').replace(/^TU-/, '')), r); });
        T.topupCount = acceptedTopups.length;
        T.topupValue = acceptedTopups.reduce(function (s, t) { return s + num(t.amount); }, 0);

        function vals(m) { return Object.keys(m).map(function (k) { return m[k]; }); }
        var prods = vals(byProd).sort(function (a, b) { return b.profit - a.profit || b.rev - a.rev; });
        var cats = vals(byCat).sort(function (a, b) { return b.rev - a.rev; });
        var days = vals(byDay).sort(function (a, b) { return a.day < b.day ? 1 : -1; });
        days.forEach(function (d) { d.orderCount = Object.keys(d.orders).length; });
        var custs = vals(byCust).sort(function (a, b) { return b.rev - a.rev; });
        custs.forEach(function (c) { c.orderCount = Object.keys(c.orders).length; });

        return { range: r, inclProc: inclProc, T: T, lines: lines, prods: prods, cats: cats, days: days, custs: custs, generated: Date.now() };
    }

    // ═══════════════ العرض على الشاشة ═══════════════
    function kpi(cls, icon, label, value, sub) {
        return '<div class="rpt-kpi ' + cls + '"><i class="fas ' + icon + '"></i><div><div class="rpt-kpi-lbl">' + label + '</div>' +
            '<div class="rpt-kpi-val">' + value + '</div>' + (sub ? '<div class="rpt-kpi-sub">' + sub + '</div>' : '') + '</div></div>';
    }
    function profitCell(v, unknown) {
        return '<td class="' + (v < 0 ? 'neg' : 'pos') + '">' + money(v) + (unknown ? ' <span class="rpt-warn" title="بنود بلا رأس مال">*</span>' : '') + '</td>';
    }
    function marginOf(p, rev, cost) { var base = cost + p; return base > 0 ? pct(p / base * 100) : '—'; }

    function render() {
        var panel = $('panel-reports');
        if (!panel || !panel.classList.contains('active') || !listening) return;
        var body = $('rptBody');
        if (!have.o) { body.innerHTML = '<div class="adm-no-data"><i class="fas fa-spinner fa-spin"></i> جارٍ تحميل البيانات...</div>'; return; }
        var R = lastReport = build(), T = R.T;

        var h = '<div class="rpt-period"><i class="far fa-calendar-alt"></i> ' + esc(rangeText(R.range)) +
            (R.inclProc ? ' — <span>تشمل الطلبات قيد التنفيذ</span>' : '') + '</div>';

        h += '<div class="rpt-kpis">' +
            kpi('k-rev', 'fa-cash-register', 'إجمالي الإيرادات (المبيعات)', money(T.revenue), T.orders + ' طلب منجز') +
            kpi('k-cost', 'fa-boxes', 'رأس المال (تكلفة المباع)', money(T.costKnown), T.unknownLines ? T.unknownLines + ' بند بلا رأس مال' : 'كل البنود محسوبة') +
            kpi(T.profit < 0 ? 'k-loss' : 'k-profit', 'fa-hand-holding-usd', 'صافي الربح', money(T.profit), 'هامش الربح: ' + pct(T.margin)) +
            kpi('k-avg', 'fa-receipt', 'متوسط قيمة الطلب', money(T.avgOrder), 'متوسط الربح: ' + money(T.avgProfit)) +
            kpi('k-items', 'fa-shopping-basket', 'عدد القطع المباعة', T.items, R.prods.length + ' منتج مختلف') +
            kpi('k-cust', 'fa-user-friends', 'العملاء المشترون', T.customers, '') +
            kpi('k-top', 'fa-wallet', 'الرصيد المشحون (مقبول)', money(T.topupValue), T.topupCount + ' عملية شحن') +
            kpi('k-open', 'fa-hourglass-half', 'طلبات لم تُنجز بعد', T.openCount, 'بقيمة ' + money(T.openValue)) +
            kpi('k-rej', 'fa-undo', 'طلبات مرفوضة (مُرجعة)', T.rejectedCount, 'بقيمة ' + money(T.rejectedValue)) +
            '</div>';

        if (T.unknownLines) {
            h += '<div class="rpt-alert"><i class="fas fa-exclamation-triangle"></i> يوجد <b>' + T.unknownLines + '</b> بند مباع بقيمة <b>' + money(T.revUnknown) +
                '</b> بدون سعر رأس مال، فهي <b>غير داخلة</b> في حساب الربح. حدّد رأس المال من "إدارة المنتجات"، أو أدخل تكلفتها مباشرة من الجدول أدناه.</div>';
        }

        if (!R.lines.length) {
            h += '<div class="adm-no-data">لا توجد مبيعات منجزة في هذه الفترة</div>';
            body.innerHTML = h; return;
        }

        // ── بنود بلا رأس مال: إدخال سريع ──
        var unknown = R.lines.filter(function (l) { return l.cost === null && l.key !== '_order'; });
        if (unknown.length) {
            h += '<div class="adm-sec"><h4><i class="fas fa-pen"></i> بنود بلا رأس مال — أدخل تكلفة كل بند (المبلغ الكامل للبند)</h4><div class="adm-tbl-wrap"><table class="adm-tbl rpt-tbl"><thead><tr>' +
                '<th>التاريخ</th><th>الطلب</th><th>المنتج</th><th>الكمية</th><th>سعر البيع</th><th>التكلفة</th></tr></thead><tbody>' +
                unknown.slice(0, 60).map(function (l) {
                    return '<tr><td>' + esc(fmtDate(l.o.ts)) + '</td><td class="ltr">' + esc(l.o.orderId || l.o._key) + '</td>' +
                        '<td>' + esc(String(l.item.productName || '').split(' | ')[0]) + (itemDetail(l.item) ? '<div class="rpt-sub">' + esc(itemDetail(l.item)) + '</div>' : '') + '</td>' +
                        '<td>' + l.qty + '</td><td>' + money(l.rev) + '</td>' +
                        '<td><span class="rpt-inline"><input type="text" inputmode="decimal" dir="ltr" placeholder="0.00">' +
                        '<button type="button" class="adm-act-btn view" data-o="' + esc(l.o._key) + '" data-i="' + esc(l.key) + '" onclick="rptSaveInline(this)"><i class="fas fa-check"></i></button></span></td></tr>';
                }).join('') + '</tbody></table></div>' +
                (unknown.length > 60 ? '<div class="rpt-sub" style="padding:.4rem">يُعرض أول 60 بنداً — احفظها ليظهر الباقي.</div>' : '') + '</div>';
        }

        h += sectionProducts(R, false) + sectionCategories(R, false) + sectionDays(R, false) + sectionCustomers(R, false) + sectionDetails(R, false);
        body.innerHTML = h;
    }

    // ── الأقسام (نفس الجداول للشاشة وللطباعة) ──
    function tbl(head, rows, foot) {
        return '<div class="adm-tbl-wrap"><table class="adm-tbl rpt-tbl"><thead><tr>' + head.map(function (x) { return '<th>' + x + '</th>'; }).join('') +
            '</tr></thead><tbody>' + rows.join('') + '</tbody>' + (foot ? '<tfoot>' + foot + '</tfoot>' : '') + '</table></div>';
    }
    function sec(icon, title, inner) { return '<div class="adm-sec rpt-sec"><h4><i class="fas ' + icon + '"></i> ' + title + '</h4>' + inner + '</div>'; }

    function sectionProducts(R) {
        var T = R.T;
        var rows = R.prods.map(function (p, i) {
            return '<tr><td>' + (i + 1) + '</td><td>' + esc(p.name) + '</td><td>' + esc(catLabel(p.cat)) + '</td><td>' + p.qty + '</td><td>' + money(p.rev) + '</td>' +
                '<td>' + (p.unknown && !p.cost ? '—' : money(p.cost)) + '</td>' + profitCell(p.profit, p.unknown) + '<td>' + (p.unknown && !p.cost ? '—' : marginOf(p.profit, p.rev, p.cost)) + '</td></tr>';
        });
        var foot = '<tr><td colspan="3">الإجمالي</td><td>' + T.items + '</td><td>' + money(T.revenue) + '</td><td>' + money(T.costKnown) + '</td><td>' + money(T.profit) + '</td><td>' + pct(T.margin) + '</td></tr>';
        return sec('fa-box', 'المبيعات والأرباح حسب المنتج', tbl(['#', 'المنتج', 'التصنيف', 'الكمية', 'الإيراد', 'رأس المال', 'الربح', 'الهامش'], rows, foot));
    }
    function sectionCategories(R) {
        var max = Math.max.apply(null, R.cats.map(function (c) { return c.rev; }).concat([1]));
        var rows = R.cats.map(function (c) {
            return '<tr><td>' + esc(catLabel(c.cat)) + '</td><td>' + c.qty + '</td><td>' + money(c.rev) + '<div class="rpt-bar"><span style="width:' + Math.round(c.rev / max * 100) + '%"></span></div></td>' +
                '<td>' + money(c.cost) + '</td>' + profitCell(c.profit, c.unknown) + '<td>' + (R.T.revenue > 0 ? pct(c.rev / R.T.revenue * 100) : '—') + '</td></tr>';
        });
        return sec('fa-layer-group', 'حسب التصنيف', tbl(['التصنيف', 'الكمية', 'الإيراد', 'رأس المال', 'الربح', 'من المبيعات'], rows));
    }
    function sectionDays(R) {
        var max = Math.max.apply(null, R.days.map(function (d) { return Math.abs(d.profit); }).concat([0.01]));
        var rows = R.days.map(function (d) {
            return '<tr><td>' + (d.ts ? esc(fmtDate(d.ts)) : 'بدون تاريخ') + '</td><td>' + d.orderCount + '</td><td>' + money(d.rev) + '</td><td>' + money(d.cost) + '</td>' +
                '<td class="' + (d.profit < 0 ? 'neg' : 'pos') + '">' + money(d.profit) + '<div class="rpt-bar ' + (d.profit < 0 ? 'neg' : '') + '"><span style="width:' + Math.round(Math.abs(d.profit) / max * 100) + '%"></span></div></td></tr>';
        });
        return sec('fa-calendar-day', 'الحركة اليومية', tbl(['اليوم', 'الطلبات', 'الإيراد', 'رأس المال', 'الربح'], rows));
    }
    function sectionCustomers(R, print) {
        var list = R.custs.slice(0, print ? 15 : 20);
        var rows = list.map(function (c, i) {
            return '<tr><td>' + (i + 1) + '</td><td>' + esc(c.name) + '</td><td class="ltr">' + esc(c.phone || '—') + '</td><td>' + c.orderCount + '</td><td>' + money(c.rev) + '</td><td>' + money(c.profit) + '</td></tr>';
        });
        return sec('fa-crown', 'أفضل العملاء' + (R.custs.length > list.length ? ' (أعلى ' + list.length + ')' : ''), tbl(['#', 'العميل', 'الهاتف', 'الطلبات', 'المشتريات', 'الربح منه'], rows));
    }
    function sectionDetails(R, print) {
        var rows = R.lines.map(function (l) {
            var known = l.cost !== null, p = known ? l.rev - l.cost : 0;
            var srcTag = l.src === 'manual' ? ' <span class="rpt-tag">يدوي</span>' : '';
            var edit = (!print && l.key !== '_order') ? ' <button type="button" class="rpt-edit" title="تعديل التكلفة" onclick="rptEditCost(\'' + esc(l.o._key) + '\',\'' + esc(l.key) + '\')"><i class="fas fa-pen"></i></button>' : '';
            return '<tr><td>' + esc(fmtDate(l.o.ts, true)) + '</td><td class="ltr">' + esc(l.o.orderId || l.o._key) + '</td><td>' + esc(l.o.name || '—') + '</td>' +
                '<td>' + esc(String(l.item.productName || '').split(' | ')[0]) + (itemDetail(l.item) ? '<div class="rpt-sub">' + esc(itemDetail(l.item)) + '</div>' : '') + '</td>' +
                '<td>' + l.qty + '</td><td>' + money(l.rev) + '</td><td>' + (known ? money(l.cost) : '<span class="rpt-warn">غير محدد</span>') + srcTag + edit + '</td>' +
                (known ? profitCell(p) : '<td>—</td>') + '</tr>';
        });
        return sec('fa-list-ul', 'تفاصيل كل عمليات البيع (' + R.lines.length + ' بند)',
            tbl(['التاريخ', 'رقم الطلب', 'العميل', 'المنتج', 'الكمية', 'سعر البيع', 'رأس المال', 'الربح'], rows));
    }

    // ═══════════════ الطباعة على ورق A4 ═══════════════
    function printReport() {
        if (!lastReport) { render(); }
        var R = lastReport;
        if (!R) { alert('انتظر حتى يكتمل تحميل البيانات'); return; }
        var T = R.T, withDetails = $('rptPrintDetails').checked;
        var base = location.href.replace(/[#?].*$/, '').replace(/[^\/]*$/, '');

        function box(label, val, sub, cls) {
            return '<div class="k ' + (cls || '') + '"><div class="l">' + label + '</div><div class="v">' + val + '</div>' + (sub ? '<div class="s">' + sub + '</div>' : '') + '</div>';
        }
        var html = '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><base href="' + esc(base) + '">' +
            '<title>تقرير المبيعات والأرباح — زودني</title>' +
            '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">' +
            '<style>' + PRINT_CSS + '</style></head><body>' +
            '<div class="bar no-print"><button onclick="window.print()">🖨️ طباعة</button><button onclick="window.close()">إغلاق</button></div>' +
            '<div class="page">' +
            '<header><img src="images/logo.jpg" alt="" onerror="this.style.display=\'none\'"><div><h1>تقرير المبيعات والأرباح</h1><div class="store">زودني — Zoodny Store</div></div>' +
            '<div class="meta"><div><b>الفترة:</b> ' + esc(rangeText(R.range)) + '</div><div><b>تاريخ الإصدار:</b> ' + esc(fmtDate(R.generated, true)) + '</div>' +
            (R.inclProc ? '<div>يشمل الطلبات قيد التنفيذ</div>' : '<div>الطلبات المنجزة فقط</div>') + '</div></header>' +
            '<div class="kpis">' +
            box('إجمالي الإيرادات', money(T.revenue), T.orders + ' طلب منجز') +
            box('رأس المال', money(T.costKnown), T.unknownLines ? T.unknownLines + ' بند بلا رأس مال' : '') +
            box('صافي الربح', money(T.profit), 'هامش الربح: ' + pct(T.margin), T.profit < 0 ? 'neg' : 'pos') +
            box('متوسط قيمة الطلب', money(T.avgOrder), 'متوسط الربح: ' + money(T.avgProfit)) +
            box('القطع المباعة', T.items, R.prods.length + ' منتج') +
            box('العملاء المشترون', T.customers, '') +
            box('الرصيد المشحون', money(T.topupValue), T.topupCount + ' عملية') +
            box('طلبات مرفوضة', T.rejectedCount, 'بقيمة ' + money(T.rejectedValue)) +
            '</div>' +
            (T.unknownLines ? '<div class="note">ملاحظة: ' + T.unknownLines + ' بند بقيمة ' + money(T.revUnknown) + ' بدون سعر رأس مال وغير داخلة في حساب الربح (مُعلّمة بـ *).</div>' : '') +
            (R.lines.length ? sectionProducts(R, true) + sectionCategories(R, true) + sectionDays(R, true) + sectionCustomers(R, true) + (withDetails ? sectionDetails(R, true) : '')
                            : '<p class="empty">لا توجد مبيعات منجزة في هذه الفترة</p>') +
            '<footer>تقرير داخلي — للمدير فقط · زودني Zoodny Store</footer>' +
            '</div>' +
            '<script>window.addEventListener("load",function(){setTimeout(function(){try{window.focus();window.print();}catch(e){}},500);});<\/script>' +
            '</body></html>';

        var w = null;
        try { w = window.open('', '_blank'); } catch (e) { w = null; }
        if (w && w.document) {
            w.document.open(); w.document.write(html); w.document.close();
            return;
        }
        // النوافذ المنبثقة محجوبة ← نطبع عبر إطار مخفي
        var fr = document.createElement('iframe');
        fr.style.cssText = 'position:fixed;width:0;height:0;border:0;left:0;bottom:0;visibility:hidden';
        document.body.appendChild(fr);
        var d = fr.contentWindow.document;
        d.open(); d.write(html.replace(/<script>[\s\S]*?<\/script>/, '')); d.close();
        setTimeout(function () {
            try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch (e) { alert('تعذر فتح نافذة الطباعة — اسمح بالنوافذ المنبثقة لهذا الموقع'); }
            setTimeout(function () { fr.parentNode && fr.parentNode.removeChild(fr); }, 60000);
        }, 800);
    }

    var PRINT_CSS =
        '@page{size:A4 portrait;margin:12mm 10mm}' +
        '*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
        'body{margin:0;font-family:Cairo,Tahoma,Arial,sans-serif;color:#1a252f;font-size:10.5pt;background:#eef1f5}' +
        '.page{max-width:210mm;margin:0 auto;background:#fff;padding:10mm}' +
        '.bar{position:sticky;top:0;display:flex;gap:8px;justify-content:center;padding:10px;background:#2A3F54;z-index:5}' +
        '.bar button{font-family:inherit;font-size:14px;font-weight:700;border:0;border-radius:8px;padding:8px 18px;cursor:pointer;background:#F7C873;color:#1a252f}' +
        '.bar button+button{background:#fff}' +
        'header{display:flex;align-items:center;gap:12px;border-bottom:3px solid #F7C873;padding-bottom:8px;margin-bottom:10px}' +
        'header img{width:52px;height:52px;border-radius:50%;object-fit:cover}' +
        'header h1{margin:0;font-size:17pt;color:#2A3F54}.store{color:#666;font-size:10pt}' +
        '.meta{margin-inline-start:auto;font-size:9pt;color:#444;text-align:left;line-height:1.6}' +
        '.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px}' +
        '.k{border:1px solid #dde3ea;border-radius:8px;padding:6px 8px;background:#f8fafc}' +
        '.k .l{font-size:8.5pt;color:#667}.k .v{font-size:13pt;font-weight:800;color:#2A3F54}.k .s{font-size:8pt;color:#888}' +
        '.k.pos{background:#eafaf1;border-color:#bfe9cf}.k.pos .v{color:#1e8449}.k.neg{background:#fdecea;border-color:#f5c6cb}.k.neg .v{color:#c0392b}' +
        '.note{background:#fff8e6;border:1px solid #f7d58a;border-radius:6px;padding:5px 8px;font-size:9pt;margin-bottom:8px}' +
        '.adm-sec{margin-top:10px;break-inside:auto}' +
        '.adm-sec h4{margin:0 0 5px;font-size:11.5pt;color:#2A3F54;border-right:4px solid #F7C873;padding-right:6px;break-after:avoid}' +
        'table{width:100%;border-collapse:collapse;font-size:9pt}' +
        'thead{display:table-header-group}tfoot{display:table-row-group}' +
        'th{background:#2A3F54;color:#fff;font-weight:700;padding:4px 5px;text-align:right}' +
        'td{border-bottom:1px solid #e3e7ec;padding:3.5px 5px;vertical-align:top}' +
        'tr{break-inside:avoid}tbody tr:nth-child(even) td{background:#f7f9fb}' +
        'tfoot td{font-weight:800;background:#fff6e0 !important;border-top:2px solid #F7C873}' +
        '.pos{color:#1e8449;font-weight:700}.neg{color:#c0392b;font-weight:700}.ltr{direction:ltr;text-align:right}' +
        '.rpt-sub{font-size:8pt;color:#888}.rpt-warn{color:#b7791f;font-weight:800}.rpt-tag{font-size:7.5pt;background:#eef;border-radius:4px;padding:0 3px;color:#556}' +
        '.rpt-bar{height:4px;background:#eef1f5;border-radius:3px;margin-top:2px;overflow:hidden}.rpt-bar span{display:block;height:100%;background:#27ae60}.rpt-bar.neg span{background:#e74c3c}' +
        '.empty{text-align:center;color:#888;padding:20px}' +
        'footer{margin-top:12px;border-top:1px solid #ddd;padding-top:5px;font-size:8pt;color:#999;text-align:center}' +
        '@media print{body{background:#fff}.page{padding:0;max-width:none}.no-print{display:none !important}}' +
        '@media screen and (max-width:700px){.page{padding:4mm}.kpis{grid-template-columns:repeat(2,1fr)}header{flex-wrap:wrap}.meta{text-align:right;margin:0}}';

    // ═══════════════ الربط بالواجهة ═══════════════
    function init() {
        var tab = document.querySelector('.adm-tab[data-panel="reports"]');
        if (!tab) return;
        tab.addEventListener('click', function () { start(); setTimeout(render, 0); });
        $('rptPeriod').addEventListener('change', function () {
            $('rptCustom').style.display = this.value === 'custom' ? '' : 'none';
            if (this.value === 'custom' && !$('rptFrom').value) {
                var d = new Date();
                $('rptFrom').value = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-01';
                $('rptTo').value = dayKey(d.getTime());
            }
            render();
        });
        ['rptFrom', 'rptTo', 'rptInclProcessing'].forEach(function (id) { $(id).addEventListener('change', render); });
        $('rptPrintBtn').addEventListener('click', printReport);
    }
    init();
}());
