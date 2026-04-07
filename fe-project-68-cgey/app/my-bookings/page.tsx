import { redirect } from "next/navigation";

import MyBookingsSwitcher from "@/components/my-bookings-switcher";
import { getCurrentUser } from "@/lib/auth";
import SiteHeader from "@/components/site-header";
import { getCurrentUserBookings } from "@/lib/bookings";

type MyBookingsPageProps = {
  searchParams?: Promise<{
    selected?: string | string[];
  }>;
};

function normalizeValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function MyBookingsPage({ searchParams }: MyBookingsPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const bookings = await getCurrentUserBookings();
  const selectedBookingId = normalizeValue(resolvedSearchParams?.selected);
  return (
    <div className="min-h-dvh bg-[#f8f8f8]">
      <SiteHeader activePath="/my-bookings" currentUser={currentUser} />

      <main className="px-4 pb-10 pt-[94px] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">
          <MyBookingsSwitcher bookings={bookings} initialSelectedId={selectedBookingId} />
        </div>
      </main>
    </div>
  );
}
