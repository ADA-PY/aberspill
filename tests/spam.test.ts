import { describe, it, expect } from "vitest";
import { countLinks, hasSpamParams, hasSpammyTld, isSpammy, similarity } from "../utils/spam";

describe("spam utils", () => {
  it("counts links", () => {
    expect(countLinks("no links")).toBe(0);
    expect(countLinks("one http://a.com link")).toBe(1);
    expect(countLinks("two http://a.com and https://b.com")).toBe(2);
  });
  it("detects spam params", () => {
    expect(hasSpamParams("ok")).toBe(false);
    expect(hasSpamParams("http://x.com?ref=abc")).toBe(true);
    expect(hasSpamParams("utm_source=spam")).toBe(true);
  });
  it("detects spammy tlds", () => {
    expect(hasSpammyTld("http://nice.co.uk")).toBe(false);
    expect(hasSpammyTld("http://bad.xyz")).toBe(true);
    expect(hasSpammyTld("HTTPS://EVIL.TOP".toLowerCase())).toBe(true);
  });
  it("isSpammy aggregates rules", () => {
    expect(isSpammy("one link http://a.com is ok")).toBe(false);
    expect(isSpammy("two links http://a.com http://b.com")).toBe(true);
  });
  it("similarity high for similar strings", () => {
    expect(similarity("abcdef", "abcxef")).toBeGreaterThan(0.5);
    expect(similarity("abcdef", "uvw")).toBeLessThan(0.2);
  });
});
