import { redirect } from "next/navigation";

export default function ArchiveAdminRedirect() {
  redirect("/admin/bookings");
}
