"use client";

import SiteHeader from "../components/SiteHeader";
import FooterLine from "../components/FooterLine";
import { formatPrice, type StoreProduct } from "@/data/store.data";

type Props = {
  products: StoreProduct[];
  sandbox: boolean;
  error?: string;
};

export default function StoreClient({ products, sandbox, error }: Props) {
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="mx-auto max-w-[640px] bg-black px-6 pt-24 pb-16 text-[#F2F2F2] sm:px-8"
      >
        <header className="mb-10 text-center">
          <h1 className="grad font-display text-[44px] leading-tight tracking-[-0.015em] sm:text-[58px]">
            Store
          </h1>
          {sandbox && (
            <p className="mt-3 text-[12px] text-[#5C5C5C]">Test mode. No real charges.</p>
          )}
        </header>

        {error && (
          <p role="alert" className="mb-8 text-center text-[15px] leading-[1.6] text-[#9A9A9A]">
            Checkout did not open, and nothing was charged. Try again in a minute.
          </p>
        )}

        <ul>
          {products.map((p) => (
            <li key={p.id} className="border-t border-white/[0.08] py-8 last:border-b">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-[20px] text-[#F2F2F2]">{p.title}</h2>
                <span className="text-[15px] tabular-nums text-[#9A9A9A]">
                  {formatPrice(p.priceCents)}
                </span>
              </div>
              <p className="mt-2 text-[15px] leading-[1.6] text-[#9A9A9A]">{p.blurb}</p>
              {/* A real form, so buying works with JavaScript off. */}
              <form method="POST" action="/api/store/checkout" className="mt-6">
                <input type="hidden" name="product" value={p.id} />
                <button type="submit" className="epk-cta cursor-pointer">
                  Buy →
                </button>
              </form>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center text-[12px] leading-[1.6] text-[#5C5C5C]">
          Secure checkout by Square. Your download appears right after payment.
        </p>
      </main>
      <FooterLine />
    </>
  );
}
