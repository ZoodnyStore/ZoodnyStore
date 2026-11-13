/* ══════════════════════════════════════════════════════════════════════
 * نافذة إدخال الخدمات الموحدة
 * سوشال ميديا، تطبيقات، رصيد، ألعاب، بريميوم.
 * ══════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';
    const { $ } = window.ZoodnyAccount;

    // ══════════════════════════════════════════════════════════════════
    //   Service Input Modal — unified handler for ALL product types
    //   that require user input (social-media + others with inputLabel)
    // ══════════════════════════════════════════════════════════════════

    // Platform config
    var SVC_PLATFORMS = {
        instagram: { label:'إنستغرام',  icon:'fab fa-instagram', cls:'platform-instagram' },
        facebook:  { label:'فيسبوك',    icon:'fab fa-facebook',  cls:'platform-facebook'  },
        tiktok:    { label:'تيك توك',   icon:'fab fa-tiktok',    cls:'platform-tiktok'    },
        youtube:   { label:'يوتيوب',    icon:'fab fa-youtube',   cls:'platform-youtube'   },
        telegram:  { label:'تليغرام',   icon:'fab fa-telegram',  cls:'platform-telegram'  },
        rased:     { label:'رصيد',       icon:'fas fa-phone-alt', cls:'platform-default'   },
        games:     { label:'ألعاب',      icon:'fas fa-gamepad',   cls:'platform-default'   },
        app:       { label:'تطبيقات',    icon:'fas fa-mobile-alt',cls:'platform-default'   },
        default:   { label:'خدمة',       icon:'fas fa-shopping-bag',cls:'platform-default' }
    };

    // Determine what URL/link type is needed for a social product
    function getSocialLinkConfig(product) {
        var n = (product.name || '').toLowerCase();
        var p = (product.platform || '').toLowerCase();

        if (p === 'instagram' || n.includes('إنستغرام') || n.includes('instagram')) {
            if (n.includes('مشاهدات') || n.includes('لايكات') || n.includes('مشاركات'))
                return { label:'رابط المنشور/الفيديو', placeholder:'https://www.instagram.com/p/...', help:'أدخل رابط المنشور أو الريلز الذي تريد دعمه' };
            return { label:'رابط الحساب', placeholder:'https://www.instagram.com/username', help:'أدخل رابط حساب الإنستغرام الذي تريد دعمه' };
        }
        if (p === 'facebook' || n.includes('فيسبوك') || n.includes('facebook')) {
            if (n.includes('اعضاء') || n.includes('كروب'))
                return { label:'رابط الكروب/المجموعة', placeholder:'https://www.facebook.com/groups/...', help:'أدخل رابط مجموعة الفيسبوك' };
            if (n.includes('تفاعل') || n.includes('لايكات') || n.includes('قلوب') || n.includes('مشاهدات'))
                return { label:'رابط المنشور', placeholder:'https://www.facebook.com/username/posts/...', help:'أدخل رابط المنشور الذي تريد دعمه' };
            return { label:'رابط الصفحة/الحساب', placeholder:'https://www.facebook.com/pagename', help:'أدخل رابط صفحة أو حساب الفيسبوك' };
        }
        if (p === 'tiktok' || n.includes('تيك توك') || n.includes('tiktok')) {
            if (n.includes('مشاهدات') || n.includes('لايكات') || n.includes('مشاركات') || n.includes('نقاط'))
                return { label:'رابط الفيديو', placeholder:'https://www.tiktok.com/@username/video/...', help:'أدخل رابط فيديو التيك توك' };
            return { label:'رابط الحساب', placeholder:'https://www.tiktok.com/@username', help:'أدخل رابط حساب التيك توك' };
        }
        if (p === 'telegram' || n.includes('تليغرام') || n.includes('telegram')) {
            if (n.includes('اعضاء'))
                return { label:'رابط القناة/المجموعة', placeholder:'https://t.me/channelname', help:'أدخل رابط قناة أو مجموعة التليغرام' };
            return { label:'رابط المنشور', placeholder:'https://t.me/username/123', help:'أدخل رابط المنشور في التليغرام' };
        }
        if (p === 'youtube' || n.includes('يوتيوب') || n.includes('youtube')) {
            if (n.includes('مشتركين'))
                return { label:'رابط القناة', placeholder:'https://www.youtube.com/@channelname', help:'أدخل رابط قناة اليوتيوب' };
            return { label:'رابط الفيديو', placeholder:'https://www.youtube.com/watch?v=...', help:'أدخل رابط فيديو اليوتيوب' };
        }
        return { label:'رابط الحساب/الصفحة', placeholder:'https://...', help:'أدخل الرابط المطلوب' };
    }

    // State
    var _svcProduct = null;
    var _svcType    = null; // 'social' | 'app' | 'credit' | 'game' | 'premium' | 'other'

    // ── Hide / Show bottom nav ───────────────────────────────────────
    function svcHideBottomNav() {
        var bn = document.getElementById('mobileBottomNav');
        if (bn) { bn.style.transform='translateX(-50%) translateY(120%)'; bn.style.opacity='0'; bn.style.pointerEvents='none'; }
        var fb = document.getElementById('floatingBalBadge');
        if (fb) fb.style.display='none';
    }
    function svcShowBottomNav() {
        var bn = document.getElementById('mobileBottomNav');
        if (bn) { bn.style.transform=''; bn.style.opacity=''; bn.style.pointerEvents=''; }
        var fb = document.getElementById('floatingBalBadge');
        if (fb && ZoodnyAccount.getCurrentUser()) fb.style.display='';
    }

    // ── Main open function ───────────────────────────────────────────
    window.openServiceInputModal = function(product) {
        _svcProduct = product;
        var modal   = document.getElementById('serviceInputModal');
        var header  = document.getElementById('svcModalHeader');
        var iconEl  = document.getElementById('svcHeaderIconI');
        var titleEl = document.getElementById('svcHeaderTitle');
        var subEl   = document.getElementById('svcHeaderSub');
        var fields  = document.getElementById('svcFieldsContainer');
        var priceBox= document.getElementById('svcPriceBox');
        var confirmBtn= document.getElementById('svcConfirmBtn');
        var step1   = document.getElementById('svcStep1');
        var step2   = document.getElementById('svcStep2');
        var step3   = document.getElementById('svcStep3');

        // Reset
        fields.innerHTML = '';
        priceBox.style.display = 'none';
        confirmBtn.disabled = false;
        confirmBtn.onclick = null;
        [step1,step2,step3].forEach(function(s){ s.classList.remove('active','done'); });
        step1.classList.add('active');

        // Detect type
        var cat = product.category || '';
        var plt = (product.platform || cat || 'default').toLowerCase();

        var pCfg = SVC_PLATFORMS[plt] || SVC_PLATFORMS[cat] || SVC_PLATFORMS.default;

        // Platform class
        header.className = 'svc-modal-header ' + pCfg.cls;
        iconEl.className = pCfg.icon;
        titleEl.textContent = product.name || 'خدمة';

        // Build fields based on category
        if (cat === 'social-media') {
            _svcType = 'social';
            var linkCfg = getSocialLinkConfig(product);
            subEl.textContent = 'أدخل الرابط والكمية المطلوبة';
            _buildSvcSteps3(fields, linkCfg, product, priceBox, confirmBtn, step1, step2, step3);
        } else if (cat === 'app') {
            _svcType = 'app';
            var appData = appsData.find(function(a){ return a.name === product.name; });
            if (!appData) { showToast('بيانات المنتج غير متوفرة', 'error'); return; }
            if (!appData.unitPrice || appData.unitPrice === 0) {
                showToast('هذه الخدمة غير متوفرة حالياً', 'warn'); return;
            }
            subEl.textContent = 'أدخل رقم اللاعب والكمية';
            _buildSvcApp(fields, appData, product, priceBox, confirmBtn, step1, step2, step3);
        } else if (cat === 'rased') {
            _svcType = 'credit';
            subEl.textContent = 'اختر القيمة وأدخل رقم الهاتف';
            _buildSvcCredit(fields, product, priceBox, confirmBtn, step1, step2, step3);
        } else if (cat === 'games') {
            _svcType = 'game';
            var gameData = gamesData.find(function(g){ return g.name === product.name; });
            if (!gameData) { showToast('بيانات اللعبة غير متوفرة', 'error'); return; }
            subEl.textContent = 'اختر الكمية وأدخل رقم اللاعب';
            _buildSvcGame(fields, gameData, product, priceBox, confirmBtn, step1, step2, step3);
        } else if (cat === 'تفعيلات بريميوم') {
            _svcType = 'premium';
            subEl.textContent = 'أدخل البيانات المطلوبة';
            _buildSvcPremium(fields, product, priceBox, confirmBtn, step1, step2, step3);
        } else {
            subEl.textContent = 'أدخل البيانات المطلوبة';
            _svcType = 'other';
            _buildSvcOther(fields, product, priceBox, confirmBtn);
        }

        // Show modal + hide bottom nav
        modal.classList.add('active');
        svcHideBottomNav();
    };

    // Close handlers
    document.getElementById('svcCloseBtn').onclick = function() {
        document.getElementById('serviceInputModal').classList.remove('active');
        svcShowBottomNav();
    };
    document.getElementById('serviceInputModal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
            svcShowBottomNav();
        }
    });

    // ── Step helper ──────────────────────────────────────────────────
    function _updateSteps(s1, s2, s3, linkFilled, qtyFilled) {
        s1.classList.toggle('done',   linkFilled);
        s1.classList.toggle('active', !linkFilled);
        s2.classList.toggle('done',   qtyFilled && linkFilled);
        s2.classList.toggle('active', linkFilled && !qtyFilled);
        s3.classList.toggle('active', linkFilled && qtyFilled);
    }

    // ── SOCIAL MEDIA builder ─────────────────────────────────────────
    function _buildSvcSteps3(container, linkCfg, product, priceBox, confirmBtn, s1, s2, s3) {
        var minQ = product.minQuantity || 300;
        var maxQ = product.maxQuantity || 1000000;
        var ppt  = product.basePrice || 0;

        container.innerHTML =
            // Link field
            '<div class="svc-input-group" id="svcLinkGrp">'
            + '<div class="svc-input-label"><i class="fas fa-link"></i> ' + linkCfg.label + ' <span class="req">*</span></div>'
            + '<input type="url" class="svc-input" id="svcLinkInput" placeholder="' + linkCfg.placeholder + '" autocomplete="off" dir="ltr">'
            + '<div class="svc-input-help"><i class="fas fa-info-circle"></i> ' + linkCfg.help + '</div>'
            + '</div>'
            // Quantity field
            + '<div class="svc-input-group" id="svcQtyGrp">'
            + '<div class="svc-input-label"><i class="fas fa-sort-amount-up"></i> الكمية المطلوبة <span class="req">*</span></div>'
            + '<input type="number" class="svc-input" id="svcQtyInput" placeholder="مثال: 1000" min="' + minQ + '" max="' + maxQ + '" step="1">'
            + '<div class="svc-qty-range"><span>الحد الأدنى: ' + minQ.toLocaleString() + '</span><span>الحد الأقصى: ' + maxQ.toLocaleString() + '</span></div>'
            + '</div>';

        var linkEl = document.getElementById('svcLinkInput');
        var qtyEl  = document.getElementById('svcQtyInput');
        var barFill= document.getElementById('zNotifyBarFill');

        function updatePriceSvc() {
            var qty = parseInt(qtyEl.value);
            var linkOk = linkEl.value.trim().length > 8;
            _updateSteps(s1, s2, s3, linkOk, qty >= minQ && qty <= maxQ);
            if (qty >= minQ && ppt > 0) {
                var price = (qty / 1000) * ppt;
                document.getElementById('svcPriceAmt').textContent = price.toFixed(2) + '$';
                document.getElementById('svcPriceSub').textContent = 'سعر الألف: ' + ppt.toFixed(2) + '$';
                priceBox.style.display = 'block';
            } else {
                priceBox.style.display = 'none';
            }
        }
        linkEl.addEventListener('input', updatePriceSvc);
        qtyEl.addEventListener('input',  updatePriceSvc);

        confirmBtn.onclick = function() {
            var link = linkEl.value.trim();
            var qty  = parseInt(qtyEl.value);

            linkEl.classList.remove('has-error');
            qtyEl.classList.remove('has-error');

            if (!link || link.length < 10) {
                linkEl.classList.add('has-error');
                linkEl.focus();
                showToast('يرجى إدخال الرابط أولاً', 'warn'); return;
            }
            if (!link.startsWith('http')) {
                linkEl.classList.add('has-error');
                linkEl.focus();
                showToast('الرابط غير صحيح، يجب أن يبدأ بـ https://', 'warn'); return;
            }
            if (!qty || qty < minQ) {
                qtyEl.classList.add('has-error');
                qtyEl.focus();
                showToast('الحد الأدنى للكمية هو ' + minQ.toLocaleString(), 'warn'); return;
            }
            if (qty > maxQ) {
                qtyEl.classList.add('has-error');
                qtyEl.focus();
                showToast('الحد الأقصى للكمية هو ' + maxQ.toLocaleString(), 'warn'); return;
            }

            // Add to cart with socialLink
            addToCartWithLink(product.id, qty, link);
            document.getElementById('serviceInputModal').classList.remove('active');
            svcShowBottomNav();
        };
    }

    // ── APP builder ──────────────────────────────────────────────────
    function _buildSvcApp(container, appData, product, priceBox, confirmBtn, s1, s2, s3) {
        // Show steps: PlayerID → Quantity
        var minQ = appData.minQuantity || 1;
        var maxQ = appData.maxQuantity || 999999999;
        var labelTxt = appData.inputLabel || 'رقم اللاعب (User ID)';
        var phTxt    = appData.inputPlaceholder || 'أدخل رقم اللاعب';

        // Update step labels
        s1.innerHTML = '<i class="fas fa-id-badge"></i> ' + (labelTxt.includes('غير') ? 'المعرّف' : labelTxt.split('(')[0].trim());
        s2.innerHTML = '<i class="fas fa-sort-amount-up"></i> الكمية';

        container.innerHTML =
            '<div class="svc-input-group">'
            + '<div class="svc-input-label"><i class="fas fa-id-badge"></i> ' + labelTxt + ' <span class="req">*</span></div>'
            + '<input type="text" class="svc-input" id="svcPlayerIdInput" placeholder="' + phTxt + '" autocomplete="off" dir="ltr">'
            + '<div class="svc-input-help"><i class="fas fa-info-circle"></i> أدخل المعرّف الخاص بحسابك في التطبيق</div>'
            + '</div>'
            + '<div class="svc-input-group">'
            + '<div class="svc-input-label"><i class="fas fa-coins"></i> الكمية المطلوبة <span class="req">*</span></div>'
            + '<input type="number" class="svc-input" id="svcAppQtyInput" placeholder="أدخل الكمية" min="' + minQ + '" max="' + maxQ + '" step="1">'
            + '<div class="svc-qty-range"><span>الحد الأدنى: ' + minQ.toLocaleString() + '</span><span>الحد الأقصى: ' + maxQ.toLocaleString() + '</span></div>'
            + '</div>';

        var pidEl = document.getElementById('svcPlayerIdInput');
        var qtyEl = document.getElementById('svcAppQtyInput');

        function updatePriceApp() {
            var qty   = parseInt(qtyEl.value);
            var pidOk = pidEl.value.trim().length > 0;
            _updateSteps(s1, s2, s3, pidOk, qty >= minQ);
            if (qty >= minQ && appData.unitPrice > 0) {
                var price = appData.unitPrice * qty;
                document.getElementById('svcPriceAmt').textContent = price.toFixed(2) + '$';
                document.getElementById('svcPriceSub').textContent = 'سعر القطعة: ' + appData.unitPrice + '$';
                priceBox.style.display = 'block';
            } else {
                priceBox.style.display = 'none';
            }
        }
        pidEl.addEventListener('input', updatePriceApp);
        qtyEl.addEventListener('input', updatePriceApp);

        confirmBtn.onclick = function() {
            var pid = pidEl.value.trim();
            var qty = parseInt(qtyEl.value);
            pidEl.classList.remove('has-error');
            qtyEl.classList.remove('has-error');

            if (!pid) {
                pidEl.classList.add('has-error'); pidEl.focus();
                showToast('يرجى إدخال ' + labelTxt, 'warn'); return;
            }
            if (!qty || qty < minQ) {
                qtyEl.classList.add('has-error'); qtyEl.focus();
                showToast('الحد الأدنى للكمية هو ' + minQ.toLocaleString(), 'warn'); return;
            }
            if (qty > maxQ) {
                qtyEl.classList.add('has-error'); qtyEl.focus();
                showToast('الحد الأقصى للكمية هو ' + maxQ.toLocaleString(), 'warn'); return;
            }
            addToCart(product.id, null, null, null, null, null, pid, qty);
            document.getElementById('serviceInputModal').classList.remove('active');
            svcShowBottomNav();
        };
    }

    // ── CREDIT builder ───────────────────────────────────────────────
    function _buildSvcCredit(container, product, priceBox, confirmBtn, s1, s2, s3) {
        s1.innerHTML = '<i class="fas fa-list"></i> الفئة';
        s2.innerHTML = '<i class="fas fa-phone"></i> الهاتف';
        s3.innerHTML = '<i class="fas fa-check"></i> تأكيد';

        var priceList = [];
        if (product.name.includes('سيرياتيل')) priceList = creditAmounts.syriatel;
        else if (product.name.includes('MTN'))  priceList = creditAmounts.mtn;

        var opts = '<option value="">-- اختر قيمة الرصيد --</option>';
        priceList.forEach(function(item) {
            opts += '<option value="' + item.value + '" data-price="' + item.price + '">' + item.value + ' ل.س — ' + item.price + '$</option>';
        });

        container.innerHTML =
            '<div class="svc-input-group">'
            + '<div class="svc-input-label"><i class="fas fa-list-alt"></i> قيمة الرصيد <span class="req">*</span></div>'
            + '<select class="svc-input" id="svcCreditAmt">' + opts + '</select>'
            + '</div>'
            + '<div class="svc-input-group">'
            + '<div class="svc-input-label"><i class="fas fa-phone"></i> رقم الهاتف <span class="req">*</span></div>'
            + '<input type="tel" class="svc-input" id="svcPhoneInput" placeholder="09xxxxxxxx" dir="ltr">'
            + '<div class="svc-input-help"><i class="fas fa-info-circle"></i> يجب أن يبدأ الرقم بـ 09 ويتكون من 10 أرقام</div>'
            + '</div>';

        var selEl   = document.getElementById('svcCreditAmt');
        var phoneEl = document.getElementById('svcPhoneInput');

        function updatePriceCredit() {
            var opt   = selEl.options[selEl.selectedIndex];
            var selOk = selEl.value !== '';
            var phOk  = phoneEl.value.trim().length > 5;
            _updateSteps(s1, s2, s3, selOk, phOk);
            if (opt && opt.value) {
                document.getElementById('svcPriceAmt').textContent = parseFloat(opt.getAttribute('data-price')).toFixed(2) + '$';
                document.getElementById('svcPriceSub').textContent = 'قيمة: ' + opt.value + ' ل.س';
                priceBox.style.display = 'block';
            } else {
                priceBox.style.display = 'none';
            }
        }
        selEl.addEventListener('change', updatePriceCredit);
        phoneEl.addEventListener('input', updatePriceCredit);

        confirmBtn.onclick = function() {
            var amount = selEl.value;
            var phone  = phoneEl.value.trim();
            selEl.classList.remove('has-error');
            phoneEl.classList.remove('has-error');

            if (!amount) {
                selEl.classList.add('has-error'); selEl.focus();
                showToast('يرجى اختيار قيمة الرصيد', 'warn'); return;
            }
            if (!phone) {
                phoneEl.classList.add('has-error'); phoneEl.focus();
                showToast('يرجى إدخال رقم الهاتف', 'warn'); return;
            }
            if (!/^09[0-9]{8}$/.test(phone)) {
                phoneEl.classList.add('has-error'); phoneEl.focus();
                showToast('رقم الهاتف غير صحيح، يجب أن يبدأ بـ 09 ويتكون من 10 أرقام', 'warn'); return;
            }
            addToCart(product.id, null, null, phone, amount);
            document.getElementById('serviceInputModal').classList.remove('active');
            svcShowBottomNav();
        };
    }

    // ── GAME builder ─────────────────────────────────────────────────
    function _buildSvcGame(container, gameData, product, priceBox, confirmBtn, s1, s2, s3) {
        var labelTxt = gameData.inputLabel || 'رقم اللاعب (User ID)';
        s1.innerHTML = '<i class="fas fa-list"></i> الكمية';
        s2.innerHTML = '<i class="fas fa-id-badge"></i> المعرّف';
        s3.innerHTML = '<i class="fas fa-check"></i> تأكيد';

        var opts = '<option value="">-- اختر الكمية --</option>';
        (gameData.amounts || []).forEach(function(a) {
            opts += '<option value="' + a.value + '" data-price="' + a.price + '">' + a.display + ' — ' + a.price + '$</option>';
        });

        container.innerHTML =
            '<div class="svc-input-group">'
            + '<div class="svc-input-label"><i class="fas fa-coins"></i> الكمية <span class="req">*</span></div>'
            + '<select class="svc-input" id="svcGameAmtSel">' + opts + '</select>'
            + '</div>'
            + '<div class="svc-input-group">'
            + '<div class="svc-input-label"><i class="fas fa-id-badge"></i> ' + labelTxt + ' <span class="req">*</span></div>'
            + '<input type="text" class="svc-input" id="svcGamePidInput" placeholder="أدخل المعرّف" autocomplete="off" dir="ltr">'
            + '<div class="svc-input-help"><i class="fas fa-info-circle"></i> أدخل رقم اللاعب (User ID) الخاص بك</div>'
            + '</div>';

        var selEl = document.getElementById('svcGameAmtSel');
        var pidEl = document.getElementById('svcGamePidInput');

        function updatePriceGame() {
            var opt   = selEl.options[selEl.selectedIndex];
            var selOk = selEl.value !== '';
            var pidOk = pidEl.value.trim().length > 0;
            _updateSteps(s1, s2, s3, selOk, pidOk);
            if (opt && opt.value) {
                document.getElementById('svcPriceAmt').textContent = parseFloat(opt.getAttribute('data-price')).toFixed(2) + '$';
                document.getElementById('svcPriceSub').textContent = opt.text.split('—')[0].trim();
                priceBox.style.display = 'block';
            } else { priceBox.style.display = 'none'; }
        }
        selEl.addEventListener('change', updatePriceGame);
        pidEl.addEventListener('input',  updatePriceGame);

        confirmBtn.onclick = function() {
            var amount = selEl.value;
            var pid    = pidEl.value.trim();
            selEl.classList.remove('has-error');
            pidEl.classList.remove('has-error');

            if (!amount) {
                selEl.classList.add('has-error'); selEl.focus();
                showToast('يرجى اختيار الكمية', 'warn'); return;
            }
            if (!pid) {
                pidEl.classList.add('has-error'); pidEl.focus();
                showToast('يرجى إدخال ' + labelTxt, 'warn'); return;
            }
            addToCart(product.id, null, null, null, null, amount, pid);
            document.getElementById('serviceInputModal').classList.remove('active');
            svcShowBottomNav();
        };
    }

    // ── PREMIUM builder ──────────────────────────────────────────────
    function _buildSvcPremium(container, product, priceBox, confirmBtn, s1, s2, s3) {
        s1.innerHTML = '<i class="fas fa-key"></i> البيانات';
        s2.classList.add('done');
        s3.innerHTML = '<i class="fas fa-check"></i> تأكيد';

        // Find premium data
        var premData = null;
        if (typeof premiumActivationsData !== 'undefined') {
            premiumActivationsData.forEach(function(g) {
                (g.products || []).forEach(function(p) { if (p.id === product.id) premData = p; });
            });
        }
        var labelTxt = (premData && premData.inputLabel) ? premData.inputLabel : 'أدخل البيانات المطلوبة';
        var phTxt    = (premData && premData.inputPlaceholder) ? premData.inputPlaceholder : '';

        // Price
        priceBox.style.display = 'block';
        document.getElementById('svcPriceAmt').textContent = (parseFloat(product.price)||0).toFixed(2) + '$';
        document.getElementById('svcPriceSub').textContent = product.name;

        container.innerHTML =
            '<div class="svc-input-group">'
            + '<div class="svc-input-label"><i class="fas fa-key"></i> ' + labelTxt + ' <span class="req">*</span></div>'
            + '<input type="text" class="svc-input" id="svcPremiumInput" placeholder="' + phTxt + '" autocomplete="off">'
            + '</div>';

        var inputEl = document.getElementById('svcPremiumInput');
        inputEl.addEventListener('input', function() {
            _updateSteps(s1, s2, s3, inputEl.value.trim().length > 0, true);
        });

        confirmBtn.onclick = function() {
            var val = inputEl.value.trim();
            inputEl.classList.remove('has-error');
            if (!val) {
                inputEl.classList.add('has-error'); inputEl.focus();
                showToast('يرجى إدخال البيانات المطلوبة', 'warn'); return;
            }
            addToCart(product.id, null, product.price, null, null, null, null, null, val);
            document.getElementById('serviceInputModal').classList.remove('active');
            svcShowBottomNav();
        };
    }

    // ── OTHER/GENERIC builder ────────────────────────────────────────
    function _buildSvcOther(container, product, priceBox, confirmBtn) {
        priceBox.style.display = 'block';
        document.getElementById('svcPriceAmt').textContent = (parseFloat(product.price)||0).toFixed(2) + '$';
        document.getElementById('svcPriceSub').textContent = product.name;

        container.innerHTML = '';

        confirmBtn.onclick = function() {
            addToCart(product.id);
            document.getElementById('serviceInputModal').classList.remove('active');
            svcShowBottomNav();
        };
    }

    // ── addToCartWithLink: extends addToCart for social-media with link ─
    function addToCartWithLink(productId, customQuantity, socialLink) {
        var product = products.find(function(p){ return p.id === productId; });
        if (!product) return;

        var itemPrice = calculateSocialMediaPrice(productId, customQuantity);
        var existing  = cart.find(function(i){ return i.id === productId && i.socialLink === socialLink; });

        if (existing) {
            existing.customQuantity = (existing.customQuantity || 0) + customQuantity;
            existing.price = calculateSocialMediaPrice(productId, existing.customQuantity);
        } else {
            cart.push({
                id:            product.id,
                name:          product.name,
                basePrice:     product.basePrice || product.price,
                price:         itemPrice,
                quantity:      1,
                customQuantity:customQuantity,
                socialLink:    socialLink,
                category:      product.category,
                perThousand:   product.perThousand || null
            });
        }
        localStorage.setItem('zoodnyCart', JSON.stringify(cart));
        updateCartUI();
        checkForSocialMediaProducts();
        showToast('تمت إضافة ' + product.name + ' للسلة!', 'success');
    }
}());
