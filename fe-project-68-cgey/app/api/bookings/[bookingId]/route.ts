import { NextResponse } from "next/server";
import { buildBackendUrl, getAuthToken } from "@/lib/backend";

type RouteContext = {
  params: Promise<{
    bookingId: string;
  }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Please sign in before deleting a booking." },
      { status: 401 },
    );
  }

  try {
    const { bookingId } = await context.params;

    const backendResponse = await fetch(buildBackendUrl(`/bookings/${bookingId}`), {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const payload = await backendResponse.json();

    return NextResponse.json(payload, {
      status: backendResponse.status,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to reach the booking service." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Please sign in before updating a booking." },
      { status: 401 },
    );
  }

  try {
    const { bookingId } = await context.params;
    const body = await request.json();

    const backendResponse = await fetch(buildBackendUrl(`/bookings/${bookingId}`), {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const payload = await backendResponse.json();

    return NextResponse.json(payload, {
      status: backendResponse.status,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to reach the booking service." },
      { status: 500 },
    );
  }
}
