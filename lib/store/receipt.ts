// The buyer's email: a receipt with the download button on it. Pure — no
// network, no database, no environment — so the self-test can build one and
// read it.
//
// This is receipt design v3, Anthony's own template, wired to real order
// data: the chalk mark, then a framed card with the home page's drawing
// across its top and faint behind the whole receipt, and a sign-off that
// sets his name large. The layout tables, inline styles and style blocks
// are his file as delivered — change the design there first, not here.
//
// Type is the home-screen redesign's two-face rule, not the one-family rule
// the live site still uses: Gill Sans capitals for the name of a thing and
// anything you press, one serif for anything you read.
//
// What real mail apps do with it:
// - Images. Five PNGs, loaded from a public https address (`assetBase`). A
//   mail app that cannot draw a background (Outlook on Windows, the Gmail app
//   signed in to a non-Google account) shows the top drawing on the plain
//   ground and nothing else changes. That fallback is intended.
// - Fonts. No web font ever loads in Gmail or Outlook, so there the serif is
//   the next installed face in the list (Iowan Old Style on Apple devices)
//   and Gill Sans shows wherever it is installed. Apple Mail loads Instrument
//   Serif from the Google Fonts link.
// - Dark. Only a mail app that honours prefers-color-scheme (Apple Mail)
//   gets the black version. The PNGs are see-through on purpose, so an app
//   that forces its own dark colours still leaves the text readable.
// - The style blocks are separate on purpose: a mail app that rejects one
//   rule can drop the whole block it sits in.

const CAPS =
  "'Gill Sans Nova','Gill Sans','Gill Sans MT',Cabin,'Trebuchet MS',Arial,sans-serif";
const SERIF =
  "'Instrument Serif','Iowan Old Style','Palatino Linotype',Palatino,'Times New Roman',Times,serif";

const INK = "#181611";
const SUB = "#49453c";
const GROUND = "#f7f6f2";
const SITE = "https://www.anthonydakemusic.com";

/** Capitals: names of things, and the one thing you press. */
const caps = (size: number, line: number, weight: number, track: number, color: string) =>
  `font-family:${CAPS};font-size:${size}px;line-height:${line}px;font-weight:${weight};letter-spacing:${track}px;text-transform:uppercase;color:${color};mso-line-height-rule:exactly;`;
/** The serif: anything you read. */
const serif = (size: number, line: number, color: string) =>
  `font-family:${SERIF};font-size:${size}px;line-height:${line}px;font-weight:400;color:${color};mso-line-height-rule:exactly;`;

const TABLE = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">`;

export type ReceiptInput = {
  to: string;
  productTitle: string;
  /** The order page. The download lives there, so the email never carries the file. */
  pageUrl: string;
  /** The product's price. */
  itemCents: number;
  /** What Square says was paid. */
  paidCents: number;
  currency: string;
  paidAt: Date;
  downloadDays: number;
  /** Square's receipt number, the same one its own receipt shows. Left out when missing. */
  receiptNumber?: string | null;
  /** For example "Visa ending 4242". Left out when the payment does not say. */
  paidWith?: string | null;
  /** Sandbox order: no real money moved, and the email says so. */
  test: boolean;
  /**
   * Public https folder holding the receipt's five images, no trailing slash.
   * See receiptAssetBase() in config.ts.
   */
  assetBase: string;
};

export type ReceiptEmail = {
  subject: string;
  html: string;
  text: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Receipt money always shows cents: "$1.00", never "$1". */
export function formatReceiptMoney(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

/** The day it was paid, on Columbus time — the server's clock is UTC. */
export function formatReceiptDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/** A hairline, with the air above it. */
const rule = (above: number) =>
  `<tr><td style="padding:${above}px 0 0;">${TABLE}<tr><td class="hr" height="1" style="height:1px;border-top:1px solid #d3d1cb;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>`;

/**
 * Receipt number, paid with, sent to. Each is its own table, so a short name
 * leaves its value the whole line. `valueHtml` is already escaped.
 */
const detailRow = (label: string, valueHtml: string) =>
  `${TABLE}<tr>` +
  `<td class="caps sub" align="left" valign="top" style="padding:5px 16px 5px 0;white-space:nowrap;${caps(12, 24, 400, 2.4, SUB)}">${escapeHtml(label)}</td>` +
  `<td class="serif ink" align="right" valign="top" style="padding:5px 0;word-break:break-word;overflow-wrap:anywhere;${serif(20, 24, INK)}">${valueHtml}</td>` +
  `</tr></table>`;

/**
 * A line of the money table. A price never wraps; a product title may, so
 * only the item's name is left free to break.
 */
const moneyRow = (label: string, amount: string, kind: "item" | "total" | "paid") => {
  const labelStyle =
    kind === "item"
      ? `padding:5px 16px 5px 0;${caps(12, 24, 600, 2.4, INK)}`
      : kind === "total"
        ? `padding:5px 16px 5px 0;white-space:nowrap;${caps(12, 24, 400, 2.4, SUB)}`
        : `padding:5px 16px 5px 0;white-space:nowrap;${caps(12, 24, 700, 2.4, INK)}`;
  return (
    `<tr><td class="caps ${kind === "total" ? "sub" : "ink"}" align="left" valign="top" style="${labelStyle}">${escapeHtml(label)}</td>` +
    `<td class="serif ink" align="right" valign="top" style="padding:5px 0;white-space:nowrap;${serif(20, 24, INK)}">${escapeHtml(amount)}</td></tr>`
  );
};

/**
 * "Anthony Dake" as on the home page: blue running to ink. Mail apps cannot
 * paint a gradient through text, so each letter carries its own colour, and a
 * class so the dark rules can swap the run for its light-on-black twin.
 */
const NAME_LETTERS: Array<[string, string, string] | null> = [
  ["n0", "#1e50d9", "A"],
  ["n1", "#1f53dc", "n"],
  ["n2", "#2056df", "t"],
  ["n3", "#2159e2", "h"],
  ["n4", "#225ce5", "o"],
  ["n5", "#2460e8", "n"],
  ["n6", "#2563eb", "y"],
  null,
  ["n8", "#20489e", "D"],
  ["n9", "#1e3a76", "a"],
  ["n10", "#1c2b4e", "k"],
  ["n11", "#191d25", "e"],
];
const NAME = NAME_LETTERS.map((l) =>
  l ? `<span class="${l[0]}" style="color:${l[1]};">${l[2]}</span>` : " "
).join("");

function head(assetBase: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta http-equiv="x-ua-compatible" content="ie=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no,date=no,address=no,email=no,url=no">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>Receipt from Anthony Dake</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cabin:wght@400;600;700&amp;family=Instrument+Serif&amp;display=swap" rel="stylesheet">
<style>
body{margin:0;padding:0;width:100%!important;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
table{mso-table-lspace:0;mso-table-rspace:0}
img{border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic}
a{text-decoration:none}
a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font:inherit!important}
u + #body a{color:inherit;text-decoration:none}
#MessageViewBody a{color:inherit;text-decoration:none}
</style>
<style>
@media (max-width:480px){
.outer{padding:16px 8px 24px!important}
.pad{padding-left:20px!important;padding-right:20px!important;padding-bottom:32px!important}
.amt{font-size:52px!important;line-height:52px!important}
}
@media (max-width:359px){
.amt{font-size:44px!important;line-height:44px!important}
.rf{letter-spacing:2.4px!important;padding-left:2.4px!important}
}
@media (min-width:481px){
.amt{font-size:64px!important;line-height:64px!important}
}
</style>
<style>
:root{color-scheme:light dark;supported-color-schemes:light dark}
@media (prefers-color-scheme:dark){
.bg{background-color:#000000!important}
.ink{color:#f2f2f2!important}
.sub{color:#9a9a9a!important}
.f1{border-color:#555555!important}
.f2{border-color:#262626!important}
.hr{border-top-color:#2b2b2b!important}
.btn{background-color:#f2f2f2!important}
.btn a{color:#000000!important}
.lt{display:none!important}
.dk{display:block!important;max-height:none!important;overflow:visible!important}
.n0{color:#4187f7!important}.n1{color:#4e91f8!important}.n2{color:#5a9bf9!important}.n3{color:#67a6fb!important}.n4{color:#74b0fc!important}.n5{color:#80bafe!important}.n6{color:#8dc4ff!important}.n8{color:#b6d9ff!important}.n9{color:#cbe4ff!important}.n10{color:#e0efff!important}.n11{color:#f5faff!important}
}
</style>
<style>
@media (prefers-color-scheme:dark){
.bgd{background-image:url("${assetBase}/receipt-bg-dark.png")!important}
}
</style>
<!--[if mso]><style>.caps{font-family:'Gill Sans MT',Arial,sans-serif!important}.serif{font-family:'Palatino Linotype',Georgia,serif!important}</style><![endif]-->
</head>`;
}

export function buildReceiptEmail(input: ReceiptInput): ReceiptEmail {
  const paid = formatReceiptMoney(input.paidCents, input.currency);
  const item = formatReceiptMoney(input.itemCents, input.currency);
  const date = formatReceiptDate(input.paidAt);
  const window = `The link works for ${input.downloadDays} days.`;
  const testLine = "Sandbox test order. No money moved.";
  // What an inbox shows beside the subject.
  const preview = `Your download is ready. ${window}`;
  const base = input.assetBase.replace(/\/+$/, "");
  const url = escapeHtml(input.pageUrl);

  // Only what Square reported. A missing line is left out, never guessed.
  const details: Array<[string, string]> = [];
  if (input.receiptNumber) details.push(["Receipt number", input.receiptNumber]);
  if (input.paidWith) details.push(["Paid with", input.paidWith]);
  details.push(["Sent to", input.to]);

  // Gmail turns a bare email address into a blue underlined link. Giving the
  // address a link of its own, in the receipt's ink, keeps it looking like text.
  //
  // On a phone a long address has to wrap, and left alone it breaks wherever
  // the line runs out ("name@gmail.co" / "m"). Gmail's fallback serif is wider
  // than Instrument Serif, so there that starts at about 24 characters. Set as
  // two inline blocks, the address breaks after the "@" first.
  const at = input.to.lastIndexOf("@");
  const half = (text: string) => `<span style="display:inline-block;">${escapeHtml(text)}</span>`;
  const shown = at > 0 ? half(input.to.slice(0, at + 1)) + half(input.to.slice(at + 1)) : escapeHtml(input.to);
  const address = `<a class="ink" href="mailto:${escapeHtml(input.to)}" style="color:${INK};text-decoration:none;">${shown}</a>`;
  const detailRows = details
    .map(([label, value]) => detailRow(label, label === "Sent to" ? address : escapeHtml(value)))
    .join("\n");

  const note = (above: number, text: string) =>
    `<tr><td class="serif sub" align="center" style="padding:${above}px 0 0;${serif(18, 24, SUB)}">${text}</td></tr>`;

  const html = `${head(base)}
<body id="body" class="bg" style="margin:0;padding:0;background-color:${GROUND};">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(preview)}</div>
<table role="presentation" class="bg" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${GROUND}" style="background-color:${GROUND};">
<tr><td class="outer" align="center" style="padding:28px 12px 36px;">

<!-- the chalk mark, as it sits at the top of the site -->
<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0 0 16px;">
<a href="${SITE}" target="_blank"><img src="${base}/receipt-mark.png" width="56" height="56" alt="Anthony Dake" style="display:block;width:56px;height:56px;border:0;font-family:${CAPS};font-size:12px;color:${INK};"></a>
</td></tr></table>

<!--[if mso]><table role="presentation" width="560" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<!-- the frame: the site's two thin lines -->
<table role="presentation" class="f1" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;margin:0 auto;border:1px solid #908d87;border-collapse:separate;">
<tr><td style="padding:3px;">
<table role="presentation" class="f2" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #c9c7c2;border-collapse:separate;">
<!-- the home page drawing behind the whole receipt, faint where the text sits. A mail app that cannot draw it shows the plain ground. -->
<tr><td class="bgd" background="${base}/receipt-bg.png" style="padding:0;background-repeat:no-repeat;background-position:center top;background-size:100% auto;">
${TABLE}

<!-- the drawing across the top: a still of the home page's pieces. Decorative, so its alt text is empty. -->
<tr><td style="padding:0;font-size:0;line-height:0;">
<img class="lt" src="${base}/receipt-top.png" width="550" alt="" style="display:block;width:100%;max-width:550px;height:auto;border:0;">
<!--[if !mso]><!--><div class="dk" style="display:none;max-height:0;overflow:hidden;mso-hide:all;"><img src="${base}/receipt-top-dark.png" width="550" alt="" style="display:block;width:100%;max-width:550px;height:auto;border:0;"></div><!--<![endif]-->
</td></tr>

<tr><td class="pad" align="center" style="padding:0 35px 40px;">
${TABLE}

<tr><td class="caps sub rf" align="center" style="padding:6px 0 0 3.8px;${caps(12, 18, 400, 3.8, SUB)}">Receipt from Anthony Dake</td></tr>

<tr><td class="amt serif ink" align="center" style="padding:12px 0 0;font-family:${SERIF};font-size:52px;line-height:52px;font-weight:400;color:${INK};white-space:nowrap;mso-line-height-rule:exactly;">${escapeHtml(paid)}</td></tr>

<tr><td class="serif sub" align="center" style="padding:8px 0 0;${serif(20, 26, SUB)}">Paid ${escapeHtml(date)}</td></tr>

<!-- the one thing to press -->
<tr><td align="center" style="padding:26px 0 0;">
<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;"><tr>
<td class="btn" align="center" bgcolor="${INK}" style="background-color:${INK};border-radius:26px;mso-padding-alt:16px 40px;">
<a class="caps" href="${url}" target="_blank" style="display:inline-block;padding:16px 38px 16px 40.6px;border-radius:26px;${caps(13, 18, 600, 2.6, GROUND)}text-decoration:none;">Download&nbsp;&rarr;</a>
</td></tr></table>
</td></tr>
${note(12, escapeHtml(window))}

${rule(30)}
<tr><td style="padding:14px 0 0;">
${detailRows}
</td></tr>

${rule(14)}
<tr><td style="padding:14px 0 0;">
${TABLE}
${moneyRow(input.productTitle, item, "item")}
${moneyRow("Total", paid, "total")}
${moneyRow("Amount paid", paid, "paid")}
</table>
</td></tr>

${rule(14)}
${input.test ? `${note(28, testLine)}\n${note(2, "Questions? Reply to this email.")}` : note(28, "Questions? Reply to this email.")}

<!-- the sign-off: the home page's name and line -->
<tr><td class="serif" align="center" style="padding:26px 0 0;${serif(36, 40, INK)}"><a href="${SITE}" target="_blank" aria-label="Anthony Dake" style="text-decoration:none;color:${INK};">${NAME}</a></td></tr>
<tr><td class="caps sub" align="center" style="padding:3px 0 0 3.5px;${caps(11, 16, 400, 3.5, SUB)}">Architect of Sound</td></tr>
<tr><td class="caps sub" align="center" style="padding:18px 0 0 2.2px;${caps(11, 17, 400, 2.2, SUB)}">Columbus, OH</td></tr>
<tr><td class="caps sub" align="center" style="padding:2px 0 0 2.2px;${caps(11, 17, 400, 2.2, SUB)}"><a class="sub" href="${SITE}" target="_blank" style="color:${SUB};text-decoration:none;">anthonydakemusic.com</a></td></tr>

</table>
</td></tr>
</table>
</td></tr>
</table>
</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->

</td></tr>
</table>
</body>
</html>
`;

  const text =
    `Your download is ready: ${input.pageUrl}\n` +
    `${window}\n\n` +
    `Receipt from Anthony Dake\n` +
    `${paid}, paid ${date}\n\n` +
    details.map(([label, value]) => `${label}: ${value}`).join("\n") +
    `\n\n` +
    `${input.productTitle}: ${item}\n` +
    `Total: ${paid}\n` +
    `Amount paid: ${paid}\n\n` +
    (input.test ? `${testLine}\n` : "") +
    `Questions? Reply to this email.\n\n` +
    `Anthony Dake\nArchitect of Sound\nColumbus, OH\n${SITE}\n`;

  return {
    // Square sends its own receipt as well, so this one says it has the download.
    subject: `${input.test ? "[TEST] " : ""}Your download and receipt from Anthony Dake`,
    html,
    text,
  };
}
