# AI assistant example

`/dashboard/ai` is a small, production-shaped example of calling Claude from a Next.js app: a signed-in user asks a question, a **Server Action** calls the Anthropic API, and the answer comes back to the page.

## Setup

1. Create an API key at https://console.anthropic.com.
2. Add it to `.env.local` (locally) or your host's **server** environment variables:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-...
   # optional; defaults to claude-opus-5-5
   AI_MODEL=
   ```
   Never put it in a `NEXT_PUBLIC_` variable. `pnpm run doctor` fails if an `sk-ant-` key appears in one.
3. Restart `pnpm dev`. Without a key, the page explains that AI isn't configured.

## How it works (`src/features/ai/actions.ts`)

- **Server-only:** the official `@anthropic-ai/sdk` reads `ANTHROPIC_API_KEY` on the server; the browser only sees the answer text.
- **Authorization and limits:** requires a signed-in user, validates the prompt with Zod (3–2,000 characters), and allows 10 questions per user per 10 minutes. The limit is in memory, per server instance; see `src/lib/rate-limit.ts`.
- **Request:** `claude-opus-5-5` at `effort: "low"` with `max_tokens: 1500`, so answers are short and the demo stays cheap. Raise the effort for harder tasks.
- **Refusal fallbacks:** the request opts into server-side fallbacks (`fallbacks: "default"` with the `server-side-fallback-2026-07-01` beta). If a safety classifier declines a request, the API retries it on a fallback model it chooses. If the whole chain still refuses (`stop_reason: "refusal"`), the user gets a polite message and no partial output.
- **Errors:** typed SDK errors become friendly messages (rate limited, misconfigured, unavailable). Logs record the error class and status only, never the prompt or the key.
- **Abuse signals:** the user's opaque id is sent as `metadata.user_id`, which helps Anthropic detect abuse without sending personal data.

## Cost

Each question is a paid API call. Check current prices on Anthropic's pricing page, set a spend limit in the Anthropic Console, and tighten the per-user limit in `actions.ts` before opening the feature to everyone.

## Extending it

- **Streaming answers:** switch to `client.beta.messages.stream(...)` and stream text to the browser from a Route Handler.
- **Grounding in the user's data:** load their rows with the existing `requireUser()` + owner-filtered queries, then include the relevant ones in the prompt. Never put another user's data in a prompt.
- **Usage limits per plan:** the Pro edition adds AI credits tied to billing.

## Tests

- **Unit:** `tests/unit/ai.test.ts` mocks the SDK and checks the request shape, refusal handling, error mapping, rate limiting, and that prompts are never logged.
- **End-to-end:** `tests/e2e/ai.spec.ts` checks the not-configured state. Live calls aren't part of CI, since they cost money and need a key.
