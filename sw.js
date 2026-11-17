/* ══════════════════════════════════════════════════════════════════════
 * Service Worker
 * 1) إشعارات الجهاز (ضروري لأندرويد ولإشعارات الموقع المغلق).
 * 2) تخزين الصور والخطوط على جهاز الزبون: تُحمَّل مرة واحدة فقط ثم تظهر فوراً حتى مع إنترنت ضعيف.
 *    - الصور (images/): من الذاكرة فوراً، وتُفحص بالخلفية مرة كل يوم (إن غيّرت صورة بنفس الاسم تظهر لاحقاً).
 *    - الخطوط والمكتبات الخارجية بأرقام نسخ ثابتة: من الذاكرة دائماً.
 *    - صفحات الموقع وملفات js/css لا تُخزَّن هنا أبداً ← التحديثات تبقى فورية (auto-update.js).
 * ══════════════════════════════════════════════════════════════════════ */

var IMG_CACHE = 'zoodny-img-v1';
var LIB_CACHE = 'zoodny-lib-v1';
var KEEP = [IMG_CACHE, LIB_CACHE];
var IMG_MAX = 500;                     // أقصى عدد صور مخزّنة
var IMG_REVALIDATE = 24 * 3600 * 1000; // فحص الصورة بالخلفية مرة يومياً

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(keys.filter(function (k) { return k.indexOf('zoodny-') === 0 && KEEP.indexOf(k) === -1; })
                .map(function (k) { return caches.delete(k); }));
        }).then(function () { return self.clients.claim(); })
    );
});

var LIB_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com', 'unpkg.com', 'www.gstatic.com', 'cdn.jsdelivr.net'];

function cacheable(res) { return res && res.ok && (res.type === 'basic' || res.type === 'cors'); }   // لا نخزن الردود المعتمة (تستهلك مساحة كبيرة)

function trimImages() {
    caches.open(IMG_CACHE).then(function (c) {
        return c.keys().then(function (keys) {
            var extra = keys.length - IMG_MAX;
            for (var i = 0; i < extra; i++) c.delete(keys[i]);   // الأقدم أولاً
        });
    }).catch(function () {});
}

function fromNetworkAndStore(cacheName, req) {
    return fetch(req).then(function (res) {
        if (cacheable(res)) {
            var copy = res.clone();
            caches.open(cacheName).then(function (c) { return c.put(req, copy); }).then(function () {
                if (cacheName === IMG_CACHE) trimImages();
            }).catch(function () {});
        }
        return res;
    });
}

function imageStrategy(e, req) {
    e.respondWith(caches.open(IMG_CACHE).then(function (c) {
        return c.match(req, { ignoreSearch: true }).then(function (hit) {
            if (hit) {
                var d = Date.parse(hit.headers.get('date') || '') || 0;
                if (Date.now() - d > IMG_REVALIDATE) e.waitUntil(fromNetworkAndStore(IMG_CACHE, req).catch(function () {}));
                return hit;
            }
            return fromNetworkAndStore(IMG_CACHE, req);
        });
    }).catch(function () { return fetch(req); }));
}

function libStrategy(e, req) {
    e.respondWith(caches.open(LIB_CACHE).then(function (c) {
        return c.match(req).then(function (hit) { return hit || fromNetworkAndStore(LIB_CACHE, req); });
    }).catch(function () { return fetch(req); }));
}

self.addEventListener('fetch', function (e) {
    var req = e.request;
    if (req.method !== 'GET') return;
    var url;
    try { url = new URL(req.url); } catch (err) { return; }
    var scope = new URL(self.registration.scope);

    // صور المتجر
    if (url.origin === scope.origin && url.pathname.indexOf(scope.pathname + 'images/') === 0) { imageStrategy(e, req); return; }

    // خطوط ومكتبات خارجية (عناوينها ثابتة النسخة) — ما عدا خدمات Firebase الحيّة
    if (LIB_HOSTS.indexOf(url.hostname) !== -1 && !/\/(firebasejs\/.*-messaging-sw|identitytoolkit)/.test(url.pathname)) {
        if (url.hostname === 'cdn.jsdelivr.net' && !/@\d/.test(url.pathname)) return;   // بدون رقم نسخة ← لا نخزن
        if (url.hostname === 'unpkg.com' && /@next/.test(url.pathname)) return;
        libStrategy(e, req);
        return;
    }
    // كل شيء آخر (الصفحة، js، css، Firebase) ← من الشبكة كالعادة
});

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
