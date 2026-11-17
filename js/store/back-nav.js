/* ══════════════════════════════════════════════════════════════════════
 * زر الرجوع في الهاتف (والمتصفح) داخل المتجر
 * كل انتقال لقسم/مجموعة يُسجَّل في سجل المتصفح (History API)، فزر الرجوع:
 *   1) يغلق النافذة المفتوحة أولاً (تفاصيل منتج، طلب، دخول...)
 *   2) وإلا يرجع للقسم السابق، وصولاً للصفحة الرئيسية
 * أزرار "العودة" داخل المتجر تبقى تعمل ومتوافقة مع السجل.
 * ══════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';
    if (!window.history || !history.pushState) return;
    try { history.scrollRestoration = 'manual'; } catch (e) {}

    // دوال العرض التي تغيّر محتوى صفحة المنتجات
    var VIEWS = ['showCategoryProducts', 'renderProductsByCategory', 'renderPlatforms', 'showPlatformProducts', 'renderProductsByPlatform',
        'renderGameGroups', 'showGameTypes', 'renderPaymentGroups', 'showPaymentSuperGroup', 'showPaymentProducts',
        'renderTvGroups', 'showTvProducts', 'renderDesignGroups', 'showDesignProducts', 'renderAppGroups', 'showAppProducts',
        'renderPremiumGroups', 'showPremiumProducts', 'renderVpnGroups', 'showVpnProducts', 'renderArqamGroups', 'showArqamProducts'];

    var stack = [{ home: true, keys: ['home'], y: 0 }];
    var cur = 0, depth = 0, replaying = false, skipPop = 0, nested = null;

    function argKey(a) {
        if (a === null || a === undefined) return '';
        if (typeof a !== 'object') return String(a);
        var v = a.id !== undefined ? a.id : a.key !== undefined ? a.key : a.baseName !== undefined ? a.baseName : a.name;
        return String(v === undefined ? '' : v);
    }
    function keyOf(name, args) { return name + '|' + Array.prototype.map.call(args, argKey).join('|'); }
    function onHome() { return typeof productsSection === 'undefined' || !productsSection || getComputedStyle(productsSection).display === 'none'; }
    function state(m) { return { zn: 1, idx: cur, m: m ? 1 : 0 }; }

    // ── تسجيل انتقال جديد (أو الرجوع إن كان الانتقال لصفحة سابقة عبر زر "العودة" في المتجر) ──
    function record(name, args, keys) {
        var key = keys[0];
        // رجوع لصفحة موجودة سابقاً في السجل ← نرجع بالسجل بدل إضافة صفحة جديدة
        for (var k = cur - 1; k >= 0; k--) {
            if (stack[k].keys.indexOf(key) !== -1 || keys.some(function (x) { return stack[k].keys.indexOf(x) !== -1; })) {
                skipPop++;
                var steps = k - cur;
                cur = k;
                history.go(steps);
                return;
            }
        }
        var entry = {
            name: name, args: Array.prototype.slice.call(args), keys: keys, y: 0,
            title: typeof categoryProductsTitle !== 'undefined' && categoryProductsTitle ? categoryProductsTitle.textContent : null,
            filters: typeof productFilters !== 'undefined' && productFilters ? productFilters.style.display : null,
            cat: typeof currentCategory !== 'undefined' ? currentCategory : null
        };
        var top = stack[cur];
        // نفس الصفحة بفلتر/ترتيب مختلف ← نستبدل بدل الإضافة
        if (top && !top.home && top.keys.some(function (x) { return x.split('|')[0] === name && x.split('|')[1] === argKey(args[0]); })) {
            entry.keys = top.keys.concat(keys.filter(function (x) { return top.keys.indexOf(x) === -1; }));
            stack[cur] = entry;
            history.replaceState(state(false), '');
            return;
        }
        if (top) top.y = window.pageYOffset;
        stack = stack.slice(0, cur + 1);
        stack.push(entry);
        cur++;
        history.pushState(state(false), '');
    }

    function wrap(name) {
        var orig = window[name];
        if (typeof orig !== 'function' || orig.__backWrapped) return;
        var w = function () {
            if (replaying) return orig.apply(this, arguments);
            if (depth > 0) { if (nested) nested.push(keyOf(name, arguments)); return orig.apply(this, arguments); }
            depth++;
            var mine = [], prev = nested;
            nested = mine;
            var r;
            try { r = orig.apply(this, arguments); }
            finally { depth--; nested = prev; }
            try { if (!onHome()) record(name, arguments, [keyOf(name, arguments)].concat(mine)); } catch (e) { console.warn('back-nav', e); }
            return r;
        };
        w.__backWrapped = true;
        window[name] = w;
    }

    // ── الرجوع للرئيسية من أزرار المتجر أو الشريط السفلي ──
    function goneHome() {
        if (replaying || cur === 0) return;
        skipPop++;
        var steps = -cur;
        cur = 0;
        history.go(steps);
    }
    function wrapHome(name, cond) {
        var orig = window[name];
        if (typeof orig !== 'function' || orig.__backWrapped) return;
        var w = function () {
            var r = orig.apply(this, arguments);
            if ((!cond || cond(arguments)) && onHome()) goneHome();
            return r;
        };
        w.__backWrapped = true;
        window[name] = w;
    }

    // ── النوافذ المنبثقة: زر الرجوع يغلقها أولاً ──
    var MODAL_SEL = '.active[id$="Modal"], .on[id$="Modal"], #adminDashboard.on, .adm-user-ov.on, #pmgBulkOv.on, #searchResultsOverlay.active';
    function openModals() { return document.querySelectorAll(MODAL_SEL); }
    function closeModal(el) {
        var btn = el.querySelector('[id$="Close"], [id$="CloseBtn"], .z-xbtn, .adm-user-close, .payment-close, .modal-close, .close-modal, .pmg-cancel-btn, [class*="-close"]');
        if (btn) { btn.click(); }
        if (el.classList.contains('active') || el.classList.contains('on')) {   // لم يُغلق بالزر ← نغلقه مباشرة
            el.classList.remove('active', 'on');
            var ov = document.getElementById(String(el.id || '').replace(/Modal$/, 'Ov')) || document.getElementById(String(el.id || '').replace(/Modal$/, 'Overlay'));
            if (ov) ov.classList.remove('on', 'active');
            if (el.style.display === 'block') el.style.display = 'none';
        }
    }
    var modalPushed = false;
    function syncModalState() {
        var open = openModals().length > 0;
        if (open && !modalPushed) {
            modalPushed = true;
            history.pushState(state(true), '');
        } else if (!open && modalPushed) {
            modalPushed = false;
            if (history.state && history.state.zn && history.state.m) { skipPop++; history.back(); }
        }
    }

    // ── زر الرجوع / التقدم ──
    window.addEventListener('popstate', function (e) {
        var st = e.state && e.state.zn ? e.state : { idx: 0, m: 0 };
        if (skipPop > 0) {
            skipPop--;
            if (!st.m) modalPushed = false;
            if (typeof st.idx === 'number' && stack[st.idx]) cur = st.idx;   // نبقى متزامنين مع السجل
            return;
        }

        // 1) نافذة مفتوحة ← نغلقها فقط
        var mods = openModals();
        if (mods.length) {
            modalPushed = false;
            closeModal(mods[mods.length - 1]);
            // نوافذ متعددة فوق بعض ← نُبقي سجلاً لكل نافذة متبقية
            if (openModals().length) { modalPushed = true; history.pushState(state(true), ''); }
            return;
        }
        if (st.m) {   // سجل نافذة أُغلقت سابقاً ← نعرض صفحتها ونتخطاه
            modalPushed = false;
            var tm = Math.max(0, Math.min(stack.length - 1, st.idx || 0));
            if (tm !== cur) { if (stack[cur]) stack[cur].y = window.pageYOffset; cur = tm; show(stack[tm]); }
            skipPop++; history.back();
            return;
        }

        // 2) صفحة أخرى في المتجر
        var t = Math.max(0, Math.min(stack.length - 1, st.idx || 0));
        if (t === cur && (t !== 0 || onHome())) return;
        if (stack[cur]) stack[cur].y = window.pageYOffset;
        cur = t;
        show(stack[t]);
    });

    function show(en) {
        replaying = true;
        try {
            if (en.home) {
                if (typeof backToCategoriesView === 'function') backToCategoriesView();
            } else if (typeof window[en.name] === 'function') {
                if (typeof categoriesSection !== 'undefined') categoriesSection.style.display = 'none';
                if (typeof productsSection !== 'undefined') productsSection.style.display = 'block';
                if (en.cat !== undefined) { try { currentCategory = en.cat; } catch (e) {} }
                window[en.name].apply(null, en.args);
                if (en.title !== null && typeof categoryProductsTitle !== 'undefined') categoryProductsTitle.textContent = en.title;
                if (en.filters !== null && typeof productFilters !== 'undefined') productFilters.style.display = en.filters;
            }
        } catch (e) { console.error('back-nav show', e); }
        finally { replaying = false; }
        var y = en.y || 0;
        setTimeout(function () { try { window.scrollTo({ top: y, behavior: 'instant' }); } catch (e) { window.scrollTo(0, y); } }, 40);
    }

    function install() {
        VIEWS.forEach(wrap);
        wrapHome('backToCategoriesView');
        wrapHome('mobileNavGo', function (a) { return a[0] === 'categories'; });
        history.replaceState(state(false), '');
        // مراقبة فتح/إغلاق النوافذ
        if (window.MutationObserver) {
            var t = null;
            new MutationObserver(function () { clearTimeout(t); t = setTimeout(syncModalState, 30); })
                .observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: true });
        }
    }
    // بعد تحميل كل الملفات (mobile-nav.js وغيره يُحمَّل لاحقاً)
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install); else install();
}());
