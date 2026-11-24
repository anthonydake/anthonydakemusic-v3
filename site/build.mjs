#!/usr/bin/env node
/* THE SITE'S BUILD (site/build.mjs). Two things can be made from the one set of sources in this folder:

     node site/build.mjs
         What the Next app serves: public/site/app.css, public/site/app.js, the fonts and the pictures, and lib/site/manifest.generated.ts
         (a short mark of their contents, so a browser fetches them again only when they change). `npm run build` and `npm run dev` run this first.
         Everything it writes is git-ignored: it is made, never edited.

     node site/build.mjs --file <path.html>
         The whole site as ONE self-contained file (fonts, pictures, styles and script all inside; addresses are #names; nothing is sent anywhere; a TEST chip to try the grounds).
         This is the prototype Anthony opens to judge a design before it goes to a preview.

   Sources: content.mjs (every word and list), templates.mjs (the pages as HTML, used by the server and packed for the browser), css/, js/, data/, fonts/, img/.
   The script is packed in this order: the words and templates (window.ADSite), the chalk mark, the pages' behaviour, the engine. Nothing here needs a package except esbuild,
   and only to make the site's files smaller; without it they are written as they are. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.dirname(HERE);
const read = (f) => fs.readFileSync(path.join(HERE, f), 'utf8'), bytes = (f) => fs.readFileSync(path.join(HERE, f));
const hash = (buf) => crypto.createHash('sha256').update(buf).digest('hex').slice(0, 10);
const args = process.argv.slice(2), fileOut = args.includes('--file') ? args[args.indexOf('--file') + 1] : null;

const FONTS = [
  ['Instrument Serif', 'normal', 'instrument-serif-400.woff2', 'woff2', ''],
  ['Courier Prime', 'normal', 'courier-prime-400.woff2', 'woff2', ''],
  ['Courier Prime', 'italic', 'courier-prime-400-italic.woff2', 'woff2', ''],
  /* Courier Prime has no arrows: the two the site uses are drawn to its measures and loaded under its name for those two characters only */
  ['Courier Prime', 'normal', 'ad-arrows.woff', 'woff', ';unicode-range:U+2190,U+2192']
];
const fontFaces = (url) => FONTS.map(([fam, style, file, fmt, extra]) => `@font-face{font-family:"${fam}";font-weight:400;font-style:${style};font-display:swap;src:url(${url(file, fmt)}) format("${fmt}")${extra}}`).join('\n') + '\n';
const css = () => read('css/site.css') + '\n' + read('css/wide.css');

/* content.mjs and templates.mjs as one plain browser script: their exports become window.ADSite */
function lib() {
  const plain = (s) => s.replace(/^import .*$/gm, '').replace(/^export /gm, '');
  return '/* the words and the page templates (site/content.mjs, site/templates.mjs) */\n(function () {\n' + plain(read('content.mjs')) + '\n' + plain(read('templates.mjs')) +
    '\nwindow.ADSite = { SITE: SITE, PAGES: PAGES, HOME: HOME, RELEASES: RELEASES, OFFER: OFFER, BOOKING: BOOKING, ABOUT: ABOUT, PRESS_KIT: PRESS_KIT, STORE: STORE, section: section, documentHtml: documentHtml, esc: esc };\n})();\n';
}
function engine() {
  const e = read('js/engine.js');
  for (const mark of ['/*STRUCTURE*/', '/*DRUMS*/null', '/*ARR*/null']) if (e.split(mark).length !== 2) throw new Error('site/js/engine.js: the marker ' + mark + ' must stand exactly once');
  return e.replace('/*STRUCTURE*/', () => read('js/structure.js')).replace('/*DRUMS*/null', () => JSON.stringify(JSON.parse(read('data/drums.json')))).replace('/*ARR*/null', () => JSON.stringify(JSON.parse(read('data/arr.json'))));
}
const script = () => [lib(), read('js/chalk.js'), read('js/pages.js'), engine()].join('\n');

function walk(dir, base = dir, out = []) { for (const n of fs.readdirSync(dir).sort()) { const p = path.join(dir, n); if (fs.statSync(p).isDirectory()) walk(p, base, out); else out.push(path.relative(base, p)); } return out; }

async function buildSite() {
  const out = path.join(ROOT, 'public', 'site'); fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(path.join(out, 'fonts'), { recursive: true });
  for (const [, , file] of FONTS) fs.copyFileSync(path.join(HERE, 'fonts', file), path.join(out, 'fonts', file));
  const pics = walk(path.join(HERE, 'img')), sum = crypto.createHash('sha256');
  for (const f of pics) { const to = path.join(out, 'img', f); fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(path.join(HERE, 'img', f), to); sum.update(f).update(fs.readFileSync(to)); }
  let cssText = fontFaces((file) => 'fonts/' + file + '?h=' + hash(bytes('fonts/' + file))) + css(), jsText = script(), small = 'as written';
  new vm.Script(jsText, { filename: 'site script' });       /* a slip in the script stops the build here, by name and line, whatever happens below */
  try { const esbuild = await import('esbuild'); const c = esbuild.transformSync(cssText, { loader: 'css', minify: true }).code, j = esbuild.transformSync(jsText, { minify: true, target: 'es2019' }).code; cssText = c; jsText = j; small = 'made smaller with esbuild'; }
  catch (e) { console.warn('site: esbuild could not be used (' + String(e && e.message).split('\n')[0] + '); the files are written as they are'); }       /* the site works either way: only the size differs */
  fs.writeFileSync(path.join(out, 'app.css'), cssText); fs.writeFileSync(path.join(out, 'app.js'), jsText);
  const v = hash(sum.update(cssText).update(jsText).digest()), fonts = {};
  for (const [, , file] of FONTS) fonts[file] = hash(bytes('fonts/' + file));       /* the same marks the stylesheet's font addresses carry, so a page can ask for a font early by the very same address */
  const manifest = { v, fonts, css: Buffer.byteLength(cssText), js: Buffer.byteLength(jsText), pictures: pics.length };
  fs.mkdirSync(path.join(ROOT, 'lib', 'site'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'lib', 'site', 'manifest.generated.ts'), '// Made by site/build.mjs (npm run site). Do not edit, do not commit.\nexport const MANIFEST = ' + JSON.stringify(manifest, null, 2) + ';\n');
  console.log(`site: public/site written (${small}): app.css ${manifest.css} bytes, app.js ${manifest.js} bytes, ${pics.length} pictures, mark ${v}`);
}

async function buildFile(dest) {
  const T = await import(pathToFileURL(path.join(HERE, 'templates.mjs')).href), C = await import(pathToFileURL(path.join(HERE, 'content.mjs')).href);
  const uri = (f, mime) => 'data:' + mime + ';base64,' + bytes(f).toString('base64'), img = {};
  for (const r of C.RELEASES) img['covers/' + r.key + '-240.jpg'] = uri('img/covers/' + r.key + '-240.jpg', 'image/jpeg');
  img['about/' + C.ABOUT.photo.name + '-800.jpg'] = uri('img/about/' + C.ABOUT.photo.name + '-800.jpg', 'image/jpeg');
  /* the one product a preview shows: the store's own placeholder (data/store.data.ts). Here Buy goes nowhere near Square. */
  const products = [{ id: 'test-download', title: 'Test download', blurb: 'A placeholder for checking the checkout flow. Sandbox only. It is never listed in live mode.', priceCents: 100 }];
  const AD = { mode: 'file', img, products, sandbox: true };
  /* a picture the stylesheet names (url(img/...)) is carried inside the file too */
  const mime = (f) => (f.endsWith('.png') ? 'image/png' : f.endsWith('.webp') ? 'image/webp' : 'image/jpeg');
  const cssText = fontFaces((file, fmt) => uri('fonts/' + file, 'font/' + fmt)) + (css() + '\n' + read('css/test.css')).replace(/url\((img\/[^)]+)\)/g, (m, f) => 'url(' + uri(f, mime(f)) + ')');
  const t = {
    href: (p) => (p === 'home' ? '#' : '#' + p), asset: (a) => img[a] || '', inlineImg: true, products,
    head: '<link rel="icon" type="image/png" href="' + uri('img/mark/mark-chalk-64.png', 'image/png') + '">\n<style>\n' + cssText + '\n</style>\n',
    test: read('test-panel.html'),
    tail: '<script>window.__AD = ' + JSON.stringify(AD).replace(/</g, '\\u003c') + ';</script>\n<script>\n' + script().replace(/<\/script/gi, '<\\/script') + '\n</script>\n'
  };
  const html = T.documentHtml(t, 'home', { title: 'Anthony Dake · site prototype', noindex: true });
  fs.mkdirSync(path.dirname(path.resolve(dest)), { recursive: true }); fs.writeFileSync(dest, html);
  console.log('one file: ' + dest + ' (' + Buffer.byteLength(html) + ' bytes)');
}

await (fileOut ? buildFile(fileOut) : buildSite());
