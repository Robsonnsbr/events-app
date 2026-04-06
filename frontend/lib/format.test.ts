import { describe, expect, it } from "vitest";
import { formatDate } from "./format";

describe("formatDate", () => {
  it("formats an ISO date string to pt-BR medium format", () => {
    const result = formatDate("2030-01-10T10:00:00.000Z");

    expect(result).toContain("jan.");
    expect(result).toContain("2030");
  });

  it("handles different date values", () => {
    const result = formatDate("2025-12-25T18:30:00.000Z");

    expect(result).toContain("dez.");
    expect(result).toContain("2025");
  });

  it("returns a string for valid input", () => {
    const result = formatDate("2030-06-15T14:00:00.000Z");

    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
