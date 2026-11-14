/* ══════════════════════════════════════════════════════════════════════
 * متطلبات المنتج
 * المدير يحدد لأي منتج (أو مجموعة باقات) معلومة يجب أن يرسلها الزبون:
 *   reqType (link | text | email | phone | number) + reqLabel + reqPlaceholder + reqHelp
 * عند إضافة المنتج للسلة — من أي صفحة — تظهر نافذة تطلب المعلومة. إن ألغى الزبون يُزال المنتج.
 * المعلومة تُحفظ في عنصر السلة (reqLabel / reqValue / reqType) وتصل مع الطلب للمدير.
 *
 * كل طرق الإضافة للسلة تنتهي باستدعاء updateCartUI()، لذلك نراقب السلة من هناك.
 * ══════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    var REQ_ICONS = { link: 'fa-link', text: 'fa-font', email: 'fa-envelope', phone: 'fa-phone', number: 'fa-hashtag' };
    var DEFAULT_LABELS = { link: 'الرابط المطلوب', text: 'المعلومة المطلوبة', email: 'البريد الإلكتروني', phone: 'رقم الهاتف', number: 'الرقم / المعرّف' };
    var GROUP_SETS = function () {
        return {
            'تفعيلات بريميوم': typeof premiumActivationsData !== 'undefined' ? premiumActivationsData : [],
            'اشتراكات VPN': typeof vpnData !== 'undefined' ? vpnData : [],
            'الدفع الالكتروني': typeof electronicPaymentData !== 'undefined' ? electronicPaymentData : [],
            'الدفع electronique': typeof electronicPaymentData !== 'undefined' ? electronicPaymentData : []
        };
    };

    function esc(s) {
        return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // مصدر "متطلبات" عنصر السلة: المنتج نفسه، أو اللعبة/التطبيق، أو مجموعة الباقات التي ينتمي لها
    function findReqSource(line) {
        if (!line) return null;
        var cat = line.category || '';
        try {
            if (cat === 'games' && typeof gamesData !== 'undefined')
                return gamesData.find(function (g) { return g.name === line.name; }) || gamesData.find(function (g) { return String(g.id) === String(line.id); });
            if (cat === 'app' && typeof appsData !== 'undefined')
                return appsData.find(function (a) { return a.name === line.name; }) || appsData.find(function (a) { return String(a.id) === String(line.id); });
            var groups = GROUP_SETS()[cat];
            if (groups) return groups.find(function (g) { return (g.products || []).some(function (p) { return p && String(p.id) === String(line.id); }); }) || null;
            if (typeof products !== 'undefined')
                return products.find(function (p) { return p.id === line.id && p.category === cat; }) || products.find(function (p) { return p.id === line.id; }) || null;
        } catch (e) { console.warn('findReqSource', e); }
        return null;
    }

    function getReq(line) {
        var src = findReqSource(line);
        if (!src || !src.reqType || !REQ_ICONS[src.reqType]) return null;
        return {
            type: src.reqType,
            label: String(src.reqLabel || DEFAULT_LABELS[src.reqType]),
            placeholder: String(src.reqPlaceholder || ''),
            help: String(src.reqHelp || '')
        };
    }
    window.zoodnyGetProductReq = getReq;

    // ── التحقق من القيمة حسب النوع ─────────────────────────────────────
    function toLatinDigits(v) {
        return String(v).replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 0x0660); })
                        .replace(/[۰-۹]/g, function (d) { return String(d.charCodeAt(0) - 0x06F0); });
    }
    function normalize(type, raw) {
        var v = String(raw || '').trim();
        if (type === 'phone' || type === 'number') v = toLatinDigits(v).replace(/[\s\-()]/g, '');
        if (type === 'link') {
            v = v.replace(/\s+/g, '');
            if (v && !/^https?:\/\//i.test(v) && /^[\w.-]+\.[a-z]{2,}/i.test(v)) v = 'https://' + v;   // instagram.com/x ← https://instagram.com/x
        }
        if (type === 'email') v = v.replace(/\s+/g, '').toLowerCase();
        return v;
    }
    function validate(type, v) {
        if (!v) return 'هذا الحقل مطلوب';
        if (v.length > 500) return 'النص طويل جداً';
        if (type === 'link' && !/^https?:\/\/[^\s.]+\.[^\s]{2,}/i.test(v)) return 'اكتب رابطاً صحيحاً يبدأ بـ https://';
        if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'اكتب بريداً إلكترونياً صحيحاً مثل name@gmail.com';
        if (type === 'phone' && !/^\+?[0-9]{7,15}$/.test(v)) return 'اكتب رقم هاتف صحيحاً (أرقام فقط)';
        if (type === 'number' && !/^[0-9]{1,40}$/.test(v)) return 'اكتب أرقاماً فقط';
        return '';
    }

    // ── نافذة طلب المعلومة ─────────────────────────────────────────────
    // رسالة "تمت الإضافة" العامة تظهر من كود السلة في نفس اللحظة — نخفيها حتى لا تغطي النافذة
    function dismissToast() {
        try {
            if (typeof _zNotifyTimer !== 'undefined' && _zNotifyTimer) clearTimeout(_zNotifyTimer);
            var n = document.getElementById('zNotify'), o = document.getElementById('zNotifyOv');
            if (n) n.classList.remove('show');
            if (o) o.classList.remove('show');
        } catch (e) {}
    }

    var promptOpen = false;
    // رسائل السلة العامة ("تمت الإضافة...") تُعرض بعد فتح النافذة — نوقفها ما دامت النافذة مفتوحة
    if (typeof window.showToast === 'function') {
        var _origToast = window.showToast;
        window.showToast = function () { if (promptOpen) return; return _origToast.apply(this, arguments); };
    }

    function ask(line, req, prefill, extraNote) {
        dismissToast();
        promptOpen = true;
        return new Promise(function (resolve) {
            var ov = document.createElement('div');
            ov.className = 'req-ov';
            ov.id = 'reqPromptOv';
            var inputAttrs = {
                link:   'type="url" dir="ltr" inputmode="url" autocomplete="url"',
                email:  'type="email" dir="ltr" inputmode="email" autocomplete="email"',
                phone:  'type="tel" dir="ltr" inputmode="tel" autocomplete="tel"',
                number: 'type="text" dir="ltr" inputmode="numeric" autocomplete="off"',
                text:   'type="text" autocomplete="off"'
            }[req.type];
            ov.innerHTML =
                '<div class="req-box" role="dialog" aria-modal="true" aria-labelledby="reqTitle">'
                + '<div class="req-head"><span class="req-ic"><i class="fas ' + REQ_ICONS[req.type] + '"></i></span>'
                + '<div><div class="req-kicker">معلومة مطلوبة لإتمام الطلب</div><div class="req-prod" id="reqTitle">' + esc(line.name) + '</div></div></div>'
                + (extraNote ? '<div class="req-note">' + esc(extraNote) + '</div>' : '')
                + '<label class="req-label" for="reqInput">' + esc(req.label) + ' <span class="req-star">*</span></label>'
                + '<input class="req-input" id="reqInput" ' + inputAttrs + ' maxlength="500" placeholder="' + esc(req.placeholder) + '" value="' + esc(prefill || '') + '">'
                + (req.help ? '<div class="req-help"><i class="fas fa-info-circle"></i> ' + esc(req.help) + '</div>' : '')
                + '<div class="req-err" id="reqErr"></div>'
                + '<div class="req-btns"><button type="button" class="req-ok">تأكيد وإضافة للسلة</button>'
                + '<button type="button" class="req-cancel">إلغاء</button></div>'
                + '</div>';
            document.body.appendChild(ov);
            var input = ov.querySelector('#reqInput'), err = ov.querySelector('#reqErr');
            function done(val) {
                promptOpen = false;
                document.removeEventListener('keydown', onKey, true);
                if (ov.parentNode) ov.parentNode.removeChild(ov);
                resolve(val);
            }
            function submit() {
                var v = normalize(req.type, input.value);
                var msg = validate(req.type, v);
                if (msg) { err.textContent = msg; input.classList.add('has-error'); input.focus(); return; }
                done(v);
            }
            function onKey(e) {
                if (e.key === 'Escape') { e.stopPropagation(); done(null); }
                else if (e.key === 'Enter' && document.activeElement === input) { e.preventDefault(); submit(); }
            }
            ov.querySelector('.req-ok').onclick = submit;
            ov.querySelector('.req-cancel').onclick = function () { done(null); };
            ov.addEventListener('click', function (e) { if (e.target === ov) done(null); });
            input.addEventListener('input', function () { err.textContent = ''; input.classList.remove('has-error'); });
            document.addEventListener('keydown', onKey, true);
            setTimeout(function () { input.focus(); if (prefill) input.select(); }, 60);
        });
    }

    // ── مراقبة السلة ─────────────────────────────────────────────────────
    var seenQty = new WeakMap();   // آخر كمية رأيناها لكل سطر في السلة
    var queue = [], busy = false, inUpdate = false;

    function saveCart() { try { localStorage.setItem('zoodnyCart', JSON.stringify(cart)); } catch (e) {} }

    // mode: 'init'     عند فتح الموقع — لا نوافذ، فقط نحفظ الحالة
    //       'update'   بعد أي تحديث للسلة — نسأل فقط عن الأسطر المضافة الآن (أو قطع إضافية)
    //       'checkout' عند إتمام الطلب — نسأل عن كل ما ينقصه معلومة، ولا نحذف عند الإلغاء
    function scan(mode) {
        mode = mode || 'update';
        if (typeof cart === 'undefined' || !Array.isArray(cart)) return;
        cart.forEach(function (line) {
            if (!line || typeof line !== 'object') return;
            var req = getReq(line);
            var prev = seenQty.get(line);
            seenQty.set(line, line.quantity);
            if (!req) return;
            var pending = queue.some(function (q) { return q.line === line; });
            if (pending || mode === 'init') return;
            if (!line.reqValue) {
                if (mode === 'checkout') queue.push({ line: line, mode: 'new', keep: true });
                else if (prev === undefined) queue.push({ line: line, mode: 'new', keep: false });   // أُضيف الآن
            } else if (prev !== undefined && line.quantity > prev) {
                queue.push({ line: line, mode: 'more', extra: line.quantity - prev });
            }
        });
        processQueue();
    }

    function refreshUI() {
        inUpdate = true;
        try { if (typeof window.updateCartUI === 'function') window.updateCartUI(); } finally { inUpdate = false; }
    }

    function processQueue() {
        if (busy || !queue.length) return;
        busy = true;
        var job = queue.shift();
        var line = job.line;
        var req = getReq(line);
        if (!req || cart.indexOf(line) === -1) { busy = false; processQueue(); return; }

        var note = job.mode === 'more' ? 'أضفت ' + job.extra + ' قطعة أخرى — اترك نفس المعلومة أو اكتب معلومة مختلفة لهذه القطعة' : '';
        ask(line, req, job.mode === 'more' ? line.reqValue : '', note).then(function (val) {
            var i = cart.indexOf(line);
            if (i !== -1) {
                if (job.mode === 'new') {
                    if (val === null && job.keep) {
                        // من داخل السلة أو عند الدفع: نُبقي المنتج، ويبقى مطلوباً قبل إتمام الطلب
                        if (typeof showToast === 'function') showToast('"' + line.name + '" يحتاج ' + req.label + ' قبل إتمام الطلب', 'warn');
                    } else if (val === null) {
                        cart.splice(i, 1);
                        if (typeof showToast === 'function') showToast('لم تتم إضافة "' + line.name + '" — المعلومة المطلوبة لم تُدخل', 'warn');
                    } else {
                        line.reqType = req.type; line.reqLabel = req.label; line.reqValue = val;
                        if (typeof showToast === 'function') showToast('تمت إضافة "' + line.name + '" مع ' + req.label, 'success');
                    }
                } else {   // 'more' — قطع إضافية لنفس المنتج
                    if (val === null) {
                        line.quantity = Math.max(1, line.quantity - job.extra);
                    } else if (val !== line.reqValue) {
                        line.quantity = Math.max(1, line.quantity - job.extra);
                        var copy = JSON.parse(JSON.stringify(line));
                        copy.quantity = job.extra; copy.reqValue = val; copy.reqLabel = req.label; copy.reqType = req.type;
                        cart.splice(i + 1, 0, copy);
                        seenQty.set(copy, copy.quantity);
                    }
                    seenQty.set(line, line.quantity);
                }
                saveCart();
                refreshUI();
            }
            busy = false;
            processQueue();
        });
    }

    // يُستدعى قبل الدفع: أي منتج ينقصه معلومة ← نطلبها بدل المتابعة
    function hasMissing() {
        return (typeof cart !== 'undefined') && cart.some(function (l) { return getReq(l) && !l.reqValue; });
    }

    // ── إظهار المعلومة داخل السلة ───────────────────────────────────────
    function decorateCart() {
        var box = document.getElementById('cartItems');
        if (!box || typeof cart === 'undefined') return;
        var rows = box.querySelectorAll(':scope > .cart-item');
        cart.forEach(function (line, idx) {
            var row = rows[idx];
            if (!row || !line) return;
            var details = row.children[1];
            if (!details || details.querySelector('.cart-req')) return;
            var p = document.createElement('p');
            if (line.reqValue) {
                p.className = 'cart-req';
                p.innerHTML = '<i class="fas ' + (REQ_ICONS[line.reqType] || 'fa-info-circle') + '"></i> ' + esc(line.reqLabel || 'المعلومة') + ': <b>' + esc(line.reqValue) + '</b>';
            } else {
                var req = getReq(line);
                if (!req) return;
                p.className = 'cart-req missing';
                p.setAttribute('role', 'button');
                p.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ينقص: ' + esc(req.label) + ' — <u>اضغط للإدخال</u>';
                p.addEventListener('click', function (e) {
                    e.stopPropagation();
                    if (!queue.some(function (q) { return q.line === line; })) queue.push({ line: line, mode: 'new', keep: true });
                    processQueue();
                });
            }
            details.appendChild(p);
        });
    }

    // ── التركيب (بعد أن يستبدل main.js دالة updateCartUI في DOMContentLoaded) ──
    function install() {
        if (typeof window.updateCartUI === 'function' && !window.updateCartUI.__reqWrapped) {
            var orig = window.updateCartUI;
            var wrapped = function () {
                var r = orig.apply(this, arguments);
                if (!inUpdate) { try { scan(); } catch (e) { console.error('req scan', e); } }
                try { decorateCart(); } catch (e) {}
                return r;
            };
            wrapped.__reqWrapped = true;
            window.updateCartUI = wrapped;
        }
        if (typeof window.renderCartItems === 'function' && !window.renderCartItems.__reqWrapped) {
            var origR = window.renderCartItems;
            var wr = function () { var r = origR.apply(this, arguments); try { decorateCart(); } catch (e) {} return r; };
            wr.__reqWrapped = true;
            window.renderCartItems = wr;
        }
        // منتجات في السلة من زيارة سابقة لم تُدخل معلوماتها (أو أضاف المدير متطلباً جديداً):
        // لا نزعج الزائر بنافذة عند فتح الموقع — تظهر ملاحظة داخل السلة، وتُطلب عند إتمام الطلب
        try { scan('init'); } catch (e) {}                         // السلة المحفوظة = "قديمة" وليست إضافة جديدة
        setTimeout(function () { try { decorateCart(); } catch (e) {} }, 1500);   // بعد تحميل تعديلات المدير
    }
    document.addEventListener('DOMContentLoaded', install);

    // حارس زر "إتمام الطلب": لا متابعة ما دام منتج في السلة ينقصه معلومة
    document.addEventListener('click', function (e) {
        var btn = e.target.closest && e.target.closest('#checkoutBtn');
        if (!btn || !hasMissing()) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        if (typeof showToast === 'function') showToast('بعض المنتجات تحتاج معلومة منك قبل إتمام الطلب', 'warn');
        scan('checkout');
    }, true);
}());
