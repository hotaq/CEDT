"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type UserMenuProps = {
  name: string;
  id: string;
  email: string;
  telephone: string;

};

export default function UserMenu({ name, id, email, telephone }: UserMenuProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleLogout() {
    setErrorMessage("");
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        setErrorMessage("Logout failed. Please try again.");
        return;
      }

      setIsOpen(false);
      router.push("/");
      router.refresh();
    } catch {
      setErrorMessage("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex h-[38px] max-w-[300px] items-center gap-2 rounded-[50px] bg-[#fff4ea] px-4 text-[14px] font-bold leading-[1.4] text-[#d37624] transition-colors hover:bg-[#ffe9d6] lg:text-[16px]"
      >
        <span className="truncate">{name}</span>
        <svg
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-30 gap-2 mt-2 min-w-[300px] rounded-[16px] border border-[#f3d7bc] bg-white p-2 shadow-[0_14px_30px_rgba(140,92,45,0.18)]">
          <div className="px-3  text-xs font-semibold uppercase tracking-[0.12em] text-[#c48a56]">
            Account
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#c48a56] text-[11px]">
              ID: {id}
              <br />
              Email: {email}
              <br />
              Telephone: {telephone}
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center justify-between rounded-[12px] px-3 text-left text-[14px] font-semibold text-[#8f3b2e] transition-colors hover:bg-[#fff4ea] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </button>
          {errorMessage ? (
            <p className="px-3 pb-1 pt-2 text-xs font-medium text-[#b44545]">{errorMessage}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
