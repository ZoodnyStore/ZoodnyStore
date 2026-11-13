/* ══════════════════════════════════════════════════════════════════════
 * المنصات والتصنيفات وفئات الرصيد
 * ══════════════════════════════════════════════════════════════════════ */

// بيانات المنصات (لخدمات السوشيال ميديا)
const platforms = [
    { id: "instagram", name: "إنستغرام", icon: "fab fa-instagram", color: "#E1306C" },
    { id: "facebook", name: "فيسبوك", icon: "fab fa-facebook", color: "#1877F2" },
    { id: "tiktok", name: "تيك توك", icon: "fab fa-tiktok", color: "#000000" },
    { id: "youtube", name: "يوتيوب", icon: "fab fa-youtube", color: "#FF0000" },
    { id: "twitter", name: "تويتر", icon: "fab fa-twitter", color: "#1DA1F2" },
    { id: "snapchat", name: "سناب شات", icon: "fab fa-snapchat", color: "#FFFC00" },
    { id: "telegram", name: "تليغرام", icon: "fab fa-telegram", color: "#26A5E4" }
];

// بيانات التصنيفات
const categories = [
    {
        id: "العروض",
        name: "العروض",
        description: "افضل العروض",
        image: "images/عروض خاصة.png",
        count: 0
    },
    {
        id: "social-media",
        name: "خدمات سوشال ميديا",
        description: "متابعين , لايكات , مشاهدات , شيرات",
        image: "images/خدمات السوشال ميديا.png",
        count: 24
    },
    {
        id: "chat",
        name: "الذكاء الاصطناعي",
        description: "Chat GPT , Gemini ",
        image: "images/الذكاء الاصطناعي.png",
        count: 6
    },
    {
        id: "برامج التصميم",
        name: "اشتراكات برامج التصميم",
        description: "كانفا برو , كاب كات , بيكس آرت ... وغيرها",
        image: "images/برامج التصميم.png",
        count: 12
    },
    {
        id: "games",
        name: "شحن ألعاب",
        description: "جميع الالعاب",
        image: "images/شحن العاب 1.png",
        count: gamesData.length // عدد الألعاب تلقائياً
    },
    {
        id: "app",
        name: "شحن التطبيقات",
        description: "شحن لكافة التطبيقات",
        image: "images/شحن التطبيقات.png",
        count: appsData.length // عدد التطبيقات تلقائياً
    },
    {
        id: "rased",
        name: "رصيد الموبايل",
        description: "سيرياتيل , MTN",
        image: "images/شحن رصيد.png",
        count: 2     
    },
    {
        id: "arqam",
        name: "أرقام واتساب وتليغرام مكفولة",
        description: "بلدان متعددة",
        image: "images/أرقام واتساب وتليغرام.png",
        count: 12
    },
    {
        id: "arqam arbeh",
        name: "أرقام واتساب عربية",
        description: "بلدان متعددة",
        image: "images/أرقام واتساب عربية.png",
        count: 12        
    },
    {
        id: "ارقام للتطبيقات",
        name: "أرقام لتفعيل كافة التطبيقات",
        description: "كافة التطبيقات",
        image: "images/أرقام لتفعيل التطبيقات.png",
        count: 47           
    },
    {
        id: "اشتراكات التلفاز",
        name: "اشتراكات التلفاز",
        description: "شاهد , نيتفليكس ... وغيرها",
        image: "images/اشتراكات التلفاز.png",
        count: 6       
    },
    {
        id: "تفعيلات بريميوم",
        name: "تفعيلات بريميوم - البلس",
        description: "تليغرام مميز , يوتيوب بريميوم , سناب شات بلس ... وغيرها",
        image: "images/تفعيلات البريميوم.png",
        count: 20         
    },
    {
        id: "اشتراكات VPN",
        name: "اشتراكات VPN",
        description: "بروتون , اكسبريس , جير اب بوستر ... وغيرها",
        image: "images/تفعيلات في بي ان.png",
        count: 29         
    },
    {
        id: "الدفع الالكتروني",
        name: "الدفع الالكتروني",
        description: "فيزا كارد , ستيم , ايتونز .... وغيرها",
        image: "images/الدفع الالكتروني.png",
        count: 58        
    },
    {
        id: "الحسابات",
        name: "الحسابات",
        description: "جيميل , آبل آيدي ... وغيرها",
        image: "images/الحسابات.png",
        count: 5      
    }
];

// بيانات فئات الرصيد والأسعار لكل شركة على حدة
const creditAmounts = {
    syriatel: [
        { value: 62.50, price: 0.80 },
        { value: 72.11, price: 0.95 },
        { value: 81.73, price: 1.10 },
        { value: 86.53, price: 1.20 },
        { value: 96.15, price: 1.35 },
        { value: 100.96, price: 1.45 },
        { value: 105.76, price: 1.55 },
        { value: 115.38, price: 1.80 },
        { value: 125, price: 2.20 },
        { value: 144.23, price: 2.50 },
        { value: 211.53, price: 3.10 },
        { value: 288.46, price: 3.60 },
        { value: 370.19, price: 4 },
        { value: 480.76, price: 5.20 },
        { value: 576.92, price: 6.10 },
        { value: 769.23, price: 8 },
        { value: 951.92, price: 10.20 },
    ],
    mtn: [
        { value: 50, price: 0.65 },
        { value: 60, price: 0.80 },
        { value: 70, price: 0.90 },
        { value: 85, price: 1 },
        { value: 90, price: 1.20 },
        { value: 100, price: 1.30 },
        { value: 110, price: 1.40 },
        { value: 150, price: 1.65 },
        { value: 170, price: 1.80 },
        { value: 200, price: 2.10 },
        { value: 230, price: 2.45 },
        { value: 260, price: 2.70 },
        { value: 280, price: 3 },
        { value: 300, price: 3.20 },
        { value: 340, price: 3.50 },
        { value: 360, price: 3.70 },
        { value: 420, price: 4.40 },
        { value: 480, price: 5.10 },
        { value: 500, price: 5.30 },
        { value: 600, price: 6.20 },
        { value: 750, price: 7.70 },
        { value: 1000, price: 10.60 },
        { value: 1500, price: 15.40 },
        { value: 2500, price: 25.10 },
        { value: 3000, price: 31 },
        { value: 3500, price: 36 },
        { value: 4500, price: 45.50 },
        { value: 5000, price: 51 },
    ]
};

// مفتاح ImgBB API
const IMGBB_API_KEY = "31321101ec3bd35ce08d26a9a01d40b1";
