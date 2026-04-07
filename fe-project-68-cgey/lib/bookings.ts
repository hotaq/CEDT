import { cache } from "react";

import { buildBackendUrl, getAuthToken } from "@/lib/backend";

export type BookingWithCompany = {
  _id: string;
  bookingDate: string;
  createdAt: string;
  company: {
    _id: string;
    name: string;
    address: string;
    website: string;
    photoUrl?: string;
    description: string;
    telephone: string;
  };
};

type BookingResponse = {
  success?: boolean;
  data?: BookingWithCompany[];
};

const getCurrentUserBookingsByToken = cache(
  async (token: string | null): Promise<BookingWithCompany[]> => {
    if (!token) {
      return [];
    }

    try {
      const response = await fetch(buildBackendUrl("/bookings"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        return [];
      }

      const payload = (await response.json()) as BookingResponse;

      if (!Array.isArray(payload.data)) {
        return [];
      }

      return payload.data.filter(
        (booking): booking is BookingWithCompany => Boolean(booking.company?._id),
      );
    } catch {
      return [];
    }
  },
);

async function getCurrentUserBookings(): Promise<BookingWithCompany[]> {
  const token = await getAuthToken();

  return getCurrentUserBookingsByToken(token);
}

export async function getCurrentUserBookedCompanyIds(): Promise<string[]> {
  const bookings = await getCurrentUserBookings();

  return bookings
      .map((booking) => booking.company._id)
      .filter((companyId): companyId is string => Boolean(companyId));
}

export { getCurrentUserBookings };
