/* ══════════════════════════════════════════════════════════════════════
 * واجهة الدخول (الهيرو): عدد المنتجات الحقيقي بعدّاد متحرك + أزرار "تصفّح المتجر" و"اشحن رصيدك"
 * ══════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';
    function countProducts() {
        var n = 0;
        try {
            products.forEach(function (p) { if (p && p.category !== 'games' && p.category !== 'app') n++; });   // نسخ الألعاب والتطبيقات تُحسب من مصادرها
            gamesData.forEach(function (g) { n += (g.amounts || []).length || 1; });
            appsData.forEach(function () { n++; });
            [premiumActivationsData, vpnData, electronicPaymentData].forEach(function (arr) {
                arr.forEach(function (g) { n += (g.products || []).length || 1; });
            });
        } catch (e) {}
        return n;
    }
    function animateCount(el, to) {
        var shown = Math.max(10, Math.floor(to / 10) * 10);   // نعرض رقماً مدوّراً: +340
        var start = null, dur = 1400;
        function step(ts) {
            if (!start) start = ts;
            var p = Math.min(1, (ts - start) / dur), e = 1 - Math.pow(1 - p, 3);
            el.textContent = '+' + Math.round(shown * e);
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }
    function init() {
        var el = document.getElementById('heroProdCount');
        if (el) {
            var n = countProducts();
            if (n > 0) animateCount(el, n);
        }
        var shop = document.getElementById('heroShopBtn');
        if (shop) shop.addEventListener('click', function (e) {
            e.preventDefault();
            var cats = document.getElementById('categories');
            if (typeof backToCategoriesView === 'function' && typeof productsSection !== 'undefined' && productsSection.style.display === 'block') backToCategoriesView();
            if (cats) window.scrollTo({ top: cats.offsetTop - 70, behavior: 'smooth' });
        });
        var top = document.getElementById('heroTopupBtn');
        if (top) top.addEventListener('click', function () {
            if (typeof window.openTopup === 'function') window.openTopup();
            else if (typeof window.openAuth === 'function') window.openAuth('login');
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
}());
