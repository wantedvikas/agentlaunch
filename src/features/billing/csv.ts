/** RFC 4180 CSV. Cells starting with = + - @ are prefixed with ' so spreadsheets don't run them. */
export function toCsv(rows: (string | number | null)[][]) {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          let s = cell == null ? "" : String(cell);
          if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
          return /[",\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
        })
        .join(","),
    )
    .join("\r\n");
}
