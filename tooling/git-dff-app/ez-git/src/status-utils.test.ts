import { describe, expect, it } from "vitest";
import { filterStatusEntries, groupStatusEntries } from "./status-utils";

const entries = [
  { pathDisplay: "src/App.vue", pathKey: "1" },
  { pathDisplay: "src/components/List.ts", pathKey: "2" },
  { pathDisplay: "README.md", pathKey: "3" }
];

describe("status utils", () => {
  it("filters entries by case-insensitive query", () => {
    const result = filterStatusEntries(entries, "src/");
    expect(result.map((entry) => entry.pathKey)).toEqual(["1", "2"]);
  });

  it("groups entries by directory", () => {
    const groups = groupStatusEntries(entries, "directory");
    expect(groups.map((group) => group.label)).toEqual([".", "src", "src/components"]);
    expect(groups[1]?.items.length).toBe(1);
  });
});
