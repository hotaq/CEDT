import { NextResponse } from "next/server";

import { buildBackendUrl } from "@/lib/backend";

type LoginResponse = {
  success?: boolean;
  error?: string;
  data?: {
    token?: string;
    user?: unknown;
  };
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendResponse = await fetch(buildBackendUrl("/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const payload = (await backendResponse.json()) as LoginResponse;
    const response = NextResponse.json(payload, {
      status: backendResponse.status,
    });

    if (backendResponse.ok && payload.data?.token) {
      response.cookies.set("auth_token", payload.data.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
    }

    return response;
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Unable to reach the authentication service.",
      },
      { status: 500 },
    );
  }
}
