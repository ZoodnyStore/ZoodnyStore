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

## إدارة المنتجات من لوحة الأدمن

افتح الموقع ← اضغط كلمة `admin` الصغيرة أسفل الصفحة (أو افتح الرابط مع `#admin`) ← سجّل الدخول ← تبويب **إدارة المنتجات**.
من هناك: إضافة / تعديل / حذف منتجات، أسعار، باقات، صور. التعديلات تُحفظ في Firebase
(`product_overrides` و `product_deletions`) وتظهر لكل الزوار فوراً، وتُحدَّث أسعار السلال المفتوحة تلقائياً.

**شرط ضروري — قواعد Firebase:** القواعد الكاملة موجودة في [`database.rules.json`](database.rules.json).
انسخ محتواه كاملاً إلى Firebase Console ← Realtime Database ← Rules ثم Publish.
القواعد تعرّف الأدمن بالـ uid ‏`GEO8okziO7cpgoKS39XBQxgrjVL2` — إذا تغيّر حساب الأدمن غيّر هذا الرقم في كل الملف.

## الإشعارات

- **جرس الإشعارات** في الشريط العلوي (للجميع): إشعارات الطلبات والرصيد للمستخدم، وإعلانات المدير لكل الزوار.
- **إشعارات الجهاز** (هاتف أندرويد / ويندوز / ماك) تظهر لمن ضغط "تفعيل" وموقع المتجر مفتوح عنده ولو بالخلفية.
  من كان الموقع مغلقاً عنده يرى الإشعارات في الجرس عند فتحه. آيفون: فقط بعد "إضافة إلى الشاشة الرئيسية".
- **تلقائياً للزبون:** بدء تنفيذ الطلب، إتمامه، رفضه (مع المبلغ المُرجع)، قبول/رفض شحن الرصيد، إضافة/خصم رصيد من المدير.
- **تلقائياً للمدير فقط:** طلب متجر جديد، طلب شحن رصيد، مستخدم جديد.
- **إعلان لكل العملاء:** لوحة المدير ← تبويب **إرسال إشعار** (فيه قوالب جاهزة). وبعد إضافة منتج جديد يعرض الموقع إرسال إشعار عنه تلقائياً.
- الملفات: `js/account/notifications.js` و `sw.js` (Service Worker للإشعارات فقط — لا يخزّن نسخاً من الموقع).
- مسارات Firebase: `notifications/{uid}` و `admin_notifications` و `broadcasts` — قواعدها في `database.rules.json`.

### إشعارات والموقع مغلق (Cloudflare Worker + Firebase Cloud Messaging)

المُرسل في `cloudflare/push-worker.js`. لا يقبل نص الإشعار من المتصفح، بل يقرأه من Firebase ويتحقق من هوية الطالب
(إشعار الزبائن والإعلانات للمدير فقط). الأجهزة تُحفظ في `push_tokens/{uid}`، والإعدادات في `config/push`.

إعداد لمرة واحدة:
1. **Firebase Console ← ⚙️ Project settings ← Cloud Messaging ← Web Push certificates ← Generate key pair** وانسخ المفتاح.
2. **Project settings ← Service accounts ← Generate new private key** (ملف JSON — سري، لا ترفعه على GitHub).
3. **Cloudflare ← Workers & Pages ← Create ← Hello World** باسم `zoodny-push` ← Deploy ← **Edit code**:
   الصق محتوى `cloudflare/push-worker.js` ← Deploy.
4. في الـ Worker: **Settings ← Variables and Secrets** أضف:
   `FIREBASE_SERVICE_ACCOUNT` (Secret = محتوى ملف JSON كاملاً)، `ADMIN_UID` (Text = معرّف المدير)، `SITE_URL` (Text = رابط المتجر).
5. افتح رابط الـ Worker في المتصفح — يجب أن يظهر `"configured":true`.
6. لوحة المدير ← **إرسال إشعار** ← الصق رابط الـ Worker والمفتاح ← حفظ ← **إرسال إشعار تجريبي**.

## الأمان

- دخول الأدمن يتم عبر Firebase Authentication فقط (حساب `admin@zoodny.com`) — لا توجد كلمة سر داخل الكود.
- الحماية الحقيقية للرصيد والطلبات والمنتجات يجب أن تكون في **Firebase Realtime Database Rules**
  (منع المستخدم من تعديل `balance` بنفسه، والسماح بالكتابة على `product_overrides` للأدمن فقط).
