"use client";

import type { ReactNode } from "react";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import ReduxProvider from "@/redux/ReduxProvider";

export default function NextAuthProvider({
  children,
  session,
}: Readonly<{
  children: ReactNode;
  session: Session | null;
}>) {
  return (
    <SessionProvider session={session}>
      <ReduxProvider>{children}</ReduxProvider>
    </SessionProvider>
  );
}
