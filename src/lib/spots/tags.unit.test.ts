import { describe, expect, it } from "vitest";

import { parseSpotTags } from "@/lib/spots/tags";

describe("parseSpotTags", () => {
  it("lowercases and silently removes duplicate tags", () => {
    expect(parseSpotTags("Foo, foo, BAR, banana, bar")).toEqual(["foo", "bar", "banana"]);
  });

  it("ignores blank entries and keeps the first 12 unique tags", () => {
    expect(
      parseSpotTags("one, , two, three, four, five, six, seven, eight, nine, ten, eleven, twelve, thirteen"),
    ).toEqual(["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"]);
  });
});
