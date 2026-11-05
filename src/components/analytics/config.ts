/** Analytics settings from public env vars. Invalid values are treated as "not configured". */
export function analyticsConfig(env: Record<string, string | undefined> = process.env) {
  const ga = env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";
  const plausible = env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? "";
  return {
    // Strict shapes, because these values are interpolated into script URLs/attributes.
    gaId: /^G-[A-Z0-9]{4,20}$/.test(ga) ? ga : null,
    plausibleDomain: /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(plausible) ? plausible : null,
    plausibleSrc: env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC || "https://plausible.io/js/script.js",
  };
}

export const CONSENT_KEY = "cookie-consent";
export type Consent = "granted" | "denied" | null;
