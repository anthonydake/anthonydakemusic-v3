#!/usr/bin/env node
// A REAL BROWSER THROUGH THE WHOLE SITE: every page at phone, tablet and desk
// sizes, the moves between pages, the booking form, and the store from Buy to
// Download, with scripts on and off, with reduced motion, and without WebGL.
//
//   npm install --no-save @electric-sql/pglite playwright   (once; neither is a project dependency)
//   npx playwright install chromium                          (once, if this machine has no browser for it)
//   node scripts/site-check.mjs            every check
//   node scripts/site-check.mjs store      only the groups named (layout, moves, form, store, plain, calm, nogl, head)
//   SITE_URL=http://localhost:3000 node scripts/site-check.mjs
//                                          the groups that need no database (layout, moves, calm, nogl, head) against a
//                                          server that is already running, e.g. `npm run build && npm run start` with
//                                          SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID set to anything, so the store shows
//
// It runs against scripts/local-site.mjs (the site's real route handlers, a
// mock Square, an in-memory database, emails captured), so it is safe to run
// anywhere. What only the real thing proves is not here: Next's own routing
// (npm run build / start), Square's sandbox, a real phone's toolbars.
process.env.LOCAL_SITE_QUIET = "1";
process.env.PORT = process.env.PORT || "4310";
const only = process.argv.slice(2);
const want = (group) => (only.length === 0 || only.includes(group)) && !(process.env.SITE_URL && ["form", "store", "plain"].includes(group));

let chromium;
try {
  // require, not import: a Playwright installed outside the project (NODE_PATH) is found this way too
  ({ chromium } = (await import("node:module")).createRequire(import.meta.url)("playwright"));
} catch {
  console.error("This check needs Playwright, which is not a project dependency.\nInstall it for this run only:  npm install --no-save playwright");
  process.exit(2);
}
// Against a server someone else started there is no database or mock to look into, so those groups are left out.
const external = (process.env.SITE_URL || "").replace(/\/+$/, "");
const local = external ? { url: external, close() {} } : (await import("./local-site.mjs")).local;
const SITE = local.url;

// ---------------------------------------------------------------- bookkeeping
const results = [];
let group = "";
function check(name, ok, detail) {
  results.push({ group, name, ok: !!ok, detail });
  if (!ok) console.log(`  FAIL  [${group}] ${name}${detail !== undefined ? "  ->  " + (typeof detail === "string" ? detail : JSON.stringify(detail)) : ""}`);
}
const GL = ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"];
const SIZES = {
  phone: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 },
  small: { viewport: { width: 360, height: 640 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 },
  tablet: { viewport: { width: 820, height: 1180 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 },
  laptop: { viewport: { width: 1280, height: 720 } },
  desk: { viewport: { width: 1440, height: 900 } },
  wide: { viewport: { width: 1920, height: 1080 } },
};
const browser = await chromium.launch({ args: GL });
// HIS BIO, exactly as he sent it on 24 Nov 2026 (the press kit page must show these words and no others)
const BIO = [
  "I promise to bring honesty, curiosity, and real care to everything we make together. I\u2019m not here to chase trends or sand the edges off until it sounds like everyone else \u2014 I\u2019m here for what feels true in your music, and that\u2019s what we\u2019ll build around.",
  "Working together is an open experiment. Bold ideas, real constraints, and a lot of trying things until we land on the sound that could only be yours.",
  "I show up, I put the work in, and I don\u2019t settle for my own best \u2014 I keep pushing past it. What I want for you is simple: something real, something memorable, and something that sounds like no one but you.",
];

async function open(size, options = {}) {
  const ctx = await browser.newContext({ ...SIZES[size], colorScheme: "dark", ...options });
  // nothing leaves this machine
  await ctx.route((url) => !url.href.startsWith(SITE + "/"), (r) => r.abort());
  const page = await ctx.newPage();
  page.problems = [];
  page.on("pageerror", (e) => page.problems.push("error: " + String(e)));
  page.on("console", (m) => { if (m.type() === "error" && !/^Failed to load resource/.test(m.text())) page.problems.push("console: " + m.text()); });       // a failed fetch is caught below, by its address
  page.on("response", (r) => { if (r.status() >= 400 && !page.expect?.(r)) page.problems.push(`${r.status()} ${r.url().replace(SITE, "")}`); });
  return { ctx, page };
}
const ready = (page) => page.waitForFunction(() => { const r = document.body.getAttribute("data-ready"); return r === "1" || r === "no-gl"; }, null, { timeout: 60000 });
const at = (page, name) => page.waitForFunction((n) => document.body.getAttribute("data-page") === n && (!window.__home || window.__home.state().mode === (n === "home" ? "home" : "page")), name, { timeout: 30000 });
async function go(page, path) { await page.goto(SITE + path); await ready(page); await page.waitForTimeout(250); }
const path = (page) => new URL(page.url()).pathname;

// ---------------------------------------------------------------- 1 · layout
// Every page at every size: nothing spills sideways, the header's words clear
// the mark, pressable words are finger-sized, and each page's own rules hold.
async function shell(page, label, storeOpen = true) {
  const m = await page.evaluate(() => {
    const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { l: b.left, r: b.right, t: b.top, b: b.bottom, w: b.width, h: b.height }; };
    const dest = document.querySelector("#dest");
    return { W: innerWidth, H: innerHeight, sw: document.documentElement.scrollWidth, dsw: dest.hidden ? 0 : dest.scrollWidth, dcw: dest.clientWidth, h1: document.querySelectorAll("h1").length,
      left: r("#hdr .tx.l"), right: r("#hdr .tx.r"), pin: r("#hdr .pin"), lang: document.documentElement.lang, main: !!document.querySelector("main"),
      mark: (() => { const a = document.querySelector("#hdr .pin"); return { tag: a.tagName, href: a.getAttribute("href"), name: a.getAttribute("aria-label") }; })() };
  });
  check(`${label}: nothing spills sideways`, m.sw <= m.W && m.dsw <= m.dcw + 1, m);
  check(`${label}: one main heading`, m.h1 === 1, m.h1);
  check(`${label}: Book is right of the mark, 44 px tall`, m.right && m.right.l > m.pin.r && m.right.h >= 44 && m.right.r <= m.W, m.right);
  if (storeOpen) check(`${label}: Products is left of the mark, 44 px tall`, m.left && m.left.r < m.pin.l && m.left.h >= 44 && m.left.l >= 0, m.left);
  check(`${label}: the document says its language and has a main part`, m.lang === "en" && m.main);
  check(`${label}: the mark is a link home, 44 px across, with a name`, m.mark.tag === "A" && m.mark.href === "/" && m.pin.w >= 44 && m.pin.h >= 44 && /home/i.test(m.mark.name || ""), m.mark);
}
async function layoutAt(size, scheme) {
  const { ctx, page } = await open(size, { colorScheme: scheme });
  const tag = `${size}/${scheme}`, short = SIZES[size].viewport.height < 600;

  await go(page, "/");
  await page.waitForTimeout(2600);       // the opening plays, the name's letters roll
  await shell(page, `${tag} home`);
  const home = await page.evaluate(() => {
    const r = (s) => { const e = document.querySelector(s); if (!e || getComputedStyle(e).display === "none") return null; const b = e.getBoundingClientRect(); return { l: b.left, r: b.right, t: b.top, b: b.bottom, h: b.height }; };
    return { W: innerWidth, H: innerHeight, name: r("#name"), door: r(".pills .choice"), said: r(".said blockquote"), foot: r(".foot"), mon: r(".mon"), plain: document.querySelector("#name").classList.contains("plain") };
  });
  check(`${tag} home: the name is whole on screen`, home.name && home.name.l >= 0 && home.name.r <= home.W && home.name.t >= 56, home.name);
  check(`${tag} home: the name ends in its blue (the roll has finished)`, home.plain === false);
  check(`${tag} home: name, line and door stand in that order, clear of each other`, home.name.b <= home.mon.t + 12 && home.mon.b <= home.door.t + 4, home);
  check(`${tag} home: the door is at least 46 px tall`, home.door.h >= 46, home.door.h);
  check(`${tag} home: the two links are on screen`, home.foot && home.foot.b <= home.H, home.foot);
  if (home.said) check(`${tag} home: the client text is clear of the door and above the links`, home.said.t >= home.door.b && home.said.b <= home.foot.t, home);

  await go(page, "/production");
  await page.waitForTimeout(900);
  await shell(page, `${tag} production`);
  const prod = await page.evaluate(async () => {
    const belt = document.querySelector(".belt"), real = [...document.querySelectorAll(".belt-item:not([aria-hidden])")], all = [...document.querySelectorAll(".belt-item img")];
    await Promise.all(all.map((i) => (i.decode ? i.decode().catch(() => {}) : null)));
    const seen = () => { const c = {}; for (const im of all) { const b = im.getBoundingClientRect(); if (b.right > 0 && b.left < innerWidth) { const k = im.src.split("/covers/")[1]?.split("-2")[0] || im.src.slice(-40); c[k] = (c[k] || 0) + 1; } } return Math.max(0, ...Object.values(c)); };
    const x0 = window.__cvs.state().belt.x; let twice = seen();
    for (let i = 0; i < 4; i++) { await new Promise((r) => setTimeout(r, 350)); twice = Math.max(twice, seen()); }
    const f = [...document.querySelectorAll("#bk .bk-f input, #bk .bk-f textarea")];
    const links = real.map((li) => li.querySelector("a.belt-a")), d = document.querySelector("#dest"), cols = (() => { const b = [...document.querySelectorAll("#bk .bk-f")].map((e) => e.getBoundingClientRect().top); return b[0] === b[1] ? 2 : 1; })();
    return { covers: real.length, loaded: all.every((i) => i.complete && i.naturalWidth > 0), moved: window.__cvs.state().belt.x - x0, twice, still: belt.classList.contains("still"),
      pictures: all.length, links: links.map((a) => (a ? a.getAttribute("href") : null)), newTab: links.every((a) => a && a.target === "_blank" && a.rel === "noopener"), ghosts: [...document.querySelectorAll(".belt-item[aria-hidden] a")].every((a) => a.tabIndex === -1),
      cursors: [...new Set([belt, links[0], links[0] && links[0].querySelector(".belt-art")].map((e) => (e ? getComputedStyle(e).cursor : "?")))].join(), empty: document.querySelectorAll(".belt-item:not([aria-hidden]) .belt-none").length,
      scroll: d.scrollHeight - d.clientHeight, back: d.querySelector("a.back").getBoundingClientRect().bottom, W: innerWidth, H: innerHeight, cols,
      fields: f.map((e) => e.name), font: Math.min(...f.map((e) => parseFloat(getComputedStyle(e).fontSize))), offer: document.querySelector(".offer-name")?.textContent, label: document.querySelector(".belt-label")?.textContent,
      send: document.querySelector(".bk-send")?.getBoundingClientRect().height, action: document.querySelector("#bk").getAttribute("action"), method: document.querySelector("#bk").method };
  });
  const YT = ["PdBcj7DCSJA", "igaxmP2tTU8", "rygn058o5OM", "6qLMNYQLHkw", "_oLkgRSg-ss", "zqxpGR__WWk", "GLV36D059m4"].map((id) => "https://www.youtube.com/watch?v=" + id);
  check(`${tag} production: seven covers in his order, every one with its picture, all loaded`, prod.covers === 7 && prod.loaded && prod.empty === 0 && prod.pictures === 14, prod);
  check(`${tag} production: each cover is a link to its release on YouTube, in a new tab`, prod.links.join() === YT.join() && prod.newTab && prod.ghosts, prod.links);
  check(`${tag} production: over a cover the pointer stays the plain arrow`, /^(auto,)?default$/.test(prod.cursors), prod.cursors);
  if (prod.W >= 900 && prod.H >= 630) check(`${tag} production: one screen, no scroll, the form two by two, Back on screen`, prod.scroll <= 1 && prod.back <= prod.H + 1 && prod.cols === 2, prod);
  check(`${tag} production: the belt is moving`, prod.moved > 5 && !prod.still, prod.moved);
  check(`${tag} production: no cover is on screen twice`, prod.twice <= 1, prod.twice);
  check(`${tag} production: the form has its four fields, typed at 16 px or more`, prod.fields.join() === "name,email,link,note" && prod.font >= 16, prod);
  check(`${tag} production: the form is a real form to /api/book`, prod.action === "/api/book" && prod.method === "post", prod);
  check(`${tag} production: the offer and the label are there`, prod.offer === "A Full Build" && prod.label === "Recent releases", prod);

  await go(page, "/about");
  await page.waitForFunction(() => document.querySelector(".abt-wall")?.classList.contains("set"), null, { timeout: 15000 });
  await page.waitForTimeout(500);
  await shell(page, `${tag} about`);
  const abt = await page.evaluate(() => {
    const d = document.querySelector("#dest"), pic = document.querySelector(".abt-pic img").getBoundingClientRect(), W = innerWidth;
    const texts = [...document.querySelectorAll(".abt-wall .msg:not(.out)")].map((f) => { const b = f.getBoundingClientRect(); return { l: b.left, r: b.right, t: b.top, b: b.bottom }; });
    let clash = 0; for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) { const a = texts[i], b = texts[j]; if (a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b) clash++; }
    const hold = texts.filter((t) => t.l < pic.right && t.r > pic.left).length, over = texts.map((t) => +(Math.min(t.r, pic.right) - Math.max(t.l, pic.left)).toFixed(1));
    const out = { scroll: d.scrollHeight - d.clientHeight, shown: texts.length, clash, hold, over, inside: texts.every((t) => t.l >= 0 && t.r <= W), pic: { w: pic.width, h: pic.height, t: pic.top, b: pic.bottom }, img: document.querySelector(".abt-pic img").naturalWidth,
      credit: document.querySelector(".abt-c").getBoundingClientRect().bottom, H: innerHeight, W, back: document.querySelector("#dest a.back").getBoundingClientRect().bottom, bio: document.querySelectorAll(".abt-bio").length };
    return out;
  });
  check(`${tag} about: the photograph is loaded`, abt.img > 0 && abt.pic.w > 100, abt.pic);
  check(`${tag} about: ${short ? "two or four" : "four"} texts, none over another, all on screen`, (short ? abt.shown >= 2 : abt.shown === 4) && abt.clash === 0 && abt.inside, abt);
  check(`${tag} about: every text keeps a hold on the photograph`, abt.hold === abt.shown, abt);
  if (abt.W >= 700 && abt.H >= 560) check(`${tag} about: on a wide screen each text lies at least 24 px over the photograph`, abt.over.every((o) => o >= 23.5), abt.over);
  check(`${tag} about: one screen, no scroll, Back on screen; his bio is not on this page`, abt.scroll <= 1 && abt.back <= abt.H + 1 && abt.bio === 0, abt);

  await go(page, "/press-kit");
  await shell(page, `${tag} press kit`);
  const pk = await page.evaluate(() => { const d = document.querySelector("#dest"), ps = [...document.querySelectorAll(".pk-p")]; return { blanks: document.querySelectorAll(".pk-blank span").length, note: document.querySelector(".pk-c")?.textContent || null, paras: ps.map((p) => p.textContent), size: ps.length ? parseFloat(getComputedStyle(ps[0]).fontSize) : 0, scroll: d.scrollHeight - d.clientHeight, back: d.querySelector("a.back").getBoundingClientRect().bottom, H: innerHeight }; });
  check(`${tag} press kit: his bio, word for word, three paragraphs, no blanks`, pk.paras.length === 3 && pk.paras.join("\n") === BIO.join("\n") && pk.blanks === 0 && pk.note === null && pk.size >= 14, pk);
  if (SIZES[size].viewport.width >= 700 && SIZES[size].viewport.height >= 700) check(`${tag} press kit: on a laptop or a tablet the whole bio and Back are on the first screen`, pk.scroll <= 1 && pk.back <= pk.H + 1, pk);

  await go(page, "/products");
  await shell(page, `${tag} products`);
  const pd = await page.evaluate(() => { const f = document.querySelector(".pd-f"), b = document.querySelector(".pd-buy").getBoundingClientRect(); return { title: document.querySelector(".pd-t")?.textContent, price: document.querySelector(".pd-price")?.textContent, action: f.getAttribute("action"), method: f.method, product: f.elements.product.value, buy: b.height, onScreen: b.bottom <= innerHeight, mode: document.querySelector(".pd-mode")?.textContent }; });
  check(`${tag} products: the $1 placeholder with its own Buy, on the first screen`, pd.title === "Test download" && pd.price === "$1" && pd.buy >= 46 && pd.onScreen, pd);
  check(`${tag} products: Buy is a plain form to checkout`, pd.action === "/api/store/checkout" && pd.method === "post" && pd.product === "test-download", pd);
  check(`${tag} products: says it is in test mode`, pd.mode === "Test mode. No real charges.", pd.mode);

  page.expect = (r) => r.status() === 404;
  await go(page, "/no-such-page");
  await shell(page, `${tag} not found`);
  check(`${tag} not found: says so, with a way back`, (await page.textContent(".ms-l")) === "This page doesn’t exist." && (await page.getAttribute("#dest a.back", "href")) === "/");

  check(`${tag}: no errors, nothing failed to load`, page.problems.length === 0, page.problems);
  await ctx.close();
}

// ---------------------------------------------------------------- 2 · moves between pages
async function moves(size) {
  const { ctx, page } = await open(size);
  const tag = `${size} moves`;
  await go(page, "/");
  check(`${tag}: starts at home`, (await page.evaluate(() => window.__home.state().mode)) === "home");
  await page.click(".pills .choice"); await at(page, "production");
  check(`${tag}: the door flies to Production and the address follows`, path(page) === "/production" && (await page.title()) === "Production · Anthony Dake", path(page));
  check(`${tag}: reading starts from the new page`, await page.evaluate(() => document.activeElement === document.querySelector("#dest")));
  await page.click("#dest a.back"); await at(page, "home");
  check(`${tag}: Back flies home`, path(page) === "/" && (await page.title()) === "Anthony Dake · Architect of Sound", path(page));
  // the mark is the home button from every page, and on the home screen it moves nothing
  const hist = await page.evaluate(() => history.length);
  await page.click("#hdr .pin"); await page.waitForTimeout(400);
  check(`${tag}: the mark on the home screen moves nothing`, path(page) === "/" && (await page.evaluate(() => window.__home.state().mode)) === "home" && (await page.evaluate(() => history.length)) === hist);
  await page.click("#hdr .tx.r"); await at(page, "production");
  await page.click("#hdr .pin"); await at(page, "home");
  check(`${tag}: the mark flies home from a page, leaving no pencil cross on itself`, path(page) === "/" && (await page.title()) === "Anthony Dake · Architect of Sound" && (await page.evaluate(() => document.querySelectorAll("#hdr .tick, .pin .tick").length)) === 0, path(page));
  await page.click("#hdr .tx.r"); await at(page, "production");
  // a cover: a press opens its release in a new tab, a pull along the belt moves the belt and opens nothing
  await ctx.route("https://www.youtube.com/**", (r) => r.fulfill({ status: 200, contentType: "text/html", body: "<title>stand-in for YouTube</title>" }));
  await page.waitForTimeout(900);
  const spot = () => page.evaluate(() => { const a = [...document.querySelectorAll(".belt a.belt-a")].map((x) => ({ r: x.querySelector(".belt-art").getBoundingClientRect(), h: x.href })).filter((o) => o.r.left > 30 && o.r.right < innerWidth - 30)[0]; return { x: a.r.left + a.r.width / 2, y: a.r.top + a.r.height / 2, h: a.h }; });
  let s0 = await spot(); const tabs0 = ctx.pages().length;
  if (SIZES[size].hasTouch) {
    const [pop] = await Promise.all([page.waitForEvent("popup"), page.touchscreen.tap(s0.x, s0.y)]); await pop.waitForLoadState().catch(() => {});
    check(`${tag}: a tap on a cover opens its release on YouTube in a new tab`, pop.url() === s0.h && /youtube\.com\/watch\?v=/.test(s0.h) && path(page) === "/production", pop.url()); await pop.close();
  } else {
    await page.mouse.move(s0.x, s0.y); await page.waitForTimeout(120); const bx0 = await page.evaluate(() => window.__cvs.state().belt.x);       // the belt waits under the mouse
    await page.mouse.down(); await page.mouse.move(s0.x + 150, s0.y + 4, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(400);
    check(`${tag}: a pull along the belt moves it and opens nothing`, Math.abs((await page.evaluate(() => window.__cvs.state().belt.x)) - bx0 - 150) < 2 && ctx.pages().length === tabs0, { moved: (await page.evaluate(() => window.__cvs.state().belt.x)) - bx0, tabs: ctx.pages().length - tabs0 });
    s0 = await spot();
    const [pop] = await Promise.all([page.waitForEvent("popup"), page.mouse.click(s0.x, s0.y)]); await pop.waitForLoadState().catch(() => {});
    check(`${tag}: a press on a cover opens its release on YouTube in a new tab`, pop.url() === s0.h && /youtube\.com\/watch\?v=/.test(s0.h) && path(page) === "/production", pop.url()); await pop.close();
  }
  const top = await page.evaluate(() => { const d = document.querySelector("#dest"); d.scrollTop = 40; return d.scrollTop; });
  await page.click("#hdr .tx.r"); await page.waitForTimeout(300);
  check(`${tag}: Book on its own page moves nothing`, path(page) === "/production" && (await page.evaluate(() => document.querySelector("#dest").scrollTop)) === top);
  if (size === "desk") {
    // the keyboard: the belt can be held and stepped, and a page opened by its address scrolls with the usual keys
    await page.focus(".belt"); await page.keyboard.press("ArrowRight");
    const held = await page.evaluate(async () => { const a = window.__cvs.state().belt; await new Promise((r) => setTimeout(r, 500)); const b = window.__cvs.state().belt; return { a: a.x, b: b.x, pitch: a.pitch, moving: b.moving }; });
    check(`${tag}: held with the keyboard, the belt waits`, held.a === held.b && !held.moving && held.pitch > 100, held);
    const x0 = held.b; await page.keyboard.press("ArrowLeft");
    check(`${tag}: an arrow key moves it one cover`, Math.abs((await page.evaluate(() => window.__cvs.state().belt.x)) - (x0 - held.pitch)) < 1);
    // Tab goes on to each cover in his order; the one the keyboard is on is brought into view and the belt waits
    await page.keyboard.press("Tab"); await page.keyboard.press("Tab"); await page.keyboard.press("Tab"); await page.waitForTimeout(500);
    // (a cover stands on the belt twice; the keyboard is on the first, and the mark of it is on both, so the one on screen shows it)
    const tabbed = await page.evaluate(() => { const a = document.activeElement, seen = [...document.querySelectorAll(".belt-item.kb")].map((li) => ({ r: li.querySelector(".belt-art").getBoundingClientRect(), t: li.querySelector(".belt-t").textContent, ring: getComputedStyle(li.querySelector(".belt-art")).outlineStyle })).filter((o) => o.r.left >= 0 && o.r.right <= innerWidth);
      return { title: a.querySelector(".belt-t")?.textContent, tag: a.tagName, marked: document.querySelectorAll(".belt-item.kb").length, seen: seen.map((o) => o.t + ":" + o.ring + ":" + Math.round(o.r.left + o.r.width / 2 - innerWidth / 2)), moving: window.__cvs.state().belt.moving }; });
    check(`${tag}: Tab reaches the covers in his order; the one in hand is at the middle of the screen, marked, and the belt waits`, tabbed.title === "AURA" && tabbed.tag === "A" && tabbed.marked === 2 && tabbed.seen.length >= 1 && tabbed.seen.some((s) => /^AURA:solid:-?[01]$/.test(s)) && !tabbed.moving, tabbed);
    await page.setViewportSize({ width: 880, height: 620 }); await page.goto(SITE + "/production"); await ready(page); await page.waitForTimeout(300);       // narrower than 900 px the form is one column and the page is longer than this window
    await page.keyboard.press("PageDown");
    check(`${tag}: a page opened by its address scrolls with the keyboard`, (await page.evaluate(() => document.querySelector("#dest").scrollTop)) > 100);
    // the browser bringing something into view (Tab to the last field, find in page) must never slide the header off
    const held2 = await page.evaluate(async () => { document.querySelector(".bk-send").scrollIntoView({ block: "center" }); document.querySelector("#dest a.back").focus(); await new Promise((r) => setTimeout(r, 200)); return { stage: document.querySelector("#stage").scrollTop, top: document.querySelector("#hdr").getBoundingClientRect().top, win: scrollY, left: document.querySelector("#dest").scrollLeft }; });
    check(`${tag}: bringing the foot of a page into view leaves the header where it is`, held2.stage === 0 && held2.top === 0 && held2.win === 0 && held2.left === 0, held2);
    await page.setViewportSize(SIZES.desk.viewport); await page.goto(SITE + "/"); await ready(page); await page.click("#hdr .tx.r"); await at(page, "production");
  }
  await page.click("#hdr .tx.l"); await at(page, "products");
  check(`${tag}: Products turns straight to its page`, path(page) === "/products" && (await page.isVisible(".pd-buy")), path(page));
  await page.click("#dest a.back"); await at(page, "home");
  check(`${tag}: Back from there is home`, path(page) === "/");
  await page.goForward(); await at(page, "products");
  check(`${tag}: the browser's Forward returns to the page`, path(page) === "/products");
  await page.goBack(); await at(page, "home");
  check(`${tag}: the browser's Back is home again`, path(page) === "/");
  for (const [sel, name, where] of [['.foot a[data-go="about"]', "about", "/about"], ['.foot a[data-go="press-kit"]', "press-kit", "/press-kit"]]) {
    await page.click(sel); await at(page, name);
    check(`${tag}: the ${name} link flies there`, path(page) === where, path(page));
    await page.click("#dest a.back"); await at(page, "home");
  }
  // straight to a page by its address, then Back
  await go(page, "/about"); await at(page, "about");
  if (!SIZES[size].hasTouch) {
    // the texts lean against the mouse, as the photographs on the reference's home screen do, and settle again with the mouse at the middle of the window
    await page.waitForFunction(() => document.querySelector(".abt-wall")?.classList.contains("set"), null, { timeout: 15000 });
    const { width: W, height: H } = SIZES[size].viewport, lefts = () => page.evaluate(() => [...document.querySelectorAll(".abt-wall .msg")].map((f) => f.getBoundingClientRect().left));
    const rest = await lefts();
    await page.mouse.move(W / 2, H / 2); await page.mouse.move(W - 1, H / 2, { steps: 5 }); await page.waitForTimeout(1900);
    const lean = await page.evaluate(() => { const pic = document.querySelector(".abt-pic img").getBoundingClientRect(); return { n: window.__abt.state().lean, t: [...document.querySelectorAll(".abt-wall .msg")].map((f) => f.getBoundingClientRect()).map((b) => ({ l: b.left, hold: b.left < pic.right && b.right > pic.left })) }; });
    check(`${tag}: on About the texts lean against the mouse (at the right edge, up to 30 px to the left), each still on the photograph`, Math.abs(lean.n[0] + 5) < .1 && lean.t.every((b, i) => { const d = b.l - rest[i]; return d < -7 && d > -31 && b.hold; }), { n: lean.n, moved: lean.t.map((b, i) => +(b.l - rest[i]).toFixed(1)) });
    await page.mouse.move(1, H / 2, { steps: 5 }); await page.waitForTimeout(1900);
    const other = await page.evaluate(() => { const pic = document.querySelector(".abt-pic img").getBoundingClientRect(); return [...document.querySelectorAll(".abt-wall .msg")].map((f) => f.getBoundingClientRect()).map((b) => Math.round(Math.min(b.right, pic.right) - Math.max(b.left, pic.left))); });
    check(`${tag}: and at the left edge the same the other way: no text is carried off the photograph (8 px of each always stay on it)`, other.every((o) => o >= 8), other);
    await page.mouse.move(W / 2, H / 2, { steps: 5 }); await page.waitForTimeout(1900);
    const back = await lefts();
    check(`${tag}: with the mouse at the middle of the window they are back in their places`, back.every((l, i) => Math.abs(l - rest[i]) < .6), back.map((l, i) => +(l - rest[i]).toFixed(2)));
  }
  await page.click("#dest a.back"); await at(page, "home");
  check(`${tag}: Back on a page opened by its address flies home`, path(page) === "/");
  await page.goBack(); await at(page, "about");
  check(`${tag}: and the browser's Back returns to that page`, path(page) === "/about");
  // a new tab is the visitor's choice
  await go(page, "/");
  const href = await page.getAttribute(".pills .choice", "href");
  check(`${tag}: the door is a real link`, href === "/production", href);
  check(`${tag}: no errors`, page.problems.length === 0, page.problems);
  await ctx.close();
}

// ---------------------------------------------------------------- 3 · the booking form
// The site makes this table itself on the first request; the checks count its rows before that, so it is made here the same way.
const bookingsTable = () => local.sql`CREATE TABLE IF NOT EXISTS bookings (id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, service TEXT, description TEXT, timeline TEXT, music_link TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`;
async function form() {
  const { ctx, page } = await open("desk");
  const tag = "form";
  await bookingsTable();
  const count = async () => Number((await local.sql`SELECT count(*)::int AS n FROM bookings;`).rows[0].n);
  const before = await count(), mails = local.emails.length;
  await go(page, "/production");
  await page.click(".bk-send");
  const empty = await page.evaluate(() => ({ marks: [...document.querySelectorAll("#bk .bk-e.on")].map((e) => e.textContent), focus: document.activeElement?.name, done: !document.querySelector("#bkdone").hidden }));
  check(`${tag}: sent empty, it names the two needed fields and puts the cursor in the first`, empty.marks.join() === "Needed,Needed" && empty.focus === "name" && !empty.done, empty);
  await page.fill("#bk [name=name]", "Check Runner"); await page.fill("#bk [name=email]", "not-an-address"); await page.click(".bk-send");
  check(`${tag}: a bad address is asked for again`, (await page.evaluate(() => [...document.querySelectorAll("#bk .bk-e.on")].map((e) => e.textContent).join())) === "Check the address");
  check(`${tag}: nothing was kept yet`, (await count()) === before);
  await page.fill("#bk [name=email]", "Runner@Example.com"); await page.fill("#bk [name=link]", "https://example.com/song"); await page.fill("#bk [name=note]", "Two songs.\nSecond line.");
  await page.click(".bk-send");
  await page.waitForFunction(() => !document.querySelector("#bkdone").hidden, null, { timeout: 15000 });
  check(`${tag}: sent, the form gives way to "Sent."`, (await page.textContent("#bkdone h2")) === "Sent." && (await page.isHidden("#bk")));
  const row = (await local.sql`SELECT * FROM bookings ORDER BY id DESC LIMIT 1;`).rows[0];
  check(`${tag}: the request is kept, with the link and the note`, (await count()) === before + 1 && row.name === "Check Runner" && row.email === "runner@example.com" && row.music_link === "https://example.com/song" && row.message === "Two songs.\nSecond line." && row.event_type === "Production: A Full Build", row);
  await page.waitForTimeout(300);
  const mail = local.emails[local.emails.length - 1];
  check(`${tag}: Anthony is emailed, and a reply goes to the artist`, local.emails.length === mails + 1 && mail.reply_to === "runner@example.com" && mail.text.includes("https://example.com/song") && mail.subject.includes("Check Runner"), mail);
  // the page opened again is a fresh form
  await page.click("#dest a.back"); await at(page, "home"); await page.click("#hdr .tx.r"); await at(page, "production");
  check(`${tag}: opened again, the form is fresh`, (await page.isVisible("#bk")) && (await page.inputValue("#bk [name=name]")) === "");
  // the server says no
  page.expect = (r) => r.status() === 500;
  await page.route("**/api/book", (r) => r.fulfill({ status: 500, contentType: "application/json", body: '{"error":"Server error."}' }));
  await page.fill("#bk [name=name]", "A"); await page.fill("#bk [name=email]", "a@b.co"); await page.click(".bk-send");
  await page.waitForFunction(() => !document.querySelector(".bk-fail").hidden, null, { timeout: 15000 });
  check(`${tag}: when it does not go, the form stays and says so with the address to write to`, (await page.isVisible("#bk")) && (await page.textContent(".bk-fail")).includes("adakemusic@gmail.com") && !(await page.evaluate(() => document.querySelector("#bk").classList.contains("busy"))));
  await page.unroute("**/api/book");
  // the API on its own
  const post = (body, headers = {}) => fetch(SITE + "/api/book", { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body), redirect: "manual" });
  const n1 = await count();
  let r = await post({ name: "Bot", email: "bot@example.com", website: "http://spam" });
  check(`${tag}: a script that fills the hidden field is told all went well and nothing is kept`, r.status === 200 && (await count()) === n1);
  r = await post({ name: "X", email: "x@example.com" }, { Origin: "https://elsewhere.example" });
  check(`${tag}: a post from another site is refused`, r.status === 403 && (await count()) === n1);
  r = await post({ name: "", email: "x@example.com" });
  check(`${tag}: no name, no entry`, r.status === 400 && (await count()) === n1);
  r = await post({ name: "Y".repeat(5000), email: "y@example.com", note: "n".repeat(20000) });
  const long = (await local.sql`SELECT * FROM bookings ORDER BY id DESC LIMIT 1;`).rows[0];
  check(`${tag}: an over-long entry is cut to size, not refused`, r.status === 200 && long.name.length === 200 && long.message.length === 5000, { name: long.name.length, note: long.message.length });
  r = await post({ name: "Line\nBreak", email: "lb@example.com" });
  check(`${tag}: a line break in a name never reaches an email's subject`, r.status === 200 && (await local.sql`SELECT name FROM bookings ORDER BY id DESC LIMIT 1;`).rows[0].name === "Line Break");
  // the list of requests and its login are gone from the site (Anthony, 24 Nov 2026): nothing answers at their addresses, with or without the old cookie
  const gone = await Promise.all([fetch(SITE + "/api/bookings/list"), fetch(SITE + "/api/bookings/list", { headers: { Cookie: "archive_admin=1" } }), fetch(SITE + "/admin/bookings"), fetch(SITE + "/admin/archive")]);
  const login = await fetch(SITE + "/api/bookings/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: "anything" }) });
  check(`${tag}: no bookings list and no login at the old addresses`, gone.every((r) => r.status === 404) && login.status >= 404 && login.status <= 405 && !(login.headers.get("set-cookie") || ""), gone.map((r) => r.status).concat(login.status));
  check(`${tag}: no errors`, page.problems.length === 0, page.problems);
  await ctx.close();
}

// ---------------------------------------------------------------- 4 · the store, Buy to Download
async function store(size) {
  const { ctx, page } = await open(size);
  const tag = `${size} store`;
  const ORDER = /\/products\/thanks\/([0-9a-f-]{36})/;
  const mails = local.emails.length;

  // pay, come back, download
  await go(page, "/products");
  await Promise.all([page.waitForURL(/\/__square\//), page.click(".pd-buy")]);
  check(`${tag}: Buy opens the checkout page`, /\/__square\/LOCALORDER/.test(page.url()), page.url());
  await Promise.all([page.waitForURL(ORDER), page.click("#pay")]);
  await ready(page);
  const id = page.url().match(ORDER)[1];
  const ok = await page.evaluate(() => ({ state: document.querySelector(".od").dataset.state, head: document.querySelector(".od-h").textContent, line: document.querySelector(".od-l").textContent, dl: document.querySelector(".od-dl")?.getAttribute("href"), keep: document.querySelector(".od-c")?.textContent,
    refresh: !!document.querySelector('meta[http-equiv="refresh"]'), robots: document.querySelector('meta[name="robots"]')?.content, referrer: document.querySelector('meta[name="referrer"]')?.content, test: document.querySelector(".od-q").textContent, analytics: !!document.querySelector('script[src*="insights"]') }));
  check(`${tag}: paid, the order page says thank you and offers the download`, ok.state === "ready" && ok.head === "Thank you" && ok.line === "Test download is ready." && /^\/api\/store\/download\?token=/.test(ok.dl || "") && ok.keep === "Keep this page. The link works for 30 days.", ok);
  check(`${tag}: the order page is private (not indexed, no referrer, no refresh once paid, no analytics)`, ok.robots === "noindex, nofollow" && ok.referrer === "no-referrer" && !ok.refresh && !ok.analytics, ok);
  const res = await page.request.get(SITE + ok.dl);
  const file = await res.text();
  check(`${tag}: Download gives the file as an attachment`, res.status() === 200 && /attachment; filename="anthony-dake-test-download.txt"/.test(res.headers()["content-disposition"] || "") && file.includes(id), res.headers()["content-disposition"]);
  await page.waitForTimeout(300);
  const sent = local.emails.slice(mails);
  check(`${tag}: the buyer is emailed a receipt with the order page's address, and Anthony a notice`, sent.some((m) => String(m.to).includes("local-buyer@example.com") && (m.html || "").includes(`${SITE}/products/thanks/${id}`)) && sent.length === 2, sent.map((m) => [m.to, m.subject]));
  // from the order page a header word is the browser's own link, so the page keeps its place in the history
  await Promise.all([page.waitForURL(SITE + "/production"), page.click("#hdr .tx.r")]); await ready(page);
  await page.goBack(); await page.waitForURL(ORDER);
  check(`${tag}: after Book, the browser's Back returns to the order page`, (await page.evaluate(() => document.querySelector(".od")?.dataset.state)) === "ready");

  // leave without paying: the page waits, re-checks on its own, and turns when the payment lands
  await go(page, "/products");
  await Promise.all([page.waitForURL(/\/__square\//), page.click(".pd-buy")]);
  const squareOrder = page.url().split("/__square/")[1];
  await Promise.all([page.waitForURL(ORDER), page.click("#leave")]);
  const id2 = page.url().match(ORDER)[1];
  const wait = await page.evaluate(() => ({ state: document.querySelector(".od").dataset.state, head: document.querySelector(".od-h").textContent, refresh: document.querySelector('meta[http-equiv="refresh"]')?.content, again: document.querySelector(".od-again")?.getAttribute("href"), dl: !!document.querySelector(".od-dl") }));
  check(`${tag}: unpaid, the order page waits and re-checks itself`, wait.state === "pending" && wait.head === "One moment" && wait.refresh === `4;url=/products/thanks/${id2}?n=1` && wait.again === `/products/thanks/${id2}` && !wait.dl, wait);
  let r = await page.request.get(`${SITE}/api/store/download?token=${(await local.sql`SELECT download_token FROM store_orders WHERE id = ${id2};`).rows[0].download_token}`);
  check(`${tag}: no download before payment`, r.status() === 409, r.status());
  local.mock.paid.add(squareOrder);
  await page.waitForFunction(() => document.querySelector(".od")?.dataset.state === "ready", null, { timeout: 20000 });
  check(`${tag}: when the payment lands the page turns to the download on its own`, /\?n=\d+$/.test(page.url()), page.url());

  // the other states
  await go(page, "/products");
  await Promise.all([page.waitForURL(/\/__square\//), page.click(".pd-buy")]);
  await Promise.all([page.waitForURL(ORDER), page.click("#leave")]);
  const id3 = page.url().match(ORDER)[1];
  await page.goto(`${SITE}/products/thanks/${id3}?n=12`);
  check(`${tag}: after twelve tries it stops and says what to do`, (await page.evaluate(() => ({ s: document.querySelector(".od").dataset.state, r: !!document.querySelector('meta[http-equiv="refresh"]'), l: document.querySelector(".od-l").textContent }))).s === "stalled" && !(await page.$('meta[http-equiv="refresh"]')));
  await local.sql`UPDATE store_orders SET status = 'refunded', refunded_at = NOW() WHERE id = ${id};`;
  await page.goto(`${SITE}/products/thanks/${id}`);
  check(`${tag}: a refunded order closes the download`, (await page.evaluate(() => document.querySelector(".od").dataset.state + "|" + !!document.querySelector(".od-dl"))) === "refunded|false");
  r = await page.request.get(SITE + ok.dl);
  check(`${tag}: and its old link is refused`, r.status() === 403, r.status());
  await local.sql`UPDATE store_orders SET paid_at = NOW() - INTERVAL '31 days' WHERE id = ${id2};`;
  await page.goto(`${SITE}/products/thanks/${id2}`);
  check(`${tag}: after 30 days the link is expired`, (await page.evaluate(() => document.querySelector(".od").dataset.state + "|" + document.querySelector(".od-l").textContent)) === "expired|This download link has expired. Email me for a fresh one.");
  page.expect = (res) => res.status() === 404;
  r = await page.goto(`${SITE}/products/thanks/11111111-2222-4333-8444-555555555555`);
  check(`${tag}: an order that does not exist is the site's own Not found`, r.status() === 404 && (await page.textContent(".ms-l")) === "This page doesn’t exist.");

  // Square is down: back at Products, nothing charged
  process.env.LOCAL_SQUARE_DOWN = "1";
  await go(page, "/products");
  await Promise.all([page.waitForURL(/\/products\?error=checkout/), page.click(".pd-buy")]);
  check(`${tag}: if checkout cannot open, the buyer is back at Products and told nothing was charged`, (await page.textContent(".pd-err")) === "Checkout did not open, and nothing was charged. Try again in a minute." && (await page.isVisible(".pd-buy")));
  delete process.env.LOCAL_SQUARE_DOWN;
  check(`${tag}: no errors`, page.problems.length === 0, page.problems);
  await ctx.close();
}

// ---------------------------------------------------------------- 5 · scripts off
async function plain() {
  const { ctx, page } = await open("phone", { javaScriptEnabled: false });
  const tag = "scripts off";
  const ORDER = /\/products\/thanks\/([0-9a-f-]{36})/;
  await page.goto(SITE + "/");
  check(`${tag}: home shows the name, the door and the client text in a ruled bubble`, (await page.isVisible("#name")) && (await page.isVisible(".pills .choice")) && (await page.evaluate(() => getComputedStyle(document.querySelector(".said blockquote")).borderTopWidth)) === "1px");
  await Promise.all([page.waitForURL(SITE + "/production"), page.click(".pills .choice")]);
  check(`${tag}: the door is a link to Production, and the page is whole`, (await page.isVisible("#bk")) && (await page.locator(".belt-item").count()) === 7 && (await page.locator('.belt-item a.belt-a[href^="https://www.youtube.com/watch?v="][target="_blank"]').count()) === 7 && (await page.isVisible(".offer-name")));
  await bookingsTable();
  const n = Number((await local.sql`SELECT count(*)::int AS n FROM bookings;`).rows[0].n);
  await page.fill("#bk [name=name]", "Plain Poster"); await page.fill("#bk [name=email]", "plain@example.com"); await page.fill("#bk [name=note]", "No scripts here.");
  await Promise.all([page.waitForURL(SITE + "/production/sent"), page.click(".bk-send")]);
  const row = (await local.sql`SELECT * FROM bookings ORDER BY id DESC LIMIT 1;`).rows[0];
  check(`${tag}: the form posts as a plain form and lands on "Sent."`, (await page.textContent("#bkdone h2")) === "Sent." && (await page.isHidden("#bk")) && row.name === "Plain Poster" && row.message === "No scripts here." && row.event_type === "Production: A Full Build" && Number((await local.sql`SELECT count(*)::int AS n FROM bookings;`).rows[0].n) === n + 1, row);
  const bad = await fetch(SITE + "/api/book", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "name=&email=nope", redirect: "manual" });
  check(`${tag}: a plain form that cannot be taken is sent to the page that says so`, bad.status === 303 && bad.headers.get("location") === SITE + "/production/not-sent", bad.headers.get("location"));
  await page.goto(SITE + "/production/not-sent");
  check(`${tag}: and that page shows the form again with the address to write to`, (await page.isVisible("#bk")) && (await page.isVisible(".bk-fail")));
  await page.goto(SITE + "/about");
  check(`${tag}: About shows the photograph and all four texts`, (await page.isVisible(".abt-pic img")) && (await page.locator(".abt-wall .msg").count()) === 4 && (await page.evaluate(() => [...document.querySelectorAll(".abt-wall .msg")].every((m) => m.getBoundingClientRect().height > 20 && getComputedStyle(m).position === "static"))) && (await page.locator(".abt-bio").count()) === 0);
  await page.goto(SITE + "/press-kit");
  check(`${tag}: the press kit shows his bio`, (await page.locator(".pk-p").count()) === 3 && (await page.isVisible(".pk-p")) && (await page.textContent(".pk-p")) === BIO[0]);
  await page.goto(SITE + "/about");
  await Promise.all([page.waitForURL(SITE + "/"), page.click("#hdr .pin")]);
  check(`${tag}: the mark is a link home`, (await page.isVisible("#name")));
  await page.goto(SITE + "/products");
  await Promise.all([page.waitForURL(/\/__square\//), page.click(".pd-buy")]);
  await Promise.all([page.waitForURL(ORDER), page.click("#pay")]);
  const dl = await page.getAttribute(".od-dl", "href");
  const res = await page.request.get(SITE + dl);
  check(`${tag}: Buy to Download works end to end`, (await page.textContent(".od-h")) === "Thank you" && res.status() === 200);
  await Promise.all([page.waitForURL(SITE + "/"), page.click("#dest a.back")]);
  check(`${tag}: Back is a link home`, (await page.isVisible("#name")));
  await ctx.close();
}

// ---------------------------------------------------------------- 6 · reduced motion
async function calm() {
  const { ctx, page } = await open("desk", { reducedMotion: "reduce" });
  const tag = "reduced motion";
  await go(page, "/");
  // timed inside the page, from the press to the page being there
  const took = await page.evaluate(() => new Promise((done) => { const t0 = performance.now(); new MutationObserver(() => { if (document.body.getAttribute("data-page") === "production") done(performance.now() - t0); }).observe(document.body, { attributes: true }); document.querySelector(".pills .choice").click(); }));
  await at(page, "production");
  const belt = await page.evaluate(async () => { const x = document.querySelector(".belt-track").getBoundingClientRect().left; await new Promise((r) => setTimeout(r, 600)); return { still: document.querySelector(".belt").classList.contains("still"), moved: document.querySelector(".belt-track").getBoundingClientRect().left - x, items: document.querySelectorAll(".belt-item").length }; });
  check(`${tag}: no flight, the page is there at once`, took < 100, took);
  check(`${tag}: the belt stands still as one row of seven`, belt.still && belt.moved === 0 && belt.items === 7, belt);
  await page.goto(SITE + "/about"); await ready(page); await page.waitForFunction(() => document.querySelector(".abt-wall")?.classList.contains("set"), null, { timeout: 15000 });
  await page.mouse.move(40, 40); await page.mouse.move(1300, 700, { steps: 4 }); await page.waitForTimeout(700);
  check(`${tag}: the texts on About do not lean to the mouse`, (await page.evaluate(() => window.__abt.state().lean.join())) === "0,0,0,0");
  check(`${tag}: no errors`, page.problems.length === 0, page.problems);
  await ctx.close();
}

// ---------------------------------------------------------------- 7 · no WebGL
async function nogl() {
  const b = await chromium.launch({ args: ["--disable-gpu", "--disable-3d-apis"] });
  const ctx = await b.newContext({ ...SIZES.desk, colorScheme: "dark" });
  await ctx.route((url) => !url.href.startsWith(SITE + "/"), (r) => r.abort());
  const page = await ctx.newPage(); const problems = []; page.on("pageerror", (e) => problems.push(String(e)));
  const tag = "no WebGL";
  await page.goto(SITE + "/"); await ready(page);
  const home = await page.evaluate(() => ({ ready: document.body.getAttribute("data-ready"), bubble: getComputedStyle(document.querySelector(".said blockquote")).borderTopWidth, mark: getComputedStyle(document.querySelector(".pin")).backgroundImage !== "none", name: getComputedStyle(document.querySelector("#name")).backgroundImage !== "none" }));
  check(`${tag}: the home screen stands without the drawing (ruled bubble, the mark as a picture, the name in its blue)`, home.ready === "no-gl" && home.bubble === "1px" && home.mark && home.name, home);
  await Promise.all([page.waitForURL(SITE + "/production"), page.click(".pills .choice")]); await ready(page);
  await page.waitForTimeout(700);
  const prod = await page.evaluate(() => ({ belt: !!window.__cvs && window.__cvs.state().belt.period > 0, form: !!document.querySelector("#bk") }));
  check(`${tag}: the door still leads to Production, with its belt and form alive`, prod.belt && prod.form, prod);
  await page.click(".bk-send");
  check(`${tag}: the form still checks itself`, (await page.evaluate(() => document.querySelectorAll("#bk .bk-e.on").length)) === 2);
  check(`${tag}: no errors`, problems.length === 0, problems);
  await b.close();
}

// ---------------------------------------------------------------- 8 · what each document says about itself
async function head() {
  const tag = "head";
  const get = async (p) => { const r = await fetch(SITE + p, { redirect: "manual" }); return { status: r.status, html: await r.text(), headers: r.headers }; };
  const meta = (html, name) => (html.match(new RegExp(`<meta (?:name|property)="${name}" content="([^"]*)"`)) || [])[1];
  for (const [p, title, indexed] of [["/", "Anthony Dake · Architect of Sound", true], ["/production", "Production · Anthony Dake", true], ["/about", "About · Anthony Dake", true], ["/press-kit", "Press kit · Anthony Dake", true], ["/products", "Products · Anthony Dake", false], ["/production/sent", "Production · Anthony Dake", false]]) {
    const d = await get(p), t = (d.html.match(/<title>([^<]*)<\/title>/) || [])[1];
    check(`${tag} ${p}: title`, t === title, t);
    check(`${tag} ${p}: ${indexed ? "listed for search, with its own address and a description" : "kept out of search"}`, indexed ? !meta(d.html, "robots") && d.html.includes(`<link rel="canonical" href="https://www.anthonydakemusic.com${p === "/" ? "/" : p}">`) && (meta(d.html, "description") || "").length > 20 : meta(d.html, "robots") === "noindex, nofollow", meta(d.html, "robots"));
    check(`${tag} ${p}: a card for link previews`, meta(d.html, "og:image") === "https://www.anthonydakemusic.com/og-image.jpg" && meta(d.html, "og:title") && meta(d.html, "twitter:card") === "summary_large_image");
    check(`${tag} ${p}: safe headers`, d.headers.get("x-content-type-options") === "nosniff" && (d.headers.get("content-security-policy") || "").includes("frame-ancestors 'none'"), [...d.headers]);
    check(`${tag} ${p}: the header comes first in the document`, d.html.indexOf('<header id="hdr">') < d.html.indexOf('<div id="first">'));
  }
  const home = await get("/");
  let ld = null; try { ld = JSON.parse((home.html.match(/<script type="application\/ld\+json">(.*?)<\/script>/) || [])[1]); } catch { ld = null; }
  check(`${tag}: the home document carries who the site is about, as data`, ld && ld["@graph"][0].name === "Anthony Dake" && ld["@graph"][0].alternateName === "Architect of Sound", ld);
  const note = JSON.parse((home.html.match(/window\.__AD=(.*?);<\/script>/) || [])[1]);
  check(`${tag}: the document's note to the script lists what is for sale`, note.mode === "site" && note.products.length === 1 && note.products[0].id === "test-download" && note.sandbox === true && !("downloadName" in note.products[0]), note);
  const txt = await get("/llms.txt");
  check(`${tag}: /llms.txt is made from the page's own words`, txt.status === 200 && txt.html.includes("# Anthony Dake") && txt.html.includes("Production, vocals, mix, and master.") && txt.html.includes("Get Down, Jae Esquire"));
  const nf = await get("/definitely/not/here");
  check(`${tag}: an unknown address is a 404 with the site's page`, nf.status === 404 && nf.html.includes("This page doesn’t exist."));
}

// ---------------------------------------------------------------- run
try {
  if (want("layout")) { group = "layout"; for (const [size, scheme] of [["phone", "dark"], ["phone", "light"], ["small", "dark"], ["tablet", "dark"], ["laptop", "dark"], ["desk", "dark"], ["desk", "light"], ["wide", "dark"]]) await layoutAt(size, scheme); }
  if (want("moves")) { group = "moves"; await moves("desk"); await moves("phone"); }
  if (want("form")) { group = "form"; await form(); }
  if (want("store")) { group = "store"; await store("desk"); await store("phone"); }
  if (want("plain")) { group = "plain"; await plain(); }
  if (want("calm")) { group = "calm"; await calm(); }
  if (want("nogl")) { group = "nogl"; await nogl(); }
  if (want("head")) { group = "head"; await head(); }
} catch (err) {
  check("the run itself", false, String(err && err.stack ? err.stack : err));
}
await browser.close();
local.close();
const failed = results.filter((r) => !r.ok);
const groups = [...new Set(results.map((r) => r.group))];
console.log("\n" + groups.map((g) => `${g}: ${results.filter((r) => r.group === g && r.ok).length}/${results.filter((r) => r.group === g).length}`).join("   "));
console.log(failed.length ? `\n${failed.length} of ${results.length} checks FAILED` : `\nAll ${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
