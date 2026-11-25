import { htmlResponse, renderDocument } from "@/lib/site/render";

// Press kit: a short bio in Anthony's words (site/content.mjs, PRESS_KIT).
export const dynamic = "force-static";

export function GET() {
  return htmlResponse(renderDocument("press-kit"));
}
