/* ══════════════════════════════════════════════════════════════════════
 * بيانات شحن التطبيقات (appsData)
 * لكل تطبيق: سعر الوحدة والحد الأدنى والأقصى للكمية.
 * ══════════════════════════════════════════════════════════════════════ */

// ==================== بيانات التطبيقات للشحن (APP) - مع حد أدنى وأقصى وسعر للقطعة ====================
const appsData = [
    {
        id: 200,
        name: "عملات تيك توك",
        category: "app",
        description: "عملات تيك توك : ادخل الكمية التي تريدها",
        image: "images/تيكتوك.png",
        inputLabel: "غير متوفر حاليا",
        unitPrice: 0, // غير متوفر
        minQuantity: 10000,
        maxQuantity: 4000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 201,
        name: "اهلا شات",
        category: "app",
        description: "عملات اهلا شات : ادخل الكمية التي تريدها (",
        image: "images/اهلا شات.png",
        inputLabel: "رقم اللاعب (User ID)", // النص المخصص لحقل الإدخال
        unitPrice: 0.000455, // سعر القطعة الواحدة (العملة الواحدة) - 5 سنت
        minQuantity: 2500,
        maxQuantity: 1000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 202,
        name: "لايكي",
        category: "app",
        description: "عملات تطبيق لايكي : ادخل الكمية التي تريدها",
        image: "images/لايكي.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.0235, // 4 سنت للعملة
        minQuantity: 100,
        maxQuantity: 500000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 203,
        name: "بيغو لايف",
        category: "app",
        description: "عملات بيغو لايف : ادخل الكمية التي تريدها",
        image: "images/بيغو لايف 1.jpg",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.0215, // 7 سنت للعملة
        minQuantity: 50,
        maxQuantity: 15000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 204,
        name: "سول شيل",
        category: "app",
        description: "عملات سول شيل : ادخل الكمية التي تريدها",
        image: "images/سول شيل.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00215, // 6 سنت للعملة
        minQuantity: 1000,
        maxQuantity: 500000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 205,
        name: "يوهو واكا شات",
        category: "app",
        description: "عملات يوهو شات : ادخل الكمية التي تريدها",
        image: "images/يوهو شات.jpg",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.000145, // 4.5 سنت للعملة
        minQuantity: 10000,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 9205,
        name: "ليغو لايف",
        category: "app",
        description: "عملات ليغو لايف: ادخل الكمية التي تريدها",
        image: "images/ليغو لايف 1.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00172, // 5.5 سنت للعملة
        minQuantity: 1000,
        maxQuantity: 500000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 206,
        name: "سول ستار",
        category: "app",
        description: "عملات سول ستار: ادخل الكمية التي تريدها",
        image: "images/سول ستار.jpg",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.000155, // 5 سنت للعملة
        minQuantity: 10000,
        maxQuantity: 2000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 207,
        name: "هامي بارتي",
        category: "app",
        description: "عملات هامي بارتي: ادخل الكمية التي تريدها",
        image: "images/هامي بارتي.jpg",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00017, // 5 سنت للعملة
        minQuantity: 10000,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 208,
        name: "كوكو لايف",
        category: "app",
        description: "عملات كوكو لايف: ادخل الكمية التي تريدها",
        image: "images/كوكو لايف.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00017, // 5 سنت للعملة
        minQuantity: 10000,
        maxQuantity: 10000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 209,
        name: "فور فان شات",
        category: "app",
        description: "عملات فور فان شات : ادخل الكمية التي تريدها",
        image: "images/فور فان شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00011, // 5 سنت للعملة
        minQuantity: 20000,
        maxQuantity: 10000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 210,
        name: "يويو شات",
        category: "app",
        description: "عملات يويو شات : ادخل الكمية التي تريدها",
        image: "images/يويو شات.jpg",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00095, // 5 سنت للعملة
        minQuantity: 1000,
        maxQuantity: 500000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 211,
        name: "ازال لايف",
        category: "app",
        description: "عملات ازال لايف : ادخل الكمية التي تريدها",
        image: "images/ازال لايف.jpg",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.0011, // 5 سنت للعملة
        minQuantity: 1000,
        maxQuantity: 1000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 212,
        name: "جيمي لايف",
        category: "app",
        description: "عملات جيمي لايف : ادخل الكمية التي تريدها",
        image: "images/جيمي لايف.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00018, // 5 سنت للعملة
        minQuantity: 1000,
        maxQuantity: 5000000, 
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 213,
        name: "ميكو لايف",
        category: "app",
        description: "عملات ميكو لايف : ادخل الكمية التي تريدها",
        image: "images/ميكو لايف.jpg",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00199, // 5 سنت للعملة
        minQuantity: 1000,
        maxQuantity: 4500000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 214,
        name: "واهو لايف",
        category: "app",
        description: "عملات واهو لايف : ادخل الكمية التي تريدها",
        image: "images/واهو لايف.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00017, // 5 سنت للعملة
        minQuantity: 10000,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 215,
        name: "توب توب شات",
        category: "app",
        description: "عملات توب توب شات : ادخل الكمية التي تريدها",
        image: "images/توب توب شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00012, // 5 سنت للعملة
        minQuantity: 10000,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 216,
        name: "بوبو لايف",
        category: "app",
        description: "عملات بوبو لايف : ادخل الكمية التي تريدها",
        image: "images/بوبو لايف.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00015, // 5 سنت للعملة
        minQuantity: 15000,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 217,
        name: "بينمو شات",
        category: "app",
        description: "عملات بينمو شات : ادخل الكمية التي تريدها",
        image: "images/بينمو شات.jpg",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00072, // 5 سنت للعملة
        minQuantity: 3000,
        maxQuantity: 2000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 218,
        name: "يووي شات",
        category: "app",
        description: "عملات يووي شات : ادخل الكمية التي تريدها",
        image: "images/يووي شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00015, // 5 سنت للعملة
        minQuantity: 10000,
        maxQuantity: 500000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 219,
        name: "لاما شات",
        category: "app",
        description: "عملات سول ستار: ادخل الكمية التي تريدها",
        image: "images/لاما شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.0004, // 5 سنت للعملة
        minQuantity: 5000,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 220,
        name: "ويجو بارتي",
        category: "app",
        description: "عملات لاما شات : ادخل الكمية التي تريدها",
        image: "images/ويغو بارتي.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00013, // 5 سنت للعملة
        minQuantity: 10000,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 221,
        name: "هوبي شات",
        category: "app",
        description: "عملات هوبي شات : ادخل الكمية التي تريدها",
        image: "images/هوبي شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00012, // 5 سنت للعملة
        minQuantity: 5000,
        maxQuantity: 800000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 222,
        name: "اولاميت",
        category: "app",
        description: "عملات اولاميت: ادخل الكمية التي تريدها",
        image: "images/اولاميت.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.000185, // 5 سنت للعملة
        minQuantity: 8000,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 223,
        name: "تادا شات",
        category: "app",
        description: "عملات تادا شات : ادخل الكمية التي تريدها",
        image: "images/تادا شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00019, // 5 سنت للعملة
        minQuantity: 10000,
        maxQuantity: 4000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 224,
        name: "هوا شات",
        category: "app",
        description: "عملات هوا شات : ادخل الكمية التي تريدها",
        image: "images/هوا شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.0016, // 5 سنت للعملة
        minQuantity: 1000,
        maxQuantity: 500000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 225,
        name: "سو ماتش",
        category: "app",
        description: "عملات سو ماتش : ادخل الكمية التي تريدها",
        image: "images/سو ماتش.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00017, // 5 سنت للعملة
        minQuantity: 10000,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 226,
        name: "هابي شات",
        category: "app",
        description: "عملات سول ستار: ادخل الكمية التي تريدها",
        image: "images/هابي شات.jpg",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00015, // 5 سنت للعملة
        minQuantity: 10000,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 227,
        name: "تامي شات",
        category: "app",
        description: "عملات هابي شات : ادخل الكمية التي تريدها",
        image: "images/تامي شات.jpg",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.0001, // 5 سنت للعملة
        minQuantity: 10000,
        maxQuantity: 2000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 228,
        name: "يو بارتي",
        category: "app",
        description: "عملات يو بارتي : ادخل الكمية التي تريدها",
        image: "images/يو بارتي.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00024, // 5 سنت للعملة
        minQuantity: 5000,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 229,
        name: "ديمو شات",
        category: "app",
        description: "عملات ديمو شات : ادخل الكمية التي تريدها",
        image: "images/ديمو شات.jpg",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.0011, // 5 سنت للعملة
        minQuantity: 1000,
        maxQuantity: 500000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 230,
        name: "واكي ستار",
        category: "app",
        description: "عملات واكي ستار : ادخل الكمية التي تريدها",
        image: "images/واكي ستار.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.000001, // 5 سنت للعملة
        minQuantity: 1000000,
        maxQuantity: 500000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 231,
        name: "كيتي لايف",
        category: "app",
        description: "عملات كيتي لايف : ادخل الكمية التي تريدها",
        image: "images/كيتي لايف.jpg",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00099, // ا
        minQuantity: 1400,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 232,
        name: "جانكو شات",
        category: "app",
        description: "عملات جانكو شات : ادخل الكمية التي تريدها",
        image: "images/جانكو شات.png",
        inputLabel: "غير متوفر حاليا",
        unitPrice: 0, // غير متوفر
        minQuantity: 10000,
        maxQuantity: 4000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 233,
        name: "ليلى شات",
        category: "app",
        description: "عملات ليلى شات : ادخل الكمية التي تريدها",
        image: "images/ليلى شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00027, // 5 سنت للعملة
        minQuantity: 10000,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 234,
        name: "ايمو",
        category: "app",
        description: "عملات ايمو: ادخل الكمية التي تريدها",
        image: "images/ايمو.png",
        inputLabel: "غير متوفر حاليا",
        unitPrice: 0, // غير متوفر
        minQuantity: 10000,
        maxQuantity: 4000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 235,
        name: "ليونس شات",
        category: "app",
        description: "عملات ليونس شات : ادخل الكمية التي تريدها",
        image: "images/ليونس شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00015, // 5 سنت للعملة
        minQuantity: 1000,
        maxQuantity: 1000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 236,
        name: "بيلا شات",
        category: "app",
        description: "عملات بيلا شات : ادخل الكمية التي تريدها",
        image: "images/بيلا شات.jpg",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00111, // 5 سنت للعملة
        minQuantity: 1000,
        maxQuantity: 500000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 237,
        name: "حكي شات",
        category: "app",
        description: "عملات حكي شات : ادخل الكمية التي تريدها",
        image: "images/حكي شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00099, // 5 سنت للعملة
        minQuantity: 1000,
        maxQuantity: 500000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 238,
        name: "هوني جار",
        category: "app",
        description: "عملات هوني جار : ادخل الكمية التي تريدها",
        image: "images/هوني جار.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.0092, // 5 سنت للعملة
        minQuantity: 200,
        maxQuantity: 50000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 239,
        name: "اوهلا شات",
        category: "app",
        description: "عملات اوهلا شات : ادخل الكمية التي تريدها",
        image: "images/اوهلا شات.jpg",
        inputLabel: "غير متوفر حاليا",
        unitPrice: 0, // غير متوفر 
        minQuantity: 10000,
        maxQuantity: 4000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 240,
        name: "هيجو لايف",
        category: "app",
        description: "عملات هيجو لايف : ادخل الكمية التي تريدها",
        image: "images/هيجو لايف.png",
        inputLabel: "غير متوفر حاليا",
        unitPrice: 0, // غير متوفر
        minQuantity: 10000,
        maxQuantity: 4000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 241,
        name: "زينا لايف",
        category: "app",
        description: "عملات زينا لايف : ادخل الكمية التي تريدها",
        image: "images/زينا لايف.jpg",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00014, // 5 سنت للعملة
        minQuantity: 10000,
        maxQuantity: 10000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 242,
        name: "ميجو لايف",
        category: "app",
        description: "عملات ميجو لايف : ادخل الكمية التي تريدها",
        image: "images/ميجو لايف.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00015, // 5 سنت للعملة
        minQuantity: 10000,
        maxQuantity: 10000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 243,
        name: "فانسي لايف",
        category: "app",
        description: "عملات فانسي لايف : ادخل الكمية التي تريدها",
        image: "images/فانسي لايف.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.000091, // 5 سنت للعملة
        minQuantity: 15000,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 244,
        name: "سوغو شات",
        category: "app",
        description: "عملات سوغو شات : ادخل الكمية التي تريدها",
        image: "images/سوغو شات.jpg",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00018, // 5 سنت للعملة
        minQuantity: 10000,
        maxQuantity: 500000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 245,
        name: "ليت شات",
        category: "app",
        description: "عملات ليت شات : ادخل الكمية التي تريدها",
        image: "images/ليث شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.0011, // 5 سنت للعملة
        minQuantity: 5000,
        maxQuantity: 10000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 246,
        name: "سوبر لايف",
        category: "app",
        description: "عملات سوبر لايف : ادخل الكمية التي تريدها",
        image: "images/سوبر لايف.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.0085, // 5 سنت للعملة
        minQuantity: 200,
        maxQuantity: 500000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 247,
        name: "روستار شات",
        category: "app",
        description: "عملات روستار شات : ادخل الكمية التي تريدها",
        image: "images/روستار شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00021, // 5 سنت للعملة
        minQuantity: 5000,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 248,
        name: "مي يو شات",
        category: "app",
        description: "عملات مي يو شات : ادخل الكمية التي تريدها",
        image: "images/مي يو شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.012, // 5 سنت للعملةبيسااااااااااااااااااااااااااااااااااااااااااااااااااااااااااااااااااااااااااااااااااااااااااااااااااااااااااااا
        minQuantity: 490,
        maxQuantity: 19600,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 249,
        name: "يا اهلن شات",
        category: "app",
        description: "عملات يا اهلن شات : ادخل الكمية التي تريدها",
        image: "images/يا اهلن شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.002, // 5 سنت للعملة
        minQuantity: 1000,
        maxQuantity: 500000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 250,
        name: "سول شات",
        category: "app",
        description: "عملات سول شات : ادخل الكمية التي تريدها",
        image: "images/سول شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00019, // 5 سنت للعملة
        minQuantity: 5000,
        maxQuantity: 1000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 251,
        name: "ديتو شات",
        category: "app",
        description: "عملات ديتو شات : ادخل الكمية التي تريدها",
        image: "images/ديتو شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00031, // 5 سنت للعملة
        minQuantity: 10000,
        maxQuantity: 500000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 252,
        name: "شاميت لايف",
        category: "app",
        description: "عملات شاميت لايف : ادخل الكمية التي تريدها",
        image: "images/شاميت لايف.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.000199, // 5 سنت للعملة
        minQuantity: 15000,
        maxQuantity: 1000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 253,
        name: "صبا شات",
        category: "app",
        description: "عملات صبا شات : ادخل الكمية التي تريدها",
        image: "images/صبا شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.000161, // 5 سنت للعملة
        minQuantity: 5000,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 254,
        name: "هيا شات",
        category: "app",
        description: "عملات هيا شات : ادخل الكمية التي تريدها",
        image: "images/هيا شات.jpg",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00135, // 5 سنت للعملة
        minQuantity: 1000,
        maxQuantity: 1000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 255,
        name: "اب لايف",
        category: "app",
        description: "عملات اب لايف : ادخل الكمية التي تريدها",
        image: "images/اب لايف.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.01832, // 5 سنت للعملة
        minQuantity: 100,
        maxQuantity: 150000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 256,
        name: "سلام شات",
        category: "app",
        description: "عملات سلام شات : ادخل الكمية التي تريدها",
        image: "images/سلام شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.0000154, // 5 سنت للعملة
        minQuantity: 10000,
        maxQuantity: 500000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 257,
        name: "الو شات",
        category: "app",
        description: "عملات الو شات : ادخل الكمية التي تريدها",
        image: "images/الو شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.0000999, // 5 سنت للعملة
        minQuantity: 10000,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 258,
        name: "تالك تالك",
        category: "app",
        description: "عملات تالك تالك : ادخل الكمية التي تريدها",
        image: "images/تالك تالك.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00092, // 5 سنت للعملة
        minQuantity: 1000,
        maxQuantity: 500000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 259,
        name: "بارتي ستار",
        category: "app",
        description: "عملات بارتي ستار: ادخل الكمية التي تريدها",
        image: "images/بارتي ستار.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.0013, // 5 سنت للعملة
        minQuantity: 1000,
        maxQuantity: 1000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 260,
        name: "بوتا لايف",
        category: "app",
        description: "عملات بوتا لايف : ادخل الكمية التي تريدها",
        image: "images/بوتا لايف.jpg",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.000031, // 5 سنت للعملة
        minQuantity: 40000,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 261,
        name: "فن اب",
        category: "app",
        description: "عملات فن اب : ادخل الكمية التي تريدها",
        image: "images/فن اب.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00013, // 5 سنت للعملة
        minQuantity: 8000,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 262,
        name: "فوكا شات",
        category: "app",
        description: "عملات فوكا شات : ادخل الكمية التي تريدها",
        image: "images/فوكا شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00014, // 5 سنت للعملة
        minQuantity: 10000,
        maxQuantity: 1000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 263,
        name: "كلوز شات",
        category: "app",
        description: "عملات كلوز شات : ادخل الكمية التي تريدها",
        image: "images/كلوز شات.jpg",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00098, // 5 سنت للعملة
        minQuantity: 1000,
        maxQuantity: 1000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 264,
        name: "اصوات شات",
        category: "app",
        description: "عملات اصوات شات : ادخل الكمية التي تريدها",
        image: "images/اصوات شات.png",
        inputLabel: "غير متوفر حاليا",
        unitPrice: 0, // غير متوفر
        minQuantity: 10000,
        maxQuantity: 4000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 265,
        name: "هوكي لايف",
        category: "app",
        description: "عملات هوكي لايف : ادخل الكمية التي تريدها",
        image: "images/هوكي لايف.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00015, // 5 سنت للعملة
        minQuantity: 20000,
        maxQuantity: 2000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 266,
        name: "سايا شات",
        category: "app",
        description: "عملات سايا شات : ادخل الكمية التي تريدها",
        image: "images/سايا شات.jpg",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.000442, // 5 سنت للعملة
        minQuantity: 1500,
        maxQuantity: 1000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 267,
        name: "يوكي شات",
        category: "app",
        description: "عملات يوكي شات : ادخل الكمية التي تريدها",
        image: "images/يوكي شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.000085, // 5 سنت للعملة
        minQuantity: 20000,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 268,
        name: "هوبي ستار",
        category: "app",
        description: "عملات هوبي ستار : ادخل الكمية التي تريدها",
        image: "images/هوبي ستار.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00000099, // 5 سنت للعملة
        minQuantity: 500000,
        maxQuantity: 50000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 269,
        name: "ون ار شات",
        category: "app",
        description: "عملات ون ار شات : ادخل الكمية التي تريدها",
        image: "images/ون ار شات.png",
        inputLabel: "غير متوفر حاليا",
        unitPrice: 0, // غير متوفر
        minQuantity: 10000,
        maxQuantity: 4000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 270,
        name: "اور تالك شات",
        category: "app",
        description: "عملات اور تالك شات : ادخل الكمية التي تريدها",
        image: "images/اور تالك شات.jpg",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.000029, // 5 سنت للعملة
        minQuantity: 33000,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 271,
        name: "دولي لايف",
        category: "app",
        description: "عملات دولي لايف: ادخل الكمية التي تريدها",
        image: "images/دولي لايف.jpg",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.000099, // 5 سنت للعملة
        minQuantity: 10000,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 272,
        name: "مومو لايف",
        category: "app",
        description: "عملات موم لايف : ادخل الكمية التي تريدها",
        image: "images/مومو لايف.jpg",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.000089, // 5 سنت للعملة
        minQuantity: 20000,
        maxQuantity: 500000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 273,
        name: "نادي ستار",
        category: "app",
        description: "عملات نادي ستار : ادخل الكمية التي تريدها",
        image: "images/نادي ستار.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.000051, // 5 سنت للعملة
        minQuantity: 22000,
        maxQuantity: 1000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 274,
        name: "تاكا لايف",
        category: "app",
        description: "عملات تاكا لايف : ادخل الكمية التي تريدها",
        image: "images/تاكا لايف.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00013, // 5 سنت للعملة
        minQuantity: 10000,
        maxQuantity: 500000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 275,
        name: "ايومي شات",
        category: "app",
        description: "عملات ايومي شات : ادخل الكمية التي تريدها",
        image: "images/ايومي شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00115, // 5 سنت للعملة
        minQuantity: 1000,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 276,
        name: "واوو شات",
        category: "app",
        description: "عملات واوو شات : ادخل الكمية التي تريدها",
        image: "images/واوو شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00035, // 5 سنت للعملة
        minQuantity: 25000,
        maxQuantity: 1000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 277,
        name: "تانغو لايف",
        category: "app",
        description: "عملات تانغو لايف : ادخل الكمية التي تريدها",
        image: "images/تانغو لايف.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00582, // 5 سنت للعملة
        minQuantity: 200,
        maxQuantity: 100000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 278,
        name: "اموو شات",
        category: "app",
        description: "عملات اموو شات : ادخل الكمية التي تريدها",
        image: "images/امو شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00007, // 5 سنت للعملة
        minQuantity: 10000,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 279,
        name: "هارت لايف",
        category: "app",
        description: "عملات هارت لايف : ادخل الكمية التي تريدها",
        image: "images/هارت لايف.jpg",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.0000985, // 5 سنت للعملة
        minQuantity: 12000,
        maxQuantity: 10000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 280,
        name: "ويل شيل شات",
        category: "app",
        description: "عملات ويل شيل شات : ادخل الكمية التي تريدها",
        image: "images/ويل شيل شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.0000911, // 5 سنت للعملة
        minQuantity: 12000,
        maxQuantity: 10000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 281,
        name: "هلا مي",
        category: "app",
        description: "عملات هلا مي : ادخل الكمية التي تريدها",
        image: "images/هلا مي.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.000091, // 5 سنت للعملة
        minQuantity: 2500,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 282,
        name: "اشا لايف",
        category: "app",
        description: "عملات اشا لايف: ادخل الكمية التي تريدها",
        image: "images/اشا لايف.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.000153, // 5 سنت للعملة
        minQuantity: 10000,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 283,
        name: "وياك شات",
        category: "app",
        description: "عملات وياك لايف : ادخل الكمية التي تريدها",
        image: "images/وياك شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00000265, // 5 سنت للعملة
        minQuantity: 500000,
        maxQuantity: 100000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 284,
        name: "فوفو شات",
        category: "app",
        description: "عملات فوفو شات : ادخل الكمية التي تريدها",
        image: "images/فوفو شات.jpg",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00000961, // 5 سنت للعملة
        minQuantity: 150000,
        maxQuantity: 50000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 285,
        name: "سويو شات",
        category: "app",
        description: "عملات سويو شات : ادخل الكمية التي تريدها",
        image: "images/سويو شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.000941, // 5 سنت للعملة
        minQuantity: 1000,
        maxQuantity: 500000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 286,
        name: "سما شات",
        category: "app",
        description: "عملات سما شات : ادخل الكمية التي تريدها",
        image: "images/سما شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.000131, // 5 سنت للعملة
        minQuantity: 8500,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 287,
        name: "كيو لايف",
        category: "app",
        description: "عملات كيو لايف : ادخل الكمية التي تريدها",
        image: "images/كيو لايف.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.000382, // 5 سنت للعملة
        minQuantity: 2500,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 288,
        name: "ديكا شات",
        category: "app",
        description: "عملات ديكا شات : ادخل الكمية التي تريدها",
        image: "images/ديكا شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.000019, // 5 سنت للعملة
        minQuantity: 60000,
        maxQuantity: 2000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 289,
        name: "كواي",
        category: "app",
        description: "عملات كواي : ادخل الكمية التي تريدها",
        image: "images/كواي.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.0124, // 5 سنت للعملة
        minQuantity: 200,
        maxQuantity: 10000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 290,
        name: "سهرة شات",
        category: "app",
        description: "عملات سهرة شات : ادخل الكمية التي تريدها",
        image: "images/سهرة شات.jpg",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00081, // 5 سنت للعملة
        minQuantity: 1500,
        maxQuantity: 5000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 291,
        name: "عمار شات",
        category: "app",
        description: "عملات عمار شات : ادخل الكمية التي تريدها",
        image: "images/عمار شات.jpg",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.00091, // 5 سنت للعملة
        minQuantity: 2000,
        maxQuantity: 200000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 292,
        name: "4 بارتي شات",
        category: "app",
        description: "عملات 4 بارتي شات : ادخل الكمية التي تريدها",
        image: "images/4 بارتي شات.png",
        inputLabel: "رقم اللاعب (User ID)",
        unitPrice: 0.0000915, // 5 سنت للعملة
        minQuantity: 8500,
        maxQuantity: 1000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 293,
        name: "نحكي شات",
        category: "app",
        description: "عملات نحكي شات: ادخل الكمية التي تريدها",
        image: "images/نحكي شات.png",
        inputLabel: "غير متوفر حاليا",
        unitPrice: 0, // غير متوفر
        minQuantity: 10000,
        maxQuantity: 4000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 294,
        name: "يوهو ستار",
        category: "app",
        description: "عملات يوهو ستار : ادخل الكمية التي تريدها",
        image: "images/يوهو ستار.jpg",
        inputLabel: "غير متوفر حاليا",
        unitPrice: 0, // غير متوفر
        minQuantity: 10000,
        maxQuantity: 4000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
    {
        id: 295,
        name: "هالا شات",
        category: "app",
        description: "عملات هالا شات : ادخل الكمية التي تريدها",
        image: "images/هالا شات.png",
        inputLabel: "غير متوفر حاليا",
        unitPrice: 0, // غير متوفر
        minQuantity: 10000,
        maxQuantity: 4000000,
        inputPlaceholder: "أدخل رقم اللاعب الخاص بك"
    },
];
