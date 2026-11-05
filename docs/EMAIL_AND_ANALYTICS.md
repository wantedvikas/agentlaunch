# Email and analytics

## App email

Auth emails (confirmation, password reset) are sent **by Supabase Auth**. App emails (currently the welcome email) are sent **by this app** through `src/lib/email`.

| `EMAIL_TRANSPORT` | Needs                                                                   | Use for                                                       |
| ----------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------- |
| `log` (default)   | nothing                                                                 | Local dev. Nothing is sent; only the subject is printed.      |
| `resend`          | `RESEND_API_KEY`, `EMAIL_FROM`                                          | Production with [Resend](https://resend.com)                  |
| `smtp`            | `SMTP_HOST`, `EMAIL_FROM` (+ `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`) | Any SMTP provider: SendGrid, Mailgun, Postmark, Amazon SES, … |

`EMAIL_FROM` must use a domain you've verified with the provider, or messages will be rejected or land in spam.

**Locally**, point SMTP at Mailpit to see real messages:

```bash
EMAIL_TRANSPORT=smtp
SMTP_HOST=127.0.0.1
SMTP_PORT=54325
EMAIL_FROM="My App <hello@example.local>"
```

Then open http://127.0.0.1:54324.

**Welcome email:** sent once, on a user's first confirmed sign-in (email link, OAuth or password). A database function (`claim_welcome_email`) flips `profiles.welcomed_at` atomically, so it's never sent twice. If sending fails, the user isn't blocked and it isn't retried.

**Logging:** failures log the transport and an error code only, never recipients, subjects, bodies or keys.

**Production auth emails:** in Supabase → Authentication → SMTP, use the same provider. Supabase's built-in sender has very low limits.

### Add a new email

1. Add a function to `src/lib/email/templates.ts` returning `{ to, subject, text, html }`. Escape every user-supplied value in `html`.
2. Call `await sendEmail(yourEmail(...))` from server code only.
3. Add a unit test like `tests/unit/email.test.ts`.

## Analytics and cookie consent

| Variable                           | Effect                                                                                                          |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`     | Loads [Plausible](https://plausible.io). It's cookieless, so no banner is needed.                               |
| `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC` | Optional self-hosted script URL                                                                                 |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`    | Google Analytics 4. It sets cookies, so a consent banner appears and GA loads **only after "Accept analytics"** |

- With no GA id, no banner is shown (no non-essential cookies).
- "Essential only" keeps GA off. Changing your mind later through **Cookie preferences** in the footer removes `_ga` cookies and reloads.
- Invalid ids are ignored (they're validated before being put into script URLs).
- The banner text is a starting point, **not legal advice**. Check your obligations (GDPR/ePrivacy, CCPA) and add a privacy policy page.
