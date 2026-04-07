import "server-only";

import { cookies } from "next/headers";
import {
  buildBackendUrl,
  getBackendApiBaseUrl,
} from "@/lib/backend-config";

export const BACKEND_API_BASE_URL = getBackendApiBaseUrl();

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();

  return cookieStore.get("auth_token")?.value ?? null;
}

export { buildBackendUrl };
