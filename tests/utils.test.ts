/**
 * Unit tests for lib/utils.ts
 * Tests the static tech-icon resolver (getTechLogos) and cn() helper.
 */
import { describe, it, expect } from "vitest";
import { cn, getTechLogos } from "@/lib/utils";

// ── cn() ─────────────────────────────────────────────────────────────────────

describe("cn()", () => {
  it("merges class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("deduplicates Tailwind classes (later wins)", () => {
    // tailwind-merge keeps the last conflicting utility
    const result = cn("p-2", "p-4");
    expect(result).toBe("p-4");
  });

  it("ignores falsy values", () => {
    expect(cn("foo", false, undefined, null, "bar")).toBe("foo bar");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });
});

// ── getTechLogos() ────────────────────────────────────────────────────────────
// Validates the static-map resolver introduced in Phase 3 (no runtime HEAD probes).

describe("getTechLogos()", () => {
  it("returns one entry per tech in the input array", async () => {
    const logos = await getTechLogos(["React", "TypeScript", "Node.js"]);
    expect(logos).toHaveLength(3);
  });

  it("resolves 'React' to a devicon CDN URL", async () => {
    const logos = await getTechLogos(["React"]);
    expect(logos[0].url).toMatch(/cdn\.jsdelivr\.net.*devicon/);
    expect(logos[0].url).toContain("react");
  });

  it("resolves 'TypeScript' correctly", async () => {
    const logos = await getTechLogos(["TypeScript"]);
    expect(logos[0].url).toContain("typescript");
  });

  it("falls back to /tech.svg for unknown tech names", async () => {
    const logos = await getTechLogos(["unknowntechxyz123"]);
    expect(logos[0].url).toBe("/tech.svg");
  });

  it("preserves the original tech name in the result", async () => {
    const logos = await getTechLogos(["Python"]);
    expect(logos[0].tech).toBe("Python");
  });

  it("handles an empty array without error", async () => {
    const logos = await getTechLogos([]);
    expect(logos).toHaveLength(0);
  });
});
