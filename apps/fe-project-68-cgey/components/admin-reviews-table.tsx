"use client";

import { useState } from "react";

import ConfirmActionDialog from "@/components/confirm-action-dialog";
import InlineStatus from "@/components/inline-status";

export type AdminReview = {
  _id: string;
  rating: number;
  comment: string;
  user: {
    _id: string;
    name: string;
  };
  company: {
    _id: string;
    name: string;
  };
  createdAt: string;
};

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-4 w-4 ${filled ? "text-[#f0c932]" : "text-[#e5e7eb]"}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

export default function AdminReviewsTable({
  initialReviews,
}: {
  initialReviews: AdminReview[];
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [reviewToDelete, setReviewToDelete] = useState<AdminReview | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [status, setStatus] = useState<{
    tone: "error" | "success";
    message: string;
  } | null>(null);

  async function handleDelete() {
    if (!reviewToDelete) {
      return;
    }

    setIsDeleting(true);
    setStatus(null);

    try {
      const res = await fetch(`/api/reviews/${reviewToDelete._id}`, { method: "DELETE" });
      const payload = await res.json();
      if (!res.ok || payload.success === false) {
        setStatus({
          tone: "error",
          message: payload.error || "Failed to delete review.",
        });
      } else {
        setReviews((prev) =>
          prev.filter((review) => review._id !== reviewToDelete._id),
        );
        setReviewToDelete(null);
        setStatus({
          tone: "success",
          message: "Review deleted successfully.",
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
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Company</th>
              <th className="px-5 py-3">Rating</th>
              <th className="px-5 py-3">Comment</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-black/40">
                  No reviews found.
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr
                  key={review._id}
                  className="border-b border-[#f0f0f0] transition-colors last:border-b-0 hover:bg-[#fdf9f5]"
                >
                  <td className="px-5 py-3 font-medium text-[#252525]">
                    {review.user?.name || "Anonymous"}
                  </td>
                  <td className="px-5 py-3 text-[#4a4a4a]">
                    {review.company?.name || "N/A"}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <StarIcon key={idx} filled={idx < review.rating} />
                      ))}
                    </div>
                  </td>
                  <td className="max-w-[300px] px-5 py-3 text-[#4a4a4a]">
                    <p className="line-clamp-2">{review.comment || "—"}</p>
                  </td>
                  <td className="px-5 py-3 text-[#4a4a4a]">
                    {formatDate(review.createdAt)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => {
                        setReviewToDelete(review);
                        setStatus(null);
                      }}
                      className="rounded-full bg-[#dc3545] px-3 py-1 text-[12px] font-bold text-white transition-colors hover:bg-[#b02a37]"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmActionDialog
        open={!!reviewToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setReviewToDelete(null);
          }
        }}
        title="Delete review?"
        description={
          reviewToDelete
            ? `This will permanently remove the review from ${reviewToDelete.user?.name || "Anonymous"} for ${reviewToDelete.company?.name || "this company"}.`
            : ""
        }
        confirmLabel="Delete review"
        tone="danger"
        isSubmitting={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
