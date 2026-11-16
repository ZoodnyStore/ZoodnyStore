/* ══════════════════════════════════════════════════════════════════════
 * عرض التصنيفات والمنتجات
 * التصنيفات، الألعاب، التطبيقات، VPN، الدفع الإلكتروني، التلفاز، التصميم، الأرقام، المنصات، البحث داخل البطاقات.
 * ══════════════════════════════════════════════════════════════════════ */

// -------------------- دالة حساب سعر خدمات السوشال ميديا --------------------
// ربط بطاقة المنتج بمصدره (يستخدمه زر القلم للمدير في product-manager.js)
function pmgTagCard(card, src, id, row) {
    if (!card || !src || id === undefined || id === null) return;
    card.dataset.pmgSrc = src;
    card.dataset.pmgId = String(id);
    if (row !== undefined && row !== null) card.dataset.pmgRow = String(row);
}

function calculateSocialMediaPrice(productId, quantity) {
    const product = products.find(p => p.id === productId);
    if (!product || product.category !== 'social-media') return 0;
    
    const basePrice = product.basePrice || product.price || 0;
    const price = (quantity / 1000) * basePrice;
    
    return Math.round(price * 100) / 100;
}

// دالة مساعدة لفتح واتساب بشكل متوافق مع iPhone
function openWhatsApp(message) {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/963939083098?text=${encodedMessage}`;
    
    // محاولة فتح واتساب
    window.location.href = whatsappUrl;
    
    // إذا لم يفتح خلال ثانية، نعطي المستخدم خيار النسخ
    setTimeout(() => {
        if (document.hasFocus()) {
            if (confirm('لم يتم فتح واتساب؟\nاضغط OK لنسخ الرسالة وإرسالها يدوياً')) {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(message).then(() => {
                        showToast('تم نسخ الرسالة! ألصقها في واتساب');
                        window.open('https://wa.me/963939083098', '_blank');
                    }).catch(() => {
                        prompt('انسخ هذه الرسالة وأرسلها في واتساب:', message);
                    });
                } else {
                    prompt('انسخ هذه الرسالة وأرسلها في واتساب:', message);
                }
            }
        }
    }, 1000);
}

// -------------------- دالة تحديث نص حقل الرابط حسب نوع الخدمة --------------------
function updateSocialMediaFieldLabel() {
    if (!hasSocialMediaProduct) return;
    
    const socialItems = cart.filter(item => {
        const product = products.find(p => p.id === item.id);
        return product && product.category === 'social-media';
    });
    
    if (socialItems.length === 0) return;
    
    const firstItem = socialItems[0];
    const product = products.find(p => p.id === firstItem.id);
    
    let labelText = '';
    let placeholderText = '';
    let helpText = '';
    
    if (product) {
        const productName = product.name.toLowerCase();
        
        if (productName.includes('فيسبوك') || productName.includes('facebook')) {
            if (productName.includes('اعضاء') || productName.includes('كروبات') || productName.includes('members')) {
                labelText = 'رابط الكروب *';
                placeholderText = 'https://facebook.com/groups/groupname';
                helpText = 'أدخل رابط مجموعة الفيسبوك التي تريد إضافة أعضاء لها';
            } else if (productName.includes('تفاعل') || productName.includes('لايكات') || productName.includes('قلوب') || 
                      productName.includes('مشاهدات') || productName.includes('likes') || productName.includes('hearts') || 
                      productName.includes('views')) {
                labelText = 'رابط المنشور *';
                placeholderText = 'https://facebook.com/username/posts/postid';
                helpText = 'أدخل رابط المنشور الذي تريد دعمه بالتفاعلات';
            } else {
                labelText = 'رابط الصفحة *';
                placeholderText = 'https://facebook.com/pagename';
                helpText = 'أدخل رابط صفحة الفيسبوك التي تريد دعمها بمتابعين';
            }
        }
        else if (productName.includes('إنستغرام') || productName.includes('instagram')) {
            if (productName.includes('مشاهدات') || productName.includes('لايكات') || productName.includes('مشاركات') || 
                productName.includes('views') || productName.includes('likes') || productName.includes('shares')) {
                labelText = 'رابط المنشور/الفيديو *';
                placeholderText = 'https://instagram.com/p/postid';
                helpText = 'أدخل رابط المنشور أو الفيديو الذي تريد دعمه';
            } else {
                labelText = 'رابط الحساب *';
                placeholderText = 'https://instagram.com/username';
                helpText = 'أدخل رابط حساب الإنستغرام الذي تريد دعمه';
            }
        }
        else if (productName.includes('تيك توك') || productName.includes('tiktok')) {
            if (productName.includes('مشاهدات') || productName.includes('لايكات') || productName.includes('مشاركات') || 
                productName.includes('views') || productName.includes('likes') || productName.includes('shares')) {
                labelText = 'رابط الفيديو *';
                placeholderText = 'https://tiktok.com/@username/video/videoid';
                helpText = 'أدخل رابط فيديو التيك توك الذي تريد دعمه';
            } else {
                labelText = 'رابط الحساب *';
                placeholderText = 'https://tiktok.com/@username';
                helpText = 'أدخل رابط حساب التيك توك الذي تريد دعمه';
            }
        }
        else if (productName.includes('تليغرام') || productName.includes('telegram')) {
            if (productName.includes('اعضاء') || productName.includes('members')) {
                labelText = 'رابط القناة/المجموعة *';
                placeholderText = 'https://t.me/username';
                helpText = 'أدخل رابط قناة أو مجموعة التليغرام التي تريد دعمها';
            } else if (productName.includes('مشاهدات') || productName.includes('views')) {
                labelText = 'رابط المنشور *';
                placeholderText = 'https://t.me/username/postid';
                helpText = 'أدخل رابط المنشور الذي تريد دعمه بالمشاهدات';
            } else {
                labelText = 'رابط المنشور  *';
                placeholderText = 'https://t.me/username/postid';
                helpText = 'أدخل رابط المنشور الذي تريد دعمه بالتفاعلات';
            }
        }
        else if (productName.includes('يوتيوب') || productName.includes('youtube')) {
            if (productName.includes('مشتركين') || productName.includes('subscribers')) {
                labelText = 'رابط القناة *';
                placeholderText = 'https://youtube.com/@channelname';
                helpText = 'أدخل رابط قناة اليوتيوب التي تريد دعمها بمشتركين';
            } else {
                labelText = 'رابط الفيديو *';
                placeholderText = 'https://youtube.com/watch?v=videoid';
                helpText = 'أدخل رابط فيديو اليوتيوب الذي تريد دعمه';
            }
        } else {
            labelText = 'رابط الحساب/الصفحة *';
            placeholderText = 'https://...';
            helpText = 'أدخل رابط الحساب أو الصفحة التي تريد دعمها';
        }
    }
    
    const accountUrlLabel = document.querySelector('label[for="accountUrl"]');
    const accountUrlInput = document.getElementById('accountUrl');
    const accountUrlHelpText = document.querySelector('#accountUrl + small');
    
    if (accountUrlLabel) accountUrlLabel.textContent = labelText;
    if (accountUrlInput) {
        accountUrlInput.placeholder = placeholderText;
        accountUrlInput.value = '';
    }
    if (accountUrlHelpText) accountUrlHelpText.textContent = helpText;
}

// -------------------- عرض التصنيفات --------------------
function renderCategories() {
    categoriesGrid.innerHTML = '';
    
    categories.forEach(category => {
        const categoryCard = document.createElement('a');
        categoryCard.className = 'category-card';
        categoryCard.setAttribute('data-aos', 'fade-up');
        categoryCard.href = '#';
        categoryCard.dataset.category = category.id;
        pmgTagCard(categoryCard, 'categories', category.id);
        
        categoryCard.innerHTML = `
                    <div class="category-img-container">
                        <img src="${category.image}" 
                             class="category-img" 
                             alt="${category.name}"
                             loading="lazy">
                    </div>
                    <div class="category-info">
                        <h3 class="category-title">${category.name}</h3>
                        <p class="category-description">${category.description}</p>
                        <p class="category-count">${category.count} منتج</p>
                        <button class="category-btn" data-category="${category.id}">
                            <i class="fas fa-shopping-bag"></i> عرض المنتجات
                        </button>
                    </div>
                `;
        
        categoriesGrid.appendChild(categoryCard);
    });
    
    // فقط كروت قسم التصنيفات الرئيسية — لا تشمل الكروت الداخلية
    document.querySelectorAll('#categoriesGrid .category-card, #categoriesGrid .category-btn').forEach(element => {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            let categoryId = this.dataset.category;
            if (!categoryId && this.closest('.category-card')) {
                categoryId = this.closest('.category-card').dataset.category;
            }
            if (categoryId) {
                showCategoryProducts(categoryId);
            }
        });
    });
}

// -------------------- عرض منتجات التصنيف (معدلة) --------------------
function showCategoryProducts(categoryId) {
    // *** إظهار قسم المنتجات وإخفاء قسم التصنيفات ***
    currentCategory = categoryId;
    categoriesSection.style.display = 'none';
    productsSection.style.display = 'block';
    window.scrollTo({ top: productsSection.offsetTop - 80, behavior: 'smooth' });

    // *** ضبط عنوان التصنيف من مصفوفة categories ***
    const categoryObj = categories.find(c => c.id === categoryId);
    if (categoryObj) categoryProductsTitle.textContent = categoryObj.name;

    // أرقام للتطبيقات — نظام كروت مجمّعة
    if (categoryId === 'ارقام للتطبيقات') {
        productFilters.style.display = 'none';
        categoryProductsTitle.textContent = 'أرقام لتفعيل كافة التطبيقات';
        renderAppGroups();
    // تفعيلات البريميوم — نظام كروت مجمّعة
    } else if (categoryId === 'تفعيلات بريميوم') {
        productFilters.style.display = 'none';
        categoryProductsTitle.textContent = 'تفعيلات بريميوم';
        renderPremiumGroups();
    // اشتراكات VPN — نظام كروت مجمّعة
    } else if (categoryId === 'اشتراكات VPN') {
        productFilters.style.display = 'none';
        categoryProductsTitle.textContent = 'اشتراكات VPN';
        renderVpnGroups();
    // الدفع electronique — نظام كروت مجمّعة
    } else if (categoryId.includes('الدفع') || categoryId === 'الدفع electronique') {
        productFilters.style.display = 'none';
        categoryProductsTitle.textContent = 'الدفع الإلكتروني';
        renderPaymentGroups();
    // اشتراكات التلفاز — نظام كروت مجمّعة
    } else if (categoryId === 'اشتراكات التلفاز') {
        productFilters.style.display = 'none';
        categoryProductsTitle.textContent = 'اشتراكات التلفاز';
        renderTvGroups();
    // برامج التصميم — نظام كروت مجمّعة
    } else if (categoryId === 'برامج التصميم') {
        productFilters.style.display = 'none';
        categoryProductsTitle.textContent = 'اشتراكات برامج التصميم';
        renderDesignGroups();
    // شحن الألعاب — نظام كروت منفصلة
    } else if (categoryId === 'games') {
        productFilters.style.display = 'none';
        categoryProductsTitle.textContent = 'شحن ألعاب';
        renderGameGroups();
    // إذا كان التصنيف هو "خدمات سوشال ميديا"، نعرض المنصات أولاً
    } else if (categoryId === 'social-media') {
        renderPlatforms();
        productFilters.style.display = 'none';
    } else if (categoryId === 'arqam') {
        productFilters.style.display = 'none';
        renderArqamGroups('arqam', 'أرقام واتساب وتليغرام مكفولة');
    } else {
        productFilters.style.display = 'flex';
        renderCategoryFilters();
        renderProductsByCategory(categoryId);
    }
}

// -------------------- بناء مجموعات الألعاب (كل لعبة单独的 كرت) --------------------
function buildGameGroups() {
    const groups = {};
    gamesData.forEach(game => {
        const baseName = game.name.split(' - ')[0].trim();
        if (!groups[baseName]) {
            groups[baseName] = {
                baseName,
                image: game.image,
                description: game.description,
                inputLabel: game.inputLabel,
                games: []
            };
        }
        groups[baseName].games.push(game);
    });
    return Object.values(groups);
}

// -------------------- عرض كروت الألعاب --------------------
function renderGameGroups() {
    productsGrid.innerHTML = '';
    const groups = buildGameGroups();

    injectCardSearchBar(productsGrid, groups, function(query) {
        const q = query.trim().toLowerCase();
        document.querySelectorAll('#productsGrid .category-card').forEach(card => {
            const name = card.querySelector('.category-title')?.textContent.toLowerCase() || '';
            card.style.display = (!q || name.includes(q)) ? '' : 'none';
        });
    });

    groups.forEach((group, idx) => {
        const card = document.createElement('a');
        card.className = 'category-card';
        card.href = '#';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', String((idx % 4) * 80));

        if (group.games.length === 1) pmgTagCard(card, 'gamesData', group.games[0].id);
        let productCount = 0;
        group.games.forEach(g => {
            if (g.amounts) productCount += g.amounts.length;
        });

        const subtitles = group.games.map(g => {
            const part = g.name.includes(' - ') ? g.name.split(' - ')[1] : g.name;
            return part;
        });
        const subtitleText = subtitles.slice(0, 3).join(' · ') + (subtitles.length > 3 ? ' ...' : '');

        card.innerHTML = `
                    <div class="category-img-container">
                        <img src="${group.image}" class="category-img" alt="${group.baseName}" loading="lazy" onerror="this.onerror=null;this.src='images/placeholder.svg'">
                        <span class="product-badge">رقمي</span>
                    </div>
                    <div class="category-info">
                        <h3 class="category-title">${group.baseName}</h3>
                        <p class="category-description">${subtitleText || group.description || 'شحن الألعاب'}</p>
                        <p class="category-count">${productCount} باقة</p>
                        <button class="category-btn">
                            <i class="fas fa-shopping-bag"></i> عرض المنتجات
                        </button>
                    </div>
                `;

        card.addEventListener('click', (e) => { 
            e.preventDefault(); 
            showGameTypes(group);
        });
        productsGrid.appendChild(card);
    });
}

// -------------------- عرض الأنواع الداخلية للألعاب (شدات، كوينز، الخ) --------------------
function showGameTypes(group) {
    productsGrid.innerHTML = '';
    categoryProductsTitle.textContent = group.baseName;
    productFilters.style.display = 'none';

    const backWrap = document.createElement('div');
    backWrap.style.gridColumn = '1 / -1';
    backWrap.innerHTML = `
                <button class="back-to-games" id="backToGamesBtn">
                    <i class="fas fa-arrow-right"></i> العودة إلى الألعاب
                </button>
            `;
    productsGrid.appendChild(backWrap);
    backWrap.querySelector('#backToGamesBtn').addEventListener('click', () => {
        categoryProductsTitle.textContent = 'شحن ألعاب';
        renderGameGroups();
    });

    group.games.forEach((game, idx) => {
        const card = document.createElement('a');
        card.className = 'category-card';
        card.href = '#';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', String((idx % 4) * 80));

        pmgTagCard(card, 'gamesData', game.id);
        const typeName = game.name.includes(' - ')
            ? game.name.split(' - ').slice(1).join(' - ')
            : game.name;
        const productCount = game.amounts ? game.amounts.length : 0;

        card.innerHTML = `
                    <div class="category-img-container">
                        <img src="${game.image}" class="category-img" alt="${typeName}" loading="lazy" onerror="this.onerror=null;this.src='images/placeholder.svg'">
                        <span class="product-badge">رقمي</span>
                    </div>
                    <div class="category-info">
                        <h3 class="category-title">${typeName}</h3>
                        <p class="category-description">${game.description || 'شحن ' + typeName}</p>
                        <p class="category-count">${productCount} باقة</p>
                        <button class="category-btn">
                            <i class="fas fa-shopping-bag"></i> اختر الباقة
                        </button>
                    </div>
                `;

        card.addEventListener('click', (e) => { 
            e.preventDefault(); 
            openServiceInputModal(game);
        });
        productsGrid.appendChild(card);
    });
}

// -------------------- بناء مجموعات الدفع الإلكتروني حسب الفئة الرئيسية --------------------
function buildPaymentSuperGroups() {
    // تجميع electronicPaymentData في مجموعات رئيسية بناءً على اسم المنتج
    const superGroupDefs = [
        {
            key: 'visa',
            name: 'فيزا افتراضية',
            icon: 'fa-credit-card',
            color: '#1A1F71',
            image: 'images/فيزا.png',
            keywords: ['visa', 'فيزا']
        },
        {
            key: 'itunes',
            name: 'ايتونز',
            icon: 'fa-apple',
            color: '#FC3C44',
            image: 'images/ايتونز امريكي 1.jpg',
            keywords: ['itunes', 'ايتونز']
        },
        {
            key: 'steam',
            name: 'ستيم',
            icon: 'fa-steam',
            color: '#1b2838',
            image: 'images/ستيم.webp',
            keywords: ['steam', 'ستيم']
        },
        {
            key: 'psn',
            name: 'PSN بلايستيشن',
            icon: 'fa-playstation',
            color: '#003087',
            image: 'images/PSN.jpg',
            keywords: ['psn', 'بلايستيشن']
        },
    ];

    const superGroups = superGroupDefs.map(def => ({
        ...def,
        subGroups: electronicPaymentData.filter(g => {
            const nameLower = g.name.toLowerCase();
            return def.keywords.some(kw => nameLower.includes(kw));
        })
    })).filter(sg => sg.subGroups.length > 0);

    // أي مجموعة لم تُصنَّف تُضاف كمجموعة مستقلة
    const classifiedIds = new Set(superGroups.flatMap(sg => sg.subGroups.map(g => g.id)));
    const unclassified = electronicPaymentData.filter(g => !classifiedIds.has(g.id));
    if (unclassified.length > 0) {
        superGroups.push({
            key: 'other',
            name: 'منتجات أخرى',
            icon: 'fa-wallet',
            color: '#555',
            image: unclassified[0].image,
            subGroups: unclassified
        });
    }

    return superGroups;
}

// -------------------- عرض كروت الدفع electronique (فئات رئيسية) --------------------
function renderPaymentGroups() {
    productsGrid.innerHTML = '';
    const superGroups = buildPaymentSuperGroups();

    injectCardSearchBar(productsGrid, superGroups, function(query) {
        const q = query.trim().toLowerCase();
        document.querySelectorAll('#productsGrid .category-card').forEach(card => {
            const name = card.querySelector('.category-title')?.textContent.toLowerCase() || '';
            card.style.display = (!q || name.includes(q)) ? '' : 'none';
        });
    });

    superGroups.forEach((sg, idx) => {
        const totalProducts = sg.subGroups.reduce((sum, g) => sum + (g.products ? g.products.length : 0), 0);
        const subNames = sg.subGroups.map(g => g.name).slice(0, 3).join(' · ') + (sg.subGroups.length > 3 ? ' ...' : '');

        const card = document.createElement('a');
        card.className = 'category-card';
        card.href = '#';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', String((idx % 4) * 80));

        card.innerHTML = `
                    <div class="category-img-container">
                        <img src="${sg.image}" class="category-img" alt="${sg.name}" loading="lazy" onerror="this.onerror=null;this.src='images/placeholder.svg'">
                        <span class="product-badge">دفع</span>
                    </div>
                    <div class="category-info">
                        <h3 class="category-title">${sg.name}</h3>
                        <p class="category-description">${subNames}</p>
                        <p class="category-count">${totalProducts} منتج</p>
                        <button class="category-btn">
                            <i class="fas fa-credit-card"></i> عرض المنتجات
                        </button>
                    </div>
                `;

        card.addEventListener('click', (e) => {
            e.preventDefault();
            showPaymentSuperGroup(sg);
        });
        productsGrid.appendChild(card);
    });
}

// -------------------- عرض كروت الفئة الفرعية للدفع --------------------
function showPaymentSuperGroup(sg) {
    productsGrid.innerHTML = '';
    categoryProductsTitle.textContent = sg.name;
    productFilters.style.display = 'none';

    // زر العودة
    const backWrap = document.createElement('div');
    backWrap.style.gridColumn = '1 / -1';
    backWrap.innerHTML = `
                <button class="back-to-games" id="backToPaymentMainBtn">
                    <i class="fas fa-arrow-right"></i> العودة للدفع الإلكتروني
                </button>
            `;
    productsGrid.appendChild(backWrap);
    backWrap.querySelector('#backToPaymentMainBtn').addEventListener('click', () => {
        categoryProductsTitle.textContent = 'الدفع electronique';
        renderPaymentGroups();
    });

    injectCardSearchBar(productsGrid, sg.subGroups, function(query) {
        const q = query.trim().toLowerCase();
        document.querySelectorAll('#productsGrid .category-card[data-subgroup]').forEach(card => {
            const name = card.querySelector('.category-title')?.textContent.toLowerCase() || '';
            card.style.display = (!q || name.includes(q)) ? '' : 'none';
        });
    });

    sg.subGroups.forEach((group, idx) => {
        const productCount = group.products ? group.products.length : 0;
        const subCard = document.createElement('a');
        subCard.className = 'category-card';
        subCard.href = '#';
        subCard.setAttribute('data-subgroup', group.id);
        pmgTagCard(subCard, 'electronicPaymentData', group.id);
        subCard.setAttribute('data-aos', 'fade-up');
        subCard.setAttribute('data-aos-delay', String((idx % 4) * 80));

        subCard.innerHTML = `
                    <div class="category-img-container">
                        <img src="${group.image}" class="category-img" alt="${group.name}" loading="lazy" onerror="this.onerror=null;this.src='images/placeholder.svg'">
                        <span class="product-badge">دفع</span>
                    </div>
                    <div class="category-info">
                        <h3 class="category-title">${group.name}</h3>
                        <p class="category-description">${group.description || ''}</p>
                        <p class="category-count">${productCount} منتج</p>
                        <button class="category-btn">
                            <i class="fas fa-credit-card"></i> عرض المنتجات
                        </button>
                    </div>
                `;

        subCard.addEventListener('click', (e) => {
            e.preventDefault();
            showPaymentProducts(group, sg);
        });
        productsGrid.appendChild(subCard);
    });
}

// -------------------- عرض منتجات الدفع محددة --------------------
function showPaymentProducts(group, parentSg) {
    productsGrid.innerHTML = '';
    categoryProductsTitle.textContent = group.name;
    productFilters.style.display = 'none';

    const backWrap = document.createElement('div');
    backWrap.style.gridColumn = '1 / -1';
    backWrap.innerHTML = `
                <button class="back-to-games" id="backToPaymentBtn">
                    <i class="fas fa-arrow-right"></i> ${parentSg ? 'العودة إلى ' + parentSg.name : 'العودة للدفع الإلكتروني'}
                </button>
            `;
    productsGrid.appendChild(backWrap);
    backWrap.querySelector('#backToPaymentBtn').addEventListener('click', () => {
        if (parentSg) {
            categoryProductsTitle.textContent = parentSg.name;
            showPaymentSuperGroup(parentSg);
        } else {
            categoryProductsTitle.textContent = 'الدفع electronique';
            renderPaymentGroups();
        }
    });

    injectCardSearchBar(productsGrid, group.products, function(query) {
        const q = query.trim().toLowerCase();
        document.querySelectorAll('#productsGrid .product-card[data-payment-id]').forEach(card => {
            const title = card.querySelector('.product-title')?.textContent.toLowerCase() || '';
            card.style.display = (!q || title.includes(q)) ? '' : 'none';
        });
    });

    group.products.forEach((product, idx) => {
        const paymentProductData = {
            id: product.id,
            name: product.name,
            category: 'الدفع electronique',
            price: product.price,
            description: group.description,
            image: group.image
        };

        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', String((idx % 4) * 80));
        card.setAttribute('data-payment-id', String(product.id));
        pmgTagCard(card, 'electronicPaymentData', group.id, product.id);

        const avgRaw = 3.5 + (product.id % 10) * 0.15;
        const avg = Math.min(5, avgRaw);

        const priceDisplay = product.price ? `${product.price}$` : 'تواصل معنا';

        card.innerHTML = `
                    <div class="product-img-container game-inner-img">
                        <img src="${group.image}" class="product-img" alt="${product.name}"
                             loading="lazy" onerror="this.onerror=null;this.src='images/placeholder.svg'">
                        <span class="product-badge">دفع</span>
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <p class="product-price">${priceDisplay}</p>
                        <div class="product-actions">
                            <button class="product-details-btn payment-details">
                                <i class="fas fa-info-circle"></i> تفاصيل المنتج
                            </button>
                            <button class="add-to-cart-btn payment-cart">
                                <i class="fas fa-bolt"></i> طلب
                            </button>
                        </div>
                    </div>
                `;

        card.querySelector('.payment-details').addEventListener('click', () => {
            showPaymentProductDetails(paymentProductData);
        });

        card.querySelector('.payment-cart').addEventListener('click', () => {
            const cartItem = {
                id: paymentProductData.id,
                name: paymentProductData.name,
                price: product.price || 0,
                quantity: 1,
                image: group.image,
                category: 'الدفع الالكتروني'
            };
            const existing = cart.find(i => i.id === cartItem.id);
            if (existing) existing.quantity++;
            else cart.push(cartItem);
            localStorage.setItem('zoodnyCart', JSON.stringify(cart));
            updateCartUI();
            showToast('تمت إضافة المنتج إلى السلة بنجاح!');
        });


        productsGrid.appendChild(card);
    });
}

// ==================== اشتراكات التلفاز — كروت مجمّعة ====================
const TV_GROUP_MAP = [
    { keywords: ['نيتفليكس', 'netflix'],       name: 'نيتفليكس'     },
    { keywords: ['شاهد', 'vip', 'shahid'],      name: 'شاهد VIP'     },
    { keywords: ['ديزني', 'disney'],             name: 'ديزني بلس'    },
    { keywords: ['hbo'],                         name: 'HBO Max'      },
    { keywords: ['prime', 'برايم', 'amazon'],   name: 'Amazon Prime' },
    { keywords: ['osn'],                         name: 'OSN+'         },
    { keywords: ['iptv', 'مشاهدة'],              name: 'IPTV'         },
];

function getGroupNameForTv(product) {
    const haystack = (product.name + ' ' + (product.image || '')).toLowerCase();
    for (const def of TV_GROUP_MAP) {
        if (def.keywords.some(k => haystack.includes(k.toLowerCase()))) {
            return def.name;
        }
    }
    return product.name.split(/[-–\s]/)[0].trim();
}

function buildTvGroups() {
    const groups = {};
    products.filter(p => p.category === 'اشتراكات التلفاز').forEach(p => {
        const baseName = getGroupNameForTv(p);
        if (!groups[baseName]) {
            groups[baseName] = { name: baseName, image: p.image, products: [] };
        }
        groups[baseName].products.push(p);
    });
    return Object.values(groups);
}

function renderTvGroups() {
    productsGrid.innerHTML = '';
    const groups = buildTvGroups();

    injectCardSearchBar(productsGrid, groups, function(query) {
        const q = query.trim().toLowerCase();
        document.querySelectorAll('#productsGrid .category-card').forEach(card => {
            const name = card.querySelector('.category-title')?.textContent.toLowerCase() || '';
            card.style.display = (!q || name.includes(q)) ? '' : 'none';
        });
    });

    groups.forEach((group, idx) => {
        const card = document.createElement('a');
        card.className = 'category-card';
        card.href = '#';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', String((idx % 4) * 80));

        const subtitleText = group.products.map(p => {
            const part = p.name.includes('-') ? p.name.split('-').slice(1).join('-').trim() : p.name;
            return part;
        }).slice(0, 3).join(' · ') + (group.products.length > 3 ? ' ...' : '');

        card.innerHTML = `
                    <div class="category-img-container">
                        <img src="${group.image}" class="category-img" alt="${group.name}" loading="lazy" onerror="this.onerror=null;this.src='images/placeholder.svg'">
                        <span class="product-badge">اشتراك</span>
                    </div>
                    <div class="category-info">
                        <h3 class="category-title">${group.name}</h3>
                        <p class="category-description">${subtitleText}</p>
                        <p class="category-count">${group.products.length} منتج</p>
                        <button class="category-btn">
                            <i class="fas fa-tv"></i> عرض الاشتراكات
                        </button>
                    </div>
                `;
        card.addEventListener('click', e => { e.preventDefault(); showTvProducts(group); });
        productsGrid.appendChild(card);
    });
}

function showTvProducts(group) {
    productsGrid.innerHTML = '';
    categoryProductsTitle.textContent = group.name;
    productFilters.style.display = 'none';

    const backWrap = document.createElement('div');
    backWrap.style.gridColumn = '1 / -1';
    backWrap.innerHTML = `<button class="back-to-games" id="backToTvBtn"><i class="fas fa-arrow-right"></i> العودة إلى اشتراكات التلفاز</button>`;
    productsGrid.appendChild(backWrap);
    backWrap.querySelector('#backToTvBtn').addEventListener('click', () => {
        categoryProductsTitle.textContent = 'اشتراكات التلفاز';
        renderTvGroups();
    });

    injectCardSearchBar(productsGrid, group.products, function(query) {
        const q = query.trim().toLowerCase();
        document.querySelectorAll('#productsGrid .product-card[data-tv-id]').forEach(card => {
            const title = card.querySelector('.product-title')?.textContent.toLowerCase() || '';
            card.style.display = (!q || title.includes(q)) ? '' : 'none';
        });
    });

    group.products.forEach((product, idx) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', String((idx % 4) * 80));
        card.setAttribute('data-tv-id', String(product.id));
        pmgTagCard(card, 'products', product.id);

        const avgRaw = 3.5 + (product.id % 10) * 0.15;
        const avg = Math.min(5, avgRaw);

        // عرض اسم المنتج كاملاً
        const displayName = product.name;
        const priceDisplay = product.price > 0 ? `${product.price}$` : 'تواصل معنا';

        card.innerHTML = `
                    <div class="product-img-container game-inner-img">
                        <img src="${product.image}" class="product-img" alt="${product.name}" loading="lazy" onerror="this.onerror=null;this.src='images/placeholder.svg'">
                        <span class="product-badge">اشتراك</span>
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${displayName}</h3>
                        <p class="product-price">${priceDisplay}</p>
                        <div class="product-actions">
                            <button class="product-details-btn tv-details"><i class="fas fa-info-circle"></i> تفاصيل المنتج</button>
                            <button class="add-to-cart-btn tv-cart"><i class="fas fa-bolt"></i> طلب</button>
                        </div>
                    </div>
                `;

        card.querySelector('.tv-details').addEventListener('click', () => {
            showPaymentProductDetails({ id: product.id, name: product.name, price: product.price, image: product.image, description: product.description });
        });
        card.querySelector('.tv-cart').addEventListener('click', () => {
            const existing = cart.find(i => i.id === product.id);
            if (existing) existing.quantity++;
            else cart.push({ id: product.id, name: product.name, price: product.price || 0, quantity: 1, image: product.image, category: 'اشتراكات التلفاز' });
            localStorage.setItem('zoodnyCart', JSON.stringify(cart));
            updateCartUI();
            showToast('تمت إضافة المنتج إلى السلة بنجاح!');
        });

        productsGrid.appendChild(card);
    });
}

// ==================== برامج التصميم — كروت مجمّعة ====================
const DESIGN_GROUP_MAP = [
    { keywords: ['كانفا', 'canva'],           name: 'كانفا برو',  image: 'images/كانفا.png'       },
    { keywords: ['كاب كات', 'capcut'],         name: 'كاب كات',    image: 'images/كاب كات.png'     },
    { keywords: ['بيكس ارت', 'picsart'],       name: 'بيكس ارت',   image: 'images/بيكس ارت.png'  },
    { keywords: ['أدوبي', 'adobe', 'ادوبي'],   name: 'أدوبي',      image: 'images/ادوات ادوبي.jpg'       },
    { keywords: ['فيجما', 'figma'],             name: 'فيجما',      image: 'images/برامج التصميم.png'       },
    { keywords: ['فوتوشوب', 'photoshop'],       name: 'فوتوشوب',    image: 'images/برامج التصميم.png'     },
];

function getGroupNameForDesign(product) {
    const haystack = (product.name + ' ' + (product.image || '')).toLowerCase();
    for (const def of DESIGN_GROUP_MAP) {
        if (def.keywords.some(k => haystack.includes(k.toLowerCase()))) {
            return { name: def.name, image: def.image };
        }
    }
    const fallback = product.name.split(/[-–]/)[0].trim();
    return { name: fallback, image: product.image };
}

function buildDesignGroups() {
    const groups = {};
    products.filter(p => p.category === 'برامج التصميم').forEach(p => {
        const { name: baseName, image: baseImage } = getGroupNameForDesign(p);
        if (!groups[baseName]) {
            groups[baseName] = { name: baseName, image: baseImage, products: [] };
        }
        groups[baseName].products.push(p);
    });
    return Object.values(groups);
}

function renderDesignGroups() {
    productsGrid.innerHTML = '';
    const groups = buildDesignGroups();

    injectCardSearchBar(productsGrid, groups, function(query) {
        const q = query.trim().toLowerCase();
        document.querySelectorAll('#productsGrid .category-card').forEach(card => {
            const name = card.querySelector('.category-title')?.textContent.toLowerCase() || '';
            card.style.display = (!q || name.includes(q)) ? '' : 'none';
        });
    });

    groups.forEach((group, idx) => {
        const card = document.createElement('a');
        card.className = 'category-card';
        card.href = '#';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', String((idx % 4) * 80));

        const subtitleText = group.products.map(p => {
            return p.name.includes('-') ? p.name.split('-').slice(1).join('-').trim() : p.name;
        }).slice(0, 3).join(' · ') + (group.products.length > 3 ? ' ...' : '');

        card.innerHTML = `
                    <div class="category-img-container">
                        <img src="${group.image}" class="category-img" alt="${group.name}" loading="lazy" onerror="this.onerror=null;this.src='images/placeholder.svg'">
                        <span class="product-badge">تصميم</span>
                    </div>
                    <div class="category-info">
                        <h3 class="category-title">${group.name}</h3>
                        <p class="category-description">${subtitleText}</p>
                        <p class="category-count">${group.products.length} منتج</p>
                        <button class="category-btn">
                            <i class="fas fa-paint-brush"></i> عرض الاشتراكات
                        </button>
                    </div>
                `;
        card.addEventListener('click', e => { e.preventDefault(); showDesignProducts(group); });
        productsGrid.appendChild(card);
    });
}

function showDesignProducts(group) {
    productsGrid.innerHTML = '';
    categoryProductsTitle.textContent = group.name;
    productFilters.style.display = 'none';

    const backWrap = document.createElement('div');
    backWrap.style.gridColumn = '1 / -1';
    backWrap.innerHTML = `<button class="back-to-games" id="backToDesignBtn"><i class="fas fa-arrow-right"></i> العودة إلى برامج التصميم</button>`;
    productsGrid.appendChild(backWrap);
    backWrap.querySelector('#backToDesignBtn').addEventListener('click', () => {
        categoryProductsTitle.textContent = 'اشتراكات برامج التصميم';
        renderDesignGroups();
    });

    injectCardSearchBar(productsGrid, group.products, function(query) {
        const q = query.trim().toLowerCase();
        document.querySelectorAll('#productsGrid .product-card[data-design-id]').forEach(card => {
            const title = card.querySelector('.product-title')?.textContent.toLowerCase() || '';
            card.style.display = (!q || title.includes(q)) ? '' : 'none';
        });
    });

    group.products.forEach((product, idx) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', String((idx % 4) * 80));
        card.setAttribute('data-design-id', String(product.id));
        pmgTagCard(card, 'products', product.id);

        const avgRaw = 3.5 + (product.id % 10) * 0.15;
        const avg = Math.min(5, avgRaw);

        const displayName = product.name;
        const priceDisplay = product.price > 0 ? `${product.price}$` : 'تواصل معنا';

        card.innerHTML = `
                    <div class="product-img-container game-inner-img">
                        <img src="${product.image}" class="product-img" alt="${product.name}" loading="lazy" onerror="this.onerror=null;this.src='images/placeholder.svg'">
                        <span class="product-badge">تصميم</span>
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${displayName}</h3>
                        <p class="product-price">${priceDisplay}</p>
                        <div class="product-actions">
                            <button class="product-details-btn design-details"><i class="fas fa-info-circle"></i> تفاصيل المنتج</button>
                            <button class="add-to-cart-btn design-cart"><i class="fas fa-bolt"></i> طلب</button>
                        </div>
                    </div>
                `;

        card.querySelector('.design-details').addEventListener('click', () => {
            showPaymentProductDetails({ id: product.id, name: product.name, price: product.price, image: product.image, description: product.description });
        });
        card.querySelector('.design-cart').addEventListener('click', () => {
            // إذا كان المنتج يحتاج إيميل (مثل كانفا) → افتح نافذة الإيميل
            if (product.inputLabel) {
                openDesignEmailModal(product);
            } else {
                const existing = cart.find(i => i.id === product.id);
                if (existing) existing.quantity++;
                else cart.push({ id: product.id, name: product.name, price: product.price || 0, quantity: 1, image: product.image, category: 'برامج التصميم' });
                localStorage.setItem('zoodnyCart', JSON.stringify(cart));
                updateCartUI();
                showToast('تمت إضافة المنتج إلى السلة بنجاح!');
            }
        });

        productsGrid.appendChild(card);
    });
}

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  📱 نظام أرقام التطبيقات — نفس منطق كروت الألعاب تماماً             ║
// ╠══════════════════════════════════════════════════════════════════════════╣
// ║  📌 لإضافة تطبيق جديد (كرت خارجي مستقل):                            ║
// ║     أضف منتجاً جديداً في products:                                   ║
// ║     { id: 999, name: "واتساب رقم فرنسي",                             ║
// ║       category: "ارقام للتطبيقات", price: 1.20,                      ║
// ║       description: "...", image: "images/واتساب.png" }                       ║
// ║     ← يُجمَّع تلقائياً في كرت "واتساب"                               ║
// ║                                                                        ║
// ║  📌 لإضافة تطبيق بكرت مستقل (اسم جديد كلياً):                       ║
// ║     أضف اسمه في قائمة APP_BASE_NAMES أدناه                           ║
// ║                                                                        ║
// ║  📌 لتغيير صورة كرت تطبيق:                                           ║
// ║     عدّل image في أي منتج من منتجات ذلك التطبيق                      ║
// ╚══════════════════════════════════════════════════════════════════════════╝

// قائمة أسماء التطبيقات — يُستخدم لاستخراج اسم التطبيق من اسم المنتج
// 📌 أضف أي تطبيق جديد هنا حتى يُجمَّع بشكل صحيح
const APP_BASE_NAMES = [
    'تويتر', 'انستغرام', 'فيسبوك', 'تيك توك', 'جيميل',
    'سناب شات', 'ايمو', 'Chat GPT', 'سكايب', 'ايكلود',
    'Line', 'وي شات', 'سيغنال', 'مايكروسوفت', 'ياهوو', 'فايبر'
];

// ╔══════════════════════════════════════════════════════════════════╗
// ║  🖼️  صور منتجات الأرقام — ضع صورك الخاصة هنا                  ║
// ╠══════════════════════════════════════════════════════════════════╣
// ║  الصيغة:   id_المنتج : "اسم_الصورة.jpg"                       ║
// ║                                                                  ║
// ║  📌 لتغيير صورة منتج: غيّر اسم الملف في السطر المقابل         ║
// ║  📌 لمنتج جديد: أضف سطراً جديداً  500: "صورتي.png"            ║
// ║  📌 الصور يجب أن تكون في نفس مجلد index.html                  ║
// ║  📌 إذا لم تضع صورة → يستخدم صورة التطبيق تلقائياً            ║
// ╚══════════════════════════════════════════════════════════════════╝
const APP_PRODUCT_IMAGES = {
    // ── تويتر ──────────────────────────────────
    424: "images/روسيا.webp",           // تويتر رقم روسي       ← غيّر الاسم بصورتك
    425: "images/بريطانيا.webp",           // تويتر رقم بريطاني
    426: "images/اندونيسيا.webp",           // تويتر رقم اندونيسي

    // ── انستغرام ───────────────────────────────
    427: "images/لاوس.webp",     // انستغرام رقم لاوس

    // ── فيسبوك ─────────────────────────────────
    462: "images/كندا 2.webp",          // فيسبوك رقم كندي
    463: "images/هولندا.webp",          // فيسبوك رقم هولندي
    464: "images/بريطانيا.webp",          // فيسبوك رقم بريطاني
    465: "images/اندونيسيا.webp",          // فيسبوك رقم اندونيسي
    466: "images/تايلاند.webp",          // فيسبوك رقم تايلندي

    // ── تيك توك ────────────────────────────────
    428: "images/امريكا.webp",        // تيك توك رقم امريكي
    429: "images/كندا 2.webp",        // تيك توك رقم كندي
    430: "images/بريطانيا.webp",        // تيك توك رقم بريطاني
    431: "images/جنوب افريقيا.webp",        // تيك توك رقم جنوب افريقيا

    // ── جيميل ──────────────────────────────────
    432: "images/كمبوديا.webp",        // جيميل رقم كمبوديا
    433: "images/الفيتنام.webp",        // جيميل رقم فيتنامي
    434: "images/اندونيسيا.webp",        // جيميل رقم اندونيسي
   4235: "images/لاوس.webp",        // جيميل رقم لاوس
    436: "images/جنوب افريقيا.webp",        // جيميل رقم جنوب افريقيا
    437: "images/كندا 2.webp",        // جيميل رقم كندي
    438: "images/هونغ كونغ.avif",        // جيميل رقم هونغ كونغ
    439: "images/كازخستان.webp",        // جيميل رقم كازخستان
    440: "images/كولومبيا 1.webp",        // جيميل رقم كولومبيا
    441: "images/كينيا.webp",        // جيميل رقم كينيا

    // ── سناب شات ───────────────────────────────
    442: "images/السويد.webp",        // سناب شات رقم سويدي
    443: "images/اندونيسيا.webp",        // سناب شات رقم اندونيسي

    // ── ايمو ───────────────────────────────────
    444: "images/ماليزيا.webp",            // ايمو رقم ماليزيا
    445: "images/اوكرانيا.webp",            // ايمو رقم اوكرانيا
    446: "images/الفلبين.webp",            // ايمو رقم الفلبين
    447: "images/بولندا.webp",            // ايمو رقم بولندا
    448: "images/قرغستان.webp",            // ايمو رقم قرغستان

    // ── Chat GPT ───────────────────────────────
    449: "images/اندونيسيا.webp",            // Chat GPT رقم اندونيسي

    // ── سكايب ──────────────────────────────────
    450: "images/بريطانيا.webp",           // سكايب رقم بريطاني
    451: "images/تايلاند.webp",           // سكايب رقم تايلندي

    // ── ايكلود ─────────────────────────────────
    452: "images/اندونيسيا.webp",          // ايكلود رقم اندونيسي

    // ── Line ───────────────────────────────────
    453: "images/برازيل.webp",           // Line رقم برازيلي

    // ── وي شات ─────────────────────────────────
    454: "images/امريكا.webp",         // وي شات رقم امريكي
    455: "images/كندا 2.webp",         // وي شات رقم كندي
    456: "images/بريطانيا.webp",         // وي شات رقم بريطاني
    457: "images/اندونيسيا.webp",         // وي شات رقم اندونيسي

    // ── سيغنال ─────────────────────────────────
    467: "images/اسبانيا.webp",          // سيغنال رقم اسباني
    468: "images/تايلاند.webp",          // سيغنال رقم تايلندي
    469: "images/هولندا.webp",          // سيغنال رقم هولندي
    470: "images/استونيا.webp",          // سيغنال رقم استونيا

    // ── مايكروسوفت ─────────────────────────────
    458: "images/بريطانيا.webp",     // مايكروسوفت رقم بريطاني
    459: "images/كينيا.webp",     // مايكروسوفت رقم كينيا

    // ── ياهوو ──────────────────────────────────
    460: "images/ياهوو.png",           // ياهوو

    // ── فايبر ──────────────────────────────────
    461: "images/فايبر.png",           // فايبر

    // 📌 أضف منتجاتك الجديدة هنا ↓
    // 500: "صورتي_الجديدة.jpg",  // اسم المنتج
};

function getAppBaseName(productName) {
    for (const appName of APP_BASE_NAMES) {
        if (productName.startsWith(appName)) return appName;
    }
    // fallback: أول كلمتين
    const words = productName.trim().split(' ');
    return words.slice(0, 2).join(' ');
}

function buildAppGroups() {
    const appProducts = products.filter(p => p.category === 'ارقام للتطبيقات');
    const groups = {};
    appProducts.forEach(product => {
        const baseName = getAppBaseName(product.name);
        if (!groups[baseName]) {
            groups[baseName] = { baseName, image: product.image, items: [] };
        }
        groups[baseName].items.push(product);
    });
    return Object.values(groups);
}

// -------------------- عرض كروت التطبيقات --------------------
function renderAppGroups() {
    productsGrid.innerHTML = '';
    const groups = buildAppGroups();

    injectCardSearchBar(productsGrid, groups, function(query) {
        const q = query.trim().toLowerCase();
        document.querySelectorAll('#productsGrid .category-card').forEach(card => {
            const name = card.querySelector('.category-title')?.textContent.toLowerCase() || '';
            card.style.display = (!q || name.includes(q)) ? '' : 'none';
        });
    });

    groups.forEach((group, idx) => {
        const card = document.createElement('a');
        card.className = 'category-card';
        card.href = '#';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', String((idx % 4) * 80));

        // النص الثانوي: أنواع الأرقام المتوفرة
        const subtitles = group.items.map(p => p.name.replace(group.baseName, '').trim() || p.name);
        const subtitleText = subtitles.slice(0, 3).join(' · ') + (subtitles.length > 3 ? ' ...' : '');

        card.innerHTML = `
                    <div class="category-img-container">
                        <img src="${group.image}" class="category-img" alt="${group.baseName}"
                             loading="lazy" onerror="this.onerror=null;this.src='images/placeholder.svg'">
                        <span class="product-badge">رقمي</span>
                    </div>
                    <div class="category-info">
                        <h3 class="category-title">${group.baseName}</h3>
                        <p class="category-description">${subtitleText}</p>
                        <p class="category-count">${group.items.length} منتج</p>
                        <button class="category-btn">
                            <i class="fas fa-mobile-alt"></i> عرض الأرقام
                        </button>
                    </div>
                `;

        card.addEventListener('click', (e) => { e.preventDefault(); showAppProducts(group); });
        productsGrid.appendChild(card);
    });
}

// -------------------- عرض منتجات تطبيق محدد --------------------
function showAppProducts(group) {
    productsGrid.innerHTML = '';
    categoryProductsTitle.textContent = group.baseName;
    productFilters.style.display = 'none';

    // زر العودة
    const backWrap = document.createElement('div');
    backWrap.style.gridColumn = '1 / -1';
    backWrap.innerHTML = `
                <button class="back-to-games" id="backToAppsBtn">
                    <i class="fas fa-arrow-right"></i> العودة إلى التطبيقات
                </button>
            `;
    productsGrid.appendChild(backWrap);
    backWrap.querySelector('#backToAppsBtn').addEventListener('click', () => {
        categoryProductsTitle.textContent = 'أرقام لتفعيل كافة التطبيقات';
        renderAppGroups();
    });

    // شريط البحث
    injectCardSearchBar(productsGrid, group.items, function(query) {
        const q = query.trim().toLowerCase();
        document.querySelectorAll('#productsGrid .product-card[data-app-id]').forEach(card => {
            const title = card.querySelector('.product-title')?.textContent.toLowerCase() || '';
            card.style.display = (!q || title.includes(q)) ? '' : 'none';
        });
    });

    group.items.forEach((product, idx) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', String((idx % 4) * 80));
        card.setAttribute('data-app-id', String(product.id));
        pmgTagCard(card, 'products', product.id);

        // اسم العرض: احذف اسم التطبيق وأبقِ نوع الرقم فقط
        const displayName = product.name.replace(group.baseName, '').trim() || product.name;

        const avgRaw = 3.5 + (product.id % 10) * 0.15;
        const avg    = Math.min(5, avgRaw);

        const priceDisplay = product.price ? `${product.price}$` : 'تواصل معنا';

        // 🖼️ الصورة: من القاموس أولاً، fallback لصورة المنتج الأصلية
        const cardImage = APP_PRODUCT_IMAGES[product.id] || product.image || group.image;

        card.innerHTML = `
                    <div class="product-img-container game-inner-img">
                        <img src="${cardImage}" class="product-img" alt="${product.name}"
                             loading="lazy" onerror="this.onerror=null;this.src='images/placeholder.svg'">
                        <span class="product-badge">رقمي</span>
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${displayName}</h3>
                        <p class="product-price">${priceDisplay}</p>
                        <div class="product-actions">
                            <button class="product-details-btn ap-details">
                                <i class="fas fa-info-circle"></i> تفاصيل المنتج
                            </button>
                            <button class="add-to-cart-btn ap-cart">
                                <i class="fas fa-bolt"></i> طلب
                            </button>
                        </div>
                    </div>
                `;

        card.querySelector('.ap-details').addEventListener('click', () => {
            showProductDetails(product.id);
        });
        card.querySelector('.ap-cart').addEventListener('click', () => {
            addToCart(product.id);
        });

        productsGrid.appendChild(card);
    });
}

// -------------------- عرض كروت تفعيلات البريميوم --------------------
function renderPremiumGroups() {
    productsGrid.innerHTML = '';
    const groups = premiumActivationsData;

    injectCardSearchBar(productsGrid, groups, function(query) {
        const q = query.trim().toLowerCase();
        document.querySelectorAll('#productsGrid .category-card').forEach(card => {
            const name = card.querySelector('.category-title')?.textContent.toLowerCase() || '';
            card.style.display = (!q || name.includes(q)) ? '' : 'none';
        });
    });

    groups.forEach((group, idx) => {
        const card = document.createElement('a');
        card.className = 'category-card';
        card.href = '#';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', String((idx % 4) * 80));

        pmgTagCard(card, 'premiumActivationsData', group.id);
        const subtitleText = group.description || 'تفعيل على حسابك';
        const productCount = group.products ? group.products.length : 0;

        card.innerHTML = `
                    <div class="category-img-container">
                        <img src="${group.image}" class="category-img" alt="${group.name}" loading="lazy" onerror="this.onerror=null;this.src='images/placeholder.svg'">
                        <span class="product-badge">بريميوم</span>
                    </div>
                    <div class="category-info">
                        <h3 class="category-title">${group.name}</h3>
                        <p class="category-description">${subtitleText}</p>
                        <p class="category-count">${productCount} منتج</p>
                        <button class="category-btn">
                            <i class="fas fa-crown"></i> عرض المنتجات
                        </button>
                    </div>
                `;

        card.addEventListener('click', (e) => { e.preventDefault(); showPremiumProducts(group); });
        productsGrid.appendChild(card);
    });
}

// -------------------- عرض منتجات تفعيل بريميوم محددة --------------------
function showPremiumProducts(group) {
    productsGrid.innerHTML = '';
    categoryProductsTitle.textContent = group.name;
    productFilters.style.display = 'none';

    const backWrap = document.createElement('div');
    backWrap.style.gridColumn = '1 / -1';
    backWrap.innerHTML = `
                <button class="back-to-games" id="backToPremiumBtn">
                    <i class="fas fa-arrow-right"></i> العودة لتفعيلات البريميوم
                </button>
            `;
    productsGrid.appendChild(backWrap);
    backWrap.querySelector('#backToPremiumBtn').addEventListener('click', () => {
        categoryProductsTitle.textContent = 'تفعيلات بريميوم';
        renderPremiumGroups();
    });

    injectCardSearchBar(productsGrid, group.products, function(query) {
        const q = query.trim().toLowerCase();
        document.querySelectorAll('#productsGrid .product-card[data-premium-id]').forEach(card => {
            const title = card.querySelector('.product-title')?.textContent.toLowerCase() || '';
            card.style.display = (!q || title.includes(q)) ? '' : 'none';
        });
    });

    group.products.forEach((product, idx) => {
        const premiumProductData = {
            id: product.id,
            name: product.name,
            category: 'تفعيلات بريميوم',
            price: product.price,
            description: group.description,
            image: group.image,
            inputLabel: group.inputLabel,
            inputPlaceholder: group.inputPlaceholder,
            inputHelp: group.inputHelp
        };

        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', String((idx % 4) * 80));
        card.setAttribute('data-premium-id', String(product.id));
        pmgTagCard(card, 'premiumActivationsData', group.id, product.id);

        const avgRaw = 3.5 + (product.id % 10) * 0.15;
        const avg = Math.min(5, avgRaw);

        card.innerHTML = `
                    <div class="product-img-container game-inner-img">
                        <img src="${group.image}" class="product-img" alt="${product.name}"
                             loading="lazy" onerror="this.onerror=null;this.src='images/placeholder.svg'">
                        <span class="product-badge">بريميوم</span>
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <p class="product-price">${product.price}$</p>
                        <div class="product-actions">
                            <button class="product-details-btn premium-details">
                                <i class="fas fa-info-circle"></i> تفاصيل المنتج
                            </button>
                            <button class="add-to-cart-btn premium-cart">
                                <i class="fas fa-bolt"></i> طلب
                            </button>
                        </div>
                    </div>
                `;

        card.querySelector('.premium-details').addEventListener('click', () => {
            showPaymentProductDetails(premiumProductData);
        });

        card.querySelector('.premium-cart').addEventListener('click', () => {
            openServiceInputModal(premiumProductData);
        });


        productsGrid.appendChild(card);
    });
}

// -------------------- عرض كروت اشتراكات VPN --------------------
function renderVpnGroups() {
    productsGrid.innerHTML = '';
    const groups = vpnData;

    injectCardSearchBar(productsGrid, groups, function(query) {
        const q = query.trim().toLowerCase();
        document.querySelectorAll('#productsGrid .category-card').forEach(card => {
            const name = card.querySelector('.category-title')?.textContent.toLowerCase() || '';
            card.style.display = (!q || name.includes(q)) ? '' : 'none';
        });
    });

    groups.forEach((group, idx) => {
        const card = document.createElement('a');
        card.className = 'category-card';
        card.href = '#';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', String((idx % 4) * 80));

        pmgTagCard(card, 'vpnData', group.id);
        const subtitleText = group.description || 'اشتراك VPN';
        const productCount = group.products ? group.products.length : 0;

        card.innerHTML = `
                    <div class="category-img-container">
                        <img src="${group.image}" class="category-img" alt="${group.name}" loading="lazy" onerror="this.onerror=null;this.src='images/placeholder.svg'">
                        <span class="product-badge">VPN</span>
                    </div>
                    <div class="category-info">
                        <h3 class="category-title">${group.name}</h3>
                        <p class="category-description">${subtitleText}</p>
                        <p class="category-count">${productCount} منتج</p>
                        <button class="category-btn">
                            <i class="fas fa-shield-alt"></i> عرض الاشتراكات
                        </button>
                    </div>
                `;

        card.addEventListener('click', (e) => { e.preventDefault(); showVpnProducts(group); });
        productsGrid.appendChild(card);
    });
}

// -------------------- عرض منتجات VPN محددة --------------------
function showVpnProducts(group) {
    productsGrid.innerHTML = '';
    categoryProductsTitle.textContent = group.name;
    productFilters.style.display = 'none';

    const backWrap = document.createElement('div');
    backWrap.style.gridColumn = '1 / -1';
    backWrap.innerHTML = `
                <button class="back-to-games" id="backToVpnBtn">
                    <i class="fas fa-arrow-right"></i> العودة إلى اشتراكات VPN
                </button>
            `;
    productsGrid.appendChild(backWrap);
    backWrap.querySelector('#backToVpnBtn').addEventListener('click', () => {
        categoryProductsTitle.textContent = 'اشتراكات VPN';
        renderVpnGroups();
    });

    injectCardSearchBar(productsGrid, group.products, function(query) {
        const q = query.trim().toLowerCase();
        document.querySelectorAll('#productsGrid .product-card[data-vpn-id]').forEach(card => {
            const title = card.querySelector('.product-title')?.textContent.toLowerCase() || '';
            card.style.display = (!q || title.includes(q)) ? '' : 'none';
        });
    });

    group.products.forEach((product, idx) => {
        const vpnProductData = {
            id: product.id,
            name: product.name,
            category: 'اشتراكات VPN',
            price: product.price,
            description: group.description,
            image: group.image
        };

        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', String((idx % 4) * 80));
        card.setAttribute('data-vpn-id', String(product.id));
        pmgTagCard(card, 'vpnData', group.id, product.id);

        const avgRaw = 3.5 + (product.id % 10) * 0.15;
        const avg = Math.min(5, avgRaw);

        const priceDisplay = product.price ? `${product.price}$` : 'تواصل معنا';

        card.innerHTML = `
                    <div class="product-img-container game-inner-img">
                        <img src="${group.image}" class="product-img" alt="${product.name}"
                             loading="lazy" onerror="this.onerror=null;this.src='images/placeholder.svg'">
                        <span class="product-badge">VPN</span>
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <p class="product-price">${priceDisplay}</p>
                        <div class="product-actions">
                            <button class="product-details-btn vpn-details">
                                <i class="fas fa-info-circle"></i> تفاصيل المنتج
                            </button>
                            <button class="add-to-cart-btn vpn-cart">
                                <i class="fas fa-bolt"></i> طلب
                            </button>
                        </div>
                    </div>
                `;

        card.querySelector('.vpn-details').addEventListener('click', () => {
            showPaymentProductDetails(vpnProductData);
        });

        card.querySelector('.vpn-cart').addEventListener('click', () => {
            const cartItem = {
                id: vpnProductData.id,
                name: vpnProductData.name,
                price: product.price || 0,
                quantity: 1,
                image: group.image,
                category: 'اشتراكات VPN'
            };
            const existing = cart.find(i => i.id === cartItem.id);
            if (existing) existing.quantity++;
            else cart.push(cartItem);
            localStorage.setItem('zoodnyCart', JSON.stringify(cart));
            updateCartUI();
            showToast('تمت إضافة المنتج إلى السلة بنجاح!');
        });


        productsGrid.appendChild(card);
    });
}

// -------------------- إنشاء أزرار الفلاتر (معدلة) --------------------
function renderCategoryFilters() {
    productFilters.innerHTML = '';
    
    const filters = [
        { id: 'all', name: 'الكل' },
        { id: 'lowest-price', name: 'الأقل سعراً' },
        { id: 'highest-price', name: 'الأعلى سعراً' }
    ];
    
    filters.forEach(filter => {
        const filterBtn = document.createElement('button');
        filterBtn.className = 'filter-btn';
        filterBtn.dataset.filter = filter.id;
        filterBtn.textContent = filter.name;
        
        if (filter.id === 'all') {
            filterBtn.classList.add('active');
        }
        
        filterBtn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filterType = this.dataset.filter;
            // إذا كنا في منصة محددة، نطبق الفلتر على منتجاتها
            if (selectedPlatform) {
                renderProductsByPlatform(selectedPlatform, filterType);
            } else {
                renderProductsByCategory(currentCategory, filterType);
            }
        });
        
        productFilters.appendChild(filterBtn);
    });
}

// ── شريط البحث الداخلي — تصميم موحد مع الشريط الرئيسي ──────────
function injectCardSearchBar(grid, productsList, onSearch) {
    const wrapper = document.createElement('div');
    wrapper.className = 'card-search-wrapper';

    const count = productsList.length;

    // بناء تلميحات سريعة من أسماء المنتجات
    const suggestions = buildSearchSuggestions(productsList);
    const sugsHtml = suggestions.length > 0
        ? '<div class="card-search-suggestions" id="cardSearchSugs">'
            + suggestions.map(s => `<span class="card-search-sug" data-sug="${s}"><i class="fas fa-bolt" style="font-size:.65rem;color:var(--secondary-dk,#D4A800)"></i>${s}</span>`).join('')
          + '</div>'
        : '';

    wrapper.innerHTML = `
                <div class="products-section-search" id="cardSearchBar">
                    <div class="card-search-icon-box">
                        <i class="fas fa-search"></i>
                    </div>
                    <input
                        type="text"
                        id="cardSearchInput"
                        placeholder="ابحث في ${count} منتج..."
                        autocomplete="off"
                    />
                    <span class="card-search-count" id="cardSearchCount">${count} منتج</span>
                    <button class="card-search-clear" id="cardSearchClear" title="مسح البحث">
                        <i class="fas fa-times"></i>
                    </button>
                    <button class="card-search-btn" id="cardSearchBtn" title="بحث">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
                ${sugsHtml}
            `;

    grid.appendChild(wrapper);

    const input     = wrapper.querySelector('#cardSearchInput');
    const clearBtn  = wrapper.querySelector('#cardSearchClear');
    const searchBtn = wrapper.querySelector('#cardSearchBtn');
    const countBadge= wrapper.querySelector('#cardSearchCount');
    const sugsRow   = wrapper.querySelector('#cardSearchSugs');

    let _searchTimer = null;

    function triggerSearch(val) {
        clearTimeout(_searchTimer);
        _searchTimer = setTimeout(function() {
            onSearch(val);
            // تحديث عداد النتائج
            requestAnimationFrame(function() {
                const visible = Array.from(
                    document.querySelectorAll('#productsGrid .product-card, #productsGrid .platform-card, #productsGrid .game-group-card')
                ).filter(c => c.style.display !== 'none').length;

                if (val.trim()) {
                    countBadge.textContent = visible + ' نتيجة';
                    countBadge.style.background = visible > 0
                        ? 'rgba(46,213,115,0.15)'
                        : 'rgba(231,76,60,0.15)';
                    countBadge.style.color = visible > 0
                        ? 'var(--success,#2ED573)'
                        : 'var(--accent,#E74C3C)';
                    countBadge.style.borderColor = visible > 0
                        ? 'rgba(46,213,115,0.3)'
                        : 'rgba(231,76,60,0.3)';
                    if (sugsRow) sugsRow.style.opacity = '0.4';
                } else {
                    countBadge.textContent = count + ' منتج';
                    countBadge.style.background = '';
                    countBadge.style.color = '';
                    countBadge.style.borderColor = '';
                    if (sugsRow) sugsRow.style.opacity = '1';
                }
            });
        }, 180);
    }

    input.addEventListener('input', function() {
        const val = this.value;
        clearBtn.classList.toggle('visible', val.length > 0);
        triggerSearch(val);
    });

    input.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            clearSearch();
        }
    });

    searchBtn.addEventListener('click', function() {
        if (input.value.trim()) triggerSearch(input.value);
        else input.focus();
    });

    clearBtn.addEventListener('click', clearSearch);

    function clearSearch() {
        input.value = '';
        clearBtn.classList.remove('visible');
        onSearch('');
        countBadge.textContent = count + ' منتج';
        countBadge.style.background = '';
        countBadge.style.color = '';
        countBadge.style.borderColor = '';
        if (sugsRow) sugsRow.style.opacity = '1';
        input.focus();
    }

    // التلميحات السريعة — نقر عليها يملأ البحث
    if (sugsRow) {
        sugsRow.querySelectorAll('.card-search-sug').forEach(function(el) {
            el.addEventListener('click', function() {
                const sug = this.getAttribute('data-sug');
                input.value = sug;
                clearBtn.classList.add('visible');
                triggerSearch(sug);
                input.focus();
            });
        });
    }
}

// بناء تلميحات بحث من المنتجات
function buildSearchSuggestions(productsList) {
    if (!productsList || productsList.length === 0) return [];
    // استخرج الكلمات الأكثر تميزاً
    const wordCount = {};
    productsList.forEach(function(p) {
        var words = (p.name || '').split(/[\s\-–—]+/);
        words.forEach(function(w) {
            w = w.trim();
            if (w.length >= 3 && !/^[0-9]+$/.test(w)) {
                wordCount[w] = (wordCount[w] || 0) + 1;
            }
        });
    });
    // أخذ الكلمات الأكثر تكراراً (لكن ليست في كل المنتجات)
    const sorted = Object.entries(wordCount)
        .filter(function(e) { return e[1] >= 2 && e[1] < productsList.length; })
        .sort(function(a, b) { return b[1] - a[1]; })
        .slice(0, 5)
        .map(function(e) { return e[0]; });
    return sorted;
}

// -------------------- عرض منتجات التصنيف (بدون تغيير) --------------------

// ==================== أرقام واتساب وتليغرام مكفولة — كروت مجمّعة ====================

// ╔══════════════════════════════════════════════════════════════════╗
// ║  🖼️  صور كروت التطبيقات الرئيسية — ضع صورك الخاصة هنا        ║
// ╠══════════════════════════════════════════════════════════════════╣
// ║  الصيغة:  'اسم التطبيق' : 'اسم_الصورة.png'                   ║
// ║  📌 غيّر اسم الصورة بالصورة التي تريدها لكل كرت               ║
// ║  📌 الصور يجب أن تكون في نفس مجلد index.html                  ║
// ╚══════════════════════════════════════════════════════════════════╝
const ARQAM_GROUP_IMAGES = {
    'واتساب':  'images/واتساب.png',      // ← ضع هنا اسم صورة كرت واتساب
    'تليغرام': 'images/تليغرام.png',     // ← ضع هنا اسم صورة كرت تليغرام
};

// قاموس تحديد التطبيق من اسم المنتج
const ARQAM_APP_MAP = [
    { keywords: ['واتساب', 'whatsapp'], name: 'واتساب' },
    { keywords: ['تليغرام', 'telegram'], name: 'تليغرام' },
];

function getArqamAppName(product) {
    const haystack = product.name.toLowerCase();
    for (const def of ARQAM_APP_MAP) {
        if (def.keywords.some(k => haystack.includes(k.toLowerCase()))) {
            return def.name;
        }
    }
    return product.name.split(/[-\s]/)[0].trim();
}

function buildArqamGroups(categoryId) {
    const groups = {};
    products.filter(p => p.category === categoryId).forEach(p => {
        const appName = getArqamAppName(p);
        if (!groups[appName]) {
            const customImg = ARQAM_GROUP_IMAGES[appName];
            groups[appName] = {
                name: appName,
                image: customImg || p.image,
                products: []
            };
        }
        groups[appName].products.push(p);
    });
    return Object.values(groups);
}

function renderArqamGroups(categoryId, titleText) {
    productsGrid.innerHTML = '';
    const groups = buildArqamGroups(categoryId);

    injectCardSearchBar(productsGrid, groups, function(query) {
        const q = query.trim().toLowerCase();
        document.querySelectorAll('#productsGrid .category-card').forEach(card => {
            const name = card.querySelector('.category-title')?.textContent.toLowerCase() || '';
            card.style.display = (!q || name.includes(q)) ? '' : 'none';
        });
    });

    groups.forEach((group, idx) => {
        const card = document.createElement('a');
        card.className = 'category-card';
        card.href = '#';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', String((idx % 4) * 80));

        const subtitleText = group.products.map(p => {
            // اسم الدولة فقط (بعد أول مسافة)
            const parts = p.name.split(/\s+/);
            return parts.slice(1).join(' ') || p.name;
        }).slice(0, 4).join(' · ') + (group.products.length > 4 ? ' ...' : '');

        card.innerHTML = `
                    <div class="category-img-container">
                        <img src="${group.image}" class="category-img" alt="${group.name}" loading="lazy" onerror="this.onerror=null;this.src='images/placeholder.svg'">
                        <span class="product-badge">رقم</span>
                    </div>
                    <div class="category-info">
                        <h3 class="category-title">${group.name}</h3>
                        <p class="category-description">${subtitleText}</p>
                        <p class="category-count">${group.products.length} منتج</p>
                        <button class="category-btn">
                            <i class="fab fa-whatsapp"></i> عرض الأرقام
                        </button>
                    </div>
                `;
        card.addEventListener('click', e => {
            e.preventDefault();
            showArqamProducts(group, categoryId, titleText);
        });
        productsGrid.appendChild(card);
    });
}

function showArqamProducts(group, categoryId, titleText) {
    productsGrid.innerHTML = '';
    categoryProductsTitle.textContent = group.name;
    productFilters.style.display = 'none';

    const backWrap = document.createElement('div');
    backWrap.style.gridColumn = '1 / -1';
    backWrap.innerHTML = `<button class="back-to-games" id="backToArqamBtn"><i class="fas fa-arrow-right"></i> العودة إلى ${titleText}</button>`;
    productsGrid.appendChild(backWrap);
    backWrap.querySelector('#backToArqamBtn').addEventListener('click', () => {
        categoryProductsTitle.textContent = titleText;
        renderArqamGroups(categoryId, titleText);
    });

    injectCardSearchBar(productsGrid, group.products, function(query) {
        const q = query.trim().toLowerCase();
        document.querySelectorAll('#productsGrid .product-card[data-arqam-id]').forEach(card => {
            const title = card.querySelector('.product-title')?.textContent.toLowerCase() || '';
            card.style.display = (!q || title.includes(q)) ? '' : 'none';
        });
    });

    group.products.forEach((product, idx) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', String((idx % 4) * 80));
        card.setAttribute('data-arqam-id', String(product.id));
        pmgTagCard(card, 'products', product.id);

        const avgRaw = 3.5 + (product.id % 10) * 0.15;
        const avg = Math.min(5, avgRaw);

        const priceDisplay = product.price ? `${product.price}$` : 'تواصل معنا';

        card.innerHTML = `
                    <div class="product-img-container game-inner-img">
                        <img src="${product.image}" class="product-img" alt="${product.name}" loading="lazy" onerror="this.onerror=null;this.src='images/placeholder.svg'">
                        <span class="product-badge">رقم</span>
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <p class="product-price">${priceDisplay}</p>
                        <div class="product-actions">
                            <button class="product-details-btn arqam-details"><i class="fas fa-info-circle"></i> تفاصيل</button>
                            <button class="add-to-cart-btn arqam-cart"><i class="fas fa-bolt"></i> طلب</button>
                        </div>
                    </div>
                `;

        card.querySelector('.arqam-details').addEventListener('click', () => {
            showPaymentProductDetails({ id: product.id, name: product.name, price: product.price, image: product.image, description: product.description });
        });
        card.querySelector('.arqam-cart').addEventListener('click', () => {
            const existing = cart.find(i => i.id === product.id);
            if (existing) existing.quantity++;
            else cart.push({ id: product.id, name: product.name, price: product.price || 0, quantity: 1, image: product.image, category: categoryId });
            localStorage.setItem('zoodnyCart', JSON.stringify(cart));
            updateCartUI();
            showToast('تمت إضافة المنتج إلى السلة بنجاح!');
        });

        productsGrid.appendChild(card);
    });
}

function renderProductsByCategory(categoryId, filter = 'all') {
    productsGrid.innerHTML = '';
    
    let filteredProducts = products.filter(product => product.category === categoryId);
    
    if (filter === 'lowest-price') {
        filteredProducts.sort((a, b) => {
            if (a.category === 'rased' || a.category === 'games' || a.category === 'app') return 0;
            if (b.category === 'rased' || b.category === 'games' || b.category === 'app') return 0;
            return a.price - b.price;
        });
    } else if (filter === 'highest-price') {
        filteredProducts.sort((a, b) => {
            if (a.category === 'rased' || a.category === 'games' || a.category === 'app') return 0;
            if (b.category === 'rased' || b.category === 'games' || b.category === 'app') return 0;
            return b.price - a.price;
        });
    }
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--gray);">
                        <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                        <h3 style="margin-bottom: 1rem;">لا توجد منتجات في هذا التصنيف</h3>
                        <p>سيتم إضافة منتجات قريباً</p>
                    </div>
                `;
        return;
    }
    
    // -- حقن شريط البحث في أعلى الشبكة --
    injectCardSearchBar(productsGrid, filteredProducts, function(query) {
        const q = query.trim().toLowerCase();
        document.querySelectorAll('#productsGrid .product-card').forEach(card => {
            const title = card.querySelector('.product-title')?.textContent.toLowerCase() || '';
            card.style.display = (!q || title.includes(q)) ? '' : 'none';
        });
        const visible = Array.from(document.querySelectorAll('#productsGrid .product-card')).filter(c => c.style.display !== 'none').length;
        let noRes = productsGrid.querySelector('.products-empty-search');
        if (visible === 0 && q) {
            if (!noRes) {
                noRes = document.createElement('div');
                noRes.className = 'products-empty-search';
                noRes.style.gridColumn = '1 / -1';
                noRes.innerHTML = `<i class="fas fa-search"></i><p>لا توجد نتائج لـ "<strong>${query}</strong>"</p>`;
                productsGrid.appendChild(noRes);
            }
        } else if (noRes) noRes.remove();
    });
    
    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        // التطبيقات نسخة من appsData، والألعاب والرصيد لها نماذج أخرى
        pmgTagCard(productCard, product.category === 'app' ? 'appsData' : (product.category === 'games' || product.category === 'rased') ? null : 'products', product.id);
        productCard.setAttribute('data-aos', 'fade-up');
        
        const imageUrl = product.image || "images/placeholder.svg";
        
        let priceDisplay = '';
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
        
        productCard.innerHTML = `
                    <div class="product-img-container">
                        <img src="${imageUrl}" 
                             class="product-img" 
                             alt="${product.name}"
                             loading="lazy"
                             onerror="this.onerror=null;this.src='images/placeholder.svg'">
                        ${badgeText ? `<span class="product-badge">${badgeText}</span>` : ''}
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <p class="product-price">${priceDisplay}</p>
                        <div class="product-actions">
                            ${product.price > 0 || product.category === 'rased' || product.category === 'games' || product.category === 'app' || product.category === 'تفعيلات بريميوم' ? `
                                <button class="product-details-btn" data-id="${product.id}">
                                    <i class="fas fa-info-circle"></i> تفاصيل المنتج
                                </button>
                                <button class="add-to-cart-btn" data-id="${product.id}">
                                    <i class="fas fa-bolt"></i> طلب
                                </button>
                            ` : '<p style="color: var(--gray); text-align: center; width: 100%; padding: 1rem;">قريباً</p>'}
                        </div>
                    </div>
                `;
        
        productsGrid.appendChild(productCard);
    });
    
    document.querySelectorAll('.product-details-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            showProductDetails(productId);
        });
    });
    
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const product = products.find(p => p.id === productId);
            
            if (product.category === 'social-media') {
                openServiceInputModal(product);
            } else if (product.category === 'rased') {
                openServiceInputModal(product);
            } else if (product.category === 'games') {
                openServiceInputModal(product);
            } else if (product.category === 'app') {
                openServiceInputModal(product);
            } else if (product.category === 'تفعيلات بريميوم') {
                openServiceInputModal(product);
            } else {
                addToCart(productId);
            }
        });
    });
}

// -------------------- دالة عرض كروت المنصات (جديدة) --------------------
function renderPlatforms() {
    productsGrid.innerHTML = '';
    selectedPlatform = null;

    // -- حقن شريط البحث في المنصات --
    injectCardSearchBar(productsGrid, platforms, function(query) {
        const q = query.trim().toLowerCase();
        document.querySelectorAll('#productsGrid .platform-card').forEach(card => {
            const name = card.querySelector('.platform-name')?.textContent.toLowerCase() || '';
            card.style.display = (!q || name.includes(q)) ? '' : 'none';
        });
    });

    platforms.forEach(platform => {
        const servicesCount = products.filter(p => p.category === 'social-media' && p.platform === platform.id).length;
        const sampleServices = products
            .filter(p => p.category === 'social-media' && p.platform === platform.id)
            .slice(0, 3)
            .map(p => p.name.split(' ').slice(0, 2).join(' '));

        const platformCard = document.createElement('div');
        platformCard.className = 'platform-card';
        platformCard.dataset.platform = platform.id;
        platformCard.setAttribute('data-aos', 'fade-up');

        platformCard.innerHTML = `
                    <div class="platform-header" style="background: linear-gradient(135deg, ${platform.color}22, var(--primary));">
                        <i class="${platform.icon} platform-icon" style="color: ${platform.color};"></i>
                    </div>
                    <div class="platform-body">
                        <h3 class="platform-name">${platform.name}</h3>
                        <p class="platform-services-count">${servicesCount} خدمة متاحة</p>
                        <div class="platform-services-preview">
                            ${sampleServices.map(s => `<span class="service-tag">${s}</span>`).join('')}
                            ${servicesCount > 3 ? '<span class="service-tag">...</span>' : ''}
                        </div>
                    </div>
                `;

        productsGrid.appendChild(platformCard);
    });

    document.querySelectorAll('.platform-card').forEach(card => {
        card.addEventListener('click', function() {
            const platformId = this.dataset.platform;
            showPlatformProducts(platformId);
        });
    });
}

// -------------------- دالة عرض منتجات منصة معينة (جديدة) --------------------
function showPlatformProducts(platformId) {
    selectedPlatform = platformId;
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;

    categoryProductsTitle.textContent = `خدمات ${platform.name}`;
    
    // إظهار أزرار الفلاتر (لأننا سنعرض منتجات)
    productFilters.style.display = 'flex';
    // إعادة تعيين الفلتر إلى "الكل"
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    const allFilter = document.querySelector('.filter-btn[data-filter="all"]');
    if (allFilter) allFilter.classList.add('active');
    
    renderProductsByPlatform(platformId);
}

// -------------------- دالة عرض منتجات منصة معينة مع الفلتر (جديدة) --------------------
function renderProductsByPlatform(platformId, filter = 'all') {
    productsGrid.innerHTML = '';

    let filteredProducts = products.filter(p => p.category === 'social-media' && p.platform === platformId);

    if (filter === 'lowest-price') {
        filteredProducts.sort((a, b) => (a.basePrice || a.price) - (b.basePrice || b.price));
    } else if (filter === 'highest-price') {
        filteredProducts.sort((a, b) => (b.basePrice || b.price) - (a.basePrice || b.price));
    }

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--gray);">
                        <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                        <h3 style="margin-bottom: 1rem;">لا توجد خدمات متاحة لهذه المنصة حالياً</h3>
                        <p>سيتم إضافة خدمات قريباً</p>
                    </div>
                `;
        return;
    }

    // زر العودة إلى المنصات
    const backButton = document.createElement('div');
    backButton.style.gridColumn = '1 / -1';
    backButton.innerHTML = `
                <button class="back-to-platforms" id="backToPlatformsBtn">
                    <i class="fas fa-arrow-right"></i> العودة إلى المنصات
                </button>
            `;
    productsGrid.appendChild(backButton);

    // -- حقن شريط البحث في منتجات المنصة --
    injectCardSearchBar(productsGrid, filteredProducts, function(query) {
        const q = query.trim().toLowerCase();
        document.querySelectorAll('#productsGrid .product-card').forEach(card => {
            const title = card.querySelector('.product-title')?.textContent.toLowerCase() || '';
            card.style.display = (!q || title.includes(q)) ? '' : 'none';
        });
        const visible = Array.from(document.querySelectorAll('#productsGrid .product-card')).filter(c => c.style.display !== 'none').length;
        let noRes = productsGrid.querySelector('.products-empty-search');
        if (visible === 0 && q) {
            if (!noRes) {
                noRes = document.createElement('div');
                noRes.className = 'products-empty-search';
                noRes.style.gridColumn = '1 / -1';
                noRes.innerHTML = `<i class="fas fa-search"></i><p>لا توجد نتائج لـ "<strong>${query}</strong>"</p>`;
                productsGrid.appendChild(noRes);
            }
        } else if (noRes) noRes.remove();
    });

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        pmgTagCard(productCard, 'products', product.id);
        productCard.setAttribute('data-aos', 'fade-up');

        const imageUrl = product.image || "images/placeholder.svg";
        const priceDisplay = `${product.basePrice || product.price}$ لـ 1k`;

        productCard.innerHTML = `
                    <div class="product-img-container">
                        <img src="${imageUrl}" class="product-img" alt="${product.name}" loading="lazy" onerror="this.onerror=null;this.src='images/placeholder.svg'">
                        <span class="product-badge">خدمة</span>
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <p class="product-price">${priceDisplay}</p>
                        <div class="product-actions">
                            <button class="product-details-btn" data-id="${product.id}"><i class="fas fa-info-circle"></i> تفاصيل</button>
                            <button class="add-to-cart-btn" data-id="${product.id}"><i class="fas fa-bolt"></i> طلب</button>

                        </div>
                    </div>
                `;

        productsGrid.appendChild(productCard);
    });

    // إعادة ربط الأحداث للأزرار
    document.querySelectorAll('.product-details-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            showProductDetails(productId);
        });
    });

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const product = products.find(p => p.id === productId);
            openServiceInputModal(product);
        });
    });

    // ربط حدث زر العودة
    document.getElementById('backToPlatformsBtn')?.addEventListener('click', function() {
        renderPlatforms();
        categoryProductsTitle.textContent = 'خدمات السوشيال ميديا';
        productFilters.style.display = 'none'; // إخفاء الفلاتر عند العودة للمنصات
    });
}
