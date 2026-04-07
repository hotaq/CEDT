import { AUTH_API_BASE_URLS, type LoginResponse } from "./authApi";

export default async function userLogIn(
  userEmail: string,
  userPassword: string
): Promise<LoginResponse> {
  let lastErrorMessage = "Unable to log in with the venue explorer backend.";

  for (const baseUrl of AUTH_API_BASE_URLS) {
    try {
      const response = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          password: userPassword,
        }),
        cache: "no-store",
      });

      const responseJson = (await response.json()) as
        | LoginResponse
        | { message?: string };

      if (response.ok) {
        return responseJson as LoginResponse;
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
