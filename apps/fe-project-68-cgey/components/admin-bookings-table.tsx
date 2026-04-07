"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import ConfirmActionDialog from "@/components/confirm-action-dialog";
import InlineStatus from "@/components/inline-status";
import {
  BOOKING_START_DATE,
  isAllowedBookingDate,
  normalizeBookingDate,
} from "@/lib/booking-rules";

export type AdminBooking = {
  _id: string;
  bookingDate: string;
  createdAt: string;
  user: {
    _id: string;
    name: string;
    email?: string;
  };
  company: string | {
    _id: string;
    name: string;
  };
};

function getUserDisplay(user: AdminBooking["user"]): { name: string; email: string } {
  return {
    name: user.name || "N/A",
    email: user.email || "",
  };
}

function getCompanyDisplay(company: AdminBooking["company"]): string {
  if (typeof company === "string") return company;
  return company?.name || "N/A";
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

export default function AdminBookingsTable({
  initialBookings,
}: {
  initialBookings: AdminBooking[];
}) {
  const [bookings, setBookings] = useState(initialBookings);
  const [editingBooking, setEditingBooking] = useState<AdminBooking | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<AdminBooking | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<{
    tone: "error" | "success";
    message: string;
  } | null>(null);

  async function handleDelete() {
    if (!bookingToDelete) {
      return;
    }

    setIsDeleting(true);
    setStatus(null);

    try {
      const res = await fetch(`/api/bookings/${bookingToDelete._id}`, { method: "DELETE" });
      const payload = await res.json();
      if (!res.ok || payload.success === false) {
        setStatus({
          tone: "error",
          message: payload.error || "Failed to delete booking.",
        });
      } else {
        setBookings((prev) =>
          prev.filter((booking) => booking._id !== bookingToDelete._id),
        );
        setBookingToDelete(null);
        setStatus({
          tone: "success",
          message: "Booking deleted successfully.",
        });
      }
    } catch {
      setStatus({
        tone: "error",
        message: "Unable to reach the server.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleUpdate() {
    if (!editingBooking || !selectedDate) return;
    setIsSubmitting(true);
    setError("");
    setStatus(null);

    try {
      const normalizedDate = normalizeBookingDate(selectedDate);
      const res = await fetch(`/api/bookings/${editingBooking._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingDate: normalizedDate }),
      });
      const payload = await res.json();
      if (!res.ok || payload.success === false) {
        setError(payload.error || "Failed to update booking.");
      } else {
        setBookings((prev) =>
          prev.map((b) =>
            b._id === editingBooking._id
              ? { ...b, bookingDate: normalizedDate }
              : b
          )
        );
        setEditingBooking(null);
        setStatus({
          tone: "success",
          message: "Booking date updated successfully.",
        });
      }
    } catch {
      setError("Unable to reach the server.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {status ? (
        <InlineStatus
          message={status.message}
          tone={status.tone}
          className="mb-4"
        />
      ) : null}

      <div className="overflow-x-auto rounded-[16px] border border-[#e5e5e5] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <table className="w-full text-left text-[14px]">
          <thead>
            <tr className="border-b border-[#efe6dc] bg-[#fcfbf8] text-[13px] font-semibold text-[#6b6b6b]">
              <th className="px-5 py-3">ID</th>
              <th className="px-5 py-3">Company</th>
              <th className="px-5 py-3">Booking Date</th>
              <th className="px-5 py-3">Created</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-black/40">
                  No bookings found.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr
                  key={booking._id}
                  className="border-b border-[#f0f0f0] transition-colors last:border-b-0 hover:bg-[#fdf9f5]"
                >
                  <td className="px-5 py-3">
                    <p className="font-semibold text-[#252525]">{getUserDisplay(booking.user).name}</p>
                    <p className="text-[12px] text-black/40">{getUserDisplay(booking.user).email}</p>
                  </td>
                  <td className="px-5 py-3 font-medium text-[#252525]">
                    {getCompanyDisplay(booking.company)}
                  </td>
                  <td className="px-5 py-3 text-[#4a4a4a]">
                    {formatDate(booking.bookingDate)}
                  </td>
                  <td className="px-5 py-3 text-[#4a4a4a]">
                    {formatDate(booking.createdAt)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => {
                          setEditingBooking(booking);
                          setSelectedDate(new Date(booking.bookingDate));
                          setError("");
                        }}
                        className="rounded-full bg-[#2c7bc9] px-3 py-1 text-[12px] font-bold text-white transition-colors hover:bg-[#1a5b9c]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setBookingToDelete(booking);
                          setStatus(null);
                        }}
                        className="rounded-full bg-[#dc3545] px-3 py-1 text-[12px] font-bold text-white transition-colors hover:bg-[#b02a37]"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editingBooking} onOpenChange={(open) => { if (!open) setEditingBooking(null); }}>
        <DialogContent className="max-w-[420px] rounded-[24px] border border-[#efe6dc] bg-white p-0">
          <DialogHeader className="px-6 pb-0 pt-6">
            <DialogTitle className="text-[22px] font-bold text-[#1f1f21]">
              Edit Booking Date
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 py-4">
            <p className="mb-3 text-[14px] text-black/55">
              Editing booking for <span className="font-semibold text-[#252525]">{editingBooking ? getUserDisplay(editingBooking.user).name : ""}</span> at <span className="font-semibold text-[#252525]">{editingBooking ? getCompanyDisplay(editingBooking.company) : ""}</span>
            </p>
            <div className="rounded-[22px] border border-[#ece6df] bg-[linear-gradient(180deg,#fffdfa_0%,#f6f9ff_100%)] p-3 shadow-[0_18px_48px_rgba(190,155,113,0.08)]">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date && isAllowedBookingDate(date)) setSelectedDate(date);
                }}
                defaultMonth={BOOKING_START_DATE}
                month={BOOKING_START_DATE}
                disabled={(date) => !isAllowedBookingDate(date)}
                className="w-full rounded-[20px] bg-white/75 p-2 [--cell-size:--spacing(8)]"
              />
            </div>
            {error && (
              <p className="mt-3 text-[13px] font-medium text-[#a33a3a]">{error}</p>
            )}
          </div>
          <div className="flex justify-between rounded-b-[24px] border-t border-[#efe6dc] bg-[#fcfbf8] px-6 py-4">
            <button
              onClick={() => setEditingBooking(null)}
              className="rounded-full border border-[#e6c9aa] bg-white px-4 py-2.5 text-[14px] font-bold text-[#b06f2c] transition-colors hover:bg-[#fff4ea]"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={isSubmitting || !selectedDate}
              className="rounded-full bg-[#dd7f21] px-4 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#c56f1f] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmActionDialog
        open={!!bookingToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setBookingToDelete(null);
          }
        }}
        title="Delete booking?"
        description={
          bookingToDelete
            ? `This will remove the booking for ${getUserDisplay(bookingToDelete.user).name} at ${getCompanyDisplay(bookingToDelete.company)}.`
            : ""
        }
        confirmLabel="Delete booking"
        tone="danger"
        isSubmitting={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
