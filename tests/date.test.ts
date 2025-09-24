import { describe, it, expect } from "vitest";
import dayjs from "../utils/date";

describe("date utils", () => {
  it("relative time works", () => {
    const fiveMinAgo = dayjs().subtract(5, "minute");
    expect(typeof fiveMinAgo.fromNow()).toBe("string");
  });
});
