import type { VenueJson } from "../../interface";
import { fallbackVenueJson, normalizeVenueJson } from "./venueData";

const VENUE_ENDPOINTS = [
  "https://a08-venue-explorer-backend.vercel.app/api/v1/venues",
  "https://a08-venue-explorer-backend-2.vercel.app/api/v1/venues",
  "https://a08-venue-explorer-backend-3.vercel.app/api/v1/venues",
];

export default async function getVenues(): Promise<VenueJson> {
  for (const endpoint of VENUE_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, { cache: "no-store" });

      if (!response.ok) {
        continue;
      }

      const venuesJson = (await response.json()) as VenueJson;
      return normalizeVenueJson(venuesJson);
    } catch {
      continue;
    }
  }

  return fallbackVenueJson;
}
