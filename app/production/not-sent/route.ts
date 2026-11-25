import { htmlResponse, renderDocument } from "@/lib/site/render";

// Where the booking form lands when it was posted WITHOUT scripts and did not
// go through: the form again, with the line that says so and gives the email
// address. With scripts on, the form says this in place.
export const dynamic = "force-static";

export function GET() {
  return htmlResponse(renderDocument("production", { booking: "failed" }, { noindex: true }));
}
