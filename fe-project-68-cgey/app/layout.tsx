import type { Metadata } from "next";

import { geistMono, geistSans } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Website",
  description: "Job fair database for finding jobs, employers, and hiring events.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full w-full antialiased`}
    >
      <body className="flex min-h-dvh w-full flex-col bg-white text-black">
        {children}
      </body>
    </html>
  );
}
