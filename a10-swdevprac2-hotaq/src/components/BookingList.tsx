"use client";

import { useDispatch, useSelector } from "react-redux";
import { removeBooking } from "@/redux/features/bookSlice";
import type { AppDispatch, RootState } from "@/redux/store";

export default function BookingList() {
  const dispatch = useDispatch<AppDispatch>();
  const bookItems = useSelector(
    (state: RootState) => state.bookSlice.bookItems
  );

  if (bookItems.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
        No Venue Booking
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="grid grid-cols-5 gap-4 border-b border-gray-100 bg-gray-50 px-6 py-4 text-sm font-semibold text-gray-600">
        <span>Name-Lastname</span>
        <span>Contact-Number</span>
        <span>Venue</span>
        <span>Book Date</span>
        <span>Action</span>
      </div>
      <div className="divide-y divide-gray-100">
        {bookItems.map((booking) => (
          <div
            key={`${booking.nameLastname}-${booking.tel}-${booking.venue}-${booking.bookDate}`}
            className="grid grid-cols-1 gap-3 px-6 py-4 text-sm text-gray-700 sm:grid-cols-5 sm:items-center sm:gap-4"
          >
            <span>{booking.nameLastname}</span>
            <span>{booking.tel}</span>
            <span>{booking.venue}</span>
            <span>{booking.bookDate}</span>
            <button
              type="button"
              name="Cancel Booking"
              onClick={() => dispatch(removeBooking(booking))}
              className="w-fit rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
            >
              Cancel Booking
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
