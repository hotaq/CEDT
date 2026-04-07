import { NextResponse } from "next/server";
import { buildBackendUrl, getAuthToken } from "@/lib/backend";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Please sign in to edit a review." },
      { status: 401 },
    );
  }

  try {
    const { id } = await context.params;
    const body = await request.json();

    const backendResponse = await fetch(
      buildBackendUrl(`/reviews/${id}`),
      {
        method: "PUT",
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

export async function DELETE(request: Request, context: RouteContext) {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Please sign in to delete a review." },
      { status: 401 },
    );
  }

  try {
    const { id } = await context.params;

    const backendResponse = await fetch(
      buildBackendUrl(`/reviews/${id}`),
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
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
