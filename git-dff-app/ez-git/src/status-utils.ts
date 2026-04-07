export interface StatusLikeEntry {
  pathDisplay: string;
  pathKey: string;
}

export function filterStatusEntries<T extends StatusLikeEntry>(list: T[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return list;
  }
  return list.filter((entry) => entry.pathDisplay.toLowerCase().includes(normalized));
}

export function groupStatusEntries<T extends StatusLikeEntry>(list: T[], mode: "flat" | "directory") {
  if (mode === "flat") {
    return [{ label: "All", items: list }];
  }
  const bucket = new Map<string, T[]>();
  for (const entry of list) {
    const lastSlash = entry.pathDisplay.lastIndexOf("/");
    const label = lastSlash === -1 ? "." : entry.pathDisplay.slice(0, lastSlash);
    const existing = bucket.get(label) ?? [];
    existing.push(entry);
    bucket.set(label, existing);
  }
  return [...bucket.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, items]) => ({ label, items }));
}
