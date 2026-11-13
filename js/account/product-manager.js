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

    var PMG_SOURCES = [
        {
            key: 'products', label: 'منتجات عامة (إكسسوارات، أرقام، اشتراكات فردية...)',
            getArr: function () { return products; }, idType: 'number',
            fields: [
                { key: 'name', label: 'اسم المنتج', type: 'text', required: true },
                { key: 'category', label: 'التصنيف (Category)', type: 'category', required: true },
                { key: 'price', label: 'السعر ($)', type: 'number', hideFor: ['social-media'] },
                // ── حقول خاصة بخدمات السوشال ميديا (السعر الفعلي = سعر الألف) ──
                { key: 'platform', label: 'المنصة', type: 'select', showFor: ['social-media'],
                  options: function () { return platforms.map(function (p) { return [p.id, p.name]; }); } },
                { key: 'basePrice', label: 'سعر الألف ($)', type: 'number', showFor: ['social-media'] },
                { key: 'minQuantity', label: 'الحد الأدنى للكمية', type: 'number', showFor: ['social-media'] },
                { key: 'maxQuantity', label: 'الحد الأقصى للكمية', type: 'number', showFor: ['social-media'] },
                // ── حقل خاص ببرامج التصميم ──
                { key: 'inputLabel', label: 'نص حقل الإدخال (مثل: الإيميل)', type: 'text', showFor: ['برامج التصميم'] },
                { key: 'description', label: 'الوصف', type: 'textarea' },
                { key: 'image', label: 'اسم ملف الصورة', type: 'text' }
            ]
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
                { key: 'unitPrice', label: 'سعر الوحدة الواحدة ($)', type: 'number' },
                { key: 'minQuantity', label: 'الحد الأدنى للكمية', type: 'number' },
                { key: 'maxQuantity', label: 'الحد الأقصى للكمية', type: 'number' }
            ]
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
            ],
            subList: {
                key: 'amounts', label: 'فئات الشحن (الكمية / السعر / النص المعروض)',
                fields: [
                    { key: 'value', label: 'القيمة', type: 'number' },
                    { key: 'price', label: 'السعر ($)', type: 'number' },
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
            ],
            subList: {
                key: 'products', label: 'الباقات والأسعار',
                fields: [
                    { key: 'id', label: 'رقم', type: 'number' },
                    { key: 'name', label: 'اسم الباقة', type: 'text' },
                    { key: 'price', label: 'السعر ($)', type: 'number' }
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
            ],
            subList: {
                key: 'products', label: 'الباقات والأسعار',
                fields: [
                    { key: 'id', label: 'رقم', type: 'number' },
                    { key: 'name', label: 'اسم الباقة', type: 'text' },
                    { key: 'price', label: 'السعر ($)', type: 'number' }
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
            ],
            subList: {
                key: 'products', label: 'الباقات والأسعار',
                fields: [
                    { key: 'id', label: 'رقم', type: 'number' },
                    { key: 'name', label: 'اسم الباقة', type: 'text' },
                    { key: 'price', label: 'السعر ($)', type: 'number' }
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

    function pmgGetSource(key) { return PMG_SOURCES.filter(function (s) { return s.key === key; })[0]; }

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
            if (src.key === 'products') priceLine = (it.price !== undefined && it.price !== null) ? (it.price + ' $') : '';
            else if (src.key === 'appsData') priceLine = 'سعر الوحدة: ' + (it.unitPrice !== undefined ? it.unitPrice : '-') + ' $';
            else if (src.subList) priceLine = ((it[src.subList.key] || []).length) + ' باقة/فئة';
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
                        '<div class="pmg-card-sub">ID: ' + pmgEsc(it.id) + '</div>' +
                    '</div>' +
                    '<div class="pmg-card-foot">' +
                        '<button type="button" class="pmg-edit-btn" data-id="' + pmgEsc(it.id) + '"><i class="fas fa-edit"></i> تعديل</button>' +
                        '<button type="button" class="pmg-del-btn" data-id="' + pmgEsc(it.id) + '"><i class="fas fa-trash"></i> حذف</button>' +
                    '</div>' +
                '</div>';
        }).join('');

        Array.prototype.forEach.call(grid.querySelectorAll('.pmg-edit-btn'), function (b) {
            b.addEventListener('click', function () { pmgOpenForm(src.key, b.dataset.id); });
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
        Array.prototype.forEach.call(wrap.querySelectorAll('.pmg-field[data-show-for], .pmg-field[data-hide-for]'), function (box) {
            var show = true;
            if (box.dataset.showFor) show = box.dataset.showFor.split('|').indexOf(cat) !== -1;
            if (box.dataset.hideFor && box.dataset.hideFor.split('|').indexOf(cat) !== -1) show = false;
            box.style.display = show ? '' : 'none';
        });
    }

    function pmgFieldIsVisible(el) {
        var box = el.closest('.pmg-field');
        return !box || box.style.display !== 'none';
    }

    function pmgOpenForm(sourceKey, id) {
        var src = pmgGetSource(sourceKey);
        var item = id !== null && id !== undefined ? pmgFindItem(sourceKey, id) : null;
        pmgEditingCtx = { sourceKey: sourceKey, id: item ? item.id : null };
        $('pmgFormTitle').textContent = item ? ('تعديل: ' + item.name) : ('إضافة منتج جديد — ' + src.label);

        var idVal = item ? item.id : pmgSuggestId(src);
        var idFieldHtml = '<div class="pmg-field"><label>المعرف (ID)' +
            (src.idType === 'string' ? ' — نص فريد، مثال: my-new-item' : ' — رقم فريد غير مستخدم') + '</label>' +
            '<input type="text" id="pmgFieldId" value="' + pmgEsc(idVal) + '"' + (item ? ' readonly style="background:#f4f6f9;color:#888"' : '') + '></div>';

        var fieldsHtml = src.fields.map(function (f) {
            var val = item ? (item[f.key] !== undefined && item[f.key] !== null ? item[f.key] : '') : (f.default !== undefined ? f.default : '');
            var cond = (f.showFor ? ' data-show-for="' + pmgEsc(f.showFor.join('|')) + '"' : '') +
                       (f.hideFor ? ' data-hide-for="' + pmgEsc(f.hideFor.join('|')) + '"' : '');
            var open = '<div class="pmg-field"' + cond + '><label>' + f.label + '</label>';
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
        pmgApplyFieldVisibility();

        var subWrap = $('pmgSubListWrap');
        if (src.subList) {
            var rows = item && Object.prototype.toString.call(item[src.subList.key]) === '[object Array]' ? item[src.subList.key] : [];
            subWrap.innerHTML = '<div class="pmg-sub-title"><span>' + src.subList.label + '</span> <button type="button" class="pmg-sub-add" id="pmgSubAddRow"><i class="fas fa-plus"></i> إضافة سطر</button></div>' +
                '<div id="pmgSubRows"></div>';
            rows.forEach(function (r) { pmgAddSubRow(src.subList, r); });
            $('pmgSubAddRow').addEventListener('click', function () { pmgAddSubRow(src.subList, null); });
        } else {
            subWrap.innerHTML = '';
        }

        modalOn('prodModalOv', 'prodEditModal');
    }

    function pmgAddSubRow(subListSpec, data) {
        var rowsWrap = $('pmgSubRows');
        var row = document.createElement('div');
        row.className = 'pmg-sub-row';
        row.innerHTML = subListSpec.fields.map(function (f) {
            var v = data && data[f.key] !== undefined && data[f.key] !== null ? data[f.key] : '';
            return '<input type="text" placeholder="' + f.label + '" data-subfield="' + f.key + '" value="' + pmgEsc(v) + '">';
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

    function pmgInit() {
        pmgInitSourceSelect();
        pmgPopulateCategoryFilter();
        pmgRenderGrid();

        pmgStartLive();

        $('pmgAddBtn').addEventListener('click', function () { pmgOpenForm($('pmgSourceSelect').value, null); });
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

            var dup = null;
            for (var i = 0; i < arr.length; i++) { if (String(arr[i].id) === String(newId)) { dup = arr[i]; break; } }
            if (dup && (!existing || dup !== existing)) {
                alert('هذا المعرف (ID) مستخدم مسبقاً لمنتج آخر، الرجاء اختيار معرف مختلف');
                return;
            }

            var nameEl = $('pmgFieldsWrap').querySelector('[data-field="name"]');
            if (!nameEl || !nameEl.value.trim()) { alert('الرجاء إدخال اسم المنتج'); return; }

            // ── قراءة الحقول والتحقق من الأرقام قبل أي تعديل ──
            var values = {}, badField = null;
            src.fields.forEach(function (f) {
                if (badField) return;
                var el = $('pmgFieldsWrap').querySelector('[data-field="' + f.key + '"]');
                if (!el || !pmgFieldIsVisible(el)) return;   // الحقول المخفية تبقى كما هي
                var v = el.value;
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
            if (badField) { alert('قيمة غير صحيحة في حقل: ' + badField + '\nاكتب رقماً صحيحاً (مثال: 2.5)'); return; }

            var subArr = null;
            if (src.subList) {
                subArr = [];
                var subRows = document.querySelectorAll('#pmgSubRows .pmg-sub-row');
                Array.prototype.forEach.call(subRows, function (row, idx) {
                    if (badField) return;
                    var subObj = {};
                    var hasAny = false;
                    src.subList.fields.forEach(function (f) {
                        var input = row.querySelector('[data-subfield="' + f.key + '"]');
                        var v = input ? input.value.trim() : '';
                        if (v !== '') hasAny = true;
                        if (f.type === 'number') {
                            v = v === '' ? 0 : pmgToNumber(v);
                            if (typeof v !== 'number' || v < 0) badField = f.label + ' (السطر ' + (idx + 1) + ')';
                        }
                        subObj[f.key] = v;
                    });
                    if (hasAny) subArr.push(subObj);
                });
                if (badField) { alert('قيمة غير صحيحة في: ' + badField + '\nاكتب رقماً صحيحاً (مثال: 2.5)'); return; }
            }

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
            dbRef('product_overrides/' + src.key + '/' + safeId).set(obj)
                .then(function () {
                    return dbRef('product_deletions/' + src.key + '/' + safeId).remove();
                })
                .then(function () {
                    showToast(isNew ? 'تمت إضافة المنتج وحفظه بشكل دائم على المتجر' : 'تم حفظ التعديلات بشكل دائم على المتجر', 'success');
                })
                .catch(function (err) {
                    showToast('تم التعديل على الشاشة لكن تعذر حفظه بشكل دائم: ' + (err && err.message ? err.message : err), 'error');
                });
        });
    }

    pmgInit();
}());
