import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { BookingItem } from "../../../interface";

type BookState = {
  bookItems: BookingItem[];
};

const initialState: BookState = {
  bookItems: [],
};

export const bookSlice = createSlice({
  name: "bookSlice",
  initialState,
  reducers: {
    addBooking: (state, action: PayloadAction<BookingItem>) => {
      const incomingBooking = action.payload;
      const existingBookingIndex = state.bookItems.findIndex(
        (booking) =>
          booking.venue === incomingBooking.venue &&
          booking.bookDate === incomingBooking.bookDate
      );

      if (existingBookingIndex >= 0) {
        state.bookItems[existingBookingIndex] = incomingBooking;
        return;
      }

      state.bookItems.push(incomingBooking);
    },
    removeBooking: (state, action: PayloadAction<BookingItem>) => {
      const bookingToRemove = action.payload;
      state.bookItems = state.bookItems.filter(
        (booking) =>
          !(
            booking.nameLastname === bookingToRemove.nameLastname &&
            booking.tel === bookingToRemove.tel &&
            booking.venue === bookingToRemove.venue &&
            booking.bookDate === bookingToRemove.bookDate
          )
      );
    },
  },
});

export const { addBooking, removeBooking } = bookSlice.actions;

export default bookSlice.reducer;
