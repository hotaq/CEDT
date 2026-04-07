import Link from "next/link";

import HeaderAuthActions from "@/components/header-auth-actions";
import { getCurrentUser, type CurrentUser } from "@/lib/auth";
import { openSans } from "@/lib/fonts";

type SiteHeaderProps = {
  activePath: "/" | "/find-jobs" | "/my-bookings" | "/dashboard";
  currentUser?: CurrentUser | null;
  headerClassName?: string;
  navClassName?: string;
};

const headerShell =
  "mx-auto relative h-[70px] w-full max-w-[1512px] px-6 sm:px-8 lg:px-10";

const defaultNavClassName =
  "absolute left-1/2 top-[23px] hidden h-[25px] -translate-x-1/2 items-center gap-8 md:flex";

function getNavLinkClass(active: boolean): string {
  return active
    ? "text-[18px] font-bold leading-[1.4] text-[#d37624] transition-colors hover:text-[#c56f1f]"
    : "text-[18px] font-bold leading-[1.4] text-black/60 transition-colors hover:text-black";
}

export default async function SiteHeader({
  activePath,
  currentUser: initialCurrentUser,
  headerClassName = "fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur-sm shadow-[0_6px_20px_rgba(0,0,0,0.12)]] border border-[#e8e8e8]",
  navClassName = defaultNavClassName,
}: SiteHeaderProps) {
  const currentUser =
    initialCurrentUser === undefined ? await getCurrentUser() : initialCurrentUser;

  return (
    <header className={headerClassName}>
      <div className={headerShell}>
        <div
          className={`${openSans.className} absolute left-6 top-[11px] flex h-10 items-center gap-[14px] sm:left-8 lg:left-10`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d37624] text-[20px] font-bold leading-[1.4] text-white">
            JF
          </div>
          <span className="text-[20px] font-bold leading-[1.4] text-[#d37624]/90">
            Job Fair by CGey
          </span>
        </div>

        <nav className={`${openSans.className} ${navClassName}`}>
          <Link href="/" className={getNavLinkClass(activePath === "/")}>
            Home
          </Link>
          <Link
            href="/find-jobs"
            className={getNavLinkClass(activePath === "/find-jobs")}
          >
            Find Jobs
          </Link>
          <Link
            href="/my-bookings"
            className={getNavLinkClass(activePath === "/my-bookings")}
          >
            My Bookings
          </Link>
          {currentUser?.role === "admin" ? (
            <Link
              href="/dashboard"
              className={getNavLinkClass(activePath === "/dashboard")}
            >
              Dashboard
            </Link>
          ) : null}
        </nav>

        <HeaderAuthActions
          currentUser={currentUser}
          className={`${openSans.className} absolute right-6 top-[11px] flex h-[38px] w-[400px] items-center gap-2 sm:right-8 lg:right-10`}
        />
      </div>
    </header>
  );
}
