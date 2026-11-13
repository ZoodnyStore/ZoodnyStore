/* ══════════════════════════════════════════════════════════════════════
 * نظام الإشعارات الموحّد
 * showToast وما يرتبط به.
 * ══════════════════════════════════════════════════════════════════════ */

// ─── Unified Center Notification System ──────────────────────────
var _zNotifyTimer = null;
var _zNotifyBarTimer = null;

function showToast(message, type) {
    var duration = 1000; // 1 second
    type = type || detectMsgType(message);

    var notify  = document.getElementById('zNotify');
    var ov      = document.getElementById('zNotifyOv');
    var msgEl   = document.getElementById('zNotifyMsg');
    var iconEl  = document.getElementById('zNotifyIconI');
    var barFill = document.getElementById('zNotifyBarFill');
    if (!notify) return;

    // Clear previous timers
    if (_zNotifyTimer)    clearTimeout(_zNotifyTimer);
    if (_zNotifyBarTimer) clearTimeout(_zNotifyBarTimer);
    notify.classList.remove('show','notify-success','notify-error','notify-warn','notify-info');
    ov.classList.remove('show');

    // Set type
    var cfg = notifyConfig(type);
    notify.classList.add('notify-' + type);
    iconEl.className = 'fas ' + cfg.icon;
    msgEl.textContent = message;

    // Animate bar
    barFill.style.transition = 'none';
    barFill.style.width = '100%';
    void barFill.offsetWidth; // reflow
    barFill.style.transition = 'width ' + duration + 'ms linear';

    // Show
    requestAnimationFrame(function() {
        notify.classList.add('show');
        ov.classList.add('show');
        barFill.style.width = '0%';
    });

    // Auto hide
    _zNotifyTimer = setTimeout(function() {
        notify.classList.remove('show');
        ov.classList.remove('show');
    }, duration);
}

function detectMsgType(msg) {
    var m = msg || '';
    if (/غير كافٍ|غير كافي|خطأ|فشل|تعذر|غير صحيح|غير صالح|رفض|مرفوض/i.test(m)) return 'error';
    if (/يرجى|الحد الأ|مطلوب/i.test(m)) return 'warn';
    if (/تم|نجاح|بنجاح|مرحباً|تسجيل الدخول|أضيف|نُسخ/i.test(m)) return 'success';
    return 'info';
}

function notifyConfig(type) {
    var map = {
        success: { icon: 'fa-check-circle' },
        error:   { icon: 'fa-times-circle'  },
        warn:    { icon: 'fa-exclamation-triangle' },
        info:    { icon: 'fa-info-circle'   }
    };
    return map[type] || map.info;
}

// ─── Dismiss on overlay click ─────────────────────────────────────────
document.getElementById('zNotifyOv').addEventListener('click', function() {
    var notify = document.getElementById('zNotify');
    var ov     = document.getElementById('zNotifyOv');
    if (notify) notify.classList.remove('show');
    if (ov)     ov.classList.remove('show');
    if (_zNotifyTimer) clearTimeout(_zNotifyTimer);
});
