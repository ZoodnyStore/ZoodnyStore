/* ══════════════════════════════════════════════════════════════════════
 * أدوات المدير: الموظفون وصلاحياتهم، سجل النشاط، التصدير إلى Excel، النسخ الاحتياطي
 * يعتمد على window.ZoodnyAdmin و window.zoodnyLog من admin.js
 * المسارات: staff/{uid} و admin_log و product_* — قواعدها في database.rules.json
 * ══════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';
    const { $, esc, escJs, balToast } = window.ZoodnyAccount;
    var ZA = window.ZoodnyAdmin;
    if (!ZA || !$('panel-tools')) return;

    function log(a, t, r) { if (window.zoodnyLog) window.zoodnyLog(a, t, r); }
    function num(v) { var n = parseFloat(v); return isFinite(n) ? n : 0; }
    function fmtTs(ts) { return ts ? new Date(ts).toLocaleString('ar-SY-u-nu-latn', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'; }
    function errMsg(err) { return (err && err.message ? err.message : String(err)) + ' — تأكد من نشر قواعد Firebase الجديدة'; }

    // ═══════════════ التنقل داخل التبويب ═══════════════
    var started = false;
    function showSec(name) {
        document.querySelectorAll('[data-tl]').forEach(function (b) { b.classList.toggle('active', b.dataset.tl === name); });
        ['staff', 'log', 'backup'].forEach(function (n) { $('tl-' + n).style.display = n === name ? '' : 'none'; });
    }
    document.querySelectorAll('[data-tl]').forEach(function (b) { b.addEventListener('click', function () { showSec(b.dataset.tl); }); });
    var tab = document.querySelector('.adm-tab[data-panel="tools"]');
    if (tab) tab.addEventListener('click', function () { if (ZA.isAdmin()) start(); });
    auth.onAuthStateChanged(function () { if (!ZA.isAdmin()) stop(); });

    var refs = [];
    function start() {
        if (started) return;
        started = true;
        var r1 = dbRef('staff');
        r1.on('value', function (snap) { staffMap = snap.val() || {}; renderStaff(); }, function (err) {
            $('stfList').innerHTML = '<div class="adm-no-data" style="color:#e74c3c">' + esc(errMsg(err)) + '</div>';
        });
        var r2 = dbRef('admin_log').orderByChild('ts').limitToLast(500);
        r2.on('value', function (snap) {
            logs = [];
            snap.forEach(function (c) { var v = c.val(); if (v && typeof v === 'object') logs.push(v); });
            logs.sort(function (a, b) { return num(b.ts) - num(a.ts); });
            renderLog();
        }, function (err) {
            $('logList').innerHTML = '<div class="adm-no-data" style="color:#e74c3c">' + esc(errMsg(err)) + '</div>';
        });
        refs.push(r1, r2);
    }
    function stop() {
        refs.forEach(function (r) { try { r.off(); } catch (e) {} });
        refs = []; started = false; staffMap = {}; logs = [];
    }

    // ═══════════════ الموظفون ═══════════════
    var staffMap = {};
    function renderStaff() {
        var keys = Object.keys(staffMap);
        if (!keys.length) { $('stfList').innerHTML = '<div class="adm-no-data">لا يوجد موظفون بعد</div>'; return; }
        $('stfList').innerHTML = keys.map(function (uid) {
            var s = staffMap[uid] || {}, k = escJs(uid);
            return '<div class="stf-card' + (s.active ? '' : ' off') + '">' +
                '<div class="stf-info"><div class="stf-name"><i class="fas fa-user-tie"></i> ' + esc(s.name || '—') +
                    (s.active ? ' <span class="ws-badge">نشط</span>' : ' <span class="blk-badge">موقوف</span>') + '</div>' +
                    '<div class="stf-mail">' + esc(s.email || uid) + '</div>' +
                    '<div class="stf-date">أُضيف: ' + esc(fmtTs(s.addedAt)) + '</div></div>' +
                '<div class="stf-perms">' +
                    '<label class="rpt-check"><input type="checkbox" ' + (s.orders ? 'checked' : '') + ' onchange="stfSetPerm(\'' + k + '\',\'orders\',this.checked)"> الطلبات</label>' +
                    '<label class="rpt-check"><input type="checkbox" ' + (s.topups ? 'checked' : '') + ' onchange="stfSetPerm(\'' + k + '\',\'topups\',this.checked)"> شحن الرصيد</label>' +
                '</div>' +
                '<div class="stf-btns">' +
                    '<button class="adm-act-btn ' + (s.active ? 'ws-off' : 'ws-on') + '" onclick="stfToggle(\'' + k + '\')"><i class="fas ' + (s.active ? 'fa-pause' : 'fa-play') + '"></i> ' + (s.active ? 'إيقاف' : 'تفعيل') + '</button>' +
                    '<button class="adm-act-btn del" onclick="stfRemove(\'' + k + '\')"><i class="fas fa-trash"></i> حذف</button>' +
                '</div></div>';
        }).join('');
    }
    function staffLabel(uid) { var s = staffMap[uid] || {}; return s.name || s.email || uid; }

    function findUserByEmail(email) {
        var e = email.toLowerCase();
        var hit = (ZA.users() || []).filter(function (u) { return String(u.email || '').toLowerCase() === e; })[0];
        if (hit) return Promise.resolve({ uid: hit.uid || hit._key, name: hit.name || '', email: hit.email });
        return dbRef('users').once('value').then(function (snap) {
            var found = null;
            snap.forEach(function (c) { var u = c.val(); if (!found && u && String(u.email || '').toLowerCase() === e) found = { uid: c.key, name: u.name || '', email: u.email }; });
            return found;
        });
    }
    $('stfAddBtn').addEventListener('click', function () {
        var email = $('stfEmail').value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('اكتب إيميل صحيح'); return; }
        var orders = $('stfOrders').checked, topups = $('stfTopups').checked;
        if (!orders && !topups) { alert('اختر صلاحية واحدة على الأقل'); return; }
        var btn = this; btn.disabled = true;
        findUserByEmail(email).then(function (u) {
            if (!u) { alert('لا يوجد حساب بهذا الإيميل في المتجر.\nاطلب من الموظف إنشاء حساب عادي أولاً ثم أضفه.'); return; }
            if (auth.currentUser && u.uid === auth.currentUser.uid) { alert('هذا حساب المدير نفسه'); return; }
            return dbRef('staff/' + u.uid).set({ active: true, orders: orders, topups: topups, email: u.email, name: u.name, addedAt: Date.now() }).then(function () {
                $('stfEmail').value = '';
                balToast('✓ تمت إضافة ' + (u.name || u.email) + ' كموظف', true);
                log('staff', 'إضافة موظف: ' + (u.name || '') + ' <' + u.email + '> — الصلاحيات: ' + [orders && 'الطلبات', topups && 'شحن الرصيد'].filter(Boolean).join(' و'), u.uid);
            });
        }).catch(function (err) { alert('فشل: ' + errMsg(err)); }).then(function () { btn.disabled = false; });
    });
    window.stfSetPerm = function (uid, perm, on) {
        dbRef('staff/' + uid + '/' + perm).set(!!on).then(function () {
            log('staff', (on ? 'منح' : 'سحب') + ' صلاحية ' + (perm === 'orders' ? 'الطلبات' : 'شحن الرصيد') + ' — ' + staffLabel(uid), uid);
        }).catch(function (err) { alert('فشل: ' + errMsg(err)); });
    };
    window.stfToggle = function (uid) {
        var s = staffMap[uid] || {};
        dbRef('staff/' + uid + '/active').set(!s.active).then(function () {
            log('staff', (s.active ? 'إيقاف' : 'تفعيل') + ' الموظف ' + staffLabel(uid), uid);
        }).catch(function (err) { alert('فشل: ' + errMsg(err)); });
    };
    window.stfRemove = function (uid) {
        if (!confirm('حذف الموظف ' + staffLabel(uid) + '؟\nيبقى حسابه كعميل عادي.')) return;
        var name = staffLabel(uid);
        dbRef('staff/' + uid).remove().then(function () { log('staff', 'حذف الموظف ' + name, uid); })
            .catch(function (err) { alert('فشل: ' + errMsg(err)); });
    };

    // ═══════════════ سجل النشاط ═══════════════
    var logs = [];
    var LOG_ICON = { product: 'fa-box-open', order: 'fa-shopping-bag', topup: 'fa-wallet', balance: 'fa-coins', customer: 'fa-user', staff: 'fa-user-tie', backup: 'fa-database', store: 'fa-tools' };
    function renderLog() {
        var q = ($('logSearch').value || '').trim().toLowerCase(), type = $('logType').value, who = $('logWho').value;
        var list = logs.filter(function (l) {
            if (type && l.action !== type) return false;
            if (who && l.role !== who) return false;
            if (q && (String(l.text || '') + ' ' + String(l.by || '') + ' ' + String(l.ref || '')).toLowerCase().indexOf(q) === -1) return false;
            return true;
        });
        if (!list.length) { $('logList').innerHTML = '<div class="adm-no-data">' + (logs.length ? 'لا توجد نتائج' : 'السجل فارغ — ستظهر هنا كل العمليات من الآن') + '</div>'; return; }
        $('logList').innerHTML = '<div class="log-count">آخر ' + list.length + ' عملية' + (logs.length >= 500 ? ' (يُعرض آخر 500)' : '') + '</div>' +
            list.map(function (l) {
                return '<div class="log-row ' + esc(l.action || '') + '">' +
                    '<i class="fas ' + (LOG_ICON[l.action] || 'fa-circle') + '"></i>' +
                    '<div class="log-body"><div class="log-text">' + esc(l.text || '') + '</div>' +
                    '<div class="log-meta"><span class="' + (l.role === 'staff' ? 'who-staff' : 'who-admin') + '">' + esc(l.by || '') + '</span> · ' + esc(fmtTs(l.ts)) + '</div></div></div>';
            }).join('');
    }
    ['logSearch', 'logType', 'logWho'].forEach(function (id) { $(id).addEventListener('input', renderLog); $(id).addEventListener('change', renderLog); });

    // ═══════════════ التصدير إلى Excel (CSV) ═══════════════
    function csvCell(v) {
        if (v === null || v === undefined) return '';
        var s = String(v).replace(/\r?\n/g, ' ');
        return /[",;]/.test(s) || /^[=+\-@]/.test(s) ? '"' + (/^[=+\-@]/.test(s) ? "'" : '') + s.replace(/"/g, '""') + '"' : s;
    }
    function download(name, content, type) {
        var blob = new Blob([content], { type: type });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = name;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.parentNode && a.parentNode.removeChild(a); }, 1500);
    }
    function exportCsv(name, head, rows) {
        if (!rows.length) { alert('لا توجد بيانات للتصدير (افتح التبويب المعني مرة حتى تُحمَّل البيانات)'); return; }
        var csv = '﻿' + [head].concat(rows).map(function (r) { return r.map(csvCell).join(','); }).join('\r\n');
        download(name + '-' + new Date().toISOString().slice(0, 10) + '.csv', csv, 'text/csv;charset=utf-8');
    }
    var ST = { pending: 'جديد', processing: 'قيد التنفيذ', done: 'منجز', rejected: 'مرفوض', accepted: 'مقبول' };
    function itemsOf(o) {
        var raw = o.items || o.products || [];
        if (Array.isArray(raw)) return raw.filter(Boolean);
        return Object.keys(raw || {}).sort(function (a, b) { return (parseInt(a.replace(/\D/g, ''), 10) || 0) - (parseInt(b.replace(/\D/g, ''), 10) || 0); })
            .map(function (k) { return raw[k]; }).filter(function (x) { return x && typeof x === 'object'; });
    }
    $('expOrdersBtn').addEventListener('click', function () {
        exportCsv('zoodny-orders', ['رقم الطلب', 'التاريخ', 'الحالة', 'العميل', 'الهاتف', 'الإيميل', 'المنتجات', 'عدد البنود', 'المجموع $'],
            (ZA.orders() || []).map(function (o) {
                var it = itemsOf(o);
                return [o.orderId || o._key, o.date || fmtTs(o.ts), ST[o.status] || o.status || 'جديد', o.name, o.phone, o.email,
                    it.map(function (x) { return (x.productName || x.name || '') + (num(x.quantity) > 1 ? ' ×' + x.quantity : ''); }).join(' | '), it.length, num(o.total).toFixed(2)];
            }));
    });
    $('expItemsBtn').addEventListener('click', function () {
        var rows = [];
        (ZA.orders() || []).forEach(function (o) {
            itemsOf(o).forEach(function (x) {
                rows.push([o.orderId || o._key, o.date || fmtTs(o.ts), ST[o.status] || o.status || 'جديد', o.name, x.productName || x.name, x.category,
                    x.gameValue || x.appValue || x.creditValue || x.customQuantity || '', x.playerId || x.phoneNumber || x.socialLink || x.premiumInput || x.reqValue || '',
                    x.quantity || 1, num(x.price).toFixed(2), num(x.totalItem !== undefined ? x.totalItem : num(x.price) * (num(x.quantity) || 1)).toFixed(2)]);
            });
        });
        exportCsv('zoodny-order-items', ['رقم الطلب', 'التاريخ', 'الحالة', 'العميل', 'المنتج', 'التصنيف', 'الفئة/الكمية', 'معرّف/رابط الزبون', 'العدد', 'سعر الوحدة $', 'المجموع $'], rows);
    });
    $('expUsersBtn').addEventListener('click', function () {
        var orders = ZA.orders() || [];
        exportCsv('zoodny-customers', ['الاسم', 'الإيميل', 'الهاتف', 'الرصيد $', 'عدد الطلبات', 'المشتريات $', 'جملة', 'تاريخ التسجيل', 'UID'],
            (ZA.users() || []).map(function (u) {
                var mine = orders.filter(function (o) { return o.uid === u.uid || o.uid === u._key; });
                var spent = mine.reduce(function (s, o) { return s + (o.status === 'rejected' ? 0 : num(o.total)); }, 0);
                return [u.name, u.email, u.phone, num(u.balance).toFixed(2), mine.length, spent.toFixed(2), u.wholesale === true ? 'نعم' : '', u.createdAt, u.uid || u._key];
            }));
    });
    $('expTopupsBtn').addEventListener('click', function () {
        exportCsv('zoodny-topups', ['رقم الطلب', 'التاريخ', 'الحالة', 'العميل', 'الهاتف', 'الإيميل', 'المبلغ $', 'رقم عملية شام كاش', 'ملاحظات'],
            (ZA.topups() || []).map(function (t) {
                return [t.reqId, t.date, ST[t.status] || t.status, t.name, t.phone, t.email, num(t.amount).toFixed(2), t.txId || t.transferNumber || '', t.notes || ''];
            }));
    });

    // ═══════════════ النسخ الاحتياطي للمنتجات ═══════════════
    var BK_PATHS = ['product_overrides', 'product_deletions', 'product_costs'];
    function bkResult(msg, ok) { var el = $('bkResult'); el.className = 'tl-result ' + (ok ? 'ok' : 'err'); el.textContent = msg; }
    function makeBackup() {
        return Promise.all(BK_PATHS.map(function (p) { return dbRef(p).once('value').then(function (s) { return s.val(); }); })).then(function (vals) {
            var data = {};
            BK_PATHS.forEach(function (p, i) { data[p] = vals[i] || null; });
            return { app: 'zoodny-store', kind: 'products-backup', version: 1, createdAt: Date.now(), data: data };
        });
    }
    function countOf(data) {
        var n = 0;
        Object.keys((data && data.product_overrides) || {}).forEach(function (k) { n += Object.keys(data.product_overrides[k] || {}).length; });
        return n;
    }
    function saveBackupFile(bk, suffix) {
        var d = new Date(bk.createdAt);
        var stamp = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + '_' + String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0');
        download('zoodny-products-backup-' + stamp + (suffix || '') + '.json', JSON.stringify(bk, null, 1), 'application/json');
    }
    $('bkDownloadBtn').addEventListener('click', function () {
        var btn = this; btn.disabled = true;
        bkResult('جاري التجهيز...', true);
        makeBackup().then(function (bk) {
            saveBackupFile(bk);
            bkResult('✓ تم تنزيل النسخة الاحتياطية (' + countOf(bk.data) + ' منتج معدّل). احفظ الملف في مكان آمن.', true);
            log('backup', 'تنزيل نسخة احتياطية للمنتجات (' + countOf(bk.data) + ' منتج معدّل)');
        }).catch(function (err) { bkResult('فشل: ' + errMsg(err), false); }).then(function () { btn.disabled = false; });
    });
    $('bkRestoreFile').addEventListener('change', function () {
        var input = this, f = input.files && input.files[0];
        if (!f) return;
        var reader = new FileReader();
        reader.onload = function () {
            var bk;
            try { bk = JSON.parse(reader.result); } catch (e) { bkResult('الملف ليس نسخة احتياطية صحيحة (JSON غير صالح)', false); input.value = ''; return; }
            if (!bk || bk.app !== 'zoodny-store' || bk.kind !== 'products-backup' || !bk.data) { bkResult('هذا الملف ليس نسخة احتياطية من متجر زودني', false); input.value = ''; return; }
            var msg = 'استرجاع النسخة الاحتياطية بتاريخ ' + fmtTs(bk.createdAt) + '؟\n\n' +
                'سيتم استبدال كل المنتجات والأسعار ورأس المال الحالية بما في النسخة (' + countOf(bk.data) + ' منتج معدّل).\n' +
                'سيُنزَّل ملف بالوضع الحالي أولاً حتى تستطيع التراجع.';
            if (!confirm(msg)) { input.value = ''; return; }
            bkResult('جاري حفظ نسخة من الوضع الحالي...', true);
            makeBackup().then(function (cur) {
                saveBackupFile(cur, '-before-restore');
                var upd = {};
                BK_PATHS.forEach(function (p) { upd[p] = bk.data[p] || null; });
                return db.ref().update(upd);
            }).then(function () {
                bkResult('✓ تم الاسترجاع بنجاح — المتجر يعرض الآن نسخة ' + fmtTs(bk.createdAt), true);
                log('backup', 'استرجاع نسخة احتياطية بتاريخ ' + fmtTs(bk.createdAt) + ' (' + countOf(bk.data) + ' منتج معدّل)');
            }).catch(function (err) { bkResult('فشل الاسترجاع: ' + errMsg(err), false); })
              .then(function () { input.value = ''; });
        };
        reader.readAsText(f);
    });

    // ═══════════════ وضع الصيانة (config/maintenance) ═══════════════
    var maint = null, mtRef = null;
    var D = window.ZOODNY_MAINT_DEFAULTS || { title: 'المتجر في صيانة مؤقتة', message: '', eta: '' };
    function mtFill(force) {
        var m = maint || {};
        if (force || !$('mtTitle').value) $('mtTitle').value = m.title || D.title;
        if (force || !$('mtMsg').value) $('mtMsg').value = m.message || D.message;
        if (force) $('mtEta').value = m.eta || '';
    }
    function mtRender() {
        var on = !!(maint && maint.on);
        $('admMaintDot').classList.toggle('on', on);
        $('admMaintBtn').classList.toggle('on', on);
        $('mtStatus').className = 'mt-status ' + (on ? 'on' : 'off');
        $('mtStatus').innerHTML = on
            ? '<i class="fas fa-circle"></i> الصيانة <b>مفعّلة</b> — الزبائن يرون صفحة الصيانة' + (maint.ts ? '<small>منذ ' + esc(fmtTs(maint.ts)) + '</small>' : '')
            : '<i class="fas fa-circle"></i> المتجر <b>يعمل</b> بشكل طبيعي للزبائن';
        $('mtToggleBtn').innerHTML = on ? '<i class="fas fa-power-off"></i> إيقاف الصيانة وفتح المتجر' : '<i class="fas fa-tools"></i> تفعيل الصيانة الآن';
        $('mtToggleBtn').classList.toggle('off', on);
    }
    function mtData() {
        return { title: $('mtTitle').value.trim() || D.title, message: $('mtMsg').value.trim() || D.message, eta: $('mtEta').value.trim() };
    }
    window.zoodnySetMaintenance = function (on, data) {
        if (!ZA.isAdmin()) return Promise.resolve();
        var d = data || (maint ? { title: maint.title, message: maint.message, eta: maint.eta || '' } : { title: D.title, message: D.message, eta: '' });
        var val = Object.assign({}, d, { on: !!on, ts: Date.now() });
        return dbRef('config/maintenance').set(val).then(function () {
            balToast(on ? '✓ تم تفعيل وضع الصيانة' : '✓ تم إيقاف الصيانة — المتجر مفتوح للزبائن', true);
            log('store', (on ? 'تفعيل وضع الصيانة' + (d.eta ? ' (العودة: ' + d.eta + ')' : '') : 'إيقاف وضع الصيانة وفتح المتجر'));
        }).catch(function (err) { alert('فشل: ' + errMsg(err)); });
    };
    function mtWatch() {
        if (mtRef) return;
        mtRef = dbRef('config/maintenance');
        mtRef.on('value', function (snap) { maint = snap.val(); mtRender(); });
    }
    auth.onAuthStateChanged(function () { if (ZA.isAdmin()) mtWatch(); });
    $('admMaintBtn').addEventListener('click', function () {
        mtWatch(); mtFill(true); mtRender();
        $('admMaintOv').classList.add('on');
    });
    $('admMaintClose').onclick = function () { $('admMaintOv').classList.remove('on'); };
    $('admMaintOv').addEventListener('click', function (e) { if (e.target === this) this.classList.remove('on'); });
    document.querySelectorAll('[data-eta]').forEach(function (b) { b.addEventListener('click', function () { $('mtEta').value = b.dataset.eta; }); });
    $('mtResetBtn').onclick = function () { $('mtTitle').value = D.title; $('mtMsg').value = D.message; $('mtEta').value = ''; };
    $('mtToggleBtn').onclick = function () {
        var on = !(maint && maint.on);
        if (on && !confirm('تفعيل وضع الصيانة؟\n\nسيرى كل الزبائن صفحة الصيانة بدل المتجر حتى توقفه.')) return;
        window.zoodnySetMaintenance(on, mtData());
    };
    $('mtSaveTextBtn').onclick = function () {
        var on = !!(maint && maint.on);
        dbRef('config/maintenance').set(Object.assign(mtData(), { on: on, ts: (maint && maint.ts) || Date.now() }))
            .then(function () { balToast('✓ تم حفظ نص الصيانة', true); })
            .catch(function (err) { alert('فشل: ' + errMsg(err)); });
    };
    $('mtPreviewBtn').onclick = function () {
        $('admMaintOv').classList.remove('on');
        var dash = $('adminDashboard'), ov = $('adminPanelOv');
        if (dash) dash.classList.remove('on');
        if (ov) { ov.classList.remove('on'); ov.style.display = ''; }
        if (typeof window.zoodnyPreviewMaintenance === 'function') window.zoodnyPreviewMaintenance(mtData());
    };

    // ═══════════════ زر "لوحة الموظف" في حساب الموظف ═══════════════
    function syncStaffButton() {
        var grid = document.querySelector('.acc-actions-grid');
        if (!grid) return;
        var btn = $('accStaffBtn');
        if (ZA.isStaff()) {
            if (btn) return;
            btn = document.createElement('button');
            btn.className = 'acc-action-btn';
            btn.id = 'accStaffBtn';
            btn.innerHTML = '<i class="fas fa-user-tie" style="color:#8e44ad"></i> لوحة الموظف';
            btn.addEventListener('click', function () {
                if (typeof window.ZoodnyAccount.modalOff === 'function') window.ZoodnyAccount.modalOff('accountModalOv', 'accountModal');
                window.openAdminPanel();
            });
            grid.insertBefore(btn, grid.firstChild);
        } else if (btn) btn.parentNode.removeChild(btn);
    }
    document.addEventListener('zoodny:role', syncStaffButton);
    syncStaffButton();
}());
