import { NextResponse } from "next/server";
import { buildBackendUrl, getAuthToken } from "@/lib/backend";
import { PUBLIC_REVIEWS_REVALIDATE_SECONDS } from "@/lib/backend-config";

type RouteContext = {
  params: Promise<{
    companyId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { companyId } = await context.params;

    const backendResponse = await fetch(
      buildBackendUrl(`/companies/${companyId}/reviews`),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: PUBLIC_REVIEWS_REVALIDATE_SECONDS },
      },
    );

    const payload = await backendResponse.json();

    return NextResponse.json(payload, {
      status: backendResponse.status,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Unable to reach the review service.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Please sign in before leaving a review." },
      { status: 401 },
    );
  }

  try {
    const { companyId } = await context.params;
    const body = await request.json();

    const backendResponse = await fetch(
      buildBackendUrl(`/companies/${companyId}/reviews`),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );

    const payload = await backendResponse.json();

    return NextResponse.json(payload, {
      status: backendResponse.status,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Unable to reach the review service.",
      },
      { status: 500 },
    );
  }
}
