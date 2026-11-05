import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => {
  class APIError extends Error {
    constructor(public status: number) {
      super(`status ${status}`);
    }
  }
  class AuthenticationError extends APIError {}
  class RateLimitError extends APIError {}
  return { create: vi.fn(), APIError, AuthenticationError, RateLimitError };
});
const create = sdk.create;
vi.mock("@anthropic-ai/sdk", () => {
  class Anthropic {
    static APIError = sdk.APIError;
    static AuthenticationError = sdk.AuthenticationError;
    static RateLimitError = sdk.RateLimitError;
    beta = { messages: { create: sdk.create } };
  }
  return { default: Anthropic };
});
vi.mock("@/lib/permissions/auth", () => ({
  getCurrentUser: vi.fn(async () => ({ id: "user-1", email: "u@x.co" })),
}));

const { askClaude } = await import("@/features/ai/actions");
const { resetRateLimits } = await import("@/lib/rate-limit");

beforeEach(() => {
  create.mockReset();
  resetRateLimits();
  vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-test");
});
afterEach(() => vi.unstubAllEnvs());

describe("askClaude", () => {
  it("explains when the server has no API key", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    expect(await askClaude({ prompt: "hello there" })).toEqual({
      ok: false,
      error: "AI isn't configured on this server yet.",
    });
    expect(create).not.toHaveBeenCalled();
  });

  it("validates the prompt on the server", async () => {
    const r = await askClaude({ prompt: "  " });
    expect(r.ok).toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it("sends a server-side request with fallbacks and returns the text", async () => {
    create.mockResolvedValue({ stop_reason: "end_turn", content: [{ type: "text", text: "Hi!" }] });
    expect(await askClaude({ prompt: "Say hi" })).toEqual({ ok: true, data: "Hi!" });
    const params = create.mock.calls[0]![0];
    expect(params).toMatchObject({
      model: "claude-opus-5-5",
      fallbacks: "default",
      betas: ["server-side-fallback-2026-07-01"],
      metadata: { user_id: "user-1" },
      messages: [{ role: "user", content: "Say hi" }],
    });
  });

  it("handles a refusal without returning partial content", async () => {
    create.mockResolvedValue({
      stop_reason: "refusal",
      content: [{ type: "text", text: "partial" }],
    });
    const r = await askClaude({ prompt: "Something declined" });
    expect(r).toMatchObject({ ok: false, error: expect.stringMatching(/couldn't help/) });
  });

  it("maps SDK errors to friendly messages without logging the prompt", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    create.mockRejectedValueOnce(new sdk.RateLimitError(429));
    expect(await askClaude({ prompt: "secret prompt text" })).toMatchObject({
      error: expect.stringMatching(/busy/),
    });
    create.mockRejectedValueOnce(new sdk.AuthenticationError(401));
    expect(await askClaude({ prompt: "secret prompt text" })).toMatchObject({
      error: expect.stringMatching(/misconfigured/),
    });
    expect(JSON.stringify(log.mock.calls)).not.toContain("secret prompt text");
    log.mockRestore();
  });

  it("rate-limits each user", async () => {
    create.mockResolvedValue({ stop_reason: "end_turn", content: [{ type: "text", text: "ok" }] });
    for (let i = 0; i < 10; i++) await askClaude({ prompt: "question" });
    expect(await askClaude({ prompt: "question" })).toMatchObject({
      error: expect.stringMatching(/a lot of questions/),
    });
  });
});
