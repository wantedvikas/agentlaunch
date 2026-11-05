import { afterEach, describe, expect, it, vi } from "vitest";

import { emailTransport, sendEmail } from "@/lib/email";
import { welcomeEmail } from "@/lib/email/templates";

const msg = { to: "user@example.com", subject: "Hello", text: "Body" };

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("emailTransport", () => {
  it("defaults to log for unset or unknown values", () => {
    vi.stubEnv("EMAIL_TRANSPORT", "carrier-pigeon");
    expect(emailTransport()).toBe("log");
  });
});

describe("sendEmail", () => {
  it("log transport sends nothing and never logs the recipient", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await sendEmail(msg)).toEqual({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(info.mock.calls.flat().join(" ")).not.toContain("user@example.com");
  });

  it("resend posts to the API with the key and reports HTTP failures without content", async () => {
    vi.stubEnv("EMAIL_TRANSPORT", "resend");
    vi.stubEnv("EMAIL_FROM", "App <hi@example.com>");
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 422 }));
    vi.stubGlobal("fetch", fetchMock);
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(await sendEmail(msg)).toEqual({ ok: false, error: "HTTP 422" });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer re_test_key");
    expect(JSON.parse(init.body)).toMatchObject({ to: ["user@example.com"], subject: "Hello" });
    const logged = error.mock.calls.flat().join(" ");
    expect(logged).not.toContain("user@example.com");
    expect(logged).not.toContain("re_test_key");
  });

  it("refuses to send without EMAIL_FROM", async () => {
    vi.stubEnv("EMAIL_TRANSPORT", "smtp");
    vi.stubEnv("EMAIL_FROM", "");
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await sendEmail(msg)).toEqual({ ok: false, error: "EMAIL_FROM not set" });
  });
});

describe("welcomeEmail", () => {
  it("escapes the display name in HTML", () => {
    const e = welcomeEmail("a@b.co", '<img src=x onerror="alert(1)">');
    expect(e.html).not.toContain("<img");
    expect(e.html).toContain("&lt;img");
  });
  it("falls back when there is no name", () => {
    expect(welcomeEmail("a@b.co", "  ").text).toContain("Hi there,");
  });
});
