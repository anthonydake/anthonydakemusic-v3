/* THE PAGES AS HTML (site/templates.mjs).
   Plain functions that turn the words in content.mjs into markup. The same functions run in two places:
   - on the server, where lib/site/render.ts builds each address its own whole document, so every word is in the page before any script runs;
   - in the browser, packed into the site's script by site/build.mjs, where the engine uses them to put a page in place when a visitor moves between pages without a reload.
   So: no imports beyond content.mjs, nothing that needs Node or a browser, strings in and strings out.

   A "target" object tells the functions where they are running:
     href(page)        the address of a page ('/production' on the site, '#production' in the one-file prototype)
     asset(path)       the address of a picture in site/img ('covers/aura-240.jpg' -> '/site/img/covers/aura-240.jpg?v=…', or the picture itself as data in the one-file prototype)
     inlineImg         true when pictures are carried as data, so only one size of each is used
     products          the products on sale right now (or null: then the header shows no Products link)
     head, tail        what the document needs at the end of its head and of its body (the stylesheet and the script, as links or in full)
     test              true only in the one-file prototype: adds the workshop panel */
import { SITE, PAGES, HOME, RELEASES, YOUTUBE, BELT_LABEL, OFFER, BOOKING, ABOUT, PRESS_KIT, STORE, US_STATES, MISSING, BACK } from './content.mjs';

export function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

/* A word you press, in ink. Its letters scramble and a mouse circles it in pencil (the engine does both; it needs the word in data-t). */
export function word(label, href, attrs) { return '<a class="tx loop' + (attrs && attrs.cls ? ' ' + attrs.cls : '') + '" href="' + esc(href) + '"' + (attrs && attrs.data ? ' ' + attrs.data : '') + '><span data-t="' + esc(label) + '">' + esc(label) + '</span></a>'; }
/* The door: the one blue thing on a screen, a word between brackets. tag is 'a' (with href) or 'button'. */
export function door(label, tag, attrs) {
  var open = tag === 'button' ? '<button type="submit" class="choice lead loop' + (attrs && attrs.cls ? ' ' + attrs.cls : '') + '">' : '<a class="choice lead loop' + (attrs && attrs.cls ? ' ' + attrs.cls : '') + '" href="' + esc(attrs && attrs.href) + '"' + (attrs && attrs.data ? ' ' + attrs.data : '') + '>';
  return open + '<i aria-hidden="true">(</i><span data-t="' + esc(label) + '">' + esc(label) + '</span><i aria-hidden="true">)</i>' + (tag === 'button' ? '</button>' : '</a>');
}
export function price(cents) { var d = cents / 100; return '$' + (Math.round(d) === d ? String(d) : d.toFixed(2)); }
export function countWord(n) { return ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'][n] || String(n); }

/* ------------------------------------------------------------------ the home screen's words (they are in every document: Back flies home without a reload) */
export function homeWords(t, page) {
  var nameTag = page === 'home' ? 'h1' : 'p';       /* one main heading a document: the name at home, the page's own name elsewhere */
  return '<div id="first">' +
    '<div class="edge"></div>' +
    '<div class="lock"><div class="h1w"><' + nameTag + ' id="name" class="plain">' + esc(SITE.name) + '</' + nameTag + '><span id="roll" aria-hidden="true"></span></div><p class="mon">' + esc(SITE.moniker) + '</p>' +
    '<div class="pills"><div class="door">' + door(HOME.door, 'a', { href: t.href('production'), data: 'data-go="production"' }) + '</div></div></div>' +
    '<div class="base"><figure class="said"><blockquote>' + esc(HOME.text) + '</blockquote><figcaption>' + esc(HOME.credit) + '</figcaption></figure>' +
    '<nav class="foot" aria-label="More pages">' + word(PAGES.about.label, t.href('about'), { data: 'data-go="about"' }) + word(PAGES['press-kit'].label, t.href('press-kit'), { data: 'data-go="press-kit"' }) + '</nav></div>' +
    '</div>';
}

/* ------------------------------------------------------------------ the header: Products at the left (only while there is something to buy), the mark in the middle, Book at the right.
   THE MARK IS THE WAY HOME FROM EVERY PAGE (his words, 24 Nov 2026: "the AD logo up top should be the home button to everywhere"). It is a real link to the home address;
   the engine turns a press on it into the flight back (data-home), and on the home screen it moves nothing. */
export function header(t) {
  return '<header id="hdr">' + (t.products && t.products.length ? word(PAGES.products.label, t.href('products'), { cls: 'l', data: 'data-jump="products"' }) : '') +
    '<a class="pin" href="' + esc(t.href('home')) + '" data-home aria-label="' + esc(SITE.name) + ', home"><canvas id="mk" width="68" height="68" aria-hidden="true"></canvas></a>' +
    word('Book', t.href('production'), { cls: 'r', data: 'data-jump="production"' }) + '</header>';
}

/* ------------------------------------------------------------------ PRODUCTION: the two words, the belt of covers, the offer, the booking form */
/* A cover, its title and its artist are one link to that release on YouTube, opened in a new tab so the site stays where it was. The picture's own description is left empty:
   the title and the artist stand right under it inside the same link, and saying them twice helps nobody. A release with no cover yet (art: null) shows an empty frame. */
function cover(t, r) {
  var has = !!(r.art && r.art.length), small = has ? t.asset('covers/' + r.key + '-240.jpg') : '', big = has && r.art[1] ? t.asset('covers/' + r.key + '-' + r.art[1] + '.jpg') : '';
  var pic = has ? '<img class="belt-art" src="' + small + '"' + (big && !t.inlineImg ? ' srcset="' + small + ' 240w, ' + big + ' ' + r.art[1] + 'w" sizes="(min-width: 700px) 280px, 124px"' : '') + ' width="240" height="240" alt="" draggable="false" decoding="async">'
    : '<span class="belt-art belt-none"></span>';
  var words = '<span class="belt-t">' + esc(r.title) + '</span><span class="belt-by" data-full="' + esc(r.artist) + '" title="' + esc(r.artist) + '">' + esc(r.artist) + '</span>';
  return '<div class="belt-item" role="listitem">' + (r.youtube ? '<a class="belt-a" href="' + esc(YOUTUBE + r.youtube) + '" target="_blank" rel="noopener" draggable="false">' + pic + words + '<span class="vh">, on YouTube</span></a>' : pic + words) + '</div>';
}
function field(name, label, attrs, need) {
  return '<label class="bk-f"><span class="bk-l"><span>' + esc(label) + '</span><span class="bk-e"' + (need ? ' aria-live="polite"' : '') + '>' + (need ? '' : esc(BOOKING.optional)) + '</span></span>' +
    (name === 'note' ? '<textarea name="note" rows="1"></textarea>' : '<input name="' + name + '" ' + attrs + (need ? ' required' : '') + '>') + '</label>';
}
export function bookingForm(t, state) {
  /* state: undefined (the form), 'sent' (the words a visitor sees after sending), 'failed' (the form again, with the line that says it did not go) */
  return '<form class="bk" id="bk" aria-label="Book ' + esc(OFFER.name) + '" method="post" action="' + (t.bookAction || '/api/book') + '"' + (state === 'sent' ? ' hidden' : '') + '>' +
    field('name', BOOKING.fields.name, 'type="text" autocomplete="name" autocapitalize="words"', true) +
    field('email', BOOKING.fields.email, 'type="email" autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false"', true) +
    field('link', BOOKING.fields.link, 'type="text" inputmode="url" autocapitalize="off" autocorrect="off" spellcheck="false"', false) +
    field('note', BOOKING.fields.note, '', false) +
    '<input class="bk-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +       /* left empty by people; a script that fills every field gives itself away */
    '<p class="bk-go">' + door(BOOKING.send, 'button', { cls: 'bk-send' }) + '</p>' +
    '<p class="bk-fail" role="alert"' + (state === 'failed' ? '' : ' hidden') + '>' + esc(BOOKING.failed) + '</p></form>' +
    '<div class="bk-done" id="bkdone"' + (state === 'sent' ? '' : ' hidden') + '><h2 tabindex="-1">' + esc(BOOKING.doneHead) + '</h2><p>' + esc(BOOKING.doneLine) + '</p></div>';
}
export function production(t, data) {
  return '<h1 class="pg-h vh">' + esc(PAGES.production.label) + '</h1>' +
    '<div class="cvs" id="cvs"><p class="belt-label">' + esc(BELT_LABEL) + '</p>' +
    '<div class="belt" role="group" aria-label="' + esc(countWord(RELEASES.length) + ' productions') + '"><div class="belt-track" role="list">' + RELEASES.map(function (r) { return cover(t, r); }).join('') + '</div></div>' +
    '<div class="offer" id="offer"><h2 class="offer-name">' + esc(OFFER.name) + '</h2><p class="offer-what">' + esc(OFFER.what) + '</p></div>' +
    bookingForm(t, data && data.booking) + '</div>';
}

/* ------------------------------------------------------------------ ABOUT: the photograph with the artists' texts round it, and their credit */
export function about(t) {
  var p = ABOUT.photo, sizes = '(min-width: 1600px) 740px, (min-width: 700px) 460px, 78vw', set = function (ext) { return p.widths.map(function (w) { return t.asset('about/' + p.name + '-' + w + '.' + ext) + ' ' + w + 'w'; }).join(', '); };
  var img = t.inlineImg ? '<img src="' + t.asset('about/' + p.name + '-800.jpg') + '" width="' + p.w + '" height="' + p.h + '" alt="' + esc(p.alt) + '" decoding="async">'
    : '<picture><source type="image/webp" srcset="' + set('webp') + '" sizes="' + sizes + '"><img src="' + t.asset('about/' + p.name + '-800.jpg') + '" srcset="' + set('jpg') + '" sizes="' + sizes + '" width="' + p.w + '" height="' + p.h + '" alt="' + esc(p.alt) + '" decoding="async"></picture>';
  return '<h1 class="pg-h">' + esc(PAGES.about.label) + '</h1>' +
    '<div class="abt" id="abt"><div class="abt-wall"><figure class="abt-pic">' + img + '</figure>' +
    ABOUT.texts.map(function (x) { return '<figure class="msg"><blockquote>' + esc(x[0]) + '</blockquote></figure>'; }).join('') +
    '</div><p class="abt-c">' + esc(ABOUT.credit) + '</p></div>';
}

/* ------------------------------------------------------------------ PRESS KIT: his bio, in his words (ruled blanks if it were ever empty) */
export function pressKit() {
  var bio = PRESS_KIT.bio || [], blanks = [100, 96, 100, 62, 0, 100, 93, 100, 98, 41, 0, 100, 97, 70];
  return '<h1 class="pg-h">' + esc(PAGES['press-kit'].label) + '</h1><div class="pk" id="pk">' +
    (bio.length ? bio.map(function (para) { return '<p class="pk-p">' + esc(para) + '</p>'; }).join('')
      : '<div class="pk-blank" aria-hidden="true">' + blanks.map(function (w) { return w ? '<span style="width:' + w + '%"></span>' : '<i></i>'; }).join('') + '</div><p class="pk-c">' + esc(PRESS_KIT.toCome) + '</p>') + '</div>';
}

/* ------------------------------------------------------------------ PRODUCTS: what is for sale, each with its own Buy. Buy is a GET link to the cart confirm page, so it works with scripts off. */
export function products(t, data) {
  var list = (data && data.products) || t.products || [], d = data || {};
  return '<h1 class="pg-h">' + esc(PAGES.products.label) + '</h1><div class="pd" id="pd">' +
    (d.sandbox ? '<p class="pd-mode">' + esc(STORE.testMode) + '</p>' : '') +
    (d.error ? '<p class="pd-err" role="alert">' + esc(STORE.failed) + '</p>' : '') +
    (list.length ? '<ul class="pd-list">' + list.map(function (p) {
      return '<li class="pd-item"><h2 class="pd-t">' + esc(p.title) + '</h2><p class="pd-price">' + esc(price(p.priceCents)) + '</p><p class="pd-b">' + esc(p.blurb) + '</p>' +
        '<p class="pd-f">' + door(STORE.buy, 'a', { href: '/products/buy/' + encodeURIComponent(p.id), cls: 'pd-buy', data: 'data-plain' }) + '</p></li>';
    }).join('') + '</ul><p class="pd-c">' + esc(STORE.under) + '</p>' : '<p class="pd-none">' + esc(STORE.none) + '</p>') + '</div>';
}

/* ------------------------------------------------------------------ CART / CONFIRM (/products/buy/<id>): ask for the buyer's state so tax is settled before the payment link is made.
 * Two steps, no JavaScript: step 1 asks the state; step 2 (same URL, ?state=XX) shows subtotal + tax + total and a Confirm & pay button that POSTs to /api/store/checkout. */
export function buy(t, data) {
  var d = data || {}, product = d.product, step = d.step || 'state';
  if (!product) return '<h1 class="pg-h">' + esc(STORE.cart.title) + '</h1><p class="pd-none">' + esc(STORE.none) + '</p>';

  var headline = '<h1 class="pg-h">' + esc(STORE.cart.title) + '</h1>' +
    (d.sandbox ? '<p class="pd-mode">' + esc(STORE.testMode) + '</p>' : '') +
    (d.error ? '<p class="pd-err" role="alert">' + esc(d.error) + '</p>' : '');
  var item =
    '<div class="ct-item"><p class="ct-t">' + esc(product.title) + '</p>' +
    '<p class="ct-p">' + esc(price(product.priceCents)) + '</p></div>';

  if (step === 'state') {
    // Step 1: pick a state. Plain GET form; submit sends the browser to the
    // same URL with ?state=XX. The label follows the booking form's shape
    // (bk-l / bk-e) so the dropdown reads as a site field, not a browser one.
    // oninvalid/oninput give the native "please select" popup the site's
    // terser phrasing without needing scripts.
    var opts = US_STATES.map(function (s) { return '<option value="' + esc(s[0]) + '">' + esc(s[1]) + '</option>'; }).join('');
    return headline + '<div class="ct" id="ct">' + item +
      '<form class="ct-f ct-f-state" method="get" action="' + esc('/products/buy/' + encodeURIComponent(product.id)) + '">' +
      '<label class="bk-f ct-field"><span class="bk-l"><span>' + esc(STORE.cart.stateLabel) + '</span><span class="bk-e" aria-live="polite"></span></span>' +
      '<select class="ct-s" name="state" required oninvalid="this.setCustomValidity(\'Pick a state.\')" oninput="this.setCustomValidity(\'\')">' +
      '<option value="">' + esc(STORE.cart.statePlaceholder) + '</option>' +
      opts +
      '<option value="XX">' + esc(STORE.cart.outside) + '</option>' +
      '</select></label>' +
      '<p class="ct-h">' + esc(STORE.cart.stateHelp) + '</p>' +
      '<p class="ct-go">' + door(STORE.cart.review, 'button', { cls: 'ct-rev' }) + '</p>' +
      '</form>' +
      '</div>';
  }

  // Step 2: state is settled. Show the breakdown and a Confirm & pay button.
  // The totals table is one tbody of 2–4 rows: subtotal, shipping (if any),
  // tax (if OH and > 0), total. The TOTAL ROW's class is ct-tr-tot to keep
  // it distinct from the table's own ct-tot (they would clash in CSS).
  var totals = d.totals || {};
  var ohio = (d.buyerState || '').toUpperCase() === 'OH';
  var row = function (label, cents, cls) {
    return '<tr class="ct-row ct-' + cls + '"><th scope="row">' + esc(label) + '</th>' +
      '<td>' + esc(price(cents)) + '</td></tr>';
  };
  var rows = row(STORE.cart.subtotal, totals.subtotalCents || 0, 'sub');
  if ((totals.shippingCents || 0) > 0) rows += row(STORE.cart.shipping, totals.shippingCents, 'ship');
  if (ohio && (totals.taxCents || 0) > 0) rows += row(STORE.cart.tax, totals.taxCents, 'tax');
  rows += row(STORE.cart.total, totals.totalCents || 0, 'tr-tot');

  var noTaxLine = ohio ? '' : '<p class="ct-notax">' + esc(STORE.cart.noTax) + '</p>';

  return headline + '<div class="ct" id="ct">' + item +
    '<table class="ct-tot"><tbody>' + rows + '</tbody></table>' +
    noTaxLine +
    '<form class="ct-f ct-f-pay" method="post" action="' + (t.buyAction || '/api/store/checkout') + '">' +
    '<input type="hidden" name="product" value="' + esc(product.id) + '">' +
    '<input type="hidden" name="state" value="' + esc(d.buyerState || '') + '">' +
    '<p class="ct-go">' + door(STORE.cart.confirm, 'button', { cls: 'ct-pay' }) + '</p>' +
    '<p class="ct-c">' + esc(STORE.under) + '</p>' +
    '</form>' +
    '</div>';
}

/* ------------------------------------------------------------------ YOUR ORDER: where Square sends a buyer back to. Five states (lib/store/orders.ts decides which).
 * If a tax breakdown is present (an Ohio order always has one; a non-Ohio order has zero tax and the tax row is left out), show it under the download. */
export function order(t, data) {
  var d = data || {}, s = d.state || 'pending', mail = '<a class="od-mail" href="mailto:' + esc(SITE.email) + '">' + esc(SITE.email) + '</a>';
  var totals = d.totals;
  var row = function (label, cents, cls) {
    return '<tr class="od-row od-' + cls + '"><th scope="row">' + esc(label) + '</th><td>' + esc(price(cents)) + '</td></tr>';
  };
  var breakdown = '';
  if (totals && (s === 'ready' || s === 'refunded')) {
    var tr = row(STORE.totals.subtotal, totals.subtotalCents || 0, 'sub');
    if ((totals.shippingCents || 0) > 0) tr += row(STORE.totals.shipping, totals.shippingCents, 'ship');
    if ((totals.taxCents || 0) > 0) tr += row(STORE.totals.tax, totals.taxCents, 'tax');
    // "od-tr-tot" on the total row (not "od-tot", which is the table itself — same clash the cart had).
    tr += row(STORE.totals.paid, totals.totalCents || 0, 'tr-tot');
    breakdown = '<table class="od-tot"><tbody>' + tr + '</tbody></table>';
  }
  return '<p class="pg-h">' + esc(PAGES.order.label) + '</p><div class="od" id="od" data-state="' + esc(s) + '">' +
    '<h1 class="od-h">' + esc(STORE.heading[s]) + '</h1>' +
    '<p class="od-l">' + (s === 'ready' ? esc(d.title || 'Your download') + esc(STORE.line.ready) : esc(STORE.line[s])) + '</p>' +
    (s === 'ready' && d.downloadHref ? '<p class="od-go">' + door(STORE.download, 'a', { href: d.downloadHref, cls: 'od-dl', data: 'data-plain download' }) + '</p><p class="od-c">' + esc(STORE.keep) + '</p>' : '') +
    ((s === 'pending' || s === 'stalled') && d.retryHref ? '<p class="od-go">' + word(STORE.again, d.retryHref, { cls: 'od-again', data: 'data-plain' }) + '</p>' : '') +
    breakdown +
    '<p class="od-q">' + esc(STORE.questions) + ' ' + mail + (d.sandbox ? ' · ' + esc(STORE.testTag) : '') + '</p></div>';
}

export function missing() { return '<h1 class="pg-h">' + esc(PAGES.missing.label) + '</h1><div class="ms"><p class="ms-l">' + esc(MISSING.line) + '</p></div>'; }

/* One page's section, by name. The engine calls this in the browser; the document below calls it on the server. */
export function section(t, page, data) {
  var inner = page === 'production' ? production(t, data) : page === 'about' ? about(t) : page === 'press-kit' ? pressKit() : page === 'products' ? products(t, data) : page === 'buy' ? buy(t, data) : page === 'order' ? order(t, data) : page === 'missing' ? missing() : '';
  return '<section class="pg pg-' + page + '" data-pg="' + page + '">' + inner + '</section>';
}

/* ------------------------------------------------------------------ the whole document for one address */
export function documentHtml(t, page, data) {
  var P = PAGES[page] || PAGES.missing, d = data || {}, home = page === 'home', url = P.path ? SITE.origin + (P.path === '/' ? '/' : P.path) : '';
  var hidden = page === 'order' || page === 'missing' || page === 'products' || page === 'buy' || d.noindex;       /* the store stays out of search for now, as it was */
  return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '<title>' + esc(d.title || P.title) + '</title>\n' +
    (P.description ? '<meta name="description" content="' + esc(P.description) + '">\n' : '') +
    (hidden ? '<meta name="robots" content="noindex, nofollow">\n' : '') +
    (page === 'order' ? '<meta name="referrer" content="no-referrer">\n' : '') +
    (url && !hidden ? '<link rel="canonical" href="' + esc(url) + '">\n' : '') +
    '<meta name="color-scheme" content="dark light">\n<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000">\n<meta name="theme-color" media="(prefers-color-scheme: light)" content="#f7f6f2">\n' +
    (t.inlineImg ? '' : '<meta property="og:type" content="website">\n<meta property="og:site_name" content="' + esc(SITE.name) + '">\n<meta property="og:title" content="' + esc(P.title) + '">\n' +
      (P.description ? '<meta property="og:description" content="' + esc(P.description) + '">\n' : '') + (url ? '<meta property="og:url" content="' + esc(url) + '">\n' : '') +
      '<meta property="og:image" content="' + esc(SITE.origin + '/og-image.jpg') + '">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta name="twitter:card" content="summary_large_image">\n') +
    (d.headExtra || '') +
    '<script>document.documentElement.className="js"</script>\n' +
    (t.head || '') +
    '</head>\n<body data-page="' + esc(page) + '">\n<div id="stage">\n<canvas id="gl" aria-hidden="true"></canvas>\n' +
    header(t) + '\n' +       /* first in the document, so the keyboard and a screen reader meet it first; the stylesheet puts it on top whatever its place here */
    homeWords(t, page) + '\n' +
    '<main class="dest' + (home ? '' : ' in') + '" id="dest"' + (home ? ' hidden' : '') + '>' + (home ? '' : section(t, page, data)) +
    word(BACK, t.href('home'), { cls: 'back', data: 'data-back' }) + '</main>\n' +
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><filter id="rough" x="-8%" y="-30%" width="116%" height="160%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="1" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.7" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg>\n' +
    (t.test || '') +
    '</div>\n' + (t.tail || '') + '</body>\n</html>\n';
}
