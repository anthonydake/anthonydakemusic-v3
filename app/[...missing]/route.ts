import { notFoundResponse } from "@/lib/site/render";

// Any address that is not a page of the site: the site's own "Not found"
// page, sent as a 404. (Real pages, /api and files in public/ are matched
// before this.)
export const dynamic = "force-dynamic";

export function GET() {
  return notFoundResponse();
}
