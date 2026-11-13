/* ══════════════════════════════════════════════════════════════════════
 * نوافذ الإدخال والسلة والدفع
 * معاينة الأسعار، الإضافة للسلة، عرض السلة، ملخص الطلب، خطوات الدفع وإرسال الطلب.
 * ══════════════════════════════════════════════════════════════════════ */

// -------------------- تحديث معاينة السعر للسوشال ميديا --------------------
function updatePricePreview() {
    if (!selectedSocialProduct) return;
    
    const quantity = parseInt(socialQuantity.value);
    
    if (quantity && quantity >= 300) {
        const price = calculateSocialMediaPrice(selectedSocialProduct.id, quantity);
        calculatedPrice.textContent = `${price.toFixed(2)}$`;
    } else {
        calculatedPrice.textContent = '0.00$';
    }
}

// -------------------- تحديث معاينة سعر الرصيد --------------------
function updateCreditPricePreview() {
    const selectedOption = creditAmount.options[creditAmount.selectedIndex];
    if (selectedOption && selectedOption.value) {
        const price = selectedOption.getAttribute('data-price');
        const value = selectedOption.value;
        calculatedCreditPrice.textContent = `${parseFloat(price).toFixed(2)}$`;
        selectedCreditValue.textContent = value;
    } else {
        calculatedCreditPrice.textContent = '0.00$';
        selectedCreditValue.textContent = '0';
    }
}

// -------------------- تحديث معاينة سعر التطبيق --------------------
function updateAppPricePreview() {
    if (!selectedAppProduct || !appQuantity) return;
    
    const appData = appsData.find(a => a.name === selectedAppProduct.name);
    if (!appData) return;
    
    const quantity = parseInt(appQuantity.value);
    
    if (quantity && quantity >= appData.minQuantity && quantity <= appData.maxQuantity) {
        const price = quantity * appData.unitPrice;
        calculatedAppPrice.textContent = `${price.toFixed(2)}$`;
    } else {
        calculatedAppPrice.textContent = '0.00$';
    }
}

// -------------------- فتح نافذة تفعيلات البريميوم --------------------
function openServiceInputModal(product) {
    // الحصول على البيانات الكاملة من premiumActivationsData إذا لم تكن موجودة
    let fullProductData = product;
    if (!product.inputLabel || !product.inputPlaceholder) {
        const premiumGroup = premiumActivationsData.find(p => 
            p.products && p.products.some(prod => prod.id === product.id)
        );
        if (premiumGroup) {
            fullProductData = {
                ...product,
                inputLabel: product.inputLabel || premiumGroup.inputLabel,
                inputPlaceholder: product.inputPlaceholder || premiumGroup.inputPlaceholder,
                inputHelp: product.inputHelp || premiumGroup.inputHelp,
                image: product.image || premiumGroup.image
            };
        }
    }
    
    selectedPremiumProduct = fullProductData;
    
    selectedPremiumName.textContent = fullProductData.name;
    
    // تحديث نص حقل الإدخال والمساعدة
    const premiumInputLabel = document.getElementById('premiumInputLabel');
    const premiumInput = document.getElementById('premiumInput');
    const premiumInputHelp = document.getElementById('premiumInputHelp');
    
    if (premiumInputLabel && fullProductData.inputLabel) {
        premiumInputLabel.textContent = fullProductData.inputLabel + ' *';
    }
    
    if (premiumInput && fullProductData.inputPlaceholder) {
        premiumInput.placeholder = fullProductData.inputPlaceholder;
    }
    
    if (premiumInputHelp && fullProductData.inputHelp) {
        premiumInputHelp.textContent = fullProductData.inputHelp;
    }
    
    // عرض السعر
    document.getElementById('calculatedPremiumPrice').textContent = fullProductData.price.toFixed(2) + '$';
    
    premiumInput.value = '';
    
    premiumModal.classList.add('active');
}

// -------------------- تحديث معاينة سعر البريميوم --------------------
function updateGamePricePreview() {
    const selectedOption = gameAmount.options[gameAmount.selectedIndex];
    if (selectedOption && selectedOption.value) {
        let price, value;
        
        try {
            const data = JSON.parse(selectedOption.value);
            if (data.gameId !== undefined) {
                price = data.price;
                value = data.value;
                selectedGameProduct = { 
                    id: data.gameId, 
                    selectedAmount: data,
                    groupName: selectedGameProduct?.baseName || selectedGameProduct?.name
                };
            } else {
                price = selectedOption.getAttribute('data-price');
                value = selectedOption.value;
            }
        } catch(e) {
            price = selectedOption.getAttribute('data-price');
            value = selectedOption.value;
        }
        
        calculatedGamePrice.textContent = `${parseFloat(price).toFixed(2)}$`;
        selectedGameValue.textContent = value;
    } else {
        calculatedGamePrice.textContent = '0.00$';
        selectedGameValue.textContent = '0';
    }
}

// -------------------- إضافة منتج إلى السلة --------------------
function addToCart(productId, customQuantity = null, customPrice = null, phoneNumber = null, creditAmount_ = null, gameAmount_ = null, playerId = null, appQuantity_ = null, premiumInputValue = null) {
    let product = products.find(p => p.id === productId);
    
    // إذا لم يُعثر على المنتج، ابحث في vpnData
    if (!product) {
        for (const vpnGroup of vpnData) {
            const found = vpnGroup.products.find(p => p.id === productId);
            if (found) {
                product = {
                    id: found.id,
                    name: found.name,
                    category: 'اشتراكات VPN',
                    price: found.price,
                    description: vpnGroup.description,
                    image: vpnGroup.image
                };
                break;
            }
        }
    }
    
    if (!product) return;
    
    let itemPrice = product.price;
    let itemQuantity = 1;
    
    // إذا تم تمرير سعر مخصص (مثل أسعار البريميوم من premiumActivationsData)
    if (customPrice !== null) {
        itemPrice = customPrice;
    }
    
    if (product.category === 'social-media') {
        if (!customQuantity) {
            showToast('يرجى تحديد الكمية المطلوبة');
            return;
        }
        
        itemQuantity = 1;
        itemPrice = calculateSocialMediaPrice(product.id, customQuantity);
        
        const existingItem = cart.find(item => item.id === productId && item.customQuantity);
        
        if (existingItem) {
            existingItem.customQuantity = (existingItem.customQuantity || 300) + customQuantity;
            existingItem.price = calculateSocialMediaPrice(product.id, existingItem.customQuantity);
            existingItem.quantity = 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                basePrice: product.basePrice || product.price,
                price: itemPrice,
                quantity: 1,
                customQuantity: customQuantity,
                category: product.category,
                perThousand: product.perThousand || null
            });
        }
    } else if (product.category === 'rased') {
        if (!creditAmount_ || !phoneNumber) {
            showToast('يرجى اختيار الكمية وإدخال رقم الهاتف');
            return;
        }
        
        // تحديد مصفوفة الأسعار حسب اسم المنتج
        let priceList = [];
        if (product.name.includes('سيرياتيل')) {
            priceList = creditAmounts.syriatel;
        } else if (product.name.includes('MTN')) {
            priceList = creditAmounts.mtn;
        }
        
        const creditInfo = priceList.find(c => c.value == creditAmount_);
        if (!creditInfo) return;
        
        itemPrice = creditInfo.price;
        
        cart.push({
            id: product.id,
            name: product.name,
            price: itemPrice,
            creditValue: creditInfo.value,
            quantity: 1,
            category: product.category,
            phoneNumber: phoneNumber
        });
    } else if (product.category === 'games') {
        if (!gameAmount_ || !playerId) {
            showToast('يرجى اختيار الكمية وإدخال رقم اللاعب');
            return;
        }
        
        // البحث عن بيانات اللعبة
        const gameData = gamesData.find(g => g.name === product.name);
        const gameInfo = gameData.amounts.find(a => a.value == gameAmount_);
        
        if (!gameInfo) return;
        
        itemPrice = gameInfo.price;
        
        cart.push({
            id: product.id,
            name: product.name,
            price: itemPrice,
            gameValue: gameInfo.value,
            gameDisplay: gameInfo.display,
            quantity: 1,
            category: product.category,
            playerId: playerId
        });
    } else if (product.category === 'app') {
        if (!appQuantity_ || !playerId) {
            showToast('يرجى إدخال الكمية ورقم اللاعب');
            return;
        }
        
        // البحث عن بيانات التطبيق
        const appData = appsData.find(a => a.name === product.name);
        if (!appData) return;
        
        itemPrice = appData.unitPrice * appQuantity_;
        
        cart.push({
            id: product.id,
            name: product.name,
            price: itemPrice,
            appValue: appQuantity_,
            unitPrice: appData.unitPrice,
            quantity: 1,
            category: product.category,
            playerId: playerId
        });
    } else if (product.category === 'تفعيلات بريميوم') {
        if (!premiumInputValue) {
            showToast('يرجى إدخال البيانات المطلوبة');
            return;
        }
        
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            category: product.category,
            premiumInput: premiumInputValue
        });
    } else {
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                category: product.category
            });
        }
    }
    
    checkForSocialMediaProducts();
    checkForCreditProducts();
    checkForGameProducts();
    checkForAppProducts();
    checkForPremiumProducts();
    
    localStorage.setItem('zoodnyCart', JSON.stringify(cart));
    updateCartUI();
    showToast('تمت إضافة المنتج إلى السلة بنجاح!');
}

// -------------------- التحقق من وجود منتجات سوشال ميديا --------------------
function checkForSocialMediaProducts() {
    hasSocialMediaProduct = cart.some(item => {
        const product = products.find(p => p.id === item.id);
        return product && product.category === 'social-media';
    });
    
    if (hasSocialMediaProduct) {
        socialMediaFields.classList.add('active');
        accountUrl.required = true;
        
        renderSocialMediaSummary();
        updateSocialMediaFieldLabel();
    } else {
        socialMediaFields.classList.remove('active');
        accountUrl.required = false;
    }
}

// -------------------- التحقق من وجود منتجات رصيد --------------------
function checkForCreditProducts() {
    hasCreditProduct = cart.some(item => {
        const product = products.find(p => p.id === item.id);
        return product && product.category === 'rased';
    });
}

// -------------------- التحقق من وجود منتجات ألعاب --------------------
function checkForGameProducts() {
    hasGameProduct = cart.some(item => {
        const product = products.find(p => p.id === item.id);
        return product && product.category === 'games';
    });
}

// -------------------- التحقق من وجود منتجات تطبيقات --------------------
function checkForAppProducts() {
    hasAppProduct = cart.some(item => {
        const product = products.find(p => p.id === item.id);
        return product && product.category === 'app';
    });
}

// -------------------- التحقق من وجود منتجات تفعيلات البريميوم --------------------
function checkForPremiumProducts() {
    hasPremiumProduct = cart.some(item => {
        const product = products.find(p => p.id === item.id);
        return product && product.category === 'تفعيلات بريميوم';
    });
}

// -------------------- عرض ملخص منتجات السوشال ميديا --------------------
function renderSocialMediaSummary() {
    if (!socialMediaItemsSummary) return;
    
    const socialItems = cart.filter(item => {
        const product = products.find(p => p.id === item.id);
        return product && product.category === 'social-media';
    });
    
    if (socialItems.length === 0) {
        socialMediaItemsSummary.innerHTML = '';
        return;
    }
    
    let html = '<div style="margin-top: 1rem; border-top: 1px solid #eee; padding-top: 1rem;">';
    html += '<h5 style="color: var(--primary); margin-bottom: 1rem;">الخدمات المطلوبة:</h5>';
    
    socialItems.forEach(item => {
        const customQty = item.customQuantity || 300;
        const pricePerThousand = item.basePrice || (item.price / (customQty / 1000)) || 1;
        
        html += `
                    <div style="background: white; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; border-right: 3px solid var(--secondary);">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <p style="font-weight: 600; color: var(--primary);">${item.name}</p>
                                <p style="color: var(--gray); font-size: 0.9rem;">الكمية: ${customQty.toLocaleString()}</p>
                                <p style="color: var(--accent); font-weight: 600;">السعر: ${item.price.toFixed(2)}$</p>
                            </div>
                            <div style="font-size: 0.85rem; color: var(--gray);">
                                ${(pricePerThousand).toFixed(2)}$ لكل 1000
                            </div>
                        </div>
                    </div>
                `;
    });
    
    html += '</div>';
    socialMediaItemsSummary.innerHTML = html;
}

// -------------------- تحديث واجهة السلة --------------------
function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    if (mobileCartCount) mobileCartCount.textContent = totalItems;
    
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalPrice.textContent = totalPrice.toFixed(2) + '$';
    
    renderCartItems();
}

// -------------------- عرض عناصر السلة --------------------
function renderCartItems() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
                    <div class="empty-cart">
                        <i class="fas fa-shopping-basket"></i>
                        <p>سلة التسوق فارغة</p>
                    </div>
                `;
        return;
    }
    
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        const isSocialMedia = product && product.category === 'social-media';
        const isCredit = product && product.category === 'rased';
        const isGame = product && product.category === 'games';
        const isApp = product && product.category === 'app';
        const isPremium = product && product.category === 'تفعيلات بريميوم';
        const customQty = item.customQuantity || 300;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        let detailsHtml = '';
        if (isSocialMedia) {
            const shortLink = item.socialLink ? (item.socialLink.length > 38 ? item.socialLink.substring(0,38)+'…' : item.socialLink) : '';
            detailsHtml = `
                        <div style="flex: 1;">
                            <h4 style="font-size: 1rem; color: var(--primary); margin-bottom: 0.3rem;">${item.name}</h4>
                            <p style="color: var(--accent); font-weight: 700;">${item.price.toFixed(2)}$</p>
                            <p style="color: var(--gray); font-size: 0.85rem;">الكمية: ${customQty.toLocaleString()}</p>
                            ${shortLink ? `<p style="color:var(--gray);font-size:.75rem;direction:ltr;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px;"><i class="fas fa-link" style="color:#D4A800"></i> ${shortLink}</p>` : ''}
                        </div>
                    `;
        } else if (isCredit) {
            detailsHtml = `
                        <div style="flex: 1;">
                            <h4 style="font-size: 1rem; color: var(--primary); margin-bottom: 0.3rem;">${item.name}</h4>
                            <p style="color: var(--accent); font-weight: 700;">${item.price.toFixed(2)}$</p>
                            <p style="color: var(--gray); font-size: 0.85rem;">قيمة الرصيد: ${item.creditValue} ل.س</p>
                            <p style="color: var(--gray); font-size: 0.85rem;">رقم الهاتف: ${item.phoneNumber}</p>
                        </div>
                    `;
        } else if (isGame) {
            detailsHtml = `
                        <div style="flex: 1;">
                            <h4 style="font-size: 1rem; color: var(--primary); margin-bottom: 0.3rem;">${item.name}</h4>
                            <p style="color: var(--accent); font-weight: 700;">${item.price.toFixed(2)}$</p>
                            <p style="color: var(--gray); font-size: 0.85rem;">الكمية: ${item.gameDisplay || item.gameValue}</p>
                            <p style="color: var(--gray); font-size: 0.85rem;">رقم اللاعب: ${item.playerId}</p>
                        </div>
                    `;
        } else if (isApp) {
            detailsHtml = `
                        <div style="flex: 1;">
                            <h4 style="font-size: 1rem; color: var(--primary); margin-bottom: 0.3rem;">${item.name}</h4>
                            <p style="color: var(--accent); font-weight: 700;">${item.price.toFixed(2)}$</p>
                            <p style="color: var(--gray); font-size: 0.85rem;">الكمية: ${item.appValue} (${item.unitPrice}$ للعملة)</p>
                            <p style="color: var(--gray); font-size: 0.85rem;">رقم اللاعب: ${item.playerId}</p>
                        </div>
                    `;
        } else if (isPremium) {
            detailsHtml = `
                        <div style="flex: 1;">
                            <h4 style="font-size: 1rem; color: var(--primary); margin-bottom: 0.3rem;">${item.name}</h4>
                            <p style="color: var(--accent); font-weight: 700;">${item.price.toFixed(2)}$</p>
                            <p style="color: var(--gray); font-size: 0.85rem;">البيانات: ${item.premiumInput}</p>
                        </div>
                    `;
        } else {
            detailsHtml = `
                        <div style="flex: 1;">
                            <h4 style="font-size: 1rem; color: var(--primary); margin-bottom: 0.3rem;">${item.name}</h4>
                            <p style="color: var(--accent); font-weight: 700;">${item.price.toFixed(2)}$</p>
                            <p style="color: var(--gray); font-size: 0.85rem;">الكمية: ${item.quantity}</p>
                        </div>
                    `;
        }
        
        cartItem.innerHTML = `
                    <div style="width: 70px; height: 70px; background: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                        <i class="${isSocialMedia ? 'fab fa-instagram' : isCredit ? 'fas fa-phone-alt' : isGame ? 'fas fa-gamepad' : isApp ? 'fas fa-mobile-alt' : isPremium ? 'fas fa-crown' : 'fas fa-box'}" style="font-size: 1.5rem; color: ${isSocialMedia ? '#E1306C' : isCredit ? '#2ECC71' : isGame ? '#FF6B6B' : isApp ? '#3498db' : isPremium ? '#FFD700' : '#666'};"></i>
                    </div>
                    ${detailsHtml}
                    <div class="cart-item-actions" style="display: flex; align-items: center; gap: 0.8rem;">
                        ${!isSocialMedia && !isCredit && !isGame && !isApp && !isPremium ? `
                            <button class="quantity-btn decrease" data-id="${item.id}" style="background: var(--light); border: 1px solid #ddd; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;">-</button>
                            <span style="font-weight: 600; min-width: 25px; text-align: center;">${item.quantity}</span>
                            <button class="quantity-btn increase" data-id="${item.id}" style="background: var(--light); border: 1px solid #ddd; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;">+</button>
                        ` : ''}
                        <button class="remove-item" data-id="${item.id}" style="background: none; border: none; color: var(--accent); cursor: pointer; font-size: 1.2rem;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
        cartItems.appendChild(cartItem);
    });
    
    document.querySelectorAll('.decrease').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            updateCartItemQuantity(productId, -1);
        });
    });
    
    document.querySelectorAll('.increase').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            updateCartItemQuantity(productId, 1);
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            removeFromCart(productId);
        });
    });
}

// -------------------- تحديث كمية المنتج --------------------
function updateCartItemQuantity(productId, change) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    const product = products.find(p => p.id === productId);
    
    if (itemIndex !== -1) {
        if (product && (product.category === 'social-media' || product.category === 'rased' || product.category === 'games' || product.category === 'app')) {
            showToast('لتعديل الكمية، يرجى إزالة المنتج وإضافته مرة أخرى');
            return;
        }
        
        cart[itemIndex].quantity += change;
        
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        
        checkForSocialMediaProducts();
        checkForCreditProducts();
        checkForGameProducts();
        checkForAppProducts();
        
        localStorage.setItem('zoodnyCart', JSON.stringify(cart));
        updateCartUI();
    }
}

// -------------------- إزالة منتج من السلة --------------------
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    
    checkForSocialMediaProducts();
    checkForCreditProducts();
    checkForGameProducts();
    checkForAppProducts();
    
    localStorage.setItem('zoodnyCart', JSON.stringify(cart));
    updateCartUI();
}

// -------------------- عرض ملخص الطلب --------------------
function renderOrderSummary() {
    orderSummaryItems.innerHTML = '';
    
    if (cart.length === 0) {
        orderSummaryItems.innerHTML = '<p>السلة فارغة</p>';
        orderSummaryTotal.textContent = 'الإجمالي: 0$';
        return;
    }
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const isSocialMedia = item.category === 'social-media';
        const isCredit = item.category === 'rased';
        const isGame = item.category === 'games';
        const isApp = item.category === 'app';
        const isPremium = item.category === 'تفعيلات بريميوم';
        const customQty = item.customQuantity || 300;
        
        const summaryItem = document.createElement('div');
        summaryItem.className = 'summary-item';
        
        if (isSocialMedia) {
            summaryItem.innerHTML = `
                        <span>${item.name} (${customQty.toLocaleString()})</span>
                        <span>${item.price.toFixed(2)}$</span>
                    `;
        } else if (isCredit) {
            summaryItem.innerHTML = `
                        <span>${item.name} - ${item.creditValue} ل.س (هاتف: ${item.phoneNumber})</span>
                        <span>${(item.price * item.quantity).toFixed(2)}$</span>
                    `;
        } else if (isGame) {
            summaryItem.innerHTML = `
                        <span>${item.name} - ${item.gameDisplay || item.gameValue} (لاعب: ${item.playerId})</span>
                        <span>${(item.price * item.quantity).toFixed(2)}$</span>
                    `;
        } else if (isApp) {
            summaryItem.innerHTML = `
                        <span>${item.name} - ${item.appValue} عملة (لاعب: ${item.playerId})</span>
                        <span>${(item.price * item.quantity).toFixed(2)}$</span>
                    `;
        } else if (isPremium) {
            summaryItem.innerHTML = `
                        <span>${item.name} (بيانات: ${item.premiumInput})</span>
                        <span>${(item.price * item.quantity).toFixed(2)}$</span>
                    `;
        } else {
            summaryItem.innerHTML = `
                        <span>${item.name} (${item.quantity})</span>
                        <span>${(item.price * item.quantity).toFixed(2)}$</span>
                    `;
        }
        
        orderSummaryItems.appendChild(summaryItem);
    });
    
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    orderSummaryTotal.textContent = `الإجمالي: ${totalPrice.toFixed(2)}$`;
    
    requiredAmount.textContent = totalPrice.toFixed(2) + '$';
    confirmRequiredAmount.textContent = totalPrice.toFixed(2) + '$';
    finalRequiredAmount.textContent = totalPrice.toFixed(2) + '$';
}

// -------------------- تهيئة نموذج الدفع --------------------
function initPaymentForm() {
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    requiredAmount.textContent = totalPrice.toFixed(2) + '$';
    
    const today = new Date().toISOString().split('T')[0];
    transferDate.value = today;
    
    const randomOrderNum = Math.floor(1000 + Math.random() * 9000);
    orderNumber.textContent = '#' + randomOrderNum;
}

// -------------------- إعادة تعيين نموذج الدفع --------------------
function resetPaymentForm() {
    currentStep = 1;
    currentPaymentData = {};
    
    transferNumber.value = '';
    paidAmount.value = '';
    transferDate.value = new Date().toISOString().split('T')[0];
    
    accountUrl.value = '';
    
    step1.classList.add('active');
    step1.classList.remove('completed');
    step2.classList.remove('active', 'completed');
    step3.classList.remove('active', 'completed');
    
    paymentStep1.style.display = 'block';
    paymentStep2.style.display = 'none';
    paymentStep3.style.display = 'none';
}

// -------------------- نسخ معرف الحساب --------------------
function copyAccountIdToClipboard() {
    const accountId = accountIdValue.textContent;
    
    navigator.clipboard.writeText(accountId).then(() => {
        showToast('تم نسخ معرف الحساب بنجاح!');
        
        copyAccountId.innerHTML = '<i class="fas fa-check"></i> تم النسخ';
        copyAccountId.classList.add('copied');
        
        setTimeout(() => {
            copyAccountId.innerHTML = '<i class="fas fa-copy"></i> نسخ معرف الحساب';
            copyAccountId.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        const textArea = document.createElement('textarea');
        textArea.value = accountId;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showToast('تم نسخ معرف الحساب بنجاح!');
                copyAccountId.innerHTML = '<i class="fas fa-check"></i> تم النسخ';
                copyAccountId.classList.add('copied');
                
                setTimeout(() => {
                    copyAccountId.innerHTML = '<i class="fas fa-copy"></i> نسخ معرف الحساب';
                    copyAccountId.classList.remove('copied');
                }, 2000);
            } else {
                showToast('تعذر نسخ المعرف. يرجى المحاولة يدوياً.');
            }
        } catch (err) {
            showToast('تعذر نسخ المعرف. يرجى نسخه يدوياً: ' + accountId);
        }
        
        document.body.removeChild(textArea);
    });
}

// -------------------- الانتقال بين خطوات الدفع --------------------
function goToStep(step) {
    paymentStep1.style.display = 'none';
    paymentStep2.style.display = 'none';
    paymentStep3.style.display = 'none';
    
    step1.classList.remove('active');
    step2.classList.remove('active');
    step3.classList.remove('active');
    
    currentStep = step;
    
    switch(step) {
        case 1:
            step1.classList.add('active');
            paymentStep1.style.display = 'block';
            break;
        case 2:
            step1.classList.add('completed');
            step2.classList.add('active');
            paymentStep2.style.display = 'block';
            
            confirmTransferNumber.textContent = currentPaymentData.transferNumber || '-';
            break;
        case 3:
            step1.classList.add('completed');
            step2.classList.add('completed');
            step3.classList.add('active');
            paymentStep3.style.display = 'block';
            
            finalTransferNumber.textContent = currentPaymentData.transferNumber || '-';
            finalPaidAmount.textContent = (currentPaymentData.paidAmount || '0') + '$';
            finalTransferDate.textContent = currentPaymentData.transferDate || '-';
            break;
    }
}

// إشعار للمدير بطلب جديد (لا يوقف الطلب إن فشل)
function notifyAdminNewOrder(orderId, customerName, items, total) {
    try {
        if (!window.ZoodnyNotify || typeof auth === 'undefined' || !auth.currentUser) return;
        var names = (items || []).map(function(it) { return it.name || it.productName; }).filter(Boolean);
        var label = names.slice(0, 2).join('، ') + (names.length > 2 ? ' +' + (names.length - 2) : '');
        window.ZoodnyNotify.toAdmin({
            type: 'order',
            title: 'طلب جديد 🛒',
            body: (customerName || auth.currentUser.email || 'زبون') + ' — ' + (label || 'طلب') + ' — ' + (parseFloat(total) || 0).toFixed(2) + '$',
            ref: orderId
        });
    } catch (e) { console.warn('notify admin failed:', e); }
}

// -------------------- إرسال طلب شام كاش مع رابط الصورة (معدل للعمل على iPhone) --------------------
function submitShamCashOrder(customerData) {
    // ── بناء بيانات الطلب بالتفصيل ──
    var orderId = 'ORD-' + Date.now();  // always unique
    var totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // بناء العناصر مع جميع التفاصيل الخاصة بكل نوع
    var items = cart.map(function(item) {
        var base = {
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1,
            category: item.category
        };
        if (item.category === 'social-media') {
            base.customQuantity = item.customQuantity || 300;
            base.accountUrl = customerData.accountUrl || '';
        } else if (item.category === 'rased') {
            base.creditValue  = item.creditValue  || '';
            base.phoneNumber  = item.phoneNumber  || '';
        } else if (item.category === 'games') {
            base.gameValue    = item.gameDisplay || item.gameValue || '';
            base.playerId     = item.playerId    || '';
        } else if (item.category === 'app') {
            base.appValue     = item.appValue    || '';
            base.playerId     = item.playerId    || '';
            base.unitPrice    = item.unitPrice   || '';
        } else if (item.category === 'تفعيلات بريميوم') {
            base.premiumInput = item.premiumInput || '';
        }
        return base;
    });

    // اقرأ بيانات العميل من Firebase profile
    var _uname  = (typeof userData !== 'undefined' && userData && userData.name)  ? userData.name  : (customerData.name  || '');
    var _uphone = (typeof userData !== 'undefined' && userData && userData.phone) ? userData.phone : (customerData.phone || '');
    var _uemail = (typeof userData !== 'undefined' && userData && userData.email) ? userData.email : (customerData.email || '');
    var _authUser = (typeof auth !== 'undefined' && auth.currentUser) ? auth.currentUser : null;
    if (_authUser) {
        if (!_uemail) _uemail = _authUser.email || '';
        if (!_uname)  _uname  = _authUser.displayName || '';
    }

    var orderData = {
        orderId,
        uid:           (typeof auth !== 'undefined' && auth.currentUser) ? auth.currentUser.uid : 'guest',
        name:          _uname,
        phone:         _uphone,
        email:         _uemail,
        city:          customerData.city          || 'غير محدد',
        accountUrl:    customerData.accountUrl    || '',
        items,
        total:         totalPrice,
        paymentMethod: 'wallet',
        transferNumber: currentPaymentData ? currentPaymentData.transferNumber : '',
        paidAmount:     currentPaymentData ? currentPaymentData.paidAmount     : '',
        transferDate:   currentPaymentData ? currentPaymentData.transferDate   : '',
        requiredAmount: currentPaymentData ? currentPaymentData.requiredAmount : '',
        date:          new Date().toLocaleString('ar-SY'),
        status:        'pending',
        ts:            Date.now()
    };

    // ── إغلاق كل النوافذ فوراً ──
    try { if (customerModal) customerModal.classList.remove('active'); } catch(e) {}
    try { if (paymentModal)  { paymentModal.style.display = 'none'; paymentModal.classList.remove('active'); } } catch(e) {}
    try { if (cartSidebar)   cartSidebar.classList.remove('active'); } catch(e) {}
    try { if (cartOverlay)   cartOverlay.classList.remove('active'); } catch(e) {}

    // ── عرض رسالة النجاح فوراً ──
    document.getElementById('orderSuccessId').textContent    = orderId;
    document.getElementById('orderSuccessTotal').textContent = totalPrice.toFixed(2) + '$';
    document.getElementById('orderSuccessOv').classList.add('active');
    document.getElementById('orderSuccessModal').classList.add('active');

    // ── تفريغ السلة ──
    cart = [];
    hasSocialMediaProduct = false;
    hasCreditProduct      = false;
    hasGameProduct        = false;
    hasAppProduct         = false;
    hasPremiumProduct     = false;
    localStorage.removeItem('zoodnyCart');
    updateCartUI();
    try { if (customerForm) customerForm.reset(); } catch(e) {}
    try { if (typeof resetPaymentForm === 'function') resetPaymentForm(); } catch(e) {}
    try { if (socialMediaFields) socialMediaFields.classList.remove('active'); } catch(e) {}

    // ── حفظ في Firebase في الخلفية (لا ينتظر) ──
    if (typeof db !== 'undefined') {
        db.ref('store_orders/' + orderId).set(orderData).catch(function(e) {
            console.error('order save failed:', e.message);
        });
        notifyAdminNewOrder(orderId, _uname, items, totalPrice);

        if (typeof auth !== 'undefined' && auth.currentUser) {
            var uid = auth.currentUser.uid;

            db.ref('users/' + uid + '/orders/' + orderId).set({
                orderId: orderId,
                date:    orderData.date,
                total:   totalPrice,
                status:  'pending'
            });

            db.ref('users/' + uid + '/ordersCount').transaction(function(c) { return (c||0)+1; });

            if (totalPrice > 0) {
                db.ref('users/' + uid + '/balance').transaction(function(cur) {
                    var n = (cur||0) - totalPrice;
                    return n < 0 ? 0 : n;
                });
                db.ref('users/' + uid + '/transactions/ORD-TX-' + Date.now()).set({
                    desc:    'دفع طلب ' + orderId,
                    date:    orderData.date,
                    amount:  totalPrice,
                    type:    'debit',
                    orderId: orderId,
                    txCategory: 'order',
                    ts:      Date.now()
                });
            }
        }
    }
}

// -------------------- إرسال الطلب النهائي --------------------
function submitOrder(customerData) {
    // كلا طريقتي الدفع تمر عبر submitShamCashOrder الذي يحفظ في Firebase
    submitShamCashOrder(customerData);
}



// -------------------- تهيئة السلة --------------------
function initCart() {
    const savedCart = localStorage.getItem('zoodnyCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        
        cart.forEach(item => {
            if (item.category === 'social-media' && item.customQuantity) {
                const product = products.find(p => p.id === item.id);
                if (product) {
                    item.price = calculateSocialMediaPrice(item.id, item.customQuantity);
                }
            }
        });
        
        checkForSocialMediaProducts();
        checkForCreditProducts();
        checkForGameProducts();
        checkForAppProducts();
        checkForPremiumProducts();
        updateCartUI();
    }
}

// -------------------- مزامنة السلة مع الأسعار الحالية --------------------
// تُستدعى بعد تحميل تعديلات المدير من Firebase (وعند كل تعديل جديد):
//  - تحدّث سعر أي منتج في السلة تغيّر سعره
//  - تحذف من السلة أي منتج حذفه المدير أو أصبح غير متوفر (فقط إذا allowRemove = true،
//    أي عندما تكون بيانات المدير قد حُمّلت بنجاح، حتى لا نحذف شيئاً بالخطأ)
function syncCartWithCatalog(allowRemove) {
    if (!Array.isArray(cart) || !cart.length) return;

    const num = v => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
    const findSub = (groups, id) => {
        for (const g of groups || []) {
            const s = (g.products || []).find(p => String(p.id) === String(id));
            if (s) return s;
        }
        return null;
    };
    const findProduct = (id, category) => products.find(p => p.id === id && p.category === category);

    // يرجع السعر الحالي (رقم)، أو 0 إذا لم يعد المنتج متوفراً، أو null إذا لا يمكن تحديده (يبقى كما هو)
    const currentPrice = item => {
        switch (item.category) {
            case 'social-media':
                return findProduct(item.id, 'social-media') ? calculateSocialMediaPrice(item.id, item.customQuantity || 300) : 0;
            case 'app': {
                const a = appsData.find(x => x.id === item.id);
                return a ? Math.round(num(a.unitPrice) * num(item.appValue) * 10000) / 10000 : 0;
            }
            case 'games': {
                const g = gamesData.find(x => x.id === item.id);
                const amt = g && (g.amounts || []).find(x => String(x.value) === String(item.gameValue));
                return amt ? num(amt.price) : 0;
            }
            case 'rased':
                return null;   // أسعار الرصيد ثابتة في الكود (creditAmounts)
            case 'تفعيلات بريميوم': {
                const s = findSub(premiumActivationsData, item.id);
                return s ? num(s.price) : 0;
            }
            case 'اشتراكات VPN': {
                const s = findSub(vpnData, item.id) || findProduct(item.id, 'اشتراكات VPN');
                return s ? num(s.price) : 0;
            }
            case 'الدفع الالكتروني':
            case 'الدفع electronique': {
                const s = findSub(electronicPaymentData, item.id) || findProduct(item.id, 'الدفع الالكتروني');
                return s ? num(s.price) : 0;
            }
            default: {
                const sameId = products.filter(x => x.id === item.id);
                const p = findProduct(item.id, item.category) || (sameId.length === 1 ? sameId[0] : null);
                if (p) return num(p.price);
                return (allowRemove && !sameId.length) ? 0 : null;   // يُحذف فقط إذا اختفى المنتج تماماً
            }
        }
    };

    let changed = 0, removed = [];
    for (let i = cart.length - 1; i >= 0; i--) {
        const item = cart[i];
        const price = currentPrice(item);
        if (price === null) continue;
        if (price <= 0) {
            if (allowRemove) { removed.push(item.name); cart.splice(i, 1); }
            continue;
        }
        if (Math.abs(num(item.price) - price) > 0.0001) {
            item.price = price;
            if (item.category === 'app') {
                const a = appsData.find(x => x.id === item.id);
                if (a) item.unitPrice = num(a.unitPrice);
            }
            changed++;
        } else if (typeof item.price !== 'number') {
            item.price = price;   // تصحيح سعر محفوظ كنص
        }
    }

    if (!changed && !removed.length) return;
    localStorage.setItem('zoodnyCart', JSON.stringify(cart));
    checkForSocialMediaProducts();
    checkForCreditProducts();
    checkForGameProducts();
    checkForAppProducts();
    checkForPremiumProducts();
    updateCartUI();
    if (removed.length) {
        showToast('تم حذف من سلتك ما لم يعد متوفراً: ' + removed.join('، '), 'error');
    } else {
        showToast('تم تحديث أسعار بعض المنتجات في سلتك', 'success');
    }
}

// -------------------- العودة إلى التصنيفات --------------------
function backToCategoriesView() {
    categoriesSection.style.display = 'block';
    productsSection.style.display = 'none';
    selectedPlatform = null; // إعادة تعيين المنصة المحددة
    
    window.scrollTo({
        top: categoriesSection.offsetTop - 80,
        behavior: 'smooth'
    });
    
    currentCategory = null;
}
