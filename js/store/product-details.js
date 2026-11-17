/* ══════════════════════════════════════════════════════════════════════
 * نوافذ تفاصيل المنتجات
 * تفاصيل المنتج، منتجات الدفع/VPN/التلفاز/التصميم، نافذة إيميل التصميم.
 * ══════════════════════════════════════════════════════════════════════ */

// ── قالب موحّد لنافذة التفاصيل (يُستخدم لكل أنواع المنتجات) ──
// الأسماء .product-details-* ثابتة: يعتمد عليها التعديل المباشر للمدير وحالة "نفذ المخزون" (product-manager.js)
function pdEsc(s) { return String(s === null || s === undefined ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function pdMarkup(o) {
    var isNum = /^\s*[\d.]+\s*\$/.test(String(o.price || ''));
    var wa = 'https://wa.me/963939083098?text=' + encodeURIComponent('مرحباً، أريد الاستفسار عن: ' + (o.name || ''));
    return `
        <div class="product-details-image">
            <img src="${o.image}" alt="${pdEsc(o.name)}" onerror="this.onerror=null;this.src='images/placeholder.svg'">
        </div>
        <div class="product-details-info">
            <span class="product-details-category"><i class="fas fa-tag"></i> ${o.category}</span>
            <h2 class="product-details-title">${o.name}</h2>

            <div class="pd-price-card">
                <div class="pd-price-main">
                    <div class="pd-price-lbl">${o.priceLabel || 'السعر'}</div>
                    <div class="product-details-price${isNum ? '' : ' pd-price-text'}">${o.price}</div>
                </div>
                <div class="pd-trust">
                    <span><i class="fas fa-bolt"></i> تنفيذ سريع</span>
                    <span><i class="fas fa-wallet"></i> الدفع من رصيدك</span>
                    <span><i class="fas fa-headset"></i> دعم 24/7</span>
                </div>
            </div>

            <div class="pd-sec">
                <div class="pd-sec-t"><i class="fas fa-align-right"></i> وصف المنتج</div>
                <div class="product-details-description">${o.description || o.name}</div>
            </div>

            <div class="pd-sec">
                <div class="pd-sec-t"><i class="fas fa-star"></i> المميزات</div>
                <ul class="product-details-features">${o.features}</ul>
            </div>

            <div class="product-details-actions">
                <div class="pd-bar-price"><small>الإجمالي</small><b>${o.price}</b></div>
                <button class="product-details-add-to-cart" ${o.orderAttrs}><i class="fas fa-bolt"></i> اطلب الآن</button>
                <a class="pd-wa" href="${wa}" target="_blank" rel="noopener" title="استفسار عبر واتساب"><i class="fab fa-whatsapp"></i></a>
            </div>
        </div>`;
}

// -------------------- عرض تفاصيل المنتج --------------------
function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const category = categories.find(c => c.id === product.category);
    const imageUrl = product.image || "images/placeholder.svg";
    
    let priceDisplay = '';
    let categoryName = category?.name || 'غير مصنف';
    
    if (product.category === 'social-media') {
        priceDisplay = `${product.basePrice || product.price}$ لـ 1k`;
    } else if (product.category === 'rased' || product.category === 'games' || product.category === 'app') {
        priceDisplay = 'اختر الكمية';
    } else {
        priceDisplay = product.price > 0 ? `${product.price}$` : 'قريباً';
    }
    
    let badgeText = '';
    if (product.category === 'food') badgeText = 'طبيعي';
    else if (product.category === 'games') badgeText = 'رقمي';
    else if (product.category === 'social-media') badgeText = 'خدمة';
    else if (product.category === 'rased') badgeText = 'رصيد';
    else if (product.category === 'app') badgeText = 'تطبيق';
    
    let featuresHtml = '';
    if (product.category === 'social-media') {
        featuresHtml = `
                    <li><i class="fas fa-check-circle"></i> الحد الأدنى: ${product.minQuantity || 300}</li>
                    <li><i class="fas fa-check-circle"></i> الحد الأقصى: ${(product.maxQuantity || 1000000).toLocaleString()}</li>
                    <li><i class="fas fa-check-circle"></i> غيـــر مكفوووول</li>
                    <li><i class="fas fa-check-circle"></i> يستغرق الوصول من 5 الى 15 دقيقة</li>
                `;
    } else if (product.category === 'rased') {
        featuresHtml = `
                    <li><i class="fas fa-check-circle"></i> يتم الإرسال خلال 5 دقائق</li>
                    <li><i class="fas fa-check-circle"></i> تحتاج إدخال رقم الهاتف</li>
                    <li><i class="fas fa-check-circle"></i> متوفر لجميع الخطوط</li>
                `;
    } else if (product.category === 'games') {
        const gameData = gamesData.find(g => g.name === product.name);
        featuresHtml = `
                    <li><i class="fas fa-check-circle"></i> شحن فوري</li>
                    <li><i class="fas fa-check-circle"></i> تحتاج إدخال رقم اللاعب</li>
                    <li><i class="fas fa-check-circle"></i> متوفر لجميع الخوادم</li>
                    ${gameData ? `<li><i class="fas fa-check-circle"></i> الخيارات المتاحة: ${gameData.amounts.length} خيار</li>` : ''}
                `;
    } else if (product.category === 'app') {
        const appData = appsData.find(a => a.name === product.name);
        featuresHtml = `
                    <li><i class="fas fa-check-circle"></i> سعر العملة: ${appData ? appData.unitPrice.toFixed(2) : ''}$</li>
                    <li><i class="fas fa-check-circle"></i> الحد الأدنى: ${appData ? appData.minQuantity : 1} عملة</li>
                    <li><i class="fas fa-check-circle"></i> الحد الأقصى: ${appData ? appData.maxQuantity : 100} عملة</li>
                    <li><i class="fas fa-check-circle"></i> تحتاج إدخال رقم اللاعب</li>
                `;
    } else {
        featuresHtml = `
                    <li><i class="fas fa-check-circle"></i> جودة عالية</li>
                    <li><i class="fas fa-check-circle"></i> تنفيذ سريع</li>
                    <li><i class="fas fa-check-circle"></i> ضمان الجودة</li>
                `;
    }
    
    productDetailsBody.innerHTML = pdMarkup({
        image: imageUrl, name: product.name,
        category: categoryName + (badgeText ? ' · ' + badgeText : ''),
        price: priceDisplay, priceLabel: product.category === 'social-media' ? 'السعر لكل 1000' : 'السعر',
        description: product.description, features: featuresHtml,
        orderAttrs: 'data-id="' + product.id + '"'
    });
    
    setTimeout(() => {
        const detailsAddToCart = document.querySelector('.product-details-add-to-cart');
        
        if (detailsAddToCart) {
            detailsAddToCart.addEventListener('click', function() {
                const pid = parseInt(this.getAttribute('data-id'));
                const p = products.find(p => p.id === pid);
                
                if (p.category === 'social-media') {
                    productDetailsModal.classList.remove('active');
                    openServiceInputModal(p);
                } else if (p.category === 'rased') {
                    productDetailsModal.classList.remove('active');
                    openServiceInputModal(p);
                } else if (p.category === 'games') {
                    productDetailsModal.classList.remove('active');
                    openServiceInputModal(p);
                } else if (p.category === 'app') {
                    productDetailsModal.classList.remove('active');
                    openServiceInputModal(p);
                } else {
                    addToCart(pid);
                    productDetailsModal.classList.remove('active');
                }
            });
        }
        
    }, 100);
    
    productDetailsModal.classList.add('active');
}


// -------------------- عرض تفاصيل منتجات الدفع / VPN / التلفاز / التصميم / الأرقام --------------------
function showPaymentProductDetails(paymentProduct) {
    if (!paymentProduct) return;

    const priceDisplay = paymentProduct.price ? `${paymentProduct.price}$` : 'تواصل معنا';
    const imageUrl = paymentProduct.image || 'images/placeholder.svg';
    const desc = paymentProduct.description || paymentProduct.name;

    // استخراج اسم التصنيف من الكائن إن وُجد
    const catName = paymentProduct.category || 'منتج';

    // ميزات مناسبة حسب التصنيف
    let featuresHtml = `
                <li><i class="fas fa-check-circle"></i> توصيل فوري بعد التأكيد</li>
                <li><i class="fas fa-check-circle"></i> دفع آمن عبر شام كاش</li>
                <li><i class="fas fa-check-circle"></i> دعم 24/7 عبر واتساب</li>
            `;
    const catL = catName.toLowerCase();
    if (catL.includes('vpn')) {
        featuresHtml = `
                    <li><i class="fas fa-check-circle"></i> حماية كاملة للخصوصية</li>
                    <li><i class="fas fa-check-circle"></i> سرعات عالية بدون تقليل</li>
                    <li><i class="fas fa-check-circle"></i> يعمل على جميع الأجهزة</li>
                    <li><i class="fas fa-check-circle"></i> دعم فوري عبر واتساب</li>
                `;
    } else if (catL.includes('تلفاز') || catL.includes('نيتفليكس') || catL.includes('شاهد')) {
        featuresHtml = `
                    <li><i class="fas fa-check-circle"></i> جودة بث عالية</li>
                    <li><i class="fas fa-check-circle"></i> يعمل على جميع الأجهزة</li>
                    <li><i class="fas fa-check-circle"></i> تسليم فوري بعد الدفع</li>
                    <li><i class="fas fa-check-circle"></i> دعم عبر واتساب</li>
                `;
    } else if (catL.includes('تصميم') || catL.includes('كانفا') || catL.includes('كاب')) {
        featuresHtml = `
                    <li><i class="fas fa-check-circle"></i> ترخيص أصلي</li>
                    <li><i class="fas fa-check-circle"></i> يعمل على جميع الأجهزة</li>
                    <li><i class="fas fa-check-circle"></i> تسليم فوري بعد الدفع</li>
                    <li><i class="fas fa-check-circle"></i> دعم عبر واتساب</li>
                `;
    } else if (catL.includes('واتساب') || catL.includes('تليغرام') || catL.includes('arqam')) {
        featuresHtml = `
                    <li><i class="fas fa-check-circle"></i> رقم مكفول من الحظر</li>
                    <li><i class="fas fa-check-circle"></i> تسليم فوري</li>
                    <li><i class="fas fa-check-circle"></i> دعم عبر واتساب</li>
                `;
    }

    productDetailsBody.innerHTML = pdMarkup({
        image: imageUrl, name: paymentProduct.name, category: catName,
        price: priceDisplay, priceLabel: 'السعر بالدولار',
        description: desc, features: featuresHtml,
        orderAttrs: 'id="payDetAddCart"'
    });

    productDetailsModal.classList.add('active');

    setTimeout(() => {
        const addBtn = document.getElementById('payDetAddCart');

        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const cartItem = {
                    id: paymentProduct.id,
                    name: paymentProduct.name,
                    price: paymentProduct.price || 0,
                    quantity: 1,
                    image: paymentProduct.image,
                    category: paymentProduct.category || 'منتج'
                };
                const existing = cart.find(i => i.id === cartItem.id);
                if (existing) existing.quantity++;
                else cart.push(cartItem);
                localStorage.setItem('zoodnyCart', JSON.stringify(cart));
                updateCartUI();
                productDetailsModal.classList.remove('active');
                showToast('تمت إضافة المنتج إلى السلة بنجاح!');
            });
        }

    }, 50);
}


// ==================== نافذة إدخال الإيميل لمنتجات التصميم ====================
let selectedDesignProduct = null;

function openDesignEmailModal(product) {
    selectedDesignProduct = product;

    // اسم المنتج
    document.getElementById('selectedDesignName').textContent = product.name;

    // نص الحقل
    const labelEl = document.getElementById('designEmailLabel');
    if (labelEl) labelEl.textContent = (product.inputLabel || 'أدخل الإيميل') + ' *';

    // placeholder
    const inputEl = document.getElementById('designEmailInput');
    if (inputEl) {
        inputEl.value = '';
        inputEl.placeholder = product.inputPlaceholder || 'example@gmail.com';
    }

    // نص المساعدة
    const helpEl = document.getElementById('designEmailHelp');
    if (helpEl) helpEl.textContent = product.inputHelp || 'سيتم تفعيل الاشتراك على هذا الإيميل';

    // السعر
    document.getElementById('calculatedDesignPrice').textContent =
        product.price ? product.price.toFixed(2) + '$' : '0.00$';

    document.getElementById('designEmailModal').classList.add('active');
}


// ==================== إخفاء الشريط السفلي أثناء فتح أي نافذة ====================
// (تفاصيل المنتج، تأكيد الطلب، نوافذ الإدخال، الدخول...) حتى لا يغطي أزرار الطلب — ويعود عند الإغلاق.
(function () {
    var SEL = '.active[id$="Modal"], .on[id$="Modal"]';
    function sync() {
        document.documentElement.classList.toggle('zn-modal-open', !!document.querySelector(SEL));
    }
    function start() {
        sync();
        if (!window.MutationObserver) return;
        var t = null;
        new MutationObserver(function () { clearTimeout(t); t = setTimeout(sync, 10); })
            .observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: true });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
}());
