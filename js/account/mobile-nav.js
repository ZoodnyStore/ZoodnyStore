/* ══════════════════════════════════════════════════════════════════════
 * الشريط السفلي للموبايل
 * ══════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';
    const { modalOn, openOrdersHistory } = window.ZoodnyAccount;

    // ── شريط التنقل السفلي للموبايل ──────────────────────────────────────
    window.mobileNavGo = function(sectionId, btn) {
        document.querySelectorAll('.mob-nav-btn').forEach(function(b){ b.classList.remove('active'); });
        if (btn) btn.classList.add('active');
        var el = document.getElementById(sectionId);
        if (el) {
            window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
        }
        if (sectionId === 'categories') {
            var cats = document.getElementById('categories');
            var prods = document.getElementById('productsSection');
            if (cats) cats.style.display = 'block';
            if (prods) prods.style.display = 'none';
        }
    };

    // زر طلباتي — يفتح نافذة طلبات المتجر (pending / processing / done / rejected)
    window.mobileNavOrders = function(btn) {
        document.querySelectorAll('.mob-nav-btn').forEach(function(b){ b.classList.remove('active'); });
        if (btn) btn.classList.add('active');
        if (typeof openOrdersHistory === 'function') {
            openOrdersHistory();
        } else {
            // إن لم يكن مسجلاً
            var loginBtn = document.getElementById('__openLogin');
            if (loginBtn) loginBtn.click();
            else alert('يرجى تسجيل الدخول أولاً لعرض طلباتك');
        }
    };

    // زر سجل الشحن — يفتح نافذة شحن الرصيد (topup) ليرى حالة طلباته مقبولة/مرفوضة
    window.mobileNavHistory = function(btn) {
        document.querySelectorAll('.mob-nav-btn').forEach(function(b){ b.classList.remove('active'); });
        if (btn) btn.classList.add('active');
        // نفتح المحفظة التي تحتوي سجل عمليات الشحن
        var walletOv = document.getElementById('walletOv');
        var walletModal = document.getElementById('walletModal');
        if (walletOv && walletModal) {
            if (typeof modalOn === 'function') {
                modalOn('walletOv','walletModal');
            } else {
                walletOv.style.display = 'block';
                walletModal.style.display = 'block';
            }
        } else {
            // بديل: فتح نافذة التوب أب مباشرة
            if (typeof openTopup === 'function') openTopup();
        }
    };

    // زر شحن المنتصف — يفتح نافذة شحن الرصيد مباشرة
    window.mobileNavTopup = function() {
        if (typeof openTopup === 'function') {
            openTopup();
        } else {
            var chargeBtn = document.getElementById('walletChargeBtn');
            if (chargeBtn) chargeBtn.click();
            else {
                var walletOv = document.getElementById('walletOv');
                var walletModal = document.getElementById('walletModal');
                if (walletOv && walletModal && typeof modalOn === 'function') {
                    modalOn('walletOv','walletModal');
                }
            }
        }
    };

    // زر اتصل بنا — يفتح واتساب مباشرة
    window.mobileNavWhatsapp = function() {
        window.open('https://wa.me/963982199738', '_blank');
    };

    // تحديث الزر النشط عند التمرير
    window.addEventListener('scroll', function() {
        var sections = ['home', 'categories', 'contact'];
        var btnMap = { 'home': 'mob-home', 'contact': 'mob-contact' };
        var scrollPos = window.scrollY + 100;
        sections.forEach(function(id) {
            var el = document.getElementById(id);
            if (!el || !btnMap[id]) return;
            var top = el.offsetTop - 90;
            var bottom = top + el.offsetHeight;
            if (scrollPos >= top && scrollPos < bottom) {
                document.querySelectorAll('.mob-nav-btn').forEach(function(b){ b.classList.remove('active'); });
                var activeBtn = document.getElementById(btnMap[id]);
                if (activeBtn) activeBtn.classList.add('active');
            }
        });
    });

    // ████████████████████████████████████████████████████████████████████████
    //  إدارة المنتجات — تبويب داخل لوحة المدير (يعمل فقط بعد تسجيل دخول المدير)
    //  يعدّل بيانات المنتجات في ذاكرة الصفحة الحالية (لتظهر التغييرات فوراً في المتجر)
    //  ويولّد كود جاهز للنسخ ليضعه المدير يدوياً داخل ملف الموقع للحفظ الدائم.
    // ████████████████████████████████████████████████████████████████████████
}());
