import { fallbackVenues, normalizeVenueByIdJson, type VenueByIdJson } from "./venueData";

const VENUE_DETAIL_ENDPOINTS = [
  "https://a08-venue-explorer-backend.vercel.app/api/v1/venues",
  "https://a08-venue-explorer-backend-2.vercel.app/api/v1/venues",
  "https://a08-venue-explorer-backend-3.vercel.app/api/v1/venues",
];

export default async function getVenue(vid: string): Promise<VenueByIdJson> {
  for (const endpoint of VENUE_DETAIL_ENDPOINTS) {
    try {
      const response = await fetch(`${endpoint}/${vid}`, { cache: "no-store" });

      if (!response.ok) {
        continue;
      }

      const venueJson = (await response.json()) as VenueByIdJson;
      return normalizeVenueByIdJson(venueJson);
    } catch {
      continue;
    }
  }

  const fallbackVenue = fallbackVenues.find(
    (venue) => venue.id === vid || venue._id === vid
  );

  if (!fallbackVenue) {
    throw new Error(`Venue with id ${vid} was not found.`);
  }

  return {
    success: true,
    data: fallbackVenue,
  };
}
