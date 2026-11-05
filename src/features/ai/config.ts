import "server-only";

/** True when the server has an Anthropic API key. The key itself never leaves the server. */
export function isAiConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/** Model for the demo. Override with AI_MODEL; defaults to the current Claude Opus. */
export const AI_MODEL = process.env.AI_MODEL || "claude-opus-5-5";
