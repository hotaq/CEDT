import type { VenueItem, VenueJson } from "../../interface";

export interface VenueByIdJson {
  success: boolean;
  data: VenueItem;
}

const fallbackPictureMap: Record<string, string> = {
  "The Bloom Pavilion": "/img/bloom.jpg",
  "Spark Space": "/img/sparkspace.jpg",
  "The Grand Table": "/img/grandtable.jpg",
};

function isBlockedRemoteImageUrl(picture: string | undefined): boolean {
  if (!picture) {
    return false;
  }

  try {
    const url = new URL(picture);
    return (
      url.hostname === "drive.google.com" ||
      url.hostname === "lh3.googleusercontent.com"
    );
  } catch {
    return false;
  }
}

export const fallbackVenues: VenueItem[] = [
  {
    _id: "67d044e0c0062950a985c509",
    id: "67d044e0c0062950a985c509",
    name: "The Bloom Pavilion",
    address: "36 Phahon Yothin Road",
    district: "Chatuchak",
    province: "Bangkok",
    postalcode: "10900",
    tel: "024435595",
    picture: "/img/bloom.jpg",
    dailyrate: 55000,
    __v: 0,
  },
  {
    _id: "67d04663c0062950a985c50c",
    id: "67d04663c0062950a985c50c",
    name: "Spark Space",
    address: "88 Ratchadaphisek Road",
    district: "Huai Khwang",
    province: "Bangkok",
    postalcode: "10310",
    tel: "021234567",
    picture: "/img/sparkspace.jpg",
    dailyrate: 42000,
    __v: 0,
  },
  {
    _id: "67d047cec0062950a985c50f",
    id: "67d047cec0062950a985c50f",
    name: "The Grand Table",
    address: "99 Sukhumvit Road",
    district: "Watthana",
    province: "Bangkok",
    postalcode: "10110",
    tel: "029876543",
    picture: "/img/grandtable.jpg",
    dailyrate: 68000,
    __v: 0,
  },
];

export const fallbackVenueJson: VenueJson = {
  success: true,
  count: fallbackVenues.length,
  pagination: {},
  data: fallbackVenues,
};

export function normalizeVenueItem(
  item: Partial<VenueItem> | undefined
): VenueItem {
  const id = item?.id ?? item?._id ?? "";
  const name = item?.name ?? "";
  const fallbackPicture = fallbackPictureMap[name] ?? "/img/cover.jpg";

  return {
    _id: item?._id ?? id,
    id,
    name,
    address: item?.address ?? "",
    district: item?.district ?? "",
    province: item?.province ?? "",
    postalcode: item?.postalcode ?? "",
    tel: item?.tel ?? "",
    picture:
      item?.picture && !isBlockedRemoteImageUrl(item.picture)
        ? item.picture
        : fallbackPicture,
    dailyrate: typeof item?.dailyrate === "number" ? item.dailyrate : 0,
    __v: typeof item?.__v === "number" ? item.__v : 0,
  };
}

export function normalizeVenueJson(raw: Partial<VenueJson> | undefined): VenueJson {
  const data = Array.isArray(raw?.data)
    ? raw.data.map((venue) => normalizeVenueItem(venue))
    : fallbackVenues;

  return {
    success: raw?.success ?? true,
    count: typeof raw?.count === "number" ? raw.count : data.length,
    pagination: raw?.pagination ?? {},
    data,
  };
}

export function normalizeVenueByIdJson(
  raw: { success?: boolean; data?: Partial<VenueItem> } | undefined
): VenueByIdJson {
  return {
    success: raw?.success ?? true,
    data: normalizeVenueItem(raw?.data),
  };
}
