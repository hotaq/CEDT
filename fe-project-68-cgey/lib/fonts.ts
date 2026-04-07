import { Geist, Geist_Mono, Open_Sans, Outfit } from "next/font/google";

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const outfit = Outfit({
  subsets: ["latin"],
  weight: ["700"],
});
