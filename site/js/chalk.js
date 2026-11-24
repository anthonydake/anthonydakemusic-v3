/* The mark: a triangle and a half circle, drawn in chalk on a small board. No dependencies.
   The chalk goes onto one transparent layer a dab at a time. Every size on the page, and the tab icon, is a copy of that layer. */
var ChalkMark = (function () {
  'use strict';
  var PI = Math.PI, CHALK = 'rgb(244,241,234)', BOARD = '#0d0d0d', BAR = 1538.46;
  /* the mark, in a unit square with y running down */
  var TA = [.118, .795], TB = [.296, .225], TC = [.474, .795], DX = .596, DY0 = .205, DY1 = .795, DR = .295, DCY = .5;

  function prng(seed) { var s = seed | 0; return function () { s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(ix, iy) { var n = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) | 0; n = Math.imul(n ^ n >>> 13, 1274126177); return ((n ^ n >>> 16) >>> 0) / 4294967296; }
  function vn(x, y) { var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); var a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1); return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy; }
  /* the board's tooth. Chalk lands on the high spots and skips the low ones, and the high spots never move, so two strokes over the same place leave the same specks dark. */
  function tooth(x, y) { return .76 * hash(Math.floor(x * 150), Math.floor(y * 150)) + .24 * vn(x * 30, y * 30); }

  function build(seed) {
    var r = prng(seed), X = [], Y = [], D = [], A = [], T = [];
    /* one stroke of the stick: fn gives the path over 0..1, w is the width of the stick's end */
    function stroke(fn, len, w, t0, t1, press) {
      var n = Math.max(2, Math.ceil(len / .003)), ph = r() * 6.283, bow = (r() - .5) * .011, dens = Math.max(4, Math.round(w * 300)), sp = r() * 60, i, k;
      for (i = 0; i <= n; i++) {
        var u = i / n, p = fn(u), q = fn(Math.min(1, u + .002)), q0 = fn(Math.max(0, u - .002)), tx = q[0] - q0[0], ty = q[1] - q0[1], tl = Math.sqrt(tx * tx + ty * ty) || 1, nx = -ty / tl, ny = tx / tl;
        var off = bow * Math.sin(PI * u) + .002 * Math.sin(u * len * 46 + ph);
        var pr = press * (.78 + .22 * vn(u * len * 9 + ph, 3.7)) * Math.min(1, .5 + u * 10) * Math.min(1, .62 + (1 - u) * 8);
        var te = t0 + (t1 - t0) * (.4 * u + .6 * u * u * (3 - 2 * u));
        for (k = 0; k < dens; k++) {
          var o = r() * 2 - 1, stray = r() < .05, hw = w / 2 * (stray ? 1.5 : 1) * (.94 + .12 * r());
          var x = p[0] + nx * (off + o * hw) + (r() - .5) * .004, y = p[1] + ny * (off + o * hw) + (r() - .5) * .004;
          var p2 = pr * (.5 + .5 * vn((o * .5 + .5) * w * 110 + sp, 1.3)), g = (tooth(x, y) - (.44 - .42 * p2)) / .2; if (g <= 0) continue; if (g > 1) g = 1;   /* a stick is never flat: it leaves streaks along the stroke */
          var a = (.45 + .55 * r()) * g * (stray ? .35 : 1) * (.7 + .3 * p2);
          if (a < .03) continue;
          X.push(x); Y.push(y); D.push(.003 + .0046 * r()); A.push(a); T.push(te);
        }
      }
    }
    function line(a, b, w, t0, t1, press, ov) {
      var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.sqrt(dx * dx + dy * dy), ux = dx / L, uy = dy / L, o1 = ov * (.3 + .7 * r()), o2 = ov * (.3 + .7 * r());
      var A2 = [a[0] - ux * o1 + (r() - .5) * .008, a[1] - uy * o1 + (r() - .5) * .008], B2 = [b[0] + ux * o2 + (r() - .5) * .008, b[1] + uy * o2 + (r() - .5) * .008];
      stroke(function (u) { return [A2[0] + (B2[0] - A2[0]) * u, A2[1] + (B2[1] - A2[1]) * u]; }, L + o1 + o2, w, t0, t1, press);
    }
    /* shading, laid the way the rest of the drawing is hatched: short strokes from the upper left to the lower right, one after another */
    function shade(poly, t0, t1, w, gap) {
      var cs = poly.map(function (p) { return p[0] - p[1]; }), lo = Math.min.apply(null, cs), hi = Math.max.apply(null, cs), step = gap * Math.SQRT2, segs = [], total = 0, c, i;
      for (c = lo + step * (.35 + .3 * r()); c < hi; c += step * (.9 + .2 * r())) {
        var ss = [];
        for (i = 0; i < poly.length; i++) { var p = poly[i], q = poly[(i + 1) % poly.length], fp = p[0] - p[1] - c, fq = q[0] - q[1] - c; if ((fp <= 0 && fq > 0) || (fq <= 0 && fp > 0)) { var t = fp / (fp - fq); ss.push(p[0] + (q[0] - p[0]) * t + p[1] + (q[1] - p[1]) * t); } }
        if (ss.length < 2) continue; ss.sort(function (a, b) { return a - b; });
        var s0 = ss[0] + .008 + .012 * r(), s1 = ss[ss.length - 1] - .008 - .012 * r(); if (r() < .16) s1 += .03 * r(); if (r() < .1) s0 -= .025 * r();
        if (s1 - s0 < .03) continue;
        segs.push([c, s0, s1]); total += (s1 - s0) / Math.SQRT2 + .05;
      }
      var at = t0;
      segs.forEach(function (sg) {
        var L = (sg[2] - sg[1]) / Math.SQRT2, span = (t1 - t0) * (L + .05) / total, c2 = sg[0], a = [(sg[1] + c2) / 2, (sg[1] - c2) / 2], b = [(sg[2] + c2) / 2, (sg[2] - c2) / 2];
        line(a, b, w * (.9 + .2 * r()), at, at + span * L / (L + .05), .62 + .3 * r(), 0); at += span;
      });
    }
    var W = .05;
    /* bar one: the outlines. Two beats for the triangle, two for the half circle. */
    line(TA, TB, W, 0, .078, .92, .02); line(TB, TC, W, .088, .166, .9, .02); line(TC, TA, W, .176, .24, .88, .02);
    line([DX, DY0], [DX, DY1], W, .268, .336, .92, .016);
    var cx = DX + (r() - .5) * .008, cy = DCY + (r() - .5) * .008, R = DR * (.988 + .024 * r()), a0 = -PI / 2 - .05 * r(), a1 = PI / 2 + .05 * r();
    stroke(function (u) { var a = a0 + (a1 - a0) * u, rr = R * (1 + .012 * Math.sin(u * 5 + cx * 900)); return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)]; }, PI * R, W, .35, .488, .9);
    /* bar two: the shading */
    var disc = [], i; for (i = 0; i <= 28; i++) { var an = -PI / 2 + PI * i / 28; disc.push([DX + DR * Math.cos(an), DCY + DR * Math.sin(an)]); }
    shade([TA, TB, TC], .52, .742, .036, .036); shade(disc, .762, .99, .036, .036);
    return { n: X.length, x: new Float32Array(X), y: new Float32Array(Y), d: new Float32Array(D), a: new Float32Array(A), t: new Float32Array(T) };
  }

  function mk(s) { var c = document.createElement('canvas'); c.width = c.height = s; return c; }
  function rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

  /* o: size (of the layer, a power of two), bar (ms), drawBars, holdBars, wipeBars, seed, used (start on a board that has been wiped before) */
  function Player(o) {
    o = o || {};
    var S = o.size || 512, bar = o.bar || BAR, dMs = (o.drawBars || 2) * bar, hMs = (o.holdBars == null ? 5 : o.holdBars) * bar, wMs = (o.wipeBars == null ? 1 : o.wipeBars) * bar, LOOP = dMs + hMs + wMs;
    var layer = mk(S), lx = layer.getContext('2d'), ghost = mk(S), gx = ghost.getContext('2d'), haunted = false, next = null, nextK = -1, mips = [layer], stamp = 0, seen = [0], loop = -1, dabs = null, di = 0, wx = -.2, fade = 1, lastT = 0, seed0 = o.seed || 7, wr = prng(4242);
    function drawTo(p) {
      if (!dabs || di >= dabs.n) return;
      lx.globalCompositeOperation = 'source-over'; lx.fillStyle = CHALK; var x = dabs.x, y = dabs.y, d = dabs.d, a = dabs.a, t = dabs.t, n = dabs.n, k = di;
      while (k < n && t[k] <= p) { var s = d[k] * S; lx.globalAlpha = a[k]; lx.fillRect(x[k] * S - s / 2, y[k] * S - s / 2, s, s); k++; }
      if (k !== di) { di = k; stamp++; }
    }
    /* the eraser: a felt block pulled across from the left. It takes most of the chalk and drags the dust; a little of the drawing stays. */
    function wipeTo(w) {
      var target = -.2 + 1.4 * Math.min(1, w / .55), BW = .18, dx = BW / 12, any = false;
      while (wx + dx <= target) {
        wx += dx; any = true;
        var sx = Math.max(0, Math.round((wx - BW / 2) * S)), sw = Math.min(S - sx, Math.round(BW * S));
        if (sw > 0) { lx.globalCompositeOperation = 'source-over'; lx.globalAlpha = .1; lx.drawImage(layer, sx, 0, sw, S, sx + dx * S * (.5 + 1.6 * wr()), (wr() - .5) * 2, sw, S); }      /* the felt drags the chalk along with it */
        lx.globalCompositeOperation = 'destination-out'; lx.globalAlpha = .21; lx.fillStyle = '#000';
        lx.beginPath(); lx.moveTo((wx - BW / 2 + .04) * S, 0); lx.lineTo((wx + BW / 2 + .04) * S, 0); lx.lineTo((wx + BW / 2 - .04) * S, S); lx.lineTo((wx - BW / 2 - .04) * S, S); lx.closePath(); lx.fill();
        lx.globalCompositeOperation = 'source-over'; lx.fillStyle = CHALK;
        for (var k = 0; k < 46; k++) { var x = wx - BW / 2 - .16 * wr(), y = .1 + .8 * wr(), d = (.003 + .006 * wr()) * S; lx.globalAlpha = (.02 + .05 * wr()) * (1 - tooth(x, y)); lx.fillRect(x * S, y * S, d, d); }   /* and leaves dust in the low spots */
      }
      var f = w <= .55 ? 1 : 1 - .45 * ((w - .55) / .45);          /* then the dust settles */
      if (f < fade - .004) { lx.globalCompositeOperation = 'destination-out'; lx.globalAlpha = 1 - f / fade; lx.fillStyle = '#000'; lx.fillRect(0, 0, S, S); fade = f; any = true; }
      lx.globalCompositeOperation = 'source-over'; lx.globalAlpha = 1;
      if (any) stamp++;
    }
    /* what the wipe leaves behind moves to its own layer, so the small sizes can start each turn on a clean board */
    function settle() { gx.clearRect(0, 0, S, S); gx.drawImage(layer, 0, 0); lx.clearRect(0, 0, S, S); haunted = true; stamp++; }
    function begin(k) { loop = k; dabs = nextK === k && next ? next : build(seed0 + k * 101); next = null; nextK = -1; di = 0; wx = -.2; fade = 1; }
    this.loopMs = LOOP; this.drawMs = dMs; this.holdMs = hMs; this.wipeMs = wMs;
    /* bring the layer to a time. Time may jump (a tab in the background is only woken once a second); it catches up. */
    this.at = function (ms) {
      if (ms < 0) ms = 0;
      var k = Math.floor(ms / LOOP), T = ms - k * LOOP;
      if (k !== loop || T < lastT) {                 /* a new turn of the loop, or time was wound back */
        if (loop >= 0 && k === loop + 1) { drawTo(1); wipeTo(1); settle(); }
        else { lx.clearRect(0, 0, S, S); gx.clearRect(0, 0, S, S); haunted = false; stamp++; if (o.used) { begin(k - 1); drawTo(1); wipeTo(1); settle(); } }
        begin(k);
      }
      lastT = T;
      if (T < dMs) drawTo(T / dMs);
      else { drawTo(1); if (T > dMs + hMs) wipeTo((T - dMs - hMs) / wMs); else if (nextK !== k + 1) { next = build(seed0 + (k + 1) * 101); nextK = k + 1; } }     /* while nothing moves, work out the next turn's strokes */
      return stamp;
    };
    this.phase = function (ms) { var T = ms - Math.floor(ms / LOOP) * LOOP; return T < dMs ? 'draw' : T > dMs + hMs ? 'wipe' : 'hold'; };
    function level(px) {
      var k = 0; while ((S >> (k + 1)) >= px) k++;
      for (var j = 1; j <= k; j++) {
        if (!mips[j]) { mips[j] = mk(S >> j); seen[j] = -1; }
        if (seen[j] !== stamp) { var m = mips[j].getContext('2d'); m.clearRect(0, 0, S >> j, S >> j); m.drawImage(mips[j - 1], 0, 0, S >> j, S >> j); seen[j] = stamp; }
      }
      return mips[k];
    }
    /* put the picture at x, y, px wide. board: draw the board under it. firm: lay the chalk on more than once, for small sizes. */
    this.paint = function (c, x, y, px, opt) {
      opt = opt || {}; var dp = px * (opt.dpr || 1), lv = level(dp), n = 1 + (opt.firm == null ? (dp <= 24 ? 2 : dp <= 72 ? 1 : 0) : opt.firm);
      if (opt.board !== false) { rrect(c, x, y, px, px, px * .2); c.fillStyle = opt.boardColor || BOARD; c.fill(); if (opt.edge) { c.strokeStyle = opt.edge; c.lineWidth = Math.max(1, px / 160); c.stroke(); } }
      c.imageSmoothingEnabled = true; if ('imageSmoothingQuality' in c) c.imageSmoothingQuality = 'high';
      if (haunted && dp > 72) c.drawImage(ghost, x, y, px, px);
      for (var i = 0; i < n; i++) c.drawImage(lv, x, y, px, px);
    };
    this.layer = layer;
  }

  /* the finished mark, not moving: for Safari, for visitors who ask for less motion, and for print */
  function still(px, opt) { var p = new Player({ size: 512, seed: (opt && opt.seed) || 7 }), c = mk(px); p.at(p.drawMs + 1); p.paint(c.getContext('2d'), 0, 0, px, opt); return c; }

  /* run it. o.targets: [{ canvas, board, edge, firm }], drawn at the size of their backing store. o.favicon: keep the tab icon in step.
     o.loop false: draw once and stay; draw again when the visitor comes back to the tab. o.size: the layer, 512 for a large picture, 128 is plenty for a tab icon alone. */
  function run(o) {
    o = o || {};
    var loop = o.loop !== false, P = new Player({ size: o.size || 512, bar: o.bar, drawBars: o.drawBars, holdBars: o.holdBars, wipeBars: o.wipeBars, seed: o.seed, used: o.used !== false });
    var targets = o.targets || [], link = null, fav = null, idx = 0, t0 = Date.now(), last = -1, favAt = -1, frozen = null, timer = null, n = 0;
    var calm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (o.favicon) { link = document.querySelector('link[rel~="icon"]') || document.head.appendChild(document.createElement('link')); link.rel = 'icon'; link.type = 'image/png'; fav = mk(64); }
    function now() { if (frozen != null) return frozen; var el = calm ? P.drawMs + 1 : Date.now() - t0; if (!loop) el = Math.min(el, P.drawMs + 1); return idx * P.loopMs + el; }
    function tick() {
      var st = P.at(now()); n++;
      if (st !== last) { last = st; targets.forEach(function (t) { var c = t.canvas.getContext('2d'), s = t.canvas.width; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, s, s); P.paint(c, 0, 0, s, t); }); }
      /* the tab icon is redrawn half as often as the page, and never while nothing is changing */
      if (fav && st !== favAt && (n % 2 === 0 || frozen != null || calm)) { favAt = st; var f = fav.getContext('2d'); f.clearRect(0, 0, 64, 64); P.paint(f, 0, 0, 64, { firm: 2 }); try { link.href = fav.toDataURL('image/png'); } catch (e) {} }
    }
    function again() { if (calm) return; frozen = null; idx = Math.floor(now() / P.loopMs) + 1; t0 = Date.now(); }
    if (!calm) { timer = setInterval(tick, 33); if (!loop) document.addEventListener('visibilitychange', function () { if (!document.hidden) again(); }); }
    tick();
    return { player: P, calm: calm, again: again, repaint: function () { last = -1; tick(); }, freeze: function (ms) { frozen = ms; tick(); tick(); }, stop: function () { if (timer) clearInterval(timer); } };
  }
  return { build: build, Player: Player, still: still, run: run, BAR: BAR, BOARD: BOARD };
})();
