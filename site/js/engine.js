/* THE ENGINE (site/js/engine.js): the drawing behind every page, the flight between the home screen and a page, and the small hand-made things on words
   (the scrambling letters, the pencil circle a mouse draws, the cross a press leaves, the name's roll, the chalk mark, the home screen's message bubble).
   - The drawing is about 120,000 pencil strokes in 727 loose pieces, drawn with WebGL 2. The pieces come from Anthony's own drum part: site/js/structure.js works them out
     (the build puts it where the STRUCTURE marker stands) from site/data/drums.json and arr.json.
   - Pages: the words and markup of every page come from site/templates.mjs, packed in as window.ADSite. On the site each address has its own whole document from the server
     (lib/site/render.ts); this script then moves between pages without a reload and keeps the address in step. In the one-file prototype the addresses are #names.
   - window.__AD is the document's note to this script: { mode: 'site' | 'file', v, products, sandbox, img }.
   - Without WebGL 2 this script stops at once: every page is still whole (its words are in the document and its links are real links), there is just no drawing and no flight.
   The pages' own behaviour (the belt, the booking form, the About photograph and its texts) is in site/js/pages.js, which does not depend on this file. */
function startHome() {
  'use strict';
  var AD = window.__AD || {}, SITE = window.ADSite, HASH = AD.mode === 'file';
  /* no WebGL 2, no drawing: say so on the body tag (the stylesheet then gives the home screen's text and the mark their plain forms) and stop before any work is done */
  var GLOPT = { alpha: false, antialias: false, depth: true, stencil: false, premultipliedAlpha: false }, cv0 = document.getElementById('gl'), gl0 = null;
  try { gl0 = cv0 && cv0.getContext('webgl2', GLOPT); } catch (e) { gl0 = null; }
  if (!gl0 || !SITE) { var c0 = document.getElementById('chip'); if (c0) c0.textContent = 'TEST · this browser cannot run it'; document.body.setAttribute('data-ready', 'no-gl'); return; }
  var D = /*DRUMS*/null, ARR = /*ARR*/null, tBuild = performance.now();
/*STRUCTURE*/
  tBuild = Math.round(performance.now() - tBuild);

  /* ------------------------------------------------------------------ each piece's own small differences */
  var NO = objs.length, HIT = new Uint8Array(NO), JIT = new Float32Array(NO), PH = new Float32Array(NO), DEL = new Float32Array(NO), LIFT = new Float32Array(NO), i, j, hs = 4177;
  function hr() { hs |= 0; hs = hs + 0x6D2B79F5 | 0; var t = Math.imul(hs ^ hs >>> 15, 1 | hs); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  for (i = 0; i < NO; i++) {
    HIT[i] = !objs[i].deco && Math.abs(Math.abs(objs[i].c[0]) - 3.15) < 1e-4 ? 1 : 0;      /* the blocks that stand for a kick, a snare or a fill hit */
    JIT[i] = -1.6 * hr(); PH[i] = hr() * 6.283; LIFT[i] = (hr() - .35) * 4.5; DEL[i] = .08 + .92 * Math.max(0, Math.min(1, objs[i].c[2] / ZEND));
  }
  /* the blue pieces: some of the solid pieces of the structure, picked once and for all. At rest they are pencil like everything else.
     On a flight each one turns to blue pencil as you come up on it, so the blue runs ahead of you through the architecture. */
  var BLU = new Float32Array(NO), nBlu = 0, BLUE_SHARE = .3;
  for (i = 0; i < NO; i++) if (!objs[i].deco && objs[i].polys.length && objs[i].b - objs[i].a >= 22 && hr() < BLUE_SHARE) { BLU[i] = .8 + .2 * hr(); nBlu++; }
  var PAL = [
    { bg: [0, 0, 0], col: ['#f2f2f2', '#9a9a9a', '#3b82f6', '#8ec5ff'], tint: '#4a93ff', vig: 0 },       /* tint: the blue a highlighted piece is drawn in. On black it has to be a fuller blue than the pale lead, or it reads as white */
    { bg: [232, 224, 205], col: ['#1b1712', '#3a3229', '#2563eb', '#1d4ed8'], tint: '#1d4ed8', vig: 1 },
    { bg: [255, 255, 255], col: ['#141414', '#3a3a3a', '#2563eb', '#1d4ed8'], tint: '#1d4ed8', vig: 0 },       /* white: plain, no warm corners */
    { bg: [247, 246, 242], col: ['#181611', '#3b372f', '#2563eb', '#1d4ed8'], tint: '#1d4ed8', vig: .12 }      /* soft white: what light mode shows now */
  ];
  function rgb(h) { return [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255]; }
  PAL.forEach(function (M) { var c = []; M.col.forEach(function (h) { c = c.concat(rgb(h)); }); M.cols = new Float32Array(c); M.lead = rgb(M.col[3]); M.tintf = rgb(M.tint); M.bgf = [M.bg[0] / 255, M.bg[1] / 255, M.bg[2] / 255]; });

  /* ------------------------------------------------------------------ the page */
  var doc = document, body = doc.body, stage = doc.getElementById('stage'), cv = doc.getElementById('gl'), first = doc.getElementById('first'), endEl = doc.getElementById('end');
  var nameEl = doc.getElementById('name'), rollEl = doc.getElementById('roll'), chip = doc.getElementById('chip'), panel = doc.getElementById('panel'), read = doc.getElementById('read');
  var mqLight = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null, calm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var LIGHT = 3, GROUNDS = ['black', 'paper', 'white', 'soft'], ground = mqLight && mqLight.matches ? LIGHT : 0, groundPick = null, NEAR = .3, ZN = .28, ZF = 400;

  var gl = gl0;

  var COMMON = '#version 300 es\nprecision highp float;\nprecision highp sampler2D;\n' +
    'uniform sampler2D uObj;uniform vec4 uCam;uniform vec4 uProj;uniform vec4 uView;uniform vec2 uDepth;\n' +
    'vec3 xf(vec3 p,vec4 a,vec4 b,vec4 c){return vec3(dot(a.xyz,p)+a.w,dot(b.xyz,p)+b.w,dot(c.xyz,p)+c.w);}\n';
  /* one pencil stroke: a thin four-cornered strip between its two ends, faded and thinned with distance exactly as the stills do it */
  var VS_LINE = COMMON +
    'layout(location=0) in vec2 aCorner;layout(location=1) in vec3 aA;layout(location=2) in vec3 aB;layout(location=3) in vec4 aMisc;layout(location=4) in float aObj;\n' +
    'uniform vec3 uCols[4];uniform vec3 uTint;uniform float uDim;out vec4 vCol;out vec3 vLine;out float vLen;\n' +
    'void main(){int o=int(aObj+.5);vec4 r3=texelFetch(uObj,ivec2(3,o),0);float fade=r3.x,NEAR=uCam.w;\n' +
    ' gl_Position=vec4(2.,2.,2.,1.);vCol=vec4(0.);vLine=vec3(0.);vLen=0.;if(fade<=.001)return;\n' +
    ' vec4 r0=texelFetch(uObj,ivec2(0,o),0),r1=texelFetch(uObj,ivec2(1,o),0),r2=texelFetch(uObj,ivec2(2,o),0);\n' +
    ' vec3 A=xf(aA,r0,r1,r2)-uCam.xyz,B=xf(aB,r0,r1,r2)-uCam.xyz;\n' +
    ' if(A.z<NEAR&&B.z<NEAR)return;\n' +
    ' float ld=aMisc.w,lq=ld*(A.z+B.z)*.5;if(ld>=0.&&lq>7.)return;\n' +
    ' if(A.z<NEAR)A=mix(A,B,(NEAR-A.z)/(B.z-A.z));else if(B.z<NEAR)B=mix(B,A,(NEAR-B.z)/(A.z-B.z));\n' +
    ' float zm=(A.z+B.z)*.5,F=uProj.x,al,w;\n' +
    ' if(ld<0.){al=aMisc.z*fade;w=aMisc.y;}\n' +
    ' else{float tone=(ld>0.||aMisc.x==1.)?min(1.,.2+.8*zm/5.):1.;\n' +
    '  al=aMisc.z*fade*uDim*clamp(1.15-zm/uView.w,.18,1.)*min(1.,(zm-NEAR)/1.1+.15)*min(1.,(7.-lq)*1.4)*tone;w=clamp(aMisc.y*(.5+3.4/zm)*uProj.w,.4,3.6);\n' +
    '  al*=1.+.9*r3.y;w*=1.+.6*r3.y;}\n' +
    ' if(al<=.03)return;\n' +
    ' float dpr=uView.z,hw=w*dpr*.5;\n' +
    ' vec2 sa=vec2(uProj.y+F*A.x/A.z,uProj.z-F*A.y/A.z)*dpr,sb=vec2(uProj.y+F*B.x/B.z,uProj.z-F*B.y/B.z)*dpr,d=sb-sa;\n' +
    ' float len=length(d);vec2 dir=len>1e-4?d/len:vec2(1.,0.),nrm=vec2(-dir.y,dir.x);\n' +
    ' float ext=1.,along=aCorner.x<.5?-ext:len+ext,across=aCorner.y*(hw+1.);\n' +
    ' vec2 p=(aCorner.x<.5?sa:sb)+dir*(aCorner.x<.5?-ext:ext)+nrm*across;float z=aCorner.x<.5?A.z:B.z;\n' +
    ' gl_Position=vec4(p.x/(uView.x*dpr)*2.-1.,1.-p.y/(uView.y*dpr)*2.,((uDepth.y+uDepth.x)*z-2.*uDepth.y*uDepth.x)/((uDepth.y-uDepth.x)*z),1.);\n' +
    ' vLine=vec3(across,along,hw);vLen=len;\n' +
    ' float thin=hw<.5?(2.*hw)/((hw+.5)*(hw+.5)):1.;\n' +
    ' vCol=vec4(mix(uCols[int(aMisc.x+.5)],uTint,.9*r3.y),min(1.,al)*thin);}\n';
  var FS_LINE = '#version 300 es\nprecision highp float;in vec4 vCol;in vec3 vLine;in float vLen;out vec4 o;\n' +
    'void main(){float hw=vLine.z,a=clamp(hw+.5-abs(vLine.x),0.,1.)*clamp(.5-max(-vLine.y,vLine.y-vLen),0.,1.);if(a*vCol.a<=.004)discard;o=vec4(vCol.rgb,vCol.a*a);}\n';
  /* a piece's faces, in the colour of the ground: they hide what is behind the piece */
  var VS_FILL = COMMON + 'layout(location=0) in vec3 aP;layout(location=1) in float aObj;uniform float uPush;\n' +
    'void main(){int o=int(aObj+.5);vec4 r3=texelFetch(uObj,ivec2(3,o),0);if(r3.x<=.7){gl_Position=vec4(2.,2.,2.,1.);return;}\n' +
    ' vec3 p=(xf(aP,texelFetch(uObj,ivec2(0,o),0),texelFetch(uObj,ivec2(1,o),0),texelFetch(uObj,ivec2(2,o),0))-uCam.xyz)*uPush;float F=uProj.x;\n' +
    ' gl_Position=vec4((uProj.y*p.z+F*p.x)/uView.x*2.-p.z,p.z-(uProj.z*p.z-F*p.y)/uView.y*2.,((uDepth.y+uDepth.x)*p.z-2.*uDepth.y*uDepth.x)/(uDepth.y-uDepth.x),p.z);}\n';
  var FS_FILL = '#version 300 es\nprecision highp float;uniform vec4 uCol;out vec4 o;void main(){o=uCol;}\n';
  /* the sheet itself, and the tooth of the paper laid over everything at the end */
  var VS_FULL = '#version 300 es\nlayout(location=0) in vec2 aP;void main(){gl_Position=vec4(aP,0.,1.);}\n';
  var FS_FULL = '#version 300 es\nprecision highp float;uniform sampler2D uGrain;uniform vec4 uView;uniform vec3 uBg;uniform vec2 uMode;out vec4 o;\n' +
    'void main(){vec2 p=gl_FragCoord.xy/uView.z;if(uMode.x<.5){float lo=min(uView.x,uView.y)*.3,hi=max(uView.x,uView.y)*.72,t=clamp((distance(p,uView.xy*.5)-lo)/(hi-lo),0.,1.);\n' +
    '  o=vec4(mix(uBg,vec3(126.,98.,58.)/255.,.24*t*uMode.y),1.);}else o=vec4(uBg,texture(uGrain,p/192.).r);}\n';

  function shader(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
  function program(vs, fs, names) {
    var p = gl.createProgram(); gl.attachShader(p, shader(gl.VERTEX_SHADER, vs)); gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    var u = {}; names.forEach(function (n) { u[n] = gl.getUniformLocation(p, n); }); return { p: p, u: u };
  }
  var pLine, pFill, pFull, vaoLine, vaoFill, vaoFull, texObj, texGrain, rows = new Float32Array((NO + 1) * 16), nFill = 0, NS = N + 8;
  function setup() {
    pLine = program(VS_LINE, FS_LINE, ['uObj', 'uCam', 'uProj', 'uView', 'uDepth', 'uCols', 'uTint', 'uDim']);
    pFill = program(VS_FILL, FS_FILL, ['uObj', 'uCam', 'uProj', 'uView', 'uDepth', 'uPush', 'uCol']);
    pFull = program(VS_FULL, FS_FULL, ['uGrain', 'uView', 'uBg', 'uMode']);
    /* strokes: two ends, then colour, weight, darkness, how soon it drops out with distance, and which piece it belongs to.
       They are laid out with the playhead first, then outlines, then shading from the coarsest rows to the finest, so a slow phone can leave the finest out. */
    var inst = new Float32Array(NS * 11), q, k, cnt = new Uint32Array(1026), slot = new Uint32Array(N), acc = 8, objOf = new Uint16Array(N);
    function bucket(v) { return v <= 0 ? 0 : 1 + Math.min(1023, Math.floor(v * 1024)); }
    for (i = 0; i < NO; i++) for (j = objs[i].a; j < objs[i].b; j++) objOf[j] = i;
    for (i = 0; i < N; i++) cnt[bucket(LD[i])]++;
    for (i = 0; i < 1025; i++) { k = cnt[i]; cnt[i] = acc; acc += k; }
    for (i = 0; i < N; i++) slot[i] = cnt[bucket(LD[i])]++;
    for (i = 0; i < N; i++) { q = slot[i] * 11; k = i * 6; inst[q] = Pf[k]; inst[q + 1] = Pf[k + 1]; inst[q + 2] = Pf[k + 2]; inst[q + 3] = Pf[k + 3]; inst[q + 4] = Pf[k + 4]; inst[q + 5] = Pf[k + 5]; inst[q + 6] = ST[i]; inst[q + 7] = WD[i]; inst[q + 8] = AL[i]; inst[q + 9] = LD[i]; inst[q + 10] = objOf[i]; }
    /* the playhead: a frame the size of the room, drawn twice, once wide and faint and once fine */
    var c4 = [[-HW - .15, -.08], [HW + .15, -.08], [HW + .15, CEIL + .3], [-HW - .15, CEIL + .3]];
    for (i = 0; i < 4; i++) for (j = 0; j < 2; j++) { q = (i * 2 + j) * 11; var a = c4[i], b = c4[(i + 1) % 4]; inst[q] = a[0]; inst[q + 1] = a[1]; inst[q + 3] = b[0]; inst[q + 4] = b[1]; inst[q + 6] = 3; inst[q + 7] = j ? 1.4 : 4.5; inst[q + 8] = j ? .95 : .25; inst[q + 9] = -1; inst[q + 10] = NO; }
    vaoLine = gl.createVertexArray(); gl.bindVertexArray(vaoLine);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, -1, 0, 1, 1, -1, 1, 1]), gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, inst, gl.STATIC_DRAW);
    [[1, 3, 0], [2, 3, 12], [3, 4, 24], [4, 1, 40]].forEach(function (a) { gl.enableVertexAttribArray(a[0]); gl.vertexAttribPointer(a[0], a[1], gl.FLOAT, false, 44, a[2]); gl.vertexAttribDivisor(a[0], 1); });
    /* faces */
    var tri = [];
    function fan(pts, o) { for (var t = 1; t + 1 < pts.length; t++) [pts[0], pts[t], pts[t + 1]].forEach(function (p) { tri.push(p[0], p[1], p[2], o); }); }
    for (i = 0; i < NO; i++) objs[i].polys.forEach(function (pts) { fan(pts, i); });
    nFill = tri.length / 4; fan(c4.map(function (p) { return [p[0], p[1], 0]; }), NO);
    vaoFill = gl.createVertexArray(); gl.bindVertexArray(vaoFill);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tri), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 16, 0); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 16, 12);
    vaoFull = gl.createVertexArray(); gl.bindVertexArray(vaoFull);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    /* where every piece is this frame: one row of numbers each, read by the chip */
    texObj = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texObj); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 4, NO + 1, 0, gl.RGBA, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    /* the tooth of the paper: the same speckle the stills use */
    var S = 192, g = 77, gr = new Uint8Array(S * S);
    for (i = 0; i < S * S; i++) { g = (g * 1103515245 + 12345) & 0x7fffffff; var v = g / 0x7fffffff; gr[i] = v < .38 ? 0 : Math.round((v - .38) * 255 * 1.15); }
    texGrain = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texGrain); gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1); gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, S, S, 0, gl.RED, gl.UNSIGNED_BYTE, gr);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  }
  try { setup(); } catch (e) { if (chip) chip.textContent = 'TEST · could not start'; body.setAttribute('data-ready', 'error'); if (window.console) console.error(String(e)); return; }

  var W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1), detail = 1;
  function size() { W = stage.clientWidth; H = stage.clientHeight; var w = Math.round(W * dpr), h = Math.round(H * dpr); if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; } }

  /* ------------------------------------------------------------------ one frame. s: where the eye and the playhead are, how far the opening has run */
  function draw(s) {
    var zp = s.zp, t = s.t, r = rows, q, ob, k, fade, tint, d, o;
    for (i = 0; i < NO; i++) {
      ob = objs[i]; q = i * 16; d = ob.c[2] - s.cz; tint = BLU[i] && s.u > 0 ? BLU[i] * sm(0, .08, s.u) * sm(38, 16, d) : 0;
      fade = s.still ? 1 : Math.min(1, Math.max(0, (t - DEL[i]) / .45));
      var go = s.u > 0 ? sm(13, 2.5, d) * sm(0, .12, s.u) : 0, lift = 0;          /* leaving: each piece lifts, spreads and goes as you reach it */
      fade *= (1 - go) * s.veil;
      if (ob.deco) k = 0;
      else {
        k = ob.w * (1 + 1.2 * go); lift = LIFT[i] * go;
        if (!s.still) { o = Math.min(1, Math.max(0, (t - DEL[i]) / 1.05)); k *= (1 + 1.5 * Math.pow(1 - o, 3)) * (1 + .028 * Math.sin(t * .55 + PH[i])); }   /* arriving, nearest first, then never quite still */
      }
      if (k > .002) {
        var ax = ob.rot[0] * k, ay = ob.rot[1] * k, az = ob.rot[2] * k, ca = Math.cos(ax), sa = Math.sin(ax), cb = Math.cos(ay), sb = Math.sin(ay), cg = Math.cos(az), sg = Math.sin(az), c = ob.c;
        var m00 = cg * cb, m01 = cg * sb * sa - sg * ca, m02 = cg * sb * ca + sg * sa, m10 = sg * cb, m11 = sg * sb * sa + cg * ca, m12 = sg * sb * ca - cg * sa, m20 = -sb, m21 = cb * sa, m22 = cb * ca;
        r[q] = m00; r[q + 1] = m01; r[q + 2] = m02; r[q + 3] = c[0] + ob.ex[0] * k - (m00 * c[0] + m01 * c[1] + m02 * c[2]);
        r[q + 4] = m10; r[q + 5] = m11; r[q + 6] = m12; r[q + 7] = c[1] + ob.ex[1] * k + lift - (m10 * c[0] + m11 * c[1] + m12 * c[2]);
        r[q + 8] = m20; r[q + 9] = m21; r[q + 10] = m22; r[q + 11] = c[2] + ob.ex[2] * k - (m20 * c[0] + m21 * c[1] + m22 * c[2]);
      } else { r[q] = 1; r[q + 1] = 0; r[q + 2] = 0; r[q + 3] = 0; r[q + 4] = 0; r[q + 5] = 1; r[q + 6] = 0; r[q + 7] = lift; r[q + 8] = 0; r[q + 9] = 0; r[q + 10] = 1; r[q + 11] = 0; }
      r[q + 12] = fade; r[q + 13] = tint;
    }
    q = NO * 16; var showP = zp - s.cz > NEAR + .2;
    r[q] = 1; r[q + 1] = 0; r[q + 2] = 0; r[q + 3] = 0; r[q + 4] = 0; r[q + 5] = 1; r[q + 6] = 0; r[q + 7] = 0; r[q + 8] = 0; r[q + 9] = 0; r[q + 10] = 1; r[q + 11] = zp; r[q + 12] = showP ? 1 : 0; r[q + 13] = 0;

    var M = PAL[ground], bg = M.bgf, F = Math.max(.62 * W, .78 * H), lead = M.lead;
    gl.viewport(0, 0, cv.width, cv.height); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texObj); gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 4, NO + 1, gl.RGBA, gl.FLOAT, r);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texGrain);
    function common(P) { gl.useProgram(P.p); gl.uniform1i(P.u.uObj, 0); gl.uniform4f(P.u.uCam, s.cx || 0, EYE, s.cz, NEAR); gl.uniform4f(P.u.uProj, F, W / 2, H * s.cy, 1); gl.uniform4f(P.u.uView, W, H, dpr, 70); gl.uniform2f(P.u.uDepth, ZN, ZF); }
    /* the sheet */
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.depthMask(true); gl.clearDepth(1); gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.useProgram(pFull.p); gl.uniform1i(pFull.u.uGrain, 1); gl.uniform4f(pFull.u.uView, W, H, dpr, 0); gl.uniform3f(pFull.u.uBg, bg[0], bg[1], bg[2]); gl.uniform2f(pFull.u.uMode, 0, M.vig);
    gl.bindVertexArray(vaoFull); gl.drawArrays(gl.TRIANGLES, 0, 3);
    /* the faces of every piece, set a fiftieth further off than they are, so a piece never hides its own lines */
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LESS); common(pFill); gl.uniform1f(pFill.u.uPush, 1.02); gl.uniform4f(pFill.u.uCol, bg[0], bg[1], bg[2], 1);
    gl.bindVertexArray(vaoFill); gl.drawArrays(gl.TRIANGLES, 0, nFill);
    /* every stroke, and the playhead's frame with them */
    gl.depthMask(false); gl.depthFunc(gl.LEQUAL); gl.enable(gl.BLEND); gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    common(pLine); gl.uniform3fv(pLine.u.uCols, M.cols); gl.uniform3f(pLine.u.uTint, M.tintf[0], M.tintf[1], M.tintf[2]); gl.uniform1f(pLine.u.uDim, (s.dim || 1) * .9);      /* strokes that cross are laid one over another here, where the stills merge them; this keeps the overall weight the same */
    gl.bindVertexArray(vaoLine); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, 8 + Math.round(N * detail));
    /* the playhead's wash */
    if (showP) { common(pFill); gl.uniform1f(pFill.u.uPush, 1); gl.uniform4f(pFill.u.uCol, lead[0], lead[1], lead[2], ground ? .035 : .05); gl.bindVertexArray(vaoFill); gl.drawArrays(gl.TRIANGLES, nFill, 6); }
    /* the tooth of the paper */
    gl.disable(gl.DEPTH_TEST); gl.useProgram(pFull.p); gl.uniform2f(pFull.u.uMode, 1, 0); gl.bindVertexArray(vaoFull); gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null); gl.depthMask(true);
  }

  /* ------------------------------------------------------------------ scroll, time, and the words on top */
  var t0 = 0, last = 0, camX = 0, camXT = 0, frozen = null, lastOp = -1;
  var mode = 'home', side = 0, tMode = 0, tArrive = 0, uNow = 0, pending = null, here = null, pushed = false, byLink = false, FAR = 54, LEAVE = 800, BACK = 800;       /* the flight: a long dive through the pieces, doubled twice at his asking once he had seen the short ones; half as long coming back */
  var destEl = doc.getElementById('dest');
  /* THE PAGES. Their names, addresses and words are in site/content.mjs. A page with an address of its own is flown to from the home screen; the two without one
     (Your order, Not found) only ever arrive as a document from the server. side is which way the flight leans. */
  var PAGES = {}; Object.keys(SITE.PAGES).forEach(function (k) { if (k !== 'home') PAGES[k] = { side: SITE.PAGES[k].side || 0, fly: SITE.PAGES[k].path != null }; });
  var ROUTE = {
    url: function (name) { if (HASH) return name ? '#' + name : location.pathname + location.search; return name && SITE.PAGES[name].path ? SITE.PAGES[name].path : '/'; },
    page: function () { if (HASH) { var h = (location.hash || '').slice(1); return PAGES[h] ? h : null; } var p = location.pathname.replace(/\/+$/, '') || '/', k; for (k in PAGES) if (SITE.PAGES[k].path === p) return k; return null; },
    first: function () { if (HASH) return this.page(); var b = body.getAttribute('data-page'); return b && b !== 'home' && PAGES[b] ? b : null; }
  };
  /* where the shared templates find things when they run here, in the browser */
  var TARGET = { href: function (p) { return ROUTE.url(p === 'home' ? null : p); }, asset: function (a) { return (AD.img && AD.img[a]) || (AD.base || '/site/img/') + a + (AD.v ? '?v=' + AD.v : ''); }, inlineImg: !!AD.img, products: AD.products || null };
  function pageData(name) { return name === 'products' ? { products: AD.products || [], sandbox: !!AD.sandbox } : null; }
  function stateAt(u, t, amb) {
    /* The flight goes twice as far as it first did, at the pace of the short one: up to speed in the first sixth, then steady all the way in, easing only at the very end.
       FAR is how far in it goes; the first half of the structure is 38 deep, so the last of the flight looks out across the gap to the second half. */
    var a = .16, b = .14, vm = 1 / (1 - a / 2 - b / 2), tr = u < a ? vm * u * u / (2 * a) : u > 1 - b ? 1 - vm * (1 - u) * (1 - u) / (2 * b) : vm * (u - a / 2);
    var dolly = calm ? 0 : -7 * Math.pow(1 - Math.min(1, t / 2.3), 3), e = u * u * (3 - 2 * u), cz = -13 + dolly + FAR * tr;
    return { cz: cz, zp: cz, lead: 0, cy: .47 + .03 * e, t: t, cx: camX + side * 1.5 * e, u: u, veil: Math.max(1 - sm(.72, .96, u), amb || 0), still: calm };
  }
  /* after a move between screens the keyboard and a screen reader start from the new screen, not from a word that has gone out of sight. Never on the first showing of a document. */
  var started = false;
  function readFrom(el) { if (!started || !el) return; try { el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); } catch (e) {} }
  function show(name, data) {
    here = name; body.setAttribute('data-page', name || 'home');
    if (!HASH) { var meta = SITE.PAGES[name || 'home']; if (meta && meta.title) doc.title = meta.title; }
    if (!name) { destEl.classList.remove('in'); destEl.hidden = true; return; }
    var sec = destEl.querySelector('.pg[data-pg="' + name + '"]'), holder;
    if (!sec || data) { holder = doc.createElement('div'); holder.innerHTML = SITE.section(TARGET, name, data || pageData(name)); if (sec) sec.parentNode.removeChild(sec); sec = holder.firstChild; destEl.insertBefore(sec, destEl.querySelector('a.back')); }
    Array.prototype.forEach.call(destEl.querySelectorAll('.pg'), function (s) { s.hidden = s !== sec; });
    destEl.hidden = false; destEl.scrollTop = 0; void destEl.offsetWidth; destEl.classList.add('in'); dress(); readFrom(destEl);
  }
  function arrive() { mode = 'page'; tArrive = performance.now(); uNow = 1; if (here !== pending) show(pending); }
  function leaveTo(name, push, plain) {
    if ((mode !== 'home' && mode !== 'returning') || !PAGES[name]) return; mode = 'home'; uNow = 0; pending = name; side = PAGES[name].side; if (hoverEl && !hoverEl.closest('#hdr')) unhover(true);       /* the word you pressed leaves with its circle */
    if (push) { try { history.pushState({ page: name }, '', ROUTE.url(name)); pushed = true; } catch (e) { pushed = false; } }
    if (calm || plain || !PAGES[name].fly) { arrive(); return; }       /* every page is flown to, but never when the browser's own Back or Forward brought you */
    mode = 'leaving'; tMode = performance.now();
  }
  function goHome(plain) {
    if (mode === 'home' || mode === 'returning') return; var was = here; show(null); if (hoverEl && !hoverEl.closest('#hdr')) unhover(true);
    if (calm || plain || !was || !PAGES[was] || !PAGES[was].fly) { mode = 'home'; uNow = 0; side = 0; furniture(0); readFrom(first); return; }
    tMode = performance.now() - (1 - uNow) * BACK; mode = 'returning';
  }
  var NAME = 'Anthony Dake', LOW = 'abcdefghknopqrstuvxyz', UPC = 'ABCDEFGHKLNOPRSTUVXYZ', rolled = -1;
  function roll(ms) {
    var k = Math.floor((ms - 1312) / 47);
    if (ms >= 1687 || calm) { if (rolled !== 99) { rolled = 99; rollEl.textContent = ''; nameEl.style.visibility = ''; nameEl.classList.remove('plain'); } return; }
    if (ms < 1312) { if (rolled !== -2) { rolled = -2; rollEl.textContent = ''; nameEl.style.visibility = ''; nameEl.classList.add('plain'); } return; }
    if (k === rolled) return; rolled = k;
    var locked = [0, 1, 3, 5, 7, 9, 10, 11][Math.min(7, k)], out = '';
    for (var n = locked; n < NAME.length; n++) { var ch = NAME.charAt(n), set = ch === ' ' ? ' ' : (ch === ch.toUpperCase() ? UPC : LOW); out += set.charAt(Math.floor(Math.random() * set.length)); }
    nameEl.style.visibility = 'hidden'; rollEl.innerHTML = '<b></b><i></i>'; rollEl.firstChild.textContent = NAME.slice(0, locked); rollEl.lastChild.textContent = out;
  }
  function furniture(u) {
    var op = 1 - sm(0, .2, u);
    if (Math.abs(op - lastOp) > .004 || (op === 0) !== (lastOp === 0)) { lastOp = op; first.style.opacity = op.toFixed(3); first.style.transform = 'scale(' + (1 + .06 * (1 - op)).toFixed(4) + ')'; first.style.visibility = op ? 'visible' : 'hidden'; }
  }
  /* the meter: what the test is for */
  var dts = new Float32Array(120), di = 0, dn = 0, shown = 0, slowRun = 0;
  function meter(dt, now) {
    dts[di] = dt; di = (di + 1) % 120; if (dn < 120) dn++;
    if (now - shown < 300) return; shown = now;
    var sum = 0, worst = 0, n; for (n = 0; n < dn; n++) { sum += dts[n]; if (dts[n] > worst) worst = dts[n]; }
    var fps = Math.round(1000 / (sum / dn)); if (chip) chip.firstChild.textContent = 'TEST · ' + fps + ' fps';
    if (read) read.textContent = 'slowest of the last ' + dn + ' frames: ' + Math.round(worst) + ' ms · ' + N.toLocaleString() + ' strokes · ' + Math.round(W * dpr) + ' × ' + Math.round(H * dpr) + ' dots' + (detail < 1 ? ' · finest ' + Math.round((1 - detail) * 100) + '% of the shading left out' : '') + ' · strokes worked out in ' + tBuild + ' ms';
    /* if the phone cannot keep up at full sharpness, draw fewer dots rather than drop frames */
    if (now - t0 > 3200 && dn === 120) { if (sum / dn > 21 && (dpr > 1 || detail > .45)) { if (++slowRun > 5) { if (dpr > 1) dpr = Math.max(1, dpr - .5); else detail = Math.max(.45, detail - .18); slowRun = 0; dn = 0; di = 0; size(); } } else slowRun = 0; }
  }
  function tick(now) {
    requestAnimationFrame(tick);
    if (frozen) return;
    if (!last) last = now; var dt = Math.min(100, now - last); last = now;
    size(); var u = 0, amb = 0;
    if (mode === 'leaving') { u = Math.max(0, Math.min(1, (now - tMode) / LEAVE)); uNow = u; if (u > .72 && here !== pending) show(pending); if (u >= 1) arrive(); }       /* slow off the mark, then gathering speed in among the pieces; the page fades in over the last of it, so it is there when the flight ends */
    else if (mode === 'returning') { u = 1 - Math.max(0, Math.min(1, (now - tMode) / BACK)); uNow = u; if (u <= 0) { mode = 'home'; u = 0; side = 0; furniture(0); readFrom(first); } }
    else if (mode === 'page') { u = 1; amb = .2 * sm(.2, 1.6, (now - tArrive) / 1000); }
    camX += (camXT - camX) * (1 - Math.exp(-dt / 220));
    var t = (now - t0) / 1000; roll(now - t0); draw(stateAt(u, t, amb)); furniture(u); meter(dt, now);
  }

  /* the ground follows the device unless the test panel says otherwise */
  function setGround(g, picked) {
    if (picked) groundPick = g; ground = g; body.className = GROUNDS[g] || 'black';
    Array.prototype.forEach.call(doc.querySelectorAll('[data-ground]'), function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-ground') === g)); });
  }
  if (mqLight && mqLight.addEventListener) mqLight.addEventListener('change', function () { if (groundPick == null) setGround(mqLight.matches ? LIGHT : 0); });
  if (chip && panel) chip.addEventListener('click', function () { var open = panel.hidden; panel.hidden = !open; chip.setAttribute('aria-expanded', String(open)); });
  if (panel) panel.addEventListener('click', function (ev) {
    var b = ev.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-ground')) setGround(+b.getAttribute('data-ground'), true);
    else if (b.hasAttribute('data-again')) { if (mode !== 'home') { show(null); mode = 'home'; uNow = 0; side = 0; } t0 = performance.now(); rolled = -1; if (mark) mark.again(); }
  });
  window.addEventListener('pointermove', function (ev) { if (ev.pointerType === 'mouse') { var r = stage.getBoundingClientRect(); camXT = Math.max(-.33, Math.min(.33, ((ev.clientX - r.left) / r.width - .5) * .66)); if (hoverEl && ev.target && ev.target.nodeType === 1 && ev.target.isConnected && !hoverEl.contains(ev.target)) unhover(); } }       /* a letter swapped out from under the pointer by a play is not the pointer leaving */, { passive: true });
  cv.addEventListener('webglcontextlost', function (ev) { ev.preventDefault(); frozen = 'lost'; });
  cv.addEventListener('webglcontextrestored', function () { try { setup(); frozen = null; } catch (e) {} });

  /* the two buttons, Back, and the browser's own back button */
  /* ------------------------------------------------------------------ controls in the manner of the reference: words, not boxes.
     A word you point at or press gets circled by hand, twice round, and its letters scramble (see scramble() below). A tap leaves a small pencil cross. */
  var lr = 77;
  function lrnd() { lr = (lr * 1103515245 + 12345) & 0x7fffffff; return lr / 0x7fffffff; }
  /* A circle the way a hand draws one. The pencil lands a little off the line, goes round once or twice at its own pace, swells here and flattens there,
     misses its own start, and leaves with a flick or a tuck. Every word gets its own from its own letters, and keeps it. */
  function rngOf(seed) { var a = seed || 1; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function scrawl(w, h, R, cap, roomL, roomR, o) {
    var wob = o ? o.wob : 1, cx = w / 2 + (R() * 2 - 1) * 2.5, cy = h / 2 + (R() * 2 - 1) * (cap ? .8 : 1.5),
        rx = w / 2 + (cap ? 6 : 3) + R() * (cap ? 6 : 7), ry = Math.min(h / 2 - 2, cap || 19) + R() * (cap ? 1.5 : 3.5),
        dir = o ? o.dir : (R() < .62 ? -1 : 1), a0 = o ? o.a0 : R() * 2 * PI, turns = o ? o.turns : 1.1 + Math.pow(R(), 1.25) * 1.15,
        tilt = (R() * 2 - 1) * Math.min(.16, 8 / w), pw = cap ? .66 + R() * .14 : .8 + R() * .2,     /* under 1 squares the ends off, as a hand does round a long word; more so round a door, to clear its brackets */
        A1 = (1 + R() * 2.2) * wob, f1 = R() * 6.283, A2 = (.8 + R() * 1.6) * wob, f2 = R() * 6.283, A3 = (.4 + R() * 1.3) * wob, f3 = R() * 6.283, A5 = (.2 + R() * .7) * wob, f5 = R() * 6.283,
        G = -3 + R() * 7.5, S = -1.5 + R() * 4.5, F = R() < .7 ? 2 + R() * 7 : -(1.5 + R() * 2.5), d1 = R() * 6.283, d2 = R() * 6.283,
        n = Math.round(54 * turns), pts = [], k,
        limT = cap ? ry + 6 : h / 2 + 3, limB = cap ? ry + 1.5 : h / 2 + 3, limX = w / 2 + 15, ct = Math.cos(tilt), st = Math.sin(tilt);
    function soft(v, lim) { return v > lim ? lim + (v - lim) * .22 : v; }                   /* room runs out gently: the line flattens against a neighbour rather than crossing it */
    for (k = 0; k <= n; k++) {
      var t = k / n, a = a0 + dir * t * turns * 2 * PI, c = Math.cos(a), sn = Math.sin(a),
          bx = rx * (c < 0 ? -1 : 1) * Math.pow(Math.abs(c), pw), by = ry * (sn < 0 ? -1 : 1) * Math.pow(Math.abs(sn), pw),
          nx = bx / (rx * rx), ny = by / (ry * ry), nl = Math.sqrt(nx * nx + ny * ny) || 1,
          off = A1 * Math.cos(a - f1) + A2 * Math.cos(2 * a - f2) + A3 * Math.cos(3 * a - f3) + A5 * Math.cos(5 * a - f5) + G * (t - .4) + wob * (1.1 * Math.sin(t * 5.3 + d1) + .6 * Math.sin(t * 11.7 + d2)) + (wob > 1.15 ? .45 * (wob - .7) * Math.sin(7 * a + d2) : 0);       /* the shakiest hands tremble a little */
      if (t < .07) off += S * Math.pow(1 - t / .07, 2);                                      /* where the pencil lands */
      if (t > .9) off += F * Math.pow((t - .9) / .1, 2);                                     /* and where it leaves */
      if (off < -3) off = -3 + (off + 3) * .3;                                               /* it may wander out freely, but only a little way in: never through the letters */
      var x = bx + off * nx / nl, y = by + off * ny / nl, X = x * ct - y * st, Y = x * st + y * ct;
      X = X < 0 ? -soft(-X, limX) : soft(X, limX); Y = Y < 0 ? -soft(-Y, limT) : soft(Y, limB); X += cx; Y += cy;
      if (roomL != null) X = Math.max(-Math.max(0, roomL), Math.min(w + Math.max(0, roomR), X));
      pts.push([X, Y]);
    }
    var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (k = 1; k < n; k++) d += 'Q' + pts[k][0].toFixed(1) + ' ' + pts[k][1].toFixed(1) + ' ' + ((pts[k][0] + pts[k + 1][0]) / 2).toFixed(1) + ' ' + ((pts[k][1] + pts[k + 1][1]) / 2).toFixed(1);
    return { d: d + 'L' + pts[n][0].toFixed(1) + ' ' + pts[n][1].toFixed(1), turns: turns, dir: dir };
  }
  var EASES = ['cubic-bezier(.42,.1,.5,.96)', 'cubic-bezier(.3,.2,.45,1)', 'cubic-bezier(.5,.05,.6,.9)', 'cubic-bezier(.36,.3,.6,.85)'], NS = 'http://www.w3.org/2000/svg';
  /* Five hands, and only five (his instruction, 24 Nov 2026: five, not dozens). They are chosen to be told apart: one that does not quite close, one a little over once round,
     one and a half, nearly twice, and twice round with a shaky hand; three go anticlockwise and two clockwise, and each lands in its own place. Each is dealt once before any comes back. */
  var DECK = [
    { seed: 7932, a0: 3.9, turns: .96, dir: -1, wob: .7 },
    { seed: 15851, a0: .6, turns: 1.18, dir: -1, wob: .9 },
    { seed: 23770, a0: 2.2, turns: 1.5, dir: 1, wob: 1 },
    { seed: 31689, a0: 5.2, turns: 1.85, dir: -1, wob: 1.2 },
    { seed: 39608, a0: 1.3, turns: 2.2, dir: 1, wob: 1.4 }
  ], order = [], dealt = 0, lastCard = -1;
  function deal() {
    if (dealt >= order.length) { var i, j, t; order = []; for (i = 0; i < DECK.length; i++) order.push(i); for (i = order.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = order[i]; order[i] = order[j]; order[j] = t; }
      if (order[0] === lastCard) { t = order[0]; order[0] = order[order.length - 1]; order[order.length - 1] = t; } dealt = 0; }       /* a new shuffle never opens on the hand just played */
    lastCard = order[dealt++]; return lastCard;
  }
  /* every word carries an empty frame for its circle; the circle itself only exists while it is wanted */
  function dress() {
    Array.prototype.forEach.call(doc.querySelectorAll('.loop'), function (el) {
      var w = el.offsetWidth, h = el.offsetHeight; if (!w || !h) return; if (el._w === w && el._h === h) return; el._w = w; el._h = h;
      var sv = el.querySelector('svg.ring'); if (!sv) { sv = doc.createElementNS(NS, 'svg'); sv.setAttribute('class', 'ring'); sv.setAttribute('aria-hidden', 'true'); sv.setAttribute('preserveAspectRatio', 'none'); el.appendChild(sv); }
      sv.setAttribute('viewBox', '0 0 ' + w + ' ' + h); if (el.classList.contains('on')) drawOn(el, +sv.getAttribute('data-card'));       /* the word changed size under its circle: cut the same hand again to fit */
    });
  }
  function drawOn(el, card) {
    var sv = el.querySelector('svg.ring'); if (!sv || !el._w) return; while (sv.firstChild) sv.removeChild(sv.firstChild);
    var id = card == null || isNaN(card) ? deal() : card, c = DECK[id], R = rngOf(c.seed), r = el.getBoundingClientRect(), sr = stage.getBoundingClientRect(), pth = doc.createElementNS(NS, 'path'),
        sc = scrawl(el._w, el._h, R, el.classList.contains('choice') ? 16 : 0, r.left - sr.left - 3, sr.right - r.right - 3, c);
    pth.setAttribute('d', sc.d); pth.setAttribute('pathLength', '1'); pth.style.strokeWidth = (1.35 + R() * .5).toFixed(2) + 'px';
    pth.style.setProperty('--dur', Math.round(340 + 350 * sc.turns + (R() * 2 - 1) * 50) + 'ms'); pth.style.setProperty('--ease', EASES[Math.floor(R() * EASES.length)]);       /* a longer line takes longer */
    sv.setAttribute('data-card', String(id)); sv.appendChild(pth);
    void getComputedStyle(pth).strokeDashoffset;       /* settle the empty state first, so the line is always drawn from nothing */
    el.classList.add('on');
  }
  /* gone at once and whole, finished or not; the letters settle too */
  function erase(el, keep) { var sv = el.querySelector('svg.ring'); if (sv) while (sv.firstChild) sv.removeChild(sv.firstChild); el.classList.remove('on'); if (!keep) settle(el); }
  /* THE SCRAMBLING LETTERS, as the bracketed words on the reference site behave (measured on humanperson.com on 24 Nov 2026: their "( clients )" and their small typewriter links;
     written here from those measurements, not from their code). One play goes like this:
       1. at once, every character of the word, brackets and spaces too, is swapped for one drawn at random from SC, and all of them are hidden;
       2. they come into view one at a time in a random order, a fiftieth of a second apart, each fading in over a fiftieth after a fiftieth's wait;
       3. when the last is in, each turns into its own letter: the one at place p (counting from the left, from 0) after 0 to p further fiftieths, picked at random,
          so the left end tends to settle first. The random characters do not change while they wait.
     So a word of n characters takes (n - 1) x 20 + 40 ms to come in and at most (n - 1) x 20 ms more to settle: 0.24 s + up to 0.2 s for their eleven-character "( clients )".
     It plays when the mouse or the keyboard arrives on a word and again when it leaves, and when a finger comes down (and again when a finger that stayed a third of a second or more lifts).
     A play started while another is running starts from nothing. Nothing plays under Reduce Motion. */
  var SC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ±§@!$^&*()-0123456789', SCT = 20, WAIT = 20, FADE = 20, downEl = null, tDown = 0;
  function pick() { return SC.charAt(Math.floor(Math.random() * SC.length)); }
  /* stop a play at once and put the plain word back exactly as it was in the page */
  function settle(el) {
    var st = el._sc; if (!st) return; el._sc = null; if (st.raf) cancelAnimationFrame(st.raf);
    st.sp.textContent = st.txt; st.sp.style.display = st.d0; st.sp.style.minWidth = st.m0;
    st.slots.forEach(function (s) { if (s.gap) { if (s.el.parentNode) s.el.parentNode.removeChild(s.el); } else if (s.side) { s.el.textContent = s.real; s.el.style.opacity = ''; s.el.style.width = s.w0; s.el.style.textAlign = s.a0; } });
    if (st.named) el.removeAttribute('aria-label');
  }
  function scramble(el) {
    if (calm) return; var sp = el.querySelector('[data-t]'); if (!sp) return; settle(el);
    var txt = sp.getAttribute('data-t'), node = sp.firstChild, n = txt.length, widths = [], slots = [], st, i, k, r, R, e, c;
    el._tk = (el._tk || 0) + 1;
    /* each letter keeps the room its own letter takes, so a random character of another width cannot push its neighbours about (in a typewriter face they are all one width anyway) */
    if (node && node.nodeType === 3 && node.data === txt && doc.createRange) { r = doc.createRange(); for (i = 0; i < n; i++) { r.setStart(node, i); r.setEnd(node, i + 1); widths.push(r.getBoundingClientRect().width); } }
    var d0 = sp.style.display, m0 = sp.style.minWidth; sp.style.minWidth = sp.getBoundingClientRect().width.toFixed(3) + 'px'; sp.style.display = 'inline-block';       /* the word holds its width for as long as the play lasts, and is given back as it was */
    /* the two brackets of a door are their own elements, set larger than the words: they take part like any other character, showing their random character at the words' size.
       The bare gap between a bracket and the words stands where the reference has a space, so it gets a character of its own for as long as the play lasts. */
    var sides = Array.prototype.filter.call(el.children, function (x) { return x.tagName === 'I'; }), L0 = sides.length === 2 && (sides[0].compareDocumentPosition(sp) & 4) && (sp.compareDocumentPosition(sides[1]) & 4) ? sides[0] : null, R0 = L0 ? sides[1] : null,
        cs = getComputedStyle(sp), fs = cs.fontSize, like = ';font-family:' + cs.fontFamily + ';font-size:' + fs + ';font-weight:' + cs.fontWeight + ';font-style:' + cs.fontStyle + ';color:' + cs.color + ';letter-spacing:0;text-indent:0;white-space:pre';       /* how the words are set, for the characters that stand in for a bracket or a gap */
    function side(x) { var b = x.getBoundingClientRect(), s = { el: x, side: true, real: x.textContent, w0: x.style.width, a0: x.style.textAlign }; x.style.width = b.width.toFixed(3) + 'px'; x.style.textAlign = 'center'; slots.push(s); }
    function gap() { var g = doc.createElement('b'); g.setAttribute('aria-hidden', 'true'); g.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;transform:translateX(-50%)' + like; slots.push({ el: g, gap: true, real: '' }); }
    if (L0) { side(L0); gap(); }
    sp.textContent = '';
    for (i = 0; i < n; i++) { e = doc.createElement('span'); e.style.cssText = 'display:inline-block;white-space:pre;text-align:center;opacity:0' + (widths.length ? ';width:' + widths[i].toFixed(3) + 'px' : ''); sp.appendChild(e); slots.push({ el: e, real: txt.charAt(i) }); }
    if (R0) { gap(); side(R0); }
    if (!el.hasAttribute('aria-label')) { el.setAttribute('aria-label', txt); var named = true; }       /* a screen reader hears the word, not the random characters */
    n = slots.length; var order = [], T = (n - 1) * SCT + WAIT + FADE, end = T, first, box;
    for (i = 0; i < n; i++) order.push(i);
    for (i = n - 1; i > 0; i--) { k = Math.floor(Math.random() * (i + 1)); c = order[i]; order[i] = order[k]; order[k] = c; }
    order.forEach(function (p, q) { slots[p].show = q * SCT + WAIT; });
    slots.forEach(function (s, p) {
      s.res = T + Math.floor(Math.random() * (p + 1)) * SCT; if (s.res > end) end = s.res; s.o = 0; s.el.style.opacity = '0'; c = s.g = pick();
      if (s.gap) { s.el.textContent = c; el.appendChild(s.el); }
      else if (s.side) { s.el.textContent = ''; e = doc.createElement('b'); e.style.cssText = 'position:relative;display:inline-block' + like; e.textContent = c; s.el.appendChild(e); s.inner = e; }
      else s.el.textContent = c;
    });
    /* place the characters that stand in the gaps and line the brackets' characters up with the words (measured now that every letter has something in it) */
    first = sp.firstChild ? sp.firstChild.getBoundingClientRect() : null; box = el.getBoundingClientRect();
    if (first) slots.forEach(function (s, p) {
      if (s.gap) { var a = slots[p - 1].el.getBoundingClientRect(), b = slots[p + 1].el.getBoundingClientRect(); s.el.style.left = ((a.right + b.left) / 2 - box.left).toFixed(2) + 'px'; s.el.style.top = (first.top - box.top).toFixed(2) + 'px'; s.el.style.lineHeight = first.height.toFixed(2) + 'px'; }
      else if (s.side) { s.inner.style.lineHeight = first.height.toFixed(2) + 'px'; s.inner.style.top = (first.top - s.inner.getBoundingClientRect().top).toFixed(2) + 'px'; }
    });
    st = el._sc = { sp: sp, txt: txt, slots: slots, named: !!named, raf: 0, t0: performance.now(), n: n, end: end, d0: d0, m0: m0 };
    (function step() {
      st.raf = 0; if (el._sc !== st) return; var t = performance.now() - st.t0, u, s, q;
      for (q = 0; q < n; q++) { s = slots[q];
        if (s.o !== 1) { u = (t - s.show) / FADE; if (u >= 1) { s.o = 1; s.el.style.opacity = ''; } else if (u > 0) s.el.style.opacity = (1 - (1 - u) * (1 - u)).toFixed(3); }
        if (!s.done && t >= s.res) { s.done = true; if (s.gap) s.el.textContent = ''; else if (s.side) s.el.textContent = s.real; else s.el.textContent = s.real; }
      }
      if (t < st.end) st.raf = requestAnimationFrame(step); else settle(el);
    })();
  }
  /* a word is circled while the mouse rests on it or the keyboard is on it, and not a moment longer. The mouse circles one word at a time. */
  var hoverEl = null;
  /* the letters play when the pointer or the keyboard arrives and again when it leaves. When it is the page that takes the word away (quiet: a press that leads somewhere),
     nothing new starts, a play already running is left to finish, and the circle that comes back on the leaving word comes without one: on the reference a click starts no play either. */
  function ringFor(el, quiet) { var want = !!(el._hover || el._focus), has = el.classList.contains('on'); if (want && !has) { drawOn(el); if (mode !== 'leaving') scramble(el); } else if (!want && has) { erase(el, true); if (!quiet) scramble(el); } }
  function unhover(quiet) { if (hoverEl) { var e = hoverEl; hoverEl = null; e._hover = false; ringFor(e, quiet === true); } }
  stage.addEventListener('pointerover', function (ev) { var el = ev.target.closest('.loop'); if (!el || ev.pointerType !== 'mouse' || el === hoverEl) return; unhover(); hoverEl = el; el._hover = true; ringFor(el); });
  stage.addEventListener('pointerout', function (ev) { var el = ev.target.closest('.loop'); if (el && el === hoverEl && ev.pointerType === 'mouse' && !el.contains(ev.relatedTarget)) unhover(); });
  doc.documentElement.addEventListener('mouseleave', function (ev) { if (!ev.relatedTarget) unhover(); });       /* a leave with somewhere to go is a letter being swapped under the pointer, not the mouse leaving the window */ window.addEventListener('blur', function () { unhover(); });
  stage.addEventListener('focusin', function (ev) { var el = ev.target.closest('.loop'), kb = true; if (!el) return; try { kb = ev.target.matches(':focus-visible'); } catch (e) {} if (kb) { el._focus = true; ringFor(el); } });       /* the keyboard, not a finger's tap */
  stage.addEventListener('focusout', function (ev) { var el = ev.target.closest('.loop'); if (el) { el._focus = false; ringFor(el); } });
  function lifted(ev) { var el = downEl; downEl = null; if (el && ev.pointerType !== 'mouse' && performance.now() - tDown >= 300 && stage.contains(el) && el.getClientRects().length) scramble(el); }       /* a finger that stayed: the letters play once more as it lifts */
  window.addEventListener('pointerup', lifted); window.addEventListener('pointercancel', lifted);
  stage.addEventListener('pointerdown', function (ev) {
    if (mode === 'leaving') { tMode = performance.now() - LEAVE; return; }       /* a second press skips the flight */
    var el = ev.target.closest('.loop'), finger = ev.pointerType !== 'mouse';
    if (el && finger) { scramble(el); downEl = el; tDown = performance.now(); }                                                /* a finger gets the scrambling letters and no circle: circles are for a mouse */
    if (calm || ev.target.closest('#panel') || (el && finger)) return;           /* and no cross beside a word that has no circle */
    /* on a word the cross goes at the shoulder of its circle, on the side with room, and travels with the word: it must never strike a letter out.
       On bare paper it goes where you pressed. */
    var host = el || stage, r = host.getBoundingClientRect(), sr = stage.getBoundingClientRect(), NS = 'http://www.w3.org/2000/svg', sv = doc.createElementNS(NS, 'svg'), rot = (Math.random() - .5) * 50, s1 = 5 + Math.random() * 2, tx, ty;
    if (el) { tx = r.left + r.width / 2 - sr.left > sr.width * .6 ? -12 : el.offsetWidth + 12; ty = el.offsetHeight / 2 + (r.top - sr.top < 30 ? 20 : -20); }
    else { tx = ev.clientX - r.left; ty = ev.clientY - r.top; }
    sv.setAttribute('class', 'tick'); sv.setAttribute('viewBox', '-10 -10 20 20'); sv.setAttribute('aria-hidden', 'true'); sv.style.left = (tx - 10).toFixed(1) + 'px'; sv.style.top = (ty - 10).toFixed(1) + 'px'; sv.style.transform = 'rotate(' + rot.toFixed(0) + 'deg)';
    [[-s1, -s1 + 1, s1, s1], [s1 - 1, -s1, -s1 + 1, s1 + 1]].forEach(function (q) { var l = doc.createElementNS(NS, 'path'); l.setAttribute('d', 'M' + q[0] + ' ' + q[1] + 'L' + q[2] + ' ' + q[3]); l.setAttribute('pathLength', '1'); sv.appendChild(l); });
    host.appendChild(sv); setTimeout(function () { if (sv.parentNode) sv.parentNode.removeChild(sv); }, 1500);
  });
  /* A WORD IN THE HEADER LEADS TO ITS PAGE FROM ANYWHERE ("Book" to Production, "Products" to Products): from the home screen it flies there, from another page it turns
     straight to it with no flight between two pages. ON ITS OWN PAGE IT MOVES NOTHING (his words about Book, 24 Nov 2026: "it shifts the page down a bit. it shouldnt do that"). */
  function jump(name) {
    if (!PAGES[name] || here === name || mode === 'leaving') return;
    if (mode === 'home' || mode === 'returning') { leaveTo(name, true); return; }
    pending = name; side = PAGES[name].side; try { history.replaceState({ page: name }, '', ROUTE.url(name)); } catch (e) {} if (hoverEl && !hoverEl.closest('#hdr')) unhover(true); show(name); tArrive = performance.now();
  }
  /* the doors, the links, Back, and the browser's own back button. A link marked data-plain is the browser's own to follow (a download, a re-check). */
  stage.addEventListener('click', function (ev) {
    var a = ev.target.closest('[data-go],[data-back],[data-jump]'); if (!a || !stage.contains(a) || a.hasAttribute('data-plain')) return;
    if (!HASH && here && PAGES[here] && !PAGES[here].fly) return;       /* on a page that exists only as a document from the server (Your order, Not found) every link is the browser's own: the page keeps its place in the history and is fetched fresh when you come back */
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button) return;       /* a new tab or window is the visitor's choice */
    ev.preventDefault();
    if (a.hasAttribute('data-jump')) jump(a.getAttribute('data-jump'));
    else if (a.hasAttribute('data-go')) leaveTo(a.getAttribute('data-go'), true);       /* no beat before you go: the answer to a press starts at once */
    else if (pushed) { pushed = false; byLink = true; try { history.back(); } catch (e) { byLink = false; goHome(); } }
    else { try { history.pushState({ page: null }, '', ROUTE.url(null)); } catch (e) {} goHome(); }       /* arrived straight on a page: Back still flies home, and the address follows */
  });
  /* the page's own Back plays the short return; the browser's or the phone's Back plays nothing */
  window.addEventListener('popstate', function () {
    var h = ROUTE.page(), link = byLink; byLink = false;
    if (!h) { goHome(!link); return; }
    if (mode === 'page' || mode === 'leaving') { pending = h; side = PAGES[h].side; mode = 'page'; uNow = 1; show(h); tArrive = performance.now(); } else leaveTo(h, false, true);
  });
  window.addEventListener('resize', dress);
  setGround(ground); size(); t0 = performance.now();
  var h0 = ROUTE.first(); if (h0) { pending = h0; side = PAGES[h0].side; arrive(); }       /* a link straight to a page skips the opening */
  started = true;
  /* the mark in the header draws itself once, in chalk, as the pieces arrive */
  /* THE CLIENT'S WORDS IN A MESSAGE BUBBLE (his pick, 24 Nov 2026: "bubble, pencil line", on the light ground and the dark). A text that has come in sits in a rounded shape
     with a small tail at its lower left; here that shape is one pencil line, roughened like the circles and cut to the size of the words. The words stand upright and to the left,
     as a message does, and lose their quotation marks. The page asks for it with data-say="line" on the body tag; without that, or without scripts, the words are the plain quotation. */
  var saidEl = doc.querySelector('.said'), saidQ = saidEl && saidEl.querySelector('blockquote'), bub = null, SAID = saidQ ? saidQ.textContent : '';
  function bubble() {
    if (!saidQ) return;
    if (!bub) { bub = doc.createElementNS(NS, 'svg'); bub.setAttribute('class', 'bub'); bub.setAttribute('aria-hidden', 'true'); bub.appendChild(doc.createElementNS(NS, 'path')); saidEl.insertBefore(bub, saidQ); }
    var w = saidQ.offsetWidth, h = saidQ.offsetHeight, r = 17; if (!w || !h) return;
    bub.style.display = ''; bub.setAttribute('viewBox', '0 0 ' + w + ' ' + h); bub.style.width = w + 'px'; bub.style.height = h + 'px'; bub.style.left = saidQ.offsetLeft + 'px'; bub.style.top = saidQ.offsetTop + 'px';
    bub.firstChild.setAttribute('d', 'M' + r + ' 0H' + (w - r) + 'Q' + w + ' 0 ' + w + ' ' + r + 'V' + (h - r) + 'Q' + w + ' ' + h + ' ' + (w - r) + ' ' + h + 'H20C13 ' + h + ' 5 ' + (h + 5) + ' -7 ' + (h + 6) + 'C0 ' + (h + 2) + ' 0 ' + (h - 4) + ' 0 ' + (h - 15) + 'V' + r + 'Q0 0 ' + r + ' 0Z');
  }
  bubble(); window.addEventListener('resize', bubble); if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(bubble);
  var mk = doc.getElementById('mk'), mark = null;
  if (window.ChalkMark && mk) { mk.width = mk.height = Math.round(34 * Math.min(3, window.devicePixelRatio || 1)); mark = ChalkMark.run({ size: 256, used: false, loop: false, favicon: true, targets: [{ canvas: mk, board: false, firm: 1 }] }); }
  requestAnimationFrame(tick);
  dress(); if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { Array.prototype.forEach.call(doc.querySelectorAll('.loop'), function (el) { el._w = 0; }); dress(); });
  body.setAttribute('data-ready', '1');
  window.__home = {
    n: N, objs: NO, build: tBuild, go: function (n) { leaveTo(n, false); }, home: goHome, jump: jump,
    open: function (name, data) { if (!PAGES[name]) return; if (mode !== 'page') { pending = name; side = PAGES[name].side; mode = 'page'; uNow = 1; tArrive = performance.now(); } show(name, data); },       /* any page in any state, with no flight (the prototype's Buy, and the checks) */
    order: function (data) { this.open('order', data); }, deck: DECK.length, ring: function (sel, i) { var el = doc.querySelector(sel); if (el) { erase(el); drawOn(el, i); } }, wipe: function (sel) { var el = doc.querySelector(sel); if (el) erase(el); },
    at: function (u, t, g, sd) { frozen = 'at'; if (g != null) setGround(g); side = sd || 0; size(); roll(t * 1000); draw(stateAt(u, t, 0)); furniture(u); },
    resume: function () { frozen = null; last = 0; },
    state: function () { return { mode: mode, u: +uNow.toFixed(3), here: here, leave: LEAVE, back: BACK, far: FAR, cz: +stateAt(uNow, 9, 0).cz.toFixed(2), blue: nBlu, left: mode === 'leaving' ? Math.max(0, Math.round(LEAVE - (performance.now() - tMode))) : 0, dpr: dpr, detail: detail, ground: ground, W: W, H: H, glError: gl.getError(), lost: gl.isContextLost() }; }
  };
}
(function () { function go() { requestAnimationFrame(function () { setTimeout(startHome, 20); }); } if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go(); })();
