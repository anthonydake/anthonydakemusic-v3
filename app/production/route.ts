import { htmlResponse, renderDocument } from "@/lib/site/render";

// Production: the belt of covers, the offer, the booking form.
export const dynamic = "force-static";

export function GET() {
  return htmlResponse(renderDocument("production"));
}
