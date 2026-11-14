/* ══════════════════════════════════════════════════════════════════════
 * بيع الجملة
 *  - المدير يفعّل الجملة لأي عميل من لوحة "العملاء" (users/{uid}/wholesale = true).
 *  - حساب الجملة يرى أسعار الجملة تلقائياً (product-manager.js يستبدل الأسعار عند حدث zoodny:wholesale).
 *  - باقي العملاء تظهر لهم رسالة "هل أنت صاحب محل؟ تواصل معنا" عند تسجيل الدخول.
 * ══════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';
    var ZA = window.ZoodnyAccount;
    var $ = ZA.$, esc = ZA.esc, ADMIN_EMAIL = ZA.ADMIN_EMAIL;
    var WHATSAPP = '963982199738';
    var PROMPT_EVERY = 3 * 24 * 3600 * 1000;   // للزيارات العادية: مرة كل 3 أيام كحد أقصى

    var state = { flag: false, uid: null, sawLoggedOut: false, promptShownFor: null };
    window.__zoodnyWholesale = false;

    function lsGet(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
    function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
    function isAdmin(user) { return !!user && String(user.email || '').toLowerCase() === String(ADMIN_EMAIL).toLowerCase(); }

    // ── شريط "أسعار الجملة مفعّلة" أعلى صفحة المنتجات ─────────────────────
    function renderBar() {
        var bar = $('wholesaleBar');
        if (!state.flag) { if (bar) bar.remove(); return; }
        if (bar) return;
        var title = $('categoryProductsTitle');
        if (!title || !title.parentNode) return;
        bar = document.createElement('div');
        bar.id = 'wholesaleBar';
        bar.className = 'wholesale-bar';
        bar.innerHTML = '<i class="fas fa-store"></i> تتسوق الآن بأسعار الجملة';
        title.parentNode.insertBefore(bar, title.nextSibling);
    }

    function setFlag(flag, user) {
        if (flag === state.flag) { renderBar(); return; }
        state.flag = flag;
        window.__zoodnyWholesale = flag;
        try { document.dispatchEvent(new CustomEvent('zoodny:wholesale', { detail: flag })); } catch (e) {}
        renderBar();
        if (flag && user) {
            var k = 'zoodnyWsToast_' + user.uid;
            try {
                if (!sessionStorage.getItem(k)) {
                    sessionStorage.setItem(k, '1');
                    if (typeof showToast === 'function') setTimeout(function () { showToast('🏪 أسعار الجملة مفعّلة على حسابك', 'success'); }, 1200);
                }
            } catch (e) {}
        }
    }

    // ── رسالة "هل أنت صاحب محل؟" ────────────────────────────────────────
    function profileReady(data) {
        var name = String((data && data.name) || '').trim();
        return !!data && /^09[0-9]{8}$/.test(String(data.phone || '').replace(/\s/g, '')) && name && name !== 'مستخدم';
    }

    var _tries = 0;
    function maybePrompt(user, data, freshLogin) {
        if (!user || !data || isAdmin(user) || data.wholesale === true) return;
        if (lsGet('zoodnyWsNever_' + user.uid, false)) return;
        if (state.promptShownFor === user.uid) return;
        if (!freshLogin && Date.now() - lsGet('zoodnyWsPromptTs_' + user.uid, 0) < PROMPT_EVERY) return;
        // ننتظر حتى يُكمل الزبون بياناته وتُغلق أي نافذة مفتوحة
        if (!profileReady(data) || document.body.classList.contains('modal-open')) {
            if (_tries++ < 30) setTimeout(function () { maybePrompt(auth.currentUser, window.userData, freshLogin); }, 2000);
            return;
        }
        if (!auth.currentUser || auth.currentUser.uid !== user.uid) return;
        state.promptShownFor = user.uid;
        lsSet('zoodnyWsPromptTs_' + user.uid, Date.now());
        showPrompt(user, data);
    }

    function showPrompt(user, data) {
        if ($('wsPromptOv')) return;
        var msg = 'مرحباً، أنا صاحب محل وأريد تفعيل أسعار الجملة على حسابي في زودني.'
            + '\nالاسم: ' + (data.name || '') + '\nالإيميل: ' + (data.email || user.email || '') + '\nالهاتف: ' + (data.phone || '');
        var ov = document.createElement('div');
        ov.id = 'wsPromptOv';
        ov.className = 'ws-prompt-ov';
        ov.innerHTML =
            '<div class="ws-prompt" role="dialog" aria-modal="true" aria-labelledby="wsPromptTitle">'
            + '<button type="button" class="ws-x" aria-label="إغلاق"><i class="fas fa-times"></i></button>'
            + '<div class="ws-ic"><i class="fas fa-store"></i></div>'
            + '<h3 id="wsPromptTitle">هل أنت صاحب محل أو متجر؟</h3>'
            + '<p>نوفّر <b>أسعار جملة خاصة</b> لأصحاب المحلات. تواصل معنا لتفعيل أسعار الجملة على حسابك.</p>'
            + '<a class="ws-wa" target="_blank" rel="noopener" href="https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msg) + '">'
            + '<i class="fab fa-whatsapp"></i> تواصل معنا عبر واتساب</a>'
            + '<button type="button" class="ws-later">لاحقاً</button>'
            + '<button type="button" class="ws-never">لست صاحب محل — لا تظهر هذه الرسالة مجدداً</button>'
            + '</div>';
        document.body.appendChild(ov);
        function close() { if (ov.parentNode) ov.parentNode.removeChild(ov); document.removeEventListener('keydown', onKey); }
        function onKey(e) { if (e.key === 'Escape') close(); }
        ov.querySelector('.ws-x').onclick = close;
        ov.querySelector('.ws-later').onclick = close;
        ov.querySelector('.ws-wa').addEventListener('click', function () { setTimeout(close, 300); });
        ov.querySelector('.ws-never').onclick = function () { lsSet('zoodnyWsNever_' + user.uid, true); close(); };
        ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
        document.addEventListener('keydown', onKey);
    }

    function closePrompt() { var ov = $('wsPromptOv'); if (ov) ov.parentNode.removeChild(ov); }

    // ── متابعة بيانات المستخدم (من core.js) ──────────────────────────────
    document.addEventListener('zoodny:userdata', function (e) {
        var user = e.detail && e.detail.user, data = e.detail && e.detail.data;
        if (!user) {
            state.sawLoggedOut = true;
            state.uid = null;
            state.promptShownFor = null;
            _tries = 0;
            closePrompt();
            setFlag(false, null);
            return;
        }
        var freshLogin = state.uid !== user.uid && state.sawLoggedOut;   // سجّل الدخول الآن (ليس استعادة جلسة)
        state.uid = user.uid;
        var flag = !!data && data.wholesale === true && !isAdmin(user);
        setFlag(flag, user);
        if (flag) closePrompt();
        else maybePrompt(user, data, freshLogin);
    });

    // الشريط يحتاج إعادة إضافة عند فتح أي قسم (العنوان يُعاد بناؤه أحياناً)
    var _origShow = window.showCategoryProducts;
    if (typeof _origShow === 'function') {
        window.showCategoryProducts = function () { var r = _origShow.apply(this, arguments); renderBar(); return r; };
    }
}());
