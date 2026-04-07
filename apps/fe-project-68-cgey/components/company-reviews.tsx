"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import ConfirmActionDialog from "@/components/confirm-action-dialog";
import InlineStatus from "@/components/inline-status";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Review = {
  _id: string;
  rating: number;
  comment: string;
  user: {
    _id: string;
    name: string;
  };
  company: string;
  createdAt: string;
};

type ReviewsResponse = {
  success: boolean;
  count: number;
  data: Review[];
};

type CompanyReviewsProps = {
  companyId: string;
  companyName: string;
  isAuthenticated: boolean;
  currentUserId?: string;
};

type StatusState = {
  tone: "error" | "success";
  message: string;
};

function StarIcon({ filled, onClick }: { filled: boolean; onClick?: () => void }) {
  return (
    <svg
      aria-hidden="true"
      onClick={onClick}
      className={`h-5 w-5 ${onClick ? "cursor-pointer transition-transform hover:scale-110" : ""} ${
        filled ? "text-[#f0c932]" : "text-[#e5e7eb]"
      }`}
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

export default function CompanyReviews({
  companyId,
  companyName,
  isAuthenticated,
  currentUserId,
}: CompanyReviewsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"list" | "form">("list");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState<StatusState | null>(null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  function resetReviewForm() {
    setEditingReviewId(null);
    setRating(0);
    setComment("");
    setFormError("");
  }

  function handleDialogOpenChange(open: boolean) {
    setIsOpen(open);
    setReviewToDelete(null);
    setStatus(null);

    if (open) {
      setView("list");
      resetReviewForm();
      return;
    }

    resetReviewForm();
  }

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    setListError("");
    try {
      const response = await fetch(`/api/companies/${companyId}/reviews`);
      const payload = (await response.json()) as ReviewsResponse;
      if (!response.ok || payload.success === false) {
        setListError("Failed to load reviews.");
      } else {
        setReviews(payload.data || []);
      }
    } catch {
      setListError("Unable to reach the server.");
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (isOpen && view === "list") {
      void fetchReviews();
    }
  }, [fetchReviews, isOpen, view]);

  async function handleSubmitReview(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) {
      setFormError("Please select a rating.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    setStatus(null);

    try {
      const url = editingReviewId
        ? `/api/reviews/${editingReviewId}`
        : `/api/companies/${companyId}/reviews`;
      const method = editingReviewId ? "PUT" : "POST";
      const successMessage = editingReviewId
        ? "Review updated successfully."
        : "Review submitted successfully.";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      const payload = await response.json();

      if (!response.ok || payload.success === false) {
        setFormError(payload.error || "Failed to save review.");
      } else {
        await fetchReviews();
        resetReviewForm();
        setView("list");
        setStatus({
          tone: "success",
          message: successMessage,
        });
      }
    } catch {
      setFormError("Unable to reach the server.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteReview() {
    if (!reviewToDelete) {
      return;
    }

    setIsDeleting(true);
    setStatus(null);
    try {
      const response = await fetch(`/api/reviews/${reviewToDelete._id}`, {
        method: "DELETE",
      });
      const payload = await response.json();
      if (!response.ok || payload.success === false) {
        setStatus({
          tone: "error",
          message: payload.error || "Failed to delete review.",
        });
      } else {
        await fetchReviews();
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

  function handleOpenForm(review?: Review) {
    setStatus(null);
    setListError("");

    if (review) {
      setEditingReviewId(review._id);
      setRating(review.rating);
      setComment(review.comment || "");
    } else {
      resetReviewForm();
    }
    setFormError("");
    setView("form");
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger className="flex h-[32px] items-center justify-center whitespace-nowrap rounded-full border-2 border-[#dd7f21] px-3 text-[12px] font-bold text-[#dd7f21] transition-colors hover:bg-[#fff4ea]">
          Reviews
        </DialogTrigger>

        <DialogContent className="flex max-h-[85vh] w-full max-w-[500px] flex-col overflow-hidden rounded-[24px] border border-[#efe6dc] bg-white p-0">
          <DialogHeader className="shrink-0 border-b border-[#efe6dc] px-6 py-5">
            <DialogTitle className="text-[22px] font-bold text-[#1f1f21]">
              {view === "list"
                ? `Reviews for ${companyName}`
                : editingReviewId
                  ? "Edit Review"
                  : "Write a Review"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {status ? (
              <InlineStatus
                message={status.message}
                tone={status.tone}
                className="mb-5"
              />
            ) : null}

            {view === "list" ? (
              <div className="space-y-6">
                {isLoading ? (
                  <p className="py-8 text-center text-black/50">Loading reviews...</p>
                ) : listError ? (
                  <p className="py-8 text-center text-[#a33a3a]">{listError}</p>
                ) : reviews.length === 0 ? (
                  <p className="py-8 text-center text-black/50">
                    No reviews yet for this company.
                  </p>
                ) : (
                  <div className="space-y-6 divide-y divide-[#efe6dc]">
                    {reviews.map((review, i) => (
                      <div key={review._id} className={i > 0 ? "pt-6" : ""}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-[#252525]">
                              {review.user?.name || "Anonymous"}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, idx) => (
                                  <StarIcon key={idx} filled={idx < review.rating} />
                                ))}
                              </div>
                              <span className="text-[13px] text-black/40">
                                {formatDate(review.createdAt)}
                              </span>
                            </div>
                          </div>
                          {currentUserId === review.user?._id ? (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleOpenForm(review)}
                                className="text-[13px] font-semibold text-[#2c7bc9] hover:text-[#1a5b9c]"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setReviewToDelete(review);
                                  setStatus(null);
                                }}
                                className="text-[13px] font-semibold text-[#a33a3a] hover:text-[#7d2c2c]"
                              >
                                Delete
                              </button>
                            </div>
                          ) : null}
                        </div>
                        {review.comment ? (
                          <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a4a]">
                            {review.comment}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <form id="review-form" onSubmit={handleSubmitReview} className="space-y-5">
                {formError ? (
                  <InlineStatus message={formError} tone="error" />
                ) : null}
                <div className="space-y-2">
                  <label className="text-[16px] font-semibold text-[#252525]">Rating</label>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <StarIcon
                        key={idx}
                        filled={idx < rating}
                        onClick={() => setRating(idx + 1)}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[16px] font-semibold text-[#252525]">
                    Comment (Optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share details of your experience at this company"
                    className="min-h-[120px] w-full resize-y rounded-[14px] border border-[#bcc7ff] p-4 text-base text-[#2d2948] outline-none transition-shadow placeholder:text-[#b4b7c6] focus:shadow-[0_0_0_3px_rgba(188,199,255,0.22)]"
                  />
                </div>
              </form>
            )}
          </div>

          <div className="flex shrink-0 items-center justify-between border-t border-[#efe6dc] bg-[#fcfbf8] px-6 py-4">
            {view === "list" ? (
              <>
                <button
                  onClick={() => handleOpenForm()}
                  className="rounded-full bg-[#dd7f21] px-5 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#c56f1f]"
                >
                  Write a Review
                </button>
                <button
                  onClick={() => handleDialogOpenChange(false)}
                  className="rounded-full border border-[#e6c9aa] bg-white px-5 py-2.5 text-[14px] font-bold text-[#b06f2c] transition-colors hover:bg-[#fff4ea]"
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    resetReviewForm();
                    setView("list");
                  }}
                  className="rounded-full border border-[#e6c9aa] bg-white px-5 py-2.5 text-[14px] font-bold text-[#b06f2c] transition-colors hover:bg-[#fff4ea]"
                >
                  Cancel
                </button>
                <button
                  form="review-form"
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-[#dd7f21] px-5 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#c56f1f] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Saving..." : "Submit Review"}
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
            ? `This will permanently remove your review for ${companyName}.`
            : ""
        }
        confirmLabel="Delete review"
        tone="danger"
        isSubmitting={isDeleting}
        onConfirm={handleDeleteReview}
      />
    </>
  );
}
