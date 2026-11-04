import { describe, expect, it } from "vitest";

import { isActivePath } from "@/components/dashboard/dashboard-nav";
import { resolveDark } from "@/components/theme/theme";
import { projectInputSchema } from "@/features/projects/schema";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("lets later Tailwind classes win", () => {
    expect(cn("px-2 text-sm", false && "hidden", "px-4")).toBe("text-sm px-4");
  });
});

describe("resolveDark", () => {
  it.each([
    ["dark", false, true],
    ["light", true, false],
    ["system", true, true],
    ["system", false, false],
  ] as const)("%s with system dark=%s -> %s", (theme, sys, expected) => {
    expect(resolveDark(theme, sys)).toBe(expected);
  });
});

describe("isActivePath", () => {
  it("matches overview only exactly", () => {
    expect(isActivePath("/dashboard", "/dashboard")).toBe(true);
    expect(isActivePath("/dashboard/projects", "/dashboard")).toBe(false);
  });
  it("matches nested routes but not prefixes of other words", () => {
    expect(isActivePath("/dashboard/projects/123", "/dashboard/projects")).toBe(true);
    expect(isActivePath("/dashboard/projects-archive", "/dashboard/projects")).toBe(false);
  });
});

describe("projectInputSchema", () => {
  it("accepts and trims a valid project", () => {
    const r = projectInputSchema.parse({ name: "  Atlas  ", description: "", status: "active" });
    expect(r.name).toBe("Atlas");
  });
  it.each([
    [{ name: "A", description: "", status: "active" }, "name"],
    [{ name: "x".repeat(81), description: "", status: "active" }, "name"],
    [{ name: "Ok name", description: "x".repeat(501), status: "active" }, "description"],
    [{ name: "Ok name", description: "", status: "deleted" }, "status"],
  ])("rejects invalid input (%#)", (input, field) => {
    const r = projectInputSchema.safeParse(input);
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.path[0]).toBe(field);
  });
});
