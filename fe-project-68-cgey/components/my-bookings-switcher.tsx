"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  BOOKING_START_DATE,
  MAX_ACTIVE_BOOKINGS,
  isAllowedBookingDate,
  normalizeBookingDate,
} from "@/lib/booking-rules";
import InlineStatus from "@/components/inline-status";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { openSans, outfit } from "@/lib/fonts";
import type { BookingWithCompany } from "@/lib/bookings";

type MyBookingsSwitcherProps = {
  bookings: BookingWithCompany[];
  initialSelectedId?: string;
};

function formatBookingDate(
  dateValue: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    options ?? {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function getWebsiteHost(website: string): string {
  try {
    return new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return website;
  }
}

function getReferenceCode(bookingId: string): string {
  return bookingId.slice(-6).toUpperCase();
}

function BookingCalendarPreview({ bookingDate }: { bookingDate: string }) {
  const displayDate = useMemo(() => {
    const date = new Date(bookingDate);
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }, [bookingDate]);

  return (
    <Card className="w-full rounded-[24px] border border-[#ece6df] bg-[linear-gradient(180deg,#fffdfa_0%,#f6f9ff_100%)] p-2 shadow-[0_18px_48px_rgba(190,155,113,0.08)]">
      <CardContent className="p-0">
        <Calendar
          mode="single"
          selected={displayDate}
          defaultMonth={displayDate}
          numberOfMonths={1}
          captionLayout="dropdown"
          className="w-full rounded-[20px] bg-white/75 p-2 [--cell-size:--spacing(7)] md:[--cell-size:--spacing(7)]"
          formatters={{
            formatMonthDropdown: (date) => {
              return date.toLocaleString("en-US", { month: "long" });
            },
          }}
          components={{
            DayButton: ({ children, modifiers, day, ...props }) => {
              const isSelected = modifiers.selected;

              return (
                <CalendarDayButton day={day} modifiers={modifiers} {...props}>
                  {children}
                  {!modifiers.outside ? (
                    <span
                      className={
                        isSelected
                          ? "text-[9px] text-white/80"
                          : "text-[9px] text-[#9aa1ad]"
                      }
                    >
                      {isSelected ? "Booked" : ""}
                    </span>
                  ) : null}
                </CalendarDayButton>
              );
            },
          }}
        />
      </CardContent>
    </Card>
  );
}

function SummaryStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#f1ece5] bg-[#faf9f7] px-4 py-3">
      <p className={`${openSans.className} text-[12px] font-semibold uppercase tracking-[0.12em] text-[#ab7a48]`}>
        {label}
      </p>
      <p className={`${openSans.className} mt-1.5 text-[20px] font-bold text-[#222222]`}>
        {value}
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#f2ece4] py-3 last:border-b-0 last:pb-0 first:pt-0">
      <span className={`${openSans.className} text-[13px] font-semibold uppercase tracking-[0.12em] text-[#a77a4d]`}>
        {label}
      </span>
      <span className={`${openSans.className} max-w-[60%] text-right text-[15px] font-semibold leading-6 text-[#222222]`}>
        {value}
      </span>
    </div>
  );
}

function BookingSummaryCard({
  booking,
  isActive,
  onSelect,
}: {
  booking: BookingWithCompany;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`block w-full rounded-[22px] border p-4 text-left shadow-[0_16px_34px_rgba(190,155,113,0.08)] transition-colors ${
        isActive
          ? "border-[#dd7f21]/40 bg-[#fff8f0]"
          : "border-[#ece6df] bg-white/92 hover:border-[#dd7f21]/30"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <p className={`${openSans.className} text-[14px] font-semibold text-[#d57a24]`}>
          {formatBookingDate(booking.bookingDate, {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
        <span
          className={`${openSans.className} rounded-full px-2.5 py-1 text-[12px] font-semibold ${isActive ? "bg-[#dd7f21] text-white" : "bg-[#f6f4f1] text-[#6d7077]"}`}
        >
          {isActive ? "Selected" : "View"}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fff7ef] text-[13px] font-bold text-[#c97825] shadow-[0_10px_20px_rgba(0,0,0,0.05)]">
            {booking.company.name.slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={`${openSans.className} truncate text-[16px] font-semibold text-[#111111]`}>
            {booking.company.name}
          </h3>
          <p className={`${openSans.className} mt-1 truncate text-[13px] font-medium text-[#25a8df]`}>
            {getWebsiteHost(booking.company.website)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-[18px] bg-[#f6f4f1] px-3 py-2.5">
        <span className={`${openSans.className} text-[12px] font-semibold uppercase tracking-[0.12em] text-[#9aa1ad]`}>
          Ref {getReferenceCode(booking._id)}
        </span>
        <span className={`${openSans.className} text-[12px] font-semibold text-[#43464d]`}>
          Active
        </span>
      </div>
    </button>
  );
}

export default function MyBookingsSwitcher({
  bookings,
  initialSelectedId,
}: MyBookingsSwitcherProps) {
  const [bookingItems, setBookingItems] = useState(bookings);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    initialSelectedId ?? bookings[0]?._id ?? null,
  );
  const [editingBooking, setEditingBooking] = useState<BookingWithCompany | null>(
    null,
  );
  const [selectedEditDate, setSelectedEditDate] = useState<Date | undefined>(
    undefined,
  );
  const [updateError, setUpdateError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<{
    tone: "error" | "success";
    message: string;
  } | null>(null);

  useEffect(() => {
    setBookingItems(bookings);
  }, [bookings]);

  useEffect(() => {
    setSelectedBookingId((currentSelectedId) => {
      if (bookingItems.length === 0) {
        return null;
      }

      if (
        currentSelectedId &&
        bookingItems.some((booking) => booking._id === currentSelectedId)
      ) {
        return currentSelectedId;
      }

      if (
        initialSelectedId &&
        bookingItems.some((booking) => booking._id === initialSelectedId)
      ) {
        return initialSelectedId;
      }

      return bookingItems[0]._id;
    });
  }, [bookingItems, initialSelectedId]);

  const selectedBooking =
    bookingItems.find((booking) => booking._id === selectedBookingId) ?? null;
  const visibleBookingCards = useMemo(() => {
    if (!selectedBooking) {
      return [] as BookingWithCompany[];
    }

    return bookingItems
      .filter((booking) => booking._id !== selectedBooking._id)
      .slice(0, 2);
  }, [bookingItems, selectedBooking]);
  const remainingSlots = Math.max(0, MAX_ACTIVE_BOOKINGS - bookingItems.length);

  function handleOpenEditBooking() {
    if (!selectedBooking) {
      return;
    }

    setEditingBooking(selectedBooking);
    setSelectedEditDate(new Date(selectedBooking.bookingDate));
    setUpdateError("");
    setStatus(null);
  }

  async function handleUpdateSelectedBooking() {
    if (!editingBooking || !selectedEditDate) {
      return;
    }

    setIsUpdating(true);
    setUpdateError("");
    setStatus(null);

    try {
      const normalizedDate = normalizeBookingDate(selectedEditDate);
      const response = await fetch(`/api/bookings/${editingBooking._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingDate: normalizedDate }),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || payload.success === false) {
        setUpdateError(payload.error ?? "Unable to update this booking right now.");
        return;
      }

      setBookingItems((currentBookings) =>
        currentBookings.map((booking) =>
          booking._id === editingBooking._id
            ? { ...booking, bookingDate: normalizedDate }
            : booking,
        ),
      );
      setEditingBooking(null);
      setStatus({
        tone: "success",
        message: "Booking date updated successfully.",
      });
    } catch {
      setUpdateError("Unable to reach the booking service.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDeleteSelectedBooking() {
    if (!selectedBooking) {
      return;
    }

    const bookingIdToDelete = selectedBooking._id;

    setStatus(null);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/bookings/${bookingIdToDelete}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || payload.success === false) {
        setStatus({
          tone: "error",
          message: payload.error ?? "Unable to delete this booking right now.",
        });
        return;
      }

      setBookingItems((currentBookings) => {
        const nextBookings = currentBookings.filter(
          (booking) => booking._id !== bookingIdToDelete,
        );

        setSelectedBookingId((currentSelectedId) => {
          if (currentSelectedId !== bookingIdToDelete) {
            return currentSelectedId;
          }

          return nextBookings[0]?._id ?? null;
        });

        return nextBookings;
      });
      setStatus({
        tone: "success",
        message: "Booking deleted successfully.",
      });
    } catch {
      setStatus({
        tone: "error",
        message: "Unable to reach the booking service.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  if (!selectedBooking) {
    return (
      <section className="rounded-[30px] border border-[#ece6df] bg-[linear-gradient(180deg,#fffdfa_0%,#fffaf4_100%)] p-5 shadow-[0_24px_70px_rgba(190,155,113,0.08)] sm:p-6 lg:p-7">
        <div className="rounded-[24px] border border-dashed border-[#eadfd2] bg-white/70 p-8 text-center">
          <h2 className={`${outfit.className} text-[34px] text-[#111111]`}>
            My Bookings
          </h2>
          <p
            className={`${openSans.className} mt-3 text-[16px] leading-7 text-black/55`}
          >
            You have not booked any companies yet. Go to Find Jobs and select a
            company to create your first booking.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {status ? (
        <InlineStatus
          message={status.message}
          tone={status.tone}
        />
      ) : null}

      <section className="rounded-[30px] border border-[#ece6df] bg-[linear-gradient(180deg,#fffdfa_0%,#fffaf4_100%)] p-4 shadow-[0_24px_70px_rgba(190,155,113,0.08)] sm:p-4 lg:p-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.84fr)] xl:items-stretch">
          <div className="flex h-full flex-col space-y-4">
            <div className="space-y-2">
              <p
                className={`${openSans.className} text-[14px] font-semibold uppercase tracking-[0.18em] text-[#c1823d]`}
              >
                My bookings
              </p>
              <h1
                className={`${outfit.className} text-[30px] leading-[0.96] text-[#111111] sm:text-[38px] lg:text-[42px]`}
              >
                {selectedBooking.company.name}
              </h1>
              <p
                className={`${openSans.className} max-w-[32rem] text-[14px] leading-5 text-black/55`}
              >
                {`Manage your booking with ${selectedBooking.company.name}. You can review details, update the booking date, or delete this interview session.`}
              </p>
            </div>

            <BookingCalendarPreview bookingDate={selectedBooking.bookingDate} />
          </div>

          <div className="flex flex-col gap-4 xl:self-start">
            <div className="rounded-[24px] border border-[#efe6dc] bg-white/85 p-4 shadow-[0_20px_45px_rgba(160,125,83,0.08)] sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className={`${openSans.className} text-[12px] font-semibold uppercase tracking-[0.16em] text-[#ab7a48]`}>
                    Booking summary
                  </p>
                  <h2 className={`${outfit.className} mt-1 text-[28px] text-[#111111]`}>
                    Manage bookings
                  </h2>
                </div>
                <span className={`${openSans.className} rounded-full bg-[#fff4ea] px-3 py-1 text-[13px] font-semibold text-[#c97825]`}>
                  {bookingItems.length} / {MAX_ACTIVE_BOOKINGS} used
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <SummaryStat
                  label="Used slots"
                  value={`${bookingItems.length}/${MAX_ACTIVE_BOOKINGS}`}
                />
                <SummaryStat label="Remaining" value={`${remainingSlots}`} />
              </div>

              <div className="mt-5 rounded-[18px] border border-[#f1ece5] bg-[#faf9f7] px-4 py-3">
                <SummaryRow label="Selected" value={selectedBooking.company.name} />
                <SummaryRow label="Status" value="Interview booked" />
                <SummaryRow
                  label="Date"
                  value={formatBookingDate(selectedBooking.bookingDate, {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                />
                <SummaryRow label="Website" value={getWebsiteHost(selectedBooking.company.website)} />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href="/find-jobs"
                  className={`${openSans.className} rounded-full bg-[#dd7f21] px-4 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#c56f1f]`}
                >
                  Find jobs
                </Link>
                <a
                  href={selectedBooking.company.website}
                  target="_blank"
                  rel="noreferrer"
                  className={`${openSans.className} rounded-full border border-[#e6c9aa] bg-white px-4 py-2.5 text-[14px] font-bold text-[#b06f2c] transition-colors hover:bg-[#fff4ea]`}
                >
                  Visit website
                </a>
                <button
                  type="button"
                  onClick={handleOpenEditBooking}
                  className={`${openSans.className} rounded-full border border-[#b8d3f1] bg-white px-4 py-2.5 text-[14px] font-bold text-[#2c7bc9] transition-colors hover:bg-[#eef6ff]`}
                >
                  Edit booking
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSelectedBooking}
                  disabled={isDeleting}
                  className={`${openSans.className} rounded-full border border-[#e5b5b5] bg-white px-4 py-2.5 text-[14px] font-bold text-[#b44545] transition-colors hover:bg-[#fff3f3] disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  {isDeleting ? "Deleting..." : "Delete booking"}
                </button>
              </div>
            </div>

            {visibleBookingCards.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {visibleBookingCards.map((booking) => (
                  <BookingSummaryCard
                    key={booking._id}
                    booking={booking}
                    isActive={booking._id === selectedBooking._id}
                    onSelect={() => setSelectedBookingId(booking._id)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <Dialog
        open={!!editingBooking}
        onOpenChange={(open) => {
          if (!open) {
            setEditingBooking(null);
            setUpdateError("");
          }
        }}
      >
        <DialogContent className="max-w-[420px] rounded-[24px] border border-[#efe6dc] bg-white p-0">
          <DialogHeader className="px-6 pb-0 pt-6">
            <DialogTitle className="text-[22px] font-bold text-[#1f1f21]">
              Edit Booking Date
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 py-4">
            <p className="mb-3 text-[14px] text-black/55">
              Update your booking date for{" "}
              <span className="font-semibold text-[#252525]">
                {editingBooking?.company.name ?? ""}
              </span>
              .
            </p>
            <div className="rounded-[22px] border border-[#ece6df] bg-[linear-gradient(180deg,#fffdfa_0%,#f6f9ff_100%)] p-3 shadow-[0_18px_48px_rgba(190,155,113,0.08)]">
              <Calendar
                mode="single"
                selected={selectedEditDate}
                onSelect={(date) => {
                  if (date && isAllowedBookingDate(date)) {
                    setSelectedEditDate(date);
                  }
                }}
                defaultMonth={BOOKING_START_DATE}
                month={BOOKING_START_DATE}
                disabled={(date) => !isAllowedBookingDate(date)}
                className="w-full rounded-[20px] bg-white/75 p-2 [--cell-size:--spacing(8)]"
              />
            </div>
            {updateError ? (
              <p className="mt-3 text-[13px] font-medium text-[#a33a3a]">
                {updateError}
              </p>
            ) : null}
          </div>
          <div className="flex justify-between rounded-b-[24px] border-t border-[#efe6dc] bg-[#fcfbf8] px-6 py-4">
            <button
              type="button"
              onClick={() => {
                setEditingBooking(null);
                setUpdateError("");
              }}
              className="rounded-full border border-[#e6c9aa] bg-white px-4 py-2.5 text-[14px] font-bold text-[#b06f2c] transition-colors hover:bg-[#fff4ea]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdateSelectedBooking}
              disabled={isUpdating || !selectedEditDate}
              className="rounded-full bg-[#dd7f21] px-4 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#c56f1f] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
