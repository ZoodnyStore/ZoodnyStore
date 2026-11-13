/* ══════════════════════════════════════════════════════════════════════
 * المنتجات العامة (products)
 * تُضاف إليها الألعاب والتطبيقات تلقائياً في آخر الملف.
 * يجب تحميل apps.js و games.js قبل هذا الملف.
 * ══════════════════════════════════════════════════════════════════════ */

// -------------------- بيانات المنتجات مع صور خاصة لكل منتج --------------------
const products = [
    // أكسسوارات الهاتف - مع صور خاصة
    { 
        id: 1, 
        name: "كفر شفاف MagSafe", 
        category: "accessories", 
        price: 2, 
        description:"14/15/16 برو ماكس",
        image: "images/img5.jpg"
    },
    { 
        id: 2, 
        name: "كفر كاربون فايبر", 
        category: "accessories", 
        price: 4, 
        description: "كفر كاربون فايبر 14/15/16 برو ماكس",
        image: "images/كفر كاربون فايبر.jpg"
    },
    { 
        id: 3, 
        name: "حماية عدسات ايفون", 
        category: "accessories", 
        price: 1.5, 
        description: "حماية عدسات ايفون 14/15/16 برو ماكس",
        image: "images/حماية عدسات.jpg"
    },
    { 
        id: 4, 
        name: "لزقات معدن للكفر", 
        category: "accessories", 
        price: 1, 
        description: "لزقات معدن بتصاميم متنوعة (برشلونة، ريال مدريد، سوريا، رونالدو)",
        image: "images/لزقات كفر.jpg"
    },
    { 
        id: 5, 
        name: "باور بانك kakusiga 20000mA", 
        category: "accessories", 
        price: 10, 
        description: "باور بانك سعة 20000 مللي أمبير",
        image: "images/img8.avif"
    },
    { 
        id: 6, 
        name: "باور بانك kakusiga 10000mA", 
        category: "accessories", 
        price: 6, 
        description: "باور بانك سعة 10000 مللي أمبير",
        image: "images/باور 1.png"
    },
    { 
        id: 7, 
        name: "باور بانك kakusiga 10000mA", 
        category: "accessories", 
        price: 6, 
        description: "باور بانك سعة 10000 مللي أمبير",
        image: "images/بور 10000.jpg"
    },
    { 
        id: 8, 
        name: "سماعة هيدفون P9", 
        category: "accessories", 
        price: 4, 
        description: "الألوان: ابيض , اسود , احمر, ازرق , اخضر",
        image: "images/p9.jpg"
    },
    { 
        id: 9, 
        name: "سماعة هيدفون P47", 
        category: "accessories", 
        price: 3, 
        description: "الألوان: ابيض , اسود , احمر, ازرق , اخضر",
        image: "images/p47.jpg"
    },
    { 
        id: 10, 
        name: "سماعة هيدفون P47 قطة", 
        category: "accessories", 
        price: 3, 
        description: "الألوان: الزهري , البنفسجي مع ضوء RGB",
        image: "images/قطة.jpg"
    },
    { 
        id: 11, 
        name: "سماعة هيدفون GAMING A4", 
        category: "accessories", 
        price: 8, 
        description: "سماعة هيدفون GAMING باللون الجيشي",
        image: "images/a4.jpg"
    },
    { 
        id: 12, 
        name: "سماعة هيدفون GAMING G9000", 
        category: "accessories", 
        price: 8, 
        description: "سماعة هيدفون GAMING باللون الأسود",
        image: "images/g9000.webp"
    },
    { 
        id: 13, 
        name: "تحويلة Tybe C", 
        category: "accessories", 
        price: 1.5, 
        description: "تحويلة AUX إلى Tybe C",
        image: "images/usb c.webp"
    },
    { 
        id: 14, 
        name: "تحويلة ايفون", 
        category: "accessories", 
        price: 1.5, 
        description: "تحويلة AUX إلى مدخل ايفون",
        image: "images/تحويلة ايفون.png"
    },
    { 
        id: 15, 
        name: "مبرد TL07", 
        category: "accessories", 
        price: 9, 
        description: "مبرد يشكل طبقة جليدية ودرجة حرارة تصل إلى -3",
        image: "images/مبرد 1.avif"
    },
    { 
        id: 16, 
        name: "مبرد BG15", 
        category: "accessories", 
        price: 6.5, 
        description: "مبرد يشكل طبقة جليدية ودرجة حرارة تصل إلى -1",
        image: "images/مبرد 2.png"
    },
    { 
        id: 17, 
        name: "سماعة M20", 
        category: "accessories", 
        price: 3.5, 
        description: "سماعة لاسلكية M20",
        image: "images/m20.webp"
    },
    { 
        id: 18, 
        name: "سماعة M30", 
        category: "accessories", 
        price: 5, 
        description: "سماعة لاسلكية M30",
        image: "images/m30.webp"
    },
    { 
        id: 19, 
        name: "سماعة A9 PRO", 
        category: "accessories", 
        price: 9, 
        description: "سماعة A9 PRO مع شاشة تحكم كاملة",
        image: "images/anc enc.webp"
    },
    { 
        id: 20, 
        name: "وصلة شحن USB Tybe C", 
        category: "accessories", 
        price: 1.5, 
        description: "وصلة شحن USB إلى Tybe C",
        image: "images/usb.webp"
    },
    { 
        id: 21, 
        name: "وصلة شحن ELITE", 
        category: "accessories", 
        price: 2, 
        description: "وصلة شحن USB إلى Tybe C",
        image: "images/USB ايليت.png"
    },
    { 
        id: 22, 
        name: "وصلة شحن", 
        category: "accessories", 
        price: 1.5, 
        description: "وصلة شحن Tybe C إلى Tybe C",
        image: "images/تايب c.webp"
    },
    { 
        id: 23, 
        name: "وصلة شحن ELITE", 
        category: "accessories", 
        price: 2, 
        description: "وصلة شحن Tybe C إلى Tybe C",
        image: "images/تايب سي ايليت.png"
    },
    { 
        id: 24, 
        name: "راس شاحن شاومي 67W", 
        category: "accessories", 
        price: 5, 
        description: "راس شاحن شاومي 67W مع وصلة USB Tybe C",
        image: "images/67.jpeg"
    },
    { 
        id: 25, 
        name: "راس شاحن شاومي 120W", 
        category: "accessories", 
        price: 8, 
        description: "راس شاحن شاومي 120W مع وصلة USB Tybe C",
        image: "images/120.webp"
    },
    { 
        id: 26, 
        name: "راس شاحن ELITE", 
        category: "accessories", 
        price: 3.5, 
        description: "راس شاحن ELITE بمنفذين USB و Tybe C",
        image: "images/راس ايليت.png"
    },
    { 
        id: 27, 
        name: "مايك K9 wireless", 
        category: "accessories", 
        price: 8, 
        description: "مايك لاسلكي بلوتوث (يأتي مايكين مع بعض)",
        image: "images/k9.jpg"
    },
    { 
        id: 28, 
        name: "هولدر BY13", 
        category: "accessories", 
        price: 5, 
        description: "هولدر البث المباشر وعصاية سيلفي BOROFONE",
        image: "images/هولدر.jpg"
    },
    
    // ملحقات اللابتوب
    { 
        id: 29, 
        name: "كيبورد وماوس gaming F-83", 
        category: "labtop", 
        price: 8, 
        description: "كيبورد مع ماوس GAMING RGB",
        image: "images/كيبورد مضيء.webp"
    },
    { 
        id: 30, 
        name: "كيبورد H-820", 
        category: "labtop", 
        price: 5, 
        description: "كيبورد عالي الجودة للاستخدام اليومي",
        image: "images/كيبورد عادي.jpg"
    },
    
    // ساعات ذكية
    { 
        id: 31, 
        name: "ساعة C60 ULTRA 3", 
        category: "watch", 
        price: 9, 
        description: "ساعة ذكية مع 7 أحزمة واستقبال المكالمات و الاشعارات",
        image: "images/c60.jpg"
    },
    { 
        id: 32, 
        name: "ساعة T1000 ULTRA", 
        category: "watch", 
        price: 9, 
        description: "ساعة ذكية مع 7 أحزمة واستقبال المكالمات و الاشعارات",
        image: "images/t1000.webp"
    },
    { 
        id: 33, 
        name: "ساعة S30 PRO MAX", 
        category: "watch", 
        price: 9, 
        description: "ساعة ذكية مع 7 أحزمة واستقبال المكالمات و الاشعارات",
        image: "images/s30.jpg"
    },
    
    // مكبرات صوت
    { 
        id: 34, 
        name: "مكبر صوت K-12", 
        category: "speakers", 
        price: 4.5, 
        description: "مكبر صوت مع مايك وإضاءة RGB",
        image: "images/K12.webp"
    },
    { 
        id: 35, 
        name: "مكبر صوت FLAME LIGHT", 
        category: "speakers", 
        price: 3.5, 
        description: "مكبر صوت GTS-1835 RGB مقاس 3 بوصة",
        image: "images/flame.jpeg"
    },
    { 
        id: 36, 
        name: "مكبر صوت GTS-1881", 
        category: "speakers", 
        price: 2.5, 
        description: "مكبر صوت GTS-1881 , مقاس 3 بوصة",
        image: "images/GTS 1881.jpeg"
    },
    
    // منتجات غذائية
    
    // خدمات سوشال ميديا - مع تحديث جميع الحدود الدنيا والقصوى وإضافة platform
    { 
        id: 46, 
        name: "متابعين إنستغرام وهمي", 
        category: "social-media", 
        platform: "instagram",
        basePrice: 3,
        price: 1,
        description: "متابعين وهمي إنستغرام - سعر الألف: 3$", 
        perThousand: 1,
        minQuantity: 300,
        maxQuantity: 1000000,
        image: "images/انستغرام.png"
    },
    { 
        id: 48, 
        name: "لايكات إنستغرام", 
        category: "social-media", 
        platform: "instagram",
        basePrice: 0.8,
        price: 7,
        description: "لايكات إنستغرام - سعر الألف: 0.8$", 
        perThousand: 3,
        minQuantity: 300,
        maxQuantity: 1000000,
        image: "images/انستغرام.png"
    },
    { 
        id: 49, 
        name: "مشاهدات إنستغرام", 
        category: "social-media", 
        platform: "instagram",
        basePrice: 0.15,
        price: 10,
        description: "مشاهدات إنستغرام - سعر الألف: 0.15$", 
        perThousand: 10,
        minQuantity: 300,
        maxQuantity: 1000000,
        image: "images/انستغرام.png"
    },
    { 
        id: 50, 
        name: "مشاركات إنستغرام", 
        category: "social-media", 
        platform: "instagram",
        basePrice: 0.25,
        price: 10,
        description: "مشاركات إنستغرام - سعر الألف: 0.25$", 
        perThousand: 10,
        minQuantity: 300,
        maxQuantity: 1000000,
        image: "images/انستغرام.png"
    },
    { 
        id: 51, 
        name: "متابعين فيسبوك", 
        category: "social-media", 
        platform: "facebook",
        basePrice: 1.7,
        price: 10,
        description: "متابعين فيسبوك - سعر الألف: 1.7$", 
        perThousand: 10,
        minQuantity: 300,
        maxQuantity: 1000000,
        image: "images/فيسبوك.png"
    },
    { 
        id: 52, 
        name: "اعضاء كروبات فيسبوك", 
        category: "social-media", 
        platform: "facebook",
        basePrice: 1.5,
        price: 10,
        description: "اعضاء كروبات فيسبوك - سعر الألف: 1.5$", 
        perThousand: 10,
        minQuantity: 300,
        maxQuantity: 1000000,
        image: "images/فيسبوك.png"
    },
    { 
        id: 53, 
        name: "تفاعل لايكات فيسبوك", 
        category: "social-media", 
        platform: "facebook",
        basePrice: 0.8,
        price: 10,
        description: "تفاعل لايكات للمنشورات - سعر الألف: 0.8$", 
        perThousand: 10,
        minQuantity: 300,
        maxQuantity: 1000000,
        image: "images/فيسبوك.png"
    },
    { 
        id: 54, 
        name: "تفاعل قلوب فيسبوك", 
        category: "social-media", 
        platform: "facebook",
        basePrice: 0.9,
        price: 10,
        description: "تفاعل قلوب للمنشورات - سعر الألف: 0.9$", 
        perThousand: 10,
        minQuantity: 300,
        maxQuantity: 1000000,
        image: "images/فيسبوك.png"
    },
    { 
        id: 55, 
        name: "مشاهدات فيسبوك", 
        category: "social-media", 
        platform: "facebook",
        basePrice: 0.15,
        price: 10,
        description: "مشاهدات فيسبوك - سعر الألف: 0.15$", 
        perThousand: 10,
        minQuantity: 300,
        maxQuantity: 1000000,
        image: "images/فيسبوك.png"
    },
    { 
        id: 56, 
        name: "متابعين تيك توك وهمي", 
        category: "social-media", 
        platform: "tiktok",
        basePrice: 2.3,
        price: 10,
        description: "متابعين وهمي تيك توك - سعر الألف: 2.3$", 
        perThousand: 10,
        minQuantity: 300,
        maxQuantity: 1000000,
        image: "images/تيكتوك.png"
    },
    { 
        id: 57, 
        name: "متابعين تيك توك حقيقي", 
        category: "social-media", 
        platform: "tiktok",
        basePrice: 3.5,
        price: 10,
        description: "متابعين حقيقي تيك توك - سعر الألف: 3.5$", 
        perThousand: 10,
        minQuantity: 300,
        maxQuantity: 1000000,
        image: "images/تيكتوك.png"
    },
    { 
        id: 58, 
        name: "مشاهدات تيك توك", 
        category: "social-media", 
        platform: "tiktok",
        basePrice: 0.2,
        price: 10,
        description: "مشاهدات تيك توك - سعر الألف: 0.2$", 
        perThousand: 10,
        minQuantity: 300,
        maxQuantity: 1000000,
        image: "images/تيكتوك.png"
    },
    { 
        id: 59, 
        name: "لايكات تيك توك", 
        category: "social-media", 
        platform: "tiktok",
        basePrice: 0.7,
        price: 10,
        description: "لايكات تيك توك - سعر الألف: 0.7$", 
        perThousand: 10,
        minQuantity: 300,
        maxQuantity: 1000000,
        image: "images/تيكتوك.png"
    },
    { 
        id: 60, 
        name: "مشاركات تيك توك", 
        category: "social-media", 
        platform: "tiktok",
        basePrice: 0.25,
        price: 10,
        description: "مشاركات تيك توك - سعر الألف: 0.25$", 
        perThousand: 10,
        minQuantity: 300,
        maxQuantity: 1000000,
        image: "images/تيكتوك.png"
    },
    { 
        id: 61, 
        name: "نقاط معركة تيك توك", 
        category: "social-media", 
        platform: "tiktok",
        basePrice: 0.5,
        price: 10,
        description: "نقاط معركة تيك توك - سعر الألف: 0.5$", 
        perThousand: 10,
        minQuantity: 300,
        maxQuantity: 1000000,
        image: "images/تيكتوك.png"
    },
    { 
        id: 62, 
        name: "اعضاء تليغرام", 
        category: "social-media", 
        platform: "telegram",
        basePrice: 2.3,
        price: 10,
        description: "اعضاء تليغرام - سعر الألف: 2.3$", 
        perThousand: 10,
        minQuantity: 300,
        maxQuantity: 1000000,
        image: "images/تليغرام.png"
    },
    { 
        id: 63, 
        name: "مشاهدات تليغرام", 
        category: "social-media", 
        platform: "telegram",
        basePrice: 0.1,
        price: 10,
        description: "مشاهدات تليغرام - سعر الألف: 0.1$", 
        perThousand: 10,
        minQuantity: 300,
        maxQuantity: 1000000,
        image: "images/تليغرام.png"
    },
    { 
        id: 64, 
        name: "تفاعلات ايجابي تليغرام", 
        category: "social-media", 
        platform: "telegram",
        basePrice: 0.6,
        price: 10,
        description: "تفاعلات ايجابي تليغرام - سعر الألف: 0.6$", 
        perThousand: 10,
        minQuantity: 300,
        maxQuantity: 1000000,
        image: "images/تليغرام.png"
    },
    { 
        id: 65, 
        name: "تفاعلات سلبي تليغرام", 
        category: "social-media", 
        platform: "telegram",
        basePrice: 0.6,
        price: 10,
        description: "تفاعلات سلبي تليغرام - سعر الألف: 0.6$", 
        perThousand: 10,
        minQuantity: 300,
        maxQuantity: 1000000,
        image: "images/تليغرام.png"
    },
    { 
        id: 66, 
        name: "مشتركين يوتيوب", 
        category: "social-media", 
        platform: "youtube",
        basePrice: 28,
        price: 10,
        description: "مشتركين يوتيوب - سعر الألف: 28$", 
        perThousand: 10,
        minQuantity: 300,
        maxQuantity: 1000000,
        image: "images/يوتيوب.png"
    },
    { 
        id: 67, 
        name: "مشاهدات يوتيوب", 
        category: "social-media", 
        platform: "youtube",
        basePrice: 2.5,
        price: 10,
        description: "مشاهدات يوتيوب - سعر الألف: 2.5$", 
        perThousand: 10,
        minQuantity: 300,
        maxQuantity: 1000000,
        image: "images/يوتيوب.png"
    },
    { 
        id: 68, 
        name: "لايكات يوتيوب", 
        category: "social-media", 
        platform: "youtube",
        basePrice: 1,
        price: 10,
        description: "لايكات يوتيوب - سعر الألف: 1$", 
        perThousand: 10,
        minQuantity: 300,
        maxQuantity: 1000000,
        image: "images/يوتيوب.png"
    },
    { 
        id: 69, 
        name: "مشاركات يوتيوب", 
        category: "social-media", 
        platform: "youtube",
        basePrice: 0.9,
        price: 10,
        description: "مشاركات يوتيوب - سعر الألف: 0.9$", 
        perThousand: 10,
        minQuantity: 300,
        maxQuantity: 1000000,
        image: "images/يوتيوب.png"
    },
    
    // إضافة منتجات تويتر وسناب شات
    
    // الذكاء الاصطناعي
    {
        id: 999, 
        name: "Chat GPT Plus - ستة اشهر", 
        category: "chat", 
        price: 39, 
        description: "Chat GPT Plus حساب جاهز خاص 100%",
        image: "images/chat gpt.png"
    },
    {
        id: 998, 
        name: "Chat GPT Plus - سنة", 
        category: "chat", 
        price: 61, 
        description: "Chat GPT Plus حساب جاهز خاص 100%",
        image: "images/chat gpt.png"
    },
    {
        id: 70, 
        name: "Chat GPT Plus - دعوة مساحة عمل - شهر", 
        category: "chat", 
        price: 10.5, 
        description: "Chat GPT Plus-دعوة مساحة عمل : اي يكون معك اشخاص في الحساب , شهر واحد",
        image: "images/chat gpt.png"
    },
    {
        id: 71, 
        name: "Chat GPT Go - شهر", 
        category: "chat", 
        price: 10, 
        description: "Chat GPT Go , حساب جاهز وخاص بك 100% , يمكنك نغيير بيانات الحساب بعد الاستلام , شهر",
        image: "images/chat gpt.png"
    },
    {
        id: 72, 
        name: "Chat GPT Go - سنة", 
        category: "chat", 
        price: 42, 
        description: "Chat GPT Go , حساب جاهز وخاص بك 100% , يمكنك نغيير بيانات الحساب بعد الاستلام , سنة",
        image: "images/chat gpt.png"
    },
    { 
        id: 600, 
        name: "Gemini Ai - سنة", 
        category: "chat", 
        price: 40, 
        description: "Gemini Ai - سنة - التفعيل على الايميل الخاص",
        image: "images/جيمناي.png"
    },
    
    // رصيد الموبايل - منتج واحد فقط مع خانة اختيار الكمية
    { 
        id: 73, 
        name: "رصيد سيرياتيل", 
        category: "rased", 
        price: 0, 
        description: "شحن رصيد سيرياتيل - اختر الكمية المناسبة", 
        image: "images/سيرياتيل.png"
    },
    { 
        id: 74, 
        name: "رصيد MTN", 
        category: "rased", 
        price: 0, 
        description: "شحن رصيد MTN - اختر الكمية المناسبة", 
        image: "images/mtn.png"
    },
    // ارقام واتساب وتليغرام
    { 
        id: 400, 
        name: "واتساب كندا", 
        category: "arqam", 
        price: 1.60, 
        description: "رقم واتساب لدولة كندا مكفول من الحظر",
        image: "images/كندا 2.webp"
    },
    { 
        id: 401, 
        name: "واتساب الفلبين", 
        category: "arqam", 
        price: 1.50, 
        description: "رقم واتساب لدولة الفلبين مكفول من الحظر",
        image: "images/الفلبين.webp"
    },
    { 
        id: 402, 
        name: "واتساب المغرب", 
        category: "arqam", 
        price: 1.50, 
        description: "رقم واتساب لدولة المغرب مكفول من الحظر",
        image: "images/المغرب.webp"
    },
    { 
        id: 403, 
        name: "واتساب فيتنامي", 
        category: "arqam", 
        price: 1.40, 
        description: "رقم واتساب لدولة الفيتنام مكفول من الحظر",
        image: "images/الفيتنام.webp"
    },
    { 
        id: 404, 
        name: "واتساب اندونيسي", 
        category: "arqam", 
        price: 1.50, 
        description: "رقم واتساب لدولة اندونيسيا مكفول من الحظر",
        image: "images/اندونيسيا.webp"
    },
    { 
        id: 405, 
        name: "واتساب بريطاني", 
        category: "arqam", 
        price: 1.80, 
        description: "رقم واتساب لدولة بريطانيا مكفول من الحظر",
        image: "images/بريطانيا.webp"
    },
    { 
        id: 406, 
        name: "واتساب تركي", 
        category: "arqam", 
        price: 3.20, 
        description: "رقم واتساب لدولة تركيا مكفول من الحظر",
        image: "images/تركيا.webp"
    },
    { 
        id: 407, 
        name: "واتساب ارجنتيني", 
        category: "arqam", 
        price: 1.60, 
        description: "رقم واتساب لدولة الارجنتين مكفول من الحظر",
        image: "images/ارجنتين.webp"
    },
    { 
        id: 408, 
        name: "واتساب كمبوديا", 
        category: "arqam", 
        price: 1.60, 
        description: "رقم واتساب لدولة كمبوديا مكفول من الحظر",
        image: "images/كمبوديا.webp"
    },
    { 
        id: 409, 
        name: "واتساب الماني", 
        category: "arqam", 
        price: 2.50, 
        description: "رقم واتساب لدولة المانيا مكفول من الحظر",
        image: "images/المانيا.webp"
    },
    { 
        id: 410, 
        name: "تليغرام امريكي", 
        category: "arqam", 
        price: 1.50, 
        description: "رقم تليغرام لدولة امريكا مكفول",
        image: "images/امريكا.webp"
    },
    { 
        id: 411, 
        name: "تليغرام كولومبي", 
        category: "arqam", 
        price: 1.60, 
        description: "رقم تليغرام لدولة كولومبيا مكفول ",
        image: "images/كولومبيا 1.webp"
    },
    // ارقام واتساب عربية
    { 
        id: 412, 
        name: "واتساب سوري - غير مكفول", 
        category: "arqam arbeh", 
        price: "", 
        description: "رقم واتساب لدولة سوريا غير مكفول",
        image: "images/سوريا.webp"
    },
    { 
        id: 413, 
        name: "واتساب عماني - غير مكفول", 
        category: "arqam arbeh", 
        price: 10.50, 
        description: "رقم واتساب لدولة عمان غير مكفول",
        image: "images/عمان.webp"
    },
    { 
        id: 414, 
        name: "واتساب كويتي - غير مكفول", 
        category: "arqam arbeh", 
        price: 9, 
        description: "رقم واتساب لدولة الكويت غير مكفول",
        image: "images/الكويت.webp"
    },
    { 
        id: 415, 
        name: "واتساب اماراتي - غير مكفول", 
        category: "arqam arbeh", 
        price: "", 
        description: "رقم واتساب لدولة الامارات غير مكفول",
        image: "images/الامارات.webp"
    },
    { 
        id: 416, 
        name: "واتساب سعودي - غير مكفول", 
        category: "arqam arbeh", 
        price: 7, 
        description: "رقم واتساب لدولة السعودية غير مكفول",
        image: "images/السعودية.webp"
    },
    { 
        id: 417, 
        name: "واتساب قطري - غير مكفول", 
        category: "arqam arbeh", 
        price: 10.50, 
        description: "رقم واتساب لدولة قطر غير مكفول",
        image: "images/قطر.webp"
    },
    { 
        id: 418, 
        name: "واتساب بحريني - غير مكفول", 
        category: "arqam arbeh", 
        price: 23.50, 
        description: "رقم واتساب لدولة البحرين غير مكفول",
        image: "images/البحرين.webp"
    },
    { 
        id: 419, 
        name: "واتساب لبناني - غير مكفول", 
        category: "arqam arbeh", 
        price: 11, 
        description: "رقم واتساب لدولة لبنان غير مكفول",
        image: "images/لبنان.webp"
    },
    { 
        id: 420, 
        name: "واتساب مصري - غير مكفول", 
        category: "arqam arbeh", 
        price: 5, 
        description: "رقم واتساب لدولة مصر غير مكفول",
        image: "images/مصر.webp"
    },
    { 
        id: 421, 
        name: "واتساب اردني - غير مكفول", 
        category: "arqam arbeh", 
        price: "", 
        description: "رقم واتساب لدولة الاردن غير مكفول",
        image: "images/الاردن.webp"
    },
    { 
        id: 422, 
        name: "واتساب يمني - غير مكفول", 
        category: "arqam arbeh", 
        price: "", 
        description: "رقم واتساب لدولة اليمن غير مكفول",
        image: "images/اليمن.webp"
    },
    { 
        id: 423, 
        name: "واتساب عراقي - غير مكفول", 
        category: "arqam arbeh", 
        price: 5, 
        description: "رقم واتساب لدولة العراق غير مكفول",
        image: "images/العراق.webp"
    },
    // ارقام للتطبيقات
    { 
        id: 424, 
        name: "تويتر رقم روسي", 
        category: "ارقام للتطبيقات", 
        price: 1.10, 
        description: "رقم لتفعيل تطبيق تويتر رقم روسي",
        image: "images/تويتر.png"
    },
    { 
        id: 425, 
        name: "تويتر رقم بريطاني", 
        category: "ارقام للتطبيقات", 
        price: 1.10, 
        description: "رقم لتفعيل تطبيق تويتر رقم بريطاني",
        image: "images/تويتر.png"
    },
    { 
        id: 426, 
        name: "تويتر رقم اندونيسي", 
        category: "ارقام للتطبيقات", 
        price: 1.10, 
        description: "رقم لتفعيل تطبيق تويتر رقم اندونيسي",
        image: "images/تويتر.png"
    },
    { 
        id: 427, 
        name: "انستغرام رقم لاوس", 
        category: "ارقام للتطبيقات", 
        price: 1.10, 
        description: "رقم لتفعيل تطبيق انستغرام رقم لاوس",
        image: "images/انستغرام.png"
    },
    { 
        id: 462, 
        name: "فيسبوك رقم كندي", 
        category: "ارقام للتطبيقات", 
        price: 1.20, 
        description: "رقم لتفعيل تطبيق فيسبوك رقم كندي",
        image: "images/فيسبوك.png"
    },
    { 
        id: 463, 
        name: "فيسبوك رقم هولندي", 
        category: "ارقام للتطبيقات", 
        price: 1.20, 
        description: "رقم لتفعيل تطبيق فيسبوك رقم هولندي",
        image: "images/فيسبوك.png"
    },
    { 
        id: 464, 
        name: "فيسبوك رقم بريطاني", 
        category: "ارقام للتطبيقات", 
        price: 1.30, 
        description: "رقم لتفعيل تطبيق فيسبوك رقم بريطاني",
        image: "images/فيسبوك.png"
    },
    { 
        id: 465, 
        name: "فيسبوك رقم اندونيسي", 
        category: "ارقام للتطبيقات", 
        price: 1.30, 
        description: "رقم لتفعيل تطبيق فيسبوك رقم اندونيسي",
        image: "images/فيسبوك.png"
    },
    { 
        id: 466, 
        name: "فيسبوك رقم تايلندي", 
        category: "ارقام للتطبيقات", 
        price: 1.20, 
        description: "رقم لتفعيل تطبيق فيسبوك رقم تايلندي",
        image: "images/فيسبوك.png"
    },
    { 
        id: 428, 
        name: "تيك توك رقم امريكي", 
        category: "ارقام للتطبيقات", 
        price: 1.10, 
        description: "رقم لتفعيل تطبيق تيك توك رقم امريكي",
        image: "images/تيكتوك.png"
    },
    { 
        id: 429, 
        name: "تيك توك رقم كندي", 
        category: "ارقام للتطبيقات", 
        price: 1.10, 
        description: "رقم لتفعيل تطبيق تيك توك رقم كندي",
        image: "images/تيكتوك.png"
    },
    { 
        id: 430, 
        name: "تيك توك رقم بريطاني", 
        category: "ارقام للتطبيقات", 
        price: 1.10, 
        description: "رقم لتفعيل تطبيق تيك توك رقم بريطاني",
        image: "images/تيكتوك.png"
    },
    { 
        id: 431, 
        name: "تيك توك رقم جنوب افريقيا", 
        category: "ارقام للتطبيقات", 
        price: 1.10, 
        description: "رقم لتفعيل تطبيق تيك توك رقم جنوب افريقيا",
        image: "images/تيكتوك.png"
    },
    { 
        id: 432, 
        name: "جيميل رقم كمبوديا", 
        category: "ارقام للتطبيقات", 
        price: 1.30, 
        description: "رقم لتفعيل الجيميل رقم كمبوديا",
        image: "images/جيميل 1.avif"
    },
    { 
        id: 433, 
        name: "جيميل رقم فيتنامي", 
        category: "ارقام للتطبيقات", 
        price: 1.20, 
        description: "رقم لتفعيل جيميل رقم فيتنامي",
        image: "images/جيميل 1.avif"
    },
    { 
        id: 434, 
        name: "جيميل رقم اندونيسي", 
        category: "ارقام للتطبيقات", 
        price: 1.10, 
        description: "رقم لتفعيل جيميل رقم اندونيسي",
        image: "images/جيميل 1.avif"
    },
    { 
        id: 4235, 
        name: "جيميل رقم لاوس", 
        category: "ارقام للتطبيقات", 
        price: 1.10, 
        description: "رقم لتفعيل جيميل رقم لاوس",
        image: "images/جيميل 1.avif"
    },
    { 
        id: 436, 
        name: "جيميل رقم جنوب افريقيا", 
        category: "ارقام للتطبيقات", 
        price: 1.15, 
        description: "رقم لتفعيل جيميل رقم جنوب افريقيا",
        image: "images/جيميل 1.avif"
    },
    { 
        id: 437, 
        name: "جيميل رقم كندي", 
        category: "ارقام للتطبيقات", 
        price: 1.10, 
        description: "رقم لتفعيل جيميل رقم كندي",
        image: "images/جيميل 1.avif"
    },
    { 
        id: 438, 
        name: "جيميل رقم هونغ كونغ", 
        category: "ارقام للتطبيقات", 
        price: 1.20, 
        description: "رقم لتفعيل جيميل رقم هونغ كونغ",
        image: "images/جيميل 1.avif"
    },
    { 
        id: 439, 
        name: "جيميل رقم كازخستان", 
        category: "ارقام للتطبيقات", 
        price: 1.10, 
        description: "رقم لتفعيل جيميل رقم كازخستان",
        image: "images/جيميل 1.avif"
    },
    { 
        id: 440, 
        name: "جيميل رقم كولومبيا", 
        category: "ارقام للتطبيقات", 
        price: 1.30, 
        description: "رقم لتفعيل جيميل رقم كولومبيا",
        image: "images/جيميل 1.avif"
    },
    { 
        id: 441, 
        name: "جيميل رقم كينيا", 
        category: "ارقام للتطبيقات", 
        price: 1.20, 
        description: "رقم لتفعيل جيميل رقم كينيا",
        image: "images/جيميل 1.avif"
    },
    { 
        id: 442, 
        name: "سناب شات رقم سويدي", 
        category: "ارقام للتطبيقات", 
        price: 1.20, 
        description: "رقم لتفعيل تطبيق سناب شات رقم سويدي",
        image: "images/سناب شات.png"
    },
    { 
        id: 443, 
        name: "سناب شات رقم اندونيسي", 
        category: "ارقام للتطبيقات", 
        price: 1.10, 
        description: "رقم لتفعيل تطبيق سناب شات رقم اندونيسي",
        image: "images/سناب شات.png"
    },
    { 
        id: 444, 
        name: "ايمو رقم ماليزيا", 
        category: "ارقام للتطبيقات", 
        price: 1.10, 
        description: "رقم لتفعيل تطبيق ايمو رقم ماليزي",
        image: "images/ايمو.png"
    },
    { 
        id: 445, 
        name: "ايمو رقم اوكرانيا", 
        category: "ارقام للتطبيقات", 
        price: 1.10, 
        description: "رقم لتفعيل تطبيق ايمو رقم اوكرانيا",
        image: "images/ايمو.png"
    },
    { 
        id: 446, 
        name: "ايمو رقم الفلبين", 
        category: "ارقام للتطبيقات", 
        price: 1.10, 
        description: "رقم لتفعيل تطبيق ايمو رقم الفلبين",
        image: "images/ايمو.png"
    },
    { 
        id: 447, 
        name: "ايمو رقم بولندا", 
        category: "ارقام للتطبيقات", 
        price: 1.10, 
        description: "رقم لتفعيل تطبيق ايمو رقم بولندا",
        image: "images/ايمو.png"
    },
    { 
        id: 448, 
        name: "ايمو رقم قرغستان", 
        category: "ارقام للتطبيقات", 
        price: 1.10, 
        description: "رقم لتفعيل تطبيق ايمو رقم قرغستان",
        image: "images/ايمو.png"
    },{ 
        id: 449, 
        name: "Chat GPT رقم اندونيسي ", 
        category: "ارقام للتطبيقات", 
        price: 1.20, 
        description: "رقم لتفعيل تطبيق chat GPT رقم اندونيسي",
        image: "images/chat gpt.png"
    }, 
    { 
        id: 450, 
        name: "سكايب رقم بريطاني", 
        category: "ارقام للتطبيقات", 
        price: 1.30, 
        description: "رقم لتفعيل تطبيق سكايب رقم بريطاني",
        image: "images/سكايب.png"
    },
    { 
        id: 451, 
        name: "سكايب رقم تايلندي", 
        category: "ارقام للتطبيقات", 
        price: 1.25, 
        description: "رقم لتفعيل تطبيق سكايب رقم تايلندي",
        image: "images/سكايب.png"
    },
    { 
        id: 452, 
        name: "ايكلود رقم اندونيسي", 
        category: "ارقام للتطبيقات", 
        price: 1.30, 
        description: "رقم لتفعيل حساب ايكلود رقم اندونيسي",
        image: "images/ايكلود.png"
    },
    { 
        id: 453, 
        name: "Line رقم برازيلي", 
        category: "ارقام للتطبيقات", 
        price: 1.35, 
        description: "رقم لتفعيل تطبيق Line رقم برازيلي",
        image: "images/لاين.webp"
    },
    { 
        id: 454, 
        name: "وي شات رقم امريكي", 
        category: "ارقام للتطبيقات", 
        price: 1.20, 
        description: "رقم لتفعيل تطبيق وي شات رقم امريكي",
        image: "images/وي شات.webp"
    },
    { 
        id: 455, 
        name: "وي شات رقم كندي", 
        category: "ارقام للتطبيقات", 
        price: 1.10, 
        description: "رقم لتفعيل تطبيق وي شات رقم كندي",
        image: "images/وي شات.webp"
    },
    { 
        id: 456, 
        name: "وي شات رقم بريطاني", 
        category: "ارقام للتطبيقات", 
        price: 1.20, 
        description: "رقم لتفعيل تطبيق وي شات رقم بريطاني",
        image: "images/وي شات.webp"
    },
    { 
        id: 457, 
        name: "وي شات رقم اندونيسي", 
        category: "ارقام للتطبيقات", 
        price: 1.10, 
        description: "رقم لتفعيل تطبيق وي شات رقم اندونيسي",
        image: "images/وي شات.webp"
    },
    { 
        id: 467, 
        name: "سيغنال رقم اسباني", 
        category: "ارقام للتطبيقات", 
        price: 1.10, 
        description: "رقم لتفعيل تطبيق سيغنال رقم اسبانيا",
        image: "images/سيغنال.png"
    },
    { 
        id: 468, 
        name: "سيغنال رقم تايلندي", 
        category: "ارقام للتطبيقات", 
        price: 1.10, 
        description: "رقم لتفعيل تطبيق سيغنال رقم تايلندا",
        image: "images/سيغنال.png"
    },
    { 
        id: 469, 
        name: "سيغنال رقم هولندي", 
        category: "ارقام للتطبيقات", 
        price: 1.10, 
        description: "رقم لتفعيل تطبيق سيغنال رقم هولندا",
        image: "images/سيغنال.png"
    },
    { 
        id: 470, 
        name: "سيغنال رقم استونيا", 
        category: "ارقام للتطبيقات", 
        price: 1.10, 
        description: "رقم لتفعيل تطبيق سيغنال رقم استونيا",
        image: "images/سيغنال.png"
    },
    { 
        id: 458, 
        name: "مايكروسوفت رقم بريطاني", 
        category: "ارقام للتطبيقات", 
        price: 1.10, 
        description: "رقم لتفعيل حساب مايكرسوفت رقم بريطاني",
        image: "images/مايكروسوفت.webp"
    },
    { 
        id: 459, 
        name: "مايكروسوفت رقم كينيا", 
        category: "ارقام للتطبيقات", 
        price: 1.15, 
        description: "رقم لتفعيل حساب مايكروسوفت رقم كينيا",
        image: "images/مايكروسوفت.webp"
    },
    { 
        id: 460, 
        name: "ياهوو", 
        category: "ارقام للتطبيقات", 
        price: "", 
        description: "ارقام لتفعيل تطبيق ياهوو",
        image: "images/ياهوو.png"
    }, 
    { 
        id: 461, 
        name: "فايبر", 
        category: "ارقام للتطبيقات", 
        price: "", 
        description: "ارقام لتفعيل تطبيق فايبر",
        image: "images/فايبر.png"
    },
    // تفعيلات البريميوم

    // اشتراكات التلفاز
    { 
        id: 491, 
        name: "نيتفليكس بريميوم-بدون اعلانات-شهر-HD", 
        category: "اشتراكات التلفاز", 
        price: 12.50, 
        description: "نيتفليكس بريميوم , بدون اعلانات , يعمل على جهاز واحد فقط , دقة (720)",
        image: "images/نيتفليكس.png"
    },
    { 
        id: 492, 
        name: "نيتفليكس بريميوم-بدون اعلانات-شهر-Full HD", 
        category: "اشتراكات التلفاز", 
        price: 18, 
        description: "نيتفليكس بريميوم , بدون اعلانات , يعمل على جهازين معا , دقة (1080)",
        image: "images/نيتفليكس.png"
    },
    { 
        id: 493, 
        name: "نيتفليكس بريميوم-بدون اعلانات-شهر-4K", 
        category: "اشتراكات التلفاز", 
        price: 25, 
        description: "نيتفليكس بريميوم , بدون اعلانات , يعمل على اربع اجهزة معا , دقة (4K)",
        image: "images/نيتفليكس.png"
    },
    { 
        id: 494, 
        name: "VIP - 3 اشهر - شخصي", 
        category: "اشتراكات التلفاز", 
        price: 13.50, 
        description: "شاهد VIP لمدة 3 اشهر حساب خاص فيك 100% , يعمل على 20 جهاز بدون مشاكل , يمكنك تعديل جميع بيانات الحساب",
        image: "images/شاهد.png"
    },
    { 
        id: 495, 
        name: "VIP - سنة - شخصي", 
        category: "اشتراكات التلفاز", 
        price: 39.50, 
        description: "شاهد VIP لمدة سنة حساب خاص فيك 100% , يعمل على 20 جهاز بدون مشاكل , يمكنك تعديل جميع بيانات الحساب",
        image: "images/شاهد.png"
    },
    { 
        id: 496, 
        name: "شهر مشترك - VIP", 
        category: "اشتراكات التلفاز", 
        price: 5.60, 
        description: "لمدة شهر VIP يكون معك اشخاص في الحساب , ملاحظة: تغيير كلمة المرور تؤدي الى خسارة الحساب , جهاز واحد فقط",
        image: "images/شاهد.png"
    },
    // برامج التصميم
    {
        id: 497,
        name: "كانفا برو - سنة",
        category: "برامج التصميم",
        price: 8.50,
        description: "كانفا برو - سنة - التفعيل على ايميلك الخاص",
        image: "images/كانفا.png",
        inputLabel: "ادخل الايميل الذي تريد التفعيل عليه",
    },
    {
        id: 9497,
        name: "كانفا برو - 2 سنة",
        category: "برامج التصميم",
        price: 14,
        description: "كانفا برو - 2 سنة - التفعيل على ايميلك الخاص",
        image: "images/كانفا.png",
        inputLabel: "ادخل الايميل الذي تريد التفعيل عليه",
    },
    {
        id: 9498,
        name: "كانفا برو - 3 سنة",
        category: "برامج التصميم",
        price: 20,
        description: "كانفا برو - 3 سنة - التفعيل على ايميلك الخاص",
        image: "images/كانفا.png",
        inputLabel: "ادخل الايميل الذي تريد التفعيل عليه",
    },
    {
        id: 9499,
        name: "كانفا برو - 4 سنة",
        category: "برامج التصميم",
        price: 26,
        description: "كانفا برو - 4 سنة - التفعيل على ايميلك الخاص",
        image: "images/كانفا.png",
        inputLabel: "ادخل الايميل الذي تريد التفعيل عليه",
    },
    { 
        id: 498, 
        name: "كاب كات - شهر", 
        category: "برامج التصميم", 
        price: 5.70, 
        description: "حساب جاهز , يعمل على جهاز واحد فقط , يمكنك تغيير كلمة المرور بعد الحصول على بيانات تسجيل الدخول",
        image: "images/كاب كات.png"
    },
    { 
        id: 499, 
        name: "كاب كات - 3 اشهر", 
        category: "برامج التصميم", 
        price: 12.50, 
        description: "حساب جاهز , يعمل على جهاز واحد فقط , يمكنك تغيير كلمة المرور بعد الحصول على بيانات تسجيل الدخول",
        image: "images/كاب كات.png"
    },
    { 
        id: 501, 
        name: "كاب كات - 6 اشهر", 
        category: "برامج التصميم", 
        price: 22.30, 
        description: "حساب جاهز , يعمل على جهاز واحد فقط , يمكنك تغيير كلمة المرور بعد الحصول على بيانات تسجيل الدخول",
        image: "images/كاب كات.png"
    },
    { 
        id: 502, 
        name: "كاب كات - سنة", 
        category: "برامج التصميم", 
        price: 36, 
        description: "حساب جاهز , يعمل على جهاز واحد فقط , يمكنك تغيير كلمة المرور بعد الحصول على بيانات تسجيل الدخول",
        image: "images/كاب كات.png"
    },
    { 
        id: 503, 
        name: "بيكس ارت - شهر", 
        category: "برامج التصميم", 
        price: 5.80, 
        description: "حساب جاهز , يعمل على جهاز واحد فقط , يجب تشغيب VPN ببعض الاوقات , يرجى عدم تعديل بيانات الحساب",
        image: "images/بيكس ارت.png"
    },
    { 
        id: 504, 
        name: "بيكس ارت - 3 شهر", 
        category: "برامج التصميم", 
        price: 13, 
        description: "حساب جاهز , يعمل على جهاز واحد فقط , يجب تشغيب VPN ببعض الاوقات , يرجى عدم تعديل بيانات الحساب",
        image: "images/بيكس ارت.png"
    },
    { 
        id: 505, 
        name: "بيكس ارت - 6 شهر", 
        category: "برامج التصميم", 
        price: 22, 
        description: "حساب جاهز , يعمل على جهاز واحد فقط , يجب تشغيب VPN ببعض الاوقات , يرجى عدم تعديل بيانات الحساب",
        image: "images/بيكس ارت.png"
    },
    { 
        id: 506, 
        name: "بيكس ارت - سنة", 
        category: "برامج التصميم", 
        price: 31, 
        description: "حساب جاهز , يعمل على جهاز واحد فقط , يجب تشغيب VPN ببعض الاوقات , يرجى عدم تعديل بيانات الحساب",
        image: "images/بيكس ارت.png"
    },
    // اشتراكات vpn
    { 
        id: 507, 
        name: "بروتون VPN - شهر", 
        category: "اشتراكات VPN", 
        price: 5.70, 
        description: "بروتون VPN - شهر - حساب جاهز , يرجى عدم تغيير بيانات الحساب من اجل عدم فقدان الاشتراكات , يعمل على جهاز واحد فقط",
        image: "images/بروتون.jpg"
    },
    { 
        id: 508, 
        name: "بروتون VPN - شهرين", 
        category: "اشتراكات VPN", 
        price: 8.90, 
        description: "بروتون VPN - شهرين - حساب جاهز , يرجى عدم تغيير بيانات الحساب من اجل عدم فقدان الاشتراكات , يعمل على جهاز واحد فقط",
        image: "images/بروتون.jpg"
    },
    { 
        id: 509, 
        name: "بروتون VPN - 3 اشهر", 
        category: "اشتراكات VPN", 
        price: 13, 
        description: "بروتون VPN - 3 اشهر - حساب جاهز , يرجى عدم تغيير بيانات الحساب من اجل عدم فقدان الاشتراكات , يعمل على جهاز واحد فقط",
        image: "images/بروتون.jpg"
    },
    { 
        id: 510, 
        name: "بروتون VPN - 6 اشهر", 
        category: "اشتراكات VPN", 
        price: 21.50, 
        description: "بروتون VPN - 6 اشهر - حساب جاهز , يرجى عدم تغيير بيانات الحساب من اجل عدم فقدان الاشتراكات , يعمل على جهاز واحد فقط",
        image: "images/بروتون.jpg"
    },
    { 
        id: 511, 
        name: "بروتون VPN - سنة", 
        category: "اشتراكات VPN", 
        price: 36, 
        description: "بروتون VPN - سنة - حساب جاهز , يرجى عدم تغيير بيانات الحساب من اجل عدم فقدان الاشتراكات , يعمل على جهاز واحد فقط",
        image: "images/بروتون.jpg"
    },
    { 
        id: 512, 
        name: "بروتون VPN - سنتين", 
        category: "اشتراكات VPN", 
        price: 63, 
        description: "بروتون VPN - سنتين - حساب جاهز , يرجى عدم تغيير بيانات الحساب من اجل عدم فقدان الاشتراكات , يعمل على جهاز واحد فقط",
        image: "images/بروتون.jpg"
    },
    { 
        id: 513, 
        name: "جير اب بوستر - اسبوع - للهاتف", 
        category: "اشتراكات VPN", 
        price: "", 
        description: "جير اب بوستر - اسبوع - للهاتف - اكواد استرداد , الخدمة للهاتف فقط",
        image: "images/جير اب بوستر.png"
    },
    { 
        id: 514, 
        name: "جير اب بوستر - شهر - للهاتف", 
        category: "اشتراكات VPN", 
        price: 2.70, 
        description: "جير اب بوستر - شهر - للهاتف - اكواد استرداد , الخدمة للهاتف فقط",
        image: "images/جير اب بوستر.png"
    },
    { 
        id: 515, 
        name: "جير اب بوستر - 3 اشهر - للهاتف", 
        category: "اشتراكات VPN", 
        price: 7, 
        description: "جير اب بوستر - 3 اشهر - للهاتف - اكواد استرداد , الخدمة للهاتف فقط",
        image: "images/جير اب بوستر.png"
    },
    { 
        id: 516, 
        name: "جير اب بوستر - سنة - للهاتف", 
        category: "اشتراكات VPN", 
        price: 21.20, 
        description: "جير اب بوستر - سنة - للهاتف - اكواد استرداد , الخدمة للهاتف فقط",
        image: "images/جير اب بوستر.png"
    },
    { 
        id: 514, 
        name: "جير اب بوستر - شهر - للكومبيوتر", 
        category: "اشتراكات VPN", 
        price: 6, 
        description: "جير اب بوستر - شهر - للكومبيوتر - اكواد استرداد , الخدمة للكومبيوتر فقط",
        image: "images/جير اب بوستر.png"
    },
    { 
        id: 515, 
        name: "جير اب بوستر - 3 اشهر - للكومبيوتر", 
        category: "اشتراكات VPN", 
        price: 16.50, 
        description: "جير اب بوستر - 3 اشهر - للكومبيوتر - اكواد استرداد , الخدمة للكومبيوتر فقط",
        image: "images/جير اب بوستر.png"
    },
    { 
        id: 516, 
        name: "جير اب بوستر - سنة - للكومبيوتر", 
        category: "اشتراكات VPN", 
        price: 59.20, 
        description: "جير اب بوستر - سنة - للكومبيوتر - اكواد استرداد , الخدمة للكومبيوتر فقط",
        image: "images/جير اب بوستر.png"
    },
    { 
        id: 517, 
        name: "اكسبريس VPN - شهر - للهاتف", 
        category: "اشتراكات VPN", 
        price: 4, 
        description: "اكسبريس VPN - شهر - حساب جاهز خاص , الخدمة للهاتف فقط , يرجى عدم تغيير بيانات الحساب من اجل عدم فقدان الاشتراكات , يعمل على جهاز واحد فقط",
        image: "images/اكسبريس.png"
    },
    { 
        id: 518, 
        name: "اكسبريس VPN - 3 اشهر - للهاتف", 
        category: "اشتراكات VPN", 
        price: 10, 
        description: "اكسبريس VPN - 3 اشهر - حساب جاهز خاص , الخدمة للهاتف فقط , يرجى عدم تغيير بيانات الحساب من اجل عدم فقدان الاشتراكات , يعمل على جهاز واحد فقط",
        image: "images/اكسبريس.png"
    },
    { 
        id: 519, 
        name: "اكسبريس VPN - 6 اشهر - للهاتف", 
        category: "اشتراكات VPN", 
        price: 19, 
        description: "اكسبريس VPN - 6 اشهر - حساب جاهز خاص , الخدمة للهاتف فقط , يرجى عدم تغيير بيانات الحساب من اجل عدم فقدان الاشتراكات , يعمل على جهاز واحد فقط",
        image: "images/اكسبريس.png"
    },
    { 
        id: 520, 
        name: "اكسبريس VPN - سنة - للهاتف", 
        category: "اشتراكات VPN", 
        price: 30, 
        description: "اكسبريس VPN - سنة - حساب جاهز خاص , الخدمة للهاتف فقط , يرجى عدم تغيير بيانات الحساب من اجل عدم فقدان الاشتراكات , يعمل على جهاز واحد فقط",
        image: "images/اكسبريس.png"
    },
    { 
        id: 521, 
        name: "اكسبريس VPN - شهر - للكومبيوتر", 
        category: "اشتراكات VPN", 
        price: 4.50, 
        description: "اكسبريس VPN - للكومبيوتر - يرجى عدم تغيير بيانات الحساب من اجل عدم فقدان الاشتراكات , كود تفعيل , الخدمة للكومبيوتر فقط",
        image: "images/اكسبريس.png"
    },
    { 
        id: 522, 
        name: "بيا VPN - شهر", 
        category: "اشتراكات VPN", 
        price: 3, 
        description: "بيا VPN - شهر - حساب جاهز , يرجى عدم تغيير بيانات الحساب لعدم فقدان الاشتراك",
        image: "images/بيا.jpg"
    },
    { 
        id: 523, 
        name: "بيا VPN - 3 اشهر", 
        category: "اشتراكات VPN", 
        price: 7.60, 
        description: "بيا VPN - شهر - حساب جاهز , يرجى عدم تغيير بيانات الحساب لعدم فقدان الاشتراك",
        image: "images/بيا.jpg"
    },
    { 
        id: 524, 
        name: "بيا VPN - 6 اشهر", 
        category: "اشتراكات VPN", 
        price: 13, 
        description: "بيا VPN - شهر - حساب جاهز , يرجى عدم تغيير بيانات الحساب لعدم فقدان الاشتراك",
        image: "images/بيا.jpg"
    },
    { 
        id: 525, 
        name: "بيا VPN - سنة", 
        category: "اشتراكات VPN", 
        price: 24, 
        description: "بيا VPN - شهر - حساب جاهز , يرجى عدم تغيير بيانات الحساب لعدم فقدان الاشتراك",
        image: "images/بيا.jpg"
    },
    { 
        id: 526, 
        name: "بيا VPN - سنتين", 
        category: "اشتراكات VPN", 
        price: 40, 
        description: "بيا VPN - شهر - حساب جاهز , يرجى عدم تغيير بيانات الحساب لعدم فقدان الاشتراك",
        image: "images/بيا.jpg"
    },
    { 
        id: 527, 
        name: "لاغوفاست بوستر - شهر - للهاتف", 
        category: "اشتراكات VPN", 
        price: 7, 
        description: "لاغوفاست بوستر vpn - للهاتف فقط - كود استرداد - شهر",
        image: "images/لاغوفاست هاتف.png"
    },
    { 
        id: 528, 
        name: "لاغوفاست بوستر - سنة - للهاتف", 
        category: "اشتراكات VPN", 
        price: 42, 
        description: "لاغوفاست بوستر vpn - للهاتف فقط - كود استرداد - سنة",
        image: "images/لاغوفاست هاتف.png"
    },
    { 
        id: 529, 
        name: "لاغوفاست بوستر - شهر - للكومبيوتر", 
        category: "اشتراكات VPN", 
        price: 9, 
        description: "لاغوفاست بوستر vpn - للكومبيوتر فقط - كود استرداد - شهر",
        image: "images/لاغوفاست كومبيوتر.png"
    },
    { 
        id: 530, 
        name: "لاغوفاست بوستر - 3 اشهر - للكومبيوتر", 
        category: "اشتراكات VPN", 
        price: 23.30, 
        description: "لاغوفاست بوستر vpn - للكومبيوتر فقط - كود استرداد - 3 اشهر",
        image: "images/لاغوفاست كومبيوتر.png"
    },
    { 
        id: 531, 
        name: "لاغوفاست بوستر - 6 اشهر - للكومبيوتر", 
        category: "اشتراكات VPN", 
        price: 40.90, 
        description: "لاغوفاست بوستر vpn - للكومبيوتر فقط - كود استرداد - 6 اشهر",
        image: "images/لاغوفاست كومبيوتر.png"
    },
    { 
        id: 532, 
        name: "لاغوفاست بوستر - سنة - للكومبيوتر", 
        category: "اشتراكات VPN", 
        price: 71.50, 
        description: "لاغوفاست بوستر vpn - للكومبيوتر فقط - كود استرداد - سنة",
        image: "images/لاغوفاست كومبيوتر.png"
    },
    // الدفع الالكتروني
    { 
        id: 533, 
        name: "فيزا افتراضية - 5$", 
        category: "الدفع الالكتروني", 
        price: 7.60, 
        description: "بطاقة فيزا افتراضية - رابط",
        image: "images/فيزا.png"
    },
    { 
        id: 534, 
        name: "فيزا افتراضية - 10$", 
        category: "الدفع الالكتروني", 
        price: 12.60, 
        description: "بطاقة فيزا افتراضية - رابط",
        image: "images/فيزا.png"
    },
    { 
        id: 535, 
        name: "فيزا افتراضية - 15$", 
        category: "الدفع الالكتروني", 
        price: 18, 
        description: "بطاقة فيزا افتراضية - رابط",
        image: "images/فيزا.png"
    },
    { 
        id: 536, 
        name: "فيزا افتراضية - 25$", 
        category: "الدفع الالكتروني", 
        price: 30, 
        description: "بطاقة فيزا افتراضية - رابط",
        image: "images/فيزا.png"
    },
    { 
        id: 537, 
        name: "فيزا افتراضية - 50$", 
        category: "الدفع الالكتروني", 
        price: 63, 
        description: "بطاقة فيزا افتراضية - تستخدم لخدمات جوجل فقط - لا يمكن اعادة تعبئة الفيزا - غير مسؤولين عن سوء الاستخدام",
        image: "images/فيزا.png"
    },
    { 
        id: 538, 
        name: "ايتونز امريكا - 2$", 
        category: "الدفع الالكتروني", 
        price: 2.50, 
        description: "ايتونز امريكا - 2$",
        image: "images/ايتونز امريكي 1.jpg"
    },
    { 
        id: 539, 
        name: "ايتونز امريكا - 5$", 
        category: "الدفع الالكتروني", 
        price: 5.70, 
        description: "ايتونز امريكا - 5$",
        image: "images/ايتونز امريكي 1.jpg"
    },
    { 
        id: 540, 
        name: "ايتونز امريكا - 10$", 
        category: "الدفع الالكتروني", 
        price: 11, 
        description: "ايتونز امريكا - 10$",
        image: "images/ايتونز امريكي 1.jpg"
    },
    { 
        id: 541, 
        name: "ايتونز امريكا - 15$", 
        category: "الدفع الالكتروني", 
        price: 16, 
        description: "ايتونز امريكا - 15$",
        image: "images/ايتونز امريكي 1.jpg"
    },
    { 
        id: 542, 
        name: "ايتونز امريكا - 20$", 
        category: "الدفع الالكتروني", 
        price: 22, 
        description: "ايتونز امريكا - 20$",
        image: "images/ايتونز امريكي 1.jpg"
    },
    { 
        id: 543, 
        name: "ايتونز امريكا - 25$", 
        category: "الدفع الالكتروني", 
        price: 28, 
        description: "ايتونز امريكا - 25$",
        image: "images/ايتونز امريكي 1.jpg"
    },
    { 
        id: 544, 
        name: "ايتونز امريكا - 50$", 
        category: "الدفع الالكتروني", 
        price: 54.50, 
        description: "ايتونز امريكا - 50$",
        image: "images/ايتونز امريكي 1.jpg"
    },
    { 
        id: 545, 
        name: "ايتونز امريكا - 100$", 
        category: "الدفع الالكتروني", 
        price: 108, 
        description: "ايتونز امريكا - 100$",
        image: "images/ايتونز امريكي 1.jpg"
    },
    { 
        id: 546, 
        name: "ايتونز امريكا - 150$", 
        category: "الدفع الالكتروني", 
        price: 158, 
        description: "ايتونز امريكا - 150$",
        image: "images/ايتونز امريكي 1.jpg"
    },
    { 
        id: 547, 
        name: "ايتونز امريكا - 200$", 
        category: "الدفع الالكتروني", 
        price: 208, 
        description: "ايتونز امريكا - 200$",
        image: "images/ايتونز امريكي 1.jpg"
    },
    { 
        id: 548, 
        name: "ايتونز امريكا - 300$", 
        category: "الدفع الالكتروني", 
        price: 310, 
        description: "ايتونز امريكا - 300$",
        image: "images/ايتونز امريكي 1.jpg"
    },
    { 
        id: 549, 
        name: "ايتونز تركيا - 25 L.T", 
        category: "الدفع الالكتروني", 
        price: 0.90, 
        description: "ايتونز تركيا - 25$",
        image: "images/ايتونز تركي 1.jpg"
    },
    { 
        id: 550, 
        name: "ايتونز تركيا - 50 L.T", 
        category: "الدفع الالكتروني", 
        price: 1.70, 
        description: "ايتونز تركيا - 50$",
        image: "images/ايتونز تركي 1.jpg"
    },
    { 
        id: 551, 
        name: "ايتونز تركيا - 100 L.T", 
        category: "الدفع الالكتروني", 
        price: 3.20, 
        description: "ايتونز تركيا - 100$",
        image: "images/ايتونز تركي 1.jpg"
    },
    { 
        id: 552, 
        name: "ايتونز تركيا - 250 L.T", 
        category: "الدفع الالكتروني", 
        price: 7.10, 
        description: "ايتونز تركيا - 250$",
        image: "images/ايتونز تركي 1.jpg"
    },
    { 
        id: 553, 
        name: "ايتونز تركيا - 500 L.T", 
        category: "الدفع الالكتروني", 
        price: 13.70, 
        description: "ايتونز تركيا - 500$",
        image: "images/ايتونز تركي 1.jpg"
    },
    { 
        id: 554, 
        name: "ايتونز تركيا - 1000 L.T", 
        category: "الدفع الالكتروني", 
        price: 27.40, 
        description: "ايتونز تركيا - 1000$",
        image: "images/ايتونز تركي 1.jpg"
    },
    { 
        id: 555, 
        name: "ايتونز تركيا - 1500 L.T", 
        category: "الدفع الالكتروني", 
        price: 43, 
        description: "ايتونز تركيا - 1500$",
        image: "images/ايتونز تركي 1.jpg"
    },
    { 
        id: 556, 
        name: "ايتونز الامارات - 50 AED", 
        category: "الدفع الالكتروني", 
        price: 16.80, 
        description: "ايتونز الامارات - 50$",
        image: "images/ايتونز اماراتي.jpg"
    },
    { 
        id: 557, 
        name: "ايتونز الامارات - 100 AED", 
        category: "الدفع الالكتروني", 
        price: 33.40, 
        description: "ايتونز الامارات - 100$",
        image: "images/ايتونز اماراتي.jpg"
    },
    { 
        id: 558, 
        name: "ايتونز الامارات - 250 AED", 
        category: "الدفع الالكتروني", 
        price: 83, 
        description: "ايتونز الامارات - 250$",
        image: "images/ايتونز اماراتي.jpg"
    },
    { 
        id: 559, 
        name: "ايتونز الامارات - 500 AED", 
        category: "الدفع الالكتروني", 
        price: 161.30, 
        description: "ايتونز الامارات - 500$",
        image: "images/ايتونز اماراتي.jpg"
    },
    { 
        id: 561, 
        name: "ستيم - USA - 5$", 
        category: "الدفع الالكتروني", 
        price: 6.25, 
        description: "ستيم - USA - 5$",
        image: "images/ستيم.webp"
    },
    { 
        id: 562, 
        name: "ستيم - USA - 10$", 
        category: "الدفع الالكتروني", 
        price: 12.10, 
        description: "ستيم - USA - 10$",
        image: "images/ستيم.webp"
    },
    { 
        id: 563, 
        name: "ستيم - USA - 20$", 
        category: "الدفع الالكتروني", 
        price: 23.20, 
        description: "ستيم - USA - 20$",
        image: "images/ستيم.webp"
    },
    { 
        id: 564, 
        name: "ستيم - USA - 50$", 
        category: "الدفع الالكتروني", 
        price: 63, 
        description: "ستيم - USA - 50$",
        image: "images/ستيم.webp"
    },
    { 
        id: 565, 
        name: "ستيم - USA - 100$", 
        category: "الدفع الالكتروني", 
        price: 120, 
        description: "ستيم - USA - 100$",
        image: "images/ستيم.webp"
    },
    { 
        id: 566, 
        name: "ستيم - AED - 20", 
        category: "الدفع الالكتروني", 
        price: 7, 
        description: "ستيم - AED - 20",
        image: "images/ستيم.webp"
    },
    { 
        id: 567, 
        name: "ستيم - AED - 40", 
        category: "الدفع الالكتروني", 
        price: 13, 
        description: "ستيم - AED - 40",
        image: "images/ستيم.webp"
    },
    { 
        id: 568, 
        name: "ستيم - AED - 50", 
        category: "الدفع الالكتروني", 
        price: 15.50, 
        description: "ستيم - AED - 50",
        image: "images/ستيم.webp"
    },
    { 
        id: 569, 
        name: "ستيم - AED - 75", 
        category: "الدفع الالكتروني", 
        price: 24.70, 
        description: "ستيم - AED - 75",
        image: "images/ستيم.webp"
    },
    { 
        id: 570, 
        name: "ستيم - AED - 100", 
        category: "الدفع الالكتروني", 
        price: 33.20, 
        description: "ستيم - AED - 100",
        image: "images/ستيم.webp"
    },
    { 
        id: 571, 
        name: "ستيم - AED - 200", 
        category: "الدفع الالكتروني", 
        price: 63.40, 
        description: "ستيم - AED - 200",
        image: "images/ستيم.webp"
    },
    { 
        id: 572, 
        name: "ستيم - SAR - 20", 
        category: "الدفع الالكتروني", 
        price: 7, 
        description: "ستيم - SAR - 20",
        image: "images/ستيم.webp"
    },
    { 
        id: 573, 
        name: "ستيم - SAR - 40", 
        category: "الدفع الالكتروني", 
        price: 13.50, 
        description: "ستيم - SAR - 40",
        image: "images/ستيم.webp"
    },
    { 
        id: 574, 
        name: "ستيم - SAR - 50", 
        category: "الدفع الالكتروني", 
        price: 16.50, 
        description: "ستيم - SAR - 50",
        image: "images/ستيم.webp"
    },
    { 
        id: 575, 
        name: "ستيم - SAR - 100", 
        category: "الدفع الالكتروني", 
        price: 34, 
        description: "ستيم - SAR - 100",
        image: "images/ستيم.webp"
    },
    { 
        id: 576, 
        name: "ستيم - SAR - 200", 
        category: "الدفع الالكتروني", 
        price: 65.30, 
        description: "ستيم - SAR - 200",
        image: "images/ستيم.webp"
    },
    { 
        id: 577, 
        name: "ستيم - SAR - 400", 
        category: "الدفع الالكتروني", 
        price: 123.40, 
        description: "ستيم - SAR - 400",
        image: "images/ستيم.webp"
    },
    { 
        id: 589, 
        name: "ستيم - EUR - 10€", 
        category: "الدفع الالكتروني", 
        price: 16.70, 
        description: "ستيم - EUR - 10€",
        image: "images/ستيم.webp"
    },
    { 
        id: 590, 
        name: "ستيم - EUR - 20€", 
        category: "الدفع الالكتروني", 
        price: 30, 
        description: "ستيم - EUR - 20€",
        image: "images/ستيم.webp"
    },
    { 
        id: 591, 
        name: "ستيم - EUR - 50€", 
        category: "الدفع الالكتروني", 
        price: 70, 
        description: "ستيم - EUR - 50€",
        image: "images/ستيم.webp"
    },
    { 
        id: 578, 
        name: "ستيم - TRY - 5$", 
        category: "الدفع الالكتروني", 
        price: 7.30, 
        description: "ستيم - TRY - 5$",
        image: "images/ستيم.webp"
    },
    { 
        id: 579, 
        name: "ستيم - TRY - 10$", 
        category: "الدفع الالكتروني", 
        price: 13.70, 
        description: "ستيم - TRY - 10$",
        image: "images/ستيم.webp"
    },
    { 
        id: 580, 
        name: "ستيم - TRY - 25$", 
        category: "الدفع الالكتروني", 
        price: 32.60, 
        description: "ستيم - TRY - 25$",
        image: "images/ستيم.webp"
    },
    { 
        id: 581, 
        name: "PSN - 10$ - UAE", 
        category: "الدفع الالكتروني", 
        price: 12, 
        description: "PSN - 10$ - UAE",
        image: "images/PSN.jpg"
    },
    { 
        id: 582, 
        name: "PSN - 20$ - UAE", 
        category: "الدفع الالكتروني", 
        price: 23, 
        description: "PSN - 20$ - UAE",
        image: "images/PSN.jpg"
    },
    { 
        id: 583, 
        name: "PSN - 50$ - UAE", 
        category: "الدفع الالكتروني", 
        price: 55, 
        description: "PSN - 50$ - UAE",
        image: "images/PSN.jpg"
    },
    { 
        id: 584, 
        name: "PSN - 100$ - UAE", 
        category: "الدفع الالكتروني", 
        price: 107.30, 
        description: "PSN - 100$ - UAE",
        image: "images/PSN.jpg"
    },
    { 
        id: 585, 
        name: "PSN - 10$ - USA", 
        category: "الدفع الالكتروني", 
        price: 12, 
        description: "PSN - 10$ - USA",
        image: "images/PSN.jpg"
    },
    { 
        id: 586, 
        name: "PSN - 25$ - USA", 
        category: "الدفع الالكتروني", 
        price: 28.70, 
        description: "PSN - 25$ - USA",
        image: "images/PSN.jpg"
    },
    { 
        id: 587, 
        name: "PSN - 50$ - USA", 
        category: "الدفع الالكتروني", 
        price: 56, 
        description: "PSN - 50$ - USA",
        image: "images/PSN.jpg"
    },
    { 
        id: 588, 
        name: "PSN - 100$ - USA", 
        category: "الدفع الالكتروني", 
        price: 108, 
        description: "PSN - 100$ - USA",
        image: "images/PSN.jpg"
    },
    //الحسابات 
    { 
        id: 592, 
        name: "حساب آبل آيدي عادي", 
        category: "الحسابات", 
        price: 9.75, 
        description: "حساب آبل آيدي عادي فوري",
        image: "images/ابل ايدي.png"
    },
    { 
        id: 596, 
        name: "حساب آبل آيدي امريكي", 
        category: "الحسابات", 
        price: 14, 
        description: "حساب آبل آيدي امريكي فوري",
        image: "images/ابل ايدي.png"
    },
    { 
        id: 593, 
        name: "حساب جيميل", 
        category: "الحسابات", 
        price: 1.25, 
        description: "حساب جيميل فوري",
        image: "images/جيميل 1.avif"
    },
    { 
        id: 594, 
        name: "حساب تويتر", 
        category: "الحسابات", 
        price: 12.50, 
        description: "حساب تويتر - تاريخ انشاء الحساب بين 2006 - 2019",
        image: "images/تويتر.png"
    },
    { 
        id: 595, 
        name: "حساب فيسبوك", 
        category: "الحسابات", 
        price: 9.40, 
        description: "حساب فيسبوك جديد",
        image: "images/فيسبوك.png"
    },
];

// إضافة الألعاب من gamesData إلى مصفوفة المنتجات تلقائياً
gamesData.forEach(game => {
    products.push({
        id: game.id,
        name: game.name,
        category: game.category,
        price: 0,
        description: game.description,
        image: game.image
    });
});

// إضافة التطبيقات من appsData إلى مصفوفة المنتجات
appsData.forEach(app => {
    products.push({
        id: app.id,
        name: app.name,
        category: app.category,
        price: 0,
        description: app.description,
        image: app.image
    });
});
