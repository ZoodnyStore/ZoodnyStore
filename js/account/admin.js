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
    document.querySelectorAll('.adm-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.adm-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.adm-tab-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            $('panel-' + tab.dataset.panel).classList.add('active');
        });
    });

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
                requestBrowserNotifPermission(function(granted) {
                    if (granted) {
                        initTopupNotifListener();
                    }
                });
            })
            .catch(function(err) {
                var wrongPass = err && /wrong-password|invalid-credential|invalid-login-credentials|user-not-found/.test(err.code || '');
                $('adminLoginErr').textContent = wrongPass ? '✕ كلمة السر غير صحيحة' : '✕ فشل تسجيل الدخول: ' + (err && err.message ? err.message : err);
                $('adminPassInput').value = '';
            });
    }

    // ── نظام إشعارات المتصفح ──────────────────────────────────────
    var _notifPermGranted = false;
    var _topupNotifInit   = false;
    var _knownTopupIds    = new Set();

    function requestBrowserNotifPermission(cb) {
        if (!('Notification' in window)) { if(cb) cb(false); return; }
        if (Notification.permission === 'granted') {
            _notifPermGranted = true; if(cb) cb(true); return;
        }
        if (Notification.permission === 'denied') { if(cb) cb(false); return; }
        Notification.requestPermission().then(function(perm) {
            _notifPermGranted = perm === 'granted';
            if(cb) cb(_notifPermGranted);
        });
    }

    function sendBrowserNotif(title, body, icon) {
        if (!('Notification' in window)) return;
        if (Notification.permission !== 'granted') return;
        try {
            var n = new Notification(title, {
                body: body,
                icon: icon || 'images/logo.jpg',
                badge: icon || 'images/logo.jpg',
                tag: 'zoodny-topup-' + Date.now(),
                requireInteraction: true,   // يبقى حتى يضغط عليه
                dir: 'rtl',
                lang: 'ar'
            });
            n.onclick = function() {
                window.focus();
                // فتح لوحة الأدمن مباشرة
                if (typeof openAdmin === 'function') openAdmin();
                n.close();
            };
            // صوت تنبيه
            try {
                var ctx = new (window.AudioContext || window.webkitAudioContext)();
                var osc = ctx.createOscillator();
                var gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
                osc.frequency.setValueAtTime(880, ctx.currentTime + 0.30);
                gain.gain.setValueAtTime(0.4, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.5);
            } catch(e) {}
        } catch(e) { console.log('Notification error:', e); }
    }

    function initTopupNotifListener() {
        if (_topupNotifInit) return;
        _topupNotifInit = true;

        // أولاً: اجمع الـ IDs الموجودة حالياً لتجنب الإشعار عنها
        dbRef('topup_orders').once('value', function(snap) {
            snap.forEach(function(c) { _knownTopupIds.add(c.key); });

            // ثانياً: استمع للإضافات الجديدة فقط
            dbRef('topup_orders').on('child_added', function(snap) {
                var key   = snap.key;
                var order = snap.val();
                if (!order) return;

                // تجاهل الطلبات القديمة
                if (_knownTopupIds.has(key)) return;
                _knownTopupIds.add(key);

                // إشعار المتصفح
                sendBrowserNotif(
                    'طلب شحن رصيد جديد',
                    'الاسم: ' + (order.name||'-') + ' | المبلغ: ' + parseFloat(order.amount||0).toFixed(2) + '$ | الهاتف: ' + (order.phone||'-'),
                    'images/logo.jpg'
                );

                // شريط إشعار داخل الموقع أيضاً
                showInSiteTopupAlert(order, key);
            });
        });
    }

    // شريط إشعار داخلي
    function showInSiteTopupAlert(order, reqId) {
        var ex = document.getElementById('_topupAlertBar');
        if (ex) ex.remove();
        if (!document.getElementById('_topupBarStyle')) {
            var st = document.createElement('style');
            st.id = '_topupBarStyle';
            st.textContent = '@keyframes _slideDownBar{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}';
            document.head.appendChild(st);
        }
        var bar = document.createElement('div');
        bar.id = '_topupAlertBar';
        bar.style.cssText = 'position:fixed;top:72px;left:0;right:0;z-index:99999;background:linear-gradient(135deg,#1a8a4a,#27ae60);color:#fff;padding:.75rem 1.4rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;box-shadow:0 4px 20px rgba(39,174,96,.5);font-family:Cairo,sans-serif;font-size:.9rem;font-weight:700;animation:_slideDownBar .35s ease;cursor:pointer;direction:rtl';
        var amt = parseFloat(order.amount || 0).toFixed(2);
        var info = document.createElement('span');
        info.innerHTML = '<i class="fas fa-bell"></i> <strong>طلب شحن جديد</strong>: ' + esc(order.name||'-') + ' | ' + amt + '$ | ' + esc(order.date||'');
        bar.appendChild(info);
        var btn = document.createElement('button');
        btn.textContent = '× إغلاق';
        btn.style.cssText = 'background:rgba(255,255,255,.2);border:none;color:#fff;border-radius:20px;padding:.3rem .9rem;cursor:pointer;font-weight:700;font-size:.82rem;font-family:Cairo,sans-serif';
        btn.onclick = function(e) { e.stopPropagation(); bar.remove(); };
        bar.appendChild(btn);
        bar.onclick = function() { bar.remove(); if (typeof openAdmin === 'function') openAdmin(); };
        document.body.appendChild(bar);
        setTimeout(function() { if (bar.parentNode) bar.remove(); }, 15000);
    }
    // ─────────────────────────────────────────────────────────────────

    function startAdminListeners() {
        if (adminListenerOn) {
            renderTopupsTable(); renderTopupStats();
            renderOrdersTable(); renderUsersTable();
            return;
        }
        adminListenerOn = true;

        // Topup orders
        dbRef('topup_orders').on('value', function(snap) {
            adminTopups = [];
            snap.forEach(function(c) { adminTopups.push(c.val()); });
            renderTopupsTable();
            renderTopupStats();
        });
        // Users (نحملهم أولاً لأننا نحتاج الإيميل)
        dbRef('users').on('value', function(snap) {
            adminUsers = [];
            snap.forEach(function(c) {
                var u = c.val();
                if (u) adminUsers.push(Object.assign({}, u, {transactions:undefined, orders:undefined}));
            });
            renderUsersTable();
            renderOrdersTable();
        }, function(err) {
            // هذا الجزء تمت إضافته للتشخيص: أي خطأ صلاحيات (permission_denied) من قواعد Firebase سيظهر هنا بدلاً من الفشل الصامت
            console.error('خطأ في قراءة users من Firebase:', err);
            var tbody = document.getElementById('usersBody');
            if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="adm-no-data" style="color:#e74c3c">خطأ صلاحيات: ' + (err && err.message ? err.message : err) + '</td></tr>';
        });
        // Store orders
        dbRef('store_orders').on('value', function(snap) {
            adminOrders = [];
            snap.forEach(function(c) { adminOrders.push(c.val()); });
            renderOrdersTable();
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
    
    function getOrderEmail(order) {
        if (order.email) return order.email;
        if (adminUsers && adminUsers.length > 0) {
            var user = adminUsers.find(function(u) { return u.uid === order.uid; });
            if (user) return user.email || '-';
        }
        return '-';
    }
    
    function renderOrdersTable() {
        var filtered = adminOrderFilter==='all' ? adminOrders : adminOrders.filter(function(o){ return o.status===adminOrderFilter; });
        var wrap = $('ordersAdmCards');
        if (!wrap) return;
        var stLabel = { pending:'🆕 جديد', processing:'⚙️ قيد التنفيذ', done:'✓ منجز', rejected:'✕ مرفوض' };

        if (!filtered.length) {
            wrap.innerHTML = '<div style="text-align:center;padding:2.5rem;color:#aaa"><i class="fas fa-box-open" style="font-size:2.5rem;display:block;margin-bottom:.7rem"></i>لا توجد طلبات</div>';
            return;
        }

        wrap.innerHTML = filtered.slice().reverse().map(function(o) {
            var st = esc(o.status || 'pending');

            // ── بناء المنتجات ──
            var prodsHtml = '';
            var itemsObj = o.items;
            if (itemsObj && typeof itemsObj === 'object' && !Array.isArray(itemsObj)) {
                prodsHtml = Object.keys(itemsObj).map(function(k) {
                    var it = itemsObj[k];
                    var extras = [];
                    if (it.playerId)       extras.push('<span><i class="fas fa-gamepad"></i> رقم اللاعب: <b>' + esc(it.playerId) + '</b></span>');
                    if (it.gameValue)      extras.push('<span><i class="fas fa-coins"></i> الكمية: <b>' + esc(it.gameValue) + '</b></span>');
                    if (it.appValue)       extras.push('<span><i class="fas fa-mobile-alt"></i> الباقة: <b>' + esc(it.appValue) + '</b></span>');
                    if (it.phoneNumber)    extras.push('<span><i class="fas fa-phone"></i> الهاتف: <b>' + esc(it.phoneNumber) + '</b></span>');
                    if (it.creditValue)    extras.push('<span><i class="fas fa-money-bill"></i> الرصيد: <b>' + esc(it.creditValue) + ' ل.س</b></span>');
                    if (it.customQuantity) extras.push('<span><i class="fas fa-sort-amount-up"></i> الكمية: <b>' + parseInt(it.customQuantity).toLocaleString() + '</b></span>');
                    if (it.socialLink) extras.push('<span style="direction:ltr;display:inline-block"><i class="fas fa-link"></i> ' + esc(it.socialLink.length>50?it.socialLink.substring(0,50)+'…':it.socialLink) + '</span>');
                    if (it.premiumInput)   extras.push('<span><i class="fas fa-key"></i> البيانات: <b>' + esc(it.premiumInput) + '</b></span>');
                    return '<div class="adm-prod-item">'
                        + '<div style="flex:1">'
                        + '<div class="adm-prod-name"><i class="fas fa-tag" style="color:var(--secondary);font-size:.72rem;margin-left:4px"></i>' + esc(it.productName || it.name || '-') + '</div>'
                        + (extras.length ? '<div class="adm-prod-extra">' + extras.join(' &nbsp;|&nbsp; ') + '</div>' : '')
                        + '<div class="adm-prod-extra"><i class="fas fa-times-circle" style="color:#ccc"></i> الكمية: ' + (it.quantity||1) + '</div>'
                        + '</div>'
                        + '<div class="adm-prod-price">' + parseFloat(it.totalItem || it.price || 0).toFixed(2) + '$</div>'
                        + '</div>';
                }).join('');
            } else if (Array.isArray(itemsObj)) {
                prodsHtml = itemsObj.map(function(it) {
                    return '<div class="adm-prod-item">'
                        + '<div class="adm-prod-name">' + esc(it.productName||it.name||'-') + '</div>'
                        + '<div class="adm-prod-price">' + parseFloat(it.price||0).toFixed(2) + '$</div>'
                        + '</div>';
                }).join('');
            }

            // ── بناء أزرار الإجراء حسب الحالة ──
            var btns = '';
            if (st === 'pending')    btns += '<button class="adm-act-btn accept" onclick="admUpdateOrderStatus(\''+escJs(o.orderId)+'\',\'processing\')"><i class="fas fa-cog"></i> بدء التنفيذ</button>';
            if (st === 'processing') btns += '<button class="adm-act-btn view"   onclick="admUpdateOrderStatus(\''+escJs(o.orderId)+'\',\'done\')"><i class="fas fa-check"></i> تم</button>';
            if (st !== 'done' && st !== 'rejected') btns += '<button class="adm-act-btn reject" onclick="admUpdateOrderStatus(\''+escJs(o.orderId)+'\',\'rejected\')"><i class="fas fa-times"></i> رفض</button>';
            btns += '<button class="adm-act-btn del" onclick="admDeleteOrder(\''+escJs(o.orderId)+'\')"><i class="fas fa-trash"></i></button>';

            return '<div class="adm-card ' + st + '">'
                // رأس البطاقة
                + '<div class="adm-card-head">'
                + '  <span class="adm-card-id"><i class="fas fa-hashtag"></i> ' + esc(o.orderId) + '</span>'
                + '  <span class="st-badge ' + st + '">' + (stLabel[st]||st) + '</span>'
                + '  <span class="adm-card-date"><i class="far fa-clock"></i> ' + esc(o.date||'-') + '</span>'
                + '</div>'
                // جسم البطاقة
                + '<div class="adm-card-body">'
                // بيانات العميل
                + '  <div class="adm-client-row">'
                + '    <div class="adm-client-item"><i class="fas fa-user"></i><strong>' + esc(o.name||'غير محدد') + '</strong></div>'
                + '    <div class="adm-client-item"><i class="fas fa-phone-alt"></i><strong>' + esc(o.phone||'-') + '</strong></div>'
                + '    <div class="adm-client-item"><i class="fas fa-envelope"></i><strong>' + esc(getOrderEmail(o)) + '</strong></div>'
                + '  </div>'
                // المنتجات
                + '  <div class="adm-products-wrap">'
                + '    <div class="adm-products-title"><i class="fas fa-shopping-cart"></i> المنتجات المطلوبة</div>'
                + (prodsHtml || '<div style="color:#aaa;font-size:.83rem;padding:.4rem">لا توجد تفاصيل</div>')
                + '  </div>'
                + '</div>'
                // ذيل البطاقة
                + '<div class="adm-card-foot">'
                + '  <div class="adm-total-lbl"><i class="fas fa-dollar-sign"></i> المجموع: ' + parseFloat(o.total||0).toFixed(2) + '$</div>'
                + '  <div class="adm-card-btns">' + btns + '</div>'
                + '</div>'
                + '</div>';
        }).join('');
    }

    function renderUsersTable() {
        var tbody = document.getElementById('usersBody');
        if (!tbody) return;
        if (!adminUsers || !adminUsers.length) { tbody.innerHTML = '<tr><td colspan="7" class="adm-no-data">لا يوجد مستخدمون</td></tr>'; return; }
        tbody.innerHTML = adminUsers.map(function(u) {
            var uid = u.uid || '';
            var bal = parseFloat(u.balance||0).toFixed(2);
            return '<tr>'
                + '<td><strong>' + esc(u.name||'-') + '</strong></td>'
                + '<td>' + esc(u.email||'-') + '</td>'
                + '<td>' + esc(u.phone||'-') + '</td>'
                + '<td><strong style="color:var(--success)">' + bal + '$</strong>'
                + '<div class="adm-topup-inline">'
                + '<input type="number" id="topupAmt_' + esc(uid) + '" placeholder="$ مبلغ" min="0.01" step="0.01" style="width:80px"/>'
                + '<button class="adm-act-btn topup" onclick="admAddBalance(\'' + escJs(uid) + '\')">إضافة</button>'
                + '</div></td>'
                + '<td>' + (u.ordersCount||0) + '</td>'
                + '<td><small>' + esc(u.createdAt||'-') + '</small></td>'
                + '<td><button class="adm-act-btn del" onclick="admDelUser(\'' + escJs(uid) + '\')"><i class="fas fa-trash"></i></button></td>'
                + '</tr>';
        }).join('');
    }

    // ── Admin actions ────────────────────────────────────────────────────
    window.admAcceptTopup = function(reqId, uid, amount) {
        dbRef('topup_orders/' + reqId).update({ status: 'accepted' });
        // Add balance to user
        dbRef('users/' + uid + '/balance').transaction(function(cur) {
            return (cur || 0) + amount;
        });
        // Update tx status
        dbRef('users/' + uid + '/transactions/' + reqId).update({ status: 'completed' });
        balToast('✓ تم قبول الطلب وإضافة ' + amount.toFixed(2) + '$', true);
    };
    window.admRejectTopup = function(reqId, uid) {
        if (!confirm('رفض هذا الطلب؟')) return;
        dbRef('topup_orders/' + reqId).update({ status: 'rejected' });
        dbRef('users/' + uid + '/transactions/' + reqId).remove();
    };
    window.admDelTopup = function(reqId) {
        dbRef('topup_orders/' + reqId).remove();
    };
    window.admUpdateOrderStatus = function(orderId, status) {
        dbRef('store_orders/' + orderId).update({ status: status });

        // عند رفض الطلب: إعادة قيمة الطلب لرصيد العميل + تسجيلها في سجل الشحن كاسترجاع
        if (status === 'rejected') {
            dbRef('store_orders/' + orderId).once('value', function(snap) {
                var o = snap.val();
                if (!o || !o.uid || o.uid === 'guest') return;
                var refundAmount = parseFloat(o.total || 0);
                if (!(refundAmount > 0)) return;

                dbRef('users/' + o.uid + '/balance').transaction(function(cur) {
                    return (cur || 0) + refundAmount;
                });

                // استخراج اسم المنتج (أو المنتجات) بدل كود الطلب لعرضه في وصف الاسترجاع
                var itemsRaw = o.items || o.products || [];
                var itemsArr = Array.isArray(itemsRaw) ? itemsRaw : (itemsRaw && typeof itemsRaw === 'object' ? Object.values(itemsRaw) : []);
                var productLabel;
                if (itemsArr.length === 1) {
                    productLabel = itemsArr[0].name || itemsArr[0].productName || ('طلب #' + orderId);
                } else if (itemsArr.length > 1) {
                    var pNames = itemsArr.map(function(it){ return it.name || it.productName; }).filter(Boolean);
                    productLabel = pNames.slice(0,2).join('، ') + (pNames.length > 2 ? ' +' + (pNames.length - 2) : '');
                } else {
                    productLabel = 'طلب #' + orderId;
                }

                dbRef('users/' + o.uid + '/transactions/REFUND-' + Date.now()).set({
                    desc: 'استرجاع من طلب ' + productLabel,
                    date: nowAr(),
                    amount: refundAmount,
                    type: 'credit',
                    status: 'completed',
                    orderId: orderId,
                    txCategory: 'refund',
                    ts: Date.now()
                });

                // تحديث حالة طلب المستخدم المختصر أيضاً
                dbRef('users/' + o.uid + '/orders/' + orderId).update({ status: 'rejected' });
            });
        }
    };
    window.admDeleteOrder = function(orderId) {
        if (confirm('حذف هذا الطلب نهائياً؟')) {
            dbRef('store_orders/' + orderId).remove();
        }
    };
    window.admAddBalance = function(uid) {
        var inp = $('topupAmt_' + uid);
        var amt = parseFloat(inp ? inp.value : 0);
        if (!amt || amt <= 0) { alert('أدخل مبلغاً صحيحاً'); return; }
        dbRef('users/' + uid + '/balance').transaction(function(cur) { return (cur||0)+amt; });
        var txKey = 'ADM-' + Date.now();
        dbRef('users/' + uid + '/transactions/' + txKey).set({
            desc: 'إضافة رصيد من المدير', date: nowAr(),
            amount: amt, type: 'credit', status: 'completed', ts: Date.now()
        });
        if (inp) inp.value = '';
        balToast('✓ تم إضافة ' + amt.toFixed(2) + '$ للعميل', true);
    };
    window.admDelUser = function(uid) {
        if (!confirm('حذف هذا المستخدم نهائياً؟')) return;
        dbRef('users/' + uid).remove();
    };

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
