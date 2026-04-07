"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "signup";

type AuthFormShellProps = {
  mode: AuthMode;
  initialNotice?: string;
};

type AuthApiResponse = {
  success?: boolean;
  error?: string;
  data?: {
    token?: string;
    user?: unknown;
  };
};

const shellCopy = {
  login: {
    cta: "Sign In",
    emailPlaceholder: "Enter Email",
    passwordPlaceholder: "Enter Password",
  },
  signup: {
    cta: "Create Account",
    emailPlaceholder: "Enter Email",
    passwordPlaceholder: "Enter Password",
  },
} satisfies Record<AuthMode, {
  cta: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
}>;

function CheckIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`mt-0.5 h-4 w-4 shrink-0 ${active ? "text-[#dd7f21]" : "text-[#b7c3ff]"}`}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.5 8.5L6.5 11.5L12.5 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-7 w-7"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M15.05 3.25C15.64 2.53 16.03 1.57 15.92 0.58C15.07 0.62 14.04 1.13 13.44 1.85C12.91 2.47 12.45 3.46 12.59 4.41C13.54 4.48 14.46 3.96 15.05 3.25Z" />
      <path d="M18.37 12.35C18.39 9.73 20.53 8.48 20.62 8.42C19.4 6.64 17.49 6.39 16.83 6.36C15.23 6.19 13.68 7.32 12.86 7.32C12.02 7.32 10.76 6.38 9.41 6.41C7.67 6.44 6.04 7.44 5.15 8.98C3.31 12.13 4.68 16.76 6.45 19.31C7.34 20.56 8.37 21.96 9.72 21.91C11.04 21.85 11.54 21.08 13.13 21.08C14.7 21.08 15.17 21.91 16.56 21.88C17.98 21.85 18.87 20.62 19.73 19.36C20.76 17.93 21.17 16.53 21.19 16.46C21.16 16.45 18.4 15.39 18.37 12.35Z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-7 w-7"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="2" width="9" height="9" fill="#F25022" />
      <rect x="13" y="2" width="9" height="9" fill="#7FBA00" />
      <rect x="2" y="13" width="9" height="9" fill="#00A4EF" />
      <rect x="13" y="13" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

function SocialButton({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-[72px] items-center justify-center rounded-[14px] border border-[#c6d0ff] bg-white transition-colors hover:bg-[#f8faff]"
    >
      {children}
    </button>
  );
}

export default function AuthFormShell({
  mode,
  initialNotice,
}: AuthFormShellProps) {
  const copy = shellCopy[mode];
  const isSignUp = mode === "signup";
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [telephone, setTelephone] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const normalizedPassword = password.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();
  const emailLocalPart = normalizedEmail.split("@")[0] ?? "";
  const excludesNameOrEmail =
    normalizedPassword.length === 0
      ? false
      : (!normalizedEmail || !normalizedPassword.includes(normalizedEmail)) &&
        (!emailLocalPart || !normalizedPassword.includes(emailLocalPart));
  const hasMinLength = password.length >= 8;
  const hasNumberOrSymbol = /[\d\W_]/.test(password);
  const passedRuleCount = [
    excludesNameOrEmail,
    hasMinLength,
    hasNumberOrSymbol,
  ].filter(Boolean).length;
  const passwordStrength =
    password.length === 0 ? "Weak" : passedRuleCount >= 3 ? "Strong" : passedRuleCount >= 2 ? "Good" : "Weak";
  const signupRules = [
    {
      label: `Password Strength : ${passwordStrength}`,
      passed: passwordStrength !== "Weak",
    },
    {
      label: "Cannot contain your name or email address",
      passed: excludesNameOrEmail,
    },
    {
      label: "At least 8 characters",
      passed: hasMinLength,
    },
    {
      label: "Contains a number or symbol",
      passed: hasNumberOrSymbol,
    },
  ];
  const showPasswordRules = isSignUp && password.length > 0;
  const pageTitle = isSignUp ? "Create your My Website account" : "Sign in to My Website";
  const [showPassword, setShowPassword] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(isSignUp ? "/api/auth/signup" : "/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isSignUp
            ? {
                name: name.trim(),
                telephone: telephone.trim(),
                email: email.trim(),
                password,
              }
            : {
                email: email.trim(),
                password,
              },
        ),
      });

      const payload = (await response.json()) as AuthApiResponse;

      if (!response.ok || payload.success === false) {
        setErrorMessage(payload.error ?? "Authentication failed.");
        return;
      }

      if (isSignUp) {
        setSuccessMessage("Account created successfully. Redirecting to sign in...");
        router.push("/login?registered=1");
        return;
      }

      setSuccessMessage("Signed in successfully. Redirecting...");
      router.push("/find-jobs");
      router.refresh();
    } catch {
      setErrorMessage("Unable to reach the authentication service.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-[720px] flex-1 flex-col justify-start pt-2 sm:pt-4 lg:pt-6">
      <nav
        aria-label="Authentication pages"
        className="flex w-full rounded-[15px] bg-[#edf0ff] p-1.5 shadow-[0_10px_20px_rgba(34,54,120,0.05)]"
      >
        {isSignUp ? (
          <span
            aria-current="page"
            className="flex h-[52px] flex-1 items-center justify-center rounded-[12px] bg-[#dd7f21] px-4 text-lg font-bold text-white shadow-[0_10px_18px_rgba(221,127,33,0.22)]"
          >
            Sign Up
          </span>
        ) : (
          <Link
            href="/signup"
            className="flex h-[52px] flex-1 items-center justify-center rounded-[12px] px-4 text-lg font-bold text-[#a0a5bd] transition-colors hover:text-[#dd7f21]"
          >
            Sign Up
          </Link>
        )}

        {isSignUp ? (
          <Link
            href="/login"
            className="flex h-[52px] flex-1 items-center justify-center rounded-[12px] px-4 text-lg font-bold text-[#a0a5bd] transition-colors hover:text-[#dd7f21]"
          >
            Sign In
          </Link>
        ) : (
          <span
            aria-current="page"
            className="flex h-[52px] flex-1 items-center justify-center rounded-[12px] bg-[#dd7f21] px-4 text-lg font-bold text-white shadow-[0_10px_18px_rgba(221,127,33,0.22)]"
          >
            Sign In
          </span>
        )}
      </nav>

      <form
        className={`mt-8 flex flex-1 flex-col ${isSignUp ? "justify-center" : "justify-start"}`}
        onSubmit={handleSubmit}
      >
        <h1 className="sr-only">{pageTitle}</h1>

        <div className="space-y-5">
          {initialNotice ? (
            <div className="rounded-[14px] border border-[#cfe8d2] bg-[#eff9f0] px-4 py-3 text-sm font-medium text-[#2f6b38]">
              {initialNotice}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-[14px] border border-[#cfe8d2] bg-[#eff9f0] px-4 py-3 text-sm font-medium text-[#2f6b38]">
              {successMessage}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-[14px] border border-[#f3cccc] bg-[#fff3f3] px-4 py-3 text-sm font-medium text-[#a33a3a]">
              {errorMessage}
            </div>
          ) : null}

          <label className="block space-y-2">
            <span className="text-[17px] font-semibold text-[#2d2948]">Email Id</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={copy.emailPlaceholder}
                required
                className="h-[54px] w-full rounded-[14px] border border-[#bcc7ff] px-4 text-base text-[#2d2948] outline-none transition-shadow placeholder:text-[#b4b7c6] focus:shadow-[0_0_0_3px_rgba(188,199,255,0.22)]"
              />
          </label>

          {isSignUp ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-[17px] font-semibold text-[#2d2948]">Telephone</span>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={telephone}
                  onChange={(event) => setTelephone(event.target.value)}
                  placeholder="Enter Telephone"
                  required
                  className="h-[54px] w-full rounded-[14px] border border-[#bcc7ff] px-4 text-base text-[#2d2948] outline-none transition-shadow placeholder:text-[#b4b7c6] focus:shadow-[0_0_0_3px_rgba(188,199,255,0.22)]"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-[17px] font-semibold text-[#2d2948]">Full Name</span>
                <input
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter Name"
                  required
                  className="h-[54px] w-full rounded-[14px] border border-[#bcc7ff] px-4 text-base text-[#2d2948] outline-none transition-shadow placeholder:text-[#b4b7c6] focus:shadow-[0_0_0_3px_rgba(188,199,255,0.22)]"
                />
              </label>
            </div>
          ) : null}

          <div className="space-y-3">
            <label className="block space-y-2">
              <span className="text-[17px] font-semibold text-[#2d2948]">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  placeholder={copy.passwordPlaceholder}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="h-[54px] w-full rounded-[14px] border border-[#bcc7ff] px-4 pr-12 text-base text-[#2d2948] outline-none transition-shadow placeholder:text-[#b4b7c6] focus:shadow-[0_0_0_3px_rgba(188,199,255,0.22)]"
                />

                {/* ปุ่มตา */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a0a5bd] hover:text-[#2d2948]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <div className="flex flex-col gap-3 text-sm text-[#474b63] sm:flex-row sm:justify-between sm:gap-6">
              <div className={showPasswordRules ? "space-y-2" : "hidden"}>
                {signupRules.map((item) => (
                  <div key={item.label} className="flex items-start gap-2.5 leading-6">
                    <CheckIcon active={item.passed} />
                    <span className={item.passed ? "text-[#2d2948]" : "text-[#6e738a]"}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {isSignUp ? (
                <Link
                  href="/login"
                  className="pt-0.5 text-left text-sm text-[#a6a0a0] underline underline-offset-2 transition-colors hover:text-[#7c7890] sm:text-right"
                >
                  Already have an account?
                </Link>
              ) : (
                <button
                  type="button"
                  className="pt-0.5 text-left text-sm text-[#a6a0a0] underline underline-offset-2 transition-colors hover:text-[#7c7890] sm:text-right"
                >
                  Forgot Password?
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 h-[76px] w-full rounded-[14px] bg-[#dd7f21] text-[20px] font-bold text-white transition-colors hover:bg-[#c9721e] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting
            ? isSignUp
              ? "Creating Account..."
              : "Signing In..."
            : copy.cta}
        </button>

        <div className="my-7 flex items-center gap-5 text-sm font-medium uppercase tracking-[0.18em] text-[#d1c9c9]">
          <span className="h-px flex-1 bg-[#ece7e7]" />
          <span>OR</span>
          <span className="h-px flex-1 bg-[#ece7e7]" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SocialButton label="Continue with Google">
            <span className="text-[2rem] font-bold leading-none text-[#4285F4]">G</span>
          </SocialButton>
          <SocialButton label="Continue with Apple">
            <span className="text-black">
              <AppleIcon />
            </span>
          </SocialButton>
          <SocialButton label="Continue with Microsoft">
            <MicrosoftIcon />
          </SocialButton>
        </div>
      </form>
    </div>
  );
}
