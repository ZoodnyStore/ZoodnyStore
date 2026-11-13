/* ══════════════════════════════════════════════════════════════════════
 * زودني — تهيئة Firebase
 * ملاحظة: مفتاح apiKey الخاص بـ Firebase مخصص للواجهة وظهوره طبيعي؛
 * الحماية الحقيقية تكون عبر قواعد Firebase Security Rules.
 * ══════════════════════════════════════════════════════════════════════ */

const firebaseConfig = {
    apiKey: "AIzaSyCvmyeM02Z0rP5foukXop1lIEQAlfOPr5o",
    authDomain: "zoodny-store-1f092.firebaseapp.com",
    databaseURL: "https://zoodny-store-1f092-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "zoodny-store-1f092",
    storageBucket: "zoodny-store-1f092.firebasestorage.app",
    messagingSenderId: "90520011191",
    appId: "1:90520011191:web:e6cf561156b7ada9ed2832"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.database();
// ── quick helpers ──
const dbRef = (path) => db.ref(path);
function nowAr() { return new Date().toLocaleString('ar-SY'); }

// ── تحميل مبكر لتعديلات/إضافات/حذوفات المنتجات المحفوظة من المدير ──
// نبدأ الطلب هنا بأسرع وقت ممكن في تحميل الصفحة (قبل حتى تعريف بيانات المنتجات)
// كي تكون النتيجة جاهزة قبل أن يفتح الزائر أي تصنيف منتجات.
window.__pmgOverridesPromise = Promise.all([
    dbRef('product_overrides').once('value'),
    dbRef('product_deletions').once('value')
]).then(function (snaps) {
    return { overrides: snaps[0].val() || {}, deletions: snaps[1].val() || {} };
}).catch(function (err) {
    console.error('تعذر تحميل تعديلات المنتجات من قاعدة البيانات', err);
    return { overrides: {}, deletions: {} };
});
