/* ══════════════════════════════════════════════════════════════════════
 * حالة المتجر وعناصر الصفحة
 * متغيرات الحالة العامة ومراجع عناصر DOM المستخدمة في كل ملفات المتجر.
 * ══════════════════════════════════════════════════════════════════════ */

// تهيئة مكتبة الحركات
AOS.init({ duration: 800, once: true });

// -------------------- حالة التطبيق --------------------
let currentCategory = null;
let cart = [];
let currentPaymentData = {};
let currentStep = 1;
let hasSocialMediaProduct = false;
let hasCreditProduct = false;
let hasGameProduct = false;
let hasAppProduct = false;
let hasPremiumProduct = false;
let selectedSocialProduct = null;
let selectedCreditProduct = null;
let selectedGameProduct = null;
let selectedAppProduct = null;

// متغير جديد لتتبع المنصة المحددة
let selectedPlatform = null;

// عناصر DOM
const categoriesSection = document.getElementById('categories');
const categoriesGrid = document.getElementById('categoriesGrid');
const productsSection = document.getElementById('products');
const categoryProductsTitle = document.getElementById('categoryProductsTitle');
const productFilters = document.getElementById('productFilters');
const productsGrid = document.getElementById('productsGrid');
const backToCategories = document.getElementById('backToCategories');

const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartToggle = document.getElementById('cartToggle');
const mobileCartToggle = document.getElementById('mobileCartToggle');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const mobileCartCount = document.getElementById('mobileCartCount');
const cartTotalPrice = document.getElementById('cartTotalPrice');
const checkoutBtn = document.getElementById('checkoutBtn');
const customerModal = document.getElementById('customerModal');
const closeCustomer = document.getElementById('closeCustomer');
const customerForm = document.getElementById('customerForm');
const orderSummaryItems = document.getElementById('orderSummaryItems');
const orderSummaryTotal = document.getElementById('orderSummaryTotal');
const successToast = document.getElementById('successToast');
const toastMessage = document.getElementById('toastMessage');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.querySelector('.nav-links');
const mobileCartIcon = document.getElementById('mobileCartIcon');

const productDetailsModal = document.getElementById('productDetailsModal');
const productDetailsClose = document.getElementById('productDetailsClose');
const productDetailsBody = document.getElementById('productDetailsBody');

const quantityModal = document.getElementById('quantityModal');
const quantityClose = document.getElementById('quantityClose');
const selectedProductName = document.getElementById('selectedProductName');
const socialQuantity = document.getElementById('socialQuantity');
const calculatedPrice = document.getElementById('calculatedPrice');
const pricePerThousand = document.getElementById('pricePerThousand');
const confirmQuantityBtn = document.getElementById('confirmQuantityBtn');

const creditModal = document.getElementById('creditModal');
const creditClose = document.getElementById('creditClose');
const selectedCreditName = document.getElementById('selectedCreditName');
const creditAmount = document.getElementById('creditAmount');
const creditPhoneNumber = document.getElementById('creditPhoneNumber');
const calculatedCreditPrice = document.getElementById('calculatedCreditPrice');
const selectedCreditValue = document.getElementById('selectedCreditValue');
const confirmCreditBtn = document.getElementById('confirmCreditBtn');

// عناصر نافذة التطبيقات
const appModal = document.getElementById('appModal');
const appClose = document.getElementById('appClose');
const selectedAppName = document.getElementById('selectedAppName');
const appQuantity = document.getElementById('appQuantity');
const appPlayerId = document.getElementById('appPlayerId');
const appPlayerIdLabel = document.getElementById('appPlayerIdLabel');
const appQuantityHelp = document.getElementById('appQuantityHelp');
const appPlayerIdHelp = document.getElementById('appPlayerIdHelp');
const calculatedAppPrice = document.getElementById('calculatedAppPrice');
const unitPrice = document.getElementById('unitPrice');
const confirmAppBtn = document.getElementById('confirmAppBtn');

const gameModal = document.getElementById('gameModal');
const gameClose = document.getElementById('gameClose');
const selectedGameName = document.getElementById('selectedGameName');
const gameAmount = document.getElementById('gameAmount');
const gamePlayerId = document.getElementById('gamePlayerId');
const calculatedGamePrice = document.getElementById('calculatedGamePrice');
const selectedGameValue = document.getElementById('selectedGameValue');
const confirmGameBtn = document.getElementById('confirmGameBtn');

// عناصر نافذة تفعيلات البريميوم
const premiumModal = document.getElementById('premiumModal');
const premiumClose = document.getElementById('premiumClose');
const selectedPremiumName = document.getElementById('selectedPremiumName');
const confirmPremiumBtn = document.getElementById('confirmPremiumBtn');
let selectedPremiumProduct = null;

const paymentModal = document.getElementById('paymentModal');
const paymentClose = document.getElementById('paymentClose');
const paymentMethodInput = document.getElementById('paymentMethod');
const submitOrderBtn = document.getElementById('submitOrderBtn');

const socialMediaFields = document.getElementById('socialMediaFields');
const accountUrl = document.getElementById('accountUrl');
const socialMediaItemsSummary = document.getElementById('socialMediaItemsSummary');

const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const paymentStep1 = document.getElementById('paymentStep1');
const paymentStep2 = document.getElementById('paymentStep2');
const paymentStep3 = document.getElementById('paymentStep3');

const requiredAmount = document.getElementById('requiredAmount');
const transferNumber = document.getElementById('transferNumber');
const nextStep1 = document.getElementById('nextStep1');
const copyAccountId = document.getElementById('copyAccountId');
const accountIdValue = document.getElementById('accountIdValue');

const confirmTransferNumber = document.getElementById('confirmTransferNumber');
const confirmRequiredAmount = document.getElementById('confirmRequiredAmount');
const paidAmount = document.getElementById('paidAmount');
const transferDate = document.getElementById('transferDate');
const backStep2 = document.getElementById('backStep2');
const nextStep2 = document.getElementById('nextStep2');

const orderNumber = document.getElementById('orderNumber');
const finalTransferNumber = document.getElementById('finalTransferNumber');
const finalPaidAmount = document.getElementById('finalPaidAmount');
const finalTransferDate = document.getElementById('finalTransferDate');
const finalRequiredAmount = document.getElementById('finalRequiredAmount');
const backStep3 = document.getElementById('backStep3');
const submitPayment = document.getElementById('submitPayment');

const menuOverlay = document.createElement('div');
menuOverlay.className = 'menu-overlay';
document.body.appendChild(menuOverlay);

function checkMobileScreen() {
    if (window.innerWidth <= 768) {   // نفس حدّ تصميم الهاتف في CSS
        mobileCartIcon.style.display = 'block';
        document.querySelectorAll('.nav-links .cart-icon-container').forEach(el => {
            el.style.display = 'none';
        });
    } else {
        mobileCartIcon.style.display = 'none';
        document.querySelectorAll('.nav-links .cart-icon-container').forEach(el => {
            el.style.display = 'block';
        });
    }
}

window.addEventListener('resize', checkMobileScreen);
window.addEventListener('load', checkMobileScreen);
