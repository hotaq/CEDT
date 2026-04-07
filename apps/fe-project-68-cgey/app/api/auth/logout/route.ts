import { NextResponse } from "next/server";
import { buildBackendUrl, getAuthToken } from "@/lib/backend";

export async function POST() {
  const token = await getAuthToken();

  if (token) {
    try {
      await fetch(buildBackendUrl("/logout"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
    } catch {
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("auth_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
