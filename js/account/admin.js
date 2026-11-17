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
    let notesMap = {};        // order_notes: ملاحظات داخلية على الطلبات (لا يراها الزبون)
    let blockedMap = {};      // blocked_users: العملاء المحظورون (المدير فقط)

    // ── الأدوار: المدير (حساب admin) أو موظف (staff/{uid} يضيفه المدير من "أدوات المدير") ──
    let staffInfo = null, staffRef = null;
    function isStaff()    { return !isAdminSignedIn() && !!(staffInfo && staffInfo.active === true); }
    function canOrders()  { return isAdminSignedIn() || (isStaff() && staffInfo.orders === true); }
    function canTopups()  { return isAdminSignedIn() || (isStaff() && staffInfo.topups === true); }
    function isPanelUser(){ return isAdminSignedIn() || isStaff(); }
    var ADMIN_ONLY_TABS = ['products', 'notify', 'reports', 'tools'];

    function applyRoleUI() {
        var dash = $('adminDashboard');
        if (!dash) return;
        var staff = isStaff();
        dash.classList.toggle('adm-staff', staff);
        var title = dash.querySelector('.adm-topbar-title');
        if (title) title.innerHTML = staff
            ? '<i class="fas fa-user-tie"></i> لوحة الموظف — ' + esc(staffInfo.name || staffInfo.email || '')
            : '<i class="fas fa-tachometer-alt"></i> لوحة تحكم المدير — زودني';
        var firstVisible = null, activeHidden = false;
        document.querySelectorAll('.adm-tab').forEach(function(t) {
            var p = t.dataset.panel, show = true;
            if (staff) {
                if (ADMIN_ONLY_TABS.indexOf(p) !== -1) show = false;
                if (p === 'orders' && !canOrders()) show = false;
                if (p === 'topups' && !canTopups()) show = false;
            }
            t.style.display = show ? '' : 'none';
            if (show && !firstVisible) firstVisible = p;
            if (!show && t.classList.contains('active')) activeHidden = true;
        });
        if (activeHidden && firstVisible) switchAdmTab(firstVisible);
    }

    auth.onAuthStateChanged(function(u) {
        if (staffRef) { staffRef.off(); staffRef = null; }
        staffInfo = null;
        if (u && !isAdminSignedIn()) {
            staffRef = dbRef('staff/' + u.uid);
            staffRef.on('value', function(snap) {
                staffInfo = snap.val();
                applyRoleUI();
                document.dispatchEvent(new CustomEvent('zoodny:role'));
            }, function() { staffInfo = null; });
        }
        applyRoleUI();
        document.dispatchEvent(new CustomEvent('zoodny:role'));
    });

    // ── سجل النشاط: كل عملية مهمة من المدير أو الموظفين (admin_log — يقرؤه المدير فقط) ──
    window.zoodnyLog = function(action, text, ref) {
        try {
            var u = auth.currentUser;
            if (!u || !isPanelUser()) return;
            var admin = isAdminSignedIn();
            dbRef('admin_log').push({
                ts: Date.now(), uid: u.uid, role: admin ? 'admin' : 'staff',
                by: admin ? 'المدير' : ((staffInfo && staffInfo.name) || u.email || 'موظف'),
                action: String(action || ''), text: String(text || '').slice(0, 600), ref: String(ref || '')
            }).catch(function(e) { console.warn('log failed', e); });
        } catch (e) { console.warn('log failed', e); }
    };
    function log(a, t, r) { window.zoodnyLog(a, t, r); }

    // ── ADMIN PANEL ───────────────────────────────────────────────────────
    // ── الدخول المخفي للوحة المدير: 10 ضغطات سريعة على الشعار، أو ضغط مطوّل 4 ثوانٍ ──
    (function setupSecretAdminEntry() {
        var logo = document.querySelector('.navbar .logo');
        if (!logo) return;
        var TAPS = 10, TAP_GAP = 1200, HOLD_MS = 4000, MOVE_TOL = 12;
        var taps = 0, lastTap = 0, holdTimer = null, startX = 0, startY = 0;
        // بعد فتح النافذة بالضغط المطوّل: رفع الإصبع يولّد "ضغطة" على ما تحته (خلفية النافذة) فتُغلق فوراً
        // ← نتجاهل أي ضغطة حتى رفع الإصبع وبعده بلحظة
        var swallowUntil = 0;
        document.addEventListener('click', function(e) {
            if (Date.now() < swallowUntil) { e.preventDefault(); e.stopPropagation(); }
        }, true);

        function openEntry() {
            taps = 0;
            if (navigator.vibrate) { try { navigator.vibrate(40); } catch (e) {} }
            // المدير مسجّل دخوله أصلاً ← اللوحة مباشرة، وإلا نافذة كلمة السر
            if (typeof window.openAdminPanel === 'function') window.openAdminPanel();
            else openAdminLogin();
        }
        function cancelHold() { if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; } }

        // الضغطات المتتالية (أي توقف أطول من 1.2 ثانية يبدأ العد من جديد)
        logo.addEventListener('click', function(e) {
            var now = Date.now();
            taps = (now - lastTap <= TAP_GAP) ? taps + 1 : 1;
            lastTap = now;
            if (taps >= TAPS) { e.preventDefault(); openEntry(); }
        });

        // الضغط المطوّل (إصبع على الهاتف أو زر الماوس على اللابتوب)
        logo.addEventListener('pointerdown', function(e) {
            if (e.button !== undefined && e.button > 0) return;
            startX = e.clientX; startY = e.clientY;
            cancelHold();
            holdTimer = setTimeout(function() {
                holdTimer = null;
                swallowUntil = Infinity;
                setTimeout(function() { if (swallowUntil === Infinity) swallowUntil = 0; }, 8000);   // حدّ أمان
                openEntry();
            }, HOLD_MS);
        });
        logo.addEventListener('pointermove', function(e) {
            if (holdTimer && (Math.abs(e.clientX - startX) > MOVE_TOL || Math.abs(e.clientY - startY) > MOVE_TOL)) cancelHold();
        });
        ['pointerup', 'pointercancel', 'pointerleave'].forEach(function(ev) {
            logo.addEventListener(ev, function() {
                cancelHold();
                if (swallowUntil === Infinity) swallowUntil = Date.now() + 600;
            });
        });
        // منع قائمة "حفظ الصورة" وسحب الصورة عند الضغط المطوّل
        logo.addEventListener('contextmenu', function(e) { e.preventDefault(); });
        logo.addEventListener('dragstart', function(e) { e.preventDefault(); });
    })();

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
        if (!tab || !$('panel-' + panel) || tab.style.display === 'none') return;
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
        if (!isPanelUser()) { openAdminLogin(); return; }
        applyRoleUI();
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
                log('topup', 'مسح جميع طلبات الشحن (' + adminTopups.length + ' طلب)');
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
                applyRoleUI();
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
        var admin = isAdminSignedIn();
        if (admin) {
            startBroadcastListener();
            loadPushConfig();
            dbRef('blocked_users').on('value', function(snap) {
                blockedMap = snap.val() || {};
                renderUsersTable(); refreshUserModal();
            }, function(err) { console.warn('blocked_users:', err); });
        }
        if (canOrders()) {
            dbRef('order_notes').on('value', function(snap) {
                notesMap = snap.val() || {};
                renderOrdersTable();
            }, function(err) { console.warn('order_notes:', err); });
        }

        // Topup orders
        if (canTopups()) dbRef('topup_orders').on('value', function(snap) {
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
        if (canOrders()) dbRef('store_orders').on('value', function(snap) {
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
            var isSyp = t.currency === 'SYP' && num(t.amountSyp) > 0;
            var sypBox = isSyp
                ? '    <div class="adm-ti-box adm-ti-syp"><div class="adm-ti-lbl">المُرسل بالليرة السورية</div><div class="adm-ti-val">' + Math.round(num(t.amountSyp)).toLocaleString('en-US') + ' ل.س</div>'
                  + '<div class="adm-ti-sub">سعر الصرف: 1 دولار = ' + Math.round(num(t.rate)).toLocaleString('en-US') + ' ل.س</div></div>'
                : '';

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
                + sypBox
                + '    <div class="adm-ti-box adm-ti-amount"><div class="adm-ti-lbl">' + (isSyp ? 'يُضاف للرصيد (بعد التحويل)' : 'المبلغ المطلوب شحنه') + '</div><div class="adm-ti-val">' + amt + ' $</div></div>'
                + '    <div class="adm-ti-box"><div class="adm-ti-lbl">رقم عملية شام كاش</div><div class="adm-ti-val">' + esc(t.txId||t.transferNumber||t.shamCashNumber||'-') + '</div></div>'
                + '  </div>'
                + '</div>'
                + '<div class="adm-card-foot">'
                + '  <div class="adm-total-lbl"><i class="fas fa-dollar-sign"></i> ' + amt + '$' + (isSyp ? ' <span class="adm-syp-tag">ل.س</span>' : '') + '</div>'
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
        if (it.reqValue) {
            var reqIcons = { link: 'fa-link', text: 'fa-font', email: 'fa-envelope', phone: 'fa-phone', number: 'fa-hashtag' };
            keys.push(keyField(reqIcons[it.reqType] || 'fa-info-circle', esc(it.reqLabel || 'المعلومة المطلوبة'), it.reqValue));
        }

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
            parts.push(it.productName, it.name, it.playerId, it.phoneNumber, it.socialLink, it.accountUrl, it.premiumInput, it.gameValue, it.appValue, it.reqValue);
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
            var dlv = o.delivery && typeof o.delivery === 'object' ? o.delivery : null;
            btns += '<button class="adm-act-btn dlv' + (dlv ? ' done' : '') + '" title="تسليم معلومات الحساب/الكود للعميل" onclick="admOpenDelivery(\'' + key + '\')"><i class="fas ' + (dlv ? 'fa-check-double' : 'fa-box-open') + '"></i> ' + (dlv ? 'تعديل التسليم' : 'تسليم') + '</button>';
            var dlvHtml = dlv ? '<div class="adm-dlv-box"><div class="h"><i class="fas fa-check-circle"></i> تم التسليم للعميل'
                + (dlv.ts ? ' <small>' + esc(new Date(dlv.ts).toLocaleString('ar-SY')) + (dlv.by ? ' — ' + esc(dlv.by) : '') + '</small>' : '') + '</div>'
                + (Array.isArray(dlv.items) ? dlv.items.map(function(r) { return r && r.value ? keyField('fa-key', esc(r.label || 'معلومة'), r.value) : ''; }).join('') : '')
                + (dlv.note ? '<div class="n">' + esc(dlv.note) + '</div>' : '') + '</div>' : '';
            var note = notesMap[o._key];
            btns += '<button class="adm-act-btn note" title="ملاحظة داخلية لا يراها الزبون" onclick="admEditNote(\'' + key + '\')"><i class="fas fa-sticky-note"></i> ' + (note ? 'تعديل الملاحظة' : 'ملاحظة') + '</button>';
            btns += '<button class="adm-act-btn del" title="حذف نهائي" onclick="admDeleteOrder(\'' + key + '\')"><i class="fas fa-trash"></i> حذف</button>';
            var noteHtml = (note && note.text)
                ? '<div class="adm-order-note"><i class="fas fa-sticky-note"></i> <b>ملاحظة داخلية:</b> ' + esc(note.text)
                  + '<span class="by">' + esc(note.by || '') + (note.ts ? ' — ' + esc(new Date(note.ts).toLocaleString('ar-SY')) : '') + '</span></div>'
                : '';

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
                + dlvHtml
                + noteHtml
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
                + (u.wholesale === true ? ' <span class="ws-badge"><i class="fas fa-store"></i> جملة</span>' : '')
                + (blockedMap[key] ? ' <span class="blk-badge"><i class="fas fa-ban"></i> محظور</span>' : '') + '</td>'
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
                + blockBtn(u)
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
            + '<div class="adm-sec adm-admin-only"><h4><i class="fas fa-ban"></i> حظر العميل</h4><div class="adm-user-actions">'
            + (blockedMap[u._key]
                ? '<span class="blk-badge big"><i class="fas fa-ban"></i> محظور' + (blockedMap[u._key].reason ? ': ' + esc(blockedMap[u._key].reason) : '') + '</span>'
                : '<span style="color:#888;font-size:.85rem">يستطيع هذا العميل الطلب وشحن الرصيد</span>')
            + blockBtn(u) + '</div></div>'
            + '<div class="adm-sec adm-admin-only"><h4><i class="fas fa-key"></i> استعادة الحساب</h4><div class="adm-user-actions">'
            + (u.email
                ? '<span style="color:#666;font-size:.83rem">يصل للعميل رابط على <b dir="ltr">' + esc(u.email) + '</b> لتعيين كلمة سر جديدة</span>'
                  + '<button class="adm-act-btn view" onclick="admSendReset(\'' + k + '\')"><i class="fas fa-paper-plane"></i> إرسال رابط استعادة كلمة السر</button>'
                : '<span style="color:#999;font-size:.83rem">لا يوجد بريد مسجّل لهذا العميل</span>')
            + '</div></div>'
            + '<div class="adm-sec adm-admin-only"><h4><i class="fas fa-wallet"></i> تعديل الرصيد</h4><div class="adm-user-actions">'
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
        var tu = findTopup(reqId);
        log('topup', 'قبول شحن ' + amt.toFixed(2) + '$' + (tu && tu.currency === 'SYP' ? ' (' + Math.round(num(tu.amountSyp)).toLocaleString('en-US') + ' ل.س بسعر ' + num(tu.rate) + ')' : '') + ' لـ ' + ((tu && (tu.name || tu.email)) || uid) + (tu && tu.txId ? ' — رقم العملية ' + tu.txId : ''), reqId);
        balToast('✓ تم قبول الطلب وإضافة ' + amt.toFixed(2) + '$', true);
    };
    window.admRejectTopup = function(reqId, uid) {
        if (!confirm('رفض هذا الطلب؟')) return;
        var t = findTopup(reqId);
        dbRef('topup_orders/' + reqId).update({ status: 'rejected' });
        log('topup', 'رفض طلب شحن ' + (t ? num(t.amount).toFixed(2) + '$ لـ ' + (t.name || t.email || uid) : reqId), reqId);
        dbRef('users/' + uid + '/transactions/' + reqId).remove();
        notifyUser(uid, 'topup', 'تم رفض طلب شحن الرصيد',
            'تم رفض طلب شحن ' + (t ? num(t.amount).toFixed(2) + '$ ' : '') + '— تأكد من رقم العملية أو تواصل معنا', reqId);
    };
    window.admDelTopup = function(reqId) {
        var t = findTopup(reqId);
        dbRef('topup_orders/' + reqId).remove();
        log('topup', 'حذف طلب شحن ' + (t ? num(t.amount).toFixed(2) + '$ لـ ' + (t.name || t.email || '') : reqId), reqId);
    };
    window.admUpdateOrderStatus = function(orderKey, status) {
        if (status === 'rejected' && !confirm('رفض الطلب وإرجاع المبلغ لرصيد الزبون؟')) return;
        dbRef('store_orders/' + orderKey).update({ status: status });

        dbRef('store_orders/' + orderKey).once('value', function(snap) {
            var o = snap.val();
            if (!o || !o.uid || o.uid === 'guest') return;
            var orderId = o.orderId || orderKey;
            var label = orderLabel(o, orderId);
            var stTxt = { processing: 'بدء تنفيذ', done: 'إنجاز', rejected: 'رفض وإرجاع مبلغ' }[status] || status;
            log('order', stTxt + ' الطلب ' + orderId + ' (' + label + ') — ' + (o.name || '') + ' — ' + money(o.total), orderId);
            // تحديث حالة الطلب في سجل الزبون أيضاً
            dbRef('users/' + o.uid + '/orders/' + orderId).once('value', function(s) {
                if (s.exists()) dbRef('users/' + o.uid + '/orders/' + orderId).update({ status: status });
            });

            if (status === 'processing') {
                notifyUser(o.uid, 'order', 'جاري تنفيذ طلبك ⚙️', 'بدأنا تنفيذ طلبك: ' + label, orderId);
                return;
            }
            if (status === 'done') {
                if (o.delivery && Array.isArray(o.delivery.items) && o.delivery.items.length)
                    notifyUser(o.uid, 'order', 'تم تنفيذ طلبك وتسليمه ✅', 'تم تسليم ' + label + '. معلومات التسليم موجودة في: حسابي ← طلباتي — اضغط هنا لعرضها', orderId);
                else
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
            log('order', 'حذف الطلب ' + ((cached && cached.orderId) || orderKey) + ' نهائياً' + (cached ? ' — ' + (cached.name || '') + ' — ' + money(cached.total) : ''), orderKey);
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
            log('balance', (sign > 0 ? 'إضافة ' : 'خصم ') + amt.toFixed(2) + '$ ' + (sign > 0 ? 'إلى' : 'من') + ' رصيد ' + ((u && (u.name || u.email)) || uid), uid);
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
        var uu = findUser(uid);
        log('balance', 'إضافة ' + amt.toFixed(2) + '$ إلى رصيد ' + ((uu && (uu.name || uu.email)) || uid), uid);
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
                log('customer', (on ? 'إيقاف' : 'تفعيل') + ' أسعار الجملة لـ ' + name, uid);
            })
            .catch(function(err) { alert('فشل: ' + (err && err.message ? err.message : err) + ' — تأكد من تحديث قواعد Firebase'); });
    };

    window.admDelUser = function(uid) {
        if (!confirm('حذف هذا المستخدم نهائياً؟')) return;
        var du = findUser(uid);
        dbRef('users/' + uid).remove();
        log('customer', 'حذف العميل ' + ((du && (du.name || du.email)) || uid) + (du ? ' — رصيده كان ' + money(du.balance) : ''), uid);
        if (openUserKey === uid) closeUserModal();
    };

    // ── سعر صرف الدولار بالليرة (config/exchange) — يظهر للعملاء في صفحة الشحن ──
    (function setupFx() {
        if (!$('fxRateInput')) return;
        var cur = null, watching = false;
        function render() {
            var r = cur && num(cur.rate) > 0 ? num(cur.rate) : 0;
            if (document.activeElement !== $('fxRateInput')) $('fxRateInput').value = r || '';
            $('fxUpdated').textContent = r
                ? 'مفعّل — آخر تحديث: ' + new Date(cur.updatedAt || Date.now()).toLocaleString('ar-SY')
                : 'الشحن بالليرة متوقف حالياً';
            $('fxUpdated').className = r ? 'on' : 'off';
            $('fxOffBtn').style.display = r ? '' : 'none';
        }
        function watch() {
            if (watching || !isAdminSignedIn()) return;
            watching = true;
            dbRef('config/exchange').on('value', function(s) { cur = s.val(); render(); });
        }
        auth.onAuthStateChanged(watch);
        $('fxSaveBtn').onclick = function() {
            var v = parseFloat(String($('fxRateInput').value).replace(/[,٬\s]/g, ''));
            if (!(v > 0)) { alert('اكتب سعر صرف صحيح (كم ليرة سورية تساوي 1 دولار)'); $('fxRateInput').focus(); return; }
            v = Math.round(v * 100) / 100;
            var old = cur && num(cur.rate);
            if (old && Math.abs(v - old) / old > 0.3 && !confirm('السعر الجديد (' + v.toLocaleString('en-US') + ') يختلف كثيراً عن السابق (' + old.toLocaleString('en-US') + ').\nهل أنت متأكد؟')) return;
            dbRef('config/exchange').set({ rate: v, updatedAt: Date.now() }).then(function() {
                balToast('✓ تم حفظ سعر الصرف: 1 دولار = ' + v.toLocaleString('en-US') + ' ل.س', true);
                log('store', 'تحديث سعر الصرف: 1 دولار = ' + v.toLocaleString('en-US') + ' ل.س' + (old ? ' (كان ' + old.toLocaleString('en-US') + ')' : ''));
            }).catch(function(err) { alert('فشل الحفظ: ' + (err && err.message ? err.message : err)); });
        };
        $('fxRateInput').addEventListener('keydown', function(e) { if (e.key === 'Enter') $('fxSaveBtn').click(); });
        $('fxOffBtn').onclick = function() {
            if (!confirm('إيقاف الشحن بالليرة السورية؟\nسيستطيع العملاء الشحن بالدولار فقط.')) return;
            dbRef('config/exchange').set({ rate: 0, updatedAt: Date.now() }).then(function() {
                balToast('✓ تم إيقاف الشحن بالليرة', true);
                log('store', 'إيقاف الشحن بالليرة السورية');
            }).catch(function(err) { alert('فشل: ' + (err && err.message ? err.message : err)); });
        };
    })();

    // ── حظر عميل: لا يستطيع الطلب ولا شحن الرصيد (القاعدة في database.rules.json تمنعه فعلياً) ──
    function blockBtn(u) {
        if (!isAdminSignedIn()) return '';
        var on = !!blockedMap[u._key];
        return '<button class="adm-act-btn ' + (on ? 'blk-off' : 'blk-on') + '" onclick="admToggleBlock(\'' + escJs(u._key) + '\')">'
            + '<i class="fas ' + (on ? 'fa-unlock' : 'fa-ban') + '"></i> ' + (on ? 'إلغاء الحظر' : 'حظر') + '</button>';
    }
    window.admToggleBlock = function(uid) {
        var u = findUser(uid);
        if (!u || !isAdminSignedIn()) return;
        var name = u.name || u.email || 'العميل';
        var ref = dbRef('blocked_users/' + uid);
        if (blockedMap[uid]) {
            if (!confirm('إلغاء حظر ' + name + '؟')) return;
            ref.remove().then(function() {
                balToast('✓ تم إلغاء حظر ' + name, true);
                log('customer', 'إلغاء حظر العميل ' + name, uid);
            }).catch(function(err) { alert('فشل: ' + (err && err.message ? err.message : err) + ' — تأكد من نشر قواعد Firebase الجديدة'); });
            return;
        }
        var reason = prompt('حظر ' + name + '؟\n\nلن يستطيع الطلب ولا شحن الرصيد (يبقى رصيده كما هو).\nاكتب سبب الحظر (اختياري):', '');
        if (reason === null) return;
        ref.set({ ts: Date.now(), reason: reason.trim(), name: u.name || '', email: u.email || '' }).then(function() {
            balToast('✓ تم حظر ' + name, true);
            log('customer', 'حظر العميل ' + name + (reason.trim() ? ' — السبب: ' + reason.trim() : ''), uid);
        }).catch(function(err) { alert('فشل: ' + (err && err.message ? err.message : err) + ' — تأكد من نشر قواعد Firebase الجديدة'); });
    };

    // ── استعادة كلمة السر لعميل: Firebase يرسل له رابطاً على بريده ──
    window.admSendReset = function(uid) {
        var u = findUser(uid);
        if (!u || !u.email) return;
        if (!confirm('إرسال رابط تعيين كلمة سر جديدة إلى ' + u.email + '؟\n\nملاحظة: إن كان العميل يدخل عبر Google فلا يحتاج كلمة سر — يكفي أن يضغط "المتابعة مع Google".')) return;
        window.zoodnySendPasswordReset(u.email).then(function() {
            balToast('✓ تم إرسال رابط الاستعادة إلى ' + u.email, true);
            log('customer', 'إرسال رابط استعادة كلمة السر إلى ' + (u.name || '') + ' <' + u.email + '>', uid);
        }).catch(function(err) { alert(window.zoodnyResetErrText(err)); });
    };

    // ── تسليم الطلب: معلومات (حساب/كود/اشتراك) تُحفظ داخل الطلب ويراها العميل في "طلباتي" ──
    var DLV_TPL = {
        account: [['البريد / Apple ID', ''], ['كلمة المرور', ''], ['أسئلة الأمان / الأجوبة', '']],
        sub:     [['البريد', ''], ['كلمة المرور', ''], ['تاريخ انتهاء الاشتراك', '']],
        code:    [['الكود', '']],
        number:  [['الرقم', ''], ['كود التفعيل', '']]
    };
    var dlvKey = null;
    function dlvAddRow(label, value) {
        var row = document.createElement('div');
        row.className = 'dlv-row';
        row.innerHTML = '<input type="text" class="dlv-l" placeholder="العنوان (مثال: البريد)" maxlength="60">'
            + '<input type="text" class="dlv-v" placeholder="القيمة" dir="auto" maxlength="500">'
            + '<button type="button" title="حذف السطر"><i class="fas fa-times"></i></button>';
        row.querySelector('.dlv-l').value = label || '';
        row.querySelector('.dlv-v').value = value || '';
        row.querySelector('button').onclick = function() { row.parentNode.removeChild(row); };
        $('dlvRows').appendChild(row);
        return row;
    }
    function dlvFindOrder(key) {
        for (var i = 0; i < adminOrders.length; i++) if (adminOrders[i]._key === key) return adminOrders[i];
        return null;
    }
    window.admOpenDelivery = function(key) {
        var o = dlvFindOrder(key);
        if (!o) return;
        dlvKey = key;
        var c = orderClient(o), items = orderItems(o);
        $('dlvTitle').textContent = 'تسليم الطلب ' + (o.orderId || key);
        $('dlvOrderInfo').innerHTML = '<div><i class="fas fa-user"></i> ' + esc(c.name || '-') + (c.phone ? ' — <span dir="ltr">' + esc(c.phone) + '</span>' : '') + '</div>'
            + '<div><i class="fas fa-tag"></i> ' + esc(items.map(function(it) { return (it.productName || it.name || '') + (num(it.quantity) > 1 ? ' ×' + it.quantity : ''); }).join('، ') || '-') + '</div>';
        $('dlvRows').innerHTML = '';
        var d = o.delivery || {};
        if (Array.isArray(d.items) && d.items.length) d.items.forEach(function(r) { dlvAddRow(r.label, r.value); });
        else {
            // قالب مقترح حسب اسم المنتج
            var names = items.map(function(it) { return String(it.productName || it.name || ''); }).join(' ').toLowerCase();
            var tpl = /icloud|apple|ايكلود|آيكلود|ابل|حساب/.test(names) ? 'account' : /نتفلكس|netflix|شاهد|اشتراك|vpn|premium|بريميوم/.test(names) ? 'sub'
                    : /رقم|واتساب|تليغرام/.test(names) ? 'number' : /كود|بطاقة|ايتونز|itunes|steam|ستيم|psn|جوجل بلاي|google play/.test(names) ? 'code' : 'account';
            DLV_TPL[tpl].forEach(function(r) { dlvAddRow(r[0], r[1]); });
        }
        $('dlvNote').value = d.note || '';
        var done = o.status === 'done';
        $('dlvComplete').checked = true;
        $('dlvCompleteTxt').textContent = done ? 'إرسال إشعار للعميل بتحديث معلومات التسليم' : 'إتمام الطلب (منجز) وإرسال إشعار للعميل';
        $('dlvMsg').textContent = ''; $('dlvMsg').className = 'adm-pw-msg';
        $('admDlvOv').classList.add('on');
        setTimeout(function() { var f = $('dlvRows').querySelector('.dlv-v'); if (f) f.focus(); }, 150);
    };
    if ($('admDlvOv')) {
        $('admDlvClose').onclick = function() { $('admDlvOv').classList.remove('on'); };
        $('admDlvOv').addEventListener('click', function(e) { if (e.target === this) this.classList.remove('on'); });
        $('dlvAddRow').onclick = function() { dlvAddRow('', '').querySelector('.dlv-l').focus(); };
        document.querySelectorAll('[data-dlv-tpl]').forEach(function(b) {
            b.addEventListener('click', function() {
                // نحتفظ بالقيم المكتوبة، ونستبدل الأسطر الفارغة بالقالب
                Array.prototype.forEach.call($('dlvRows').querySelectorAll('.dlv-row'), function(r) { if (!r.querySelector('.dlv-v').value.trim()) r.parentNode.removeChild(r); });
                DLV_TPL[b.dataset.dlvTpl].forEach(function(r) { dlvAddRow(r[0], r[1]); });
            });
        });
        $('dlvSaveBtn').onclick = function() {
            var o = dlvFindOrder(dlvKey);
            if (!o) return;
            var rows = [];
            Array.prototype.forEach.call($('dlvRows').querySelectorAll('.dlv-row'), function(r) {
                var l = r.querySelector('.dlv-l').value.trim(), v = r.querySelector('.dlv-v').value.trim();
                if (v) rows.push({ label: l || 'معلومة', value: v });
            });
            var note = $('dlvNote').value.trim();
            var msg = $('dlvMsg');
            if (!rows.length && !note) { msg.className = 'adm-pw-msg err'; msg.textContent = 'اكتب معلومة واحدة على الأقل للتسليم'; return; }
            var by = isAdminSignedIn() ? 'المدير' : ((staffInfo && staffInfo.name) || (auth.currentUser && auth.currentUser.email) || 'موظف');
            var btn = this, notify = $('dlvComplete').checked, wasDone = o.status === 'done', hadDelivery = !!o.delivery;
            btn.disabled = true;
            dbRef('store_orders/' + dlvKey + '/delivery').set({ items: rows, note: note, ts: Date.now(), by: by }).then(function() {
                var orderId = o.orderId || dlvKey;
                log('order', (hadDelivery ? 'تعديل تسليم الطلب ' : 'تسليم الطلب ') + orderId + ' — ' + (o.name || '') + ' (' + rows.map(function(r) { return r.label; }).join('، ') + ')', orderId);
                if (notify && !wasDone) window.admUpdateOrderStatus(dlvKey, 'done');   // يرسل إشعار "تم تنفيذ طلبك وتسليمه"
                else if (notify && o.uid && o.uid !== 'guest')
                    notifyUser(o.uid, 'order', 'تم تحديث معلومات التسليم 🔐', 'تم تحديث معلومات تسليم ' + orderLabel(o, orderId) + ' — تجدها في: حسابي ← طلباتي', orderId);
                $('admDlvOv').classList.remove('on');
                balToast(notify ? '✓ تم التسليم وإرسال إشعار للعميل' : '✓ تم حفظ معلومات التسليم', true);
            }).catch(function(err) {
                msg.className = 'adm-pw-msg err';
                msg.textContent = 'فشل الحفظ: ' + (err && err.message ? err.message : err);
            }).then(function() { btn.disabled = false; });
        };
    }

    // ── ملاحظة داخلية على الطلب (order_notes — لا يراها الزبون) ──
    window.admEditNote = function(orderKey) {
        var cur = notesMap[orderKey];
        var v = prompt('ملاحظة داخلية على هذا الطلب (لا يراها الزبون).\nاترك الحقل فارغاً لحذف الملاحظة:', cur && cur.text ? cur.text : '');
        if (v === null) return;
        v = v.trim();
        var ref = dbRef('order_notes/' + orderKey);
        var by = isAdminSignedIn() ? 'المدير' : ((staffInfo && staffInfo.name) || (auth.currentUser && auth.currentUser.email) || 'موظف');
        (v ? ref.set({ text: v.slice(0, 1000), by: by, ts: Date.now() }) : ref.remove()).then(function() {
            log('order', (v ? 'ملاحظة على الطلب ' : 'حذف ملاحظة الطلب ') + orderKey + (v ? ': ' + v : ''), orderKey);
        }).catch(function(err) { alert('فشل حفظ الملاحظة: ' + (err && err.message ? err.message : err) + ' — تأكد من نشر قواعد Firebase الجديدة'); });
    };

    // لملفات الأدوات الأخرى (admin-tools.js)
    window.ZoodnyAdmin = {
        users: function() { return adminUsers; },
        orders: function() { return adminOrders; },
        topups: function() { return adminTopups; },
        isAdmin: isAdminSignedIn, isStaff: isStaff, isPanelUser: isPanelUser,
        staffInfo: function() { return staffInfo; },
        switchTab: switchAdmTab, money: money, num: num
    };

    // ── تغيير كلمة سر المدير ─────────────────────────────────────────────
    // نفس حساب Firebase (لا يتغير المعرّف UID ولا القواعد). Firebase يطلب التحقق بكلمة السر الحالية أولاً.
    function pwScore(p) {
        var s = 0;
        if (p.length >= 8) s++;
        if (p.length >= 12) s++;
        if (/[a-z؀-ۿ]/i.test(p) && /[0-9]/.test(p)) s++;
        if (/[^A-Za-z0-9؀-ۿ]/.test(p) || (/[a-z]/.test(p) && /[A-Z]/.test(p))) s++;
        return s;   // 0..4
    }
    function pwMsg(text, ok) {
        var el = $('admPwMsg');
        el.className = 'adm-pw-msg ' + (ok ? 'ok' : 'err');
        el.textContent = text;
    }
    function openPwModal() {
        ['admPwCur', 'admPwNew', 'admPwNew2'].forEach(function(id) { $(id).value = ''; $(id).type = 'password'; });
        document.querySelectorAll('.adm-pw-eye i').forEach(function(i) { i.className = 'fas fa-eye'; });
        $('admPwMsg').textContent = ''; $('admPwMsg').className = 'adm-pw-msg';
        $('admPwBar').style.width = '0'; $('admPwBar').className = '';
        $('admPwOv').classList.add('on');
        setTimeout(function() { $('admPwCur').focus(); }, 100);
    }
    function closePwModal() { $('admPwOv').classList.remove('on'); }

    if ($('admPwBtn')) {
        $('admPwBtn').addEventListener('click', openPwModal);
        $('admPwClose').addEventListener('click', closePwModal);
        $('admPwOv').addEventListener('click', function(e) { if (e.target === this) closePwModal(); });
        document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && $('admPwOv').classList.contains('on')) closePwModal(); });
        document.querySelectorAll('.adm-pw-eye').forEach(function(b) {
            b.addEventListener('click', function() {
                var inp = $(b.getAttribute('data-for'));
                var show = inp.type === 'password';
                inp.type = show ? 'text' : 'password';
                b.querySelector('i').className = show ? 'fas fa-eye-slash' : 'fas fa-eye';
            });
        });
        $('admPwNew').addEventListener('input', function() {
            var sc = pwScore(this.value);
            var labels = ['ضعيفة جداً', 'ضعيفة', 'متوسطة', 'جيدة', 'قوية'];
            $('admPwBar').style.width = (this.value ? Math.max(1, sc) * 25 : 0) + '%';
            $('admPwBar').className = 's' + sc;
            $('admPwHint').textContent = this.value ? ('قوة كلمة السر: ' + labels[sc] + (this.value.length < 8 ? ' — يجب 8 أحرف على الأقل' : '')) : '8 أحرف على الأقل — يُفضّل خلط حروف وأرقام ورموز';
        });

        $('admPwForm').addEventListener('submit', function(e) {
            e.preventDefault();
            var cur = $('admPwCur').value, nw = $('admPwNew').value, nw2 = $('admPwNew2').value;
            if (!cur) { pwMsg('اكتب كلمة السر الحالية'); $('admPwCur').focus(); return; }
            if (nw.length < 8) { pwMsg('كلمة السر الجديدة يجب أن تكون 8 أحرف على الأقل'); $('admPwNew').focus(); return; }
            if (nw !== nw2) { pwMsg('تأكيد كلمة السر غير مطابق'); $('admPwNew2').focus(); return; }
            if (nw === cur) { pwMsg('كلمة السر الجديدة مطابقة للحالية — اختر كلمة مختلفة'); $('admPwNew').focus(); return; }
            var user = auth.currentUser;
            if (!isAdminSignedIn()) { pwMsg('انتهت جلسة المدير — سجّل الدخول مجدداً'); return; }
            var btn = $('admPwSave');
            btn.disabled = true;
            pwMsg('جاري التغيير...', true);
            var cred = firebase.auth.EmailAuthProvider.credential(user.email, cur);
            user.reauthenticateWithCredential(cred)
                .then(function() { return user.updatePassword(nw); })
                .then(function() {
                    pwMsg('✓ تم تغيير كلمة السر بنجاح. استخدم الجديدة في المرة القادمة.', true);
                    ['admPwCur', 'admPwNew', 'admPwNew2'].forEach(function(id) { $(id).value = ''; });
                    balToast('✓ تم تغيير كلمة سر المدير', true);
                    setTimeout(closePwModal, 2200);
                })
                .catch(function(err) {
                    var code = (err && err.code) || '';
                    var map = {
                        'auth/wrong-password': 'كلمة السر الحالية غير صحيحة',
                        'auth/invalid-credential': 'كلمة السر الحالية غير صحيحة',
                        'auth/invalid-login-credentials': 'كلمة السر الحالية غير صحيحة',
                        'auth/weak-password': 'كلمة السر الجديدة ضعيفة — اختر كلمة أطول وأقوى',
                        'auth/too-many-requests': 'محاولات كثيرة — انتظر قليلاً ثم حاول مجدداً',
                        'auth/requires-recent-login': 'انتهت صلاحية الجلسة — اخرج وادخل مجدداً ثم حاول',
                        'auth/network-request-failed': 'تعذّر الاتصال — تأكد من الإنترنت'
                    };
                    pwMsg(map[code] || ('فشل التغيير: ' + (err && err.message ? err.message : err)));
                    if (/wrong-password|invalid-credential|invalid-login/.test(code)) { $('admPwCur').value = ''; $('admPwCur').focus(); }
                })
                .then(function() { btn.disabled = false; });
        });
    }

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
