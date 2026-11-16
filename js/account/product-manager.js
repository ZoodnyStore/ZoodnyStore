/* ══════════════════════════════════════════════════════════════════════
 * إدارة المنتجات من لوحة الأدمن
 * التعديلات تحفظ في Firebase (product_overrides / product_deletions) وتطبق على بيانات js/data.
 * ══════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';
    const { $, ADMIN_EMAIL, modalOn, modalOff } = window.ZoodnyAccount;

    function pmgEsc(s) {
        return String(s === null || s === undefined ? '' : s)
            .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
            .replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ── "متطلبات المنتج": معلومة يجب أن يرسلها الزبون عند الطلب (رابط، إيميل، رقم...) ──
    var PMG_REQ_OPTIONS = [
        ['', 'لا — لا يحتاج شيئاً من الزبون'],
        ['link', 'نعم — رابط (مثل رابط حساب أو منشور)'],
        ['text', 'نعم — نص (مثل اسم مستخدم)'],
        ['email', 'نعم — بريد إلكتروني'],
        ['phone', 'نعم — رقم هاتف'],
        ['number', 'نعم — رقم / معرّف (أرقام فقط)']
    ];
    function pmgReqFields(scopeNote) {
        return [
            { key: 'reqType', label: 'هل يحتاج المنتج معلومة من الزبون عند الطلب؟' + (scopeNote || ''), type: 'select', options: function () { return PMG_REQ_OPTIONS; } },
            { key: 'reqLabel', label: 'ماذا تطلب من الزبون؟ (مثال: رابط حساب الإنستغرام)', type: 'text', showIfField: 'reqType' },
            { key: 'reqPlaceholder', label: 'مثال يظهر داخل الحقل — اختياري (مثال: https://instagram.com/username)', type: 'text', showIfField: 'reqType' },
            { key: 'reqHelp', label: 'ملاحظة توضيحية للزبون — اختياري', type: 'text', showIfField: 'reqType' }
        ];
    }

    // ── سعر رأس المال: للمدير فقط — يُحفظ في product_costs (قراءة المدير فقط) وليس في product_overrides (عام) ──
    function PMG_COST_LBL(t) { return '<i class="fas fa-lock" style="color:#b7791f"></i> ' + t + ' — يظهر للمدير فقط لحساب الأرباح'; }
    var PMG_COSTS = {};          // product_costs/{sourceKey}/{safeId} = { name, category, cost|costBase|unitCost, rows:{rowKey:{name,value,cost}} }
    var pmgCostsReady = false, pmgCostsRef = null;
    function pmgCostEntry(sourceKey, id) { return (PMG_COSTS[sourceKey] || {})[pmgSafeKey(id)] || null; }
    // مفتاح ثابت لكل سطر باقة/فئة: الألعاب بالقيمة، وباقي المجموعات بالرقم (أو الاسم إن لم يوجد رقم)
    function pmgRowKey(sourceKey, row) {
        if (!row) return '';
        if (sourceKey === 'gamesData') return pmgSafeKey('v_' + String(row.value));
        var id = row.id;
        return pmgSafeKey((id !== undefined && id !== null && id !== '' && id !== 0) ? 'id_' + id : 'n_' + String(row.name || ''));
    }
    function pmgWatchCosts() {
        auth.onAuthStateChanged(function () {
            if (pmgCostsRef) { pmgCostsRef.off(); pmgCostsRef = null; }
            PMG_COSTS = {}; pmgCostsReady = false;
            if (!pmgIsAdminUser()) return;
            pmgCostsRef = dbRef('product_costs');
            pmgCostsRef.on('value', function (snap) {
                PMG_COSTS = snap.val() || {};
                pmgCostsReady = true;
                try { pmgRenderGrid(); } catch (e) {}
                document.dispatchEvent(new CustomEvent('zoodny:costs'));
            }, function (err) {
                console.error('تعذر قراءة product_costs — أضف قاعدتها في Firebase (database.rules.json)', err);
            });
        });
    }
    window.ZoodnyCosts = {
        all: function () { return PMG_COSTS; },
        ready: function () { return pmgCostsReady; },
        rowKey: pmgRowKey,
        safeKey: function (id) { return pmgSafeKey(id); }
    };

    var PMG_SOURCES = [
        {
            key: 'products', label: 'منتجات عامة (إكسسوارات، أرقام، اشتراكات فردية...)',
            getArr: function () { return products; }, idType: 'number',
            fields: [
                { key: 'name', label: 'اسم المنتج', type: 'text', required: true },
                { key: 'category', label: 'التصنيف (Category)', type: 'category', required: true },
                { key: 'price', label: 'سعر المفرق ($)', type: 'number', hideFor: ['social-media'] },
                { key: 'wholesalePrice', label: 'سعر الجملة ($) — اختياري', type: 'number', hideFor: ['social-media'], wholesaleOf: 'price' },
                { key: 'cost', label: PMG_COST_LBL('سعر رأس المال ($)'), type: 'number', hideFor: ['social-media'], cost: true },
                // ── حقول خاصة بخدمات السوشال ميديا (السعر الفعلي = سعر الألف) ──
                { key: 'platform', label: 'المنصة', type: 'select', showFor: ['social-media'],
                  options: function () { return platforms.map(function (p) { return [p.id, p.name]; }); } },
                { key: 'basePrice', label: 'سعر الألف بالمفرق ($)', type: 'number', showFor: ['social-media'] },
                { key: 'wholesaleBasePrice', label: 'سعر الألف بالجملة ($) — اختياري', type: 'number', showFor: ['social-media'], wholesaleOf: 'basePrice' },
                { key: 'costBase', label: PMG_COST_LBL('رأس مال الألف ($)'), type: 'number', showFor: ['social-media'], cost: true },
                { key: 'minQuantity', label: 'الحد الأدنى للكمية', type: 'number', showFor: ['social-media'] },
                { key: 'maxQuantity', label: 'الحد الأقصى للكمية', type: 'number', showFor: ['social-media'] },
                // ── حقل خاص ببرامج التصميم ──
                { key: 'inputLabel', label: 'نص حقل الإدخال (مثل: الإيميل)', type: 'text', showFor: ['برامج التصميم'] },
                { key: 'description', label: 'الوصف', type: 'textarea' },
                { key: 'image', label: 'اسم ملف الصورة', type: 'text' }
            ].concat(pmgReqFields(''))
        },
        {
            key: 'appsData', label: 'شحن التطبيقات (عملات داخل التطبيق)',
            getArr: function () { return appsData; }, idType: 'number',
            fields: [
                { key: 'name', label: 'اسم التطبيق', type: 'text', required: true },
                { key: 'category', label: 'التصنيف (Category)', type: 'category', required: true, default: 'app' },
                { key: 'description', label: 'الوصف', type: 'textarea' },
                { key: 'image', label: 'اسم ملف الصورة', type: 'text' },
                { key: 'inputLabel', label: 'نص حقل الإدخال', type: 'text' },
                { key: 'inputPlaceholder', label: 'نص توضيحي لحقل الإدخال', type: 'text' },
                { key: 'unitPrice', label: 'سعر الوحدة بالمفرق ($)', type: 'number' },
                { key: 'wholesaleUnitPrice', label: 'سعر الوحدة بالجملة ($) — اختياري', type: 'number', wholesaleOf: 'unitPrice' },
                { key: 'unitCost', label: PMG_COST_LBL('رأس مال الوحدة ($)'), type: 'number', cost: true },
                { key: 'minQuantity', label: 'الحد الأدنى للكمية', type: 'number' },
                { key: 'maxQuantity', label: 'الحد الأقصى للكمية', type: 'number' }
            ].concat(pmgReqFields(''))
        },
        {
            key: 'gamesData', label: 'شحن الألعاب',
            getArr: function () { return gamesData; }, idType: 'number',
            fields: [
                { key: 'name', label: 'اسم اللعبة', type: 'text', required: true },
                { key: 'category', label: 'التصنيف (Category)', type: 'category', required: true, default: 'games' },
                { key: 'description', label: 'الوصف', type: 'textarea' },
                { key: 'image', label: 'اسم ملف الصورة', type: 'text' },
                { key: 'inputLabel', label: 'نص حقل الإدخال', type: 'text' }
            ].concat(pmgReqFields('')),
            subList: {
                key: 'amounts', label: 'فئات الشحن (الكمية / السعر / النص المعروض)',
                fields: [
                    { key: 'value', label: 'القيمة', type: 'number' },
                    { key: 'price', label: 'سعر المفرق ($)', type: 'number' },
                    { key: 'wholesalePrice', label: 'سعر الجملة ($)', type: 'number', wholesaleOf: 'price' },
                    { key: 'cost', label: 'رأس المال ($)', type: 'number', cost: true },
                    { key: 'display', label: 'النص المعروض', type: 'text' }
                ]
            }
        },
        {
            key: 'premiumActivationsData', label: 'تفعيلات بريميوم',
            getArr: function () { return premiumActivationsData; }, idType: 'string',
            fields: [
                { key: 'name', label: 'اسم المجموعة', type: 'text', required: true },
                { key: 'category', label: 'التصنيف (Category)', type: 'category', required: true, default: 'تفعيلات بريميوم' },
                { key: 'description', label: 'الوصف', type: 'textarea' },
                { key: 'image', label: 'اسم ملف الصورة', type: 'text' },
                { key: 'inputLabel', label: 'نص حقل الإدخال', type: 'text' },
                { key: 'inputPlaceholder', label: 'نص توضيحي لحقل الإدخال', type: 'text' },
                { key: 'inputHelp', label: 'شرح مساعد لحقل الإدخال', type: 'text' }
            ].concat(pmgReqFields(' (لكل باقات هذه المجموعة)')),
            subList: {
                key: 'products', label: 'الباقات والأسعار',
                fields: [
                    { key: 'id', label: 'رقم', type: 'number' },
                    { key: 'name', label: 'اسم الباقة', type: 'text' },
                    { key: 'price', label: 'سعر المفرق ($)', type: 'number' },
                    { key: 'wholesalePrice', label: 'سعر الجملة ($)', type: 'number', wholesaleOf: 'price' },
                    { key: 'cost', label: 'رأس المال ($)', type: 'number', cost: true }
                ]
            }
        },
        {
            key: 'vpnData', label: 'اشتراكات VPN',
            getArr: function () { return vpnData; }, idType: 'string',
            fields: [
                { key: 'name', label: 'اسم المجموعة', type: 'text', required: true },
                { key: 'category', label: 'التصنيف (Category)', type: 'category', required: true, default: 'اشتراكات VPN' },
                { key: 'description', label: 'الوصف', type: 'textarea' },
                { key: 'image', label: 'اسم ملف الصورة', type: 'text' }
            ].concat(pmgReqFields(' (لكل باقات هذه المجموعة)')),
            subList: {
                key: 'products', label: 'الباقات والأسعار',
                fields: [
                    { key: 'id', label: 'رقم', type: 'number' },
                    { key: 'name', label: 'اسم الباقة', type: 'text' },
                    { key: 'price', label: 'سعر المفرق ($)', type: 'number' },
                    { key: 'wholesalePrice', label: 'سعر الجملة ($)', type: 'number', wholesaleOf: 'price' },
                    { key: 'cost', label: 'رأس المال ($)', type: 'number', cost: true }
                ]
            }
        },
        {
            key: 'electronicPaymentData', label: 'الدفع الالكتروني',
            getArr: function () { return electronicPaymentData; }, idType: 'string',
            fields: [
                { key: 'name', label: 'اسم المجموعة', type: 'text', required: true },
                { key: 'category', label: 'التصنيف (Category)', type: 'category', required: true, default: 'الدفع الالكتروني' },
                { key: 'description', label: 'الوصف', type: 'textarea' },
                { key: 'image', label: 'اسم ملف الصورة', type: 'text' }
            ].concat(pmgReqFields(' (لكل باقات هذه المجموعة)')),
            subList: {
                key: 'products', label: 'الباقات والأسعار',
                fields: [
                    { key: 'id', label: 'رقم', type: 'number' },
                    { key: 'name', label: 'اسم الباقة', type: 'text' },
                    { key: 'price', label: 'سعر المفرق ($)', type: 'number' },
                    { key: 'wholesalePrice', label: 'سعر الجملة ($)', type: 'number', wholesaleOf: 'price' },
                    { key: 'cost', label: 'رأس المال ($)', type: 'number', cost: true }
                ]
            }
        },
        {
            key: 'categories', label: 'التصنيفات الرئيسية (بطاقات الصفحة الرئيسية)',
            getArr: function () { return categories; }, idType: 'string',
            fields: [
                { key: 'name', label: 'اسم التصنيف', type: 'text', required: true },
                { key: 'description', label: 'الوصف', type: 'text' },
                { key: 'image', label: 'الصورة', type: 'text' },
                { key: 'count', label: 'العدد المعروض (منتج)', type: 'number' }
            ]
        }
    ];

    // ── حقول عامة لكل الأقسام: حالة المنتج (متاح / نفد / مخفي) وترتيب الظهور ──
    var PMG_AVAIL_OPTIONS = [
        ['', 'متاح للطلب'],
        ['soldout', 'نفد المخزون — يظهر للزبائن بدون إمكانية الطلب'],
        ['hidden', 'مخفي — لا يظهر للزبائن (يبقى محفوظاً)']
    ];
    PMG_SOURCES.forEach(function (src) {
        src.fields = src.fields.concat([
            { key: 'availability', label: '<i class="fas fa-eye"></i> حالة المنتج', type: 'select', options: function () { return PMG_AVAIL_OPTIONS; } },
            { key: 'sortOrder', label: '<i class="fas fa-sort-numeric-down"></i> ترتيب الظهور — اختياري (الرقم الأصغر يظهر أولاً، والفارغ بعدها بترتيبه الحالي)', type: 'number', optional: true }
        ]);
    });

    function pmgGetSource(key) { return PMG_SOURCES.filter(function (s) { return s.key === key; })[0]; }
    function pmgUnavailable(it) { return !!it && (it.availability === 'soldout' || it.availability === 'hidden'); }
    var PMG_AVAIL_TXT = { soldout: 'نفد المخزون', hidden: 'مخفي عن الزبائن' };

    // الحقول الرقمية قد تكون محفوظة كنص (من نسخ سابقة) — نحولها لأرقام حتى لا تتعطل السلة والحسابات
    function pmgToNumber(v) {
        if (typeof v === 'number') return v;
        if (typeof v !== 'string' || v.trim() === '') return v;
        var s = v.replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 0x0660); })   // أرقام عربية
                 .replace(/[۰-۹]/g, function (d) { return String(d.charCodeAt(0) - 0x06F0); })   // أرقام فارسية
                 .replace(/[٫,]/g, '.').replace(/[$\s]/g, '');
        if (!/^-?\d+(\.\d+)?$/.test(s) && !/^-?\.\d+$/.test(s)) return v;   // نرفض "1e" و "2.5.1" وغيرها
        var n = Number(s);
        return isNaN(n) ? v : n;
    }
    function pmgNormalizeItem(src, data) {
        src.fields.forEach(function (f) {
            if (f.type === 'number' && data[f.key] !== undefined) data[f.key] = pmgToNumber(data[f.key]);
        });
        if (src.subList && data[src.subList.key]) {
            var list = data[src.subList.key];
            if (!Array.isArray(list)) list = data[src.subList.key] = Object.keys(list).map(function (k) { return list[k]; });
            list.forEach(function (row) {
                if (!row) return;
                src.subList.fields.forEach(function (f) {
                    if (f.type === 'number' && row[f.key] !== undefined) row[f.key] = pmgToNumber(row[f.key]);
                });
            });
            data[src.subList.key] = list.filter(Boolean);
        }
    }

    function pmgApplyOverridesToArrays(overrides, deletions) {
        PMG_SOURCES.forEach(function (src) {
            var arr = src.getArr();
            var delMap = (deletions && deletions[src.key]) || {};
            for (var i = arr.length - 1; i >= 0; i--) {
                if (delMap[pmgSafeKey(arr[i].id)]) arr.splice(i, 1);
            }
            var ovMap = (overrides && overrides[src.key]) || {};
            Object.keys(ovMap).forEach(function (k) {
                var data = ovMap[k];
                if (!data || data.id === undefined || data.id === null) return;
                if (typeof data.image === 'string') data.image = window.zoodnyImagePath(data.image);
                pmgNormalizeItem(src, data);
                var existing = null;
                for (var j = 0; j < arr.length; j++) { if (String(arr[j].id) === String(data.id)) { existing = arr[j]; break; } }
                if (existing) {
                    Object.keys(data).forEach(function (fk) { existing[fk] = data[fk]; });
                } else {
                    arr.push(data);
                }
            });
        });
    }

    // ── أسعار الجملة: لحساب الجملة نضع سعر الجملة مكان سعر المفرق داخل البيانات نفسها،
    //    فتتحدث البطاقات والتفاصيل والسلة تلقائياً. (المنتج بلا سعر جملة يبقى بسعره العادي)
    function pmgIsWholesale() { return window.__zoodnyWholesale === true; }
    function pmgApplyWholesale() {
        PMG_SOURCES.forEach(function (src) {
            var wf = src.fields.filter(function (f) { return f.wholesaleOf; });
            var swf = src.subList ? src.subList.fields.filter(function (f) { return f.wholesaleOf; }) : [];
            if (!wf.length && !swf.length) return;
            src.getArr().forEach(function (it) {
                if (!it) return;
                var changed = false;
                wf.forEach(function (f) {
                    var w = pmgToNumber(it[f.key]);
                    if (typeof w === 'number' && w > 0) { it[f.wholesaleOf] = w; changed = true; }
                });
                // نص "سعر الألف" داخل وصف خدمات السوشال ميديا
                if (changed && it.category === 'social-media' && typeof it.basePrice === 'number' && typeof it.description === 'string') {
                    it.description = it.description.replace(/سعر الألف:\s*[\d.]+\s*\$/, 'سعر الألف: ' + it.basePrice + '$');
                }
                var rows = swf.length ? it[src.subList.key] : null;
                if (Array.isArray(rows)) rows.forEach(function (row) {
                    if (!row) return;
                    swf.forEach(function (f) {
                        var w = pmgToNumber(row[f.key]);
                        if (typeof w === 'number' && w > 0) row[f.wholesaleOf] = w;
                    });
                });
            });
        });
    }

    function pmgFindItem(sourceKey, id) {
        var src = pmgGetSource(sourceKey);
        return src.getArr().filter(function (it) { return String(it.id) === String(id); })[0];
    }

    function pmgInitSourceSelect() {
        var sel = $('pmgSourceSelect');
        sel.innerHTML = PMG_SOURCES.map(function (s) { return '<option value="' + s.key + '">' + pmgEsc(s.label) + '</option>'; }).join('');
        sel.addEventListener('change', function () { pmgPopulateCategoryFilter(); pmgRenderGrid(); });
    }

    function pmgPopulateCategoryFilter() {
        var src = pmgGetSource($('pmgSourceSelect').value);
        var arr = src.getArr();
        var seen = {};
        var cats = [];
        arr.forEach(function (it) {
            var c = it.category || '';
            if (c && !seen[c]) { seen[c] = true; cats.push(c); }
        });
        cats.sort();
        var prevCat = $('pmgCategorySelect').value;
        $('pmgCategorySelect').innerHTML = '<option value="">كل التصنيفات</option>' +
            cats.map(function (c) { return '<option value="' + pmgEsc(c) + '">' + pmgEsc(c) + '</option>'; }).join('');
        if (prevCat && cats.indexOf(prevCat) !== -1) $('pmgCategorySelect').value = prevCat;
    }

    function pmgRenderGrid() {
        var src = pmgGetSource($('pmgSourceSelect').value);
        var arr = src.getArr();
        var catFilter = $('pmgCategorySelect').value;
        var q = ($('pmgSearchInput').value || '').trim().toLowerCase();
        var filtered = arr.filter(function (it) {
            if (catFilter && it.category !== catFilter) return false;
            if (q && String(it.name || '').toLowerCase().indexOf(q) === -1) return false;
            return true;
        });
        $('pmgCount').textContent = 'عدد العناصر المعروضة: ' + filtered.length + ' (من أصل ' + arr.length + ')';
        var grid = $('pmgGrid');
        if (!filtered.length) {
            grid.innerHTML = '<div class="adm-no-data" style="grid-column:1/-1">لا توجد نتائج</div>';
            return;
        }
        grid.innerHTML = filtered.map(function (it) {
            var priceLine = '';
            if (src.key === 'products') {
                if (it.category === 'social-media') priceLine = 'الألف: ' + (it.basePrice !== undefined ? it.basePrice : '-') + ' $' + (it.wholesaleBasePrice > 0 ? ' · جملة: ' + it.wholesaleBasePrice + ' $' : '');
                else priceLine = (it.price !== undefined && it.price !== null) ? (it.price + ' $' + (it.wholesalePrice > 0 ? ' · جملة: ' + it.wholesalePrice + ' $' : '')) : '';
            }
            else if (src.key === 'appsData') priceLine = 'سعر الوحدة: ' + (it.unitPrice !== undefined ? it.unitPrice : '-') + ' $' + (it.wholesaleUnitPrice > 0 ? ' · جملة: ' + it.wholesaleUnitPrice + ' $' : '');
            else if (src.subList) priceLine = ((it[src.subList.key] || []).length) + ' باقة/فئة';
            // رأس المال (للمدير فقط)
            var ce = pmgCostEntry(src.key, it.id), costLine = '';
            if (ce) {
                var cv = typeof ce.cost === 'number' ? ce.cost : typeof ce.costBase === 'number' ? ce.costBase : typeof ce.unitCost === 'number' ? ce.unitCost : null;
                if (cv !== null) costLine = 'رأس المال: ' + cv + ' $' + (ce.costBase !== undefined ? ' / ألف' : ce.unitCost !== undefined ? ' / وحدة' : '');
                else if (ce.rows) costLine = 'رأس المال محدد لـ ' + Object.keys(ce.rows).length + ' باقة/فئة';
            } else if (src.key !== 'categories') costLine = 'رأس المال: غير محدد';
            var imgHtml = it.image
                ? '<img src="' + pmgEsc(it.image) + '" onerror="this.parentElement.innerHTML=\'<i class=\\\'fas fa-image\\\'></i>\'">'
                : '<i class="fas fa-image"></i>';
            return '' +
                '<div class="pmg-card">' +
                    '<div class="pmg-card-img">' + imgHtml + '</div>' +
                    '<div class="pmg-card-body">' +
                        '<div class="pmg-card-name">' + pmgEsc(it.name) + '</div>' +
                        '<span class="pmg-card-cat">' + pmgEsc(it.category || '—') + '</span>' +
                        (priceLine ? '<div class="pmg-card-price">' + pmgEsc(priceLine) + '</div>' : '') +
                        (costLine ? '<div class="pmg-card-cost' + (ce ? '' : ' none') + '"><i class="fas fa-lock"></i> ' + pmgEsc(costLine) + '</div>' : '') +
                        (PMG_AVAIL_TXT[it.availability] ? '<div class="pmg-card-avail ' + pmgEsc(it.availability) + '">' + PMG_AVAIL_TXT[it.availability] + '</div>' : '') +
                        '<div class="pmg-card-sub">ID: ' + pmgEsc(it.id) + '</div>' +
                    '</div>' +
                    '<div class="pmg-card-foot">' +
                        '<button type="button" class="pmg-edit-btn" data-id="' + pmgEsc(it.id) + '"><i class="fas fa-edit"></i> تعديل</button>' +
                        '<button type="button" class="pmg-dup-btn" data-id="' + pmgEsc(it.id) + '" title="إنشاء منتج جديد نسخة من هذا"><i class="fas fa-copy"></i> نسخ</button>' +
                        '<button type="button" class="pmg-del-btn" data-id="' + pmgEsc(it.id) + '"><i class="fas fa-trash"></i> حذف</button>' +
                    '</div>' +
                '</div>';
        }).join('');

        Array.prototype.forEach.call(grid.querySelectorAll('.pmg-edit-btn'), function (b) {
            b.addEventListener('click', function () { pmgOpenForm(src.key, b.dataset.id); });
        });
        Array.prototype.forEach.call(grid.querySelectorAll('.pmg-dup-btn'), function (b) {
            b.addEventListener('click', function () { pmgDuplicate(src.key, b.dataset.id); });
        });
        Array.prototype.forEach.call(grid.querySelectorAll('.pmg-del-btn'), function (b) {
            b.addEventListener('click', function () { pmgDeleteItem(src.key, b.dataset.id); });
        });
    }

    function pmgSafeKey(id) {
        return String(id).replace(/[.#$\[\]\/]/g, '_');
    }

    function pmgDeleteItem(sourceKey, id) {
        var src = pmgGetSource(sourceKey);
        var arr = src.getArr();
        var idx = -1;
        for (var i = 0; i < arr.length; i++) { if (String(arr[i].id) === String(id)) { idx = i; break; } }
        if (idx === -1) return;
        var item = arr[idx];
        if (!confirm('هل تريد حذف "' + (item.name || '') + '" نهائياً من المتجر؟ لا يمكن التراجع عن هذا.')) return;
        var safeId = pmgSafeKey(item.id);
        arr.splice(idx, 1);
        pmgPopulateCategoryFilter();
        pmgRenderGrid();
        Promise.all([
            dbRef('product_deletions/' + sourceKey + '/' + safeId).set(true),
            dbRef('product_overrides/' + sourceKey + '/' + safeId).remove()
        ]).then(function () {
            showToast('تم حذف المنتج نهائياً من المتجر', 'success');
            pmgLog('حذف المنتج "' + (item.name || '') + '" (' + src.label.split(' (')[0] + ')', sourceKey + '/' + safeId);
        }).catch(function (err) {
            showToast('تعذر حفظ الحذف في قاعدة البيانات: ' + (err && err.message ? err.message : err), 'error');
        });
    }

    var pmgEditingCtx = null;

    // قائمة اقتراحات للتصنيف: تصنيفات الصفحة الرئيسية + التصنيفات المستخدمة فعلاً
    function pmgCategoryDatalist(src) {
        var seen = {}, opts = [];
        function add(val, label) {
            if (!val || seen[val]) return;
            seen[val] = true;
            opts.push('<option value="' + pmgEsc(val) + '"' + (label && label !== val ? ' label="' + pmgEsc(label) + '"' : '') + '>' + (label && label !== val ? pmgEsc(label) : '') + '</option>');
        }
        if (src.key === 'products') categories.forEach(function (c) { add(c.id, c.name); });
        src.getArr().forEach(function (it) { add(it.category); });
        return '<datalist id="pmgCategoryList">' + opts.join('') + '</datalist>';
    }

    // إظهار/إخفاء الحقول الخاصة حسب التصنيف المكتوب
    function pmgApplyFieldVisibility() {
        var wrap = $('pmgFieldsWrap');
        var catEl = wrap.querySelector('[data-field="category"]');
        var cat = catEl ? catEl.value.trim() : '';
        Array.prototype.forEach.call(wrap.querySelectorAll('.pmg-field[data-show-for], .pmg-field[data-hide-for], .pmg-field[data-show-if-field]'), function (box) {
            var show = true;
            if (box.dataset.showFor) show = box.dataset.showFor.split('|').indexOf(cat) !== -1;
            if (box.dataset.hideFor && box.dataset.hideFor.split('|').indexOf(cat) !== -1) show = false;
            // حقول تظهر فقط عند اختيار قيمة في حقل آخر (مثل: تفاصيل "متطلبات المنتج")
            if (box.dataset.showIfField) {
                var dep = wrap.querySelector('[data-field="' + box.dataset.showIfField + '"]');
                if (!dep || !String(dep.value || '').trim()) show = false;
            }
            box.style.display = show ? '' : 'none';
        });
    }

    function pmgFieldIsVisible(el) {
        var box = el.closest('.pmg-field');
        return !box || box.style.display !== 'none';
    }

    function pmgOpenForm(sourceKey, id, preset) {
        var src = pmgGetSource(sourceKey);
        preset = preset || {};
        var item = id !== null && id !== undefined ? pmgFindItem(sourceKey, id) : null;
        pmgEditingCtx = { sourceKey: sourceKey, id: item ? item.id : null };
        $('pmgFormTitle').textContent = item ? ('تعديل: ' + item.name) : ('إضافة منتج جديد — ' + src.label);

        var idVal = item ? item.id : pmgSuggestId(src);
        var idFieldHtml = '<div class="pmg-field"><label>المعرف (ID)' +
            (src.idType === 'string' ? ' — نص فريد، مثال: my-new-item' : ' — رقم فريد غير مستخدم') + '</label>' +
            '<input type="text" id="pmgFieldId" value="' + pmgEsc(idVal) + '"' + (item ? ' readonly style="background:#f4f6f9;color:#888"' : '') + '></div>';

        var costEntry = item ? (pmgCostEntry(sourceKey, item.id) || {})
                             : (preset.__costFrom !== undefined ? (pmgCostEntry(sourceKey, preset.__costFrom) || {}) : {});
        var fieldsHtml = src.fields.map(function (f) {
            var val = item ? (item[f.key] !== undefined && item[f.key] !== null ? item[f.key] : '')
                           : (preset[f.key] !== undefined && preset[f.key] !== null ? preset[f.key] : (f.default !== undefined ? f.default : ''));
            if (f.cost) val = typeof costEntry[f.key] === 'number' ? costEntry[f.key] : '';
            var cond = (f.showFor ? ' data-show-for="' + pmgEsc(f.showFor.join('|')) + '"' : '') +
                       (f.hideFor ? ' data-hide-for="' + pmgEsc(f.hideFor.join('|')) + '"' : '') +
                       (f.showIfField ? ' data-show-if-field="' + pmgEsc(f.showIfField) + '"' : '');
            var open = '<div class="pmg-field' + (f.cost ? ' pmg-cost-field' : '') + '"' + cond + '><label>' + f.label + '</label>';
            if (f.type === 'textarea') {
                return open + '<textarea data-field="' + f.key + '">' + pmgEsc(val) + '</textarea></div>';
            }
            if (f.key === 'image') return pmgImageFieldHtml(val);
            if (f.type === 'select') {
                var opts = f.options();
                var known = opts.some(function (o) { return String(o[0]) === String(val); });
                return open + '<select data-field="' + f.key + '">' +
                    (known ? '' : '<option value="' + pmgEsc(val) + '">' + (val ? pmgEsc(val) : '— اختر —') + '</option>') +
                    opts.map(function (o) {
                        return '<option value="' + pmgEsc(o[0]) + '"' + (String(o[0]) === String(val) ? ' selected' : '') + '>' + pmgEsc(o[1]) + '</option>';
                    }).join('') + '</select></div>';
            }
            if (f.type === 'category') {
                return open + '<input type="text" list="pmgCategoryList" data-field="' + f.key + '" value="' + pmgEsc(val) + '" placeholder="اختر من القائمة أو اكتب تصنيفاً">' +
                    pmgCategoryDatalist(src) + '</div>';
            }
            // الحقول الرقمية نصية مع لوحة أرقام: حقل type=number في المتصفح يحذف الفاصلة بصمت ("2,5" تصبح 25)
            return open + '<input type="text"' + (f.type === 'number' ? ' inputmode="decimal" dir="ltr" placeholder="0.00"' : '') + ' data-field="' + f.key + '" value="' + pmgEsc(val) + '"></div>';
        }).join('');

        $('pmgFieldsWrap').innerHTML = idFieldHtml + fieldsHtml;
        pmgWireImageField();
        var catInput = $('pmgFieldsWrap').querySelector('[data-field="category"]');
        if (catInput) catInput.addEventListener('input', pmgApplyFieldVisibility);
        var reqSel = $('pmgFieldsWrap').querySelector('[data-field="reqType"]');
        if (reqSel) reqSel.addEventListener('change', function () {
            pmgApplyFieldVisibility();
            var lbl = $('pmgFieldsWrap').querySelector('[data-field="reqLabel"]');
            if (reqSel.value && lbl && !lbl.value.trim()) lbl.focus();
        });
        pmgApplyFieldVisibility();

        var subWrap = $('pmgSubListWrap');
        if (src.subList) {
            var rowsSrc = item || preset;
            var rows = rowsSrc && Object.prototype.toString.call(rowsSrc[src.subList.key]) === '[object Array]' ? rowsSrc[src.subList.key] : [];
            subWrap.innerHTML = '<div class="pmg-sub-title"><span>' + src.subList.label + '</span> <button type="button" class="pmg-sub-add" id="pmgSubAddRow"><i class="fas fa-plus"></i> إضافة سطر</button></div>' +
                '<div id="pmgSubRows"></div>';
            var costRows = costEntry.rows || {};
            rows.forEach(function (r) {
                var cr = costRows[pmgRowKey(sourceKey, r)];
                pmgAddSubRow(src.subList, r, cr && typeof cr.cost === 'number' ? cr.cost : '');
            });
            $('pmgSubAddRow').addEventListener('click', function () { pmgAddSubRow(src.subList, null); });
        } else {
            subWrap.innerHTML = '';
        }

        // تحذير البيع بخسارة (سعر البيع أقل من رأس المال)
        var warn = document.createElement('div');
        warn.id = 'pmgLossWarn';
        warn.className = 'pmg-loss-warn';
        subWrap.appendChild(warn);
        $('pmgFieldsWrap').oninput = pmgCheckLoss;
        subWrap.oninput = pmgCheckLoss;
        subWrap.onclick = function () { setTimeout(pmgCheckLoss, 0); };
        pmgCheckLoss();

        modalOn('prodModalOv', 'prodEditModal');
    }

    function pmgAddSubRow(subListSpec, data, costVal) {
        var rowsWrap = $('pmgSubRows');
        var row = document.createElement('div');
        row.className = 'pmg-sub-row';
        row.innerHTML = subListSpec.fields.map(function (f) {
            var v = f.cost ? (costVal !== undefined && costVal !== null ? costVal : '')
                  : (data && data[f.key] !== undefined && data[f.key] !== null ? data[f.key] : '');
            return '<input type="text" placeholder="' + f.label + '" title="' + f.label + (f.cost ? ' — للمدير فقط' : '') + '"' +
                (f.cost ? ' class="pmg-sub-cost" inputmode="decimal" dir="ltr"' : '') +
                ' data-subfield="' + f.key + '" value="' + pmgEsc(v) + '">';
        }).join('') + '<button type="button" title="حذف السطر"><i class="fas fa-times"></i></button>';
        row.querySelector('button').addEventListener('click', function () { row.parentNode.removeChild(row); });
        rowsWrap.appendChild(row);
    }

    // ═══════════════════════════════════════════════════════════════
    //  المزامنة الحيّة: أي تغيير في قاعدة البيانات يصل لكل الزوار فوراً
    // ═══════════════════════════════════════════════════════════════
    var PMG_BASE = null;                 // نسخة البيانات الأصلية المكتوبة في الملف
    var PMG_DERIVED = {};                // مفاتيح نسخ الألعاب/التطبيقات داخل مصفوفة products
    var pmgLast = { overrides: {}, deletions: {} };
    var pmgHave = { o: false, d: false };
    var pmgOk = { o: false, d: false };   // هل نجحت القراءة فعلاً (وليس خطأ صلاحيات)
    var pmgTimer = null, pmgCatSig = null;
    var pmgView = null, pmgDepth = 0, pmgReplaying = false;
    var PMG_SAFE_VIEWS = ['showCategoryProducts', 'renderProductsByCategory', 'showPlatformProducts'];

    function pmgDerivedKey(kind, it) { return kind + '|' + it.id + '|' + (it.category || ''); }

    function pmgSnapshotBase() {
        if (PMG_BASE) return;
        PMG_BASE = {};
        PMG_SOURCES.forEach(function (s) { PMG_BASE[s.key] = JSON.parse(JSON.stringify(s.getArr())); });
        gamesData.forEach(function (g) { PMG_DERIVED[pmgDerivedKey('g', g)] = true; });
        appsData.forEach(function (a) { PMG_DERIVED[pmgDerivedKey('a', a)] = true; });
        try { pmgCatSig = JSON.stringify(categories); } catch (e) {}
    }

    function pmgResetToBase() {
        PMG_SOURCES.forEach(function (s) {
            var arr = s.getArr();
            arr.length = 0;
            PMG_BASE[s.key].forEach(function (it) { arr.push(JSON.parse(JSON.stringify(it))); });
        });
    }

    // الألعاب والتطبيقات يُنسخ منها عنصر داخل products (للبحث) — نُبقيها متزامنة
    function pmgSyncDerived() {
        [['g', gamesData], ['a', appsData]].forEach(function (pair) {
            var kind = pair[0], arr = pair[1], cur = {};
            arr.forEach(function (it) { cur[pmgDerivedKey(kind, it)] = true; });
            for (var i = products.length - 1; i >= 0; i--) {
                var k = pmgDerivedKey(kind, products[i]);
                if (PMG_DERIVED[k] && !cur[k]) products.splice(i, 1);
            }
            arr.forEach(function (it) {
                var k = pmgDerivedKey(kind, it), found = null;
                for (var j = 0; j < products.length; j++) { if (pmgDerivedKey(kind, products[j]) === k) { found = products[j]; break; } }
                if (found) { found.name = it.name; found.description = it.description; found.image = it.image; }
                else { products.push({ id: it.id, name: it.name, category: it.category, price: 0, description: it.description, image: it.image }); }
                PMG_DERIVED[k] = true;
            });
        });
    }

    function pmgSig() {
        try {
            return (typeof productsGrid !== 'undefined' && productsGrid ? productsGrid.innerHTML.length : 0) + '|' +
                   (typeof categoryProductsTitle !== 'undefined' && categoryProductsTitle ? categoryProductsTitle.textContent : '');
        } catch (e) { return ''; }
    }

    function pmgTrackViews() {
        ['showCategoryProducts', 'renderProductsByCategory', 'showPlatformProducts', 'showGameTypes', 'showVpnProducts',
         'showPaymentSuperGroup', 'showPaymentProducts', 'showTvProducts', 'showDesignProducts', 'showAppProducts',
         'showPremiumProducts', 'showArqamProducts'].forEach(function (name) {
            var orig = window[name];
            if (typeof orig !== 'function') return;
            window[name] = function () {
                var isTop = pmgDepth === 0 && !pmgReplaying;
                var args = Array.prototype.slice.call(arguments);
                pmgDepth++;
                try { return orig.apply(this, arguments); }
                finally {
                    pmgDepth--;
                    if (isTop) pmgView = { name: name, args: args, safe: PMG_SAFE_VIEWS.indexOf(name) !== -1, sig: pmgSig() };
                }
            };
        });
    }

    function pmgShowUpdateBanner() {
        if (document.getElementById('pmgUpdateBanner')) return;
        var b = document.createElement('div');
        b.id = 'pmgUpdateBanner';
        b.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:84px;z-index:4500;background:#2A3F54;color:#fff;padding:.7rem 1rem;border-radius:12px;box-shadow:0 6px 22px rgba(0,0,0,.3);display:flex;gap:.8rem;align-items:center;font-size:.88rem;max-width:92vw;font-family:Cairo,sans-serif';
        b.innerHTML = '<span><i class="fas fa-sync-alt"></i> تم تحديث المنتجات والأسعار</span>' +
            '<button type="button" style="background:#F7C873;color:#1A252F;border:none;border-radius:8px;padding:.35rem .8rem;font-weight:700;cursor:pointer;font-family:inherit">تحديث</button>' +
            '<button type="button" aria-label="إغلاق" style="background:none;border:none;color:#fff;cursor:pointer;font-size:1.1rem">×</button>';
        b.children[1].onclick = function () { location.reload(); };
        b.children[2].onclick = function () { b.parentNode && b.parentNode.removeChild(b); };
        document.body.appendChild(b);
    }

    function pmgRefreshStorefront() {
        try { if (window.__rebuildSearchIndex) window.__rebuildSearchIndex(); } catch (e) { console.error(e); }

        // بطاقات التصنيفات في الصفحة الرئيسية
        try {
            var sig = JSON.stringify(categories);
            if (sig !== pmgCatSig) {
                pmgCatSig = sig;
                if (typeof categoriesGrid !== 'undefined' && categoriesGrid && typeof renderCategories === 'function') {
                    renderCategories();
                    if (window.AOS && AOS.refreshHard) AOS.refreshHard();
                }
            }
        } catch (e) { console.error(e); }

        // القائمة المفتوحة حالياً عند الزائر
        try {
            var visible = typeof productsSection !== 'undefined' && productsSection && getComputedStyle(productsSection).display !== 'none';
            if (!visible || !pmgView) return;
            var adminEmail = (typeof ADMIN_EMAIL !== 'undefined') ? ADMIN_EMAIL : 'admin@zoodny.com';
            var isAdmin = !!(auth.currentUser && auth.currentUser.email === adminEmail);
            if (pmgView.safe && pmgView.sig === pmgSig()) {
                var y = window.pageYOffset;
                var fn = window[pmgView.name];
                pmgReplaying = true;
                try { fn.apply(null, pmgView.args); } finally { pmgReplaying = false; }
                try { window.scrollTo({ top: y, behavior: 'instant' }); } catch (e2) { window.scrollTo(0, y); }
                pmgView.sig = pmgSig();
            } else if (!isAdmin) {
                pmgShowUpdateBanner();   // الزائر داخل صفحة فرعية: نعرض زر تحديث بدل قطع تصفحه
            }
        } catch (e) { console.error(e); }
    }

    function pmgReapply() {
        if (!pmgHave.o || !pmgHave.d) return;
        try {
            pmgSnapshotBase();
            pmgResetToBase();
            pmgApplyOverridesToArrays(pmgLast.overrides, pmgLast.deletions);
            if (pmgIsWholesale()) pmgApplyWholesale();
            pmgApplyVisibilityAndOrder();
            pmgSyncDerived();
            pmgPopulateCategoryFilter();
            pmgRenderGrid();
            pmgRefreshStorefront();
        } catch (e) { console.error('pmgReapply', e); }
        // تحديث أسعار السلة؛ الحذف من السلة فقط إذا حُمّلت بيانات المدير بنجاح
        try {
            if (typeof syncCartWithCatalog === 'function') syncCartWithCatalog(pmgOk.o && pmgOk.d);
        } catch (e) { console.error('syncCartWithCatalog', e); }
    }

    function pmgSchedule() {
        clearTimeout(pmgTimer);
        pmgTimer = setTimeout(pmgReapply, 120);
    }

    function pmgStartLive() {
        pmgTrackViews();
        function listen(path, slot, flag) {
            dbRef(path).on('value', function (snap) {
                pmgLast[slot] = snap.val() || {};
                pmgHave[flag] = true;
                pmgOk[flag] = true;
                pmgSchedule();
            }, function (err) {
                console.error('تعذر قراءة ' + path + ' — تأكد من قواعد Firebase (يجب السماح بالقراءة للجميع)', err);
                pmgHave[flag] = true;
                pmgOk[flag] = false;
                pmgSchedule();
            });
        }
        listen('product_overrides', 'overrides', 'o');
        listen('product_deletions', 'deletions', 'd');
        // المدير يرى المنتجات المخفية، والزائر لا ← نعيد التطبيق عند تغيّر الحساب
        auth.onAuthStateChanged(function () { pmgSchedule(); });
        // تفعيل/إيقاف الجملة لهذا الزبون (يأتي من wholesale.js) ← نعيد حساب الأسعار فوراً
        document.addEventListener('zoodny:wholesale', function () { pmgSchedule(); });
    }

    // ═══════════════════════════════════════════════════════════════
    //  رفع الصور من لوحة المدير
    //  1) محاولة الرفع إلى Firebase Storage  2) وإن لم يتوفر: حفظ الصورة مضغوطة في قاعدة البيانات
    // ═══════════════════════════════════════════════════════════════
    var pmgUploading = false;

    function pmgSuggestId(src) {
        if (src.idType === 'string') return 'item-' + Date.now().toString(36);
        var max = 0;
        ['products', 'gamesData', 'appsData'].forEach(function (k) {
            pmgGetSource(k).getArr().forEach(function (it) { var n = Number(it.id); if (!isNaN(n) && n > max) max = n; });
        });
        return max + 1;
    }

    function pmgImageFieldHtml(val) {
        return '<div class="pmg-field"><label>صورة المنتج</label>' +
            '<div class="pmg-img-row">' +
                '<div class="pmg-img-prev" id="pmgImgPrev"><i class="fas fa-image"></i></div>' +
                '<div class="pmg-img-ctl">' +
                    '<div class="pmg-img-btns">' +
                        '<label class="pmg-upload-btn"><i class="fas fa-cloud-upload-alt"></i> رفع صورة من الجهاز<input type="file" accept="image/*" id="pmgImgFile" style="display:none"></label>' +
                        '<button type="button" class="pmg-img-clear" id="pmgImgClear"><i class="fas fa-times"></i> إزالة</button>' +
                    '</div>' +
                    '<input type="text" id="pmgImgVal" data-field="image" placeholder="أو اكتب اسم ملف / رابط الصورة" value="' + pmgEsc(val) + '">' +
                    '<div class="pmg-img-status" id="pmgImgStatus"></div>' +
                '</div>' +
            '</div></div>';
    }

    function pmgSetPreview(val) {
        var box = $('pmgImgPrev');
        if (!box) return;
        box.innerHTML = '';
        if (!val) { box.innerHTML = '<i class="fas fa-image"></i>'; return; }
        var im = new Image();
        im.onerror = function () { box.innerHTML = '<i class="fas fa-image"></i>'; };
        im.src = val;
        box.appendChild(im);
    }

    function pmgImgStatus(msg, cls) {
        var el = $('pmgImgStatus');
        if (el) { el.textContent = msg || ''; el.className = 'pmg-img-status' + (cls ? ' ' + cls : ''); }
    }

    function pmgSetUploading(on) {
        pmgUploading = on;
        var b = document.querySelector('#pmgForm .pmg-save-btn');
        if (b) b.disabled = on;
    }

    function pmgWireImageField() {
        var inp = $('pmgImgVal'), file = $('pmgImgFile'), clr = $('pmgImgClear');
        if (!inp || !file) return;
        pmgSetPreview(inp.value);
        inp.addEventListener('input', function () { pmgSetPreview(inp.value); });
        clr.addEventListener('click', function () { inp.value = ''; pmgSetPreview(''); pmgImgStatus(''); });
        file.addEventListener('change', function () {
            var f = file.files && file.files[0];
            if (!f) return;
            if (!/^image\//.test(f.type)) { pmgImgStatus('الملف المختار ليس صورة', 'err'); return; }
            pmgSetUploading(true);
            pmgImgStatus('جارٍ تجهيز ورفع الصورة...');
            var tag = ($('pmgFieldId') && $('pmgFieldId').value) || 'item';
            pmgUploadImage(f, tag).then(function (res) {
                inp.value = res.url;
                pmgSetPreview(res.url);
                pmgImgStatus(res.mode === 'storage' ? 'تم رفع الصورة — اضغط حفظ لتثبيتها' : 'تم تجهيز الصورة — اضغط حفظ لتثبيتها', 'ok');
            }).catch(function (err) {
                pmgImgStatus('تعذر رفع الصورة: ' + (err && err.message ? err.message : err), 'err');
            }).then(function () { pmgSetUploading(false); file.value = ''; });
        });
    }

    // تصغير الصورة وضغطها (لا تتجاوز ~90KB تقريباً)
    function pmgCompressImage(file) {
        return new Promise(function (resolve, reject) {
            var url = URL.createObjectURL(file);
            var img = new Image();
            img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('تعذر قراءة الصورة')); };
            img.onload = function () {
                var steps = [[640, 0.82], [520, 0.74], [400, 0.66], [320, 0.58]];
                var out = null, type = 'image/webp';
                for (var i = 0; i < steps.length; i++) {
                    var max = steps[i][0], q = steps[i][1];
                    var ratio = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
                    var w = Math.max(1, Math.round(img.naturalWidth * ratio)), h = Math.max(1, Math.round(img.naturalHeight * ratio));
                    var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
                    var ctx = cv.getContext('2d');
                    out = cv.toDataURL('image/webp', q);
                    if (out.indexOf('data:image/webp') !== 0) {   // المتصفح لا يدعم WebP → JPEG بخلفية بيضاء
                        type = 'image/jpeg';
                        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
                        ctx.drawImage(img, 0, 0, w, h);
                        out = cv.toDataURL('image/jpeg', q);
                    } else {
                        ctx.drawImage(img, 0, 0, w, h);
                        out = cv.toDataURL('image/webp', q);
                    }
                    if (out.length < 120000) break;
                }
                URL.revokeObjectURL(url);
                fetch(out).then(function (r) { return r.blob(); })
                    .then(function (blob) { resolve({ dataUrl: out, blob: blob, type: type }); })
                    .catch(reject);
            };
            img.src = url;
        });
    }

    function pmgUploadImage(file, tag) {
        return pmgCompressImage(file).then(function (res) {
            var fallback = { url: res.dataUrl, mode: 'database' };
            var task = null;
            try {
                if (typeof firebase.storage === 'function') {
                    var st = firebase.storage();
                    try { st.setMaxUploadRetryTime(8000); } catch (e0) {}
                    var ext = res.type === 'image/webp' ? 'webp' : 'jpg';
                    var ref = st.ref('product_images/' + pmgSafeKey(tag) + '_' + Date.now() + '.' + ext);
                    task = Promise.race([
                        ref.put(res.blob, { contentType: res.type }).then(function () { return ref.getDownloadURL(); }),
                        new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timeout')); }, 12000); })
                    ]).then(function (u) { return { url: u, mode: 'storage' }; });
                }
            } catch (e) { task = null; }
            return task ? task.catch(function () { return fallback; }) : fallback;
        });
    }

    // ═══════════════════════════════════════════════════════════════
    //  بطاقة "+ إضافة منتج جديد" في آخر كل قائمة بالمتجر (للمدير فقط)
    //  كل صفحة عرض تعرف: ماذا تضيف (المصدر + القيم المعبّأة مسبقاً) وكيف تُحدَّث بعد الحفظ.
    // ═══════════════════════════════════════════════════════════════
    var pmgAddView = null;   // آخر صفحة عرض { name, args }

    function pmgIsAdminUser() {
        var u = auth.currentUser;
        return !!u && String(u.email || '').toLowerCase() === String(ADMIN_EMAIL).toLowerCase();
    }
    function pmgFind(arr, fn) { for (var i = 0; i < arr.length; i++) if (fn(arr[i])) return arr[i]; return null; }
    function pmgNamePrefix(n) { return n ? String(n).trim() + ' ' : ''; }

    // لكل دالة عرض: ماذا يضيف زر "+" ، وكيف نعيد بناء الصفحة بعد الحفظ (المجموعات تُبنى من جديد)
    var PMG_ADD_VIEWS = {
        renderProductsByCategory: {
            add: function (a) {
                if (a[0] === 'rased') return null;   // أسعار الرصيد ثابتة في الكود
                if (a[0] === 'app') return { src: 'appsData', preset: { category: 'app' } };
                return { src: 'products', preset: { category: a[0] } };
            },
            refresh: function (a) { renderProductsByCategory(a[0], a[1]); }
        },
        renderProductsByPlatform: {
            add: function (a) { return { src: 'products', preset: { category: 'social-media', platform: a[0] } }; },
            refresh: function (a) { renderProductsByPlatform(a[0], a[1]); }
        },
        renderPlatforms: {
            add: function () { return { src: 'products', preset: { category: 'social-media' } }; },
            refresh: function () { renderPlatforms(); }
        },
        renderGameGroups: {
            add: function () { return { src: 'gamesData', preset: { category: 'games' } }; },
            refresh: function () { renderGameGroups(); }
        },
        showGameTypes: {
            add: function (a) {
                var g = a[0] || {};
                return { src: 'gamesData', preset: { category: 'games', name: g.baseName ? g.baseName + ' - ' : '', image: g.image, inputLabel: g.inputLabel, description: g.description } };
            },
            refresh: function (a) {
                var g = pmgFind(buildGameGroups(), function (x) { return a[0] && x.baseName === a[0].baseName; });
                if (g) showGameTypes(g); else renderGameGroups();
            }
        },
        renderAppGroups: {
            add: function () { return { src: 'products', preset: { category: 'ارقام للتطبيقات' } }; },
            refresh: function () { renderAppGroups(); }
        },
        showAppProducts: {
            add: function (a) { var g = a[0] || {}; return { src: 'products', preset: { category: 'ارقام للتطبيقات', name: pmgNamePrefix(g.baseName), image: g.image } }; },
            refresh: function (a) {
                var g = pmgFind(buildAppGroups(), function (x) { return a[0] && x.baseName === a[0].baseName; });
                if (g) showAppProducts(g); else renderAppGroups();
            }
        },
        renderPremiumGroups: {
            add: function () { return { src: 'premiumActivationsData', preset: { category: 'تفعيلات بريميوم' } }; },
            refresh: function () { renderPremiumGroups(); }
        },
        showPremiumProducts: {
            add: function (a) { return a[0] && a[0].id !== undefined ? { src: 'premiumActivationsData', editId: a[0].id } : null; },
            refresh: function (a) {
                var g = pmgFind(premiumActivationsData, function (x) { return a[0] && String(x.id) === String(a[0].id); });
                if (g) showPremiumProducts(g); else renderPremiumGroups();
            }
        },
        renderVpnGroups: {
            add: function () { return { src: 'vpnData', preset: { category: 'اشتراكات VPN' } }; },
            refresh: function () { renderVpnGroups(); }
        },
        showVpnProducts: {
            add: function (a) { return a[0] && a[0].id !== undefined ? { src: 'vpnData', editId: a[0].id } : null; },
            refresh: function (a) {
                var g = pmgFind(vpnData, function (x) { return a[0] && String(x.id) === String(a[0].id); });
                if (g) showVpnProducts(g); else renderVpnGroups();
            }
        },
        renderPaymentGroups: {
            add: function () { return { src: 'electronicPaymentData', preset: { category: 'الدفع electronique' } }; },
            refresh: function () { renderPaymentGroups(); }
        },
        showPaymentSuperGroup: {
            add: function () { return { src: 'electronicPaymentData', preset: { category: 'الدفع electronique' } }; },
            refresh: function (a) {
                var sg = pmgFind(buildPaymentSuperGroups(), function (x) { return a[0] && x.key === a[0].key; });
                if (sg) showPaymentSuperGroup(sg); else renderPaymentGroups();
            }
        },
        showPaymentProducts: {
            add: function (a) { return a[0] && a[0].id !== undefined ? { src: 'electronicPaymentData', editId: a[0].id } : null; },
            refresh: function (a) {
                var g = pmgFind(electronicPaymentData, function (x) { return a[0] && String(x.id) === String(a[0].id); });
                if (g) showPaymentProducts(g, a[1]); else renderPaymentGroups();
            }
        },
        renderTvGroups: {
            add: function () { return { src: 'products', preset: { category: 'اشتراكات التلفاز' } }; },
            refresh: function () { renderTvGroups(); }
        },
        showTvProducts: {
            add: function (a) { var g = a[0] || {}; return { src: 'products', preset: { category: 'اشتراكات التلفاز', name: pmgNamePrefix(g.name), image: g.image } }; },
            refresh: function (a) {
                var g = pmgFind(buildTvGroups(), function (x) { return a[0] && x.name === a[0].name; });
                if (g) showTvProducts(g); else renderTvGroups();
            }
        },
        renderDesignGroups: {
            add: function () { return { src: 'products', preset: { category: 'برامج التصميم' } }; },
            refresh: function () { renderDesignGroups(); }
        },
        showDesignProducts: {
            add: function (a) { var g = a[0] || {}; return { src: 'products', preset: { category: 'برامج التصميم', name: pmgNamePrefix(g.name), image: g.image } }; },
            refresh: function (a) {
                var g = pmgFind(buildDesignGroups(), function (x) { return a[0] && x.name === a[0].name; });
                if (g) showDesignProducts(g); else renderDesignGroups();
            }
        },
        renderArqamGroups: {
            add: function (a) { return { src: 'products', preset: { category: a[0] } }; },
            refresh: function (a) { renderArqamGroups(a[0], a[1]); }
        },
        showArqamProducts: {
            add: function (a) { var g = a[0] || {}; return { src: 'products', preset: { category: a[1], name: pmgNamePrefix(g.name), image: g.image } }; },
            refresh: function (a) {
                var g = pmgFind(buildArqamGroups(a[1]), function (x) { return a[0] && x.name === a[0].name; });
                if (g) showArqamProducts(g, a[1], a[2]); else renderArqamGroups(a[1], a[2]);
            }
        }
    };

    function pmgRemoveAddCard() {
        var old = document.querySelectorAll('#productsGrid .pmg-add-card');
        Array.prototype.forEach.call(old, function (el) { el.parentNode.removeChild(el); });
    }

    function pmgAppendAddCard() {
        pmgRemoveAddCard();
        if (!pmgAddView || !pmgIsAdminUser() || typeof productsGrid === 'undefined' || !productsGrid) return;
        var spec = PMG_ADD_VIEWS[pmgAddView.name];
        var action = spec && spec.add(pmgAddView.args || []);
        if (!action || !pmgGetSource(action.src)) return;
        // نفس شكل باقي البطاقات في الصفحة (بطاقة منتج أو بطاقة مجموعة)
        var cls = productsGrid.querySelector('.product-card') ? 'product-card'
                : productsGrid.querySelector('.platform-card') ? 'platform-card' : 'category-card';
        var isEditGroup = action.editId !== undefined;
        var card = document.createElement('a');
        card.href = '#';
        card.className = cls + ' pmg-add-card';
        card.setAttribute('role', 'button');
        card.innerHTML = '<span class="pmg-add-plus"><i class="fas fa-plus"></i></span>' +
            '<span class="pmg-add-title">' + (isEditGroup ? 'إضافة باقة جديدة' : 'إضافة منتج جديد') + '</span>' +
            '<span class="pmg-add-sub">' + (isEditGroup ? 'في هذه المجموعة' : 'في هذا القسم') + '</span>';
        card.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            pmgOpenFromStore(action);
        });
        productsGrid.appendChild(card);
    }

    function pmgOpenFromStore(action) {
        if (action.editId !== undefined) {
            pmgOpenForm(action.src, action.editId);
            var spec = pmgGetSource(action.src).subList;
            if (spec && $('pmgSubRows')) {
                pmgAddSubRow(spec, null);
                var rows = $('pmgSubRows').querySelectorAll('.pmg-sub-row');
                var last = rows[rows.length - 1];
                setTimeout(function () {
                    if (!last) return;
                    try { last.scrollIntoView({ block: 'center' }); } catch (e) {}
                    var first = last.querySelector('input[data-subfield="name"]') || last.querySelector('input');
                    if (first) first.focus();
                }, 350);
            }
        } else {
            pmgOpenForm(action.src, null, action.preset);
            setTimeout(function () { var n = $('pmgFieldsWrap').querySelector('[data-field="name"]'); if (n) n.focus(); }, 350);
        }
        if (pmgEditingCtx) pmgEditingCtx.fromStore = true;
    }

    // بعد الحفظ من المتجر: نعيد بناء الصفحة المفتوحة لتظهر الإضافة فوراً
    function pmgRefreshAddView() {
        if (!pmgAddView) return;
        var spec = PMG_ADD_VIEWS[pmgAddView.name];
        var visible = typeof productsSection !== 'undefined' && productsSection && getComputedStyle(productsSection).display !== 'none';
        if (!spec || !visible) return;
        var y = window.pageYOffset;
        try { spec.refresh(pmgAddView.args || []); } catch (e) { console.error('refresh view', e); }
        try { window.scrollTo({ top: y, behavior: 'instant' }); } catch (e2) { window.scrollTo(0, y); }
    }

    function pmgWrapAddViews() {
        Object.keys(PMG_ADD_VIEWS).forEach(function (name) {
            var orig = window[name];
            if (typeof orig !== 'function') return;
            window[name] = function () {
                var args = Array.prototype.slice.call(arguments);
                var res = orig.apply(this, arguments);
                pmgAddView = { name: name, args: args };
                try { pmgAppendAddCard(); } catch (e) { console.error('add card', e); }
                return res;
            };
        });
        // دخول/خروج المدير وهو داخل صفحة منتجات: نُظهر أو نُخفي البطاقة فوراً
        auth.onAuthStateChanged(function () { try { pmgAppendAddCard(); } catch (e) {} });
    }

    // ═══════════════════════════════════════════════════════════════
    //  زر القلم ✎ فوق كل منتج في المتجر (للمدير فقط) ← يفتح نموذج التعديل الكامل مباشرة
    //  البطاقات تُعلَّم في catalog.js عبر pmgTagCard (data-pmg-src / data-pmg-id / data-pmg-row)
    // ═══════════════════════════════════════════════════════════════
    function pmgDecorateEditPencils() {
        var admin = pmgIsAdminUser();
        Array.prototype.forEach.call(document.querySelectorAll('[data-pmg-src]'), function (card) {
            // شارة الحالة (نفد المخزون للجميع، مخفي للمدير فقط)
            var it = pmgGetSource(card.dataset.pmgSrc) ? pmgFindItem(card.dataset.pmgSrc, card.dataset.pmgId) : null;
            var st = it ? it.availability : '';
            var rib = card.querySelector(':scope > .pmg-status-ribbon');
            card.classList.toggle('pmg-soldout', st === 'soldout');
            card.classList.toggle('pmg-hidden-item', st === 'hidden');
            if (PMG_AVAIL_TXT[st]) {
                if (!rib) { rib = document.createElement('span'); card.appendChild(rib); }
                rib.className = 'pmg-status-ribbon ' + st;
                rib.textContent = PMG_AVAIL_TXT[st];
            } else if (rib) rib.parentNode.removeChild(rib);

            var btn = card.querySelector(':scope > .pmg-edit-pencil');
            if (!admin) { if (btn) btn.parentNode.removeChild(btn); return; }
            if (btn || !pmgGetSource(card.dataset.pmgSrc)) return;
            btn = document.createElement('span');
            btn.className = 'pmg-edit-pencil';
            btn.setAttribute('role', 'button');
            btn.setAttribute('tabindex', '0');
            btn.title = card.dataset.pmgRow !== undefined ? 'تعديل هذه الباقة' : 'تعديل المنتج';
            btn.innerHTML = '<i class="fas fa-pen"></i>';
            card.appendChild(btn);
        });
    }

    function pmgOpenFromPencil(card) {
        var src = card.dataset.pmgSrc, id = card.dataset.pmgId, row = card.dataset.pmgRow;
        if (!pmgFindItem(src, id)) { showToast('تعذر العثور على هذا المنتج في قائمة الإدارة', 'error'); return; }
        pmgOpenForm(src, id);
        if (pmgEditingCtx) pmgEditingCtx.fromStore = true;
        // منتج داخل مجموعة باقات: نُبرز سطر هذه الباقة في النموذج
        if (row !== undefined && $('pmgSubRows')) {
            var target = null;
            Array.prototype.forEach.call($('pmgSubRows').querySelectorAll('.pmg-sub-row'), function (r) {
                var idIn = r.querySelector('[data-subfield="id"]');
                if (!target && idIn && String(idIn.value).trim() === String(row)) target = r;
            });
            if (target) {
                target.classList.add('pmg-sub-row-hl');
                setTimeout(function () {
                    try { target.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {}
                    var f = target.querySelector('[data-subfield="price"]'); if (f) f.focus();
                }, 350);
            }
        }
    }

    function pmgInitEditPencils() {
        // ضغطة القلم تُلتقط قبل وصولها للبطاقة حتى لا تفتح تفاصيل المنتج أو تنتقل لصفحة أخرى
        document.addEventListener('click', function (e) {
            var btn = e.target.closest && e.target.closest('.pmg-edit-pencil');
            if (!btn) {
                // منتج نفد من المخزون: لا تفاصيل ولا طلب
                var so = e.target.closest && e.target.closest('.pmg-soldout');
                if (so) { e.preventDefault(); e.stopPropagation(); showToast('عذراً، هذا المنتج نفد من المخزون حالياً', 'warn'); }
                return;
            }
            e.preventDefault(); e.stopPropagation();
            if (!pmgIsAdminUser()) return;
            var card = btn.closest('[data-pmg-src]');
            if (card) pmgOpenFromPencil(card);
        }, true);
        document.addEventListener('keydown', function (e) {
            if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('pmg-edit-pencil')) {
                e.preventDefault(); e.target.click();
            }
        });
        var timer = null;
        function schedule() { clearTimeout(timer); timer = setTimeout(pmgDecorateEditPencils, 60); }
        ['productsGrid', 'categoriesGrid'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el && window.MutationObserver) new MutationObserver(schedule).observe(el, { childList: true });
        });
        auth.onAuthStateChanged(schedule);
        schedule();
    }

    // ═══════════════════════════════════════════════════════════════
    //  أدوات المدير: السجل، الحالة والترتيب، النسخ، تحذير الخسارة، تعديل الأسعار دفعة واحدة
    // ═══════════════════════════════════════════════════════════════
    function pmgLog(text, ref) { if (typeof window.zoodnyLog === 'function') window.zoodnyLog('product', text, ref); }

    function pmgApplyVisibilityAndOrder() {
        var admin = pmgIsAdminUser();
        PMG_SOURCES.forEach(function (src) {
            var arr = src.getArr();
            if (!admin) for (var i = arr.length - 1; i >= 0; i--) if (arr[i] && arr[i].availability === 'hidden') arr.splice(i, 1);
            if (!arr.some(function (it) { return it && typeof it.sortOrder === 'number'; })) return;
            var tmp = arr.map(function (it, i) { return { it: it, i: i }; });
            tmp.sort(function (a, b) {
                var x = a.it && typeof a.it.sortOrder === 'number' ? a.it.sortOrder : Infinity;
                var y = b.it && typeof b.it.sortOrder === 'number' ? b.it.sortOrder : Infinity;
                return (x - y) || (a.i - b.i);
            });
            arr.length = 0;
            tmp.forEach(function (t) { arr.push(t.it); });
        });
    }

    // هل بند الطلب (من السلة) لمنتج نفد أو أُخفي؟ — يُستخدم في main.js قبل إتمام الطلب
    window.zoodnyLineUnavailable = function (line) {
        if (!line) return false;
        try {
            var cat = line.category || '', id = String(line.id), nm = String(line.name || '').split(' | ')[0];
            if (cat === 'games') return gamesData.some(function (g) { return pmgUnavailable(g) && (g.name === nm || String(g.id) === id); });
            if (cat === 'app') return appsData.some(function (a) { return pmgUnavailable(a) && (a.name === nm || String(a.id) === id); });
            if (/بريميوم|VPN|الدفع/.test(cat)) {
                return [premiumActivationsData, vpnData, electronicPaymentData].some(function (arr) {
                    return arr.some(function (g) {
                        return pmgUnavailable(g) && (g.products || []).some(function (r) { return r && String(r.id) === id && r.name === nm; });
                    });
                });
            }
            return products.some(function (p) { return pmgUnavailable(p) && String(p.id) === id && (!p.category || p.category === cat); });
        } catch (e) { return false; }
    };

    function pmgDuplicate(sourceKey, id) {
        var item = pmgFindItem(sourceKey, id);
        if (!item) return;
        var copy = JSON.parse(JSON.stringify(item));
        delete copy.id;
        copy.name = (copy.name || '') + ' (نسخة)';
        copy.__costFrom = item.id;
        pmgOpenForm(sourceKey, null, copy);
        $('pmgFormTitle').textContent = 'نسخة جديدة من: ' + item.name;
        setTimeout(function () { var n = $('pmgFieldsWrap').querySelector('[data-field="name"]'); if (n) { n.focus(); n.select(); } }, 350);
    }

    // ── تحذير الخسارة: يقارن سعر البيع (مفرق وجملة) برأس المال في النموذج المفتوح ──
    var PMG_PRICE_TRIPLES = [['price', 'wholesalePrice', 'cost'], ['basePrice', 'wholesaleBasePrice', 'costBase'], ['unitPrice', 'wholesaleUnitPrice', 'unitCost']];
    function pmgNumIn(el) { if (!el || !pmgFieldIsVisible(el)) return null; var v = pmgToNumber(String(el.value).trim()); return typeof v === 'number' ? v : null; }
    function pmgLossList() {
        var out = [], wrap = $('pmgFieldsWrap');
        if (!wrap) return out;
        PMG_PRICE_TRIPLES.forEach(function (t) {
            var cost = pmgNumIn(wrap.querySelector('[data-field="' + t[2] + '"]'));
            if (cost === null || cost <= 0) return;
            var r = pmgNumIn(wrap.querySelector('[data-field="' + t[0] + '"]'));
            var w = pmgNumIn(wrap.querySelector('[data-field="' + t[1] + '"]'));
            if (r !== null && r > 0 && r < cost) out.push('سعر المفرق ' + r + '$ أقل من رأس المال ' + cost + '$ (خسارة ' + +(cost - r).toFixed(2) + '$)');
            if (w !== null && w > 0 && w < cost) out.push('سعر الجملة ' + w + '$ أقل من رأس المال ' + cost + '$ (خسارة ' + +(cost - w).toFixed(2) + '$)');
        });
        Array.prototype.forEach.call(document.querySelectorAll('#pmgSubRows .pmg-sub-row'), function (row, i) {
            var g = function (k) { var el = row.querySelector('[data-subfield="' + k + '"]'); if (!el) return null; var v = pmgToNumber(String(el.value).trim()); return typeof v === 'number' ? v : null; };
            var cost = g('cost'); if (cost === null || cost <= 0) return;
            var label = (row.querySelector('[data-subfield="name"]') || row.querySelector('[data-subfield="display"]') || {}).value || ('السطر ' + (i + 1));
            var r = g('price'), w = g('wholesalePrice');
            if (r !== null && r > 0 && r < cost) out.push(label + ': المفرق ' + r + '$ أقل من رأس المال ' + cost + '$');
            if (w !== null && w > 0 && w < cost) out.push(label + ': الجملة ' + w + '$ أقل من رأس المال ' + cost + '$');
        });
        return out;
    }
    function pmgCheckLoss() {
        var box = $('pmgLossWarn');
        if (!box) return;
        var l = pmgLossList();
        box.style.display = l.length ? '' : 'none';
        box.innerHTML = l.length ? '<i class="fas fa-exclamation-triangle"></i> <b>تحذير: بيع بخسارة</b><ul>' + l.map(function (x) { return '<li>' + pmgEsc(x) + '</li>'; }).join('') + '</ul>' : '';
    }

    // ── تعديل الأسعار دفعة واحدة (للقسم والتصنيف والبحث المعروض حالياً) ──
    var PMG_BULK_SKIP_CATS = ['games', 'app', 'rased'];   // نسخ داخل products لها نماذجها الخاصة
    function pmgBulkTargets() {
        var src = pmgGetSource($('pmgSourceSelect').value);
        var catFilter = $('pmgCategorySelect').value;
        var q = ($('pmgSearchInput').value || '').trim().toLowerCase();
        var list = src.getArr().filter(function (it) {
            if (!it) return false;
            if (src.key === 'products' && PMG_BULK_SKIP_CATS.indexOf(it.category) !== -1) return false;
            if (catFilter && it.category !== catFilter) return false;
            if (q && String(it.name || '').toLowerCase().indexOf(q) === -1) return false;
            return true;
        });
        return { src: src, list: list, cat: catFilter, q: q };
    }
    function pmgBulkCalc(v, op, val, step) {
        if (typeof v !== 'number' || !(v > 0)) return v;
        var n = op === 'inc%' ? v * (1 + val / 100) : op === 'dec%' ? v * (1 - val / 100) : op === 'add' ? v + val : v - val;
        n = Math.round(n / step) * step;
        n = Math.round(n * 100) / 100;
        return n < 0 ? 0 : n;
    }
    // يطبّق التعديل على نسخة من المنتج + رأس ماله ← يُرجع { item, cost, changed, sample }
    function pmgBulkApplyOne(src, it, o) {
        var item = JSON.parse(JSON.stringify(it)), changed = false, sample = null;
        var cost = JSON.parse(JSON.stringify(pmgCostEntry(src.key, it.id) || null));
        var mainKeys = PMG_PRICE_TRIPLES;
        mainKeys.forEach(function (t) {
            if (o.retail && typeof item[t[0]] === 'number' && item[t[0]] > 0) {
                var nv = pmgBulkCalc(item[t[0]], o.op, o.val, o.step);
                if (nv !== item[t[0]]) { if (!sample) sample = [item[t[0]], nv]; item[t[0]] = nv; changed = true; }
            }
            if (o.wholesale && typeof item[t[1]] === 'number' && item[t[1]] > 0) {
                var nw = pmgBulkCalc(item[t[1]], o.op, o.val, o.step);
                if (nw !== item[t[1]]) { item[t[1]] = nw; changed = true; }
            }
            if (o.cost && cost && typeof cost[t[2]] === 'number' && cost[t[2]] > 0) {
                cost[t[2]] = pmgBulkCalc(cost[t[2]], o.op, o.val, o.step); changed = true;
            }
        });
        if (src.subList && Array.isArray(item[src.subList.key])) {
            item[src.subList.key].forEach(function (r) {
                if (!r) return;
                if (o.retail && typeof r.price === 'number' && r.price > 0) {
                    var nv = pmgBulkCalc(r.price, o.op, o.val, o.step);
                    if (nv !== r.price) { if (!sample) sample = [r.price, nv]; r.price = nv; changed = true; }
                }
                if (o.wholesale && typeof r.wholesalePrice === 'number' && r.wholesalePrice > 0) {
                    var nw = pmgBulkCalc(r.wholesalePrice, o.op, o.val, o.step);
                    if (nw !== r.wholesalePrice) { r.wholesalePrice = nw; changed = true; }
                }
            });
            if (o.cost && cost && cost.rows) Object.keys(cost.rows).forEach(function (k) {
                var cr = cost.rows[k];
                if (cr && typeof cr.cost === 'number' && cr.cost > 0) { cr.cost = pmgBulkCalc(cr.cost, o.op, o.val, o.step); changed = true; }
            });
        }
        if (item.category === 'social-media' && typeof item.basePrice === 'number' && typeof item.description === 'string') {
            item.description = item.description.replace(/سعر الألف:\s*[\d.]+\s*\$/, 'سعر الألف: ' + item.basePrice + '$');
        }
        if (cost) cost.updatedAt = Date.now();
        return { item: item, cost: cost, changed: changed, sample: sample };
    }

    function pmgOpenBulk() {
        var T = pmgBulkTargets();
        var ov = $('pmgBulkOv');
        if (!ov) {
            ov = document.createElement('div');
            ov.id = 'pmgBulkOv';
            ov.className = 'adm-user-ov';
            ov.style.zIndex = '4300';
            ov.innerHTML = '<div class="adm-pw-modal pmg-bulk-modal" role="dialog" aria-modal="true">' +
                '<div class="adm-user-head"><div class="adm-user-title"><i class="fas fa-percentage"></i> تعديل الأسعار دفعة واحدة</div>' +
                '<button class="adm-user-close" id="pmgBulkClose" aria-label="إغلاق"><i class="fas fa-times"></i></button></div>' +
                '<div class="adm-pw-body">' +
                    '<div class="pmg-bulk-scope" id="pmgBulkScope"></div>' +
                    '<div class="pmg-field"><label>العملية</label><select id="pmgBulkOp">' +
                        '<option value="inc%">رفع الأسعار بنسبة %</option><option value="dec%">تخفيض الأسعار بنسبة %</option>' +
                        '<option value="add">زيادة مبلغ ثابت ($)</option><option value="sub">إنقاص مبلغ ثابت ($)</option></select></div>' +
                    '<div class="pmg-field"><label>القيمة</label><input type="text" id="pmgBulkVal" inputmode="decimal" dir="ltr" placeholder="مثال: 10"></div>' +
                    '<div class="pmg-field"><label>تقريب السعر الناتج</label><select id="pmgBulkStep">' +
                        '<option value="0.01">بدون تقريب (0.01)</option><option value="0.05">لأقرب 0.05</option><option value="0.1">لأقرب 0.10</option>' +
                        '<option value="0.25">لأقرب 0.25</option><option value="0.5">لأقرب 0.50</option><option value="1">لأقرب 1$</option></select></div>' +
                    '<div class="pmg-field"><label>تطبيق على</label><div class="pmg-bulk-checks">' +
                        '<label><input type="checkbox" id="pmgBulkRetail" checked> سعر المفرق</label>' +
                        '<label><input type="checkbox" id="pmgBulkWholesale" checked> سعر الجملة</label>' +
                        '<label><input type="checkbox" id="pmgBulkCost"> رأس المال</label></div></div>' +
                    '<div class="pmg-bulk-preview" id="pmgBulkPreview"></div>' +
                    '<button type="button" class="pmg-save-btn" id="pmgBulkApply"><i class="fas fa-check"></i> تطبيق التعديل</button>' +
                '</div></div>';
            document.body.appendChild(ov);
            $('pmgBulkClose').onclick = function () { ov.classList.remove('on'); };
            ov.addEventListener('click', function (e) { if (e.target === ov) ov.classList.remove('on'); });
            ['pmgBulkOp', 'pmgBulkVal', 'pmgBulkStep', 'pmgBulkRetail', 'pmgBulkWholesale', 'pmgBulkCost'].forEach(function (id) {
                $(id).addEventListener('input', pmgBulkPreview); $(id).addEventListener('change', pmgBulkPreview);
            });
            $('pmgBulkApply').onclick = pmgBulkRun;
        }
        $('pmgBulkScope').innerHTML = '<i class="fas fa-filter"></i> سيُطبَّق على <b>' + T.list.length + '</b> منتج من: <b>' + pmgEsc(T.src.label) + '</b>' +
            (T.cat ? ' — التصنيف: <b>' + pmgEsc(T.cat) + '</b>' : ' — كل التصنيفات') + (T.q ? ' — البحث: <b>' + pmgEsc(T.q) + '</b>' : '') +
            '<div class="pmg-bulk-hint">لتغيير النطاق: أغلق النافذة واختر القسم/التصنيف أو اكتب في البحث، ثم افتحها مجدداً.</div>';
        $('pmgBulkVal').value = '';
        pmgBulkPreview();
        ov.classList.add('on');
        setTimeout(function () { $('pmgBulkVal').focus(); }, 150);
    }
    function pmgBulkOpts() {
        var v = pmgToNumber(String($('pmgBulkVal').value).trim());
        return { op: $('pmgBulkOp').value, val: typeof v === 'number' ? v : NaN, step: Number($('pmgBulkStep').value) || 0.01,
                 retail: $('pmgBulkRetail').checked, wholesale: $('pmgBulkWholesale').checked, cost: $('pmgBulkCost').checked };
    }
    function pmgBulkPreview() {
        var o = pmgBulkOpts(), T = pmgBulkTargets(), box = $('pmgBulkPreview');
        if (!(o.val > 0)) { box.innerHTML = '<span class="muted">اكتب قيمة لترى معاينة الأسعار الجديدة</span>'; return; }
        if (!o.retail && !o.wholesale && !o.cost) { box.innerHTML = '<span class="muted">اختر نوع سعر واحد على الأقل</span>'; return; }
        var rows = [], n = 0;
        T.list.forEach(function (it) {
            var r = pmgBulkApplyOne(T.src, it, o);
            if (!r.changed) return;
            n++;
            if (rows.length < 8) rows.push('<tr><td>' + pmgEsc(it.name) + '</td><td>' + (r.sample ? r.sample[0] + '$' : '—') + '</td><td><b>' + (r.sample ? r.sample[1] + '$' : '—') + '</b></td></tr>');
        });
        box.innerHTML = n ? '<div><b>' + n + '</b> منتج ستتغير أسعاره. معاينة:</div><table><thead><tr><th>المنتج</th><th>قبل</th><th>بعد</th></tr></thead><tbody>' + rows.join('') + '</tbody></table>' + (n > 8 ? '<div class="muted">و ' + (n - 8) + ' منتج آخر...</div>' : '')
                          : '<span class="muted">لا توجد أسعار ستتغير بهذه الإعدادات</span>';
    }
    function pmgBulkRun() {
        var o = pmgBulkOpts(), T = pmgBulkTargets();
        if (!(o.val > 0)) { alert('اكتب قيمة صحيحة أكبر من صفر'); return; }
        if (!o.retail && !o.wholesale && !o.cost) { alert('اختر نوع سعر واحد على الأقل'); return; }
        if ((o.op === 'dec%') && o.val >= 100) { alert('نسبة التخفيض يجب أن تكون أقل من 100%'); return; }
        var updates = {}, n = 0;
        T.list.forEach(function (it) {
            var r = pmgBulkApplyOne(T.src, it, o);
            if (!r.changed) return;
            n++;
            var key = pmgSafeKey(it.id);
            updates['product_overrides/' + T.src.key + '/' + key] = r.item;
            updates['product_deletions/' + T.src.key + '/' + key] = null;
            if (o.cost && r.cost) updates['product_costs/' + T.src.key + '/' + key] = r.cost;
        });
        if (!n) { alert('لا توجد أسعار ستتغير'); return; }
        var opTxt = { 'inc%': 'رفع ' + o.val + '%', 'dec%': 'تخفيض ' + o.val + '%', 'add': 'زيادة ' + o.val + '$', 'sub': 'إنقاص ' + o.val + '$' }[o.op];
        var what = [o.retail && 'المفرق', o.wholesale && 'الجملة', o.cost && 'رأس المال'].filter(Boolean).join(' و');
        if (!confirm(opTxt + ' على أسعار ' + what + ' لـ ' + n + ' منتج؟\n\nيظهر التعديل لكل الزوار فوراً.')) return;
        var btn = $('pmgBulkApply'); btn.disabled = true;
        db.ref().update(updates).then(function () {
            showToast('✓ تم تعديل أسعار ' + n + ' منتج', 'success');
            $('pmgBulkOv').classList.remove('on');
            pmgLog('تعديل أسعار دفعة واحدة: ' + opTxt + ' على ' + what + ' — ' + n + ' منتج من ' + T.src.label.split(' (')[0] + (T.cat ? ' / ' + T.cat : '') + (T.q ? ' (بحث: ' + T.q + ')' : ''));
        }).catch(function (err) {
            alert('فشل التعديل: ' + (err && err.message ? err.message : err));
        }).then(function () { btn.disabled = false; });
    }

    function pmgInit() {
        pmgInitSourceSelect();
        pmgPopulateCategoryFilter();
        pmgRenderGrid();

        pmgStartLive();
        pmgWrapAddViews();
        pmgWatchCosts();
        pmgInitEditPencils();

        $('pmgAddBtn').addEventListener('click', function () { pmgOpenForm($('pmgSourceSelect').value, null); });
        if ($('pmgBulkBtn')) $('pmgBulkBtn').addEventListener('click', pmgOpenBulk);
        $('pmgCategorySelect').addEventListener('change', pmgRenderGrid);
        $('pmgSearchInput').addEventListener('input', pmgRenderGrid);
        $('pmgCancelBtn').addEventListener('click', function () { modalOff('prodModalOv', 'prodEditModal'); });
        $('prodModalOv').addEventListener('click', function () { modalOff('prodModalOv', 'prodEditModal'); });

        $('pmgForm').addEventListener('submit', function (e) {
            e.preventDefault();
            if (pmgUploading) { alert('انتظر حتى ينتهي رفع الصورة ثم اضغط حفظ'); return; }
            var src = pmgGetSource(pmgEditingCtx.sourceKey);
            var idRaw = $('pmgFieldId').value.trim();
            if (!idRaw) { alert('الرجاء إدخال معرف (ID) للمنتج'); return; }
            var newId = src.idType === 'number' ? Number(idRaw) : idRaw;
            if (src.idType === 'number' && isNaN(newId)) { alert('المعرف يجب أن يكون رقماً لهذا النوع من البيانات'); return; }

            var arr = src.getArr();
            var existing = pmgEditingCtx.id !== null ? pmgFindItem(pmgEditingCtx.sourceKey, pmgEditingCtx.id) : null;
            var fromStore = !!pmgEditingCtx.fromStore;

            var dup = null;
            for (var i = 0; i < arr.length; i++) { if (String(arr[i].id) === String(newId)) { dup = arr[i]; break; } }
            if (dup && (!existing || dup !== existing)) {
                alert('هذا المعرف (ID) مستخدم مسبقاً لمنتج آخر، الرجاء اختيار معرف مختلف');
                return;
            }

            var nameEl = $('pmgFieldsWrap').querySelector('[data-field="name"]');
            if (!nameEl || !nameEl.value.trim()) { alert('الرجاء إدخال اسم المنتج'); return; }

            // ── قراءة الحقول والتحقق من الأرقام قبل أي تعديل ──
            var values = {}, costVals = {}, badField = null;
            src.fields.forEach(function (f) {
                if (badField) return;
                var el = $('pmgFieldsWrap').querySelector('[data-field="' + f.key + '"]');
                if (!el || !pmgFieldIsVisible(el)) return;   // الحقول المخفية تبقى كما هي
                var v = el.value;
                if (f.cost) {   // رأس المال: فارغ = غير محدد (لا نحفظه صفراً)، ولا يُحفظ مع بيانات المنتج العامة
                    if (v.trim() === '') { costVals[f.key] = null; return; }
                    v = pmgToNumber(v.trim());
                    if (typeof v !== 'number' || v < 0) { badField = f.label; return; }
                    costVals[f.key] = v;
                    return;
                }
                if (f.optional && v.trim() === '') { values[f.key] = null; return; }   // حقل اختياري فارغ ← يُحذف
                if (f.type === 'number') {
                    // المتصفح يعيد قيمة فارغة إذا كُتب نص غير رقمي في حقل رقمي — لا نحفظها كصفر
                    if (el.validity && el.validity.badInput) { badField = f.label; return; }
                    v = v.trim() === '' ? 0 : pmgToNumber(v.trim());
                    if (typeof v !== 'number' || v < 0) { badField = f.label; return; }
                } else {
                    v = v.trim();
                }
                values[f.key] = v;
            });
            if (badField) { alert('قيمة غير صحيحة في حقل: ' + String(badField).replace(/<[^>]*>/g, '').trim() + '\nاكتب رقماً صحيحاً (مثال: 2.5)'); return; }
            if (values.reqType && !values.reqLabel) {
                alert('اخترت أن المنتج يحتاج معلومة من الزبون — اكتب ماذا تطلب منه (مثال: رابط حساب الإنستغرام)');
                var rl = $('pmgFieldsWrap').querySelector('[data-field="reqLabel"]'); if (rl) rl.focus();
                return;
            }

            var subArr = null, subCosts = [];
            if (src.subList) {
                subArr = [];
                var subRows = document.querySelectorAll('#pmgSubRows .pmg-sub-row');
                Array.prototype.forEach.call(subRows, function (row, idx) {
                    if (badField) return;
                    var subObj = {}, rowCost = null;
                    var hasAny = false;
                    src.subList.fields.forEach(function (f) {
                        var input = row.querySelector('[data-subfield="' + f.key + '"]');
                        var v = input ? input.value.trim() : '';
                        if (f.cost) {
                            if (v === '') return;
                            v = pmgToNumber(v);
                            if (typeof v !== 'number' || v < 0) badField = f.label + ' (السطر ' + (idx + 1) + ')';
                            else rowCost = v;
                            return;
                        }
                        if (v !== '') hasAny = true;
                        if (f.type === 'number') {
                            v = v === '' ? 0 : pmgToNumber(v);
                            if (typeof v !== 'number' || v < 0) badField = f.label + ' (السطر ' + (idx + 1) + ')';
                        }
                        subObj[f.key] = v;
                    });
                    if (hasAny) { subArr.push(subObj); subCosts.push(rowCost); }
                });
                if (badField) { alert('قيمة غير صحيحة في: ' + badField + '\nاكتب رقماً صحيحاً (مثال: 2.5)'); return; }
            }

            var losses = pmgLossList();
            if (losses.length && !confirm('⚠️ تحذير: البيع بخسارة!\n\n' + losses.join('\n') + '\n\nهل تريد الحفظ رغم ذلك؟')) return;

            // للسجل: القيم قبل التعديل
            var LOG_KEYS = ['name', 'price', 'wholesalePrice', 'basePrice', 'wholesaleBasePrice', 'unitPrice', 'wholesaleUnitPrice', 'availability'];
            var LOG_LBL = { name: 'الاسم', price: 'السعر', wholesalePrice: 'سعر الجملة', basePrice: 'سعر الألف', wholesaleBasePrice: 'سعر الألف جملة', unitPrice: 'سعر الوحدة', wholesaleUnitPrice: 'سعر الوحدة جملة', availability: 'الحالة' };
            var before = {};
            if (existing) LOG_KEYS.forEach(function (k) { before[k] = existing[k]; });
            var beforeRows = existing && src.subList ? JSON.stringify(existing[src.subList.key] || []) : null;

            var obj = existing || {};
            obj.id = newId;
            Object.keys(values).forEach(function (k) { obj[k] = values[k]; });
            if (subArr) obj[src.subList.key] = subArr;

            // خدمات السوشال ميديا: نحدّث نص "سعر الألف" داخل الوصف إن وُجد
            if (obj.category === 'social-media' && typeof obj.basePrice === 'number' && typeof obj.description === 'string') {
                obj.description = obj.description.replace(/سعر الألف:\s*[\d.]+\s*\$/, 'سعر الألف: ' + obj.basePrice + '$');
            }

            var isNew = !existing;
            if (isNew) { arr.push(obj); }

            pmgPopulateCategoryFilter();
            pmgRenderGrid();
            modalOff('prodModalOv', 'prodEditModal');

            var safeId = pmgSafeKey(newId);

            // ── رأس المال: مسار منفصل للمدير فقط (يُحفظ معه الاسم ليبقى حساب الأرباح صحيحاً حتى لو حُذف المنتج) ──
            var prevCost = pmgCostEntry(src.key, newId) || {};
            var costObj = { name: obj.name || '', category: obj.category || '', updatedAt: Date.now() };
            var hasCost = false;
            src.fields.forEach(function (f) {
                if (!f.cost) return;
                var v = Object.prototype.hasOwnProperty.call(costVals, f.key) ? costVals[f.key] : prevCost[f.key];
                if (typeof v === 'number') { costObj[f.key] = v; hasCost = true; }
            });
            if (subArr) {
                var rowsMap = {};
                subArr.forEach(function (r, i) {
                    if (typeof subCosts[i] !== 'number') return;
                    rowsMap[pmgRowKey(src.key, r)] = { id: (r.id !== undefined && r.id !== '') ? r.id : null, name: r.name || r.display || '', value: r.value !== undefined ? r.value : null, cost: subCosts[i] };
                    hasCost = true;
                });
                if (Object.keys(rowsMap).length) costObj.rows = rowsMap;
            }
            var costRef = dbRef('product_costs/' + src.key + '/' + safeId);
            var costSave = (hasCost ? costRef.set(costObj) : costRef.remove()).catch(function (err) {
                showToast('تم حفظ المنتج لكن تعذر حفظ سعر رأس المال — تأكد من نشر قواعد Firebase الجديدة: ' + (err && err.message ? err.message : err), 'error');
            });

            dbRef('product_overrides/' + src.key + '/' + safeId).set(obj)
                .then(function () {
                    return Promise.all([dbRef('product_deletions/' + src.key + '/' + safeId).remove(), costSave]);
                })
                .then(function () {
                    showToast(isNew ? 'تمت إضافة المنتج وحفظه بشكل دائم على المتجر' : 'تم حفظ التعديلات بشكل دائم على المتجر', 'success');
                    // سجل النشاط: ماذا تغيّر
                    var changes = [];
                    if (!isNew) {
                        LOG_KEYS.forEach(function (k) {
                            var a = before[k], b = obj[k];
                            if ((a === undefined || a === null || a === '') && (b === undefined || b === null || b === '')) return;
                            if (String(a) === String(b)) return;
                            var fmt = function (v) { return k === 'availability' ? (PMG_AVAIL_TXT[v] || 'متاح') : (v === undefined || v === null || v === '' ? '—' : v); };
                            changes.push(LOG_LBL[k] + ': ' + fmt(a) + ' ← ' + fmt(b));
                        });
                        if (src.subList && beforeRows !== JSON.stringify(obj[src.subList.key] || [])) changes.push('تعديل الباقات/الفئات');
                        ['cost', 'costBase', 'unitCost'].forEach(function (k) {
                            if (prevCost[k] !== costObj[k] && (typeof prevCost[k] === 'number' || typeof costObj[k] === 'number'))
                                changes.push('رأس المال: ' + (typeof prevCost[k] === 'number' ? prevCost[k] : '—') + ' ← ' + (typeof costObj[k] === 'number' ? costObj[k] : '—'));
                        });
                    }
                    pmgLog((isNew ? 'إضافة منتج "' : 'تعديل المنتج "') + (obj.name || '') + '" (' + src.label.split(' (')[0] + ')' +
                        (changes.length ? ' — ' + changes.join('، ') : (isNew ? '' : ' — بدون تغيير في الأسعار')), src.key + '/' + safeId);
                    if (fromStore) pmgRefreshAddView();
                    // منتج جديد: نعرض على المدير إرسال إشعار للعملاء عنه (جاهز للتعديل قبل الإرسال)
                    if (isNew && typeof window.admPrefillBroadcast === 'function'
                        && confirm('تمت إضافة "' + (obj.name || 'المنتج') + '".\n\nهل تريد إرسال إشعار للعملاء بالمنتج الجديد؟')) {
                        var priceTxt = (typeof obj.price === 'number' && obj.price > 0) ? ' بسعر ' + obj.price + '$' : '';
                        window.admPrefillBroadcast('منتج جديد في زودني 🎉', 'وصلنا الآن: ' + (obj.name || '') + priceTxt + ' — اطلبه الآن!');
                    }
                })
                .catch(function (err) {
                    showToast('تم التعديل على الشاشة لكن تعذر حفظه بشكل دائم: ' + (err && err.message ? err.message : err), 'error');
                });
        });
    }

    pmgInit();
}());
