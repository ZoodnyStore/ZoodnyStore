/* ══════════════════════════════════════════════════════════════════════
 * بيانات شحن الألعاب (gamesData)
 * الصور توضع داخل مجلد images.
 * ══════════════════════════════════════════════════════════════════════ */

// ==================== بيانات الألعاب الذكية (سهلة التعديل) ====================
const gamesData = [
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║   🎮 دليل إضافة الألعاب والمنتجات — اقرأ هذا قبل التعديل                 ║
// ╠══════════════════════════════════════════════════════════════════════════════╣
// ║                                                                              ║
// ║  📌 لإضافة لعبة جديدة (كرت خارجي مستقل):                                  ║
// ║     انسخ الكتلة التالية وعدّل قيمها وضعها هنا:                             ║
// ║                                                                              ║
// ║  {                                                                           ║
// ║    id: 999,               ← رقم فريد (اختر أي رقم غير مستخدم)             ║
// ║    name: "اسم اللعبة",   ← اسم اللعبة بدون " - " (سيظهر كعنوان الكرت)   ║
// ║    category: "games",     ← لا تغيّر هذا                                  ║
// ║    description: "وصف",   ← يظهر في نافذة تفاصيل المنتج                    ║
// ║    image: "صورة.jpg",    ← اسم ملف الصورة (ضعه داخل مجلد images)     ║
// ║    inputLabel: "رقم اللاعب (User ID)",                                      ║
// ║    amounts: [                                                                ║
// ║      { value: 100, price: 2.50, display: "100 جوهرة" },                    ║
// ║      { value: 500, price: 10.00, display: "500 جوهرة" },                   ║
// ║    ]                                                                         ║
// ║  },                                                                          ║
// ║                                                                              ║
// ║  📌 لإضافة منتج داخل لعبة موجودة (يُضاف للكرت الخارجي تلقائياً):          ║
// ║     استخدم نفس اسم اللعبة قبل " - " ثم اكتب نوع المنتج:                   ║
// ║     name: "بلياردو 8 - كوينز"   ← موجود                                   ║
// ║     name: "بلياردو 8 - ذهب"     ← جديد، سيُضاف للكرت الخارجي تلقائياً   ║
// ║                                                                              ║
// ║  📌 لتغيير صورة لعبة:                                                      ║
// ║     عدّل قيمة image في أول منتج من مجموعة اللعبة                           ║
// ║     مثال: image: "صورة_جديدة.jpg"                                          ║
// ║                                                                              ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
    {
        id: 75,
        name: "ببجي - UC",
        category: "games",
        description: "شدات ببجي - UC : اختر الكمية التي تريدها",
        image: "images/ببجي.png",
        inputLabel: "رقم اللاعب (User ID)", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 60, price: 1.25, display: "60 شدة" },
            { value: 325, price: 5.50, display: "325 شدة" },
            { value: 660, price: 10, display: "660 شدة" },
            { value: 1800, price: 26, display: "1800 شدة" },
            { value: 3850, price: 50, display: "3850 شدة" },
            { value: 8100, price: 94, display: "8100 شدة" }
        ]
    },
    {
        id: 76,
        name: "فري فاير - جواهر",
        category: "games",
        description: "جواهر فري فاير : اختر الكمية التي تريدها",
        image: "images/فري فاير.png",
        inputLabel: "رقم اللاعب (User ID)", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 110, price: 1.25, display: "110 جوهرة" },
            { value: 210 + 21, price: 2.50, display: "210 + 21 جوهرة" },
            { value: 520 + 52, price: 5.50, display: "520 + 52 جوهرة" },
            { value: 1060 + 106, price: 11, display: "1060 + 106 جوهرة" },
            { value: 2180 + 218, price: 23, display: "2180 + 218 جوهرة" },
        ]
    },
    {
        id: 77,
        name: "جواكر - عملات",
        category: "games",
        description: "عملات جواكر : اختر الكمية التي تريدها",
        image: "images/جواكر.png",
        inputLabel: "رقم اللاعب (User ID)", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 10000, price: 1.50, display: "10000 عملة" },
            { value: 25000, price: 3.50, display: "25000 عملة" },
            { value: 50000, price: 6.60, display: "50000 عملة" },
            { value: 100000, price: 12.60, display: "100000 عملة" },
            { value: 150000, price: 17.40, display: "150000 عملة" },
            { value: 200000, price: 24.20, display: "200000 عملة" },
            { value: 250000, price: 30.50, display: "250000 عملة" },
            { value: 350000, price: 43, display: "350000 عملة" },
            { value: 500000, price: 61, display: "500000 عملة" },
            { value: 750000, price: 92, display: "750000 عملة" },
            { value: 1000000, price: 125, display: "1000000 عملة" },
        ]
    },
    {
        id: 78,
        name: "انتقام السلاطين - العملة السلطانية",
        category: "games",
        description: "العملة السلطانية : اختر الفئة التي تريدها",
        image: "images/انتقام السلاطين.png",
        inputLabel: "رقم اللاعب (User ID)", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 20, price: 2.30, display: "20 عملة" },
            { value: 30, price: 3.20, display: "30 عملة" },
            { value: 50, price: 6.40, display: "50 عملة" },
            { value: 100, price: 10.30, display: "100 عملة" },
            { value: 500, price: 49, display: "500 عملة" },
            { value: 1000, price: 96, display: "1000 عملة" },
        ]
    },
    {
        id: 79,
        name: "كلاش اوف كلانس - جواهر",
        category: "games",
        description: "جواهر كلاش اوف كلانس : اختر الفئة التي تريدها",
        image: "images/كلاش اوف كلانس.png",
        inputLabel: "أدخل ايميل سوبر سيل", // ✅ نص مخصص لكلاش اوف كلانس
        amounts: [
            { value: 80, price: 1.50, display: "80 جوهرة" },
            { value: 500, price: 6.40, display: "500 جوهرة" },
            { value: 1200, price: 11.70, display: "1200 جوهرة" },
            { value: 1850, price: 17.60, display: "1850 جوهرة" },
            { value: 2500, price: 24.30, display: "2500 جوهرة" },
            { value: 6500, price: 58, display: "6500 جوهرة" }
        ]
    },
    {
        id: 80,
        name: "كلاش رويال - جواهر",
        category: "games",
        description: "كلاش رويال - جواهر : اختر الفئة التي تريدها",
        image: "images/كلاش رويال.png",
        inputLabel: "ادخل ايميل سوبر سيل", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 80, price: 1.25, display: "80 جوهرة" },
            { value: 500, price: 6.40, display: "500 جوهرة" },
            { value: 1200, price: 11.70, display: "1200 جوهرة" },
            { value: 2500, price: 24.30, display: "2500 جوهرة" },
            { value: 6500, price: 58, display: "6500 جوهرة" },
        ]
    },
    {
        id: 81,
        name: "ديلتا فورس - CP",
        category: "games",
        description: "ديلتا فورس العالمية - CP : اختر الفئة التي تريدها",
        image: "images/ديلتا فورس.png",
        inputLabel: "رقم اللاعب (User ID)", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 60, price: 1.25, display: "60 عملة" },
            { value: 320, price: 4.85, display: "320 عملة" },
            { value: 750, price: 9, display: "750 عملة" },
            { value: 1480, price: 18, display: "1480 عملة" },
            { value: 1980, price: 23, display: "1980 عملة" }
        ]
    },
    {
        id: 82,
        name: "فورتنايت - كود",
        category: "games",
        description: "فورتنايت - كود : اختر الفئة التي تريدها",
        image: "images/فورتنايت.png",
        inputLabel: "رقم اللاعب (User ID)", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 2800, price: 27.50, display: "2800 كود" },
            { value: 5000, price: 45, display: "5000 كود" },
            { value: 13500, price: 110, display: "13500 كود" },
        ]
    },
    {
        id: 900,
        name: "بلود سترايك - عالمية",
        category: "games",
        description: "بلود سترايك - عالمية : اختر الفئة التي تريدها",
        image: "images/بلود سترايك.png",
        inputLabel: "رقم اللاعب (User ID)", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 51, price: 0.60, display: "51 ذهب" },
            { value: 105, price: 1.20, display: "105 ذهب" },
            { value: 320, price: 2.75, display: "320 ذهب" },
            { value: 540, price: 4.30, display: "540 ذهب" },
            { value: 1100, price: 8.10, display: "1100 ذهب" },
            { value: 2260, price: 16, display: "2260 ذهب" },
        ]
    },
    {
        id: 901,
        name: "بلود سترايك - مينا",
        category: "games",
        description: "بلود سترايك - مينا : اختر الفئة التي تريدها",
        image: "images/بلود سترايك.png",
        inputLabel: "رقم اللاعب (User ID)", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 51, price: 0.70, display: "51 ذهب" },
            { value: 105, price: 1.35, display: "105 ذهب" },
            { value: 320, price: 2.90, display: "320 ذهب" },
            { value: 540, price: 4.50, display: "540 ذهب" },
            { value: 1100, price: 8.30, display: "1100 ذهب" },
            { value: 2260, price: 16.70, display: "2260 ذهب" },
            { value: 5800, price: 40, display: "5800 ذهب" },
        ]
    },
    {
        id: 902,
        name: "النجاة في الصقيع",
        category: "games",
        description: "النجاة في الصقيع : اختر الفئة التي تريدها",
        image: "images/النجاة في الصقيع.png",
        inputLabel: "رقم اللاعب (User ID)", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 99, price: 1.70, display: "99 جوهرة" },
            { value: 299, price: 4.10, display: "299 جوهرة" },
            { value: 499, price: 6.40, display: "499 جوهرة" },
            { value: 999, price: 12.50, display: "999 جوهرة" },
            { value: 1999, price: 25, display: "1999 جوهرة" },
            { value: 4999, price: 61, display: "4999 جوهرة" }
        ]
    },
    {
        id: 903,
        name: "بلياردو 8 - كوينز",
        category: "games",
        description: "دبلياردو 8 : اختر الفئة التي تريدها",
        image: "images/بلياردو.png",
        inputLabel: "رقم اللاعب (User ID)", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 20000, price: 0.60, display: "20,000 كوينز" },
            { value: 52000, price: 1.20, display: "52,000 كوينز" },
            { value: 112000, price: 2.15, display: "112,000 كوينز" },
            { value: 256000, price: 3.90, display: "256,000 كوينز" },
            { value: 800000, price: 8.90, display: "800,000 كوينز" },
            { value: 2000000, price: 19.20, display: "2 مليون كوينز" }
        ]
    },
    {
        id: 904,
        name: "بلياردو 8 - شدات",
        category: "games",
        description: "بلياردو 8 : اختر الفئة التي تريدها",
        image: "images/بلياردو.png",
        inputLabel: "رقم اللاعب (User ID)", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 20, price: 0.65, display: "20 شدة" },
            { value: 50, price: 1.30, display: "50 شدة" },
            { value: 100, price: 2.20, display: "100 شدة" },
            { value: 250, price: 4, display: "250 شدة" },
            { value: 800, price: 8.95, display: "800 شدة" },
            { value: 2000, price: 20, display: "2000 شدة" }
        ]
    },
    {
        id: 905,
        name: "بلياردو 8 - عضويات",
        category: "games",
        description: "بلياردو 8 : اختر الفئة التي تريدها",
        image: "images/بلياردو.png",
        inputLabel: "رقم اللاعب (User ID)", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 1, price: 8, display: "تصريح مميز" },
            { value: 2, price: 15.50, display: "تصريح النخبة" }
        ]
    },
    {
        id: 906,
        name: "نداء الحرب 3",
        category: "games",
        description: "نداء الحرب : اختر الفئة التي تريدها",
        image: "images/نداء الحرب.png",
        inputLabel: "رقم اللاعب (User ID)", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 500, price: 5.75, display: "500 عملة" },
            { value: 1000, price: 10.70, display: "1,000 عملة" },
            { value: 2000, price: 21.50, display: "2,000 عملة" },
            { value: 5000, price: 52, display: "5,000 عملة" },
            { value: 10000, price: 100, display: "10,000 عملة" }
        ]
    },
    {
        id: 907,
        name: "موبايل ليجند - عالمية",
        category: "games",
        description: "موبايل ليجند - عالمية : اختر الفئة التي تريدها",
        image: "images/موبايل ليجند.png",
        inputLabel: "رقم اللاعب (User ID) + رقم سيرفر اللاعب", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 86, price: 2, display: "86 جوهرة" },
            { value: 172, price: 3.45, display: "172 جوهرة" },
            { value: 257, price: 4.70, display: "257 جوهرة" },
            { value: 570, price: 10, display: "570 جوهرة" },
            { value: 706, price: 12, display: "706 جوهرة" },
            { value: 1163, price: 19.50, display: "1163 جوهرة" },
            { value: 2195, price: 33, display: "2195 جوهرة" },
            { value: 3688, price: 55, display: "3688 جوهرة" }
        ]
    },
    {
        id: 908,
        name: "موبايل ليجند - آسيا",
        category: "games",
        description: "موبايل ليجند - اسيا : اختر الفئة التي تريدها",
        image: "images/موبايل ليجند.png",
        inputLabel: "رقم اللاعب (User ID) + رقم سيرفر اللاعب", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 56, price: 1.40, display: "56 جوهرة" },
            { value: 112, price: 2.40, display: "112 جوهرة" },
            { value: 223, price: 4.20, display: "223 جوهرة" },
            { value: 336, price: 6, display: "336 جوهرة" },
            { value: 570, price: 9.80, display: "570 جوهرة" },
            { value: 1163, price: 20.50, display: "1163 جوهرة" },
            { value: 2398, price: 38, display: "2398 جوهرة" },
            { value: 6042, price: 96, display: "6042 جوهرة" },
        ]
    },
    {
        id: 909,
        name: "موبايل ليجند - تركيا",
        category: "games",
        description: "موبايل ليجند - تركيا : اختر الفئة التي تريدها",
        image: "images/موبايل ليجند.png",
        inputLabel: "رقم اللاعب (User ID) + رقم سيرفر اللاعب", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 42, price: 1.20, display: "42 جوهرة" },
            { value: 70, price: 1.80, display: "70 جوهرة" },
            { value: 140, price: 3.30, display: "140 جوهرة" },
            { value: 284, price: 5.95, display: "284 جوهرة" },
            { value: 355, price: 7.40, display: "355 جوهرة" },
            { value: 429, price: 8.70, display: "429 جوهرة" },
            { value: 716, price: 14.70, display: "716 جوهرة" },
            { value: 1446, price: 29, display: "1446 جوهرة" },
        ]
    },
    {
        id: 910,
        name: "روبلوكس - كود",
        category: "games",
        description: "روبلوكس : اختر الفئة التي تريدها",
        image: "images/روبلوكس.png",
        inputLabel: "رقم اللاعب (User ID)", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 10, price: 10.85, display: "10$ كود" },
            { value: 15, price: 16.70, display: "15$ كود" },
            { value: 20, price: 21.70, display: "20 $ كود" },
            { value: 25, price: 27, display: "25$ كود" },
            { value: 50, price: 53.50, display: "50$ كود" },
            { value: 100, price: 105, display: "100$ كود" }
        ]
    },
    {
        id: 911,
        name: "ارينا بريك اوت",
        category: "games",
        description: "ارينا بريك اوت : اختر الفئة التي تريدها",
        image: "images/ارينا بريك اوت.png",
        inputLabel: "رقم اللاعب (User ID)", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 66, price: 1.35, display: "66 عملة" },
            { value: 335, price: 5.20, display: "335 عملة" },
            { value: 675, price: 10, display: "675 عملة" },
            { value: 1690, price: 24, display: "1690 عملة" },
            { value: 3400, price: 48, display: "3400 عملة" },
            { value: 6820, price: 96, display: "6820 عملة" }
        ]
    },
    {
        id: 912,
        name: "برول ستارز",
        category: "games",
        description: "برول ستارز : اختر الفئة التي تريدها",
        image: "images/برول ستارز.png",
        inputLabel: "ادخل ايميل سوبر سيل", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 30, price: 3, display: "30 جوهرة" },
            { value: 80, price: 5.30, display: "80 جوهرة" },
            { value: 170, price: 12, display: "170 جوهرة" },
            { value: 360, price: 24, display: "360 جوهرة" },
            { value: 950, price: 58, display: "950 جوهرة" }
        ]
    },
    {
        id: 913,
        name: "يلا لودو - ذهب",
        category: "games",
        description: "يلا لودو : اختر الفئة التي تريدها",
        image: "images/يلا لودو.png",
        inputLabel: "رقم اللاعب (User ID)", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 68500, price: 2.50, display: "68,500 ذهب" },
            { value: 223700, price: 5.70, display: "223,700 ذهب" },
            { value: 146332, price: 10.20, display: "1,463,32 ذهب" },
            { value: 3666470, price: 27, display: "3,666,470 ذهب" },
            { value: 9973990, price: 51, display: "9,973,990 ذهب" },
            { value: 25236460, price: 107.50, display: "25,236,460 ذهب" }
        ]
    },
    {
        id: 914,
        name: "يلا لودو - ألماس",
        category: "games",
        description: "يلا لودو : اختر الفئة التي تريدها",
        image: "images/يلا لودو.png",
        inputLabel: "رقم اللاعب (User ID)", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 830, price: 2.50, display: "830 الماسة" },
            { value: 2320, price: 6, display: "2,320 الماسة" },
            { value: 5150, price: 10.70, display: "5,150 الماسة" },
            { value: 13580, price: 28, display: "13,580 الماسة" },
            { value: 27640, price: 53.30, display: "27,640 الماسة" },
            { value: 55800, price: 105, display: "55,800 الماسة" }
        ]
    },
    {
        id: 915,
        name: "دومز داي",
        category: "games",
        description: "دومز داي : اختر الفئة التي تريدها",
        image: "images/دومز داي 1.jpg",
        inputLabel: "رقم اللاعب (User ID)", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 200, price: 3.50, display: "200 ذهب" },
            { value: 400, price: 5.80, display: "400 ذهب" },
            { value: 800, price: 11, display: "800 ذهب" }
        ]
    },
    {
        id: 916,
        name: "الحرب  الاخيرة",
        category: "games",
        description: "الحرب الاخيرة : اختر الفئة التي تريدها",
        image: "images/الحرب الاخيرة.png",
        inputLabel: "رقم اللاعب (User ID)", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 500, price: 7.50, display: "500 ذهب" },
            { value: 1000, price: 13.70, display: "1,000 ذهب" },
            { value: 2000, price: 28, display: "2,000 ذهب" },
            { value: 2500, price: 32.60, display: "2,500 ذهب" },
            { value: 5000, price: 64.90, display: "5,000 ذهب" }
        ]
    },
    {
        id: 917,
        name: "فارلايت 84",
        category: "games",
        description: "دفارلايت 84 : اختر الفئة التي تريدها",
        image: "images/فارلايت.png",
        inputLabel: "رقم اللاعب (User ID)", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 80, price: 1.25, display: "80 جوهرة" },
            { value: 100, price: 1.50, display: "100 جوهرة" },
            { value: 165, price: 2, display: "165 جوهرة" },
            { value: 220, price: 2.60, display: "220 جوهرة" },
            { value: 330, price: 3.60, display: "330 جوهرة" },
            { value: 880, price: 8.60, display: "880 جوهرة" },
            { value: 2240, price: 22, display: "2,240 جوهرة" },
            { value: 4700, price: 43, display: "4,700 جوهرة" },
        ]
    },
    {
        id: 918,
        name: "غينشين امباكت - كريستال - رابط زمني",
        category: "games",
        description: "غينشين امباكت : اختر الفئة التي تريدها",
        image: "images/غينشين امباكت.png",
        inputLabel: "رقم اللاعب (User ID)", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 60, price: 1.20, display: "60 كريستال" },
            { value: 330, price: 4.20, display: "330 كريستال" },
            { value: 1090, price: 12, display: "1,090 كريستال" },
            { value: 2240, price: 25, display: "2,240 كريستال" },
            { value: 3880, price: 40.50, display: "3,880 كريستال" },
            { value: 8080, price: 76.30, display: "8,080 كريستال" },
            { value: 60, price: 1.30, display: "60 رابط زمني" },
            { value: 330, price: 4.40, display: "330 رابط زمني" },
            { value: 1090, price: 13.50, display: "1,090 رابط زمني" },
            { value: 2240, price: 27.10, display: "2,240 رابط زمني" },
            { value: 3880, price: 41.50, display: "3,880 رابط زمني" },
            { value: 8080, price: 77.10, display: "8,080 رابط زمني" },
        ]
    },
    {
        id: 919,
        name: "ماينكرافت - كود",
        category: "games",
        description: "ماينكرافت - كود : اختر الفئة التي تريدها",
        image: "images/ماين كرافت.png",
        inputLabel: "نعطيك الكود في واتساب", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 1720, price: 3.50, display: "1720 كود" },
            { value: 3500, price: 5.80, display: "3500 كود" }
        ]
    },
    {
        id: 920,
        name: "FC Mobaile - سيلفر - نقاط",
        category: "games",
        description: "لعبة بيس موبايل - عملات فضية + نقاط : اختر الفئة التي تريدها",
        image: "images/فيفا.png",
        inputLabel: "رقم اللاعب (User ID) + السيرفر", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 99, price: 1.70, display: "99 سيلفر" },
            { value: 499, price: 7.10, display: "499 سيلفر" },
            { value: 999, price: 13.50, display: "999 سيلفر" },
            { value: 1999, price: 28, display: "1999 سيلفر" },
            { value: 4999, price: 67.70, display: "4999 سيلفر" },
            { value: 9999, price: 133.40, display: "9999 سيلفر" },
            { value: 100, price: 1.70, display: "100 نقطة" },
            { value: 520, price: 7.10, display: "520 نقطة" },
            { value: 1070, price: 13.50, display: "1070 نقطة" },
            { value: 2200, price: 28, display: "2200 نقطة" },
            { value: 5750, price: 67.70, display: "5750 نقطة" },
            { value: 12000, price: 133.40, display: "12000 نقطة" },
        ]
    },
    {
        id: 921,
        name: "لورد موبايل - جواهر",
        category: "games",
        description: "لعبة لورد موبايل - جواهر : اختر الفئة التي تريدها",
        image: "images/لورد موبايل.png",
        inputLabel: "رقم اللاعب (User ID)", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 195, price: 2.95, display: "195 جوهرة" },
            { value: 395, price: 4.60, display: "395 جوهرة" },
            { value: 785, price: 9.90, display: "785 جوهرة"},
            { value: 1179, price: 16.80, display: "1179 جوهرة" },
            { value: 1964, price: 27.20, display: "1964 جوهرة" },
            { value: 3928, price: 54, display: "3928 جوهرة" },
            { value: 7857, price: 106.50, display: "7857 جوهرة" },
            { value: 11785, price: 156, display: "11785 جوهرة" },
            { value: 19642, price: 257.70, display: "19642 جوهرة" },
        ]
    },
    {
        id: 922,
        name: "Marge Kingdoms",
        category: "games",
        description: "Marge Kingdoms : اختر الفئة التي تريدها",
        image: "images/marge.png",
        inputLabel: "رقم اللاعب (User ID)", // النص المخصص لحقل الإدخال
        amounts: [
            { value: 1, price: 1.60, display: "1$ GoldDiamond" },
            { value: 5, price: 6.30, display: "5$ GoldDiamond" },
            { value: 30, price: 32, display: "30$ GoldDiamond" },
            { value: 50, price: 53.50, display: "50$ GoldDiamond" },
            { value: 100, price: 106, display: "100$ GoldDiamond" },
        ]
    },
];
