/* THE PAGES' OWN BEHAVIOUR (site/js/pages.js): the belt of covers and the booking form on Production, the photograph and its texts on About, and Buy on Products.
   Each page's markup is already in the document (from the server, or put there by the engine from the same templates); this file only brings it to life.
   It does not need the engine or the drawing: it watches the body's data-page and wires a page the first time it is shown, so it also runs where WebGL does not.
   window.__AD.mode is 'site' on the real site and 'file' in the one-file prototype, where nothing is sent anywhere. */
(function () {
  'use strict';
  var doc = document, body = doc.body, dest = doc.getElementById('dest'); if (!dest) return;
  var AD = window.__AD || {}, SITE = window.ADSite || {}, NS = 'http://www.w3.org/2000/svg';
  var calm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var wideMq = window.matchMedia ? window.matchMedia('(min-width: 700px) and (min-height: 560px)') : null;       /* WIDE: the same two numbers as site/css/wide.css */
  function wide() { return !!(wideMq && wideMq.matches); }
  var hooks = {};

  /* ================================================================== PRODUCTION · THE BELT
     The covers travel across the page like a conveyor belt, from left to right, the first in Anthony's order leading and the others following it (he asked for the belt, liked it,
     and set the order himself: 24 Nov 2026). Two runs of the covers stand end to end, so the belt has no seam. It waits while a mouse rests on it or a finger holds it, can be pulled
     either way by hand, and stands still off screen. For visitors who ask for reduced motion it does not move: one plain row, in his order, scrolled by hand.
     In the page the covers are listed in his order; the row is laid out right to left so the first is the one in front.
     EACH COVER IS A LINK to its release on YouTube (his words, 24 Nov 2026). A press that does not move opens it; a pull along the belt moves the belt and opens nothing. */
  function wireBelt(sec) {
    var cvs = sec.querySelector('.cvs'), belt = sec.querySelector('.belt'), track = belt && belt.querySelector('.belt-track'); if (!track || !track.children.length) return null;
    var N = track.children.length, on = false, bx = 0, period = 0, raf = 0, last = 0, hold = false, hover = false, keys = false, seen = true, wait = 0, drag = null, speed = 30, pitch = 0, pulled = false;
    if (calm) belt.classList.add('still');
    else Array.prototype.slice.call(track.children).forEach(function (li) { var c = li.cloneNode(true), a = c.querySelector('a'); c.setAttribute('aria-hidden', 'true'); if (a) a.tabIndex = -1; track.appendChild(c); });       /* the second run is for the eye only: the keyboard and a screen reader meet each cover once */
    /* TWO ROWS OF TEXT UNDER A COVER AND NEVER THREE (his words: "two rows of text only, change if needed"): the title, then the artist on one row. A credit with several names that
       does not fit drops names from the end and says so with an ellipsis; the cover's own name keeps the whole credit. */
    function fitNames() {
      Array.prototype.forEach.call(track.querySelectorAll('.belt-by'), function (el) {
        var full = el.getAttribute('data-full'), parts = full.split(', '), k; el.textContent = full; if (el.scrollWidth <= el.clientWidth + .5) return;
        for (k = parts.length - 1; k >= 1; k--) { el.textContent = parts.slice(0, k).join(', ') + '…'; if (el.scrollWidth <= el.clientWidth + .5) return; }
        el.textContent = full;
      });
    }
    function layout() {
      /* A COVER IS NEVER ON SCREEN TWICE. On a wide screen the covers would come round while their first run was still in view, so there the space between covers opens until one run
         is as long as the screen and a cover more. On a phone the stylesheet's own gap already is. */
      cvs.style.removeProperty('--gap');
      var b = track.children[0].getBoundingClientRect().width, own = parseFloat(getComputedStyle(cvs).getPropertyValue('--gap')) || 22, need = Math.ceil((belt.clientWidth + b) / N - b), gap = Math.max(own, need);
      if (!calm && gap > own) cvs.style.setProperty('--gap', gap + 'px');
      fitNames(); period = track.scrollWidth / 2; pitch = b + gap; speed = wide() ? pitch / 4.5 : 30;       /* about four and a half seconds a cover; 30 px a second on a phone */
    }
    function place() { if (calm || !period) { track.style.transform = ''; return; } var m = ((bx % period) + period) % period; track.style.transform = 'translate3d(' + (m - period).toFixed(2) + 'px,0,0)'; }
    function tick(now) {
      raf = 0; if (!on || calm) return; var dt = Math.min(64, now - (last || now)); last = now;
      if (!hold && !hover && !keys && seen && now >= wait) { bx += dt / 1000 * speed; place(); }
      raf = requestAnimationFrame(tick);
    }
    function start() {
      layout(); if (!period || calm) { place(); return; }
      /* arrive with the first in front, at the right of the screen, and the next ones behind it */
      bx = 0; place(); var lead = track.children[0].getBoundingClientRect(), box = belt.getBoundingClientRect(); bx = (box.right - (wide() ? 40 : 16)) - (lead.right - period); place();
      hold = false; hover = false; wait = performance.now() + 600; if (!raf) { last = 0; raf = requestAnimationFrame(tick); }
    }
    /* A PRESS OR A PULL. The belt takes hold of the pointer only once it has moved 6 px along the belt: until then a press belongs to the cover under it, which is a link.
       After a pull, the click that the browser sends when the pointer lifts is swallowed, so letting go of the belt never opens a cover. */
    belt.addEventListener('pointerdown', function (ev) { ev.stopPropagation(); pulled = false; if (calm || (ev.pointerType === 'mouse' && ev.button !== 0)) return; hold = true; drag = { id: ev.pointerId, x: ev.clientX, bx: bx, moved: false }; });       /* the page's own press marks stay off the covers */
    belt.addEventListener('pointermove', function (ev) {
      if (!drag || ev.pointerId !== drag.id) return; var dx = ev.clientX - drag.x;
      if (!drag.moved) { if (Math.abs(dx) < 6) return; drag.moved = true; try { belt.setPointerCapture(ev.pointerId); } catch (e) {} belt.classList.add('drag'); }
      bx = drag.bx + dx; place();
    });
    function up(ev) { if (!drag || (ev && ev.pointerId !== drag.id)) return; hold = false; pulled = drag.moved; wait = performance.now() + (drag.moved ? 900 : 0); drag = null; belt.classList.remove('drag'); }
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);       /* on the window: a press that began on the belt may end anywhere */
    belt.addEventListener('click', function (ev) { if (pulled) { pulled = false; ev.preventDefault(); ev.stopPropagation(); } }, true);
    belt.addEventListener('pointerenter', function (ev) { if (ev.pointerType === 'mouse') hover = true; }); belt.addEventListener('pointerleave', function () { hover = false; });
    belt.addEventListener('dragstart', function (ev) { ev.preventDefault(); });
    belt.addEventListener('scroll', function () { if (!calm && belt.scrollLeft) belt.scrollLeft = 0; });       /* travelling, the belt is moved by the script alone */
    /* THE KEYBOARD: the belt can be reached with Tab; it waits while it is held that way, and the left and right arrows move it a cover at a time
       (anything that moves by itself for more than a few seconds needs a way to be stopped by every visitor, not only one with a mouse or a finger) */
    belt.tabIndex = 0;
    belt.addEventListener('focus', function () { var kb = true; try { kb = belt.matches(':focus-visible'); } catch (e) {} keys = kb; });
    belt.addEventListener('blur', function () { keys = false; wait = performance.now() + 600; });
    belt.addEventListener('keydown', function (ev) { var step = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0; if (!step || ev.altKey || ev.ctrlKey || ev.metaKey) return; ev.preventDefault(); if (calm) { belt.scrollLeft -= step * (pitch || 150); return; } keys = true; bx += step * pitch; place(); });
    /* Tab goes on from the belt to each cover in his order. The belt waits while the keyboard is on one, and brings that cover to the middle of the screen (it may have been out
       of sight). Each cover stands on the belt twice, once in each run, and the keyboard is only ever on the first: so the mark of the keyboard (the class kb) is put on both, and
       whichever of the two is nearer is the one brought to the middle. */
    function unmark() { Array.prototype.forEach.call(track.querySelectorAll('.belt-item.kb'), function (li) { li.classList.remove('kb'); }); }
    track.addEventListener('focusin', function (ev) {
      var a = ev.target && ev.target.closest ? ev.target.closest('.belt-a') : null, kb = true, li, i, twin, box, mid, d1, d2; if (!a) return; try { kb = a.matches(':focus-visible'); } catch (e) {} unmark(); if (!kb) return;
      li = a.parentNode; i = Array.prototype.indexOf.call(track.children, li); twin = track.children[i + N] || null; li.classList.add('kb'); if (twin) twin.classList.add('kb');
      keys = true; if (calm || !period) return;
      box = belt.getBoundingClientRect(); mid = box.left + box.width / 2; d1 = li.getBoundingClientRect(); d1 = mid - (d1.left + d1.width / 2); d2 = d1;
      if (twin) { d2 = twin.getBoundingClientRect(); d2 = mid - (d2.left + d2.width / 2); }
      bx += Math.abs(d2) < Math.abs(d1) ? d2 : d1; place();
    });
    track.addEventListener('focusout', function (ev) { unmark(); if (!belt.contains(ev.relatedTarget)) { keys = false; wait = performance.now() + 600; } });
    if (window.IntersectionObserver) new IntersectionObserver(function (es) { seen = es[es.length - 1].isIntersecting; }, { threshold: .05 }).observe(belt);
    hooks.cvs = { order: (SITE.RELEASES || []).map(function (r) { return r.title + ' ' + r.released; }), links: Array.prototype.map.call(track.querySelectorAll('.belt-item:not([aria-hidden]) a.belt-a'), function (a) { return a.getAttribute('href'); }),
      state: function () { var now = performance.now(); return { on: on, belt: { x: +bx.toFixed(1), period: +period.toFixed(1), pitch: +pitch.toFixed(1), moving: !!raf && !hold && !hover && !keys && seen && now >= wait, speed: +speed.toFixed(1) } }; } };
    window.__cvs = hooks.cvs;
    return {
      open: function () { on = true; start(); },
      close: function () { on = false; if (raf) cancelAnimationFrame(raf); raf = 0; drag = null; hold = false; keys = false; belt.classList.remove('drag'); },
      resize: function () { if (on) { layout(); place(); } }
    };
  }

  /* ================================================================== PRODUCTION · THE BOOKING FORM
     Four fields, his: name, email, a link to music they already have out, a note. The first two are needed. A needed field left empty says so beside its label, in ink, and the first
     of them takes the cursor. Sent, the form gives way in place to "Sent." On the site the four go to /api/book, which keeps the request and emails Anthony; if that fails the form stays
     and says so. In the one-file prototype nothing is sent. The form is fresh each time the page is opened again. Without scripts it is a plain form to the same address. */
  function wireForm(sec) {
    var form = sec.querySelector('#bk'), done = sec.querySelector('#bkdone'); if (!form || !done) return null;
    var fields = Array.prototype.slice.call(form.querySelectorAll('.bk-f input,.bk-f textarea')), note = form.querySelector('textarea'), fail = form.querySelector('.bk-fail'), B = SITE.BOOKING || {}, opened = 0;
    form.noValidate = true;       /* the page says what is missing in its own words; with scripts off the browser's own checks stand in */
    function say(f, msg) { var e = f.parentNode.querySelector('.bk-e'); if (e) { e.textContent = msg || (f.required ? '' : (B.optional || 'Optional')); e.classList.toggle('on', !!msg); } if (msg) f.setAttribute('aria-invalid', 'true'); else f.removeAttribute('aria-invalid'); }
    function check(f) { var v = f.value.trim(); if (f.required && !v) return B.needed || 'Needed'; if (f.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return B.badEmail || 'Check the address'; return ''; }
    function grow() { if (!note) return; note.style.height = 'auto'; if (note.value) note.style.height = note.scrollHeight + 'px'; }       /* the note grows a line at a time as it is written */
    function fresh() { form.reset(); fields.forEach(function (f) { say(f, ''); }); grow(); form.classList.remove('busy'); if (fail) fail.hidden = true; form.hidden = false; done.hidden = true; }
    function sent() { form.classList.remove('busy'); form.hidden = true; done.hidden = false; var h = done.querySelector('h2'); if (h) { try { h.focus({ preventScroll: true }); } catch (e) {} } }
    function failed() { form.classList.remove('busy'); if (fail) fail.hidden = false; }
    form.addEventListener('submit', function (ev) {
      ev.preventDefault(); if (form.classList.contains('busy')) return;
      var first = null; fields.forEach(function (f) { var m = check(f); say(f, m); if (m && !first) first = f; });
      if (first) { first.focus(); return; }
      if (AD.mode !== 'site' || !window.fetch) { sent(); return; }       /* the prototype sends nothing: it shows what a visitor would see next */
      var v = function (n) { var f = form.elements[n]; return f ? String(f.value || '').trim() : ''; };
      form.classList.add('busy'); if (fail) fail.hidden = true;
      fetch(form.getAttribute('action') || '/api/book', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: v('name'), email: v('email'), link: v('link'), note: v('note'), website: v('website'), eventType: B.type || 'Production' }) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (r.ok && j && j.ok) sent(); else failed(); }); })
        .catch(failed);
    });
    form.addEventListener('input', function (ev) { var f = ev.target; if (f === note) grow(); if (f.getAttribute && f.getAttribute('aria-invalid')) say(f, check(f)); });
    return { open: function () { if (opened++) fresh(); } };       /* the first showing is left as the document has it: the server may have put the "Sent." words there (a form posted without scripts) */
  }

  /* ================================================================== A MESSAGE BUBBLE'S PENCIL LINE, in the small size the About page uses
     fit: a text is as wide as its longest line and no wider, so the line sits close round the words. cut: the home screen's bubble shape at three quarters (corner 13, the tail in proportion). */
  function fit(q) {
    q.style.width = ''; var rg = doc.createRange(), rs, i, l = Infinity, r = -Infinity, cs; rg.selectNodeContents(q); rs = rg.getClientRects();
    for (i = 0; i < rs.length; i++) { if (!rs[i].width) continue; if (rs[i].left < l) l = rs[i].left; if (rs[i].right > r) r = rs[i].right; }
    if (r > l) { cs = getComputedStyle(q); q.style.width = Math.ceil(r - l + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + 1) + 'px'; }
  }
  var K = .75, TAIL = 5;
  function cut(f) {
    var q = f.querySelector('blockquote'), sv = f.querySelector('svg.bub'), w, h, r = 13, t = function (n) { return +(n * K).toFixed(2); };
    if (!sv) { sv = doc.createElementNS(NS, 'svg'); sv.setAttribute('class', 'bub'); sv.setAttribute('aria-hidden', 'true'); sv.appendChild(doc.createElementNS(NS, 'path')); f.insertBefore(sv, q); }
    w = q.offsetWidth; h = q.offsetHeight; if (!w || !h) return;
    sv.setAttribute('viewBox', '0 0 ' + w + ' ' + h); sv.style.width = w + 'px'; sv.style.height = h + 'px'; sv.style.left = q.offsetLeft + 'px'; sv.style.top = q.offsetTop + 'px';
    sv.firstChild.setAttribute('d', 'M' + r + ' 0H' + (w - r) + 'Q' + w + ' 0 ' + w + ' ' + r + 'V' + (h - r) + 'Q' + w + ' ' + h + ' ' + (w - r) + ' ' + h + 'H' + t(20) + 'C' + t(13) + ' ' + h + ' ' + t(5) + ' ' + (h + t(5)) + ' ' + (-t(7)) + ' ' + (h + t(6)) + 'C0 ' + (h + t(2)) + ' 0 ' + (h - t(4)) + ' 0 ' + (h - t(15)) + 'V' + r + 'Q0 0 ' + r + ' 0Z');
  }

  /* ================================================================== ABOUT · THE PHOTOGRAPH AND ITS TEXTS, THEN HIS BIO
     (his words: "I kind of want the texts to be much smaller and then surround the photo maybe?" and "it cant scroll its all got to fit on one page", 24 Nov 2026; later that day he
     sent his bio for this page, asked for the texts "spread out just a little bit more laterally", each still overlapping the photograph "just a little bit", and for them to lean
     to the mouse.)
     THE PHOTOGRAPH TAKES THE HEIGHT THAT IS LEFT. What must share the screen with it is measured as it stands, and the photograph gets the rest, with the room its texts need above
     and below it. On a laptop (BESIDE) the bio stands beside the photograph, so label, photograph, credit and Back share one screen and nothing scrolls. Anywhere else the bio is
     under the photograph: the first screen is the label, the photograph and the credit, with PEEK px kept at its foot so the bio's first words show and say there is more below.
     On a screen too short to give the photograph MIN4 px of height with four texts round it, the two at the foot are left out (as the home screen leaves out its text on a short
     screen); too short even then, it keeps MIN2 px and the page scrolls. The screen's visible height is used, so a phone's toolbars are allowed for.
     On a phone the photograph is never wider than 78% of the column, and the texts are pinned to the column's sides. On a wide screen the wall the texts are pinned to is drawn in
     to the photograph: it is the photograph and OUT px more on each side (and never too narrow for a text from each side to stand side by side), so the texts keep the same hold on
     the photograph's sides whether a short window makes it small or a large monitor makes it big. OUT was 130; at 165 each text still lies some 24 to 55 px over the photograph.
     How wide a text is depends on the visitor's own fonts (an emoji is not the same width on every machine), so the overlap is not left to chance: a text that would lie less than
     OVER px on the photograph is drawn in until it does.
     Where each text is pinned is in site/content.mjs (ABOUT.texts). */
  function wireAbout(sec) {
    var abt = sec.querySelector('.abt'), show = sec.querySelector('.abt-show'), wall = sec.querySelector('.abt-wall'), credit = sec.querySelector('.abt-c'), bio = sec.querySelector('.abt-bio'),
        pf = wall && wall.querySelector('.abt-pic'), figs = wall ? Array.prototype.slice.call(wall.querySelectorAll('.msg')) : []; if (!wall) return null;
    var A = SITE.ABOUT || { texts: [], photo: { w: 2, h: 3 } }, TEXTS = A.texts, RATIO = A.photo.h / A.photo.w, MIN4 = 220, MIN2 = 200, shown = figs.length, im = pf && pf.querySelector('img'), two = false;
    if (!pf) wall.classList.add('plain');
    var OUT = 165;       /* a wide screen: how far the texts' outer edges stand from the photograph's sides, px */
    var OVER = 24, HOLD = 8;       /* a wide screen: the least a text lies over the photograph where it stands, and the least the lean may ever leave it, px */
    var GAP = 56, PEEK = 30;       /* beside: the space between the texts and the bio (the same number as the stylesheet's gap). under: how much of the bio shows at the foot of the first screen, px */
    var besideMq = window.matchMedia ? window.matchMedia('(min-width: 1180px) and (min-height: 640px)') : null;       /* BESIDE: the same two numbers as site/css/wide.css */
    function beside() { return !!(bio && show && besideMq && besideMq.matches); }
    function widest(W) { return wide() ? W - 2 * OUT : W * .78; }       /* the most width the photograph may take of a wall W wide */
    function outer(el) { if (!el) return 0; var cs = getComputedStyle(el); return el.offsetHeight + (parseFloat(cs.marginTop) || 0) + (parseFloat(cs.marginBottom) || 0); }
    /* where the first n texts sit on a photograph Hp tall: their tops, measured from the photograph's top, and how far they stand out above it and below it */
    function room(Hp, n) {
      var ys = [], up = 0, down = 0, i, t, h, y;
      for (i = 0; i < n; i++) { t = TEXTS[i]; h = figs[i].offsetHeight; y = Math.round(t[3] * Hp) + t[4] - (t[2] === 'foot' ? h : 0); ys.push(y); if (-y > up) up = -y; if (y + h - Hp > down) down = y + h - Hp; }
      return { ys: ys, up: up, down: down ? down + TAIL : 0 };
    }
    function place() {
      if (!pf) return; wall.style.maxWidth = ''; if (show) show.style.width = '';
      two = beside();
      if (two) show.style.width = Math.max(0, Math.floor(Math.min(Math.max(720, Math.min(1000, window.innerWidth * .5)), abt.clientWidth - bio.offsetWidth - GAP))) + 'px';       /* the most room the photograph and its texts may have beside the bio */
      var W = wall.clientWidth, maxH = Math.round(widest(W) * RATIO), back = dest.querySelector('a.back'), pad = parseFloat(getComputedStyle(dest).paddingBottom) || 0, above, below, avail, n = Math.min(4, figs.length), Hp, r, pw, lw = 0, rw = 0, i, ww; if (!W) return;
      figs.forEach(function (f) { f.classList.remove('out'); });
      /* the page may still be sliding in when this first runs, so nothing is measured against the screen: a height is the distance between two things on the page,
         to a part of a px, and the screen's height is the page box's own */
      above = (abt.getBoundingClientRect().top - dest.getBoundingClientRect().top) + dest.scrollTop + (parseFloat(getComputedStyle(wall).marginTop) || 0);
      below = outer(credit) + (two || !bio ? outer(back) + pad : (parseFloat(getComputedStyle(bio).marginTop) || 0) + PEEK);
      avail = Math.min(dest.clientHeight, window.innerHeight - dest.offsetTop) - above - below - 2;
      function most(n, min) { var H, q; for (H = maxH; H >= min; H--) { q = room(H, n); if (q.up + H + q.down <= avail) return H; } return 0; }
      Hp = most(n, Math.min(MIN4, maxH)); if (!Hp && n > 2) { n = 2; Hp = most(2, Math.min(MIN2, maxH)) || Math.min(MIN2, maxH); } else if (!Hp) Hp = Math.min(MIN2, maxH);
      shown = n; pw = Math.round(Hp / RATIO); pf.style.width = pw + 'px';
      if (wide()) { for (i = 0; i < n; i++) { if (TEXTS[i][1] === 'l') lw = Math.max(lw, figs[i].offsetWidth); else rw = Math.max(rw, figs[i].offsetWidth); } ww = Math.min(W, Math.max(pw + 2 * OUT, lw + rw + 24)); wall.style.maxWidth = ww + 'px'; if (two) show.style.width = ww + 'px'; }
      r = room(pf.offsetHeight, n);
      wall.style.paddingTop = r.up + 'px'; wall.style.paddingBottom = r.down + 'px';
      var side = wide() ? (wall.clientWidth - pw) / 2 : 0;       /* a wide screen: the room beside the photograph */
      figs.forEach(function (f, i) {
        if (i >= n) { f.classList.add('out'); f.style.top = f.style.left = f.style.right = ''; return; }
        var left = TEXTS[i][1] === 'l', over = f.offsetWidth - side, inn = wide() ? Math.max(0, Math.ceil(OVER - over)) : 0, lim = Math.max(0, over + inn - HOLD);
        f.style.top = (r.up + r.ys[i]) + 'px'; f.style.left = left ? inn + 'px' : 'auto'; f.style.right = left ? 'auto' : inn + 'px';
        /* the lean may carry a text further over the photograph as far as it likes, and away from it only until HOLD px of it are left there */
        f.style.setProperty('--lo', (left && wide() ? -lim : -99) + 'px'); f.style.setProperty('--hi', (!left && wide() ? lim : 99) + 'px');
      });
      wall.classList.add('set');
    }
    function all() { if (sec.hidden || body.getAttribute('data-page') !== 'about') return; figs.forEach(function (f) { f.classList.remove('out'); fit(f.querySelector('blockquote')); }); figs.forEach(cut); place(); }
    if (im && !im.complete) im.addEventListener('load', all);
    /* THE TEXTS LEAN TO THE MOUSE, the way the photographs on humanperson.com's home screen do (read from their page on 24 Nov 2026; he asked for that architecture exactly).
       THEIRS: a mouse move, taken at most once every 120 ms (the first of a burst, never the last), starts a tween of 1.5 s, easing out (their "power1.out": 1 - (1 - t)^2),
       of two numbers on every photograph: --fx = -50 x (x / window width - .5) x .2 and --fy the same with y and the window's height, so each runs from 5 to -5 across the window
       and is nothing with the mouse at the middle. A new move starts again from wherever the numbers have got to. The stylesheet moves each photograph by its numbers times a
       share of its own (0.8, 1.5, 1, 1 …), in hundredths of its own width and height.
       Whichever way the mouse goes, every photograph goes the other way: so one you are moving toward always comes toward you.
       HERE the same numbers, with two things fitted to this page. A text's share is in px (PULL, their 0.8 : 1 : 1.5 : 1 four times over), because a text is too small for a
       hundredth of its own size to show: at the window's edge a text has moved 16 to 30 px (the widest has the largest share), and none can be carried clear of the photograph:
       each is stopped with HOLD px of it still there (--lo and --hi, set where the texts are placed).
       And the last move of a burst is kept, 120 ms after the one before it, where theirs lets it go: the texts settle for where the mouse came to rest.
       Only a mouse moves them, only on a wide screen, and not at all under Reduce Motion. */
    var PULL = [3.2, 4, 6, 4], g = { x: 0, y: 0, fx: 0, fy: 0, tx: 0, ty: 0, t0: 0, raf: 0, last: -1e9, late: 0, px: 0, py: 0, on: false };
    figs.forEach(function (f, i) { f.style.setProperty('--k', String(PULL[i % PULL.length])); });
    function vars() { wall.style.setProperty('--fx', g.x.toFixed(3)); wall.style.setProperty('--fy', g.y.toFixed(3)); }
    function lean(now) { var u = Math.max(0, Math.min(1, (now - g.t0) / 1500)), e = 1 - (1 - u) * (1 - u); g.x = g.fx + (g.tx - g.fx) * e; g.y = g.fy + (g.ty - g.fy) * e; vars(); g.raf = u < 1 && g.on ? requestAnimationFrame(lean) : 0; }
    function aim(x, y, now) { g.fx = g.x; g.fy = g.y; g.tx = -50 * (x / window.innerWidth - .5) * .2; g.ty = -50 * (y / window.innerHeight - .5) * .2; g.t0 = g.last = now; if (!g.raf) g.raf = requestAnimationFrame(lean); }
    function mouse(ev) {
      if (!g.on || ev.pointerType !== 'mouse' || !wide()) return; var now = performance.now();
      if (now - g.last >= 120) { if (g.late) { clearTimeout(g.late); g.late = 0; } aim(ev.clientX, ev.clientY, now); return; }
      g.px = ev.clientX; g.py = ev.clientY; if (!g.late) g.late = setTimeout(function () { g.late = 0; if (g.on) aim(g.px, g.py, performance.now()); }, 120 - (now - g.last));
    }
    if (!calm && window.PointerEvent) window.addEventListener('pointermove', mouse, { passive: true });
    hooks.abt = { state: function () { return { shown: shown, beside: two, lean: [+g.x.toFixed(3), +g.y.toFixed(3), +g.tx.toFixed(3), +g.ty.toFixed(3)], photo: pf ? [pf.offsetLeft, pf.offsetTop, pf.offsetWidth, pf.offsetHeight] : null, texts: figs.map(function (f) { return [f.offsetLeft, f.offsetTop, f.offsetWidth, f.offsetHeight]; }) }; } };
    window.__abt = hooks.abt;
    return { open: function () { g.on = true; g.x = g.y = g.tx = g.ty = 0; g.last = -1e9; vars(); all(); }, close: function () { g.on = false; if (g.raf) cancelAnimationFrame(g.raf); g.raf = 0; if (g.late) clearTimeout(g.late); g.late = 0; }, resize: all };
  }

  /* ================================================================== PRODUCTS · BUY
     On the site Buy is a plain form: the server asks Square for a payment page and sends the visitor there. Here it is only kept from being pressed twice.
     In the one-file prototype there is no server and no Square: Buy shows the order page as a buyer would find it after paying. */
  function wireProducts(sec) {
    Array.prototype.forEach.call(sec.querySelectorAll('.pd-f'), function (f) {
      f.addEventListener('submit', function (ev) {
        if (AD.mode !== 'site') { ev.preventDefault(); var t = sec.querySelector('.pd-t'); if (window.__home && window.__home.order) window.__home.order({ state: 'ready', title: t ? t.textContent : '', downloadHref: '#', sandbox: true }); return; }
        if (f.classList.contains('busy')) { ev.preventDefault(); return; } f.classList.add('busy');
      });
    });
    return { open: function () { Array.prototype.forEach.call(sec.querySelectorAll('.pd-f.busy'), function (f) { f.classList.remove('busy'); }); } };
  }

  /* ================================================================== which page is showing */
  var wired = {}, was = null;
  function parts(name, sec) {
    if (name === 'production') return [wireBelt(sec), wireForm(sec)];
    if (name === 'about') return [wireAbout(sec)];
    if (name === 'products') return [wireProducts(sec)];
    return [];
  }
  function each(name, what) { var sec = dest.querySelector('.pg[data-pg="' + name + '"]'), w = wired[name]; if (!sec) return; if (!w || w.sec !== sec) { w = wired[name] = { sec: sec, parts: parts(name, sec).filter(Boolean) }; } w.parts.forEach(function (p) { if (p[what]) p[what](); }); }
  function sync() {
    var now = body.getAttribute('data-page'), sec = now && now !== 'home' ? dest.querySelector('.pg[data-pg="' + now + '"]') : null, w = wired[now];
    if (now === was && (!sec || (w && w.sec === sec))) return;       /* the same page, and the same markup: nothing to do (a page put in again in another state is wired afresh) */
    if (was && wired[was]) wired[was].parts.forEach(function (p) { if (p.close) p.close(); });
    was = now; if (sec) each(now, 'open');
  }
  new MutationObserver(sync).observe(body, { attributes: true, attributeFilter: ['data-page'] });
  function again() { if (was && was !== 'home') each(was, 'resize'); }
  window.addEventListener('resize', again); if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(again);
  /* THE STAGE NEVER SCROLLS. A box that only hides what spills from it can still be scrolled by the browser itself (the Tab key reaching a field near the foot, find in page):
     the header would slide off the top with no way to bring it back. The stylesheet clips the stage where a browser can; this puts anything that slips through straight back.
     The same for the page box sideways (it scrolls up and down only) and for the belt while it is travelling (its covers are moved by the script, not by scrolling). */
  var stage = doc.getElementById('stage');
  function pin(el, both) { if (!el) return; el.addEventListener('scroll', function () { if (both && el.scrollTop) el.scrollTop = 0; if (el.scrollLeft) el.scrollLeft = 0; }); }
  pin(stage, true); pin(dest, false);
  window.addEventListener('scroll', function () { if (window.scrollX || window.scrollY) window.scrollTo(0, 0); });
  /* A page scrolls inside its own box, not the window, so the keys that scroll a window are passed on to it while nothing else has the keyboard
     (a page opened by its address starts that way). */
  doc.addEventListener('keydown', function (ev) {
    if (ev.defaultPrevented || ev.altKey || ev.ctrlKey || ev.metaKey || dest.hidden) return;
    var t = ev.target; if (t && t !== body && t !== doc.documentElement && t !== dest) return;
    var h = dest.clientHeight, by = { ArrowDown: 48, ArrowUp: -48, PageDown: h * .9, PageUp: -h * .9, ' ': ev.shiftKey ? -h * .9 : h * .9, Home: -1e7, End: 1e7 }[ev.key];
    if (by == null || dest.scrollHeight <= dest.clientHeight + 1) return;
    dest.scrollTop += by; ev.preventDefault();
  });
  window.addEventListener('pageshow', function (ev) { if (ev.persisted) { Array.prototype.forEach.call(doc.querySelectorAll('.busy'), function (el) { el.classList.remove('busy'); }); again(); } });       /* back from Square by the browser's Back: nothing is left looking pressed */
  sync();
  window.__pages = hooks;
})();
