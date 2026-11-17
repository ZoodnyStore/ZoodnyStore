/* ══════════════════════════════════════════════════════════════════════
 * تحديث المتجر تلقائياً عند رفع نسخة جديدة على GitHub
 * - نقارن "بصمة" index.html (ETag من GitHub Pages) كل فترة، وعند دخول أي قسم، وعند العودة للصفحة.
 * - إن تغيّرت: نحدّث الملفات المخزّنة في المتصفح ثم نعيد تحميل الصفحة في لحظة لا تقاطع الزبون:
 *     • وهو في الصفحة الرئيسية بدون نوافذ مفتوحة ← فوراً مع الحفاظ على مكان التمرير
 *     • عند ضغطه على قسم ← نحدّث ونفتح له نفس القسم مباشرة بعد التحميل
 * (تحديث المنتجات والأسعار نفسها لحظي عبر Firebase — انظر product-manager.js)
 * ══════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';
    if (!/^https?:$/.test(location.protocol) || !window.fetch) return;

    var CHECK_EVERY = 3 * 60 * 1000;   // فحص دوري
    var MIN_GAP = 45 * 1000;           // أقل فاصل بين فحصين
    var KEY_REOPEN = 'zoodnyReopenCat', KEY_SCROLL = 'zoodnyReopenY', KEY_LAST = 'zoodnyUpdatedAt';

    var baseSig = null, pending = false, lastCheck = 0, reloading = false;

    function pageUrl() { return location.pathname.replace(/[^\/]*$/, '') + 'index.html'; }

    function fetchSig() {
        return fetch(pageUrl() + '?_=' + Date.now(), { method: 'HEAD', cache: 'no-store' })
            .then(function (r) { return r.ok ? (r.headers.get('etag') || r.headers.get('last-modified') || '') : ''; })
            .catch(function () { return ''; });
    }

    function busy() {
        if (typeof window.zoodnyStoreBusy === 'function' && window.zoodnyStoreBusy()) return true;
        if (typeof cart !== 'undefined' && cart && cart.length) return true;   // في منتصف طلب
        return false;
    }
    function onHome() {
        return typeof productsSection === 'undefined' || !productsSection || getComputedStyle(productsSection).display === 'none';
    }

    function check() {
        var now = Date.now();
        if (pending || reloading || now - lastCheck < MIN_GAP) return;
        lastCheck = now;
        fetchSig().then(function (sig) {
            if (!sig) return;
            if (baseSig === null) { baseSig = sig; return; }
            if (sig !== baseSig) { pending = true; maybeApply(); }
        });
    }

    // تحديث نسخ الملفات المخزّنة (GitHub Pages يخزّنها 10 دقائق) ثم إعادة التحميل
    function applyUpdate(reopenCat) {
        if (reloading) return;
        var last = Number(sessionStorage.getItem(KEY_LAST) || 0);
        if (Date.now() - last < 2 * 60 * 1000) { pending = false; return; }   // حماية من التكرار
        reloading = true;
        try {
            sessionStorage.setItem(KEY_LAST, String(Date.now()));
            if (reopenCat) sessionStorage.setItem(KEY_REOPEN, reopenCat);
            else sessionStorage.setItem(KEY_SCROLL, String(window.pageYOffset || 0));
        } catch (e) {}
        if (typeof showToast === 'function') showToast('جاري تحديث المتجر لآخر نسخة...', 'info');
        fetch(pageUrl(), { cache: 'reload' }).then(function (r) { return r.text(); }).then(function (html) {
            var urls = [], m, re = /<(?:script[^>]+src|link[^>]+href)="([^"]+)"/g;
            while ((m = re.exec(html))) {
                var u = m[1];
                if (/^(https?:)?\/\//.test(u) || !/\.(js|css)(\?|$)/.test(u)) continue;   // ملفات المتجر فقط
                urls.push(u);
            }
            return Promise.all(urls.map(function (u) { return fetch(u, { cache: 'reload' }).catch(function () {}); }));
        }).catch(function () {}).then(function () { location.reload(); });
    }

    function maybeApply() {
        if (!pending || reloading) return;
        if (onHome() && !busy()) applyUpdate(null);
    }

    // ── دخول قسم من الصفحة الرئيسية: إن وُجدت نسخة جديدة نحدّث ونفتح نفس القسم ──
    var origShow = window.showCategoryProducts;
    if (typeof origShow === 'function') {
        window.showCategoryProducts = function (categoryId) {
            if (pending && !reloading && typeof categoryId === 'string' && !busy()) { applyUpdate(categoryId); return; }
            var r = origShow.apply(this, arguments);
            check();
            return r;
        };
    }

    // بعد التحديث: نعيد الزبون لما كان عليه
    function restore() {
        var cat = null, y = null;
        try {
            cat = sessionStorage.getItem(KEY_REOPEN); sessionStorage.removeItem(KEY_REOPEN);
            y = sessionStorage.getItem(KEY_SCROLL); sessionStorage.removeItem(KEY_SCROLL);
        } catch (e) {}
        if (cat && typeof window.showCategoryProducts === 'function') {
            setTimeout(function () { try { window.showCategoryProducts(cat); } catch (e) {} }, 700);
        } else if (y) {
            setTimeout(function () { window.scrollTo(0, Number(y) || 0); }, 400);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        restore();
        check();
        setInterval(check, CHECK_EVERY);
        setInterval(maybeApply, 5000);
    });
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') check(); });
    // أي ضغطة تنقّل داخل المتجر (أقسام فرعية، عودة...) تفحص أيضاً — مع الفاصل الأدنى
    document.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('.category-card, .platform-card, .back-to-games, .back-to-platforms, .nav-links a')) check();
    }, true);
}());
