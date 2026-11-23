"use client";

import SiteHeader from "../../../components/SiteHeader";
import FooterLine from "../../../components/FooterLine";
import type { OrderPageState } from "@/lib/store/orders";

type ThanksState = OrderPageState;

type Props = {
  state: ThanksState;
  title: string;
  downloadHref: string | null;
  retryHref: string;
  sandbox: boolean;
};

const HEADING: Record<ThanksState, string> = {
  ready: "Thank you",
  pending: "One moment",
  stalled: "Still processing",
  refunded: "Order refunded",
  expired: "Link expired",
};

const BODY = "mt-6 text-[15px] leading-[1.6] text-[#9A9A9A]";
const TEXT_LINK = "mt-6 text-[15px] text-[#F2F2F2] hover:text-[#9A9A9A] transition-colors";

export default function ThanksClient({ state, title, downloadHref, retryHref, sandbox }: Props) {
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="mx-auto flex min-h-[70vh] max-w-[640px] flex-col items-center justify-center bg-black px-6 pt-24 pb-16 text-center text-[#F2F2F2]"
      >
        <h1 className="grad font-display text-[44px] leading-tight tracking-[-0.015em] sm:text-[58px]">
          {HEADING[state]}
        </h1>

        {state === "ready" && (
          <>
            <p className={BODY}>{title} is ready.</p>
            {downloadHref && (
              <a href={downloadHref} className="epk-cta mt-8">
                Download →
              </a>
            )}
            <p className="mt-8 text-[12px] leading-[1.6] text-[#5C5C5C]">
              Keep this page. The link works for 30 days.
            </p>
          </>
        )}

        {state === "pending" && (
          <>
            <p className={BODY}>
              Confirming your payment with Square. This page refreshes on its own.
            </p>
            <a href={retryHref} className={TEXT_LINK}>
              Check again →
            </a>
          </>
        )}

        {state === "stalled" && (
          <>
            <p className={BODY}>
              Your payment has not confirmed yet. If you were charged, email me and I will send
              your file.
            </p>
            <a href={retryHref} className={TEXT_LINK}>
              Check again →
            </a>
          </>
        )}

        {state === "refunded" && (
          <p className={BODY}>This order was refunded, so the download is closed.</p>
        )}

        {state === "expired" && (
          <p className={BODY}>This download link has expired. Email me for a fresh one.</p>
        )}

        <p className="mt-10 text-[12px] leading-[1.6] text-[#5C5C5C]">
          Questions?{" "}
          <a
            href="mailto:adakemusic@gmail.com"
            className="text-[#9A9A9A] hover:text-[#F2F2F2] transition-colors"
          >
            adakemusic@gmail.com
          </a>
          {sandbox ? " · Test mode" : ""}
        </p>
      </main>
      <FooterLine />
    </>
  );
}
