/* ══════════════════════════════════════════════════════════════════════
 * شريط الإعلانات + بانر العروض (يتحكم بهما المدير من: أدوات المدير ← الإعلانات والعروض)
 *   config/ticker = [{ text, link, until, on }]
 *   config/promos = [{ title, sub, image, badge, badgeColor, cta, link, until, countdown, on }]
 *   link: '' | 'cat:<id>' | 'search:<كلمة>' | 'url:https://...'
 * ══════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';
    var ticker = [], promos = [];
    var tkTimer = null, tkIdx = 0, prTimer = null, cdTimer = null;

    function esc(s) { return String(s === null || s === undefined ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function asArr(v) { return Array.isArray(v) ? v.filter(Boolean) : (v && typeof v === 'object' ? Object.keys(v).map(function (k) { return v[k]; }).filter(Boolean) : []); }
    function live(x) { return x && x.on !== false && (!x.until || Number(x.until) > Date.now()); }

    // ── فتح رابط الإعلان/العرض ──
    window.zoodnyFollowLink = function (link) {
        link = String(link || '');
        var i = link.indexOf(':'), type = link.slice(0, i), val = link.slice(i + 1);
        if (!val) return;
        if (type === 'cat' && typeof window.showCategoryProducts === 'function') {
            window.showCategoryProducts(val);
        } else if (type === 'search') {
            var inp = document.getElementById('globalSearchInput');
            if (!inp) return;
            var home = document.getElementById('home');
            if (home) window.scrollTo({ top: Math.max(0, home.offsetTop), behavior: 'smooth' });
            inp.value = val;
            inp.dispatchEvent(new Event('input', { bubbles: true }));
            setTimeout(function () { try { inp.focus({ preventScroll: true }); } catch (e) { inp.focus(); } }, 350);
        } else if (type === 'url') {
            if (/^https?:\/\//i.test(val)) {
                if (val.indexOf(location.origin) === 0) location.href = val; else window.open(val, '_blank', 'noopener');
            }
        }
    };

    // ═══════════════ شريط الإعلانات ═══════════════
    function tkSig(list) { return list.map(function (x) { return x.text; }).join('|'); }
    function renderTicker() {
        var el = document.getElementById('zTicker');
        if (!el) return;
        clearInterval(tkTimer);
        var list = ticker.filter(live).filter(function (x) { return String(x.text || '').trim(); });
        var closedSig = '';
        try { closedSig = localStorage.getItem('zoodnyTickerClosed') || ''; } catch (e) {}
        if (!list.length || closedSig === tkSig(list)) { el.hidden = true; el.innerHTML = ''; document.documentElement.classList.remove('has-ticker'); return; }
        el.hidden = false;
        document.documentElement.classList.add('has-ticker');
        el.innerHTML = '<div class="tk-inner"><span class="tk-ic"><i class="fas fa-bullhorn"></i></span><div class="tk-track">' +
            list.map(function (x, i) {
                return '<button type="button" class="tk-msg' + (i === 0 ? ' on' : '') + '"' + (x.link ? ' data-link="' + esc(x.link) + '"' : '') + '>' +
                    esc(x.text) + (x.link ? ' <i class="fas fa-chevron-left tk-go"></i>' : '') + '</button>';
            }).join('') + '</div>' +
            (list.length > 1 ? '<span class="tk-dots">' + list.map(function (_, i) { return '<i class="' + (i === 0 ? 'on' : '') + '"></i>'; }).join('') + '</span>' : '') +
            '<button type="button" class="tk-x" aria-label="إغلاق"><i class="fas fa-times"></i></button></div>';
        tkIdx = 0;
        var msgs = el.querySelectorAll('.tk-msg'), dots = el.querySelectorAll('.tk-dots i');
        function show(n) {
            msgs.forEach(function (m, i) { m.classList.toggle('on', i === n); });
            dots.forEach(function (d, i) { d.classList.toggle('on', i === n); });
        }
        if (msgs.length > 1) tkTimer = setInterval(function () { tkIdx = (tkIdx + 1) % msgs.length; show(tkIdx); }, 4500);
        el.querySelectorAll('.tk-msg[data-link]').forEach(function (m) {
            m.addEventListener('click', function () { window.zoodnyFollowLink(m.dataset.link); });
        });
        el.querySelector('.tk-x').addEventListener('click', function () {
            try { localStorage.setItem('zoodnyTickerClosed', tkSig(list)); } catch (e) {}
            el.classList.add('tk-out');
            setTimeout(function () { el.classList.remove('tk-out'); renderTicker(); }, 300);
        });
    }

    // ═══════════════ بانر العروض ═══════════════
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function cdText(until) {
        var ms = Number(until) - Date.now();
        if (ms <= 0) return 'انتهى العرض';
        var s = Math.floor(ms / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
        return (d ? '<b>' + d + '</b> يوم ' : '') + '<b>' + pad(h) + ':' + pad(m) + ':' + pad(sec) + '</b>';
    }
    function renderPromos() {
        var sec = document.getElementById('zPromos');
        if (!sec) return;
        clearInterval(prTimer); clearInterval(cdTimer);
        var list = promos.filter(live).filter(function (x) { return x.title || x.image; });
        if (!list.length) { sec.hidden = true; sec.innerHTML = ''; return; }
        sec.hidden = false;
        sec.innerHTML = '<div class="pr-wrap"><div class="pr-track" id="prTrack">' + list.map(function (x, i) {
            var bg = x.image ? ' style="background-image:url(\'' + esc(x.image).replace(/'/g, '%27') + '\')"' : '';
            return '<article class="pr-card' + (x.image ? '' : ' no-img') + '"' + bg + ' data-i="' + i + '">' +
                '<div class="pr-shade"></div>' +
                '<div class="pr-body">' +
                    (x.badge ? '<span class="pr-badge ' + esc(x.badgeColor || 'gold') + '">' + esc(x.badge) + '</span>' : '') +
                    (x.title ? '<h3 class="pr-title">' + esc(x.title) + '</h3>' : '') +
                    (x.sub ? '<p class="pr-sub">' + esc(x.sub) + '</p>' : '') +
                    (x.countdown && x.until ? '<div class="pr-cd" data-until="' + Number(x.until) + '"><i class="far fa-clock"></i> ينتهي خلال ' + cdText(x.until) + '</div>' : '') +
                    (x.link ? '<button type="button" class="pr-cta" data-link="' + esc(x.link) + '">' + esc(x.cta || 'اطلب الآن') + ' <i class="fas fa-arrow-left"></i></button>' : '') +
                '</div></article>';
        }).join('') + '</div>' +
        (list.length > 1 ? '<button type="button" class="pr-nav prev" aria-label="السابق"><i class="fas fa-chevron-right"></i></button>' +
                           '<button type="button" class="pr-nav next" aria-label="التالي"><i class="fas fa-chevron-left"></i></button>' +
                           '<div class="pr-dots">' + list.map(function (_, i) { return '<button type="button" data-go="' + i + '" class="' + (i === 0 ? 'on' : '') + '" aria-label="عرض ' + (i + 1) + '"></button>'; }).join('') + '</div>' : '') +
        '</div>';

        var track = sec.querySelector('.pr-track'), cards = sec.querySelectorAll('.pr-card'), dots = sec.querySelectorAll('.pr-dots button');
        var cur = 0, paused = false;
        function go(n, smooth) {
            cur = (n + cards.length) % cards.length;
            var c = cards[cur];
            track.scrollTo({ left: c.offsetLeft - (track.clientWidth - c.clientWidth) / 2, behavior: smooth === false ? 'auto' : 'smooth' });
            dots.forEach(function (d, i) { d.classList.toggle('on', i === cur); });
        }
        // مزامنة النقاط عند السحب باليد
        var st = null;
        track.addEventListener('scroll', function () {
            clearTimeout(st);
            st = setTimeout(function () {
                var mid = track.scrollLeft + track.clientWidth / 2, best = 0, bd = Infinity;
                cards.forEach(function (c, i) { var d = Math.abs(c.offsetLeft + c.clientWidth / 2 - mid); if (d < bd) { bd = d; best = i; } });
                cur = best;
                dots.forEach(function (d, i) { d.classList.toggle('on', i === cur); });
            }, 80);
        }, { passive: true });
        dots.forEach(function (d) { d.addEventListener('click', function () { go(Number(d.dataset.go)); }); });
        var prev = sec.querySelector('.pr-nav.prev'), next = sec.querySelector('.pr-nav.next');
        if (prev) prev.addEventListener('click', function () { go(cur - 1); });
        if (next) next.addEventListener('click', function () { go(cur + 1); });
        ['pointerdown', 'touchstart', 'mouseenter'].forEach(function (ev) { sec.addEventListener(ev, function () { paused = true; }, { passive: true }); });
        ['mouseleave', 'touchend'].forEach(function (ev) { sec.addEventListener(ev, function () { setTimeout(function () { paused = false; }, 3000); }, { passive: true }); });
        if (cards.length > 1) prTimer = setInterval(function () { if (!paused && !document.hidden) go(cur + 1); }, 5500);
        sec.querySelectorAll('.pr-cta').forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); window.zoodnyFollowLink(b.dataset.link); }); });
        cards.forEach(function (c) {
            var b = c.querySelector('.pr-cta');
            if (b) c.addEventListener('click', function () { window.zoodnyFollowLink(b.dataset.link); });
        });
        var cds = sec.querySelectorAll('.pr-cd');
        if (cds.length) cdTimer = setInterval(function () {
            cds.forEach(function (el) {
                var u = Number(el.dataset.until);
                if (u <= Date.now()) { renderPromos(); return; }
                el.innerHTML = '<i class="far fa-clock"></i> ينتهي خلال ' + cdText(u);
            });
        }, 1000);
    }

    function start() {
        if (typeof dbRef !== 'function') return;
        dbRef('config/ticker').on('value', function (s) { ticker = asArr(s.val()); renderTicker(); }, function () {});
        dbRef('config/promos').on('value', function (s) { promos = asArr(s.val()); renderPromos(); }, function () {});
        // إعلانات/عروض انتهت مدتها تختفي وحدها (نعيد الرسم فقط عند تغيّر ما هو فعّال)
        function liveSig(arr) { return arr.filter(live).map(function (x) { return x.text || x.title || ''; }).join('|'); }
        var lastT = '', lastP = '';
        setInterval(function () {
            var t = liveSig(ticker), p = liveSig(promos);
            if (t !== lastT) { lastT = t; renderTicker(); }
            if (p !== lastP) { lastP = p; renderPromos(); }
        }, 30000);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
}());
