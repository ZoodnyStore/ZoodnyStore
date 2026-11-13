/* ══════════════════════════════════════════════════════════════════════
 * مسارات الصور
 * كل الصور داخل مجلد images. هذه الدالة تصحح المسارات القديمة (اسم ملف فقط)
 * القادمة من بيانات محفوظة في Firebase أو من طلبات قديمة.
 * ══════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    function zoodnyImagePath(p) {
        if (typeof p !== 'string') return p;
        var s = p.trim();
        if (!s || s.indexOf('/') !== -1 || /^(https?:|data:|blob:)/i.test(s)) return p;
        return 'images/' + s;
    }
    window.zoodnyImagePath = zoodnyImagePath;

    // إذا فشل تحميل صورة مسارها اسم ملف فقط، نعيد المحاولة من مجلد images مرة واحدة
    window.addEventListener('error', function (e) {
        var img = e.target;
        if (!img || img.tagName !== 'IMG' || img.dataset.zImgRetry) return;
        var raw = img.getAttribute('src') || '';
        var fixed = zoodnyImagePath(raw);
        if (fixed === raw) return;
        img.dataset.zImgRetry = '1';
        e.stopImmediatePropagation();
        img.src = fixed;
    }, true);
}());
