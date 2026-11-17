/* ══════════════════════════════════════════════════════════════════════
 * وضع الصيانة
 * المدير يفعّله من لوحة المدير (زر "الصيانة") ← يُحفظ في config/maintenance
 * الزبائن يرون صفحة صيانة كاملة، وتختفي وحدها لحظة إيقافه (بدون تحديث الصفحة).
 * المدير لا يرى الصفحة (ليكمل تعديلاته) — ويظهر له شريط تنبيه صغير بدلاً منها.
 * دخول المدير أثناء الصيانة: 10 ضغطات سريعة على الشعار في صفحة الصيانة.
 * ══════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';
    var ADMIN_EMAIL_FALLBACK = 'admin@zoodny.com';
    var WHATSAPP = '963939083098';

    var DEFAULTS = {
        title: 'المتجر في صيانة مؤقتة',
        message: 'نعمل حالياً على تحديث المتجر وإضافة تحسينات جديدة لنقدّم لك تجربة أفضل.\nسنعود إليك خلال وقت قصير — شكراً لصبرك وثقتك بزودني 💛',
        eta: ''
    };
    window.ZOODNY_MAINT_DEFAULTS = DEFAULTS;

    var cfg = null, preview = false;

    function esc(s) {
        return String(s === null || s === undefined ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function isAdmin() {
        var u = typeof auth !== 'undefined' ? auth.currentUser : null;
        var mail = (window.ZoodnyAccount && window.ZoodnyAccount.ADMIN_EMAIL) || ADMIN_EMAIL_FALLBACK;
        return !!u && String(u.email || '').toLowerCase() === String(mail).toLowerCase();
    }
    function active() { return !!(cfg && cfg.on === true); }
    window.zoodnyMaintenanceActive = function () { return active() && !isAdmin(); };

    // ── صفحة الصيانة ──
    function buildPage(c) {
        var el = document.createElement('div');
        el.id = 'zMaint';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-live', 'polite');
        var msg = esc(c.message || DEFAULTS.message).replace(/\n/g, '<br>');
        el.innerHTML =
            '<div class="zm-bg"><span class="zm-orb o1"></span><span class="zm-orb o2"></span><span class="zm-orb o3"></span></div>' +
            '<div class="zm-card">' +
                (preview ? '<div class="zm-preview">معاينة — هكذا يرى الزبائن الصفحة <button type="button" id="zmClosePreview">إغلاق المعاينة</button></div>' : '') +
                '<div class="zm-logo-wrap">' +
                    '<img class="zm-logo" id="zmLogo" src="images/icons/logo-round-160.png" alt="زودني" onerror="this.onerror=null;this.src=\'images/logo.jpg\'">' +
                    '<span class="zm-gear g1"><i class="fas fa-cog"></i></span><span class="zm-gear g2"><i class="fas fa-cog"></i></span>' +
                '</div>' +
                '<div class="zm-brand">زودني <span>Zoodny</span></div>' +
                '<div class="zm-badge"><i class="fas fa-tools"></i> صيانة مؤقتة</div>' +
                '<h1 class="zm-title">' + esc(c.title || DEFAULTS.title) + '</h1>' +
                '<p class="zm-msg">' + msg + '</p>' +
                (c.eta ? '<div class="zm-eta"><i class="far fa-clock"></i> العودة المتوقعة: <b>' + esc(c.eta) + '</b></div>' : '') +
                '<div class="zm-progress"><span></span></div>' +
                '<div class="zm-live"><span class="zm-dot"></span> ستعود الصفحة تلقائياً فور انتهاء الصيانة — لا حاجة لتحديثها</div>' +
                '<a class="zm-wa" href="https://wa.me/' + WHATSAPP + '" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> تواصل معنا عبر واتساب</a>' +
                '<div class="zm-foot">نعتذر عن الإزعاج، ونعمل لنكون عند حسن ظنك دائماً</div>' +
            '</div>';
        return el;
    }

    function render() {
        var show = (active() && !isAdmin()) || preview;
        var cur = document.getElementById('zMaint');
        if (!show) {
            if (cur) {
                cur.classList.add('zm-out');
                setTimeout(function () { if (cur.parentNode) cur.parentNode.removeChild(cur); }, 450);
                document.documentElement.classList.remove('zm-lock');
            }
        } else {
            if (cur) cur.parentNode.removeChild(cur);
            var page = buildPage(cfg || DEFAULTS);
            document.body.appendChild(page);
            document.documentElement.classList.add('zm-lock');
            wireLogo(page);
            var cp = document.getElementById('zmClosePreview');
            if (cp) cp.onclick = function () { preview = false; render(); };
        }
        renderAdminBar();
    }

    // 10 ضغطات سريعة على الشعار ← دخول المدير
    function wireLogo(page) {
        var logo = page.querySelector('#zmLogo'), taps = 0, last = 0;
        if (!logo) return;
        logo.addEventListener('click', function () {
            var now = Date.now();
            taps = now - last <= 1200 ? taps + 1 : 1;
            last = now;
            if (taps >= 10) { taps = 0; if (typeof window.openAdminPanel === 'function') window.openAdminPanel(); }
        });
    }

    // شريط للمدير: الصيانة مفعّلة والزبائن يرون صفحتها
    function renderAdminBar() {
        var bar = document.getElementById('zMaintBar');
        var need = active() && isAdmin();
        if (!need) { if (bar) bar.parentNode.removeChild(bar); document.documentElement.classList.remove('zm-has-bar'); return; }
        if (bar) return;
        bar = document.createElement('div');
        bar.id = 'zMaintBar';
        bar.innerHTML = '<span><i class="fas fa-tools"></i> وضع الصيانة مفعّل — الزبائن يرون صفحة الصيانة الآن</span>' +
            '<button type="button" id="zMaintBarOff"><i class="fas fa-power-off"></i> إيقاف الصيانة</button>';
        document.body.appendChild(bar);
        document.documentElement.classList.add('zm-has-bar');
        document.getElementById('zMaintBarOff').onclick = function () {
            if (typeof window.zoodnySetMaintenance === 'function') window.zoodnySetMaintenance(false);
        };
    }

    window.zoodnyPreviewMaintenance = function (c) {
        if (c) cfg = Object.assign({}, cfg || {}, c, { on: cfg ? cfg.on : false });
        preview = true;
        render();
    };

    function start() {
        if (typeof dbRef !== 'function') return;
        dbRef('config/maintenance').on('value', function (snap) {
            var was = active();
            cfg = snap.val() || null;
            render();
            if (was && !active() && !isAdmin() && typeof showToast === 'function') {
                setTimeout(function () { showToast('عاد المتجر للعمل — أهلاً بك من جديد! 🎉', 'success'); }, 500);
            }
        }, function () { cfg = null; render(); });
        if (typeof auth !== 'undefined') auth.onAuthStateChanged(function () { render(); });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
}());
