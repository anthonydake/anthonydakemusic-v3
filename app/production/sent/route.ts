import { htmlResponse, renderDocument } from "@/lib/site/render";

// Where the booking form lands when it was posted WITHOUT scripts and went
// through (POST /api/book answers with a redirect here): Production with the
// "Sent." words in the form's place. With scripts on, the form never leaves
// /production.
export const dynamic = "force-static";

export function GET() {
  return htmlResponse(renderDocument("production", { booking: "sent" }, { noindex: true }));
}
