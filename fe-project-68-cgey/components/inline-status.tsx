import { cn } from "@/lib/utils";

type InlineStatusProps = {
  message: string;
  tone?: "error" | "success" | "info";
  className?: string;
};

export default function InlineStatus({
  message,
  tone = "info",
  className,
}: InlineStatusProps) {
  return (
    <div
      className={cn(
        "rounded-[14px] border px-4 py-3 text-sm font-medium",
        tone === "error" &&
          "border-[#f3cccc] bg-[#fff3f3] text-[#a33a3a]",
        tone === "success" &&
          "border-[#d8ead6] bg-[#f4fbf3] text-[#2f7a37]",
        tone === "info" &&
          "border-[#d7e6f7] bg-[#f3f8ff] text-[#2c5f94]",
        className,
      )}
    >
      {message}
    </div>
  );
}
