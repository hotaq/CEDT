"use client";

import Link from "next/link";
import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

export default function SignOutPage() {
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      void signOut({ callbackUrl: "/" });
    }
  }, [status]);

  if (status === "loading") {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-3xl items-center justify-center px-6 py-12">
        <p className="text-sm text-gray-600">Checking session...</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-3xl items-center justify-center px-6 py-12">
        <section className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">Signed out</h1>
          <p className="mt-3 text-sm text-gray-600">
            Your session has already been cleared.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
          >
            Back to home
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-3xl items-center justify-center px-6 py-12">
      <section className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Signing out</h1>
        <p className="mt-3 text-sm text-gray-600">
          Please wait while your session is being closed.
        </p>
      </section>
    </main>
  );
}
