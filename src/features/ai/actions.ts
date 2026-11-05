"use server";

import Anthropic from "@anthropic-ai/sdk";

import { getCurrentUser } from "@/lib/permissions/auth";
import { rateLimit } from "@/lib/rate-limit";
import { fieldErrorsFrom, type ActionResult } from "@/lib/validation/action-result";

import { AI_MODEL, isAiConfigured } from "./config";
import { askSchema, type AskInput } from "./schema";

const SYSTEM = `You are a concise assistant inside a SaaS dashboard. Answer the user's question in plain
language in at most a few short paragraphs or a short list. If you don't know, say so.`;

/**
 * Sends one question to Claude and returns the answer text. Runs only on the server:
 * the API key is read from the environment by the SDK and never reaches the browser.
 */
export async function askClaude(input: AskInput): Promise<ActionResult<string>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Your session has ended. Sign in again." };
  if (!isAiConfigured()) return { ok: false, error: "AI isn't configured on this server yet." };

  const parsed = askSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      error: "Check your question.",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };

  // Each request costs money: cap it per user. shortcut: in-memory, per instance (see lib/rate-limit).
  if (!rateLimit(`ai:${user.id}`, 10, 10 * 60_000).ok)
    return { ok: false, error: "You've asked a lot of questions. Try again in a few minutes." };

  const client = new Anthropic();
  try {
    const response = await client.beta.messages.create({
      model: AI_MODEL,
      // Deliberately short answers: this is a demo, and it keeps cost and latency down.
      max_tokens: 1500,
      // Low effort keeps simple Q&A fast and cheap; raise it for harder tasks.
      output_config: { effort: "low" },
      // If a request is declined by a safety classifier, retry it on a fallback model chosen
      // by the API instead of returning nothing.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      // Per-user metadata helps Anthropic detect abuse; it's an opaque id, not personal data.
      metadata: { user_id: user.id },
      messages: [{ role: "user", content: parsed.data.prompt }],
    });

    if (response.stop_reason === "refusal")
      return { ok: false, error: "Claude couldn't help with that request. Try rephrasing it." };

    const text = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    if (!text) return { ok: false, error: "Claude didn't return an answer. Try again." };
    return { ok: true, data: text };
  } catch (error) {
    // Log the class and status only, never the prompt or key.
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("askClaude: invalid ANTHROPIC_API_KEY");
      return { ok: false, error: "AI is misconfigured on this server." };
    }
    if (error instanceof Anthropic.RateLimitError)
      return { ok: false, error: "The AI service is busy. Try again in a minute." };
    if (error instanceof Anthropic.APIError) {
      console.error("askClaude failed", error.status);
      return { ok: false, error: "The AI service returned an error. Try again." };
    }
    console.error("askClaude failed", error instanceof Error ? error.name : "unknown");
    return { ok: false, error: "We couldn't reach the AI service. Try again." };
  }
}
