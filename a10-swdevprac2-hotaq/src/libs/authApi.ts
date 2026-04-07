export const AUTH_API_BASE_URLS = [
  "https://a08-venue-explorer-backend.vercel.app/api/v1/auth",
  "https://a08-venue-explorer-backend-2.vercel.app/api/v1/auth",
  "https://a08-venue-explorer-backend-3.vercel.app/api/v1/auth",
];

export interface LoginResponse {
  success: boolean;
  _id: string;
  name: string;
  email: string;
  token: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  tel: string;
  role: string;
  createdAt: string;
  __v: number;
}

export interface UserProfileResponse {
  success: boolean;
  data: UserProfile;
}
