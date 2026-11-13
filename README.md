# زودني Zoodny Store

متجر إلكتروني (HTML + CSS + JavaScript بدون أي build) يعمل على GitHub Pages، مع Firebase للحسابات والمحفظة والطلبات.

## هيكل المشروع

```
index.html                  الصفحة (HTML فقط)
css/
  main.css                  أنماط المتجر
  account.css               أنماط الحساب والمحفظة ولوحة الإدارة
js/
  core/images.js            مسارات الصور (تحمّل أولاً)
  firebase.js               تهيئة Firebase
  data/                     بيانات المتجر — هنا تعدّل المنتجات والأسعار
    apps.js                 شحن التطبيقات
    games.js                شحن الألعاب
    services.js             بريميوم + VPN + الدفع الإلكتروني
    products.js             المنتجات العامة
    categories.js           المنصات + التصنيفات + فئات الرصيد
  store/                    منطق المتجر
    state.js                الحالة وعناصر الصفحة
    notify.js               الإشعارات (showToast)
    catalog.js              عرض التصنيفات والمنتجات
    cart.js                 نوافذ الإدخال والسلة والدفع
    product-details.js      نوافذ تفاصيل المنتج
    main.js                 التهيئة عند تحميل الصفحة
  account/                  الحساب ولوحة الإدارة
    core.js                 الدخول، المحفظة، الشحن، سجل الطلبات
    admin.js                لوحة الأدمن
    service-modal.js        نافذة إدخال الخدمات
    mobile-nav.js           الشريط السفلي للموبايل
    product-manager.js      إدارة المنتجات من لوحة الأدمن
images/                     كل الصور
```

## ملاحظات مهمة

- **ترتيب ملفات `<script>` في `index.html` مهم**: ملفات `data` قبل `store`، و`account/core.js` قبل باقي ملفات `account`.
- **إضافة صورة جديدة**: ضعها داخل `images/` واكتب في المنتج `image: "images/اسم-الصورة.png"`
  (أو اسم الملف فقط من لوحة الأدمن — يُضاف `images/` تلقائياً).
- **تشغيل محلي**: افتح المجلد بأي سيرفر بسيط، مثلاً `python -m http.server` ثم `http://localhost:8000`.

## الأمان

- دخول الأدمن يتم عبر Firebase Authentication فقط (حساب `admin@zoodny.com`) — لا توجد كلمة سر داخل الكود.
- الحماية الحقيقية للرصيد والطلبات والمنتجات يجب أن تكون في **Firebase Realtime Database Rules**
  (منع المستخدم من تعديل `balance` بنفسه، والسماح بالكتابة على `product_overrides` للأدمن فقط).
