export const MAX_ACTIVE_BOOKINGS = 3;
export const BOOKING_START_DATE = new Date(2022, 4, 10);
export const BOOKING_END_DATE = new Date(2022, 4, 13);
export const MAX_BOOKINGS_ERROR = `You can only book up to ${MAX_ACTIVE_BOOKINGS} interview sessions`;
export const BOOKING_WINDOW_LABEL = "May 10-13, 2022";

export function isAllowedBookingDate(date: Date): boolean {
  return date >= BOOKING_START_DATE && date <= BOOKING_END_DATE;
}

export function normalizeBookingDate(date: Date): string {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0, 0),
  ).toISOString();
}
