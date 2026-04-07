import getVenue from "@/libs/getVenue";

export const dynamic = "force-dynamic";

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ vid: string }>;
}) {
  const resolvedParams = await params;
  const vid = resolvedParams.vid;

  try {
    const venueJson = await getVenue(vid);
    const venue = venueJson.data;

    return (
      <main className="mx-auto max-w-4xl space-y-6 p-6">
        <h1 className="text-4xl font-semibold">{venue.name}</h1>

        <img
          src={venue.picture}
          alt={venue.name}
          className="h-[420px] w-full rounded-2xl object-cover shadow-md"
        />

        <section className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Address
            </h2>
            <p className="mt-2 text-lg text-gray-900">{venue.address}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Province
            </h2>
            <p className="mt-2 text-lg text-gray-900">{venue.province}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Postal Code
            </h2>
            <p className="mt-2 text-lg text-gray-900">{venue.postalcode}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Daily Rate
            </h2>
            <p className="mt-2 text-lg text-gray-900">
              {venue.dailyrate.toLocaleString()} THB
            </p>
          </div>
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Contact
            </h2>
            <p className="mt-2 text-lg text-gray-900">{venue.tel}</p>
          </div>
        </section>
      </main>
    );
  } catch {
    return (
      <main className="text-center p-5">
        <h1 className="text-xl font-bold">Venue Not Found</h1>
        <p>Could not find a venue with ID: {vid}</p>
      </main>
    );
  }
}
