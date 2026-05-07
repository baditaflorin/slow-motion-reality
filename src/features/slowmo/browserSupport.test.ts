import { describe, expect, it } from "vitest";
import { formatBoolean } from "./browserSupport";

describe("formatBoolean", () => {
  it("uses compact support labels", () => {
    expect(formatBoolean(true)).toBe("ready");
    expect(formatBoolean(false)).toBe("missing");
  });
});
