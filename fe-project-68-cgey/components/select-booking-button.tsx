"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import InlineStatus from "@/components/inline-status";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BOOKING_START_DATE,
  MAX_BOOKINGS_ERROR,
  BOOKING_WINDOW_LABEL,
  isAllowedBookingDate,
  normalizeBookingDate,
} from "@/lib/booking-rules";

type SelectBookingButtonProps = {
  companyId: string;
  companyName: string;
  isAuthenticated: boolean;
  initiallySelected?: boolean;
};

type BookingApiResponse = {
  success?: boolean;
  error?: string;
};

function formatDisplayDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function SelectBookingButton({
  companyId,
  companyName,
  isAuthenticated,
  initiallySelected = false,
}: SelectBookingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSelected, setHasSelected] = useState(initiallySelected);
  const [status, setStatus] = useState<{
    tone: "error" | "success";
    message: string;
  } | null>(null);
  const defaultSelectedDate = useMemo(() => BOOKING_START_DATE, []);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    defaultSelectedDate,
  );

  useEffect(() => {
    if (initiallySelected) {
      setHasSelected(true);
    }
  }, [initiallySelected]);

  async function handleSelect() {
    if (!selectedDate || !isAllowedBookingDate(selectedDate)) {
      setStatus({
        tone: "error",
        message: `Please choose a booking date between ${BOOKING_WINDOW_LABEL}.`,
      });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch(`/api/companies/${companyId}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingDate: normalizeBookingDate(selectedDate),
        }),
      });

      const payload = (await response.json()) as BookingApiResponse;

      if (!response.ok || payload.success === false) {
        const errorMessage =
          payload.error ?? "Unable to select this company right now.";

        setStatus({
          tone: "error",
          message:
            errorMessage === MAX_BOOKINGS_ERROR
              ? MAX_BOOKINGS_ERROR
              : errorMessage,
        });
        return;
      }

      setHasSelected(true);
      setIsOpen(false);
      setStatus({
        tone: "success",
        message: `${companyName} has been added to your bookings for ${formatDisplayDate(selectedDate)}.`,
      });
    } catch {
      setStatus({
        tone: "error",
        message: "Unable to reach the booking service.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className="flex h-[32px] items-center justify-center whitespace-nowrap rounded-full bg-[#dd7f21] px-3 text-[12px] font-bold text-white transition-colors hover:bg-[#c56f1f]"
      >
        Login to select
      </Link>
    );
  }

  return (
    <div className="space-y-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger className="flex h-[32px] items-center justify-center whitespace-nowrap rounded-full bg-[#dd7f21] px-3 text-[12px] font-bold text-white transition-colors hover:bg-[#c56f1f] disabled:cursor-not-allowed disabled:bg-[#ebb07a]" disabled={isSubmitting || hasSelected}>
          {hasSelected ? "Selected" : isSubmitting ? "Selecting..." : "Select"}
        </DialogTrigger>

        <DialogContent className="max-w-[420px] rounded-[24px] border border-[#efe6dc] bg-white p-0">
          <DialogHeader className="px-6 pb-0 pt-6">
            <DialogTitle className="text-[22px] font-bold text-[#1f1f21]">
              Select booking date
            </DialogTitle>
            <DialogDescription className="text-[14px] leading-6 text-black/55">
              Choose an interview date for {companyName}. Available dates are {BOOKING_WINDOW_LABEL}.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4">
            <div className="rounded-[22px] border border-[#ece6df] bg-[linear-gradient(180deg,#fffdfa_0%,#f6f9ff_100%)] p-3 shadow-[0_18px_48px_rgba(190,155,113,0.08)]">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date && isAllowedBookingDate(date)) {
                    setSelectedDate(date);
                  }
                }}
                defaultMonth={BOOKING_START_DATE}
                month={BOOKING_START_DATE}
                disabled={(date) => !isAllowedBookingDate(date)}
                className="w-full rounded-[20px] bg-white/75 p-2 [--cell-size:--spacing(8)]"
              />
            </div>
            {selectedDate ? (
              <p className="mt-3 text-[14px] font-medium text-[#5b5146]">
                Selected: {formatDisplayDate(selectedDate)}
              </p>
            ) : null}
          </div>

          <DialogFooter className="mx-0 mb-0 rounded-b-[24px] border-t border-[#efe6dc] bg-[#fcfbf8] px-6 py-4 sm:justify-between">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-[#e6c9aa] bg-white px-4 py-2.5 text-[14px] font-bold text-[#b06f2c] transition-colors hover:bg-[#fff4ea]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSelect}
              disabled={isSubmitting || !selectedDate}
              className="rounded-full bg-[#dd7f21] px-4 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#c56f1f] disabled:cursor-not-allowed disabled:bg-[#ebb07a]"
            >
              {isSubmitting ? "Booking..." : "Confirm booking"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {status ? (
        <InlineStatus
          message={status.message}
          tone={status.tone}
          className="text-[13px]"
        />
      ) : null}
    </div>
  );
}
