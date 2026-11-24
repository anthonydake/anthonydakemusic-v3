import { htmlResponse, renderDocument } from "@/lib/site/render";

// The home screen. Built once per deployment and served as a file.
export const dynamic = "force-static";

export function GET() {
  return htmlResponse(renderDocument("home"));
}
