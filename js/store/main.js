/* ══════════════════════════════════════════════════════════════════════
 * تهيئة المتجر
 * ربط الأحداث عند تحميل الصفحة (DOMContentLoaded) والبحث والخصومات.
 * ══════════════════════════════════════════════════════════════════════ */

// -------------------- تهيئة الصفحة --------------------
document.addEventListener('DOMContentLoaded', function() {
    renderCategories();
    initCart();
    
    // أحداث نافذة السوشال ميديا
    socialQuantity.addEventListener('input', updatePricePreview);
    
    confirmQuantityBtn.addEventListener('click', function() {
        if (!selectedSocialProduct) return;
        
        const quantity = parseInt(socialQuantity.value);
        
        if (!quantity || quantity < 300) {
            showToast('الحد الأدنى للطلب هو 300');
            return;
        }
        
        if (quantity > 1000000) {
            showToast('الحد الأقصى للطلب هو 1,000,000');
            return;
        }
        
        addToCart(selectedSocialProduct.id, quantity);
        
        quantityModal.classList.remove('active');
        selectedSocialProduct = null;
    });
    
    quantityClose.addEventListener('click', () => {
        quantityModal.classList.remove('active');
        selectedSocialProduct = null;
    });
    
    quantityModal.addEventListener('click', function(e) {
        if (e.target === quantityModal) {
            quantityModal.classList.remove('active');
            selectedSocialProduct = null;
        }
    });
    
    // أحداث نافذة الرصيد
    creditAmount.addEventListener('change', updateCreditPricePreview);
    
    confirmCreditBtn.addEventListener('click', function() {
        if (!selectedCreditProduct) return;
        
        const amount = creditAmount.value;
        const phone = creditPhoneNumber.value.trim();
        
        if (!amount) {
            showToast('يرجى اختيار الكمية');
            return;
        }
        
        if (!phone) {
            showToast('يرجى إدخال رقم الهاتف');
            return;
        }
        
        if (!/^09[0-9]{8}$/.test(phone)) {
            showToast('رقم الهاتف غير صحيح. يجب أن يبدأ بـ 09 ويتكون من 10 أرقام');
            return;
        }
        
        addToCart(selectedCreditProduct.id, null, null, phone, amount);
        
        creditModal.classList.remove('active');
        selectedCreditProduct = null;
    });
    
    creditClose.addEventListener('click', () => {
        creditModal.classList.remove('active');
        selectedCreditProduct = null;
    });
    
    creditModal.addEventListener('click', function(e) {
        if (e.target === creditModal) {
            creditModal.classList.remove('active');
            selectedCreditProduct = null;
        }
    });
    
    // أحداث نافذة التطبيقات
    if (appQuantity) {
        appQuantity.addEventListener('input', updateAppPricePreview);
    }
    
    confirmAppBtn.addEventListener('click', function() {
        if (!selectedAppProduct) return;
        
        const appData = appsData.find(a => a.name === selectedAppProduct.name);
        if (!appData) return;
        
        const quantity = parseInt(appQuantity.value);
        const playerIdValue = appPlayerId.value.trim();
        
        if (!quantity || quantity < appData.minQuantity || quantity > appData.maxQuantity) {
            showToast(`الكمية يجب أن تكون بين ${appData.minQuantity} و ${appData.maxQuantity}`);
            return;
        }
        
        if (!playerIdValue) {
            showToast('يرجى إدخال رقم اللاعب');
            return;
        }
        
        addToCart(selectedAppProduct.id, null, null, null, null, null, playerIdValue, quantity);
        
        appModal.classList.remove('active');
        selectedAppProduct = null;
    });
    
    appClose.addEventListener('click', () => {
        appModal.classList.remove('active');
        selectedAppProduct = null;
    });
    
    appModal.addEventListener('click', function(e) {
        if (e.target === appModal) {
            appModal.classList.remove('active');
            selectedAppProduct = null;
        }
    });
    
    // أحداث نافذة الألعاب
    gameAmount.addEventListener('change', updateGamePricePreview);
    
    confirmGameBtn.addEventListener('click', function() {
        if (!selectedGameProduct) return;
        
        const amount = gameAmount.value;
        const playerIdValue = gamePlayerId.value.trim();
        
        if (!amount) {
            showToast('يرجى اختيار الكمية');
            return;
        }
        
        if (!playerIdValue) {
            showToast('يرجى إدخال رقم اللاعب');
            return;
        }
        
        let productId = selectedGameProduct.id;
        let productName = selectedGameProduct.name || selectedGameProduct.baseName;
        let productPrice = null;
        let amountDisplay = '';
        
        if (selectedGameProduct.selectedAmount) {
            productId = selectedGameProduct.id + '_' + selectedGameProduct.selectedAmount.value;
            productName = `${selectedGameProduct.groupName} - ${selectedGameProduct.selectedAmount.display}`;
            productPrice = selectedGameProduct.selectedAmount.price;
            amountDisplay = selectedGameProduct.selectedAmount.display;
        }
        
        addToCart(productId, null, productPrice, null, null, amount, playerIdValue);
        showToast('تمت إضافة المنتج إلى السلة بنجاح!');
        gameModal.classList.remove('active');
        selectedGameProduct = null;
    });
    
    gameClose.addEventListener('click', () => {
        gameModal.classList.remove('active');
        selectedGameProduct = null;
    });
    
    gameModal.addEventListener('click', function(e) {
        if (e.target === gameModal) {
            gameModal.classList.remove('active');
            selectedGameProduct = null;
        }
    });
    
    // أحداث نافذة تفعيلات البريميوم
    confirmPremiumBtn.addEventListener('click', function() {
        if (!selectedPremiumProduct) return;
        
        const premiumInputValue = document.getElementById('premiumInput').value.trim();
        
        if (!premiumInputValue) {
            showToast('يرجى إدخال البيانات المطلوبة');
            return;
        }
        
        addToCart(selectedPremiumProduct.id, null, selectedPremiumProduct.price, null, null, null, null, null, premiumInputValue);
        
        premiumModal.classList.remove('active');
        selectedPremiumProduct = null;
    });
    
    premiumClose.addEventListener('click', () => {
        premiumModal.classList.remove('active');
        selectedPremiumProduct = null;
    });
    
    premiumModal.addEventListener('click', function(e) {
        if (e.target === premiumModal) {
            premiumModal.classList.remove('active');
            selectedPremiumProduct = null;
        }
    });

    // ==================== أحداث نافذة إيميل التصميم ====================
    const designEmailModal  = document.getElementById('designEmailModal');
    const designEmailClose  = document.getElementById('designEmailClose');
    const confirmDesignEmailBtn = document.getElementById('confirmDesignEmailBtn');

    confirmDesignEmailBtn.addEventListener('click', function() {
        if (!selectedDesignProduct) return;

        const emailVal = document.getElementById('designEmailInput').value.trim();

        if (!emailVal) {
            showToast('يرجى إدخال الإيميل أولاً');
            return;
        }

        // التحقق من صيغة الإيميل
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailVal)) {
            showToast('يرجى إدخال إيميل صحيح');
            return;
        }

        // إضافة للسلة مع حفظ الإيميل في اسم المنتج
        const cartItem = {
            id: selectedDesignProduct.id,
            name: selectedDesignProduct.name + ' | إيميل: ' + emailVal,
            price: selectedDesignProduct.price || 0,
            quantity: 1,
            image: selectedDesignProduct.image,
            category: 'برامج التصميم',
            email: emailVal
        };
        const existing = cart.find(i => i.id === cartItem.id);
        if (existing) {
            existing.quantity++;
            existing.email = emailVal;
            existing.name = cartItem.name;
        } else {
            cart.push(cartItem);
        }
        localStorage.setItem('zoodnyCart', JSON.stringify(cart));
        updateCartUI();
        designEmailModal.classList.remove('active');
        selectedDesignProduct = null;
        showToast('تمت إضافة المنتج إلى السلة بنجاح!');
    });

    designEmailClose.addEventListener('click', () => {
        designEmailModal.classList.remove('active');
        selectedDesignProduct = null;
    });

    designEmailModal.addEventListener('click', function(e) {
        if (e.target === designEmailModal) {
            designEmailModal.classList.remove('active');
            selectedDesignProduct = null;
        }
    });
    
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuOverlay.classList.toggle('active');
        var bottomNav = document.getElementById('mobileBottomNav');
        if (bottomNav) bottomNav.style.display = menuOverlay.classList.contains('active') ? 'none' : '';
    });
    
    menuOverlay.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuOverlay.classList.remove('active');
        var bottomNav = document.getElementById('mobileBottomNav');
        if (bottomNav) bottomNav.style.display = '';
    });
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            if (!this.getAttribute('href').includes('#categories')) {
                navLinks.classList.remove('active');
                menuOverlay.classList.remove('active');
                var bottomNav = document.getElementById('mobileBottomNav');
                if (bottomNav) bottomNav.style.display = '';
                return;
            }
            
            if (productsSection.style.display === 'block') {
                e.preventDefault();
                backToCategoriesView();
                navLinks.classList.remove('active');
                menuOverlay.classList.remove('active');
                var bottomNav = document.getElementById('mobileBottomNav');
                if (bottomNav) bottomNav.style.display = '';
            }
        });
    });
    
    backToCategories.addEventListener('click', function(e) {
        e.preventDefault();
        backToCategoriesView();
    });
    

function restoreBottomNav() {
    var bottomNav = document.getElementById('mobileBottomNav');
    if (bottomNav) {
        bottomNav.style.transform   = '';
        bottomNav.style.opacity     = '';
        bottomNav.style.pointerEvents = '';
    }
    var floatBadge = document.getElementById('floatingBalBadge');
    if (floatBadge && typeof currentUser !== 'undefined' && currentUser) {
        floatBadge.style.display = '';
    }
}

    const cartToggleElements = [cartToggle, mobileCartToggle].filter(el => el);
    cartToggleElements.forEach(el => {
        el.addEventListener('click', () => {
            cartSidebar.classList.add('active');
            cartOverlay.classList.add('active');
            navLinks.classList.remove('active');
            menuOverlay.classList.remove('active');
            // Hide mobile bottom nav while cart is open
            var bottomNav = document.getElementById('mobileBottomNav');
            if (bottomNav) {
                bottomNav.style.transform = 'translateX(-50%) translateY(120%)';
                bottomNav.style.opacity   = '0';
                bottomNav.style.pointerEvents = 'none';
            }
            var floatBadge = document.getElementById('floatingBalBadge');
            if (floatBadge) floatBadge.style.display = 'none';
        });
    });
    
    closeCart.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        restoreBottomNav();
    });
    
    cartOverlay.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        restoreBottomNav();
    });
    
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast('السلة فارغة، أضف منتجات أولاً');
            return;
        }
        // Require login
        if (typeof auth !== 'undefined' && !auth.currentUser) {
            showToast('سجّل دخولك أولاً للمتابعة');
            if (window.openAuth) window.openAuth('login');
            return;
        }
        // Check balance — fetch fresh from Firebase to avoid stale cache
        var totalText = cartTotalPrice ? cartTotalPrice.textContent : '0';
        var cartTotal = parseFloat(totalText.replace(/[^0-9.]/g, '')) || 0;

        function proceedToCheckout() {
            // مباشرة لنافذة التأكيد بدون نموذج بيانات
            navLinks.classList.remove('active');
            menuOverlay.classList.remove('active');
            cartSidebar.classList.remove('active');
            cartOverlay.classList.remove('active');
            restoreBottomNav();
            if (typeof openConfirmModal === 'function') {
                openConfirmModal();
            }
        }

        function checkBalanceAndProceed(bal) {
            if (cartTotal > 0 && bal < cartTotal) {
                if (typeof balToast === 'function') {
                    balToast('رصيدك غير كافٍ! رصيدك: ' + bal.toFixed(2) + '$ والمطلوب: ' + cartTotal.toFixed(2) + '$');
                } else {
                    showToast('رصيدك غير كافٍ! رصيدك: ' + bal.toFixed(2) + '$');
                }
                return;
            }
            proceedToCheckout();
        }

        // Try to get fresh balance from Firebase
        if (typeof db !== 'undefined' && typeof auth !== 'undefined' && auth.currentUser) {
            db.ref('users/' + auth.currentUser.uid + '/balance').once('value', function(snap) {
                var bal = parseFloat(snap.val() || 0);
                // Also update local userData so getBalance() stays in sync
                if (typeof userData !== 'undefined' && userData) userData.balance = bal;
                checkBalanceAndProceed(bal);
            });
        } else {
            var bal = (typeof getBalance === 'function') ? getBalance() : 0;
            checkBalanceAndProceed(bal);
        }
    });
    
    closeCustomer.addEventListener('click', () => {
        customerModal.classList.remove('active');
    });
    
    paymentMethodInput.value = 'sham-cash';
    
    copyAccountId.addEventListener('click', copyAccountIdToClipboard);
    
    productDetailsClose.addEventListener('click', () => {
        productDetailsModal.classList.remove('active');
    });
    
    productDetailsModal.addEventListener('click', function(e) {
        if (e.target === productDetailsModal) {
            productDetailsModal.classList.remove('active');
        }
    });
    
    // -------------------- إرسال نموذج العميل --------------------
    customerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const customerData = {
            name: document.getElementById('customerName').value,
            phone: document.getElementById('customerPhone').value,
            city: document.getElementById('customerCity').value,
            paymentMethod: paymentMethodInput.value
        };
        
        // تم حذف نموذج البيانات — الانتقال مباشرة
        customerModal.classList.remove('active');
    });
    
    paymentClose.addEventListener('click', () => {
        paymentModal.style.display = 'none';
        paymentModal.classList.remove('active');
    });

    // ── Open confirm modal: show summary + balance ──
    function openConfirmModal() {
        var total = cart.reduce((s,i) => s+(i.price*(i.quantity||1)), 0);
        // Read fresh balance from Firebase
        var bal = (typeof getBalance === 'function') ? getBalance() : 0;
        if (typeof db !== 'undefined' && typeof auth !== 'undefined' && auth.currentUser) {
            db.ref('users/' + auth.currentUser.uid + '/balance').once('value', function(snap) {
                var freshBal = parseFloat(snap.val() || 0);
                if (typeof userData !== 'undefined' && userData) userData.balance = freshBal;
                _buildConfirmModal(total, freshBal);
            });
            return;
        }
        _buildConfirmModal(total, bal);
    }
    function _buildConfirmModal(total, bal) {


        // render items
        var itemsHtml = cart.map(function(item) {
            return '<div style="display:flex;justify-content:space-between;padding:.3rem 0;border-bottom:1px solid #eee">'
                + '<span>' + item.name + (item.quantity>1?' × '+item.quantity:'') + '</span>'
                + '<span style="font-weight:600">' + (item.price*(item.quantity||1)).toFixed(2) + '$</span>'
                + '</div>';
        }).join('');
        document.getElementById('confirmOrderItems').innerHTML = itemsHtml;
        document.getElementById('confirmOrderTotal').textContent = total.toFixed(2) + '$';
        document.getElementById('confirmWalletBal').textContent  = bal.toFixed(2) + '$';
        var after = bal - total;
        document.getElementById('confirmBalAfter').textContent   = (after < 0 ? '0.00' : after.toFixed(2)) + '$';
        document.getElementById('confirmBalAfter').style.color   = after < 0 ? '#E74C3C' : 'var(--primary)';

        // set hidden payment data
        currentPaymentData = {
            transferNumber:  'WALLET',
            paidAmount:      total.toFixed(2),
            transferDate:    new Date().toISOString().split('T')[0],
            requiredAmount:  total.toFixed(2)
        };

        // generate order number
        var orderNum = '#' + String(Date.now()).slice(-6);
        document.getElementById('orderNumber').textContent = orderNum;

        document.getElementById('submitPaymentErr').textContent = '';
        paymentModal.style.display = 'block';
        paymentModal.classList.add('active');
    }

    // ── إتمام الطلب (من محتوى cart الحالي): فحص الرصيد ← حفظ الطلب ← خصم الرصيد ← نافذة النجاح ──
    // يُرجع Promise بالنتيجة: { ok:true, orderId, total } أو { ok:false, reason:'empty'|'login'|'balance'|'error', bal, total }
    // تستخدمه نافذة التأكيد، ونظام الطلب المباشر (direct-order.js).
    function finishOrder(total) {
        var orderId    = 'ORD-' + Date.now();
        var totalPrice = total;
        var orderDate  = new Date().toLocaleString('ar-SY');
        var items = {};
        cart.forEach(function(i, idx) {
            var key = 'item_' + (idx + 1);
            var obj = {
                productName: i.name,
                price:       i.price,
                quantity:    i.quantity || 1,
                totalItem:   parseFloat((i.price * (i.quantity || 1)).toFixed(2)),
                category:    i.category
            };
            if (i.id !== undefined && i.id !== null) obj.pid = String(i.id);   // لربط الطلب بسعر رأس المال في تقرير الأرباح
            if (i.category === 'games')             { obj.playerId = i.playerId||''; obj.gameValue = i.gameDisplay||i.gameValue||''; }
            if (i.category === 'app')               { obj.playerId = i.playerId||''; obj.appValue  = i.appValue||''; }
            if (i.category === 'rased')             { obj.phoneNumber = i.phoneNumber||''; obj.creditValue = i.creditValue||''; }
            if (i.category === 'social-media')      { obj.customQuantity = i.customQuantity||300; obj.socialLink = i.socialLink||''; }
            if (i.category === 'تفعيلات بريميوم') { obj.premiumInput = i.premiumInput||''; }
            if (i.reqValue) { obj.reqType = i.reqType || 'text'; obj.reqLabel = i.reqLabel || 'المعلومة المطلوبة'; obj.reqValue = i.reqValue; }
            items[key] = obj;
        });
        var uid    = (typeof auth !== 'undefined' && auth.currentUser) ? auth.currentUser.uid : '';
        var uname  = (typeof userData !== 'undefined' && userData) ? (userData.name  || '') : '';
        var uphone = (typeof userData !== 'undefined' && userData) ? (userData.phone || '') : '';
        var uemail = (typeof userData !== 'undefined' && userData) ? (userData.email || '') : '';
        if (typeof auth !== 'undefined' && auth.currentUser) {
            if (!uemail) uemail = auth.currentUser.email || '';
            if (!uname)  uname  = auth.currentUser.displayName || '';
        }

        // ── 1. إغلاق نافذة التأكيد إن كانت مفتوحة ──
        var pm = document.getElementById('paymentModal');
        if (pm) { pm.style.cssText = 'display:none !important'; pm.classList.remove('active'); }

        // ── 2. عرض نافذة النجاح ──
        document.getElementById('orderSuccessId').textContent    = orderId;
        document.getElementById('orderSuccessTotal').textContent = totalPrice.toFixed(2) + '$';
        var ov = document.getElementById('orderSuccessOv');
        var mo = document.getElementById('orderSuccessModal');
        if (ov) { ov.style.display = 'block'; ov.classList.add('on'); }
        if (mo) { mo.style.opacity = '1'; mo.style.pointerEvents = 'all'; mo.style.transform = 'translate(-50%,-50%) scale(1)'; mo.classList.add('on'); }

        // ── 3. تفريغ السلة الداخلية ──
        cart = [];
        hasSocialMediaProduct = false;
        hasCreditProduct = false;
        hasGameProduct = false;
        hasAppProduct = false;
        hasPremiumProduct = false;
        localStorage.removeItem('zoodnyCart');
        updateCartUI();
        try { cartSidebar.classList.remove('active'); cartOverlay.classList.remove('active'); restoreBottomNav(); } catch(e){}
        try { customerForm.reset(); } catch(e){}
        try { socialMediaFields.classList.remove('active'); } catch(e){}

        // ── 4. حفظ في Firebase ──
        if (typeof db !== 'undefined' && uid) {
            db.ref('store_orders/' + orderId).set({
                orderId:orderId, uid:uid, name:uname, phone:uphone, email:uemail,
                city:'غير محدد', items:items, total:totalPrice,
                paymentMethod:'wallet', date:orderDate, status:'pending', ts:Date.now()
            });
            if (typeof notifyAdminNewOrder === 'function') {
                notifyAdminNewOrder(orderId, uname, Object.keys(items).map(function(k){ return items[k]; }), totalPrice);
            }
            db.ref('users/'+uid+'/orders/'+orderId).set({ orderId:orderId, date:orderDate, total:totalPrice, status:'pending' });
            db.ref('users/'+uid+'/ordersCount').transaction(function(c){ return (c||0)+1; });
            db.ref('users/'+uid+'/balance').transaction(function(cur){ var n=(parseFloat(cur)||0)-totalPrice; return n<0?0:Math.round(n*100)/100; });
            db.ref('users/'+uid+'/transactions/TX-'+Date.now()).set({
                desc:'دفع طلب '+orderId, date:orderDate,
                amount:totalPrice, type:'debit', orderId:orderId, txCategory:'order', ts:Date.now()
            });
        }
        return { ok: true, orderId: orderId, total: totalPrice };
    }

    var _placing = false;
    window.zoodnyPlaceOrder = function() {
        return new Promise(function(resolve) {
            var total = cart.reduce(function(s, i) { return s + (i.price * (i.quantity || 1)); }, 0);
            total = Math.round(total * 100) / 100;
            if (!cart.length) { resolve({ ok: false, reason: 'empty' }); return; }
            // لا طلب بدون المعلومة التي يطلبها المنتج (رابط/إيميل/...) — حماية مهما كان مصدر الضغط
            var getReq = window.zoodnyGetProductReq;
            if (typeof getReq === 'function' && cart.some(function(l) { return getReq(l) && !l.reqValue; })) {
                resolve({ ok: false, reason: 'missing' }); return;
            }
            if (typeof auth === 'undefined' || !auth.currentUser) { resolve({ ok: false, reason: 'login', total: total }); return; }
            if (typeof window.zoodnyMaintenanceActive === 'function' && window.zoodnyMaintenanceActive()) {
                if (typeof showToast === 'function') showToast('المتجر في صيانة مؤقتة — حاول بعد قليل', 'warn');
                resolve({ ok: false, reason: 'unavailable' }); return;
            }
            // منتج نفذ من المخزون أو أخفاه المدير
            var unavail = typeof window.zoodnyLineUnavailable === 'function' ? cart.filter(window.zoodnyLineUnavailable) : [];
            if (unavail.length) {
                if (typeof showToast === 'function') showToast('عذراً، "' + (unavail[0].name || 'المنتج') + '" نفذ من المخزون حالياً', 'error');
                resolve({ ok: false, reason: 'unavailable' }); return;
            }
            if (_placing) { resolve({ ok: false, reason: 'busy' }); return; }
            _placing = true;
            // الحساب المحظور لا يستطيع الطلب (والقاعدة في Firebase تمنعه أيضاً)
            db.ref('blocked_users/' + auth.currentUser.uid).once('value').then(function(b) { return b.exists(); }, function() { return false; }).then(function(blocked) {
            if (blocked) {
                _placing = false;
                if (typeof showToast === 'function') showToast('حسابك موقوف عن الطلب — تواصل مع خدمة العملاء', 'error');
                resolve({ ok: false, reason: 'blocked' }); return;
            }
            db.ref('users/' + auth.currentUser.uid + '/balance').once('value', function(snap) {
                var bal = parseFloat(snap.val() || 0);
                if (typeof userData !== 'undefined' && userData) userData.balance = bal;
                _placing = false;
                if (bal < total) { resolve({ ok: false, reason: 'balance', bal: bal, total: total }); return; }
                try { resolve(finishOrder(total)); }
                catch (e) { console.error('finishOrder', e); resolve({ ok: false, reason: 'error', error: e }); }
            }, function(err) {
                _placing = false;
                resolve({ ok: false, reason: 'error', error: err });
            });
            });
        });
    };
    window.zoodnyOpenConfirm = function() { openConfirmModal(); };

    submitPayment.addEventListener('click', function() {
        var errEl  = document.getElementById('submitPaymentErr');
        var btn    = document.getElementById('submitPayment');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الطلب...';
        window.zoodnyPlaceOrder().then(function(r) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-bolt"></i> طلب';
            if (r.ok) return;
            if (r.reason === 'balance') errEl.textContent = 'رصيدك غير كافٍ! رصيدك: ' + r.bal.toFixed(2) + '$ والمطلوب: ' + r.total.toFixed(2) + '$';
            else if (r.reason === 'login') { errEl.textContent = 'سجّل دخولك أولاً'; if (window.openAuth) window.openAuth('login'); }
            else if (r.reason === 'missing') errEl.textContent = 'أدخل المعلومة المطلوبة للمنتج أولاً';
            else if (r.reason !== 'busy') errEl.textContent = 'تعذّر إتمام الطلب، حاول مجدداً';
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            if (targetId === '#categories' && productsSection.style.display === 'block') {
                e.preventDefault();
                backToCategoriesView();
                return;
            }
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                navLinks.classList.remove('active');
                menuOverlay.classList.remove('active');
                var bottomNav = document.getElementById('mobileBottomNav');
                if (bottomNav) bottomNav.style.display = '';
            }
        });
    });

    AOS.init({
        duration: 800,
        once: true,
        offset: 100
    });

    // ============================================================
    // البحث داخل الهيرو
    // ============================================================
    (function initSearch() {
        const searchInput    = document.getElementById('globalSearchInput');
        const resultsOverlay = document.getElementById('searchResultsOverlay');
        const heroSearchBtn  = document.getElementById('heroSearchBtn');
        const searchClearBtn = document.getElementById('searchClearBtn');
        const searchTags     = document.querySelectorAll('.search-tag');

        // ── Build a dedicated search index that includes ALL products
        //    from ALL data arrays — each entry has a unique _uid key
        //    so there are NO ID collisions
        var searchIndex = [];
        var _uidCounter = 0;

        // دالة بناء الفهرس — يُعاد استدعاؤها تلقائياً عند أي تعديل من لوحة المدير
        function buildSearchIndex() {
        searchIndex.length = 0;
        _uidCounter = 0;

        // Helper: add a flat product to index
        function addToIndex(obj) {
            searchIndex.push(Object.assign({ _uid: ++_uidCounter }, obj));
        }

        // 1. Main products array (accessories, social-media, rased…)
        products.forEach(function(p) {
            addToIndex({
                id:       p.id,
                name:     p.name,
                category: p.category || '',
                price:    p.price || 0,
                basePrice:p.basePrice || 0,
                description: p.description || '',
                image:    p.image || '',
                _source:  'products'
            });
        });

        // 2. Premium activations (telegram stars, youtube premium…)
        if (typeof premiumActivationsData !== 'undefined') {
            premiumActivationsData.forEach(function(group) {
                (group.products || []).forEach(function(p) {
                    addToIndex({
                        id:          group.id + '__' + p.id,
                        name:        p.name,
                        category:    group.category || 'تفعيلات بريميوم',
                        price:       p.price || 0,
                        description: group.description || '',
                        image:       group.image || '',
                        _groupId:    group.id,
                        _groupName:  group.name,
                        _source:     'premium'
                    });
                });
            });
        }

        // 3. VPN data
        if (typeof vpnData !== 'undefined') {
            vpnData.forEach(function(group) {
                (group.products || []).forEach(function(p) {
                    addToIndex({
                        id:          group.id + '__' + p.id,
                        name:        p.name,
                        category:    group.category || 'اشتراكات VPN',
                        price:       p.price || 0,
                        description: group.description || '',
                        image:       group.image || '',
                        _groupId:    group.id,
                        _groupName:  group.name,
                        _source:     'vpn'
                    });
                });
            });
        }

        // 4. Electronic payment (iTunes, Steam, PSN, Visa…)
        if (typeof electronicPaymentData !== 'undefined') {
            electronicPaymentData.forEach(function(group) {
                (group.products || []).forEach(function(p) {
                    addToIndex({
                        id:          group.id + '__' + p.id,
                        name:        p.name,
                        category:    group.category || 'الدفع electronique',
                        price:       p.price || 0,
                        description: group.description || '',
                        image:       group.image || '',
                        _groupId:    group.id,
                        _groupName:  group.name,
                        _source:     'payment'
                    });
                });
            });
        }

        }
        buildSearchIndex();
        window.__rebuildSearchIndex = buildSearchIndex;

        // Category labels & colors
        const CAT_CONFIG = {
            'social-media':           { name: 'سوشال ميديا',    color: '#E1306C' },
            'rased':                  { name: 'رصيد موبايل',     color: '#27ae60' },
            'games':                  { name: 'ألعاب',            color: '#E74C3C' },
            'app':                    { name: 'تطبيقات شحن',     color: '#3498db' },
            'chat':                   { name: 'ذكاء اصطناعي',    color: '#9b59b6' },
            'تفعيلات بريميوم':       { name: 'بريميوم',          color: '#F39C12' },
            'food':                   { name: 'طعام',             color: '#2ECC71' },
            'اشتراكات VPN':           { name: 'VPN',              color: '#16a085' },
            'الدفع electronique':     { name: 'دفع إلكتروني',     color: '#8e44ad' },
            'الدفع الالكتروني':       { name: 'دفع إلكتروني',     color: '#8e44ad' },
        };

        function getCatCfg(cat) {
            return CAT_CONFIG[cat] || { name: cat || 'أخرى', color: '#7F8C9A' };
        }

        function getRating(product) {
            if (productRatings && productRatings[product.id]) {
                return productRatings[product.id].avg;
            }
            // For string IDs (grouped products), use _uid for variance
            var seed = typeof product.id === 'number' ? product.id : (product._uid || 1);
            return (3.5 + (seed % 10) * 0.15).toFixed(1);
        }

        function renderStars(rating) {
            const r = parseFloat(rating);
            let s = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= Math.floor(r))         s += '<i class="fas fa-star"></i>';
                else if (i - r < 1 && i > r)    s += '<i class="fas fa-star-half-alt"></i>';
                else                              s += '<i class="far fa-star"></i>';
            }
            return s;
        }

        // Highlight matching text
        function highlightMatch(text, query) {
            if (!query) return text;
            const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const re = new RegExp('(' + escaped + ')', 'gi');
            return text.replace(re, '<mark>$1</mark>');
        }

        // Price display
        function getPriceText(p) {
            if (p.category === 'social-media') {
                return p.basePrice ? parseFloat(p.basePrice).toFixed(2) + '$/ألف' : 'بالكمية';
            }
            if (p.category === 'games' || p.category === 'rased') return 'اختر الكمية';
            var pr = parseFloat(p.price);
            if (!isNaN(pr) && pr > 0) return pr.toFixed(2) + '$';
            return 'اختر';
        }

        // Search engine — uses searchIndex (collision-free)
        function searchProducts(query) {
            const q = query.toLowerCase().trim();
            if (q.length < 1) return [];

            // Split query into words for multi-word matching
            const words = q.split(/\s+/).filter(w => w.length > 1);

            const scored = searchIndex.map(function(p) {
                let score = 0;
                const name      = (p.name || '').toLowerCase();
                const desc      = (p.description || '').toLowerCase();
                const cat       = (p.category || '').toLowerCase();
                const catName   = getCatCfg(p.category).name.toLowerCase();
                const groupName = (p._groupName || '').toLowerCase();

                // ── Exact & prefix matches (highest weight) ──
                if (name === q)              { score += 100; }
                else if (name.startsWith(q)) { score += 80;  }
                else if (name.includes(q))   { score += 60;  }

                // ── Group name (telegram stars → group "نجوم تليغرام") ──
                if (groupName) {
                    if (groupName === q)             score += 90;
                    else if (groupName.startsWith(q))score += 70;
                    else if (groupName.includes(q))  score += 50;
                }

                // ── Description ──
                if (desc.includes(q)) score += 20;

                // ── Category ──
                if (cat.includes(q) || catName.includes(q)) score += 15;

                // ── Multi-word: every word must hit somewhere ──
                if (words.length > 1) {
                    var allHit = words.every(function(w) {
                        return name.includes(w) || groupName.includes(w) || desc.includes(w);
                    });
                    if (allHit) score += 40;

                    words.forEach(function(w) {
                        if (name.includes(w))      score += 12;
                        if (groupName.includes(w)) score += 10;
                        if (desc.includes(w))      score += 4;
                    });
                }

                return { product: p, score: score };
            })
            .filter(function(x) { return x.score > 0; })
            .sort(function(a, b) { return b.score - a.score; })
            .map(function(x) { return x.product; });

            return scored;
        }

        let _searchTimer = null;
        let _lastQuery   = '';

        function doSearch(rawQuery) {
            const query = rawQuery.trim();
            _lastQuery  = query;

            // Toggle clear button
            if (searchClearBtn) {
                searchClearBtn.classList.toggle('visible', query.length > 0);
            }

            if (query.length < 1) {
                resultsOverlay.classList.remove('active');
                resultsOverlay.innerHTML = '';
                return;
            }

            // Show loading immediately
            resultsOverlay.innerHTML = '<div class="search-loading"><i class="fas fa-spinner"></i>جارٍ البحث...</div>';
            resultsOverlay.classList.add('active');

            clearTimeout(_searchTimer);
            _searchTimer = setTimeout(function() {
                if (query !== _lastQuery) return; // stale

                const allResults = searchProducts(query);
                const results    = allResults.slice(0, 12);

                if (results.length === 0) {
                    resultsOverlay.innerHTML = `
                                <div class="search-no-results">
                                    <i class="fas fa-search-minus"></i>
                                    <p>لا توجد نتائج لـ "${query}"</p>
                                    <small>جرّب كلمة أخرى أو تصفّح التصنيفات</small>
                                </div>`;
                } else {
                    // Group by category
                    const grouped = {};
                    results.forEach(p => {
                        const k = p.category || 'other';
                        if (!grouped[k]) grouped[k] = [];
                        grouped[k].push(p);
                    });

                    let html = `
                                <div class="search-results-header">
                                    <div class="search-results-count">
                                        <i class="fas fa-check-circle" style="color:var(--secondary-dk)"></i>
                                        <span>${allResults.length}</span> نتيجة
                                    </div>
                                </div>
                                <div class="search-results-list">`;

                    Object.entries(grouped).forEach(([cat, items]) => {
                        const cfg = getCatCfg(cat);
                        html += `<div class="search-section-label"><i style="color:${cfg.color}" class="fas fa-circle" style="font-size:.5rem"></i> ${cfg.name}</div>`;

                        items.forEach(p => {
                            const img   = p.image || '';
                            const price = getPriceText(p);
                            const name  = highlightMatch(p.name, query);
                            const rating= getRating(p);
                            const cfg2  = getCatCfg(p.category);

                            html += `
                                        <div class="search-result-item" data-uid="${p._uid}">
                                            <img src="${img}"
                                                 class="search-result-img"
                                                 alt="${p.name}"
                                                 loading="lazy"
                                                 onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                                            <div class="search-result-img" style="display:none;align-items:center;justify-content:center;background:#edf0f5;font-size:1.3rem;color:#aaa">
                                                <i class="fas fa-image"></i>
                                            </div>
                                            <div class="search-result-info">
                                                <div class="search-result-name">${name}</div>
                                                <div class="search-result-category">
                                                    <span class="search-result-cat-dot" style="background:${cfg2.color}"></span>
                                                    ${cfg2.name}
                                                </div>
                                                <div class="sri-stars">${renderStars(rating)} <span style="color:var(--gray);font-size:.68rem;">${parseFloat(rating).toFixed(1)}</span></div>
                                            </div>
                                            <div class="search-result-price">${price}</div>
                                            <i class="fas fa-chevron-left sri-arrow"></i>
                                        </div>`;
                        });
                    });

                    html += '</div>';
                    resultsOverlay.innerHTML = html;
                }

                resultsOverlay.classList.add('active');

                // Click handlers
                resultsOverlay.querySelectorAll('.search-result-item[data-uid]').forEach(function(el) {
                    el.addEventListener('click', function() {
                        var uid = parseInt(this.getAttribute('data-uid'));
                        // Find from searchIndex by _uid
                        var p = searchIndex.find(function(x){ return x._uid === uid; });
                        if (!p) return;
                        closeSearch();

                        // For grouped products (premium / VPN / payment / games-sub)
                        if (p._groupId) {
                            if (typeof openServiceInputModal === 'function') {
                                // Build a product-like object for the modal
                                var modalProd = {
                                    id:          p.id,
                                    name:        p.name,
                                    category:    p.category,
                                    price:       p.price || 0,
                                    description: p.description || '',
                                    image:       p.image || '',
                                    _groupId:    p._groupId,
                                    _groupName:  p._groupName,
                                    _source:     p._source
                                };
                                openServiceInputModal(modalProd);
                            }
                            return;
                        }

                        // Normal flat products
                        var pid = typeof p.id === 'number' ? p.id : parseInt(p.id);
                        if (typeof showProductDetails === 'function') showProductDetails(pid);
                        else if (typeof openServiceInputModal === 'function') openServiceInputModal(p);
                    });
                });

            }, 220);
        }

        function closeSearch() {
            resultsOverlay.classList.remove('active');
            resultsOverlay.innerHTML = '';
            searchInput.value = '';
            if (searchClearBtn) searchClearBtn.classList.remove('visible');
        }

        // Events
        searchInput.addEventListener('input', function() { doSearch(this.value); });
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeSearch();
            if (e.key === 'Enter') {
                const first = resultsOverlay.querySelector('.search-result-item[data-pid]');
                if (first) first.click();
            }
        });

        if (searchClearBtn) {
            searchClearBtn.addEventListener('click', function() { closeSearch(); searchInput.focus(); });
        }

        heroSearchBtn.addEventListener('click', function() {
            if (searchInput.value.trim()) doSearch(searchInput.value);
            else searchInput.focus();
        });

        // Click outside to close
        document.addEventListener('click', function(e) {
            const wrapper = document.querySelector('.hero-search-wrapper');
            if (wrapper && !wrapper.contains(e.target)) {
                resultsOverlay.classList.remove('active');
            }
        });

        // Quick tags
        searchTags.forEach(tag => {
            tag.addEventListener('click', function() {
                const q = this.getAttribute('data-query');
                searchInput.value = q;
                doSearch(q);
                searchInput.focus();
            });
        });
    })();

    // ============================================================
    // ٣. كوبون الخصم
    // ============================================================
    const COUPONS = {
        'ZOODNY10': { type: 'percent', value: 10, label: '10% خصم' },
        'SAVE5': { type: 'fixed', value: 5, label: 'خصم 5$' },
        'WELCOME': { type: 'percent', value: 15, label: '15% خصم للعملاء الجدد' }
    };

    let appliedCoupon = null;

    document.getElementById('applyCouponBtn').addEventListener('click', function() {
        const code = document.getElementById('couponInput').value.trim().toUpperCase();
        const msgEl = document.getElementById('couponMessage');
        
        if (!code) {
            msgEl.textContent = 'يرجى إدخال كود الخصم';
            msgEl.className = 'coupon-message error';
            return;
        }

        if (COUPONS[code]) {
            appliedCoupon = { code, ...COUPONS[code] };
            msgEl.textContent = `✓ تم تطبيق الكوبون! ${appliedCoupon.label}`;
            msgEl.className = 'coupon-message success';
            updateCartUIWithDiscount();
        } else {
            appliedCoupon = null;
            msgEl.textContent = '✗ كود الخصم غير صحيح أو منتهي الصلاحية';
            msgEl.className = 'coupon-message error';
            updateCartUIWithDiscount();
        }
    });

    function updateCartUIWithDiscount() {
        const rawTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountRow = document.getElementById('discountRow');
        const discountAmount = document.getElementById('discountAmount');
        const cartTotalPriceEl = document.getElementById('cartTotalPrice');

        let discount = 0;
        if (appliedCoupon) {
            if (appliedCoupon.type === 'percent') {
                discount = rawTotal * appliedCoupon.value / 100;
            } else {
                discount = Math.min(appliedCoupon.value, rawTotal);
            }
            discountRow.style.display = 'flex';
            discountAmount.textContent = '-' + discount.toFixed(2) + '$';
        } else {
            discountRow.style.display = 'none';
        }

        const finalTotal = Math.max(0, rawTotal - discount);
        cartTotalPriceEl.textContent = finalTotal.toFixed(2) + '$';
    }

    // Override updateCartUI to include discount
    const _origUpdateCartUI = updateCartUI;
    window.updateCartUI = function() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cartCount').textContent = totalItems;
        const mcc = document.getElementById('mobileCartCount');
        if (mcc) mcc.textContent = totalItems;
        updateCartUIWithDiscount();
        renderCartItems();
    };

    // ============================================================
    // ٤. التقييمات
    // ============================================================
    const productRatings = {};

    // توليد تقييمات عشوائية للمنتجات عند التحميل
    products.forEach(p => {
        const avg = (3.5 + Math.random() * 1.5).toFixed(1);
        const count = Math.floor(Math.random() * 200) + 10;
        productRatings[p.id] = { avg: parseFloat(avg), count };
    });

});
