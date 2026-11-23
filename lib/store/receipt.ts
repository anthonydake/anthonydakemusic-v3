import {
  RECEIPT_MARK_CONTENT_ID,
  RECEIPT_MARK_FILENAME,
  RECEIPT_MARK_PNG_BASE64,
} from "./receipt-mark";

// The buyer's email: a receipt with the download button on it. Pure — no
// network, no database — so the self-test can build one and read it.
//
// Type follows the two-face rule from the home-screen redesign, not the
// one-family rule the live site still uses: Gill Sans capitals for the name
// of a thing and anything you press, one serif for anything you read. The
// sizes and letter-spacing are the ones that page uses for the same jobs.
//
// Email rules that shape the markup: tables and inline styles only, because
// Gmail drops <style> and <link>. That also means Gmail never loads a web
// font — the serif falls back to the next installed face in the stack (Iowan
// Old Style on Apple devices) and Gill Sans shows wherever it is installed.
// Apple Mail loads both web fonts. One layout for every width, no media
// queries: a 480 px column with 24 px of side room.

const GILL =
  "'Gill Sans Nova','Gill Sans','Gill Sans MT',Cabin,ui-sans-serif,system-ui,sans-serif";
const SERIF =
  "'Instrument Serif','Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif";
const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Cabin:wght@400;600&family=Instrument+Serif&display=swap";

const INK = "#000000";
const SUB = "#5c5c5c";
const RULE = "#e6e6e6";
const BG = "#ffffff";

// Capitals: names of things, and the one thing you press.
const TAG = `font-family:${GILL};font-size:11px;line-height:16px;letter-spacing:0.22em;text-transform:uppercase;color:${SUB};`;
const LABEL = `font-family:${GILL};font-size:11px;line-height:18px;letter-spacing:0.18em;text-transform:uppercase;`;
const SIGN = `font-family:${GILL};font-size:10px;line-height:16px;letter-spacing:0.2em;text-transform:uppercase;color:${SUB};`;
const BUTTON = `font-family:${GILL};font-size:12px;line-height:18px;letter-spacing:0.18em;text-transform:uppercase;color:${BG};`;
// The serif: anything you read.
const AMOUNT = `font-family:${SERIF};font-size:56px;line-height:60px;letter-spacing:-0.6px;color:${INK};`;
const PAID = `font-family:${SERIF};font-size:17px;line-height:22px;color:${SUB};`;
const VALUE = `font-family:${SERIF};font-size:18px;line-height:26px;color:${INK};`;
const NOTE = `font-family:${SERIF};font-size:16px;line-height:20px;color:${SUB};`;

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
};

export type ReceiptEmail = {
  subject: string;
  html: string;
  text: string;
  attachments: Array<{
    filename: string;
    content: string;
    content_type: string;
    content_id: string;
  }>;
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

const HAIRLINE =
  `<tr><td style="padding:0;"><div style="height:1px;line-height:1px;font-size:1px;background-color:${RULE};">&nbsp;</div></td></tr>`;

// One line of a table: the name of the thing in capitals on the left, what
// you read in the serif on the right. The side that can run long (a product
// title, an email address) is the side that wraps; the other never does, so a
// price is never broken across lines on a narrow phone.
function row(
  label: string,
  value: string,
  opts: {
    last?: boolean;
    labelInk?: boolean;
    strong?: boolean;
    wraps?: "label" | "value";
    /** Already-escaped HTML to show in place of the plain value. */
    valueHtml?: string;
  } = {}
): string {
  const gap = opts.last ? "0" : "4px";
  const wraps = opts.wraps ?? "value";
  const labelStyle =
    LABEL +
    `color:${opts.labelInk || opts.strong ? INK : SUB};` +
    (opts.strong ? "font-weight:600;" : "") +
    (wraps === "label" ? "" : "white-space:nowrap;") +
    `padding:0 16px ${gap} 0;vertical-align:baseline;`;
  const valueStyle =
    VALUE +
    (wraps === "value" ? "word-break:break-word;" : "white-space:nowrap;") +
    `padding:0 0 ${gap} 0;vertical-align:baseline;`;
  const tight = ` width="1%"`;
  return (
    `<tr>` +
    `<td align="left" valign="baseline"${wraps === "label" ? "" : tight} style="${labelStyle}">${escapeHtml(label)}</td>` +
    `<td align="right" valign="baseline"${wraps === "label" ? tight : ""} style="${valueStyle}">${opts.valueHtml ?? escapeHtml(value)}</td>` +
    `</tr>`
  );
}

function block(rows: string[]): string {
  return (
    `<tr><td style="padding:24px 0;">` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">` +
    rows.join("") +
    `</table></td></tr>`
  );
}

export function buildReceiptEmail(input: ReceiptInput): ReceiptEmail {
  const paid = formatReceiptMoney(input.paidCents, input.currency);
  const item = formatReceiptMoney(input.itemCents, input.currency);
  const date = formatReceiptDate(input.paidAt);
  const window = `The link works for ${input.downloadDays} days.`;
  const testLine = "Sandbox test order. No money moved.";

  const details: Array<[string, string]> = [];
  if (input.receiptNumber) details.push(["Receipt number", input.receiptNumber]);
  if (input.paidWith) details.push(["Paid with", input.paidWith]);
  details.push(["Sent to", input.to]);

  // Gmail turns a bare email address into a blue underlined link. Giving the
  // address a link of its own, in the receipt's ink, keeps it looking like text.
  const addressLink = `<a href="mailto:${escapeHtml(input.to)}" style="color:${INK};text-decoration:none;">${escapeHtml(input.to)}</a>`;
  const detailRows = details.map(([label, value], i) =>
    row(label, value, {
      last: i === details.length - 1,
      valueHtml: label === "Sent to" ? addressLink : undefined,
    })
  );
  const itemRows = [
    row(input.productTitle, item, { labelInk: true, wraps: "label" }),
    row("Total", paid, { wraps: "label" }),
    row("Amount paid", paid, { strong: true, last: true, wraps: "label" }),
  ];

  const url = escapeHtml(input.pageUrl);
  const preheader = `Your download is ready. ${window}`;

  const html =
    `<!doctype html>` +
    `<html lang="en">` +
    `<head>` +
    `<meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<meta name="color-scheme" content="light only">` +
    `<meta name="supported-color-schemes" content="light only">` +
    `<title>Receipt from Anthony Dake</title>` +
    `<link rel="stylesheet" href="${FONT_LINK}">` +
    // Apple Mail turns dates and places into links; keep them looking like text.
    `<style>a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font:inherit!important;}</style>` +
    `</head>` +
    `<body style="margin:0;padding:0;background-color:${BG};">` +
    // What an inbox shows next to the subject.
    `<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${BG};mso-hide:all;">${escapeHtml(preheader)}</div>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BG};">` +
    `<tr><td align="center" style="padding:48px 24px;">` +
    `<!--[if mso]><table role="presentation" width="480" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;border-collapse:collapse;">` +
    // The mark, then the name of the thing, the amount, the day.
    `<tr><td align="center" style="padding:0 0 32px 0;">` +
    `<img src="cid:${RECEIPT_MARK_CONTENT_ID}" width="64" height="64" alt="Anthony Dake" style="display:block;width:64px;height:64px;border:0;outline:none;">` +
    `</td></tr>` +
    `<tr><td align="center" style="${TAG}padding:0 0 8px 0.22em;">Receipt from Anthony Dake</td></tr>` +
    `<tr><td align="center" style="${AMOUNT}padding:0 0 8px 0;">${escapeHtml(paid)}</td></tr>` +
    `<tr><td align="center" style="${PAID}padding:0 0 24px 0;">Paid ${escapeHtml(date)}</td></tr>` +
    // The one thing to press.
    `<tr><td align="center" style="padding:0 0 12px 0;">` +
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;border-collapse:separate;">` +
    `<tr><td align="center" bgcolor="${INK}" style="background-color:${INK};border-radius:9999px;">` +
    `<a href="${url}" target="_blank" style="${BUTTON}display:inline-block;min-width:162px;padding:13px 28px 13px 30px;text-align:center;text-decoration:none;border-radius:9999px;">Download&nbsp;&rarr;</a>` +
    `</td></tr></table>` +
    `</td></tr>` +
    `<tr><td align="center" style="${NOTE}padding:0 0 24px 0;">${escapeHtml(window)}</td></tr>` +
    HAIRLINE +
    block(detailRows) +
    HAIRLINE +
    block(itemRows) +
    HAIRLINE +
    (input.test
      ? `<tr><td align="center" style="${NOTE}padding:24px 0 6px 0;">${testLine}</td></tr>` +
        `<tr><td align="center" style="${NOTE}padding:0 0 6px 0;">Questions? Reply to this email.</td></tr>`
      : `<tr><td align="center" style="${NOTE}padding:24px 0 6px 0;">Questions? Reply to this email.</td></tr>`) +
    `<tr><td align="center" style="${SIGN}padding:0 0 0 0.2em;white-space:nowrap;">Anthony Dake &middot; Columbus, OH</td></tr>` +
    `<tr><td align="center" style="${SIGN}padding:0 0 0 0.2em;white-space:nowrap;">` +
    `<a href="https://www.anthonydakemusic.com" target="_blank" style="color:${SUB};text-decoration:none;">anthonydakemusic.com</a>` +
    `</td></tr>` +
    `</table>` +
    `<!--[if mso]></td></tr></table><![endif]-->` +
    `</td></tr></table>` +
    `</body></html>`;

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
    `Anthony Dake\nColumbus, OH\nhttps://www.anthonydakemusic.com\n`;

  return {
    // Square sends its own receipt as well, so this one says it has the download.
    subject: `${input.test ? "[TEST] " : ""}Your download and receipt from Anthony Dake`,
    html,
    text,
    attachments: [
      {
        filename: RECEIPT_MARK_FILENAME,
        content: RECEIPT_MARK_PNG_BASE64,
        content_type: "image/png",
        content_id: RECEIPT_MARK_CONTENT_ID,
      },
    ],
  };
}
