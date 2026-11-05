/**
 * Upload rules, shared by the browser (fast feedback) and the server (enforcement).
 * The Storage bucket repeats the size and type limits (migration 20261106000000_uploads.sql).
 */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const ALLOWED_TYPES: Record<string, readonly string[]> = {
  "image/png": ["png"],
  "image/jpeg": ["jpg", "jpeg"],
  "image/webp": ["webp"],
  "image/gif": ["gif"],
  "application/pdf": ["pdf"],
  "text/plain": ["txt"],
};

export const ACCEPT_ATTR = Object.entries(ALLOWED_TYPES)
  .flatMap(([type, exts]) => [type, ...exts.map((e) => `.${e}`)])
  .join(",");

export type FileCheck = { ok: true } | { ok: false; error: string };

/** Checks name, declared type and size. */
export function checkFile(file: { name: string; type: string; size: number }): FileCheck {
  if (file.size === 0) return { ok: false, error: "That file is empty." };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: "Files must be 5 MB or smaller." };
  const exts = ALLOWED_TYPES[file.type];
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!exts || !exts.includes(ext))
    return { ok: false, error: "Only PNG, JPEG, WebP, GIF, PDF and plain-text files are allowed." };
  return { ok: true };
}

/**
 * Checks the file's first bytes match its declared type, so a renamed executable or HTML file
 * can't pass as an image. Plain text must contain no NUL bytes.
 */
export function contentMatchesType(type: string, head: Uint8Array): boolean {
  const starts = (...sig: number[]) => sig.every((b, i) => head[i] === b);
  switch (type) {
    case "image/png":
      return starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
    case "image/jpeg":
      return starts(0xff, 0xd8, 0xff);
    case "image/gif":
      return starts(0x47, 0x49, 0x46, 0x38);
    case "image/webp":
      return (
        starts(0x52, 0x49, 0x46, 0x46) &&
        [0x57, 0x45, 0x42, 0x50].every((b, i) => head[8 + i] === b)
      );
    case "application/pdf":
      return starts(0x25, 0x50, 0x44, 0x46, 0x2d); // %PDF-
    case "text/plain":
      return !head.includes(0);
    default:
      return false;
  }
}

/** Storage-safe file name: keeps letters, digits, dot, dash, underscore; max 80 chars. */
export function safeFileName(name: string) {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+/, "");
  return (cleaned || "file").slice(-80);
}
