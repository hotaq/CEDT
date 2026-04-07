import { NextResponse } from "next/server";

import { buildBackendUrl } from "@/lib/backend";

type SignupResponse = {
  success?: boolean;
  error?: string;
  data?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendResponse = await fetch(buildBackendUrl("/register"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const payload = (await backendResponse.json()) as SignupResponse;

    return NextResponse.json(payload, {
      status: backendResponse.status,
    });
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
