import { NextResponse } from "next/server";
import { buildBackendUrl, getAuthToken } from "@/lib/backend";

export async function GET() {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const backendResponse = await fetch(buildBackendUrl("/reviews"), {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const payload = await backendResponse.json();

    return NextResponse.json(payload, {
      status: backendResponse.status,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to reach the review service." },
      { status: 500 },
    );
  }
}
