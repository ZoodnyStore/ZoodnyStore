/* ══════════════════════════════════════════════════════════════════════
 * Service Worker — لعرض إشعارات الجهاز فقط (ضروري لأندرويد ولإشعارات الموقع المغلق).
 * لا يخزّن أي ملفات (لا يوجد fetch handler) حتى تبقى تحديثات الموقع فورية.
 * ══════════════════════════════════════════════════════════════════════ */

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

// إشعار قادم من Firebase Cloud Messaging (يصل حتى والموقع مغلق)
self.addEventListener('push', function (e) {
    var p = {};
    try { p = e.data ? e.data.json() : {}; } catch (err) { p = {}; }
    var d = p.data || p.notification || p;
    var id = d.id || ('push-' + Date.now());
    var title = d.title || 'زودني';
    var opts = {
        body: d.body || '', icon: 'images/icons/icon-192.png', badge: 'images/icons/badge-96.png',
        tag: 'zoodny-' + id, dir: 'rtl', lang: 'ar',
        data: { id: id, url: d.url || self.registration.scope }
    };
    e.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
            // الموقع ظاهر أمام المستخدم الآن ← يعرض التنبيه بنفسه داخل الصفحة (لا نكرره)
            var visible = list.some(function (c) {
                return c.visibilityState === 'visible' && c.url.indexOf(self.registration.scope) === 0;
            });
            if (visible) return;
            return self.registration.showNotification(title, opts);
        })
    );
});

// الضغط على الإشعار: نفتح نافذة الموقع الموجودة (أو نفتح الموقع) ونطلب منها فتح الإشعار
self.addEventListener('notificationclick', function (e) {
    e.notification.close();
    var data = e.notification.data || {};
    var url = data.url || self.registration.scope;
    e.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
            for (var i = 0; i < list.length; i++) {
                var c = list[i];
                if (c.url.indexOf(self.registration.scope) === 0 && 'focus' in c) {
                    c.postMessage({ type: 'zoodny-notif-click', id: data.id || '' });
                    return c.focus();
                }
            }
            if (self.clients.openWindow) return self.clients.openWindow(url);
        })
    );
});
