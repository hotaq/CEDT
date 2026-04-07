"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmActionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isSubmitting?: boolean;
  tone?: "danger" | "default";
};

export default function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  isSubmitting = false,
  tone = "default",
}: ConfirmActionDialogProps) {
  const confirmButtonClassName =
    tone === "danger"
      ? "rounded-full bg-[#dc3545] px-4 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#b02a37] disabled:cursor-not-allowed disabled:opacity-70"
      : "rounded-full bg-[#dd7f21] px-4 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#c56f1f] disabled:cursor-not-allowed disabled:opacity-70";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[420px] rounded-[24px] border border-[#efe6dc] bg-white p-0"
        showCloseButton={false}
      >
        <DialogHeader className="px-6 pb-0 pt-6">
          <DialogTitle className="text-[22px] font-bold text-[#1f1f21]">
            {title}
          </DialogTitle>
          <DialogDescription className="text-[14px] leading-6 text-black/55">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mx-0 mb-0 rounded-b-[24px] border-t border-[#efe6dc] bg-[#fcfbf8] px-6 py-4 sm:justify-between">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full border border-[#e6c9aa] bg-white px-4 py-2.5 text-[14px] font-bold text-[#b06f2c] transition-colors hover:bg-[#fff4ea]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={confirmButtonClassName}
          >
            {isSubmitting ? "Working..." : confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
