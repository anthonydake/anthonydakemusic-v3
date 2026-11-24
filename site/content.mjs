/* THE WORDS AND THE LISTS (site/content.mjs).
   Everything the site says and every list it shows is in this one file: fill a gap here and every page, on the server and in the browser, picks it up.
   The same file runs on the server (lib/site/render.ts) and is packed into the browser's script (site/build.mjs), so write plain data only: no imports, no code that needs Node.

   RULES THAT COME WITH THE WORDS (Anthony's, Nov 2026):
   - Site copy is his. Do not write lines for him. A blank stays a blank until he fills it.
   - A client text is the client's real words, never reworded, and is never shown twice on the site.
   - Titles and artists are spelled the way each release spells them. */

export const SITE = {
  name: 'Anthony Dake',
  moniker: 'Architect of Sound',
  origin: 'https://www.anthonydakemusic.com',
  email: 'adakemusic@gmail.com',
  place: 'Columbus, OH'
};

/* Each page: where it lives, what the browser tab and a search result say, and which way the flight leans on the way to it (side).
   The description lines are for search results and link previews only; they are put together from his own phrases. */
export const PAGES = {
  home: { path: '/', title: 'Anthony Dake · Architect of Sound', description: 'Anthony Dake, Architect of Sound. Music production in Columbus, OH: production, vocals, mix, and master.' },
  production: { path: '/production', label: 'Production', title: 'Production · Anthony Dake', description: 'A Full Build with Anthony Dake: production, vocals, mix, and master. Recent releases, and the form to book.', side: -1 },
  about: { path: '/about', label: 'About', title: 'About · Anthony Dake', description: 'Anthony Dake, Architect of Sound, in the words of the artists he has produced.', side: -0.6 },
  'press-kit': { path: '/press-kit', label: 'Press kit', title: 'Press kit · Anthony Dake', description: 'Press kit for Anthony Dake, Architect of Sound.', side: 0.6 },
  products: { path: '/products', label: 'Products', title: 'Products · Anthony Dake', description: 'Downloads from Anthony Dake.', side: 1 },
  order: { path: null, label: 'Your order', title: 'Your order · Anthony Dake', description: '' },
  missing: { path: null, label: 'Not found', title: 'Not found · Anthony Dake', description: '' }
};

/* THE HOME SCREEN. It says these things and no more. */
export const HOME = {
  door: 'Book production →',
  text: 'Anthony! I am DROOLING! I’m obsessed with this… the production changes really take it up and over!',
  credit: 'Artist · via text'
};

/* THE BELT ON THE PRODUCTION PAGE: five, in Anthony's order (24 Nov 2026), not by date. The first leads. A song added later goes where he says.
   key names the cover files in site/img/covers/ (<key>-<width>.jpg); art gives the two widths held. Get Down is only held 400 wide: ask Anthony for the full-size file. */
export const RELEASES = [
  { key: 'get-down', art: [240, 400], title: 'Get Down', artist: 'Jae Esquire', released: '2025-12-10' },
  { key: 'cycles', art: [240, 480], title: 'Cycles', artist: 'BittyOTW, WANYEH, J.Sol', released: '2025-09-26' },
  { key: 'aura', art: [240, 480], title: 'AURA', artist: 'AR!YAH', released: '2025-10-08' },
  { key: 'back-and-forth', art: [240, 480], title: 'Back & Forth', artist: 'Madelyn Leona', released: '2024-05-24' },
  { key: 'pray-for-me', art: [240, 480], title: 'Pray For Me', artist: 'KJ The Cool Nerd', released: '2025-10-31' }
];
export const BELT_LABEL = 'Recent releases';

/* THE OFFER AND THE BOOKING FORM. The page states no price and no time (his decision, 24 Nov 2026). */
export const OFFER = { name: 'A Full Build', what: 'Production, vocals, mix, and master.' };
export const BOOKING = {
  /* what the booking record and the notice email call a request from this form */
  type: 'Production: A Full Build',
  fields: { name: 'Your name', email: 'Email', link: 'Link to your released music', note: 'Note' },
  send: 'Send →',
  sending: 'Sending',
  needed: 'Needed', badEmail: 'Check the address', optional: 'Optional',
  doneHead: 'Sent.', doneLine: 'I will write back with a yes or a no.',
  failed: 'Something went wrong. Try emailing adakemusic@gmail.com directly.'
};

/* THE ABOUT PAGE: one photograph with four texts from artists round it. The page carries no words of Anthony's own yet: he had his two lines deleted on 24 Nov 2026
   and is still to write what replaces them. Do not put lines here for him.
   Each text: the words, the side it stands out on (l or r), which of its own edges is held (foot or top), how far down the photograph that edge sits (0 top, 1 foot), and a few px more.
   The places are the photograph's empty parts: the ceiling at the left, the corner above the man standing, the desk in front. No text lies on a face or a hand. */
export const ABOUT = {
  photo: { name: 'studio', alt: 'Anthony at the mixing desk in a recording session, with artists in the room behind him', w: 1200, h: 1799, widths: [480, 800, 1200, 1600] },
  texts: [
    ['Your song you made pulls on my heart strings every time I hear it!', 'l', 'foot', 0.33, 0],
    ['I swear you told me you didn’t sample lol 🥶🥶🥶', 'r', 'foot', 0.105, 0],
    ['This gave me a bunch of ideas. Reminds me of trying to find the calm in the midst of chaos. Hell yeah bro.', 'l', 'top', 0.845, 0],
    ['one of the tracks you produced for her sounds great! Let’s text early next week and find a time!', 'r', 'top', 0.845, 14]
  ],
  credit: 'Artists · via text'
};

/* THE PRESS KIT: a short bio, in his words. Each string is one paragraph. EMPTY UNTIL HE SENDS IT: the page then shows ruled blanks and the line below. */
export const PRESS_KIT = { bio: [], toCome: 'Bio to come' };

/* THE PRODUCTS PAGE AND THE ORDER PAGE. The products themselves are in data/store.data.ts (the store's own catalog); these are the fixed words round them. */
export const STORE = {
  buy: 'Buy →',
  testMode: 'Test mode. No real charges.',
  failed: 'Checkout did not open, and nothing was charged. Try again in a minute.',
  under: 'Secure checkout by Square. Your download appears right after payment.',
  none: 'Nothing for sale right now.',
  download: 'Download →',
  again: 'Check again →',
  heading: { ready: 'Thank you', pending: 'One moment', stalled: 'Still processing', refunded: 'Order refunded', expired: 'Link expired' },
  line: {
    ready: ' is ready.',
    pending: 'Confirming your payment with Square. This page refreshes on its own.',
    stalled: 'Your payment has not confirmed yet. If you were charged, email me and I will send your file.',
    refunded: 'This order was refunded, so the download is closed.',
    expired: 'This download link has expired. Email me for a fresh one.'
  },
  keep: 'Keep this page. The link works for 30 days.',
  questions: 'Questions?',
  testTag: 'Test mode'
};

export const MISSING = { line: 'This page doesn’t exist.' };
export const BACK = '( ← Back )';
