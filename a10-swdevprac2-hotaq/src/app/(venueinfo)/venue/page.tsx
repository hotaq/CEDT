import VenueCatalog from "@/components/VenueCatalog";
import getVenues from "@/libs/getVenues";

export default async function VenuePage() {
  const venuesJson = getVenues();

  return (
    <main>
      <VenueCatalog venuesJson={venuesJson} />
    </main>
  );
}
