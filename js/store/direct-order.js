/* ══════════════════════════════════════════════════════════════════════
 * الطلب المباشر (بدون سلة)
 * كل زر "طلب" يُدخل المنتج إلى cart داخلياً (نفس كود الإضافة القديم)، ثم نُتمّ الطلب فوراً:
 *   - إن جاء المنتج من نافذة إدخال (رابط/كمية/رقم لاعب/معلومة مطلوبة) وضغط الزبون "طلب" ← يُرسل الطلب مباشرة.
 *   - منتج بلا أي إدخال (ضغطة واحدة على البطاقة) ← نافذة تأكيد قصيرة (السعر + الرصيد + زر "طلب")
 *     حتى لا يُخصم المال بلمسة خاطئة.
 * الطلب يُحفظ بنفس طريقة الطلب السابقة (window.zoodnyPlaceOrder في main.js) ويصل للمدير مع الإشعار.
 * ══════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // أزرار "طلب" داخل نوافذ الإدخال (الزبون أدخل بياناته ورأى السعر)
    var FORM_BUTTONS = '#svcConfirmBtn, #confirmQuantityBtn, #confirmCreditBtn, #confirmAppBtn, #confirmGameBtn, #confirmPremiumBtn, #confirmDesignEmailBtn';
    var formTs = 0;
    var scheduled = false, placing = false;

    function clearCart() {
        if (typeof cart === 'undefined') return;
        cart.splice(0, cart.length);
        try { localStorage.removeItem('zoodnyCart'); } catch (e) {}
    }

    function toast(msg, type) { if (typeof showToast === 'function') showToast(msg, type); }

    function reqBusy() { return typeof window.zoodnyReqBusy === 'function' && window.zoodnyReqBusy(); }
    function missingReq() {
        var get = window.zoodnyGetProductReq;
        return typeof get === 'function' && cart.some(function (l) { return get(l) && !l.reqValue; });
    }

    function paymentOpen() {
        var pm = document.getElementById('paymentModal');
        return !!pm && pm.classList.contains('active') && pm.style.display !== 'none';
    }

    function handleResult(r) {
        placing = false;
        if (r.ok) return;
        if (r.reason === 'login') {
            clearCart();
            toast('سجّل دخولك أولاً لإتمام الطلب', 'warn');
            if (window.openAuth) window.openAuth('login');
        } else if (r.reason === 'balance') {
            clearCart();
            toast('رصيدك غير كافٍ! رصيدك: ' + r.bal.toFixed(2) + '$ والمطلوب: ' + r.total.toFixed(2) + '$', 'error');
            if (typeof window.openTopup === 'function') setTimeout(window.openTopup, 1400);
        } else if (r.reason === 'error') {
            clearCart();
            toast('تعذّر إتمام الطلب، حاول مجدداً', 'error');
        }
    }

    function placeNow() {
        if (placing) return;
        placing = true;
        window.zoodnyPlaceOrder().then(handleResult, function () { placing = false; clearCart(); });
    }

    function maybeOrder() {
        if (scheduled || placing || typeof cart === 'undefined' || !cart.length) return;
        scheduled = true;
        setTimeout(function () {
            scheduled = false;
            if (placing || !cart.length || reqBusy() || missingReq() || paymentOpen()) return;
            if (typeof window.zoodnyPlaceOrder !== 'function') return;
            // دخول مطلوب قبل أي شيء
            if (typeof auth !== 'undefined' && !auth.currentUser) { handleResult({ ok: false, reason: 'login' }); return; }
            var viaForm = cart.every(function (l) { return l.__viaForm; });
            if (viaForm) placeNow();
            else if (typeof window.zoodnyOpenConfirm === 'function') window.zoodnyOpenConfirm();
        }, 0);
    }

    // نعلّم المنتجات التي أُضيفت عبر نافذة إدخال (خلال لحظة من الضغط على "طلب" فيها)
    document.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest(FORM_BUTTONS)) formTs = Date.now();
    }, true);

    // رسائل "تمت الإضافة للسلة" القديمة لم تعد صحيحة — نخفيها
    if (typeof window.showToast === 'function') {
        var _toast = window.showToast;
        window.showToast = function (msg) {
            if (typeof msg === 'string' && /السلة/.test(msg)) return;
            return _toast.apply(this, arguments);
        };
    }

    function install() {
        // سلة محفوظة من زيارة سابقة (قبل إلغاء السلة) ← لا نطلبها تلقائياً
        clearCart();
        if (typeof window.updateCartUI === 'function' && !window.updateCartUI.__directWrapped) {
            var orig = window.updateCartUI;
            var w = function () {
                if (formTs && Date.now() - formTs < 1500 && typeof cart !== 'undefined') {
                    cart.forEach(function (l) { if (l && !l.__seenDirect) l.__viaForm = true; });
                }
                if (typeof cart !== 'undefined') cart.forEach(function (l) { if (l) l.__seenDirect = true; });
                var r = orig.apply(this, arguments);
                try { maybeOrder(); } catch (e) { console.error('direct order', e); }
                return r;
            };
            w.__directWrapped = true;
            w.__reqWrapped = orig.__reqWrapped;
            window.updateCartUI = w;
        }
        // إغلاق نافذة التأكيد بدون طلب ← نُلغي المنتج حتى لا يدخل في طلب لاحق
        var close = document.getElementById('paymentClose');
        if (close) close.addEventListener('click', function () { if (!placing) clearCart(); });
    }
    // بعد main.js (يستبدل updateCartUI) و requirements.js (يلفّها) — كلاهما على DOMContentLoaded
    document.addEventListener('DOMContentLoaded', install);
}());
