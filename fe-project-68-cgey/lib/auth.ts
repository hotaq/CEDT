import { cache } from "react";

import { buildBackendUrl, getAuthToken } from "@/lib/backend";

export type CurrentUser = {
  _id: string;
  name: string;
  email: string;
  telephone: string;
  role: "user" | "admin";
};

type GetMeResponse = {
  success?: boolean;
  data?: CurrentUser;
};

const getCurrentUserByToken = cache(
  async (token: string | null): Promise<CurrentUser | null> => {
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(buildBackendUrl("/getme"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as GetMeResponse;
      return payload.data ?? null;
    } catch {
      return null;
    }
  },
);

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = await getAuthToken();

  return getCurrentUserByToken(token);
}
