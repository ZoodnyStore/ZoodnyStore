/* ══════════════════════════════════════════════════════════════════════
 * لوحة الإدارة
 * تسجيل دخول الأدمن عبر Firebase Auth، طلبات الشحن والمتجر، العملاء، إشعارات المتصفح.
 * ══════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';
    const { $, ovOn, ovOff, balToast, esc, escJs, ADMIN_EMAIL } = window.ZoodnyAccount;

    let adminFilter   = 'all';
    let adminOrderFilter = 'all';
    let adminOrders   = [];
    let adminTopups   = [];
    let adminUsers    = [];
    let adminListenerOn = false;

    // ── ADMIN PANEL ───────────────────────────────────────────────────────
    $('adminHint').addEventListener('click', openAdminLogin);
    if (window.location.hash === '#admin') openAdminLogin();

    $('adminEyeBtn').addEventListener('click', function() {
        var inp = $('adminPassInput');
        var show = inp.type === 'password';
        inp.type = show ? 'text' : 'password';
        this.innerHTML = show ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    });
    $('adminLoginBtn').addEventListener('click', tryAdminLogin);
    $('adminPassInput').addEventListener('keydown', function(e) { if(e.key==='Enter') tryAdminLogin(); });
    $('adminDashClose').addEventListener('click', closeAdmin);
    $('adminPanelOv').addEventListener('click', closeAdmin);

    // Tab switching
    function switchAdmTab(panel) {
        var tab = document.querySelector('.adm-tab[data-panel="' + panel + '"]');
        if (!tab || !$('panel-' + panel)) return;
        document.querySelectorAll('.adm-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.adm-tab-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        $('panel-' + panel).classList.add('active');
    }
    document.querySelectorAll('.adm-tab').forEach(function(tab) {
        tab.addEventListener('click', function() { switchAdmTab(tab.dataset.panel); });
    });

    function isAdminSignedIn() {
        var u = auth.currentUser;
        return !!u && String(u.email || '').toLowerCase() === String(ADMIN_EMAIL).toLowerCase();
    }
    // فتح لوحة المدير على تبويب محدد (يُستخدم عند الضغط على إشعار للمدير)
    window.openAdminPanel = function(panel) {
        if (!isAdminSignedIn()) { openAdminLogin(); return; }
        ovOn('adminPanelOv');
        $('adminLoginModal').classList.remove('on');
        $('adminDashboard').classList.add('on');
        startAdminListeners();
        if (panel) switchAdmTab(panel);
    };

    // Topup filters
    document.querySelectorAll('[data-f]').forEach(function(b) {
        b.addEventListener('click', function() {
            document.querySelectorAll('[data-f]').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            adminFilter = b.dataset.f;
            renderTopupsTable();
        });
    });
    // Orders filters
    document.querySelectorAll('[data-fo]').forEach(function(b) {
        b.addEventListener('click', function() {
            document.querySelectorAll('[data-fo]').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            adminOrderFilter = b.dataset.fo;
            renderOrdersTable();
        });
    });

    $('clearTopupsBtn').addEventListener('click', function() {
        if (confirm('مسح جميع طلبات الشحن؟')) {
            dbRef('topup_orders').remove().then(function() {
                adminTopups = [];
                renderTopupsTable();
                renderTopupStats();
            });
        }
    });

    function openAdminLogin() {
        ovOn('adminPanelOv');
        $('adminLoginModal').classList.add('on');
        $('adminPassInput').value = '';
        $('adminLoginErr').textContent = '';
        setTimeout(() => $('adminPassInput').focus(), 300);
    }
    function closeAdmin() {
        ovOff('adminPanelOv');
        $('adminLoginModal').classList.remove('on');
        $('adminDashboard').classList.remove('on');
    }
    function tryAdminLogin() {
        var pass = $('adminPassInput').value;
        if (!pass) {
            $('adminLoginErr').textContent = '✕ أدخل كلمة السر';
            return;
        }
        // تسجيل دخول حقيقي في Firebase Auth بحساب الأدمن حتى تسمح قواعد
        // قاعدة البيانات (Rules) بقراءة كل المستخدمين من مسار /users.
        // بدون هذا، الطلب يُرفض بصلاحيات (permission_denied) بصمت.
        $('adminLoginErr').textContent = 'جاري تسجيل الدخول...';
        auth.signInWithEmailAndPassword(ADMIN_EMAIL, pass)
            .then(function() {
                $('adminLoginModal').classList.remove('on');
                $('adminDashboard').classList.add('on');
                startAdminListeners();
                // إشعارات المدير (طلب جديد / شحن / مستخدم جديد) تُدار في notifications.js
                if (window.ZoodnyNotify && typeof Notification !== 'undefined' && Notification.permission === 'default') {
                    window.ZoodnyNotify.requestPermission();
                }
            })
            .catch(function(err) {
                var wrongPass = err && /wrong-password|invalid-credential|invalid-login-credentials|user-not-found/.test(err.code || '');
                $('adminLoginErr').textContent = wrongPass ? '✕ كلمة السر غير صحيحة' : '✕ فشل تسجيل الدخول: ' + (err && err.message ? err.message : err);
                $('adminPassInput').value = '';
            });
    }

    function startAdminListeners() {
        if (adminListenerOn) {
            renderTopupsTable(); renderTopupStats();
            renderOrdersTable(); renderUsersTable();
            return;
        }
        adminListenerOn = true;
        startBroadcastListener();
        loadPushConfig();

        // Topup orders
        dbRef('topup_orders').on('value', function(snap) {
            adminTopups = [];
            snap.forEach(function(c) { var v = c.val(); if (v) adminTopups.push(v); });
            renderTopupsTable();
            renderTopupStats();
            refreshUserModal();
        });
        // Users (كامل البيانات: الحساب + سجل العمليات + الطلبات)
        dbRef('users').on('value', function(snap) {
            adminUsers = [];
            var adminUid = auth.currentUser ? auth.currentUser.uid : null;
            snap.forEach(function(c) {
                var u = c.val();
                if (c.key === adminUid) return;   // حساب المدير نفسه ليس عميلاً
                if (u && typeof u === 'object') adminUsers.push(Object.assign({}, u, { uid: u.uid || c.key, _key: c.key }));
            });
            renderUsersTable();
            renderOrdersTable();
            refreshUserModal();
        }, function(err) {
            // أي خطأ صلاحيات (permission_denied) من قواعد Firebase يظهر هنا بدلاً من الفشل الصامت
            console.error('خطأ في قراءة users من Firebase:', err);
            var tbody = document.getElementById('usersBody');
            if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="adm-no-data" style="color:#e74c3c">خطأ صلاحيات: ' + esc(err && err.message ? err.message : err) + '</td></tr>';
        });
        // Store orders
        dbRef('store_orders').on('value', function(snap) {
            adminOrders = [];
            snap.forEach(function(c) {
                var v = c.val();
                if (v && typeof v === 'object') adminOrders.push(Object.assign({}, v, { _key: c.key }));
            });
            adminOrders.sort(function(a, b) {
                return (num(b.ts) - num(a.ts)) || String(b._key).localeCompare(String(a._key));
            });
            renderOrdersTable();
            renderUsersTable();
            refreshUserModal();
        });
    }

    function renderTopupStats() {
        var p = adminTopups.filter(o => o.status==='pending').length;
        var a = adminTopups.filter(o => o.status==='accepted').length;
        var s = adminTopups.filter(o => o.status==='accepted').reduce((acc,o) => acc+parseFloat(o.amount||0), 0);
        $('stTotal').textContent    = adminTopups.length;
        $('stPending').textContent  = p;
        $('stAccepted').textContent = a;
        $('stAmount').textContent   = s.toFixed(2) + '$';
    }

    function renderTopupsTable() {
        var adminTopupFilter = adminFilter;
        var filtered = adminTopupFilter==='all' ? adminTopups : adminTopups.filter(function(t){ return t.status===adminTopupFilter; });
        var wrap = $('topupsCardsWrap');
        if (!wrap) return;

        // إحصائيات
        $('stTotal').textContent    = adminTopups.length;
        $('stPending').textContent  = adminTopups.filter(function(t){ return t.status==='pending'; }).length;
        $('stAccepted').textContent = adminTopups.filter(function(t){ return t.status==='accepted'; }).length;
        var tot = adminTopups.filter(function(t){ return t.status==='accepted'; }).reduce(function(s,t){ return s+parseFloat(t.amount||0); },0);
        $('stAmount').textContent   = tot.toFixed(2) + '$';

        if (!filtered.length) {
            wrap.innerHTML = '<div style="text-align:center;padding:2.5rem;color:#aaa"><i class="fas fa-wallet" style="font-size:2.5rem;display:block;margin-bottom:.7rem"></i>لا توجد طلبات شحن</div>';
            return;
        }

        var stLabel = { pending:'⏳ انتظار', accepted:'✓ مقبول', rejected:'✕ مرفوض' };

        wrap.innerHTML = filtered.slice().reverse().map(function(t) {
            var st  = esc(t.status || 'pending');
            var amt = parseFloat(t.amount||0).toFixed(2);

            var btns = '';
            if (st === 'pending') {
                btns += '<button class="adm-act-btn accept" onclick="admAcceptTopup(\''+escJs(t.reqId)+'\',\''+escJs(t.uid)+'\','+parseFloat(t.amount||0)+')"><i class="fas fa-check"></i> قبول وشحن</button>';
                btns += '<button class="adm-act-btn reject" onclick="admRejectTopup(\''+escJs(t.reqId)+'\',\''+escJs(t.uid)+'\')"><i class="fas fa-times"></i> رفض</button>';
            }
            btns += '<button class="adm-act-btn del" onclick="admDelTopup(\''+escJs(t.reqId)+'\')"><i class="fas fa-trash"></i></button>';

            return '<div class="adm-card ' + st + '">'
                + '<div class="adm-card-head">'
                + '  <span class="adm-card-id"><i class="fas fa-hashtag"></i> ' + esc(t.reqId||'-') + '</span>'
                + '  <span class="st-badge ' + st + '">' + (stLabel[st]||st) + '</span>'
                + '  <span class="adm-card-date"><i class="far fa-clock"></i> ' + esc(t.date||'-') + '</span>'
                + '</div>'
                + '<div class="adm-card-body">'
                + '  <div class="adm-client-row">'
                + '    <div class="adm-client-item"><i class="fas fa-user"></i><strong>' + esc(t.name||'-') + '</strong></div>'
                + '    <div class="adm-client-item"><i class="fas fa-phone-alt"></i><strong>' + esc(t.phone||'-') + '</strong></div>'
                + '    <div class="adm-client-item"><i class="fas fa-envelope"></i><strong>' + esc(t.email||'-') + '</strong></div>'
                + '  </div>'
                + '  <div class="adm-topup-info">'
                + '    <div class="adm-ti-box adm-ti-amount"><div class="adm-ti-lbl">المبلغ المطلوب شحنه</div><div class="adm-ti-val">' + amt + ' $</div></div>'
                + '    <div class="adm-ti-box"><div class="adm-ti-lbl">رقم عملية شام كاش</div><div class="adm-ti-val">' + esc(t.txId||t.transferNumber||t.shamCashNumber||'-') + '</div></div>'
                + '  </div>'
                + '</div>'
                + '<div class="adm-card-foot">'
                + '  <div class="adm-total-lbl"><i class="fas fa-dollar-sign"></i> ' + amt + '$</div>'
                + '  <div class="adm-card-btns">' + btns + '</div>'
                + '</div>'
                + '</div>';
        }).join('');
    }
    
    // ── أدوات مساعدة ─────────────────────────────────────────────────────
    function num(v) { var n = parseFloat(v); return isFinite(n) ? n : 0; }
    function money(v) { return num(v).toFixed(2) + '$'; }

    function findUser(uid) {
        if (!uid) return null;
        for (var i = 0; i < adminUsers.length; i++) {
            if (adminUsers[i].uid === uid || adminUsers[i]._key === uid) return adminUsers[i];
        }
        return null;
    }

    // عناصر الطلب قد تُخزَّن كمصفوفة (cart.js) أو ككائن item_1, item_2... (main.js)
    function orderItems(o) {
        var raw = o.items || o.products || [];
        if (Array.isArray(raw)) return raw.filter(Boolean);
        if (raw && typeof raw === 'object') {
            return Object.keys(raw).sort(function(a, b) {
                return (parseInt(a.replace(/\D/g, ''), 10) || 0) - (parseInt(b.replace(/\D/g, ''), 10) || 0);
            }).map(function(k) { return raw[k]; }).filter(function(it) { return it && typeof it === 'object'; });
        }
        return [];
    }

    // بيانات الزبون في الطلب، ومع الطلبات القديمة التي حُفظت بدون اسم/إيميل نكملها من حسابه
    function orderClient(o) {
        var u = findUser(o.uid) || {};
        return {
            user:  findUser(o.uid),
            name:  o.name  || u.name  || '',
            email: o.email || u.email || '',
            phone: o.phone || u.phone || ''
        };
    }

    function orderSpent(o) { return o.status === 'rejected' ? 0 : num(o.total); }

    function copyBtn(val) {
        return '<button type="button" class="adm-copy-btn" data-copy="' + esc(val) + '" title="نسخ"><i class="far fa-copy"></i> نسخ</button>';
    }
    function copyVal(val) {
        if (val === null || val === undefined || val === '') return '<span>-</span>';
        return '<span class="adm-copy-val"><b>' + esc(val) + '</b>' + copyBtn(val) + '</span>';
    }
    function keyField(icon, label, val) {
        return '<div class="adm-key-field"><span class="lbl"><i class="fas ' + icon + '"></i> ' + label + ':</span>'
            + '<b>' + esc(val) + '</b>' + copyBtn(val) + '</div>';
    }

    function copyText(text, btn) {
        function fallback() {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0';
            document.body.appendChild(ta);
            ta.select();
            try { ta.setSelectionRange(0, text.length); } catch (e) {}
            var ok = false;
            try { ok = document.execCommand('copy'); } catch (e) {}
            document.body.removeChild(ta);
            return ok;
        }
        function done(ok) {
            if (!ok) { window.prompt('انسخ النص يدوياً:', text); return; }
            if (!btn) return;
            if (!btn.dataset.html) btn.dataset.html = btn.innerHTML;
            btn.classList.add('ok');
            btn.innerHTML = '<i class="fas fa-check"></i> تم النسخ';
            clearTimeout(btn._t);
            btn._t = setTimeout(function() { btn.classList.remove('ok'); btn.innerHTML = btn.dataset.html; }, 1400);
        }
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(function() { done(true); }, function() { done(fallback()); });
        } else {
            done(fallback());
        }
    }
    document.addEventListener('click', function(e) {
        var b = e.target.closest && e.target.closest('.adm-copy-btn');
        if (!b) return;
        e.preventDefault();
        e.stopPropagation();
        copyText(b.getAttribute('data-copy') || '', b);
    });

    var stLabel = { pending:'🆕 جديد', processing:'⚙️ قيد التنفيذ', done:'✓ منجز', rejected:'✕ مرفوض' };

    // ── عرض منتج واحد داخل الطلب ──
    function renderOrderItem(it) {
        var name = it.productName || it.name || '-';
        var qty  = parseInt(it.quantity, 10) || 1;
        var unit = num(it.price);
        var line = (it.totalItem !== undefined && it.totalItem !== null && it.totalItem !== '') ? num(it.totalItem) : unit * qty;

        // الحقول التي يدخلها الزبون — تُعرض بارزة مع زر نسخ لتفادي الأخطاء
        var keys = [];
        if (it.playerId)     keys.push(keyField('fa-gamepad', 'رقم اللاعب / المعرّف', it.playerId));
        if (it.phoneNumber)  keys.push(keyField('fa-phone', 'رقم الهاتف', it.phoneNumber));
        var link = it.socialLink || it.accountUrl;
        if (link)            keys.push(keyField('fa-link', 'رابط الحساب', link));
        if (it.premiumInput) keys.push(keyField('fa-key', 'البريد / بيانات الاشتراك', it.premiumInput));

        var info = [];
        if (it.gameValue)      info.push('<span><i class="fas fa-coins"></i> الفئة: <b>' + esc(it.gameValue) + '</b></span>');
        if (it.appValue)       info.push('<span><i class="fas fa-mobile-alt"></i> الباقة: <b>' + esc(it.appValue) + '</b></span>');
        if (it.creditValue)    info.push('<span><i class="fas fa-money-bill"></i> الرصيد: <b>' + esc(it.creditValue) + ' ل.س</b></span>');
        if (it.customQuantity) info.push('<span><i class="fas fa-sort-amount-up"></i> الكمية المطلوبة: <b>' + (parseInt(it.customQuantity, 10) || 0).toLocaleString('en-US') + '</b></span>');
        if (it.category)       info.push('<span><i class="fas fa-folder"></i> ' + esc(it.category) + '</span>');
        info.push('<span>العدد: <b>' + qty + '</b>' + (qty > 1 ? ' × ' + unit.toFixed(2) + '$' : '') + '</span>');

        return '<div class="adm-prod-item">'
            + '<div style="flex:1;min-width:0">'
            + '<div class="adm-prod-name"><i class="fas fa-tag" style="color:var(--secondary);font-size:.72rem;margin-left:4px"></i>' + esc(name) + '</div>'
            + keys.join('')
            + '<div class="adm-prod-extra">' + info.join(' &nbsp;|&nbsp; ') + '</div>'
            + '</div>'
            + '<div class="adm-prod-price">' + line.toFixed(2) + '$</div>'
            + '</div>';
    }

    function orderMatches(o, q) {
        if (!q) return true;
        var c = orderClient(o);
        var parts = [o._key, o.orderId, o.uid, c.name, c.email, c.phone, o.accountUrl, o.city];
        orderItems(o).forEach(function(it) {
            parts.push(it.productName, it.name, it.playerId, it.phoneNumber, it.socialLink, it.accountUrl, it.premiumInput, it.gameValue, it.appValue);
        });
        return parts.join(' ').toLowerCase().indexOf(q) !== -1;
    }

    function renderOrderStats() {
        if (!$('soTotal')) return;
        var open = 0, done = 0, rev = 0;
        adminOrders.forEach(function(o) {
            if (o.status === 'done') { done++; rev += num(o.total); }
            else if (o.status !== 'rejected') open++;
        });
        $('soTotal').textContent   = adminOrders.length;
        $('soOpen').textContent    = open;
        $('soDone').textContent    = done;
        $('soRevenue').textContent = rev.toFixed(2) + '$';
    }

    function renderOrdersTable() {
        var wrap = $('ordersAdmCards');
        if (!wrap) return;
        renderOrderStats();
        var q = (($('admOrderSearch') || {}).value || '').trim().toLowerCase();
        var filtered = adminOrders.filter(function(o) {
            var st = o.status || 'pending';
            return (adminOrderFilter === 'all' || st === adminOrderFilter) && orderMatches(o, q);
        });

        if (!filtered.length) {
            wrap.innerHTML = '<div style="text-align:center;padding:2.5rem;color:#aaa"><i class="fas fa-box-open" style="font-size:2.5rem;display:block;margin-bottom:.7rem"></i>' + (q ? 'لا توجد نتائج للبحث' : 'لا توجد طلبات') + '</div>';
            return;
        }

        wrap.innerHTML = filtered.map(function(o) {
            var st  = esc(o.status || 'pending');
            var key = escJs(o._key);
            var c   = orderClient(o);
            var items = orderItems(o);

            var prodsHtml = items.map(renderOrderItem).join('');
            // رابط الحساب على مستوى الطلب (إن لم يكن ظاهراً داخل أحد المنتجات)
            var itemHasLink = items.some(function(it) { return it.socialLink || it.accountUrl; });
            var orderExtra = '';
            if (o.accountUrl && !itemHasLink) orderExtra += keyField('fa-link', 'رابط الحساب', o.accountUrl);
            if (o.city && o.city !== 'غير محدد') orderExtra += '<div class="adm-prod-extra"><i class="fas fa-map-marker-alt"></i> المدينة: <b>' + esc(o.city) + '</b></div>';

            var nameHtml = c.user
                ? '<button type="button" class="adm-user-link" onclick="admOpenUser(\'' + escJs(c.user._key) + '\')">' + esc(c.name || 'غير محدد') + '</button>'
                  + (c.user.wholesale === true ? ' <span class="ws-badge"><i class="fas fa-store"></i> جملة</span>' : '')
                : '<strong>' + esc(c.name || (o.uid === 'guest' ? 'زائر' : 'غير محدد')) + '</strong>';

            var btns = '';
            if (st === 'pending')    btns += '<button class="adm-act-btn accept" onclick="admUpdateOrderStatus(\'' + key + '\',\'processing\')"><i class="fas fa-cog"></i> بدء التنفيذ</button>';
            if (st === 'processing') btns += '<button class="adm-act-btn view"   onclick="admUpdateOrderStatus(\'' + key + '\',\'done\')"><i class="fas fa-check"></i> تم</button>';
            if (st !== 'done' && st !== 'rejected') btns += '<button class="adm-act-btn reject" onclick="admUpdateOrderStatus(\'' + key + '\',\'rejected\')"><i class="fas fa-times"></i> رفض وإرجاع المبلغ</button>';
            btns += '<button class="adm-act-btn del" title="حذف نهائي" onclick="admDeleteOrder(\'' + key + '\')"><i class="fas fa-trash"></i> حذف</button>';

            return '<div class="adm-card ' + st + '">'
                + '<div class="adm-card-head">'
                + '  <span class="adm-card-id"><i class="fas fa-hashtag"></i> ' + esc(o.orderId || o._key) + '</span>'
                + '  <span class="st-badge ' + st + '">' + (stLabel[st] || st) + '</span>'
                + '  <span class="adm-card-date"><i class="far fa-clock"></i> ' + esc(o.date || '-') + '</span>'
                + '</div>'
                + '<div class="adm-card-body">'
                + '  <div class="adm-client-row">'
                + '    <div class="adm-client-item"><i class="fas fa-user"></i>' + nameHtml + '</div>'
                + '    <div class="adm-client-item"><i class="fas fa-envelope"></i>' + copyVal(c.email) + '</div>'
                + '    <div class="adm-client-item"><i class="fas fa-phone-alt"></i>' + copyVal(c.phone) + '</div>'
                + '  </div>'
                + '  <div class="adm-products-wrap">'
                + '    <div class="adm-products-title"><i class="fas fa-shopping-cart"></i> المنتجات المطلوبة (' + items.length + ')</div>'
                + (prodsHtml || '<div style="color:#aaa;font-size:.83rem;padding:.4rem">لا توجد تفاصيل</div>')
                + orderExtra
                + '  </div>'
                + '</div>'
                + '<div class="adm-card-foot">'
                + '  <div class="adm-total-lbl"><i class="fas fa-dollar-sign"></i> المجموع: ' + money(o.total) + '</div>'
                + '  <div class="adm-card-btns">' + btns + '</div>'
                + '</div>'
                + '</div>';
        }).join('');
    }

    // ── العملاء ──────────────────────────────────────────────────────────
    function userStats(u) {
        var orders = adminOrders.filter(function(o) { return o.uid && (o.uid === u.uid || o.uid === u._key); });
        var spent = orders.reduce(function(s, o) { return s + orderSpent(o); }, 0);
        return { orders: orders, spent: spent };
    }

    function userMatches(u, q) {
        if (!q) return true;
        return [u.name, u.email, u.phone, u.uid, u._key].join(' ').toLowerCase().indexOf(q) !== -1;
    }

    function renderUsersTable() {
        var tbody = document.getElementById('usersBody');
        if (!tbody) return;

        var totalBal = 0, buyers = 0, totalSpent = 0;
        var stats = {};
        adminUsers.forEach(function(u) {
            var s = userStats(u);
            stats[u._key] = s;
            totalBal += num(u.balance);
            totalSpent += s.spent;
            if (s.orders.length) buyers++;
        });
        if ($('suCount')) {
            $('suCount').textContent   = adminUsers.length;
            $('suBalance').textContent = totalBal.toFixed(2) + '$';
            $('suBuyers').textContent  = buyers;
            $('suSpent').textContent   = totalSpent.toFixed(2) + '$';
        }

        if (!adminUsers.length) { tbody.innerHTML = '<tr><td colspan="8" class="adm-no-data">لا يوجد مستخدمون</td></tr>'; return; }

        var q = (($('admUserSearch') || {}).value || '').trim().toLowerCase();
        var list = adminUsers.filter(function(u) { return userMatches(u, q); });
        if (!list.length) { tbody.innerHTML = '<tr><td colspan="8" class="adm-no-data">لا توجد نتائج للبحث</td></tr>'; return; }

        tbody.innerHTML = list.map(function(u) {
            var key = u._key;
            var s = stats[key];
            return '<tr>'
                + '<td><button type="button" class="adm-user-link" onclick="admOpenUser(\'' + escJs(key) + '\')">' + esc(u.name || '-') + '</button>'
                + (u.wholesale === true ? ' <span class="ws-badge"><i class="fas fa-store"></i> جملة</span>' : '') + '</td>'
                + '<td>' + copyVal(u.email) + '</td>'
                + '<td>' + copyVal(u.phone) + '</td>'
                + '<td><strong style="color:var(--success)">' + money(u.balance) + '</strong>'
                + '<div class="adm-topup-inline">'
                + '<input type="number" id="topupAmt_' + esc(key) + '" placeholder="$ مبلغ" min="0.01" step="0.01" style="width:80px"/>'
                + '<button class="adm-act-btn topup" onclick="admAddBalance(\'' + escJs(key) + '\')">إضافة</button>'
                + '</div></td>'
                + '<td>' + s.orders.length + '</td>'
                + '<td>' + s.spent.toFixed(2) + '$</td>'
                + '<td><small>' + esc(u.createdAt || '-') + '</small></td>'
                + '<td style="white-space:nowrap">'
                + '<button class="adm-act-btn view" onclick="admOpenUser(\'' + escJs(key) + '\')"><i class="fas fa-id-card"></i> التفاصيل</button>'
                + wholesaleBtn(u)
                + '<button class="adm-act-btn del" title="حذف العميل" onclick="admDelUser(\'' + escJs(key) + '\')"><i class="fas fa-trash"></i></button>'
                + '</td>'
                + '</tr>';
        }).join('');
    }

    // ── نافذة تفاصيل العميل ──
    var openUserKey = null;
    var userFieldLabels = {
        name: 'الاسم', email: 'البريد الإلكتروني', phone: 'الهاتف', uid: 'المعرّف (UID)',
        balance: 'الرصيد الحالي', createdAt: 'تاريخ التسجيل', ordersCount: 'عدّاد الطلبات'
    };
    var copyableFields = { email: 1, phone: 1, uid: 1 };

    function txTime(t) { return num(t && t.ts) || (parseInt(String((t && t._k) || '').replace(/\D/g, '').slice(0, 13), 10) || 0); }

    function renderUserModal() {
        var u = findUser(openUserKey);
        var body = $('admUserBody');
        if (!body) return;
        if (!u) {
            body.innerHTML = '<div class="adm-sec" style="text-align:center;color:#999">هذا العميل لم يعد موجوداً</div>';
            return;
        }
        $('admUserTitle').textContent = 'تفاصيل العميل: ' + (u.name || u.email || u._key);

        // 1) كل بيانات الحساب (بما فيها أي حقل إضافي محفوظ)
        var order = ['name', 'email', 'phone', 'uid', 'balance', 'createdAt'];
        var keys = order.slice();
        Object.keys(u).forEach(function(k) {
            // ordersCount عدّاد داخلي قد لا يطابق الواقع — العدد الحقيقي يظهر في "ملخص"
            if (k.charAt(0) === '_' || k === 'ordersCount' || keys.indexOf(k) !== -1) return;
            if (u[k] !== null && typeof u[k] === 'object') return; // orders / transactions تُعرض بالأسفل
            keys.push(k);
        });
        var kv = keys.map(function(k) {
            var v = (k === 'uid') ? (u.uid || u._key) : u[k];
            if (v === undefined || v === null || v === '') v = (k === 'balance' ? 0 : '');
            var shown = (k === 'balance') ? money(v) : (copyableFields[k] && v !== '' ? copyVal(v) : esc(v === '' ? '-' : v));
            if (k === 'balance') shown = '<span style="color:var(--success)">' + shown + '</span>';
            return '<div class="adm-kv-item"><div class="k">' + esc(userFieldLabels[k] || k) + '</div><div class="v">' + shown + '</div></div>';
        }).join('');

        // 2) ملخص مالي
        var s = userStats(u);
        var topups = adminTopups.filter(function(t) { return t.uid === u.uid || t.uid === u._key; });
        var topAccepted = topups.filter(function(t) { return t.status === 'accepted'; }).reduce(function(a, t) { return a + num(t.amount); }, 0);
        var topPending  = topups.filter(function(t) { return t.status === 'pending'; }).length;
        var txs = [];
        if (u.transactions && typeof u.transactions === 'object') {
            Object.keys(u.transactions).forEach(function(k) {
                var t = u.transactions[k];
                if (t && typeof t === 'object') txs.push(Object.assign({ _k: k }, t));
            });
        }
        txs.sort(function(a, b) { return txTime(b) - txTime(a); });
        var refunds = txs.filter(function(t) { return t.txCategory === 'refund'; }).reduce(function(a, t) { return a + num(t.amount); }, 0);

        var summary = [
            ['عدد الطلبات', s.orders.length],
            ['مجموع المشتريات', money(s.spent)],
            ['شحن رصيد مقبول', money(topAccepted)],
            ['طلبات شحن معلّقة', topPending],
            ['مبالغ مُسترجعة', money(refunds)],
            ['عدد العمليات', txs.length]
        ].map(function(p) {
            return '<div class="adm-kv-item"><div class="k">' + p[0] + '</div><div class="v">' + p[1] + '</div></div>';
        }).join('');

        // 3) الطلبات
        var ordersHtml = s.orders.length ? s.orders.map(function(o) {
            var st = esc(o.status || 'pending');
            var items = orderItems(o);
            var names = items.map(function(it) { return esc(it.productName || it.name || '-') + (num(it.quantity) > 1 ? ' ×' + parseInt(it.quantity, 10) : ''); }).join('، ');
            var ids = items.filter(function(it) { return it.playerId; }).map(function(it) { return keyField('fa-gamepad', 'رقم اللاعب', it.playerId); }).join('');
            return '<div class="adm-mini-row">'
                + '<div class="t"><div><b>' + (names || 'طلب') + '</b> <span class="st-badge ' + st + '">' + (stLabel[st] || st) + '</span></div>'
                + '<div class="d">' + esc(o.orderId || o._key) + ' — ' + esc(o.date || '-') + '</div>' + ids + '</div>'
                + '<span class="adm-amt-minus">' + money(o.total) + '</span>'
                + '<button class="adm-act-btn del" title="حذف الطلب" onclick="admDeleteOrder(\'' + escJs(o._key) + '\')"><i class="fas fa-trash"></i></button>'
                + '</div>';
        }).join('') : '<div style="color:#aaa;font-size:.82rem">لا توجد طلبات</div>';

        // 4) سجل العمليات
        var txHtml = txs.length ? txs.map(function(t) {
            var credit = t.type === 'credit';
            var stTxt = t.status === 'pending' ? ' <span class="st-badge pending">معلّق</span>' : '';
            return '<div class="adm-mini-row">'
                + '<div class="t"><div>' + esc(t.desc || t._k) + stTxt + '</div><div class="d">' + esc(t.date || '-') + '</div></div>'
                + '<span class="' + (credit ? 'adm-amt-plus' : 'adm-amt-minus') + '">' + (credit ? '+' : '-') + money(t.amount) + '</span>'
                + '</div>';
        }).join('') : '<div style="color:#aaa;font-size:.82rem">لا توجد عمليات</div>';

        // 5) طلبات الشحن
        var tuLabel = { pending:'⏳ انتظار', accepted:'✓ مقبول', rejected:'✕ مرفوض' };
        var topHtml = topups.length ? topups.slice().reverse().map(function(t) {
            var st = esc(t.status || 'pending');
            return '<div class="adm-mini-row">'
                + '<div class="t"><div>رقم العملية: ' + copyVal(t.txId || t.transferNumber || '') + ' <span class="st-badge ' + (st === 'accepted' ? 'done' : st) + '">' + (tuLabel[st] || st) + '</span></div>'
                + '<div class="d">' + esc(t.reqId || '') + ' — ' + esc(t.date || '-') + '</div></div>'
                + '<span class="adm-amt-plus">' + money(t.amount) + '</span>'
                + '</div>';
        }).join('') : '<div style="color:#aaa;font-size:.82rem">لا توجد طلبات شحن</div>';

        var k = escJs(u._key);
        body.innerHTML =
              '<div class="adm-sec"><h4><i class="fas fa-user"></i> بيانات الحساب</h4><div class="adm-kv">' + kv + '</div></div>'
            + '<div class="adm-sec"><h4><i class="fas fa-chart-pie"></i> ملخص</h4><div class="adm-kv">' + summary + '</div></div>'
            + '<div class="adm-sec"><h4><i class="fas fa-store"></i> بيع الجملة</h4><div class="adm-user-actions">'
            + (u.wholesale === true
                ? '<span class="ws-badge big"><i class="fas fa-check-circle"></i> أسعار الجملة مفعّلة لهذا العميل</span>'
                : '<span style="color:#888;font-size:.85rem">هذا العميل يرى أسعار المفرق</span>')
            + wholesaleBtn(u) + '</div></div>'
            + '<div class="adm-sec"><h4><i class="fas fa-wallet"></i> تعديل الرصيد</h4><div class="adm-user-actions">'
            + '<input type="number" id="admUdAmt" placeholder="$ مبلغ" min="0.01" step="0.01">'
            + '<button class="adm-act-btn topup" onclick="admAdjustBalance(\'' + k + '\',1)"><i class="fas fa-plus"></i> إضافة</button>'
            + '<button class="adm-act-btn reject" onclick="admAdjustBalance(\'' + k + '\',-1)"><i class="fas fa-minus"></i> خصم</button>'
            + '</div></div>'
            + '<div class="adm-sec"><h4><i class="fas fa-shopping-bag"></i> الطلبات (' + s.orders.length + ')</h4>' + ordersHtml + '</div>'
            + '<div class="adm-sec"><h4><i class="fas fa-receipt"></i> سجل العمليات (' + txs.length + ')</h4>' + txHtml + '</div>'
            + '<div class="adm-sec"><h4><i class="fas fa-money-check-alt"></i> طلبات الشحن (' + topups.length + ')</h4>' + topHtml + '</div>';
    }

    function refreshUserModal() {
        if (!openUserKey) return;
        var ov = $('admUserOv');
        if (!ov || !ov.classList.contains('on')) return;
        // لا نعيد الرسم أثناء كتابة مبلغ حتى لا يُمسح ما يكتبه المدير
        var amt = $('admUdAmt');
        var typed = amt ? amt.value : '';
        var focused = amt && document.activeElement === amt;
        var scroll = $('admUserBody').scrollTop;
        renderUserModal();
        $('admUserBody').scrollTop = scroll;
        if ($('admUdAmt')) { $('admUdAmt').value = typed; if (focused) $('admUdAmt').focus(); }
    }

    window.admOpenUser = function(key) {
        openUserKey = key;
        renderUserModal();
        $('admUserBody').scrollTop = 0;
        $('admUserOv').classList.add('on');
    };
    function closeUserModal() {
        openUserKey = null;
        $('admUserOv').classList.remove('on');
    }
    if ($('admUserOv')) {
        $('admUserClose').addEventListener('click', closeUserModal);
        $('admUserOv').addEventListener('click', function(e) { if (e.target === this) closeUserModal(); });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && $('admUserOv').classList.contains('on')) closeUserModal();
        });
    }
    if ($('admOrderSearch')) $('admOrderSearch').addEventListener('input', renderOrdersTable);
    if ($('admUserSearch'))  $('admUserSearch').addEventListener('input', renderUsersTable);

    // ── Admin actions ────────────────────────────────────────────────────
    // الرصيد قد يكون محفوظاً كنص في حسابات قديمة — نحوله لرقم قبل الجمع حتى لا يصير "5" + 3 = "53"
    function addToBalance(uid, delta) {
        return dbRef('users/' + uid + '/balance').transaction(function(cur) {
            var n = Math.round((num(cur) + delta) * 100) / 100;
            return n < 0 ? 0 : n;
        });
    }

    // إشعار للزبون (لا يوقف أي عملية إن فشل)
    function notifyUser(uid, type, title, body, ref) {
        try {
            if (window.ZoodnyNotify) window.ZoodnyNotify.toUser(uid, { type: type, title: title, body: body, ref: ref || '' });
        } catch (e) { console.warn('notify user failed:', e); }
    }

    // اسم المنتج (أو المنتجات) بدل رقم الطلب — للإشعارات وسجل العمليات
    function orderLabel(o, orderId) {
        var itemsArr = orderItems(o);
        if (itemsArr.length === 1) return itemsArr[0].name || itemsArr[0].productName || ('طلب #' + orderId);
        if (itemsArr.length > 1) {
            var pNames = itemsArr.map(function(it){ return it.name || it.productName; }).filter(Boolean);
            if (pNames.length) return pNames.slice(0,2).join('، ') + (pNames.length > 2 ? ' +' + (pNames.length - 2) : '');
        }
        return 'طلب #' + orderId;
    }

    function findTopup(reqId) {
        for (var i = 0; i < adminTopups.length; i++) if (adminTopups[i].reqId === reqId) return adminTopups[i];
        return null;
    }

    window.admAcceptTopup = function(reqId, uid, amount) {
        var amt = num(amount);
        dbRef('topup_orders/' + reqId).update({ status: 'accepted' });
        addToBalance(uid, amt);
        dbRef('users/' + uid + '/transactions/' + reqId).update({ status: 'completed' });
        notifyUser(uid, 'topup', 'تم شحن رصيدك 💰', 'تمت إضافة ' + amt.toFixed(2) + '$ إلى رصيدك بنجاح', reqId);
        balToast('✓ تم قبول الطلب وإضافة ' + amt.toFixed(2) + '$', true);
    };
    window.admRejectTopup = function(reqId, uid) {
        if (!confirm('رفض هذا الطلب؟')) return;
        var t = findTopup(reqId);
        dbRef('topup_orders/' + reqId).update({ status: 'rejected' });
        dbRef('users/' + uid + '/transactions/' + reqId).remove();
        notifyUser(uid, 'topup', 'تم رفض طلب شحن الرصيد',
            'تم رفض طلب شحن ' + (t ? num(t.amount).toFixed(2) + '$ ' : '') + '— تأكد من رقم العملية أو تواصل معنا', reqId);
    };
    window.admDelTopup = function(reqId) {
        dbRef('topup_orders/' + reqId).remove();
    };
    window.admUpdateOrderStatus = function(orderKey, status) {
        if (status === 'rejected' && !confirm('رفض الطلب وإرجاع المبلغ لرصيد الزبون؟')) return;
        dbRef('store_orders/' + orderKey).update({ status: status });

        dbRef('store_orders/' + orderKey).once('value', function(snap) {
            var o = snap.val();
            if (!o || !o.uid || o.uid === 'guest') return;
            var orderId = o.orderId || orderKey;
            var label = orderLabel(o, orderId);
            // تحديث حالة الطلب في سجل الزبون أيضاً
            dbRef('users/' + o.uid + '/orders/' + orderId).once('value', function(s) {
                if (s.exists()) dbRef('users/' + o.uid + '/orders/' + orderId).update({ status: status });
            });

            if (status === 'processing') {
                notifyUser(o.uid, 'order', 'جاري تنفيذ طلبك ⚙️', 'بدأنا تنفيذ طلبك: ' + label, orderId);
                return;
            }
            if (status === 'done') {
                notifyUser(o.uid, 'order', 'تم تنفيذ طلبك ✅', 'تم إتمام طلب ' + label + ' بنجاح. شكراً لثقتك بزودني!', orderId);
                return;
            }
            if (status !== 'rejected') return;

            // عند الرفض: إعادة قيمة الطلب لرصيد العميل + تسجيلها في سجل العمليات كاسترجاع
            var refundAmount = num(o.total);
            notifyUser(o.uid, 'order', 'تم رفض طلبك',
                'تم رفض طلب ' + label + (refundAmount > 0 ? ' وإرجاع ' + refundAmount.toFixed(2) + '$ إلى رصيدك' : ''), orderId);
            if (!(refundAmount > 0)) return;
            addToBalance(o.uid, refundAmount);
            dbRef('users/' + o.uid + '/transactions/REFUND-' + Date.now()).set({
                desc: 'استرجاع من طلب ' + label,
                date: nowAr(),
                amount: refundAmount,
                type: 'credit',
                status: 'completed',
                orderId: orderId,
                txCategory: 'refund',
                ts: Date.now()
            });
        });
    };

    // حذف الطلب نهائياً: من store_orders + من سجل طلبات الزبون + من سجل عملياته (الدفع/الاسترجاع المرتبط به)
    window.admDeleteOrder = function(orderKey) {
        var cached = null;
        for (var i = 0; i < adminOrders.length; i++) if (adminOrders[i]._key === orderKey) { cached = adminOrders[i]; break; }
        var msg = 'حذف هذا الطلب نهائياً؟\n\nسيُحذف من لوحة المدير، ومن سجل طلبات الزبون وسجل عملياته، ومن قاعدة البيانات.'
            + (cached && cached.status !== 'rejected' && num(cached.total) > 0 ? '\n\nملاحظة: الحذف لا يُرجع المبلغ للزبون — لإرجاعه استخدم "رفض" أولاً.' : '');
        if (!confirm(msg)) return;

        dbRef('store_orders/' + orderKey).once('value').then(function(snap) {
            var o = snap.val() || cached || {};
            var orderId = o.orderId || orderKey;
            var uid = (o.uid && o.uid !== 'guest') ? o.uid : null;
            var updates = {};
            updates['store_orders/' + orderKey] = null;
            if (!uid) return { updates: updates, uid: null, hadRef: false };

            return dbRef('users/' + uid).once('value').then(function(us) {
                var u = us.val() || {};
                var hadRef = false;
                var ordersNode = (u.orders && typeof u.orders === 'object') ? u.orders : {};
                Object.keys(ordersNode).forEach(function(k) {
                    var r = ordersNode[k];
                    if (k === orderId || k === orderKey || (r && (r.orderId === orderId || r.orderId === orderKey))) {
                        updates['users/' + uid + '/orders/' + k] = null;
                        hadRef = true;
                    }
                });
                var txNode = (u.transactions && typeof u.transactions === 'object') ? u.transactions : {};
                Object.keys(txNode).forEach(function(k) {
                    var t = txNode[k];
                    if (!t || typeof t !== 'object') return;
                    if (t.orderId === orderId || t.orderId === orderKey
                        || (typeof t.desc === 'string' && t.desc.indexOf(orderId) !== -1)) {
                        updates['users/' + uid + '/transactions/' + k] = null;
                    }
                });
                return { updates: updates, uid: uid, hadRef: hadRef };
            });
        }).then(function(r) {
            return db.ref().update(r.updates).then(function() { return r; });
        }).then(function(r) {
            if (r.uid && r.hadRef) {
                dbRef('users/' + r.uid + '/ordersCount').transaction(function(c) { c = num(c); return c > 0 ? c - 1 : 0; });
            }
            balToast('✓ تم حذف الطلب نهائياً', true);
        }).catch(function(err) {
            console.error('delete order failed:', err);
            alert('فشل حذف الطلب: ' + (err && err.message ? err.message : err));
        });
    };

    window.admAdjustBalance = function(uid, sign) {
        var inp = $('admUdAmt');
        var amt = num(inp ? inp.value : 0);
        if (!(amt > 0)) { alert('أدخل مبلغاً صحيحاً'); return; }
        var u = findUser(uid);
        if (sign < 0 && !confirm('خصم ' + amt.toFixed(2) + '$ من رصيد ' + ((u && u.name) || 'العميل') + '؟')) return;
        addToBalance(uid, sign * amt).then(function() {
            dbRef('users/' + uid + '/transactions/ADM-' + Date.now()).set({
                desc: sign > 0 ? 'إضافة رصيد من المدير' : 'خصم رصيد من المدير',
                date: nowAr(), amount: amt, type: sign > 0 ? 'credit' : 'debit',
                status: 'completed', ts: Date.now()
            });
            if ($('admUdAmt')) $('admUdAmt').value = '';
            notifyUser(uid, 'balance', sign > 0 ? 'تمت إضافة رصيد 💰' : 'تم خصم من رصيدك',
                (sign > 0 ? 'أضاف المدير ' : 'خصم المدير ') + amt.toFixed(2) + '$ ' + (sign > 0 ? 'إلى' : 'من') + ' رصيدك');
            balToast('✓ تم ' + (sign > 0 ? 'إضافة ' : 'خصم ') + amt.toFixed(2) + '$', true);
        }).catch(function(err) { alert('فشل تعديل الرصيد: ' + (err && err.message ? err.message : err)); });
    };

    window.admAddBalance = function(uid) {
        var inp = $('topupAmt_' + uid);
        var amt = num(inp ? inp.value : 0);
        if (!(amt > 0)) { alert('أدخل مبلغاً صحيحاً'); return; }
        addToBalance(uid, amt);
        dbRef('users/' + uid + '/transactions/ADM-' + Date.now()).set({
            desc: 'إضافة رصيد من المدير', date: nowAr(),
            amount: amt, type: 'credit', status: 'completed', ts: Date.now()
        });
        if (inp) inp.value = '';
        notifyUser(uid, 'balance', 'تمت إضافة رصيد 💰', 'أضاف المدير ' + amt.toFixed(2) + '$ إلى رصيدك');
        balToast('✓ تم إضافة ' + amt.toFixed(2) + '$ للعميل', true);
    };
    // ── بيع الجملة: تفعيل/إيقاف لعميل + إشعار له ──
    function wholesaleBtn(u) {
        var on = u.wholesale === true;
        return '<button class="adm-act-btn ' + (on ? 'ws-off' : 'ws-on') + '" onclick="admToggleWholesale(\'' + escJs(u._key) + '\')">'
            + '<i class="fas fa-store"></i> ' + (on ? 'إيقاف الجملة' : 'تفعيل الجملة') + '</button>';
    }
    window.admToggleWholesale = function(uid) {
        var u = findUser(uid);
        if (!u) return;
        var on = u.wholesale === true;
        var name = u.name || u.email || 'العميل';
        if (!confirm(on ? ('إيقاف أسعار الجملة عن ' + name + '؟') : ('تفعيل أسعار الجملة لـ ' + name + '؟\n\nسيرى أسعار الجملة للمنتجات التي لها سعر جملة، وسيصله إشعار بذلك.'))) return;
        dbRef('users/' + uid).update({ wholesale: !on, wholesaleSince: on ? null : Date.now() })
            .then(function() {
                notifyUser(uid, 'wholesale', on ? 'تم إيقاف أسعار الجملة' : 'تم تفعيل بيع الجملة 🏪',
                    on ? 'أصبحت ترى أسعار المفرق العادية في المتجر' : 'مبروك! أصبحت أسعار الجملة متاحة لك الآن في متجر زودني');
                balToast(on ? '✓ تم إيقاف الجملة' : '✓ تم تفعيل الجملة لـ ' + name, true);
            })
            .catch(function(err) { alert('فشل: ' + (err && err.message ? err.message : err) + ' — تأكد من تحديث قواعد Firebase'); });
    };

    window.admDelUser = function(uid) {
        if (!confirm('حذف هذا المستخدم نهائياً؟')) return;
        dbRef('users/' + uid).remove();
        if (openUserKey === uid) closeUserModal();
    };

    // ── إرسال إشعار لكل العملاء (إعلانات) ───────────────────────────────
    var adminBroadcasts = [];
    var bcTemplates = {
        'new':    ['منتج جديد في زودني 🎉', 'وصلنا الآن: [اسم المنتج] بأفضل سعر — اطلبه الآن!'],
        'offer':  ['عرض خاص لفترة محدودة 🔥', 'خصم على [اسم الخدمة] — العرض ساري حتى [التاريخ]'],
        'prices': ['تحديث الأسعار 💲', 'تم تحديث أسعار [القسم] — تصفّح الأسعار الجديدة الآن']
    };

    function startBroadcastListener() {
        dbRef('broadcasts').limitToLast(50).on('value', function(snap) {
            adminBroadcasts = [];
            snap.forEach(function(c) { var v = c.val(); if (v && typeof v === 'object') adminBroadcasts.push(Object.assign({ _key: c.key }, v)); });
            adminBroadcasts.sort(function(a, b) { return num(b.ts) - num(a.ts); });
            renderBroadcasts();
        }, function(err) {
            if ($('bcList')) $('bcList').innerHTML = '<div style="color:#e74c3c;font-size:.82rem">تعذّر تحميل الإشعارات: ' + esc(err && err.message ? err.message : err) + ' — تأكد من قواعد Firebase</div>';
        });
    }

    function renderBroadcasts() {
        var wrap = $('bcList');
        if (!wrap) return;
        if (!adminBroadcasts.length) { wrap.innerHTML = '<div style="color:#aaa;font-size:.82rem">لا توجد إشعارات مرسلة</div>'; return; }
        wrap.innerHTML = adminBroadcasts.map(function(b) {
            return '<div class="adm-mini-row">'
                + '<div class="t"><div><b>' + esc(b.title || '') + '</b></div>'
                + '<div style="color:#555">' + esc(b.body || '') + '</div>'
                + (b.url ? '<div class="d" style="direction:ltr;text-align:right">' + esc(b.url) + '</div>' : '')
                + '<div class="d">' + esc(b.ts ? new Date(b.ts).toLocaleString('ar-SY') : '') + '</div></div>'
                + '<button class="adm-act-btn del" title="حذف" onclick="admDelBroadcast(\'' + escJs(b._key) + '\')"><i class="fas fa-trash"></i></button>'
                + '</div>';
        }).join('');
    }

    window.admDelBroadcast = function(key) {
        if (!confirm('حذف هذا الإشعار من جرس الإشعارات عند كل العملاء؟')) return;
        dbRef('broadcasts/' + key).remove().catch(function(err) { alert('فشل الحذف: ' + (err && err.message ? err.message : err)); });
    };

    // ── إعداد إشعارات الموقع المغلق (رابط المُرسل + مفتاح Web Push) ──
    var pushCfgLoaded = false;
    function pushStatusLine(icon, color, text) {
        return '<div style="color:' + color + '"><i class="fas ' + icon + '"></i> ' + text + '</div>';
    }
    function renderPushStatus() {
        var el = $('pushStatus');
        if (!el || !window.ZoodnyNotify || !window.ZoodnyNotify.pushStatus) return;
        var s = window.ZoodnyNotify.pushStatus();
        var html = '';
        html += s.configured ? pushStatusLine('fa-check-circle', '#1e8449', 'الإعدادات محفوظة')
                             : pushStatusLine('fa-exclamation-circle', '#b9770e', 'غير مُعدّ بعد — الإشعارات تعمل فقط والموقع مفتوح');
        if (s.permission === 'granted') html += pushStatusLine('fa-check-circle', '#1e8449', 'الإشعارات مفعّلة على هذا الجهاز');
        else if (s.permission === 'denied') html += pushStatusLine('fa-times-circle', '#c0392b', 'الإشعارات محظورة على هذا الجهاز (من إعدادات المتصفح)');
        else if (s.permission === 'unsupported') html += pushStatusLine('fa-times-circle', '#c0392b', 'هذا المتصفح لا يدعم الإشعارات');
        else html += pushStatusLine('fa-bell', '#b9770e', 'فعّل الإشعارات على هذا الجهاز من جرس الإشعارات 🔔');
        if (s.configured && s.permission === 'granted') {
            html += s.accountLinked ? pushStatusLine('fa-check-circle', '#1e8449', 'هذا الجهاز مسجّل لاستقبال إشعارات المدير')
                                    : pushStatusLine('fa-spinner fa-spin', '#777', 'جاري تسجيل هذا الجهاز...');
        }
        el.innerHTML = html;
    }
    function loadPushConfig() {
        dbRef('config/push').on('value', function(snap) {
            var v = snap.val() || {};
            if (!pushCfgLoaded || document.activeElement !== $('pushWorkerUrl')) $('pushWorkerUrl').value = v.workerUrl || '';
            if (!pushCfgLoaded || document.activeElement !== $('pushVapidKey'))  $('pushVapidKey').value  = v.vapidKey || '';
            pushCfgLoaded = true;
            setTimeout(renderPushStatus, 300);
        });
        setInterval(function() { if ($('panel-notify') && $('panel-notify').classList.contains('active')) renderPushStatus(); }, 3000);
    }
    function showPushResult(ok, msg) {
        var el = $('pushResult');
        if (!el) return;
        el.className = 'push-result ' + (ok ? 'ok' : 'err');
        el.textContent = msg;
    }
    if ($('pushSaveBtn')) {
        $('pushSaveBtn').addEventListener('click', function() {
            var url = $('pushWorkerUrl').value.trim().replace(/\/+$/, '');
            var key = $('pushVapidKey').value.trim().replace(/\s+/g, '');
            if (url && !/^https:\/\/[^\s\/]+\.[^\s\/]+(\/\S*)?$/i.test(url)) { showPushResult(false, 'الرابط يجب أن يبدأ بـ https:// مثل https://zoodny-push.xxxx.workers.dev'); return; }
            if (key && !/^[A-Za-z0-9_\-]{80,100}$/.test(key)) { showPushResult(false, 'مفتاح Web Push غير صحيح — انسخ "Key pair" كاملاً من Firebase'); return; }
            var btn = this; btn.disabled = true;
            showPushResult(true, 'جاري الحفظ والفحص...');
            dbRef('config/push').set({ workerUrl: url, vapidKey: key }).then(function() {
                if (!url) { showPushResult(true, '✓ تم الحفظ'); return; }
                return window.ZoodnyNotify.pingWorker(url).then(function(r) {
                    if (r && r.ok && r.service === 'zoodny-push') {
                        showPushResult(!!r.configured, r.configured ? '✓ تم الحفظ — المُرسل يعمل ومُعدّ بشكل صحيح. جرّب "إرسال إشعار تجريبي".'
                                                                   : '✓ تم الحفظ، لكن المُرسل ينقصه FIREBASE_SERVICE_ACCOUNT أو ADMIN_UID في إعدادات Cloudflare');
                    } else {
                        showPushResult(false, 'تم الحفظ، لكن تعذّر الوصول للمُرسل على هذا الرابط: ' + ((r && r.error) || 'رد غير متوقع') + ' — تأكد من الرابط ومن نشر الكود');
                    }
                });
            }).catch(function(err) {
                showPushResult(false, 'فشل الحفظ: ' + (err && err.message ? err.message : err) + ' — تأكد من تحديث قواعد Firebase');
            }).then(function() { btn.disabled = false; setTimeout(renderPushStatus, 500); });
        });
    }
    if ($('pushTestBtn')) {
        $('pushTestBtn').addEventListener('click', function() {
            var s = window.ZoodnyNotify && window.ZoodnyNotify.pushStatus ? window.ZoodnyNotify.pushStatus() : null;
            if (!s || !s.configured) { showPushResult(false, 'احفظ رابط المُرسل والمفتاح أولاً'); return; }
            var btn = this; btn.disabled = true;
            var go = s.permission === 'granted' ? Promise.resolve('granted') : window.ZoodnyNotify.requestPermission();
            go.then(function(perm) {
                if (perm !== 'granted') { showPushResult(false, 'يجب تفعيل الإشعارات على هذا الجهاز أولاً'); return; }
                showPushResult(true, 'جاري الإرسال...');
                return window.ZoodnyNotify.testPush().then(function(r) {
                    if (r && r.ok && r.sent > 0) showPushResult(true, '✓ تم إرسال إشعار تجريبي إلى ' + r.sent + ' جهاز. أغلق الموقع وجرّب من لوحة الطلبات على جهاز آخر أيضاً.');
                    else if (r && r.ok) showPushResult(false, 'المُرسل يعمل لكن لا يوجد جهاز مسجّل لحساب المدير بعد — انتظر ثوانٍ وأعد المحاولة');
                    else showPushResult(false, 'فشل: ' + ((r && r.error) || 'خطأ غير معروف'));
                });
            }).catch(function(err) { showPushResult(false, 'فشل: ' + (err && err.message ? err.message : err)); })
              .then(function() { btn.disabled = false; renderPushStatus(); });
        });
    }

    // يُستدعى من إدارة المنتجات بعد إضافة منتج جديد
    window.admPrefillBroadcast = function(title, body) {
        // قد يُستدعى من صفحة المتجر (زر "+") ولوحة المدير مغلقة ← نفتحها على التبويب
        if (!$('adminDashboard').classList.contains('on') && typeof window.openAdminPanel === 'function') window.openAdminPanel('notify');
        else switchAdmTab('notify');
        if ($('bcTitle')) $('bcTitle').value = title || '';
        if ($('bcBody'))  $('bcBody').value  = body  || '';
        if ($('bcUrl'))   $('bcUrl').value   = '';
        var dash = $('adminDashboard');
        if (dash) dash.scrollTop = 0;
        setTimeout(function() { if ($('bcBody')) $('bcBody').focus(); }, 200);
    };

    document.querySelectorAll('[data-bc-tpl]').forEach(function(b) {
        b.addEventListener('click', function() {
            var t = bcTemplates[b.getAttribute('data-bc-tpl')];
            if (!t) return;
            $('bcTitle').value = t[0];
            $('bcBody').value = t[1];
            $('bcBody').focus();
        });
    });

    if ($('bcSendBtn')) {
        $('bcSendBtn').addEventListener('click', function() {
            var title = $('bcTitle').value.trim();
            var body  = $('bcBody').value.trim();
            var url   = $('bcUrl').value.trim();
            if (!title) { alert('اكتب عنوان الإشعار'); $('bcTitle').focus(); return; }
            if (!body)  { alert('اكتب نص الإشعار'); $('bcBody').focus(); return; }
            if (/\[[^\]]+\]/.test(title + body)) { alert('استبدل النص بين الأقواس [ ] بالمعلومة الصحيحة قبل الإرسال'); return; }
            if (url && !/^https?:\/\/\S+$/i.test(url) && !/^#\S*$/.test(url)) { alert('الرابط يجب أن يبدأ بـ https://'); $('bcUrl').focus(); return; }
            if (!window.ZoodnyNotify) { alert('نظام الإشعارات غير محمّل'); return; }
            if (!confirm('إرسال هذا الإشعار لكل زوار المتجر؟\n\n' + title + '\n' + body)) return;
            var btn = this;
            btn.disabled = true;
            window.ZoodnyNotify.broadcast({ title: title, body: body, url: url })
                .then(function() {
                    $('bcTitle').value = ''; $('bcBody').value = ''; $('bcUrl').value = '';
                    balToast('✓ تم إرسال الإشعار لكل العملاء', true);
                })
                .catch(function(err) { alert('فشل الإرسال: ' + (err && err.message ? err.message : err) + '\nتأكد من تحديث قواعد Firebase'); })
                .then(function() { btn.disabled = false; });
        });
    }

    // ── زر حسناً شكراً ──────────────────────────────────────────────────
    setTimeout(function() {
        var closeBtn = document.getElementById('orderSuccessCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                var ov = document.getElementById('orderSuccessOv');
                var mo = document.getElementById('orderSuccessModal');
                if (ov) { ov.classList.remove('on','active'); ov.style.display = 'none'; }
                if (mo) { mo.classList.remove('on','active'); mo.style.opacity = '0'; mo.style.pointerEvents = 'none'; }
                var cats  = document.getElementById('categories');
                var prods = document.getElementById('productsSection');
                if (prods) prods.style.display = 'none';
                if (cats) {
                    cats.style.display = 'block';
                    window.scrollTo({ top: cats.offsetTop - 80, behavior: 'smooth' });
                }
            });
        }
    }, 1000);
}());
