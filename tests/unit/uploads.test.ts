import { describe, expect, it } from "vitest";

import {
  checkFile,
  contentMatchesType,
  MAX_UPLOAD_BYTES,
  safeFileName,
} from "@/features/uploads/schema";

const bytes = (...b: number[]) => new Uint8Array([...b, ...new Array(16).fill(0x20)]);

describe("checkFile", () => {
  it("accepts allowed types with a matching extension", () => {
    expect(checkFile({ name: "a.PNG", type: "image/png", size: 10 })).toEqual({ ok: true });
    expect(checkFile({ name: "doc.pdf", type: "application/pdf", size: MAX_UPLOAD_BYTES })).toEqual(
      { ok: true },
    );
  });
  it.each([
    [{ name: "x.svg", type: "image/svg+xml", size: 10 }, /Only PNG/],
    [{ name: "x.html", type: "text/html", size: 10 }, /Only PNG/],
    [{ name: "x.png.exe", type: "image/png", size: 10 }, /Only PNG/],
    [{ name: "x.png", type: "image/png", size: MAX_UPLOAD_BYTES + 1 }, /5 MB/],
    [{ name: "x.png", type: "image/png", size: 0 }, /empty/],
  ])("rejects %o", (file, msg) => {
    const r = checkFile(file);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(msg);
  });
});

describe("contentMatchesType", () => {
  it("recognises real signatures", () => {
    expect(
      contentMatchesType("image/png", bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)),
    ).toBe(true);
    expect(contentMatchesType("image/jpeg", bytes(0xff, 0xd8, 0xff))).toBe(true);
    expect(contentMatchesType("application/pdf", new TextEncoder().encode("%PDF-1.7 ..."))).toBe(
      true,
    );
    expect(contentMatchesType("text/plain", new TextEncoder().encode("hello"))).toBe(true);
    const webp = new TextEncoder().encode("RIFF\x00\x00\x00\x00WEBPVP8 ");
    expect(contentMatchesType("image/webp", webp)).toBe(true);
  });
  it("rejects content that doesn't match the declared type", () => {
    expect(
      contentMatchesType("image/png", new TextEncoder().encode("<script>alert(1)</script>")),
    ).toBe(false);
    expect(contentMatchesType("application/pdf", bytes(0x4d, 0x5a))).toBe(false); // "MZ" executable
    expect(contentMatchesType("text/plain", new Uint8Array([0x68, 0x00, 0x69]))).toBe(false);
    expect(contentMatchesType("image/svg+xml", new TextEncoder().encode("<svg/>"))).toBe(false);
  });
});

describe("safeFileName", () => {
  it("strips path tricks and odd characters", () => {
    expect(safeFileName("../../etc/passwd")).toBe("etc-passwd");
    expect(safeFileName("My Résumé (final).pdf")).toBe("My-Re-sume-final-.pdf");
    expect(safeFileName("...")).toBe("file");
    expect(safeFileName("a".repeat(200) + ".png")).toHaveLength(80);
  });
});
