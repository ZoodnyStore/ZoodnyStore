/* ══════════════════════════════════════════════════════════════════════
 * نوافذ تفاصيل المنتجات
 * تفاصيل المنتج، منتجات الدفع/VPN/التلفاز/التصميم، نافذة إيميل التصميم.
 * ══════════════════════════════════════════════════════════════════════ */

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
                    <li><i class="fas fa-check-circle"></i> توصيل سريع</li>
                    <li><i class="fas fa-check-circle"></i> ضمان الجودة</li>
                `;
    }
    
    productDetailsBody.innerHTML = `
                <div class="product-details-image">
                    <img src="${imageUrl}" alt="${product.name}" onerror="this.onerror=null;this.src='images/placeholder.svg'">
                </div>
                <div class="product-details-info">
                    <h2 class="product-details-title">${product.name}</h2>
                    <span class="product-details-category">${categoryName} ${badgeText ? `- ${badgeText}` : ''}</span>
                    
                    <div class="product-details-price-box">
                        <div class="product-details-price">${priceDisplay}</div>
                        <div class="product-details-price-label"></div>
                    </div>
                    
                    <div class="product-details-description">
                        <strong>وصف المنتج:</strong><br>
                        ${product.description}
                    </div>
                    
                    <ul class="product-details-features">
                        ${featuresHtml}
                    </ul>
                    
                    <div class="product-details-actions">
                        <button class="product-details-add-to-cart" data-id="${product.id}">
                            <i class="fas fa-cart-plus"></i> أضف للسلة
                        </button>
                    </div>
                </div>
            `;
    
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

    productDetailsBody.innerHTML = `
                <div class="product-details-image">
                    <img src="${imageUrl}" alt="${paymentProduct.name}" onerror="this.onerror=null;this.src='images/placeholder.svg'">
                </div>
                <div class="product-details-info">
                    <h2 class="product-details-title">${paymentProduct.name}</h2>
                    <span class="product-details-category">${catName}</span>

                    <div class="product-details-price-box">
                        <div class="product-details-price">${priceDisplay}</div>
                        <div class="product-details-price-label">السعر بالدولار</div>
                    </div>

                    <div class="product-details-description">
                        <strong>وصف المنتج:</strong><br>
                        ${desc}
                    </div>

                    <ul class="product-details-features">
                        ${featuresHtml}
                    </ul>

                    <div class="product-details-actions">
                        <button class="product-details-add-to-cart" id="payDetAddCart">
                            <i class="fas fa-cart-plus"></i> أضف للسلة
                        </button>
                    </div>
                </div>
            `;

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
