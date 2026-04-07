import assert from "node:assert/strict";
import test from "node:test";

import {
  BOOKING_END_DATE,
  BOOKING_START_DATE,
  BOOKING_WINDOW_LABEL,
  MAX_ACTIVE_BOOKINGS,
  MAX_BOOKINGS_ERROR,
  isAllowedBookingDate,
  normalizeBookingDate,
} from "../lib/booking-rules.ts";

test("booking window includes the start and end dates", () => {
  assert.equal(isAllowedBookingDate(BOOKING_START_DATE), true);
  assert.equal(isAllowedBookingDate(BOOKING_END_DATE), true);
});

test("booking window excludes dates outside the allowed range", () => {
  assert.equal(isAllowedBookingDate(new Date(2022, 4, 9)), false);
  assert.equal(isAllowedBookingDate(new Date(2022, 4, 14)), false);
});

test("normalizeBookingDate stores the selected day at 09:00 UTC", () => {
  const normalized = normalizeBookingDate(new Date(2022, 4, 12));

  assert.equal(normalized, "2022-05-12T09:00:00.000Z");
});

test("booking copy stays aligned with the active booking limit", () => {
  assert.equal(MAX_ACTIVE_BOOKINGS, 3);
  assert.equal(MAX_BOOKINGS_ERROR, "You can only book up to 3 interview sessions");
  assert.equal(BOOKING_WINDOW_LABEL, "May 10-13, 2022");
});
