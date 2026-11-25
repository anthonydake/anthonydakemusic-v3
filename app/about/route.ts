import { htmlResponse, renderDocument } from "@/lib/site/render";

// About: the photograph with the artists' texts round it.
export const dynamic = "force-static";

export function GET() {
  return htmlResponse(renderDocument("about"));
}
