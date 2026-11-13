/* ══════════════════════════════════════════════════════════════════════
 * الإشعارات
 *  - جرس في الشريط العلوي فيه كل إشعارات المستخدم + الإعلانات العامة.
 *  - إشعارات الجهاز (هاتف / ويندوز) عبر Notification API + Service Worker.
 *  - المدير: يستقبل إشعارات (طلب جديد، طلب شحن، مستخدم جديد).
 *
 *  مسارات Firebase:
 *    notifications/{uid}/{id}   إشعارات خاصة بالمستخدم (يكتبها المدير)
 *    admin_notifications/{id}   إشعارات المدير (يكتبها المستخدمون عند الطلب/الشحن/التسجيل)
 *    broadcasts/{id}            إعلانات عامة لكل الزوار (يكتبها المدير)
 *
 *  يصدّر window.ZoodnyNotify = { toUser, toAdmin, broadcast, requestPermission }
 * ══════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';
    var ZA = window.ZoodnyAccount;
    var $ = ZA.$, esc = ZA.esc, ADMIN_EMAIL = ZA.ADMIN_EMAIL;

    var LS_SHOWN    = 'zoodnyNotifShown';    // معرّفات الإشعارات التي عُرضت (لعدم تكرارها بين التبويبات)
    var LS_BC_READ  = 'zoodnyBcReadTs';      // آخر إعلان عام قرأه الزائر
    var LS_BC_SINCE = 'zoodnyBcSince';       // أول زيارة — لا نعرض إشعارات جهاز لإعلانات أقدم منها
    var LS_PROMPT   = 'zoodnyNotifPromptTs'; // آخر مرة عرضنا فيها شريط "فعّل الإشعارات"
    var MAX_AGE     = 3 * 24 * 3600 * 1000;  // إشعارات أقدم من 3 أيام لا تظهر كإشعار جهاز

    var state = { user: null, isAdmin: false, personal: [], broadcasts: [], ref: null, firstLoad: true, bcFirst: true, pendingOpen: null };

    function lsGet(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
    function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
    if (!lsGet(LS_BC_SINCE, 0)) lsSet(LS_BC_SINCE, Date.now());

    function toastSafe(msg, type) { if (typeof showToast === 'function') showToast(msg, type || 'info'); }
    function siteUrl() { return location.href.split('#')[0]; }

    // فتح إشعار من رابط (#notif=ID) — يأتي من الضغط على إشعار الجهاز والموقع مغلق
    if (location.hash.indexOf('#notif=') === 0) {
        state.pendingOpen = decodeURIComponent(location.hash.slice(7));
        try { history.replaceState(null, '', siteUrl()); } catch (e) {}
    }

    // ── Service Worker (ضروري لإشعارات أندرويد) ──────────────────────────
    if ('serviceWorker' in navigator && window.isSecureContext) {
        navigator.serviceWorker.register('sw.js').catch(function (e) { console.warn('SW register failed:', e && e.message); });
        navigator.serviceWorker.addEventListener('message', function (e) {
            var d = e.data || {};
            if (d.type === 'zoodny-notif-click') openItem(d.id);
        });
    }

    // ── صلاحية الإشعارات ────────────────────────────────────────────────
    function supported() { return 'Notification' in window; }
    function permission() { return supported() ? Notification.permission : 'unsupported'; }

    function requestPermission() {
        if (!supported()) {
            toastSafe('متصفحك لا يدعم الإشعارات. على آيفون: أضف الموقع إلى الشاشة الرئيسية أولاً', 'error');
            return Promise.resolve('unsupported');
        }
        var p;
        try { p = Notification.requestPermission(); } catch (e) { p = null; }
        return Promise.resolve(p).then(function (res) {
            res = res || Notification.permission;
            hidePrompt();
            renderPanel();
            if (res === 'granted') {
                toastSafe('تم تفعيل الإشعارات ✓', 'success');
                ensurePush();
                sysNotify({ id: 'welcome-' + Date.now(), title: 'زودني', body: 'تم تفعيل الإشعارات — ستصلك هنا تحديثات طلباتك' });
            } else if (res === 'denied') {
                toastSafe('الإشعارات محظورة — يمكنك تفعيلها من إعدادات المتصفح', 'error');
            }
            return res;
        });
    }

    // إشعار على مستوى الجهاز
    function sysNotify(it) {
        if (permission() !== 'granted') return;
        var title = it.title || 'زودني';
        var opts = {
            body: it.body || '', icon: 'images/logo.jpg', badge: 'images/logo.jpg',
            tag: 'zoodny-' + it.id, dir: 'rtl', lang: 'ar',
            data: { id: it.id, url: siteUrl() + '#notif=' + encodeURIComponent(it.id) }
        };
        function fallback() {
            try {
                var n = new Notification(title, opts);   // ويندوز/كمبيوتر (أندرويد لا يدعم هذا ويستخدم SW)
                n.onclick = function () { window.focus(); openItem(it.id); n.close(); };
            } catch (e) {}
        }
        if ('serviceWorker' in navigator && navigator.serviceWorker.getRegistration) {
            navigator.serviceWorker.getRegistration().then(function (reg) {
                if (reg && reg.active && reg.showNotification) return reg.showNotification(title, opts).catch(fallback);
                fallback();
            }, fallback);
        } else {
            fallback();
        }
    }

    function markShown(id) {
        var a = lsGet(LS_SHOWN, []);
        if (!Array.isArray(a)) a = [];
        if (a.indexOf(id) !== -1) return false;
        a.push(id);
        if (a.length > 300) a = a.slice(-300);
        lsSet(LS_SHOWN, a);
        return true;
    }

    // ── البيانات ───────────────────────────────────────────────────────
    function norm(id, v, kind) {
        return {
            id: kind + ':' + id, key: id, kind: kind, type: v.type || (kind === 'b' ? 'broadcast' : 'info'),
            title: String(v.title || 'زودني'), body: String(v.body || ''), ts: Number(v.ts) || 0,
            read: v.read === true, ref: v.ref || '', url: v.url || ''
        };
    }
    function isUnread(it) { return it.kind === 'b' ? it.ts > lsGet(LS_BC_READ, 0) : !it.read; }

    function allItems() {
        var arr = state.personal.slice();
        if (!state.isAdmin) arr = arr.concat(state.broadcasts);
        return arr.sort(function (a, b) { return b.ts - a.ts; });
    }

    // إشعارات جديدة وصلت: إشعار جهاز إن كانت الصفحة بالخلفية، أو تنبيه داخل الصفحة إن كانت ظاهرة
    function announce(list, initial) {
        var now = Date.now();
        var since = lsGet(LS_BC_SINCE, 0);
        var fresh = list.filter(function (it) {
            if (!isUnread(it) || now - it.ts > MAX_AGE) return false;
            if (it.kind === 'b' && it.ts < since) return false;
            return markShown(it.id);
        });
        if (!fresh.length) return;
        var hidden = document.visibilityState === 'hidden';
        if (initial) {
            fresh.sort(function (a, b) { return b.ts - a.ts; });
            if (hidden) fresh.slice(0, 3).forEach(sysNotify);
            else toastSafe(fresh.length === 1 ? ('🔔 ' + fresh[0].title + ': ' + fresh[0].body) : ('🔔 لديك ' + fresh.length + ' إشعارات جديدة'), 'info');
        } else {
            fresh.forEach(function (it) {
                if (hidden) sysNotify(it);
                else toastSafe('🔔 ' + it.title + (it.body ? ': ' + it.body : ''), 'info');
            });
        }
    }

    function detach() {
        if (state.ref) { try { state.ref.off(); } catch (e) {} }
        state.ref = null;
        state.personal = [];
    }

    function attach(user) {
        detach();
        state.user = user || null;
        state.isAdmin = !!user && String(user.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase();
        state.firstLoad = true;
        if (user) {
            var path = state.isAdmin ? 'admin_notifications' : 'notifications/' + user.uid;
            var kind = state.isAdmin ? 'a' : 'p';
            var ref = db.ref(path).limitToLast(60);
            state.ref = ref;
            ref.on('value', function (snap) {
                if (state.ref !== ref) return;
                var list = [];
                snap.forEach(function (c) { var v = c.val(); if (v && typeof v === 'object') list.push(norm(c.key, v, kind)); });
                state.personal = list;
                announce(list, state.firstLoad);
                state.firstLoad = false;
                render();
                tryPending();
            }, function (err) { console.warn('notifications read failed:', err && err.message); });
            setTimeout(maybePrompt, 2500);
        }
        render();
    }

    // الإعلانات العامة — للجميع (حتى غير المسجلين)
    db.ref('broadcasts').limitToLast(20).on('value', function (snap) {
        var list = [];
        snap.forEach(function (c) { var v = c.val(); if (v && typeof v === 'object') list.push(norm(c.key, v, 'b')); });
        state.broadcasts = list;
        if (!state.isAdmin) announce(list, state.bcFirst);
        state.bcFirst = false;
        render();
        tryPending();
    }, function (err) { console.warn('broadcasts read failed:', err && err.message); });

    auth.onAuthStateChanged(function (user) { attach(user); });

    // ── فتح إشعار ──────────────────────────────────────────────────────
    function findItem(id) {
        var all = state.personal.concat(state.broadcasts);
        for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
        return null;
    }
    function tryPending() {
        if (!state.pendingOpen) return;
        var it = findItem(state.pendingOpen);
        if (it) { state.pendingOpen = null; openItem(it.id); }
    }

    function openItem(id) {
        var it = findItem(id);
        if (!it) { state.pendingOpen = id; return; }
        closePanel();
        markRead([it]);
        if (it.kind === 'a') {
            var panel = { order: 'orders', topup: 'topups', user: 'users' }[it.type] || 'orders';
            if (typeof window.openAdminPanel === 'function') window.openAdminPanel(panel);
            return;
        }
        if (it.kind === 'p') {
            if (it.type === 'order' && typeof ZA.openOrdersHistory === 'function') ZA.openOrdersHistory();
            else if ((it.type === 'topup' || it.type === 'balance') && typeof window.openWallet === 'function') window.openWallet();
            return;
        }
        // إعلان عام
        if (it.url) {
            if (/^#/.test(it.url)) location.hash = it.url;
            else if (/^https?:\/\//i.test(it.url)) {
                if (it.url.indexOf(location.origin) === 0) location.href = it.url;
                else window.open(it.url, '_blank', 'noopener');
            }
        } else {
            var cats = document.getElementById('categories');
            if (cats) window.scrollTo({ top: cats.offsetTop - 80, behavior: 'smooth' });
        }
    }

    function markRead(list) {
        var bcMax = lsGet(LS_BC_READ, 0), bcChanged = false;
        var upd = {}, n = 0;
        list.forEach(function (it) {
            if (!isUnread(it)) return;
            if (it.kind === 'b') { if (it.ts > bcMax) { bcMax = it.ts; bcChanged = true; } return; }
            it.read = true;
            var base = it.kind === 'a' ? 'admin_notifications/' : 'notifications/' + (state.user ? state.user.uid : '') + '/';
            upd[base + it.key + '/read'] = true;
            n++;
        });
        if (bcChanged) lsSet(LS_BC_READ, bcMax);
        if (n && state.user) db.ref().update(upd).catch(function (e) { console.warn('mark read failed:', e && e.message); });
        render();
    }

    // ── الواجهة: الجرس + القائمة ────────────────────────────────────────
    var bell = $('notifBell'), badge = $('notifBadge');
    var panelEl = document.createElement('div');
    panelEl.className = 'notif-panel';
    panelEl.id = 'notifPanel';
    panelEl.setAttribute('role', 'dialog');
    panelEl.setAttribute('aria-label', 'الإشعارات');
    document.body.appendChild(panelEl);

    var typeIcon = {
        order: 'fa-box', topup: 'fa-wallet', balance: 'fa-coins', user: 'fa-user-plus',
        broadcast: 'fa-bullhorn', info: 'fa-bell'
    };

    function timeAgo(ts) {
        if (!ts) return '';
        var s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
        if (s < 60) return 'الآن';
        var m = Math.floor(s / 60); if (m < 60) return 'منذ ' + m + ' د';
        var h = Math.floor(m / 60); if (h < 24) return 'منذ ' + h + ' س';
        var d = Math.floor(h / 24); if (d < 30) return 'منذ ' + d + ' يوم';
        return new Date(ts).toLocaleDateString('ar-SY');
    }

    function render() {
        var count = allItems().filter(isUnread).length;
        if (badge) {
            badge.textContent = count > 99 ? '99+' : String(count);
            badge.style.display = count ? 'flex' : 'none';
        }
        if (bell) bell.setAttribute('aria-label', 'الإشعارات' + (count ? ' (' + count + ' جديد)' : ''));
        if (panelEl.classList.contains('open')) renderPanel();
    }

    var _panelUnread = {};
    function renderPanel() {
        var items = allItems();
        var perm = permission();
        var permHtml = '';
        if (perm === 'default') {
            permHtml = '<button type="button" class="notif-perm-btn" id="notifPermBtn"><i class="fas fa-bell"></i> تفعيل الإشعارات على جهازي</button>';
        } else if (perm === 'denied') {
            permHtml = '<div class="notif-perm-note"><i class="fas fa-bell-slash"></i> الإشعارات محظورة على هذا الجهاز — فعّلها من إعدادات المتصفح للموقع</div>';
        } else if (perm === 'unsupported') {
            permHtml = '<div class="notif-perm-note"><i class="fas fa-info-circle"></i> متصفحك لا يدعم إشعارات الجهاز (على آيفون: أضف الموقع إلى الشاشة الرئيسية)</div>';
        } else {
            permHtml = '<div class="notif-perm-note ok"><i class="fas fa-check-circle"></i> إشعارات الجهاز مفعّلة</div>';
        }
        var guestHint = state.user ? '' : '<div class="notif-perm-note"><i class="fas fa-user"></i> سجّل الدخول لتصلك إشعارات طلباتك ورصيدك</div>';

        var listHtml = items.length ? items.map(function (it) {
            var unread = _panelUnread[it.id];
            return '<button type="button" class="notif-item' + (unread ? ' unread' : '') + '" data-id="' + esc(it.id) + '">'
                + '<span class="notif-ic t-' + esc(it.type) + '"><i class="fas ' + (typeIcon[it.type] || 'fa-bell') + '"></i></span>'
                + '<span class="notif-tx"><b>' + esc(it.title) + '</b>'
                + (it.body ? '<span class="notif-bd">' + esc(it.body) + '</span>' : '')
                + '<span class="notif-tm">' + esc(timeAgo(it.ts)) + (it.kind === 'b' ? ' · إعلان' : '') + '</span></span>'
                + (unread ? '<span class="notif-dot"></span>' : '')
                + '</button>';
        }).join('') : '<div class="notif-empty"><i class="far fa-bell"></i>لا توجد إشعارات</div>';

        panelEl.innerHTML =
            '<div class="notif-head"><b><i class="fas fa-bell"></i> ' + (state.isAdmin ? 'إشعارات المدير' : 'الإشعارات') + '</b>'
            + '<button type="button" class="notif-close" id="notifCloseBtn" aria-label="إغلاق"><i class="fas fa-times"></i></button></div>'
            + permHtml + guestHint
            + '<div class="notif-list">' + listHtml + '</div>';

        var pb = $('notifPermBtn');
        if (pb) pb.onclick = function () { requestPermission(); };
        $('notifCloseBtn').onclick = closePanel;
        panelEl.querySelectorAll('.notif-item').forEach(function (b) {
            b.onclick = function () { openItem(b.getAttribute('data-id')); };
        });
    }

    function openPanel() {
        _panelUnread = {};
        allItems().forEach(function (it) { if (isUnread(it)) _panelUnread[it.id] = true; });
        panelEl.classList.add('open');
        renderPanel();
        // فتح القائمة = قراءة كل الإشعارات (تبقى مميزة بلون حتى تُغلق القائمة)
        markRead(allItems());
    }
    function closePanel() { panelEl.classList.remove('open'); }

    if (bell) {
        bell.addEventListener('click', function (e) {
            e.stopPropagation();
            if (panelEl.classList.contains('open')) closePanel(); else openPanel();
        });
    }
    document.addEventListener('click', function (e) {
        if (!panelEl.classList.contains('open')) return;
        if (panelEl.contains(e.target) || (bell && bell.contains(e.target))) return;
        closePanel();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanel(); });

    // ── شريط "فعّل الإشعارات" (مرة كل 3 أيام كحد أقصى) ──────────────────
    var _promptTries = 0;
    function maybePrompt() {
        if (!state.user || permission() !== 'default') return;
        if (Date.now() - lsGet(LS_PROMPT, 0) < 3 * 24 * 3600 * 1000) return;
        if ($('notifPrompt')) return;
        // لا نزاحم نافذة إكمال البيانات أو أي نافذة مفتوحة
        if (document.body.classList.contains('modal-open') && _promptTries < 10) { _promptTries++; setTimeout(maybePrompt, 4000); return; }
        lsSet(LS_PROMPT, Date.now());
        var bar = document.createElement('div');
        bar.id = 'notifPrompt';
        bar.className = 'notif-prompt';
        bar.innerHTML = '<i class="fas fa-bell"></i><div class="np-tx"><b>فعّل الإشعارات</b><span>'
            + (state.isAdmin ? 'ليصلك إشعار فور وصول طلب أو شحن رصيد أو تسجيل مستخدم جديد' : 'ليصلك إشعار عند تنفيذ طلبك وشحن رصيدك وبالعروض الجديدة')
            + '</span></div><button type="button" class="np-yes">تفعيل</button><button type="button" class="np-no" aria-label="لاحقاً">لاحقاً</button>';
        document.body.appendChild(bar);
        bar.querySelector('.np-yes').onclick = function () { requestPermission(); };
        bar.querySelector('.np-no').onclick = hidePrompt;
    }
    function hidePrompt() { var b = $('notifPrompt'); if (b) b.remove(); }

    // ── واجهة عامة لباقي الملفات ────────────────────────────────────────
    function clean(o) {
        var out = {};
        Object.keys(o).forEach(function (k) { if (o[k] !== undefined && o[k] !== null) out[k] = o[k]; });
        return out;
    }
    // يكتب الإشعار ويُرجع مفتاحه (أو null إن فشل) — لا يرمي أخطاء أبداً
    function safePush(path, val) {
        try {
            var ref = db.ref(path).push();
            return Promise.resolve(ref.set(clean(val))).then(function () { return ref.key; }, function (e) {
                console.warn('notification write failed (' + path + '):', e && e.message);
                return null;
            });
        } catch (e) {
            console.warn('notification write failed:', e && e.message);
            return Promise.resolve(null);
        }
    }

    // ══ إشعارات والموقع مغلق: Firebase Cloud Messaging + Cloudflare Worker ══
    var push = { workerUrl: '', vapidKey: '', token: null, tokenKey: null, tokenUid: null, busy: false };

    function workerBase() { return String(push.workerUrl || '').replace(/\/+$/, ''); }

    // طلب "بسيط" (text/plain) لتفادي طلب CORS المسبق، مع keepalive ليكتمل حتى لو انتقلت الصفحة
    function callWorker(path, payload, keepalive) {
        var base = workerBase();
        if (!base) return Promise.resolve({ ok: false, error: 'not-configured' });
        return fetch(base + path, {
            method: 'POST', mode: 'cors', keepalive: !!keepalive,
            headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
            body: JSON.stringify(payload)
        }).then(function (r) {
            return r.json().catch(function () { return { ok: r.ok }; }).then(function (j) { j.httpStatus = r.status; return j; });
        }).catch(function (e) { return { ok: false, error: e && e.message ? e.message : String(e) }; });
    }

    // يطلب من المُرسل إرسال إشعار موجود في قاعدة البيانات (المُرسل يقرأ النص بنفسه)
    function pushNotify(kind, id, uid) {
        if (!workerBase() || !id || !auth.currentUser) return Promise.resolve({ ok: false, error: 'not-configured' });
        return auth.currentUser.getIdToken().then(function (idToken) {
            return callWorker('/notify', { kind: kind, id: id, uid: uid || '', idToken: idToken }, true);
        }).then(function (r) {
            if (r && r.ok === false && r.error !== 'not-configured') console.warn('push notify failed:', r.error || r);
            return r;
        }, function (e) { console.warn('push notify failed:', e && e.message); return { ok: false }; });
    }

    function sha256Hex(s) {
        if (!(window.crypto && crypto.subtle)) {
            var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
            return Promise.resolve('t' + (h >>> 0).toString(16) + s.length);
        }
        return crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)).then(function (buf) {
            return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('').slice(0, 40);
        });
    }

    function messagingSupported() {
        if (typeof firebase === 'undefined' || typeof firebase.messaging !== 'function') return Promise.resolve(false);
        if (!('serviceWorker' in navigator) || !('PushManager' in window) || !window.isSecureContext) return Promise.resolve(false);
        try {
            var s = firebase.messaging.isSupported ? firebase.messaging.isSupported() : true;
            return Promise.resolve(s).catch(function () { return false; });
        } catch (e) { return Promise.resolve(false); }
    }

    // تسجيل هذا الجهاز لاستقبال الإشعارات (يُستدعى عند التفعيل وعند كل دخول)
    function ensurePush() {
        if (push.busy || permission() !== 'granted' || !workerBase() || !push.vapidKey) return Promise.resolve(false);
        push.busy = true;
        return messagingSupported().then(function (ok) {
            if (!ok) return false;
            return navigator.serviceWorker.ready.then(function (reg) {
                return firebase.messaging().getToken({ vapidKey: push.vapidKey, serviceWorkerRegistration: reg });
            }).then(function (token) {
                if (!token) return false;
                return sha256Hex(token).then(function (key) {
                    var tasks = [];
                    var user = auth.currentUser;
                    // ربط الجهاز بالحساب الحالي (لإشعارات الطلبات والرصيد)
                    if (user && (push.token !== token || push.tokenUid !== user.uid)) {
                        tasks.push(db.ref('push_tokens/' + user.uid + '/' + key).set({
                            token: token, ts: Date.now(), ua: String(navigator.userAgent || '').slice(0, 120)
                        }).then(function () { push.tokenUid = user.uid; }, function (e) { console.warn('save push token failed:', e && e.message); }));
                    }
                    // اشتراك الجهاز في الإعلانات العامة (مرة لكل رمز)
                    if (lsGet('zoodnyPushSub', '') !== token) {
                        tasks.push(callWorker('/subscribe', { token: token }).then(function (r) {
                            if (r && r.ok) lsSet('zoodnyPushSub', token);
                            else console.warn('push subscribe failed:', r && r.error);
                        }));
                    }
                    push.token = token; push.tokenKey = key;
                    return Promise.all(tasks).then(function () { return true; });
                });
            });
        }).catch(function (e) {
            console.warn('push setup failed:', e && e.message ? e.message : e);
            return false;
        }).then(function (r) { push.busy = false; return r; });
    }

    // قبل تسجيل الخروج: نفصل هذا الجهاز عن الحساب حتى لا تصل إشعارات الحساب لمن يستخدم الجهاز بعده
    if (typeof auth.signOut === 'function') {
        var _origSignOut = auth.signOut.bind(auth);
        auth.signOut = function () {
            var u = auth.currentUser;
            var p = (u && push.tokenKey && push.tokenUid === u.uid)
                ? db.ref('push_tokens/' + u.uid + '/' + push.tokenKey).remove().catch(function () {})
                : Promise.resolve();
            push.tokenUid = null;
            return p.then(function () { return _origSignOut(); });
        };
    }

    // إعدادات المُرسل يحفظها المدير من لوحة التحكم (config/push)
    db.ref('config/push').on('value', function (snap) {
        var v = snap.val() || {};
        push.workerUrl = typeof v.workerUrl === 'string' ? v.workerUrl : '';
        push.vapidKey  = typeof v.vapidKey === 'string' ? v.vapidKey : '';
        ensurePush();
    }, function () {});

    auth.onAuthStateChanged(function (user) { if (user) setTimeout(ensurePush, 1500); });

    window.ZoodnyNotify = {
        // يستخدمها المدير: إشعار لمستخدم محدد
        toUser: function (uid, n) {
            if (!uid || uid === 'guest') return Promise.resolve(null);
            return safePush('notifications/' + uid, { type: n.type || 'info', title: n.title || 'زودني', body: n.body || '', ref: n.ref || '', read: false, ts: Date.now() })
                .then(function (key) { if (key) pushNotify('p', key, uid); return key; });
        },
        // يستخدمها المستخدم: إشعار للمدير (طلب جديد / شحن / تسجيل)
        toAdmin: function (n) {
            var u = auth.currentUser;
            if (!u) return Promise.resolve(null);
            return safePush('admin_notifications', { uid: u.uid, type: n.type || 'info', title: n.title || 'زودني', body: n.body || '', ref: n.ref || '', read: false, ts: Date.now() })
                .then(function (key) { if (key) pushNotify('a', key); return key; });
        },
        // يستخدمها المدير: إعلان لكل الزوار
        broadcast: function (n) {
            var ref = db.ref('broadcasts').push();
            return Promise.resolve(ref.set(clean({ title: n.title, body: n.body || '', url: n.url || '', ts: Date.now() })))
                .then(function () { pushNotify('b', ref.key); return ref.key; });
        },
        requestPermission: requestPermission,
        // للوحة المدير: حالة الإعداد + إشعار تجريبي
        pushStatus: function () {
            return { configured: !!(workerBase() && push.vapidKey), permission: permission(), deviceRegistered: !!push.token, accountLinked: !!push.tokenUid };
        },
        ensurePush: ensurePush,
        testPush: function () {
            return ensurePush().then(function () {
                if (!auth.currentUser) return { ok: false, error: 'سجّل الدخول أولاً' };
                return auth.currentUser.getIdToken().then(function (idToken) { return callWorker('/notify', { kind: 'test', idToken: idToken }); });
            });
        },
        pingWorker: function (url) {
            return fetch(String(url).replace(/\/+$/, '') + '/', { method: 'GET', mode: 'cors' })
                .then(function (r) { return r.json(); })
                .catch(function (e) { return { ok: false, error: e && e.message ? e.message : String(e) }; });
        }
    };
}());
