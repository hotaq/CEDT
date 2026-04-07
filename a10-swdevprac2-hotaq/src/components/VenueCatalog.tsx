import Card from "@/components/Card";
import type { VenueItem, VenueJson } from "../../interface";

type VenueCatalogProps = {
  venuesJson: Promise<VenueJson>;
};

export default async function VenueCatalog({ venuesJson }: VenueCatalogProps) {
  const resolvedVenuesJson = await venuesJson;
  const venueItems: VenueItem[] = resolvedVenuesJson.data;

  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
      {venueItems.map((venue) => (
        <div
          key={venue.id}
          className="flex justify-center"
        >
          <Card vid={venue.id} venueName={venue.name} imgSrc={venue.picture} />
        </div>
      ))}
    </section>
  );
}
