/* ══════════════════════════════════════════════════════════════════════
 * زودني — مُرسل الإشعارات (Cloudflare Worker)
 * يرسل إشعارات Firebase Cloud Messaging للأجهزة حتى والموقع مغلق.
 *
 * الأمان:
 *  - لا يقبل نص الإشعار من المتصفح؛ يقرأ الإشعار نفسه من Firebase (المكتوب حسب القواعد).
 *  - يتحقق من هوية من يطلب الإرسال (Firebase ID Token):
 *      إشعار لزبون / إعلان عام / تجربة  ← المدير فقط
 *      إشعار للمدير                     ← صاحب الإشعار فقط، ومرة واحدة، وخلال 10 دقائق من إنشائه
 *
 * المتغيرات المطلوبة في Cloudflare (Settings → Variables and Secrets):
 *  FIREBASE_SERVICE_ACCOUNT  (Secret)  محتوى ملف JSON لحساب الخدمة من Firebase كاملاً
 *  ADMIN_UID                 (Text)    معرّف حساب المدير
 *  SITE_URL                  (Text)    رابط المتجر، مثال: https://zoodnystore.github.io/ZoodnyStore/
 *  DATABASE_URL              (Text)    اختياري — يُستنتج تلقائياً إن لم يُكتب
 * ══════════════════════════════════════════════════════════════════════ */

const DEFAULT_DB_URL = 'https://zoodny-store-1f092-default-rtdb.europe-west1.firebasedatabase.app';
const TOPIC_ALL = 'all';
const ADMIN_MAX_AGE_MS = 10 * 60 * 1000;
const MAX_TOKENS_PER_USER = 10;

// ── كاش داخل الـ Worker ───────────────────────────────────────────────
let accessTokenCache = { token: null, exp: 0 };
let jwkCache = { keys: null, exp: 0 };

// ── أدوات Base64URL ───────────────────────────────────────────────────
function b64urlFromBytes(bytes) {
    let s = '';
    const arr = new Uint8Array(bytes);
    for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlFromString(str) { return b64urlFromBytes(new TextEncoder().encode(str)); }
function bytesFromB64url(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    const bin = atob(s);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
}
function jsonFromB64url(s) { return JSON.parse(new TextDecoder().decode(bytesFromB64url(s))); }

function pemToDer(pem) {
    const b64 = String(pem).replace(/-----BEGIN [^-]+-----/, '').replace(/-----END [^-]+-----/, '').replace(/\\n/g, '').replace(/\s+/g, '');
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out.buffer;
}

function serviceAccount(env) {
    if (!env.FIREBASE_SERVICE_ACCOUNT) throw new HttpError(500, 'FIREBASE_SERVICE_ACCOUNT غير مضبوط في إعدادات Cloudflare');
    let sa;
    try { sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT); } catch (e) { throw new HttpError(500, 'FIREBASE_SERVICE_ACCOUNT ليس JSON صحيحاً'); }
    if (!sa.client_email || !sa.private_key || !sa.project_id) throw new HttpError(500, 'ملف حساب الخدمة ناقص (client_email / private_key / project_id)');
    return sa;
}

// معرّف المدير من الإعدادات — نتجاهل المسافات وعلامات التنصيص التي قد تُلصق بالخطأ
function adminUid(env) {
    return String(env.ADMIN_UID || '').trim().replace(/^["']+|["']+$/g, '').trim();
}

class HttpError extends Error {
    constructor(status, message) { super(message); this.status = status; }
}

// ── OAuth: رمز وصول لحساب الخدمة (FCM + قاعدة البيانات) ────────────────
async function getAccessToken(env) {
    const now = Math.floor(Date.now() / 1000);
    if (accessTokenCache.token && accessTokenCache.exp - 60 > now) return accessTokenCache.token;
    const sa = serviceAccount(env);
    const header = { alg: 'RS256', typ: 'JWT' };
    const claims = {
        iss: sa.client_email,
        scope: 'https://www.googleapis.com/auth/firebase.messaging https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email',
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600
    };
    const unsigned = b64urlFromString(JSON.stringify(header)) + '.' + b64urlFromString(JSON.stringify(claims));
    const key = await crypto.subtle.importKey('pkcs8', pemToDer(sa.private_key), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
    const jwt = unsigned + '.' + b64urlFromBytes(sig);
    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=' + encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer') + '&assertion=' + encodeURIComponent(jwt)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.access_token) throw new HttpError(500, 'فشل الحصول على رمز وصول من Google: ' + (data.error_description || data.error || res.status));
    accessTokenCache = { token: data.access_token, exp: now + (data.expires_in || 3600) };
    return data.access_token;
}

// ── التحقق من هوية المستخدم (Firebase ID Token) ────────────────────────
async function getJwks() {
    const now = Date.now();
    if (jwkCache.keys && jwkCache.exp > now) return jwkCache.keys;
    const res = await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');
    if (!res.ok) throw new HttpError(502, 'تعذّر جلب مفاتيح التحقق من Google');
    const data = await res.json();
    const m = /max-age=(\d+)/.exec(res.headers.get('Cache-Control') || '');
    jwkCache = { keys: data.keys || [], exp: now + (m ? parseInt(m[1], 10) * 1000 : 3600 * 1000) };
    return jwkCache.keys;
}

async function verifyIdToken(idToken, projectId) {
    if (!idToken || typeof idToken !== 'string') throw new HttpError(401, 'يجب تسجيل الدخول');
    const parts = idToken.split('.');
    if (parts.length !== 3) throw new HttpError(401, 'رمز الدخول غير صالح');
    let header, payload;
    try { header = jsonFromB64url(parts[0]); payload = jsonFromB64url(parts[1]); } catch (e) { throw new HttpError(401, 'رمز الدخول غير صالح'); }
    if (header.alg !== 'RS256') throw new HttpError(401, 'رمز الدخول غير صالح');
    const keys = await getJwks();
    const jwk = keys.find(k => k.kid === header.kid);
    if (!jwk) throw new HttpError(401, 'رمز الدخول منتهي — أعد تحميل الصفحة');
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, bytesFromB64url(parts[2]), new TextEncoder().encode(parts[0] + '.' + parts[1]));
    if (!ok) throw new HttpError(401, 'توقيع رمز الدخول غير صحيح');
    const now = Math.floor(Date.now() / 1000);
    if (payload.aud !== projectId || payload.iss !== 'https://securetoken.google.com/' + projectId) throw new HttpError(401, 'رمز دخول لمشروع آخر');
    if (!payload.exp || payload.exp < now) throw new HttpError(401, 'رمز الدخول منتهي — أعد تحميل الصفحة');
    if (payload.iat && payload.iat > now + 300) throw new HttpError(401, 'رمز الدخول غير صالح');
    if (!payload.sub) throw new HttpError(401, 'رمز الدخول غير صالح');
    return { uid: payload.sub, email: payload.email || '' };
}

// ── قاعدة البيانات (REST بصلاحية حساب الخدمة) ──────────────────────────
function safeSeg(s) {
    s = String(s || '');
    if (!s || s.length > 200 || /[.#$\[\]\/]/.test(s)) throw new HttpError(400, 'معرّف غير صالح');
    return encodeURIComponent(s);
}
async function rtdb(env, path, method, body) {
    const token = await getAccessToken(env);
    const base = (env.DATABASE_URL || DEFAULT_DB_URL).replace(/\/+$/, '');
    const res = await fetch(base + '/' + path + '.json?access_token=' + encodeURIComponent(token), {
        method: method || 'GET',
        headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
        body: body !== undefined ? JSON.stringify(body) : undefined
    });
    if (!res.ok) throw new HttpError(502, 'خطأ قاعدة البيانات (' + res.status + ')');
    return res.json();
}

// ── FCM ───────────────────────────────────────────────────────────────
function webpushMessage(target, data) {
    const strData = {};
    Object.keys(data).forEach(k => { strData[k] = String(data[k] == null ? '' : data[k]); });
    return { message: Object.assign({}, target, { webpush: { headers: { Urgency: 'high', TTL: '86400' }, data: strData } }) };
}

async function fcmSend(env, message) {
    const sa = serviceAccount(env);
    const token = await getAccessToken(env);
    const res = await fetch('https://fcm.googleapis.com/v1/projects/' + sa.project_id + '/messages:send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(message)
    });
    if (res.ok) return { ok: true };
    const err = await res.json().catch(() => ({}));
    const status = (err.error && err.error.status) || '';
    const details = JSON.stringify(err.error && err.error.details || '');
    const dead = res.status === 404 || status === 'NOT_FOUND' || /UNREGISTERED|INVALID_ARGUMENT/.test(status + details);
    return { ok: false, dead: dead, status: res.status, error: (err.error && err.error.message) || String(res.status) };
}

async function sendToUser(env, uid, data) {
    const tokens = await rtdb(env, 'push_tokens/' + safeSeg(uid), 'GET') || {};
    const entries = Object.keys(tokens)
        .map(k => ({ key: k, token: tokens[k] && tokens[k].token, ts: (tokens[k] && tokens[k].ts) || 0 }))
        .filter(e => typeof e.token === 'string' && e.token.length > 20)
        .sort((a, b) => b.ts - a.ts)
        .slice(0, MAX_TOKENS_PER_USER);
    let sent = 0, removed = 0;
    for (const e of entries) {
        const r = await fcmSend(env, webpushMessage({ token: e.token }, data));
        if (r.ok) sent++;
        else if (r.dead) { removed++; await rtdb(env, 'push_tokens/' + safeSeg(uid) + '/' + safeSeg(e.key), 'DELETE').catch(() => {}); }
    }
    return { devices: entries.length, sent: sent, removed: removed };
}

function linkFor(env, id, url) {
    if (url && /^https:\/\//i.test(url)) return url;
    const site = env.SITE_URL || '';
    return site ? site.split('#')[0] + '#notif=' + encodeURIComponent(id) : '';
}

// ── المسارات ──────────────────────────────────────────────────────────
async function handleSubscribe(env, body) {
    const token = body.token;
    if (typeof token !== 'string' || token.length < 20 || token.length > 4096) throw new HttpError(400, 'رمز الجهاز غير صالح');
    const access = await getAccessToken(env);
    const res = await fetch('https://iid.googleapis.com/iid/v1:batchAdd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + access, access_token_auth: 'true' },
        body: JSON.stringify({ to: '/topics/' + TOPIC_ALL, registration_tokens: [token] })
    });
    const data = await res.json().catch(() => ({}));
    const r = data.results && data.results[0];
    if (!res.ok || (r && r.error)) throw new HttpError(502, 'تعذّر تسجيل الجهاز للإعلانات: ' + ((r && r.error) || res.status));
    return { ok: true };
}

async function handleNotify(env, body) {
    const sa = serviceAccount(env);
    const ADMIN = adminUid(env);
    if (!ADMIN) throw new HttpError(500, 'ADMIN_UID غير مضبوط في إعدادات Cloudflare');
    const caller = await verifyIdToken(body.idToken, sa.project_id);
    const isAdmin = caller.uid === ADMIN;
    const kind = body.kind;

    if (kind === 'test') {
        // رسالة توضيحية للمدير عند الإعداد: معرّفه الحالي لا يطابق ADMIN_UID في Cloudflare
        if (!isAdmin) throw new HttpError(403, 'للمدير فقط — قيمة ADMIN_UID في Cloudflare لا تطابق حسابك. معرّف حسابك الحالي هو: ' + caller.uid);
        const r = await sendToUser(env, ADMIN, {
            id: 'test:' + Date.now(), title: 'زودني — إشعار تجريبي ✅',
            body: 'الإشعارات تعمل! ستصلك حتى والموقع مغلق.', url: linkFor(env, 'test', '')
        });
        return Object.assign({ ok: true }, r);
    }

    const id = safeSeg(body.id);

    if (kind === 'p') {            // إشعار لزبون — يرسله المدير
        if (!isAdmin) throw new HttpError(403, 'للمدير فقط');
        const uid = safeSeg(body.uid);
        const rec = await rtdb(env, 'notifications/' + uid + '/' + id, 'GET');
        if (!rec) throw new HttpError(404, 'الإشعار غير موجود');
        const nid = 'p:' + body.id;
        const r = await sendToUser(env, body.uid, { id: nid, title: rec.title || 'زودني', body: rec.body || '', url: linkFor(env, nid, '') });
        return Object.assign({ ok: true }, r);
    }

    if (kind === 'a') {            // إشعار للمدير — يرسله صاحب الطلب/الشحن/التسجيل
        const rec = await rtdb(env, 'admin_notifications/' + id, 'GET');
        if (!rec) throw new HttpError(404, 'الإشعار غير موجود');
        if (rec.uid !== caller.uid && !isAdmin) throw new HttpError(403, 'غير مسموح');
        if (rec.pushed) return { ok: true, skipped: 'already-sent' };
        if (!rec.ts || Date.now() - Number(rec.ts) > ADMIN_MAX_AGE_MS) throw new HttpError(410, 'انتهت صلاحية الإشعار');
        await rtdb(env, 'admin_notifications/' + id, 'PATCH', { pushed: true });
        const nid = 'a:' + body.id;
        const r = await sendToUser(env, ADMIN, { id: nid, title: rec.title || 'زودني', body: rec.body || '', url: linkFor(env, nid, '') });
        return Object.assign({ ok: true }, r);
    }

    if (kind === 'b') {            // إعلان لكل العملاء — يرسله المدير
        if (!isAdmin) throw new HttpError(403, 'للمدير فقط');
        const rec = await rtdb(env, 'broadcasts/' + id, 'GET');
        if (!rec) throw new HttpError(404, 'الإعلان غير موجود');
        const nid = 'b:' + body.id;
        const r = await fcmSend(env, webpushMessage({ topic: TOPIC_ALL }, { id: nid, title: rec.title || 'زودني', body: rec.body || '', url: linkFor(env, nid, rec.url || '') }));
        if (!r.ok) throw new HttpError(502, 'فشل إرسال الإعلان: ' + r.error);
        return { ok: true };
    }

    throw new HttpError(400, 'نوع غير معروف');
}

function corsHeaders(req) {
    return {
        'Access-Control-Allow-Origin': req.headers.get('Origin') || '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin'
    };
}

function reply(req, status, obj) {
    return new Response(JSON.stringify(obj), { status: status, headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, corsHeaders(req)) });
}

export default {
    async fetch(req, env) {
        if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(req) });
        const path = new URL(req.url).pathname.replace(/\/+$/, '') || '/';
        try {
            if (req.method === 'GET' && path === '/') {
                const configured = !!env.FIREBASE_SERVICE_ACCOUNT && !!adminUid(env);
                return reply(req, 200, { ok: true, service: 'zoodny-push', configured: configured });
            }
            if (req.method !== 'POST') throw new HttpError(405, 'Method not allowed');
            const text = await req.text();
            if (text.length > 10000) throw new HttpError(413, 'الطلب كبير جداً');
            let body;
            try { body = JSON.parse(text || '{}'); } catch (e) { throw new HttpError(400, 'JSON غير صالح'); }
            if (path === '/subscribe') return reply(req, 200, await handleSubscribe(env, body));
            if (path === '/notify') return reply(req, 200, await handleNotify(env, body));
            throw new HttpError(404, 'Not found');
        } catch (e) {
            const status = e instanceof HttpError ? e.status : 500;
            return reply(req, status, { ok: false, error: e.message || String(e) });
        }
    }
};
