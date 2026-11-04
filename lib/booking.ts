export const OPEN_BOOKING_EVENT = "open-booking";

export function openBooking(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_BOOKING_EVENT));
}
