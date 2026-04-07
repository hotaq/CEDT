"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("alice@eventplanner.com");
  const [password, setPassword] = useState("g00dD@y$");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setIsSubmitting(false);

    if (!result || result.error) {
      setErrorMessage("Invalid email or password.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-6xl items-center justify-center px-6 py-12">
      <section className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8 space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
            Account Access
          </p>
          <h1 className="text-3xl font-semibold text-gray-900">Sign in</h1>
          <p className="text-sm text-gray-600">
            Use your email and password to log in to Venue Explorer.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500"
              placeholder="alice@eventplanner.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>

          {errorMessage ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting ? "Signing in..." : "Sign-In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <Link href="/" className="font-medium text-gray-900 hover:underline">
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-6xl items-center justify-center px-6 py-12">
          <p className="text-sm text-gray-600">Loading sign-in form...</p>
        </main>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
