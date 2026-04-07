import BookingList from "@/components/BookingList";

export default function MyBookingPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold">My Booking</h1>
        <p className="text-gray-600">
          Review your venue bookings and cancel any booking from this page.
        </p>
      </div>

      <BookingList />
    </main>
  );
}
