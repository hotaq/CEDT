import AuthFormShell from "../auth-form-shell";

type LoginPageProps = {
  searchParams?: Promise<{
    registered?: string | string[];
  }>;
};

function normalizeValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const initialNotice =
    normalizeValue(resolvedSearchParams?.registered) === "1"
      ? "Account created successfully. Sign in to continue."
      : undefined;

  return <AuthFormShell mode="login" initialNotice={initialNotice} />;
}
