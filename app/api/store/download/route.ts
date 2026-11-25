import { SUPPORT_EMAIL } from "@/lib/store/config";
import { getProductFile } from "@/lib/store/files";
import {
  ensureStoreSchema,
  getOrderByToken,
  recordDownload,
} from "@/lib/store/orders";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function plain(message: string, status: number) {
  return new Response(`${message}\n`, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) {
    return plain("Download link not found.", 404);
  }

  await ensureStoreSchema();

  const order = await recordDownload(token);
  if (!order) {
    const existing = await getOrderByToken(token);
    if (!existing) return plain("Download link not found.", 404);
    if (existing.status === "refunded") {
      return plain("This order was refunded, so the download is closed.", 403);
    }
    if (existing.status !== "paid") {
      return plain("This order has not been paid yet.", 409);
    }
    return plain(
      `This download link has expired. Email ${SUPPORT_EMAIL} for a fresh one.`,
      410
    );
  }

  const file = getProductFile(order.product_id);
  if (!file) {
    return plain(
      `This file is not available right now. Email ${SUPPORT_EMAIL} and it will be sent to you.`,
      503
    );
  }

  const baseHeaders = {
    "Content-Disposition": `attachment; filename="${file.filename}"`,
    "Cache-Control": "private, no-store",
    "X-Robots-Tag": "noindex",
  };

  if (file.kind === "generated") {
    return new Response(file.body(order), {
      headers: { ...baseHeaders, "Content-Type": file.contentType },
    });
  }

  // Streamed through this route so the source URL never reaches the buyer.
  const upstream = await fetch(file.url, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) {
    console.error(`[store] file fetch failed for ${order.product_id}: ${upstream.status}`);
    return plain(
      `This file is not available right now. Email ${SUPPORT_EMAIL} and it will be sent to you.`,
      502
    );
  }

  const headers: Record<string, string> = {
    ...baseHeaders,
    "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
  };
  const length = upstream.headers.get("content-length");
  if (length) headers["Content-Length"] = length;

  return new Response(upstream.body, { headers });
}
