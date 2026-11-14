/* ══════════════════════════════════════════════════════════════════════
 * الحساب: تسجيل الدخول، المحفظة، شحن الرصيد، سجل الطلبات
 * يصدّر window.ZoodnyAccount لباقي ملفات مجلد account.
 * ══════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ── constants ───────────────────────────────────────────────────────
    const ADMIN_EMAIL = 'admin@zoodny.com'; // ⚠️ غيّرها لنفس بريد حساب الأدمن اللي أنشأته في Firebase Authentication

    // ── state ────────────────────────────────────────────────────────────
    let currentUser   = null;   // Firebase auth user
    let userData      = null;   // user record from db

    // ملفات المتجر (cart.js / main.js) تقرأ userData عند إتمام الطلب لتسجيل اسم وإيميل وهاتف الزبون —
    // المتغير داخل هذه الدالة فلا تراه، لذلك نعرضه على window (قراءة وكتابة).
    Object.defineProperty(window, 'userData', {
        configurable: true,
        get: function () { return userData; },
        set: function (v) { userData = v; }
    });

    // ── helpers ──────────────────────────────────────────────────────────
    function $(id) { return document.getElementById(id); }
    function ovOn(id)  { $(id).classList.add('on'); }
    function ovOff(id) { $(id).classList.remove('on'); }

    /* عداد للـ modals المفتوحة — نمنع scroll الصفحة فقط عندما يكون هناك modal مفتوح */
    var _modalCount = 0;
    function modalOn(ovId, moId) {
        ovOn(ovId);
        $(moId).classList.add('on');
        _modalCount++;
        if (_modalCount === 1) {
            // حفظ موضع الـ scroll الحالي ثم تثبيت الصفحة
            var scrollY = window.scrollY;
            document.body.style.top = '-' + scrollY + 'px';
            document.body.classList.add('modal-open');
        }
        var bottomNav = document.getElementById('mobileBottomNav');
        if (bottomNav) bottomNav.style.display = 'none';
    }
    function modalOff(ovId, moId) {
        ovOff(ovId);
        $(moId).classList.remove('on');
        _modalCount = Math.max(0, _modalCount - 1);
        if (_modalCount === 0) {
            // استعادة موضع الـ scroll بعد إغلاق آخر modal
            var scrollY = Math.abs(parseInt(document.body.style.top || '0'));
            document.body.classList.remove('modal-open');
            document.body.style.top = '';
            window.scrollTo(0, scrollY);
        }
        var bottomNav = document.getElementById('mobileBottomNav');
        if (bottomNav) bottomNav.style.display = '';
    }

    function balToast(msg, green) {
        // Route all balToast calls to the unified center notification
        showToast(msg, green ? 'success' : 'error');
    }

    // ── تهريب النصوص قبل إدراجها في HTML ─────────────────────────────────
    function esc(s) {
        return String(s === null || s === undefined ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    // لنص يوضع داخل '...' في خاصية onclick
    function escJs(s) {
        return esc(String(s === null || s === undefined ? '' : s)
            .replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, '\\n'));
    }

    // ── واجهة مشتركة تستخدمها باقي ملفات الحساب (admin, service-modal, ...) ──
    window.ZoodnyAccount = {
        $: $, ovOn: ovOn, ovOff: ovOff, modalOn: modalOn, modalOff: modalOff,
        balToast: balToast, esc: esc, escJs: escJs,
        openOrdersHistory: openOrdersHistory,
        ADMIN_EMAIL: ADMIN_EMAIL,
        getCurrentUser: function () { return currentUser; }
    };


    // إشعار للمدير (notifications.js يُحمَّل بعد هذا الملف — نتحقق عند الاستدعاء)
    function notifyAdmin(type, title, body, ref) {
        try {
            if ((currentUser && String(currentUser.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase())) return;
            if (window.ZoodnyNotify) window.ZoodnyNotify.toAdmin({ type: type, title: title, body: body, ref: ref || '' });
        } catch (e) { console.warn('notify admin failed:', e); }
    }

    // يُبلغ باقي الملفات (مثل wholesale.js) بأي تغيير في بيانات المستخدم
    function announceUserData(user, data) {
        try { document.dispatchEvent(new CustomEvent('zoodny:userdata', { detail: { user: user, data: data } })); }
        catch (e) { console.warn('userdata event failed:', e); }
    }

    // ── inject navbar buttons ────────────────────────────────────────────
    function buildNavButtons(user, uData) {
        // remove old injected elements
        ['__authNavBtn','__walletNavWrap','__userDropDown'].forEach(function(id){
            var el = $(id); if (el) el.remove();
        });

        var cartCont = document.querySelector('.nav-links .cart-icon-container');
        if (!cartCont) return;

        // Floating balance badge (mobile)
        var fbb = document.getElementById('floatingBalBadge');

        if (!user) {
            // Not logged in
            var btn = document.createElement('button');
            btn.id = '__authNavBtn';
            btn.className = 'auth-nav-btn';
            btn.innerHTML = '<i class="fas fa-user"></i> دخول / تسجيل';
            btn.onclick = () => openAuth('login');
            cartCont.parentNode.insertBefore(btn, cartCont);
            if (fbb) fbb.classList.remove('show');
        } else {
            // Logged in
            var bal = (uData && uData.balance) ? parseFloat(uData.balance) : 0;
            var initials = (uData && uData.name) ? uData.name.charAt(0) : (user.email ? user.email.charAt(0).toUpperCase() : 'U');

            // ── Wallet pill ──
            var ww = document.createElement('div');
            ww.id = '__walletNavWrap';
            ww.className = 'wallet-nav-wrap';
            ww.title = 'رصيدي';
            ww.innerHTML =
                '<div class="wallet-nav-left" id="__walletNavLeft">'
                + '<i class="fas fa-wallet"></i>'
                + '<span id="walletNavBal">' + bal.toFixed(2) + '$</span>'
                + '</div>'
                + '<button class="wallet-plus-btn" id="__walletPlusBtn" title="شحن رصيد"><i class="fas fa-plus"></i></button>';
            ww.querySelector('#__walletNavLeft').onclick = function(e) { openWallet(); };
            ww.querySelector('#__walletPlusBtn').onclick = function(e) { e.stopPropagation(); openTopup(); };
            cartCont.parentNode.insertBefore(ww, cartCont);

            // ── User "حسابي" dropdown ──
            var ud = document.createElement('div');
            ud.id = '__userDropDown';
            ud.className = 'user-dropdown';
            ud.innerHTML =
                '<div class="auth-nav-btn" id="__userNavBtn">'
                + '<div class="auth-avatar">' + initials + '</div>'
                + '<span>' + ((uData && uData.name) ? uData.name.split(' ')[0] : 'حسابي') + '</span>'
                + '</div>'
                + '<div class="user-menu" id="__userMenu">'
                + '<div class="user-menu-header">'
                + '<div class="um-avatar">' + initials + '</div>'
                + '<div class="um-name">' + ((uData && uData.name) ? uData.name : '') + '</div>'
                + '<div class="um-email">' + (user.email || '') + '</div>'
                + '<div class="um-bal"><i class="fas fa-wallet"></i> ' + bal.toFixed(2) + '$</div>'
                + (uData && uData.wholesale === true ? '<div class="um-wholesale"><i class="fas fa-store"></i> حساب جملة</div>' : '')
                + '</div>'
                + '<button class="user-menu-item account-item" id="__menuAccount"><i class="fas fa-id-card"></i> حسابي</button>'
                + '<button class="user-menu-item wallet-item" id="__menuWallet"><i class="fas fa-wallet"></i> محفظتي</button>'
                + '<button class="user-menu-item orders-item" id="__menuOrders"><i class="fas fa-box"></i> طلباتي</button>'
                + '<div class="user-menu-divider"></div>'
                + '<button class="user-menu-item red" id="__menuLogout"><i class="fas fa-sign-out-alt"></i> تسجيل الخروج</button>'
                + '</div>';
            cartCont.parentNode.insertBefore(ud, cartCont);

            $('__userNavBtn').onclick  = () => $('__userMenu').classList.toggle('open');
            $('__menuAccount').onclick = () => { $('__userMenu').classList.remove('open'); openAccountModal(); };
            $('__menuWallet').onclick  = () => { $('__userMenu').classList.remove('open'); openWallet(); };
            $('__menuOrders').onclick  = () => { $('__userMenu').classList.remove('open'); openOrdersHistory(); };
            $('__menuLogout').onclick  = () => { $('__userMenu').classList.remove('open'); auth.signOut(); };

            document.addEventListener('click', function(e) {
                var ud2 = $('__userDropDown');
                if (ud2 && !ud2.contains(e.target)) $('__userMenu').classList.remove('open');
            }, true);

            // Show floating balance on mobile
            if (fbb) {
                fbb.classList.add('show');
                var fbalAmt = document.getElementById('floatingBalAmt');
                if (fbalAmt) fbalAmt.textContent = bal.toFixed(2) + '$';
            }
        }
    }

    // ── Handle Google Redirect result (for mobile) ───────────────────────
    auth.getRedirectResult().then(function(result) {
        if (result && result.user) {
            console.log('Google redirect login success:', result.user.email);
        }
    }).catch(function(err) {
        if (err.code && err.code !== 'auth/no-current-user') {
            console.error('Redirect error:', err.message);
        }
    });

    // ── Auth observer ────────────────────────────────────────────────────
    var _authNotifyDone = false;
    auth.onAuthStateChanged(function(user) {
        currentUser = user;
        if (user) {
            modalOff('authOv','authModal');
            dbRef('users/' + user.uid).on('value', function(snap) {
                userData = snap.val();
                if (!userData) {
                    // First login via Google — create profile
                    userData = {
                        uid: user.uid,
                        name: user.displayName || 'مستخدم',
                        email: user.email || '',
                        phone: '',
                        balance: 0,
                        createdAt: nowAr()
                    };
                    dbRef('users/' + user.uid).set(userData);
                    // حساب Google جديد (التسجيل بالإيميل يرسل إشعاره بنفسه بعد حفظ الاسم والهاتف)
                    if (!_registering) notifyAdmin('user', 'مستخدم جديد 👤', (user.displayName || 'مستخدم') + ' — ' + (user.email || '') + ' (Google)', user.uid);
                }
                buildNavButtons(user, userData);
                refreshWalletModal();
                checkProfileComplete();
                announceUserData(user, userData);
                // Show login success notification once
                if (!_authNotifyDone) {
                    _authNotifyDone = true;
                    var name = (userData && userData.name) ? userData.name.split(' ')[0] : '';
                    setTimeout(function() {
                        showToast('مرحباً ' + (name || 'بك') + '! تم تسجيل الدخول بنجاح', 'success');
                    }, 400);
                }
            });
        } else {
            var wasLoggedIn = !!currentUser;
            userData = null;
            closeProfileModal();
            announceUserData(null, null);
            buildNavButtons(null, null);
            _authNotifyDone = false;
            if (wasLoggedIn) {
                setTimeout(function() {
                    showToast('تم تسجيل الخروج بنجاح', 'info');
                }, 200);
            }
        }
    });

    // ── Auth modal ───────────────────────────────────────────────────────
    window.openAuth = function openAuth(tab) {
        switchTab(tab);
        modalOn('authOv','authModal');
        $('loginErr').textContent = '';
        $('registerErr').textContent = '';
    }
    function switchTab(t) {
        var isLogin = t === 'login';
        $('tabLogin').classList.toggle('active', isLogin);
        $('tabRegister').classList.toggle('active', !isLogin);
        $('loginFormWrap').style.display    = isLogin ? 'block' : 'none';
        $('registerFormWrap').style.display = isLogin ? 'none'  : 'block';
        $('authModalTitle').innerHTML = isLogin
            ? '<i class="fas fa-sign-in-alt"></i> تسجيل الدخول'
            : '<i class="fas fa-user-plus"></i> إنشاء حساب جديد';
    }
    $('tabLogin').onclick    = () => switchTab('login');
    $('tabRegister').onclick = () => switchTab('register');
    $('authClose').onclick   = () => modalOff('authOv','authModal');
    $('authOv').onclick      = () => modalOff('authOv','authModal');

    // Google sign in — use redirect (works on mobile)
    $('googleSignInBtn').onclick = function() {
        var provider = new firebase.auth.GoogleAuthProvider();
        // Use redirect on mobile, popup on desktop
        var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile) {
            auth.signInWithRedirect(provider).catch(function(err) {
                $('loginErr').textContent = err.message;
            });
        } else {
            auth.signInWithPopup(provider).catch(function(err) {
                $('loginErr').textContent = err.message;
            });
        }
    };

    // Login
    $('loginBtn').onclick = function() {
        var email = $('loginEmail').value.trim();
        var pass  = $('loginPass').value;
        $('loginErr').textContent = '';
        if (!email || !pass) { $('loginErr').textContent = 'يرجى ملء جميع الحقول'; return; }
        $('loginBtn').disabled = true;
        auth.signInWithEmailAndPassword(email, pass)
            .catch(function(err) {
                var msgs = { 'auth/user-not-found':'البريد غير مسجل', 'auth/wrong-password':'كلمة السر خاطئة', 'auth/invalid-email':'بريد إلكتروني غير صالح' };
                $('loginErr').textContent = msgs[err.code] || err.message;
            })
            .finally(() => $('loginBtn').disabled = false);
    };

    // Register
    $('registerBtn').onclick = function() {
        var name  = $('regName').value.trim();
        var phone = $('regPhone').value.trim();
        var email = $('regEmail').value.trim();
        var pass  = $('regPass').value;
        $('registerErr').textContent = '';
        if (!name||!phone||!email||!pass) { $('registerErr').textContent = 'يرجى ملء جميع الحقول'; return; }
        if (!/^09[0-9]{8}$/.test(phone)) { $('registerErr').textContent = 'رقم الهاتف غير صحيح، يجب أن يبدأ بـ 09 ويتكون من 10 أرقام مثل: 09XXXXXXXX'; return; }
        if (pass.length < 6) { $('registerErr').textContent = 'كلمة السر 6 أحرف على الأقل'; return; }
        $('registerBtn').disabled = true;
        _registering = true;   // الاسم والهاتف قادمان مع التسجيل — لا نعرض نافذة إكمال البيانات
        auth.createUserWithEmailAndPassword(email, pass)
            .then(function(cred) {
                var uid = cred.user.uid;
                return dbRef('users/' + uid).set({
                    uid, name, phone, email, balance: 0, createdAt: nowAr()
                }).then(function() {
                    notifyAdmin('user', 'مستخدم جديد 👤', name + ' — ' + email + ' — ' + phone, uid);
                });
            })
            .catch(function(err) {
                var msgs = { 'auth/email-already-in-use':'البريد مسجل مسبقاً', 'auth/invalid-email':'بريد غير صالح', 'auth/weak-password':'كلمة السر ضعيفة جداً' };
                $('registerErr').textContent = msgs[err.code] || err.message;
            })
            .finally(function() {
                $('registerBtn').disabled = false;
                _registering = false;
                checkProfileComplete();
            });
    };

    // ── إكمال بيانات الحساب (الاسم + الهاتف) ─────────────────────────────
    // حساب Google لا يعطينا رقم الهاتف، فنطلبه من أي مستخدم حسابه بلا رقم هاتف صحيح.
    var _registering  = false;
    var _profileOpen  = false;
    var PHONE_RE = /^09[0-9]{8}$/;

    function normalizePhone(v) {
        return String(v || '')
            .replace(/[٠-٩]/g, function(d) { return String(d.charCodeAt(0) - 0x0660); })
            .replace(/[۰-۹]/g, function(d) { return String(d.charCodeAt(0) - 0x06F0); })
            .replace(/[\s\-()]/g, '')
            .replace(/^\+?963/, '0')
            .replace(/^00963/, '0');
    }

    function profileIncomplete() {
        if (!currentUser || !userData || _registering) return false;
        if ((currentUser.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase()) return false;
        var name = String(userData.name || '').trim();
        return !PHONE_RE.test(normalizePhone(userData.phone)) || !name || name === 'مستخدم';
    }

    function checkProfileComplete() {
        if (profileIncomplete()) {
            if (_profileOpen) return;
            _profileOpen = true;
            var name = String(userData.name || '').trim();
            $('pfName').value  = (name && name !== 'مستخدم') ? name : (currentUser.displayName || '');
            $('pfPhone').value = userData.phone || '';
            $('pfErr').textContent = '';
            modalOn('profileOv', 'profileModal');
            setTimeout(function() { ($('pfName').value ? $('pfPhone') : $('pfName')).focus(); }, 300);
        } else {
            closeProfileModal();
        }
    }

    function closeProfileModal() {
        if (!_profileOpen) return;
        _profileOpen = false;
        modalOff('profileOv', 'profileModal');
    }

    function saveProfile() {
        var name  = $('pfName').value.trim();
        var phone = normalizePhone($('pfPhone').value);
        $('pfErr').textContent = '';
        if (name.length < 2) { $('pfErr').textContent = 'يرجى كتابة اسمك الكامل'; return; }
        if (!PHONE_RE.test(phone)) { $('pfErr').textContent = 'رقم الهاتف غير صحيح، يجب أن يبدأ بـ 09 ويتكون من 10 أرقام مثل: 09XXXXXXXX'; return; }
        if (!currentUser) return;
        var btn = $('pfSaveBtn');
        btn.disabled = true;
        var upd = { name: name, phone: phone };
        if (!userData || !userData.email) upd.email = currentUser.email || '';
        dbRef('users/' + currentUser.uid).update(upd)
            .then(function() {
                if (userData) { userData.name = name; userData.phone = phone; }
                closeProfileModal();
                showToast('تم حفظ بياناتك، أهلاً ' + name.split(' ')[0] + '!', 'success');
            })
            .catch(function(err) {
                $('pfErr').textContent = 'تعذّر الحفظ: ' + (err && err.message ? err.message : err);
            })
            .finally(function() { btn.disabled = false; });
    }

    $('pfSaveBtn').onclick = saveProfile;
    $('pfPhone').addEventListener('keydown', function(e) { if (e.key === 'Enter') saveProfile(); });
    $('pfName').addEventListener('keydown', function(e) { if (e.key === 'Enter') $('pfPhone').focus(); });
    $('pfLogoutBtn').onclick = function() { auth.signOut(); };

    // ── Wallet ───────────────────────────────────────────────────────────
    function getBalance() { return userData ? (parseFloat(userData.balance) || 0) : 0; }
    window.getBalance = getBalance;

    function refreshNavBal() {
        var bal = getBalance();
        var el = $('walletNavBal');
        if (el) el.textContent = bal.toFixed(2) + '$';
        // Update floating badge
        var fbalAmt = $('floatingBalAmt');
        if (fbalAmt) fbalAmt.textContent = bal.toFixed(2) + '$';
        // Update user menu balance
        var um = $('__userMenu');
        if (um) {
            var umBal = um.querySelector('.um-bal');
            if (umBal) umBal.innerHTML = '<i class="fas fa-wallet"></i> ' + bal.toFixed(2) + '$';
        }
        // Update account modal if open
        var accBal = $('accBalanceAmt');
        if (accBal) accBal.textContent = bal.toFixed(2) + ' $';
    }

    function refreshWalletModal() {
        if (!currentUser) return;
        $('walletBalDisplay').textContent = getBalance().toFixed(2) + ' $';
        refreshNavBal();
        dbRef('users/' + currentUser.uid + '/transactions').orderByChild('ts').limitToLast(60)
            .once('value', function(snap) {
                var txs = [];
                snap.forEach(function(c) { var v = c.val(); if (v && typeof v === 'object') txs.unshift(v); });
                // سجل الشحن يعرض فقط عمليات الشحن والاسترجاع — لا يعرض عمليات دفع الطلبات (debit)
                txs = txs.filter(function(t) { return t.type === 'credit'; }).slice(0, 30);
                var list = $('walletTxList');
                if (!txs.length) { list.innerHTML = '<div class="wallet-empty-tx">لا توجد عمليات شحن</div>'; return; }
                list.innerHTML = txs.map(function(t) {
                    var isRefund = t.txCategory === 'refund';
                    var refLine = '';
                    if (t.txId) {
                        refLine = '<div class="wtx-date" style="direction:ltr;text-align:right"><i class="fas fa-receipt"></i> رقم عملية شام كاش: ' + t.txId + '</div>';
                    }
                    return '<div class="wallet-tx-item">'
                        + '<div><div class="wtx-desc">' + (isRefund ? '<i class="fas fa-undo" style="color:#4fc3f7"></i> ' : '') + t.desc + '</div>'
                        + '<div class="wtx-date">' + t.date + '</div>'
                        + refLine
                        + '</div>'
                        + '<div style="text-align:left"><div class="wtx-amt cr">'
                        + '+' + Math.abs(t.amount).toFixed(2) + '$</div>'
                        + (t.status ? '<span class="tx-badge '+(t.status==='pending'?'pending':'done')+'">'+(t.status==='pending'?'قيد المراجعة':'مكتمل')+'</span>' : '')
                        + '</div></div>';
                }).join('');
            });
    }

    window.openWallet = function openWallet() {
        if (!currentUser) { openAuth('login'); return; }
        refreshWalletModal();
        modalOn('walletOv','walletModal');
    }


    // ══════════════════════════════════════════
    // My Account Modal — openAccountModal()
    // ══════════════════════════════════════════
    window.openAccountModal = function openAccountModal() {
        if (!currentUser) { openAuth('login'); return; }

        var uData = userData;
        var bal   = (uData && uData.balance) ? parseFloat(uData.balance) : 0;
        var initials = (uData && uData.name) ? uData.name.charAt(0) : (currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'U');

        // Fill header
        $('accAvatarLetter').textContent = initials;
        $('accDisplayName').textContent  = (uData && uData.name)  ? uData.name  : 'مستخدم';
        $('accDisplayEmail').textContent = currentUser.email || '—';
        $('accDisplayPhone').textContent = (uData && uData.phone) ? ('📞 ' + uData.phone) : '';
        $('accBalanceAmt').textContent   = bal.toFixed(2) + ' $';
        $('accInfoName').textContent     = (uData && uData.name)  ? uData.name  : '—';
        $('accInfoEmail').textContent    = currentUser.email || '—';
        $('accInfoPhone').textContent    = (uData && uData.phone) ? uData.phone : 'غير مضاف';
        $('accInfoDate').textContent     = (uData && uData.createdAt) ? uData.createdAt : '—';

        // Member level
        var memberEl = $('accMemberBadge');
        if (memberEl) {
            if      (bal >= 100) memberEl.textContent = 'ذهبي 🥇';
            else if (bal >= 30)  memberEl.textContent = 'فضي ⭐';
            else                 memberEl.textContent = 'عميل';
        }

        // Load stats
        dbRef('users/' + currentUser.uid + '/orders').once('value', function(snap) {
            var count = snap.exists() ? Object.keys(snap.val() || {}).length : 0;
            $('accOrderCount').textContent = count;
        });

        // Load transactions
        dbRef('users/' + currentUser.uid + '/transactions').orderByChild('ts').limitToLast(30)
            .once('value', function(snap) {
                var txs = [];
                snap.forEach(function(c) { var v = c.val(); if (v && typeof v === 'object') txs.unshift(v); });
                $('accTxCount').textContent = txs.length;

                var list = $('accTxList');
                if (!txs.length) {
                    list.innerHTML = '<div class="acc-tx-empty"><i class="fas fa-inbox" style="display:block;font-size:1.5rem;margin-bottom:.5rem;color:#ddd"></i>لا توجد معاملات بعد</div>';
                    return;
                }
                list.innerHTML = txs.slice(0, 5).map(function(tx) {
                    var isCredit = tx.type === 'credit';
                    var amtSign  = isCredit ? '+' : '-';
                    var amtVal   = parseFloat(tx.amount || 0).toFixed(2);
                    return '<div class="acc-tx-item">'
                        + '<div class="acc-tx-icon ' + (isCredit ? 'credit' : 'debit') + '">'
                        + '<i class="fas ' + (isCredit ? 'fa-arrow-down' : 'fa-arrow-up') + '"></i>'
                        + '</div>'
                        + '<div class="acc-tx-body">'
                        + '<div class="acc-tx-desc">' + (tx.desc || 'معاملة') + '</div>'
                        + '<div class="acc-tx-date">' + (tx.date || '') + '</div>'
                        + '</div>'
                        + '<div class="acc-tx-amount ' + (isCredit ? 'credit' : 'debit') + '">'
                        + amtSign + amtVal + '$'
                        + '</div>'
                        + '</div>';
                }).join('');
            });

        // Button actions
        $('accTopupBtn').onclick  = function() { modalOff('accountModalOv','accountModal'); openTopup(); };
        $('accWalletBtn').onclick = function() { modalOff('accountModalOv','accountModal'); openWallet(); };
        $('accOrdersBtn').onclick = function() { modalOff('accountModalOv','accountModal'); openOrdersHistory(); };
        $('accLogoutBtn').onclick = function() { modalOff('accountModalOv','accountModal'); auth.signOut(); };
        $('accModalClose').onclick = function() { modalOff('accountModalOv','accountModal'); };
        $('accountModalOv').onclick = function() { modalOff('accountModalOv','accountModal'); };

        modalOn('accountModalOv', 'accountModal');
    };

    $('walletClose').onclick = () => modalOff('walletOv','walletModal');
    $('walletOv').onclick    = () => modalOff('walletOv','walletModal');
    $('walletChargeBtn').onclick = () => { modalOff('walletOv','walletModal'); openTopup(); };

    // ── Topup ────────────────────────────────────────────────────────────
    window.openTopup = function openTopup() {
        if (!currentUser) { openAuth('login'); return; }
        ['tuName','tuPhone','tuAmount','tuTxId','tuNotes'].forEach(id => $(id).value = '');
        $('tuErr').className = 'topup-err';
        $('tuErr').textContent = '';
        if (userData) {
            if (userData.name)  $('tuName').value  = userData.name;
            if (userData.phone) $('tuPhone').value = userData.phone;
        }
        modalOn('topupOv','topupModal');
        // scroll to top smoothly on open
        setTimeout(function(){
            var body = document.querySelector('.topup-body');
            if(body) body.scrollTop = 0;
        }, 60);
    }

    $('topupClose').onclick = () => modalOff('topupOv','topupModal');
    $('topupOv').onclick    = () => modalOff('topupOv','topupModal');

    $('tuSubmitBtn').onclick = function() {
        var name   = $('tuName').value.trim();
        var phone  = $('tuPhone').value.trim();
        var amount = parseFloat($('tuAmount').value);
        var txId   = $('tuTxId').value.trim();
        var notes  = $('tuNotes').value.trim();
        var errEl  = $('tuErr');

        // دالة لعرض الخطأ وتمييز الحقل
        function showErr(msg, fieldId) {
            errEl.textContent = msg;
            errEl.className = 'topup-err show';
            ['tuName','tuPhone','tuAmount','tuTxId'].forEach(function(id){ $(id).classList.remove('input-error'); });
            if (fieldId) {
                $(fieldId).classList.add('input-error');
                $(fieldId).focus();
                // مرر للأعلى حتى يُرى الحقل والخطأ
                errEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        // إزالة تمييز الأخطاء القديمة
        ['tuName','tuPhone','tuAmount','tuTxId'].forEach(function(id){ $(id).classList.remove('input-error'); });

        if (!name)             { showErr('يرجى إدخال اسمك الكامل', 'tuName'); return; }
        if (!phone)            { showErr('يرجى إدخال رقم هاتفك', 'tuPhone'); return; }
        if (!/^09[0-9]{8}$/.test(phone)) { showErr('رقم الهاتف غير صحيح — يجب أن يبدأ بـ 09 ويتكون من 10 أرقام: 09XXXXXXXX', 'tuPhone'); return; }
        if (isNaN(amount)||amount<=0)     { showErr('يرجى إدخال مبلغ صحيح أكبر من صفر', 'tuAmount'); return; }
        if (!txId)             { showErr('يرجى إدخال رقم عملية شام كاش', 'tuTxId'); return; }
        if (!/^[0-9]{7,10}$/.test(txId)) { showErr('رقم عملية شام كاش غير صحيح — يجب أن يتكون من 7 إلى 10 أرقام فقط', 'tuTxId'); return; }

        errEl.className = 'topup-err';
        errEl.textContent = '';
        var btn = $('tuSubmitBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';

        var reqId = 'TU-' + Date.now();
        var ts    = nowAr();
        var email = currentUser.email || '';
        var order = {
            reqId, uid: currentUser.uid, name, phone, email, amount,
            txId, notes, date: ts, status: 'pending'
        };

        // Save topup request
        dbRef('topup_orders/' + reqId).set(order)
            .then(function() {
                // Save pending transaction in user profile
                return dbRef('users/' + currentUser.uid + '/transactions/' + reqId).set({
                    desc: 'شحن رصيد عبر شام كاش', date: ts,
                    amount, type: 'credit', status: 'pending', reqId, txId, txCategory: 'topup', ts: Date.now()
                });
            })
            .then(function() {
                notifyAdmin('topup', 'طلب شحن رصيد 💰', (name || email || 'زبون') + ' — ' + amount.toFixed(2) + '$ — رقم العملية: ' + txId, reqId);
                modalOff('topupOv','topupModal');
                $('successRef').textContent = 'رقم الطلب: ' + reqId + ' | المبلغ: ' + amount.toFixed(2) + '$';
                modalOn('successOv','successModal');
            })
            .catch(function(err) {
                errEl.textContent = 'حدث خطأ: ' + err.message;
                errEl.className = 'topup-err show';
            })
            .finally(function() {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال الطلب';
            });
    };

    $('successOkBtn').onclick = () => modalOff('successOv','successModal');
    $('successOv').onclick    = () => modalOff('successOv','successModal');

    // ── Orders history ───────────────────────────────────────────────────
    function openOrdersHistory() {
        if (!currentUser) { openAuth('login'); return; }
        $('ordersBody').innerHTML = '<div class="wallet-empty-tx"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>';
        modalOn('ordersOv','ordersModal');

        function renderOrders(orders) {
            if (!orders.length) {
                $('ordersBody').innerHTML = '<div class="wallet-empty-tx"><i class="fas fa-box-open" style="font-size:2rem;display:block;margin-bottom:.5rem"></i>لا توجد طلبات سابقة</div>';
                return;
            }
            var statusMap = { pending:'🕐 جديد', processing:'⚙️ قيد التنفيذ', done:'✅ منجز', rejected:'❌ مرفوض' };
            var statusColor = { pending:'#F7C873', processing:'#4fc3f7', done:'#2ECC71', rejected:'#E74C3C' };

            // يبني قائمة "التفاصيل الإضافية" لكل منتج حسب نوعه (رابط حساب، رقم هاتف، آيدي لاعب، بريد اشتراك...)
            function itemExtras(it) {
                var extras = [];
                if (it.playerId)       extras.push('<span><i class="fas fa-gamepad"></i> رقم اللاعب: <b>' + it.playerId + '</b></span>');
                if (it.gameValue)      extras.push('<span><i class="fas fa-coins"></i> الكمية: <b>' + it.gameValue + '</b></span>');
                if (it.appValue)       extras.push('<span><i class="fas fa-mobile-alt"></i> الباقة: <b>' + it.appValue + '</b></span>');
                if (it.phoneNumber)    extras.push('<span><i class="fas fa-phone"></i> الهاتف: <b>' + it.phoneNumber + '</b></span>');
                if (it.creditValue)    extras.push('<span><i class="fas fa-money-bill"></i> الرصيد: <b>' + it.creditValue + ' ل.س</b></span>');
                if (it.customQuantity) extras.push('<span><i class="fas fa-sort-amount-up"></i> الكمية: <b>' + parseInt(it.customQuantity).toLocaleString() + '</b></span>');
                if (it.accountUrl)     extras.push('<span style="direction:ltr;display:inline-block"><i class="fas fa-link"></i> ' + it.accountUrl + '</span>');
                if (it.socialLink)     extras.push('<span style="direction:ltr;display:inline-block"><i class="fas fa-link"></i> ' + it.socialLink + '</span>');
                if (it.premiumInput)   extras.push('<span><i class="fas fa-envelope"></i> البريد/البيانات المُدخلة: <b>' + it.premiumInput + '</b></span>');
                if (it.reqValue)       extras.push('<span style="direction:rtl"><i class="fas fa-info-circle"></i> ' + esc(it.reqLabel || 'المعلومة') + ': <b dir="auto">' + esc(it.reqValue) + '</b></span>');
                return extras;
            }

            $('ordersBody').innerHTML = orders.map(function(o) {
                var stClass = o.status || 'pending';
                var color = statusColor[stClass] || '#aaa';
                var itemsHtml = '';

                // items قد تصل كمصفوفة أو ككائن (حسب تخزين Firebase) — ندعم الحالتين
                var itemsRaw = o.items || o.products || [];
                var itemsArr = Array.isArray(itemsRaw) ? itemsRaw : (itemsRaw && typeof itemsRaw === 'object' ? Object.values(itemsRaw) : []);

                if (itemsArr.length) {
                    itemsHtml = itemsArr.map(function(item) {
                        var name = item.name || item.productName || '-';
                        var qty  = item.quantity || 1;
                        var price = parseFloat(item.price || item.totalItem || 0);
                        var extras = itemExtras(item);
                        return '<div class="order-item-row" style="flex-direction:column;align-items:flex-start;gap:.25rem;padding:.4rem 0;border-bottom:1px dashed #eee">'
                            + '<div style="display:flex;justify-content:space-between;width:100%">'
                            + '<span style="font-weight:700"><i class="fas fa-tag" style="color:#F7C873;font-size:.7rem"></i> ' + name + ' × ' + qty + '</span>'
                            + '<span>' + (price * qty).toFixed(2) + '$</span>'
                            + '</div>'
                            + (extras.length ? '<div style="font-size:.72rem;color:#666;display:flex;flex-wrap:wrap;gap:.5rem">' + extras.join('') + '</div>' : '')
                            + '</div>';
                    }).join('');
                }

                // عنوان البطاقة: اسم/أسماء المنتجات بدل رقم الطلب
                var titleText;
                if (itemsArr.length === 1) {
                    titleText = itemsArr[0].name || itemsArr[0].productName || ('طلب #' + (o.orderId||'-'));
                } else if (itemsArr.length > 1) {
                    var names = itemsArr.map(function(it){ return it.name || it.productName; }).filter(Boolean);
                    titleText = names.slice(0,2).join('، ') + (names.length > 2 ? ' +' + (names.length - 2) : '');
                } else {
                    titleText = 'طلب #' + (o.orderId||'-');
                }

                // بيانات إضافية على مستوى الطلب (بريد/مدينة/رابط حساب عام) إن وُجدت
                var orderExtras = [];
                if (o.email && o.email.trim())   orderExtras.push('<span><i class="fas fa-envelope"></i> البريد: <b>' + o.email + '</b></span>');
                if (o.city && o.city.trim() && o.city !== 'غير محدد') orderExtras.push('<span><i class="fas fa-map-marker-alt"></i> المدينة: <b>' + o.city + '</b></span>');
                if (o.accountUrl && o.accountUrl.trim()) orderExtras.push('<span style="direction:ltr;display:inline-block"><i class="fas fa-link"></i> ' + o.accountUrl + '</span>');

                return '<div class="order-card" style="border-right:3px solid ' + color + ';margin-bottom:.7rem;background:#fff;border-radius:10px;padding:.7rem .9rem">'
                    + '<div class="order-card-header" style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.4rem;gap:.5rem">'
                    + '<div><div class="order-card-title" style="font-weight:700;font-size:.88rem;color:#2A3F54">' + titleText + '</div>'
                    + '<div class="order-card-id" style="font-size:.68rem;color:#bbb">رقم الطلب: ' + (o.orderId||'-') + '</div>'
                    + '<div class="order-card-date" style="font-size:.72rem;color:#aaa">' + (o.date||'-') + '</div></div>'
                    + '<span style="white-space:nowrap;background:' + color + '20;color:' + color + ';border:1px solid ' + color + ';padding:.15rem .5rem;border-radius:20px;font-size:.72rem;font-weight:700">' + (statusMap[stClass]||stClass) + '</span>'
                    + '</div>'
                    + '<div class="order-card-body">'
                    + (itemsHtml || '<div style="color:#aaa;font-size:.75rem">لا تفاصيل منتجات</div>')
                    + (orderExtras.length ? '<div style="font-size:.72rem;color:#666;display:flex;flex-wrap:wrap;gap:.6rem;margin-top:.4rem;padding-top:.4rem;border-top:1px dashed #eee">' + orderExtras.join('') + '</div>' : '')
                    + '<div class="order-total-row" style="display:flex;justify-content:space-between;border-top:1px solid #eee;margin-top:.4rem;padding-top:.4rem;font-weight:700"><span>الإجمالي</span><span style="color:#E74C3C">' + parseFloat(o.total||0).toFixed(2) + '$</span></div>'
                    + '</div></div>';
            }).join('');
        }

        // محاولة أولى: البحث في store_orders بالـ uid
        dbRef('store_orders').orderByChild('uid').equalTo(currentUser.uid)
            .once('value', function(snap) {
                var orders = [];
                snap.forEach(function(c) { var v = c.val(); if (v && typeof v === 'object') orders.unshift(v); });
                if (orders.length) { renderOrders(orders); return; }

                // محاولة ثانية: قراءة من users/{uid}/orders
                dbRef('users/' + currentUser.uid + '/orders')
                    .once('value', function(snap2) {
                        var refs = [];
                        snap2.forEach(function(c) { var v = c.val(); if (v && typeof v === 'object') refs.push(v); });
                        if (!refs.length) { renderOrders([]); return; }

                        // جلب تفاصيل كل طلب من store_orders
                        var promises = refs.map(function(r) {
                            return dbRef('store_orders/' + r.orderId).once('value')
                                .then(function(s) { return s.val(); });
                        });
                        Promise.all(promises).then(function(results) {
                            var full = results.filter(Boolean).sort(function(a,b){ return (b.ts||0)-(a.ts||0); });
                            if (!full.length) {
                                // عرض البيانات المختصرة من users/orders كبديل
                                renderOrders(refs.sort(function(a,b){ return (b.ts||0)-(a.ts||0); }));
                            } else {
                                renderOrders(full);
                            }
                        });
                    });
            });
    }

    $('ordersClose').onclick = () => modalOff('ordersOv','ordersModal');
    $('ordersOv').onclick    = () => modalOff('ordersOv','ordersModal');

    // ── Intercept checkout to save to Firebase ───────────────────────────
    // We patch submitShamCashOrder so every order also saves to DB
    var _origSubmitShamCash = window.submitShamCashOrder;
    // Override via document event on form submit — we hook after original fires
    document.addEventListener('zoodny:orderSubmitted', function(e) {
        if (!currentUser) return;
        var detail = e.detail;
        var orderId = detail.orderId || ('ORD-' + Date.now());
        var total   = detail.total   || 0;
        var items   = detail.items   || [];
        var record  = {
            orderId, uid: currentUser.uid,
            name: detail.customerName || (userData && userData.name) || '',
            phone: detail.customerPhone || (userData && userData.phone) || '',
            city:  detail.city || '',
            items, total,
            paymentMethod: detail.paymentMethod || 'sham-cash',
            date: nowAr(), status: 'pending', ts: Date.now()
        };
        dbRef('store_orders/' + orderId).set(record);
        // save order ref in user profile
        dbRef('users/' + currentUser.uid + '/orders/' + orderId).set({ orderId, date: record.date, total, status: 'pending' });
    });

    // ── Balance guard — add to cart ──────────────────────────────────────
    document.addEventListener('click', function(e) {
        var btn = e.target.closest('.add-to-cart-btn');
        if (!btn) return;

        // Must be logged in
        if (!currentUser) {
            e.stopImmediatePropagation();
            balToast('سجّل دخولك أولاً للشراء');
            openAuth('login');
            return;
        }

        // Check balance vs product price
        var price = parseFloat(
            btn.getAttribute('data-price') ||
            btn.closest('[data-price]')?.getAttribute('data-price') || '0'
        );

        // If no data-price on button, try to read from nearest price element
        if (!price || price <= 0) {
            var card = btn.closest('.product-card, .card, [class*="card"]');
            if (card) {
                var priceEl = card.querySelector('[class*="price"], .product-price, .price');
                if (priceEl) {
                    price = parseFloat(priceEl.textContent.replace(/[^0-9.]/g,'')) || 0;
                }
            }
        }

        var bal = getBalance();
        if (price > 0 && bal < price) {
            e.stopImmediatePropagation();
            balToast(
                'رصيدك غير كافٍ! رصيدك: ' + bal.toFixed(2) +
                '$ والمطلوب: ' + price.toFixed(2) + '$'
            );
            return;
        }
    }, true);
}());
