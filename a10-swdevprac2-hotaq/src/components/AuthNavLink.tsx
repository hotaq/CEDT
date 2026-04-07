"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function AuthNavLink() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="text-sm font-medium text-gray-400">Loading...</span>;
  }

  return (
    <Link
      href={session?.user ? "/signout" : "/signin"}
      className="text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-gray-900"
    >
      {session?.user ? "Sign-Out" : "Sign-In"}
    </Link>
  );
}
