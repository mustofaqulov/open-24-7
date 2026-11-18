import { describe, expect, it } from "vitest";
import { canReview } from "../src/lib/permissions";

describe("review permissions", () => {
  it("lets moderators resolve reports only", () => {
    expect(canReview("MODERATOR", "report")).toBe(true);
    expect(canReview("MODERATOR", "business")).toBe(false);
    expect(canReview("MODERATOR", "claim")).toBe(false);
  });
  it("reserves all verification decisions for administrators", () => {
    expect(canReview("ADMIN", "business")).toBe(true);
    expect(canReview("ADMIN", "claim")).toBe(true);
    expect(canReview("USER", "report")).toBe(false);
    expect(canReview("OWNER", "claim")).toBe(false);
  });
});
