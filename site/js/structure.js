/* THE STRUCTURE: the loose pieces of the drawing, worked out from Anthony's own drum part (site/data/drums.json) and the arrangement (site/data/arr.json).
   This runs inside the engine's start function (site/js/engine.js puts it where its STRUCTURE marker stands); it is not a script on its own. Cut from the still-frame builder, unchanged. */
  var PI = Math.PI, U = 2.2, NB = 34, GAP = 20, HW = 4, EYE = 1.75, CEIL = 8.6;
  var T0 = D.t0, BAR = D.bar, BRB = (D.brk[0] - T0) / BAR;
  /* the structure is the last 34 bars of the song. Two beats of silence at bar 17.5 are drawn as nothing. */
  var Z1 = BRB * U, Z2 = 18 * U + GAP, ZEND = NB * U + GAP;
  function zb(b) { return b < 18 ? Math.min(b, BRB) * U : b * U + GAP; }
  function zt(t) { return zb((t - T0) / BAR); }
  function bz(z) { return z <= Z1 ? z / U : z >= Z2 ? (z - GAP) / U : -1; }
  var sd = 20261122;
  function rnd() { sd |= 0; sd = sd + 0x6D2B79F5 | 0; var t = Math.imul(sd ^ sd >>> 15, 1 | sd); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  function sm(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function vdc(n) { var v = 0, d = .5; while (n) { if (n & 1) v += d; n >>= 1; d *= .5; } return v; }
  var PK = new Float32Array(D.env.length), q, hold = 0;
  for (q = 0; q < PK.length; q++) { hold = Math.max(D.env[q], hold * .93); PK[q] = hold; }
  function pe(z) { var b = bz(z); if (b < 0) return 0; var i = Math.round((b * BAR + T0) / D.envHop); return i < 0 || i >= PK.length ? 0 : Math.pow(PK[i], .6); }
  var KICK = D.kicks.map(function (k) { return [zt(k[0]), k[1]]; }), SNARE = D.snares.map(function (k) { return [zt(k[0]), k[1]]; });
  var HAT = D.hats.filter(function (k) { return k[1] > .38; }).map(function (k) { return [zt(k[0]), k[1]]; }), FILL = D.fillhits.map(function (k) { return [zt(k[0]), k[1]]; });

  /* ------------------------------------------------------------------ strokes */
  var P = [], ST = [], WD = [], AL = [], LD = [], TONE = 0, TLD = 0, TN = 0, TA = 1.7, DN = .36, MESS = 0, objs = [], CUR = null, S2 = null, LBL = null;
  /* a piece of the structure. Ahead of the playhead it floats off its place, turned; behind the playhead it sits where the session puts it. */
  function begin(key, c, w, deco) {
    var dx = c[0], dy = c[1] - 4.3, n = Math.sqrt(dx * dx + dy * dy);
    if (n < .6) { var a = rnd() * 2 * PI; dx = Math.cos(a); dy = Math.sin(a) * .6 - .5; n = Math.sqrt(dx * dx + dy * dy); }
    var mag = 1.4 + 3.2 * rnd();
    CUR = { z: key, polys: [], a: ST.length, b: ST.length, c: c, w: w == null ? 1 : w, deco: !!deco,
      rot: [(rnd() - .5) * 1.5, (rnd() - .5) * 1.7, (rnd() - .5) * 2.1], ex: [dx / n * mag, dy / n * mag * .8, (rnd() - .5) * 5] };
    objs.push(CUR); return CUR;
  }
  function seg(a, b, st, w, al) {
    if (S2) { S2.push(a[0], a[1], b[0], b[1], st, w, al); return; }
    P.push(a[0], a[1], a[2], b[0], b[1], b[2]); ST.push(st); WD.push(w); AL.push(al); LD.push(TONE ? TLD : 0); CUR.b = ST.length;
  }
  function row() { TLD = Math.pow(vdc(TN++), 2 / 3); }
  function ln(a, b, st, w, al, ov, again) {
    var dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (len < 1e-5) return;
    var o = (ov == null ? 0.03 : ov) * (1 + 2.5 * MESS) + .04 * MESS, e1 = o * rnd(), e2 = o * rnd(), j = Math.min(0.02, len * 0.012) * (1 + 3 * MESS), w2 = Math.min(.01, len * .004) * (1 + 5 * MESS);
    var A = [a[0] - dx * e1 + (rnd() - .5) * j, a[1] - dy * e1 + (rnd() - .5) * j, a[2] - dz * e1];
    var B = [b[0] + dx * e2 + (rnd() - .5) * j, b[1] + dy * e2 + (rnd() - .5) * j, b[2] + dz * e2];
    var n = Math.max(1, Math.ceil(Math.abs(B[2] - A[2]) / 2), Math.round(len / (MESS ? .5 : 2.4))), prev = A;
    for (var i = 1; i <= n; i++) {
      var t = i / n, p = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t];
      if (i < n) { p[0] += (rnd() - .5) * w2; p[1] += (rnd() - .5) * w2; }
      seg(prev, p, st, w, al * (.86 + .26 * rnd())); prev = p;
    }
    if (MESS && !again && rnd() < .5 * MESS) ln(a, b, st, w * .8, al * .45, ov, true);
  }
  function ln2(a, b, st, w, al, ov) { ln(a, b, st, w, al, ov); ln(a, b, st, w * .8, al * .42, (ov == null ? 0.03 : ov) * 2.2); }
  function pl(pts, st, w, al, close) { for (var i = 0; i + 1 < pts.length; i++) seg(pts[i], pts[i + 1], st, w, al); if (close) seg(pts[pts.length - 1], pts[0], st, w, al); }
  function arc(fn, a0, a1, n) { var o = []; for (var i = 0; i <= n; i++) o.push(fn(a0 + (a1 - a0) * i / n)); return o; }
  function cut(A, B, st, w, al) { var m = Math.max(1, Math.ceil(Math.abs(B[2] - A[2]) / 2)), prev = A; for (var t = 1; t <= m; t++) { var f = t / m, p = [A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f, A[2] + (B[2] - A[2]) * f]; seg(prev, p, st, w, al); prev = p; } }
  function rows(cts, ang, sp, each) {
    var c = Math.cos(ang), s = Math.sin(ang), rot = [], lo = 1e9, hi = -1e9;
    cts.forEach(function (ct) { rot.push(ct.map(function (p) { var Y = -p[0] * s + p[1] * c; if (Y < lo) lo = Y; if (Y > hi) hi = Y; return [p[0] * c + p[1] * s, Y]; })); });
    for (var y = lo + sp * rnd(); y < hi; y += sp * (.86 + .28 * rnd()) * (1 + .5 * MESS * (rnd() - .3))) {
      var xs = []; row();
      for (var r = 0; r < rot.length; r++) for (var i = 0, n = rot[r].length; i < n; i++) {
        var p = rot[r][i], w = rot[r][(i + 1) % n];
        if ((p[1] <= y && w[1] > y) || (w[1] <= y && p[1] > y)) xs.push(p[0] + (y - p[1]) * (w[0] - p[0]) / (w[1] - p[1]));
      }
      xs.sort(function (a, b) { return a - b; });
      for (var k = 0; k + 1 < xs.length; k += 2) each(xs[k], xs[k + 1], y, c, s);
    }
  }
  function hatch(cts, map, sp, ang, st, w, al, skip) {
    rows(cts, ang, sp, function (xa, xb, y, c, s) {
      if (skip && rnd() < skip) return;
      var d = xb - xa; if (d < sp * .4) return;
      xa += d * (.07 + .1 * MESS) * rnd() - d * .12 * MESS * rnd(); xb -= d * (.07 + .1 * MESS) * rnd() - d * .12 * MESS * rnd();
      var ty = MESS * (rnd() - .5) * sp * .9;
      cut(map(xa * c - y * s, xa * s + y * c), map(xb * c - (y + ty) * s, xb * s + (y + ty) * c), st, w, al * (.65 + .6 * rnd()));
    });
  }
  function tone(cts, map, sp, ang, st, w, al, fn, sl) {
    TONE = 1; TN = 0; sp *= DN; al *= TA;
    rows(cts, ang, sp, function (x0, xe, y, c, s) {
      var x = x0 - sl * .3 * rnd();
      while (x < xe) {
        var l = sl * (.5 + rnd()), xa = Math.max(x0, x), xb = Math.min(xe, x + l);
        if (xb - xa > sp * .6) {
          var mx = (xa + xb) / 2, tn = fn(mx * c - y * s, mx * s + y * c);
          if (rnd() < tn) {
            var yy = y + (rnd() - .5) * sp * .22, tl = (rnd() - .5) * .02 * (xb - xa), ya = yy - tl, yb = yy + tl;
            cut(map(xa * c - ya * s, xa * s + ya * c), map(xb * c - yb * s, xb * s + yb * c), st, w, al * (.6 + .6 * rnd()) * (.55 + .45 * Math.min(1, tn)));
          }
        }
        x += l * (.82 + .3 * rnd());
      }
    });
    TONE = 0;
  }
  function R(a, b, c, d) { return [[a, c], [b, c], [b, d], [a, d]]; }
  function cen(pts) { var x = 0, y = 0; pts.forEach(function (p) { x += p[0]; y += p[1]; }); return [x / pts.length, y / pts.length]; }
  function box(xa, xb, ya, yb, za, ze, o) {
    var s = (xa + xb) / 2 < 0 ? -1 : 1, x0 = Math.min(xa, xb), x1 = Math.max(xa, xb), xi = s < 0 ? x1 : x0, xo = s < 0 ? x0 : x1, w = o.w || 1, al = o.al || .9;
    var ob = o.same ? CUR : begin(ze, [(xa + xb) / 2, (ya + yb) / 2, (za + ze) / 2], o.ew), top = yb < EYE - .05, und = ya > EYE + .05, inn = !o.noInner, sp = o.sp || .09;
    ob.polys.push([[x0, ya, za], [x1, ya, za], [x1, yb, za], [x0, yb, za]]);
    if (inn) ob.polys.push([[xi, ya, za], [xi, ya, ze], [xi, yb, ze], [xi, yb, za]]);
    if (top) ob.polys.push([[x0, yb, za], [x1, yb, za], [x1, yb, ze], [x0, yb, ze]]);
    if (und) ob.polys.push([[x0, ya, za], [x1, ya, za], [x1, ya, ze], [x0, ya, ze]]);
    ln([x0, ya, za], [x1, ya, za], 0, w, al, .02); ln([x0, yb, za], [x1, yb, za], 0, w, al, .02); ln([xo, ya, za], [xo, yb, za], 0, w, al, .02); ln([xi, ya, za], [xi, yb, za], 0, w * 1.1, al, .02);
    if (inn) { ln([xi, ya, za], [xi, ya, ze], 0, w, al * .9, 0); ln([xi, yb, za], [xi, yb, ze], 0, w, al * .9, 0); ln([xi, ya, ze], [xi, yb, ze], 0, w * .9, al * .7, 0); }
    if (top) { ln([xo, yb, za], [xo, yb, ze], 0, w * .9, al * .7, 0); ln([x0, yb, ze], [x1, yb, ze], 0, w * .9, al * .6, 0); }
    if (und) { ln([xo, ya, za], [xo, ya, ze], 0, w * .9, al * .7, 0); if (!inn) ln([xi, ya, za], [xi, ya, ze], 0, w * .9, al * .7, 0); ln([x0, ya, ze], [x1, ya, ze], 0, w * .9, al * .6, 0); }
    if (o.tf) tone([R(x0, x1, ya, yb)], function (u, v) { return [u, v, za]; }, sp, s * .95, 1, .7, .5, function () { return o.tf; }, .35);
    if (inn && o.ti) tone([R(za, ze, ya, yb)], function (u, v) { return [xi, v, u]; }, sp, 1.2, 1, .7, .5, function (u) { return o.ti * (o.env ? .5 + .7 * pe(u) : 1); }, .4);
    if (top && o.tt) tone([R(x0, x1, za, ze)], function (u, v) { return [u, yb, v]; }, .1, .2, 1, .7, .4, function () { return o.tt; }, .4);
    if (und && o.tu) tone([R(x0, x1, za, ze)], function (u, v) { return [u, ya, v]; }, sp, .2, 1, .7, .5, function () { return o.tu; }, .4);
    return ob;
  }
  function spanOf(b) { return b < 17 ? [b * U, (b + 1) * U] : b === 17 ? [17 * U, Z1] : [b * U + GAP, (b + 1) * U + GAP]; }

  /* ------------------------------------------------------------------ the structure: the session, drawn as loose pieces */
  function regions(s) {
    var out = [], start = null, quiet = 0, t = s + '000';
    for (var i = 0; i < t.length; i++) {
      if (parseInt(t.charAt(i), 16) >= 4) { if (start === null) start = i; quiet = 0; }
      else if (start !== null && ++quiet > 1) { out.push([(start + ARR.beat0) / 4 - 86, (i - quiet + 1 + ARR.beat0) / 4 - 86]); start = null; quiet = 0; }
    }
    return out.map(function (r) { return [Math.max(0, r[0]), Math.min(NB, r[1])]; }).filter(function (r) { return r[1] - r[0] > .2; });
  }
  var LANES = [{ k: 'iris', s: -1, y0: 5.5, y1: 6.7, d: .42 }, { k: 'humGroups', s: -1, y0: 3.7, y1: 4.9, d: .34 }, { k: 'humMain', s: 1, y0: 5.5, y1: 6.7, d: .42 }, { k: 'reverb', s: 1, y0: 3.9, y1: 4.6, d: .2 }];
  LANES.forEach(function (l) { l.r = regions(ARR.perBeat[l.k]); });
  /* a side wall, cut into shards. Its height follows how loud that bar is; its shading follows the stem. */
  function wall(s, za, ze, b) {
    var X = s * HW, sh = s < 0 ? 1 : .45, h = 4.8 + 3.8 * Math.max(0, Math.min(1, (D.rmsBar[b] + 11.5) / 5)), L = ze - za, T = za + (.25 + .5 * rnd()) * L, B = za + (.25 + .5 * rnd()) * L, pcs;
    if (L < .5) pcs = [R(za, ze, 0, h)];
    else if (rnd() < .4) pcs = rnd() < .5 ? [[[za, 0], [ze, 0], [ze, h]], [[za, 0], [ze, h], [za, h]]] : [[[za, 0], [ze, 0], [za, h]], [[ze, 0], [ze, h], [za, h]]];
    else pcs = [[[za, 0], [B, 0], [T, h], [za, h]], [[B, 0], [ze, 0], [ze, h], [T, h]]];
    pcs.forEach(function (pc) {
      var cc = cen(pc), ob = begin(ze, [X, cc[1], cc[0]]), m = function (p) { return [X, p[1], p[0]]; };
      ob.polys.push(pc.map(m)); pl(pc.map(m), 0, .95, .75, true);
      tone([pc], function (u, v) { return [X, v, u]; }, .1, 1.5, 1, .7, .45, function (u) { return (.1 + .34 * sh) * (.25 + 1.2 * pe(u)); }, .5);
    });
  }
  function rail(s, za, ze) {
    var X = s * (HW - .18); begin(ze, [X, .12, (za + ze) / 2]); ln([X, 0, za], [X, 0, ze], 0, .9, .7, 0);
    HAT.forEach(function (h) { if (h[0] >= za && h[0] < ze) { var hh = .1 + .26 * h[1]; seg([X, 0, h[0]], [X, hh, h[0]], 0, .9, .5 + .45 * h[1]); seg([X, hh, h[0]], [s * HW, hh, h[0]], 0, .8, .4 + .4 * h[1]); } });   /* a tooth for every hi-hat */
  }
  function floor(za, ze) {
    var ob = begin(ze, [0, 0, (za + ze) / 2]); ob.polys.push([[-HW, 0, za], [HW, 0, za], [HW, 0, ze], [-HW, 0, ze]]);
    for (var z = za, k = 0; z < ze - 1e-6; z += U / 4, k++) { if (k) ln([-HW, 0, z], [HW, 0, z], 1, .7, .32, 0); else ln2([-HW, 0, z], [HW, 0, z], 0, 1.1, .85, 0); }
    [-3.6, -2.7, -1.8, 0, 1.8, 2.7, 3.6].forEach(function (x) { ln([x, 0, za], [x, 0, ze], 1, .7, x ? .26 : .4, 0); });
    ln([-HW, 0, ze], [HW, 0, ze], 1, .7, .3, 0);
    tone([R(-HW, HW, za, ze)], function (u, v) { return [u, .004, v]; }, .13, .04, 1, .7, .42, function (u, v) { return .16 * (.4 + .9 * pe(v)) + .05; }, .7);
  }
  function frame(z, lvl) {
    if (!lvl) { begin(z + .01, [0, CEIL / 2, z]); pl([[-HW, 0, z], [-HW, CEIL, z], [HW, CEIL, z], [HW, 0, z]], 0, .9, .7, true); return; }
    var w = lvl === 2 ? .5 : .3, d = .24; begin(z + d, [0, CEIL / 2, z + d / 2]);
    box(-HW, -HW + w, 0, CEIL, z, z + d, { tf: .6, ti: .8, same: true }); box(HW - w, HW, 0, CEIL, z, z + d, { tf: .35, ti: .22, same: true });
    box(-HW + w, HW - w, CEIL - w, CEIL, z, z + d, { tf: .45, tu: .85, noInner: true, same: true });
  }
  /* what is only there before the playhead arrives: long setting-out lines and compass arcs through the loose pieces */
  function loose(za, ze, b) {
    for (var i = 0; i < 4; i++) {
      var p0 = [(rnd() - .5) * 8, rnd() * 9, za + rnd() * (ze - za)], a1 = rnd() * 2 * PI, tl = (rnd() - .5) * .5, len = 5 + rnd() * 10, d = [Math.cos(a1) * Math.cos(tl), Math.sin(a1) * Math.cos(tl), Math.sin(tl)];
      begin(p0[2], p0, 0, true); ln([p0[0] - d[0] * len, p0[1] - d[1] * len, p0[2] - d[2] * len], [p0[0] + d[0] * len, p0[1] + d[1] * len, p0[2] + d[2] * len], rnd() < .45 ? 2 : 1, .7, .55, 0);
    }
    if (b % 2 === 0) { var r = 1.5 + rnd() * 3.2, cx = (rnd() - .5) * 3, cy = 2 + rnd() * 4, zc = za + rnd() * (ze - za), a0 = rnd() * 2 * PI;
      begin(zc, [cx, cy, zc], 0, true); pl(arc(function (t) { return [cx + r * Math.cos(t), cy + r * Math.sin(t), zc]; }, a0, a0 + 1.2 + rnd() * 2.6, 34), 3, .8, .6);
      ln([cx - .15, cy, zc], [cx + .15, cy, zc], 3, .8, .7, 0); ln([cx, cy - .15, zc], [cx, cy + .15, zc], 3, .8, .7, 0); }
  }
  (function build() {
    for (var b = NB - 1; b >= 0; b--) {
      var sp = spanOf(b), za = sp[0], ze = sp[1];
      wall(-1, za, ze, b); wall(1, za, ze, b); floor(za, ze); rail(-1, za, ze); rail(1, za, ze);
      LANES.forEach(function (l) { l.r.forEach(function (r) {
        var a = Math.max(r[0], b), e = Math.min(r[1], b + 1); if (e - a < .02) return;
        var z0 = b < 18 ? Math.min(a, BRB) * U : a * U + GAP, z1 = b < 18 ? Math.min(e, BRB) * U : e * U + GAP; if (z1 - z0 < .05) return;
        box(l.s * HW, l.s * (HW - l.d), l.y0, l.y1, z0, z1, { tf: .9, ti: l.s < 0 ? .95 : .7, tu: 1, env: true, ew: 1.15, sp: .07 });      /* the long tracks: dark bars */
        hatch([R(z0, z1, l.y0, l.y1)], function (u, v) { return [l.s * (HW - l.d), v, u]; }, .04, .55, 0, .85, l.s < 0 ? .8 : .55, .04);
      }); });
      frame(za, b === 0 || b === 18 ? 2 : b % 8 === 2 ? 2 : b % 4 === 2 ? 1 : 0);
      KICK.forEach(function (k) { if (k[0] >= za && k[0] < ze) box(-3.6, -2.7, 0, .9 + 1.5 * k[1], k[0], k[0] + .24, { tf: .35, ti: .8, tt: .15 }); });
      SNARE.forEach(function (k) { if (k[0] >= za && k[0] < ze) box(2.7, 3.6, 0, 1.9 + 1.2 * k[1], k[0], k[0] + .3, { tf: .45, ti: .25 }); });
      FILL.forEach(function (k) { if (k[0] >= za && k[0] < ze) box(2.9, 3.4, 0, .7 + 1.3 * k[1], k[0], k[0] + .16, { tf: .4, ti: .22, tt: .12 }); });
      loose(za, ze, b);
    }
    frame(ZEND, 2);
  })();
  var N = ST.length, Pf = new Float32Array(P); P = null;
