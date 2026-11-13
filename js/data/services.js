/* ══════════════════════════════════════════════════════════════════════
 * بيانات الخدمات الرقمية
 * تفعيلات البريميوم، اشتراكات VPN، الدفع الإلكتروني.
 * ══════════════════════════════════════════════════════════════════════ */

// ==================== بيانات تفعيلات البريميوم ====================
const premiumActivationsData = [
    {
        id: "telegram-premium",
        name: "تليغرام مميز",
        category: "تفعيلات بريميوم",
        description: "تليغرام مميز - تفعيل على معرفك",
        image: "images/تليغرام.png",
        inputLabel: "أدخل معرفك التليغرام",
        inputPlaceholder: "مثال: username",
        inputHelp: "أدخل معرفك في تليغرام بدون @",
        products: [
            { id: 1, name: "تليغرام مميز - 3 اشهر", price: 17.50 },
            { id: 2, name: "تليغرام مميز - 6 اشهر", price: 24.50 },
            { id: 3, name: "تليغرام مميز - سنة", price: 38.70 },
        ]
    },
    {
        id: "telegram-stars",
        name: "نجوم تليغرام",
        category: "تفعيلات بريميوم",
        description: "نجوم تليغرام لمعرفك",
        image: "images/نجوم.jpeg",
        inputLabel: "أدخل معرفك التليغرام مع (@)",
        inputPlaceholder: "مثال: username",
        inputHelp: "أدخل معرفك في تليغرام بدون @",
        products: [
            { id: 4, name: "100 نجمة تليغرام", price: 2.60 },
            { id: 5, name: "150 نجمة تليغرام", price: 3.50 },
            { id: 6, name: "250 نجمة تليغرام", price: 5.50 },
            { id: 7, name: "350 نجمة تليغرام", price: 7.20 },
            { id: 8, name: "500 نجمة تليغرام", price: 9.90 },
            { id: 9, name: "750 نجمة تليغرام", price: 14.20 },
            { id: 10, name: "1000 نجمة تليغرام", price: 19.10 },
            { id: 11, name: "1500 نجمة تليغرام", price: 28.90 },
            { id: 12, name: "2500 نجمة تليغرام", price: 47.50 },
            { id: 13, name: "5000 نجمة تليغرام", price: 91.50 },
        ]
    },
    {
        id: "youtube-premium",
        name: "يوتيوب بريميوم",
        category: "تفعيلات بريميوم",
        description: "يوتيوب بريميوم - تفعيل على ايميلك",
        image: "images/يوتيوب.png",
        inputLabel: "أدخل الإيميل الذي تريد التفعيل عليه",
        inputPlaceholder: "مثال: example@gmail.com",
        inputHelp: "أدخل البريد الإلكتروني المرتبط بحسابك في يوتيوب",
        products: [
            { id: 14, name: "يوتيوب بريميوم - شهر", price: 8.70 },
            { id: 15, name: "يوتيوب بريميوم - 3 أشهر", price: 21 },
            { id: 16, name: "يوتيوب بريميوم - 6 اشهر", price: 29.10 },
            { id: 17, name: "يوتيوب بريميوم - سنة", price: 50.70 },
        ]
    },
    {
        id: "snapchat-plus",
        name: "سناب شات بلس",
        category: "تفعيلات بريميوم",
        description: "سناب شات بلس - تفعيل على معرفك",
        image: "images/سناب شات.png",
        inputLabel: "أدخل معرفك في سناب شات",
        inputPlaceholder: "مثال: username",
        inputHelp: "أدخل معرفك في سناب شات بدون @",
        products: [
            { id: 18, name: "سناب شات بلس - 3 اشهر", price: 9.70 },
            { id: 19, name: "سناب شات بلس - 6 اشهر", price: 16.20 },
            { id: 20, name: "سناب شات بلس - سنة", price: 30.10 },
        ]
    },
];

// ==================== بيانات اشتراكات VPN ====================
const vpnData = [
    {
        id: "proton-vpn",
        name: "بروتون VPN",
        category: "اشتراكات VPN",
        description: "بروتون VPN - حساب جاهز",
        image: "images/بروتون.jpg",
        products: [
            { id: 507, name: "بروتون VPN - شهر", price: 5.70 },
            { id: 508, name: "بروتون VPN - شهرين", price: 8.90 },
            { id: 509, name: "بروتون VPN - 3 اشهر", price: 13 },
            { id: 510, name: "بروتون VPN - 6 اشهر", price: 21.50 },
            { id: 511, name: "بروتون VPN - سنة", price: 36 },
            { id: 512, name: "بروتون VPN - سنتين", price: 63 },
        ]
    },
    {
        id: "jer-vpn",
        name: "جير اب بوستر",
        category: "اشتراكات VPN",
        description: "جير اب بوستر - اكواد استرداد",
        image: "images/جير اب بوستر.png",
        products: [
            { id: 513, name: "جير اب بوستر - اسبوع - للهاتف", price: "" },
            { id: 514, name: "جير اب بوستر - شهر - للهاتف", price: 2.70 },
            { id: 515, name: "جير اب بوستر - 3 اشهر - للهاتف", price: 7 },
            { id: 516, name: "جير اب بوستر - سنة - للهاتف", price: 21.20 },
            { id: 517, name: "جير اب بوستر - شهر - للكومبيوتر", price: 6 },
            { id: 518, name: "جير اب بوستر - 3 اشهر - للكومبيوتر", price: 16.50 },
            { id: 519, name: "جير اب بوستر - سنة - للكومبيوتر", price: 59.20 },
        ]
    },
    {
        id: "express-vpn",
        name: "اكسبريس VPN",
        category: "اشتراكات VPN",
        description: "اكسبريس VPN - حساب جاهز خاص",
        image: "images/اكسبريس.png",
        products: [
            { id: 520, name: "اكسبريس VPN - شهر - للهاتف", price: 4 },
            { id: 521, name: "اكسبريس VPN - 3 اشهر - للهاتف", price: 10 },
            { id: 522, name: "اكسبريس VPN - 6 اشهر - للهاتف", price: 19 },
            { id: 523, name: "اكسبريس VPN - سنة - للهاتف", price: 30 },
            { id: 524, name: "اكسبريس VPN - شهر - للكومبيوتر", price: 4.50 },
        ]
    },
    {
        id: "pia-vpn",
        name: "بيا VPN",
        category: "اشتراكات VPN",
        description: "bia VPN - حساب جاهز",
        image: "images/بيا.jpg",
        products: [
            { id: 525, name: "bia VPN - شهر", price: 3 },
            { id: 526, name: "bia VPN - 3 اشهر", price: 7.60 },
            { id: 527, name: "bia VPN - 6 اشهر", price: 13 },
            { id: 528, name: "bia VPN - سنة", price: 24 },
            { id: 529, name: "bia VPN - سنتين", price: 40 },
        ]
    },
    {
        id: "lago-vpn",
        name: "لاغوفاست بوستر",
        category: "اشتراكات VPN",
        description: "لاغوفاست بوستر - كود استرداد",
        image: "images/لاغوفاست هاتف.png",
        products: [
            { id: 530, name: "لاغوفاست - شهر - للهاتف", price: 7 },
            { id: 531, name: "لاغوفاست - سنة - للهاتف", price: 42 },
            { id: 532, name: "لاغوفاست - شهر - للكومبيوتر", price: 9 },
            { id: 533, name: "لاغوفاست - 3 اشهر - للكومبيوتر", price: 23.30 },
            { id: 534, name: "لاغوفاست - 6 اشهر - للكومبيوتر", price: 40.90 },
            { id: 535, name: "لاغوفاست - سنة - للكومبيوتر", price: 71.50 },
        ]
    },
];

// ==================== بيانات الدفع electronique ====================
const electronicPaymentData = [
    {
        id: "visa",
        name: "فيزا افتراضية",
        category: "الدفع electronique",
        description: "بطاقة فيزا افتراضية - رابط",
        image: "images/فيزا.png",
        products: [
            { id: 533, name: "فيزا افتراضية - 5$", price: 7.60 },
            { id: 534, name: "فيزا افتراضية - 10$", price: 12.60 },
            { id: 535, name: "فيزا افتراضية - 15$", price: 18 },
            { id: 536, name: "فيزا افتراضية - 25$", price: 30 },
            { id: 537, name: "فيزا افتراضية - 50$", price: 63 },
        ]
    },
    {
        id: "itunes-usa",
        name: "ايتونز امريكا",
        category: "الدفع electronique",
        description: "ايتونز امريكا - رصيد حساب",
        image: "images/ايتونز امريكي 1.jpg",
        products: [
            { id: 538, name: "ايتونز امريكا - 2$", price: 2.50 },
            { id: 539, name: "ايتونز امريكا - 5$", price: 5.70 },
            { id: 540, name: "ايتونز امريكا - 10$", price: 11 },
            { id: 541, name: "ايتونز امريكا - 15$", price: 16 },
            { id: 542, name: "ايتونز امريكا - 20$", price: 22 },
            { id: 543, name: "ايتونز امريكا - 25$", price: 28 },
            { id: 544, name: "ايتونز امريكا - 50$", price: 54.50 },
            { id: 545, name: "ايتونز امريكا - 100$", price: 108 },
            { id: 546, name: "ايتونز امريكا - 150$", price: 158 },
            { id: 547, name: "ايتونز امريكا - 200$", price: 208 },
            { id: 548, name: "ايتونز امريكا - 300$", price: 310 },
        ]
    },
    {
        id: "itunes-turkey",
        name: "ايتونز تركيا",
        category: "الدفع electronique",
        description: "ايتونز تركيا - رصيد حساب",
        image: "images/ايتونز تركي 1.jpg",
        products: [
            { id: 549, name: "ايتونز تركيا - 25 L.T", price: 0.90 },
            { id: 550, name: "ايتونز تركيا - 50 L.T", price: 1.70 },
            { id: 551, name: "ايتونز تركيا - 100 L.T", price: 3.20 },
            { id: 552, name: "ايتونز تركيا - 250 L.T", price: 7.10 },
            { id: 553, name: "ايتونز تركيا - 500 L.T", price: 13.70 },
            { id: 554, name: "ايتونز تركيا - 1000 L.T", price: 27.40 },
            { id: 555, name: "ايتونز تركيا - 1500 L.T", price: 43 },
        ]
    },
    {
        id: "itunes-uae",
        name: "ايتونز الامارات",
        category: "الدفع electronique",
        description: "ايتونز الامارات - رصيد حساب",
        image: "images/ايتونز اماراتي.jpg",
        products: [
            { id: 556, name: "ايتونز الامارات - 50 AED", price: 16.80 },
            { id: 557, name: "ايتونز الامارات - 100 AED", price: 33.40 },
            { id: 558, name: "ايتونز الامارات - 250 AED", price: 83 },
            { id: 559, name: "ايتونز الامارات - 500 AED", price: 161.30 },
        ]
    },
    {
        id: "steam-usa",
        name: "ستيم امريكا",
        category: "الدفع electronique",
        description: "ستيم امريكا - رصيد حساب",
        image: "images/ستيم.webp",
        products: [
            { id: 561, name: "ستيم - USA - 5$", price: 6.25 },
            { id: 562, name: "ستيم - USA - 10$", price: 12.10 },
            { id: 563, name: "ستيم - USA - 20$", price: 23.20 },
            { id: 564, name: "ستيم - USA - 50$", price: 63 },
            { id: 565, name: "ستيم - USA - 100$", price: 120 },
        ]
    },
    {
        id: "steam-aed",
        name: "ستيم الامارات",
        category: "الدفع electronique",
        description: "ستيم الامارات - رصيد حساب",
        image: "images/ستيم.webp",
        products: [
            { id: 566, name: "ستيم - AED - 20", price: 7 },
            { id: 567, name: "ستيم - AED - 40", price: 13 },
            { id: 568, name: "ستيم - AED - 50", price: 15.50 },
            { id: 569, name: "ستيم - AED - 75", price: 24.70 },
            { id: 570, name: "ستيم - AED - 100", price: 33.20 },
            { id: 571, name: "ستيم - AED - 200", price: 63.40 },
        ]
    },
    {
        id: "steam-saudi",
        name: "ستيم السعودية",
        category: "الدفع electronique",
        description: "ستيم السعودية - رصيد حساب",
        image: "images/ستيم.webp",
        products: [
            { id: 572, name: "ستيم - SAR - 20", price: 7 },
            { id: 573, name: "ستيم - SAR - 40", price: 13.50 },
            { id: 574, name: "ستيم - SAR - 50", price: 16.50 },
            { id: 575, name: "ستيم - SAR - 100", price: 34 },
            { id: 576, name: "ستيم - SAR - 200", price: 65.30 },
            { id: 577, name: "ستيم - SAR - 400", price: 123.40 },
        ]
    },
    {
        id: "steam-eur",
        name: "ستيم اوروبا",
        category: "الدفع electronique",
        description: "ستيم اوروبا - رصيد حساب",
        image: "images/ستيم.webp",
        products: [
            { id: 589, name: "ستيم - EUR - 10€", price: 16.70 },
            { id: 590, name: "ستيم - EUR - 20€", price: 30 },
            { id: 591, name: "ستيم - EUR - 50€", price: 70 },
        ]
    },
    {
        id: "steam-try",
        name: "ستيم تركيا",
        category: "الدفع electronique",
        description: "ستيم تركيا - رصيد حساب",
        image: "images/ستيم.webp",
        products: [
            { id: 578, name: "ستيم - TRY - 5$", price: 7.30 },
            { id: 579, name: "ستيم - TRY - 10$", price: 13.70 },
            { id: 580, name: "ستيم - TRY - 25$", price: 32.60 },
        ]
    },
    {
        id: "psn-uae",
        name: "PSN الامارات",
        category: "الدفع electronique",
        description: "PSN الامارات - رصيد حساب",
        image: "images/PSN.jpg",
        products: [
            { id: 581, name: "PSN - 10$ - UAE", price: 12 },
            { id: 582, name: "PSN - 20$ - UAE", price: 23 },
            { id: 583, name: "PSN - 50$ - UAE", price: 55 },
            { id: 584, name: "PSN - 100$ - UAE", price: 107.30 },
        ]
    },
    {
        id: "psn-usa",
        name: "PSN امريكا",
        category: "الدفع electronique",
        description: "PSN امريكا - رصيد حساب",
        image: "images/PSN.jpg",
        products: [
            { id: 585, name: "PSN - 10$ - USA", price: 12 },
            { id: 586, name: "PSN - 25$ - USA", price: 28.70 },
            { id: 587, name: "PSN - 50$ - USA", price: 56 },
            { id: 588, name: "PSN - 100$ - USA", price: 108 },
        ]
    },
];
