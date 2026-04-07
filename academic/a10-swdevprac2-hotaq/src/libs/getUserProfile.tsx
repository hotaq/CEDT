import {
  AUTH_API_BASE_URLS,
  type UserProfileResponse,
} from "./authApi";

export default async function getUserProfile(
  token: string
): Promise<UserProfileResponse> {
  let lastErrorMessage = "Unable to fetch the user profile.";

  for (const baseUrl of AUTH_API_BASE_URLS) {
    try {
      const response = await fetch(`${baseUrl}/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const responseJson = (await response.json()) as
        | UserProfileResponse
        | { message?: string };

      if (response.ok) {
        return responseJson as UserProfileResponse;
      }

      lastErrorMessage =
        "message" in responseJson && responseJson.message
          ? responseJson.message
          : lastErrorMessage;
    } catch {
      continue;
    }
  }

  throw new Error(lastErrorMessage);
}
