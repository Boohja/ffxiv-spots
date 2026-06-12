import { describe, expect, it } from "vitest";

import { parseSpotTags, validateSpotTags } from "@/lib/spots/tags";

describe("parseSpotTags", () => {
  it("lowercases and silently removes duplicate tags", () => {
    expect(parseSpotTags("Foo, foo, BAR, banana, bar")).toEqual(["foo", "bar", "banana"]);
  });

  it("ignores blank entries and keeps the first 12 unique tags", () => {
    expect(
      parseSpotTags("one, , two, three, four, five, six, seven, eight, nine, ten, eleven, twelve, thirteen"),
    ).toEqual(["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"]);
  });

  it("ignores overlong tags while validation reports them", () => {
    expect(parseSpotTags("short, this-tag-is-way-too-long-for-the-ui")).toEqual(["short"]);
    expect(validateSpotTags("short, this-tag-is-way-too-long-for-the-ui")).toBe(
      "Keep each tag to 24 characters or fewer.",
    );
  });

  it("validates the tag count before parsing trims the list", () => {
    expect(validateSpotTags("one,two,three,four,five,six,seven,eight,nine,ten,eleven,twelve,thirteen")).toBe(
      "Use at most 12 tags.",
    );
  });
});
