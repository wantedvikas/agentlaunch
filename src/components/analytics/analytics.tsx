"use client";

import Script from "next/script";
import * as React from "react";

import { Button } from "@/components/ui/button";

import { analyticsConfig, CONSENT_KEY, type Consent } from "./config";

const { gaId, plausibleDomain, plausibleSrc } = analyticsConfig({
  NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
  NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC: process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC,
});

const listeners = new Set<() => void>();
function readConsent(): Consent {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value: "granted" | "denied") {
  const wasGranted = readConsent() === "granted";
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Storage blocked: the choice applies to this page view only.
  }
  if (value === "denied" && wasGranted) {
    // Remove Google Analytics cookies, then reload so the loaded gtag script is gone too.
    document.cookie.split(";").forEach((c) => {
      const name = c.split("=")[0]!.trim();
      if (name.startsWith("_ga")) {
        document.cookie = `${name}=; Max-Age=0; path=/; domain=${location.hostname.replace(/^www\./, "")}`;
        document.cookie = `${name}=; Max-Age=0; path=/`;
      }
    });
    location.reload();
    return;
  }
  listeners.forEach((l) => l());
}

/** Re-opens the banner (footer "Cookie preferences"). */
export function resetConsent() {
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch {}
  listeners.forEach((l) => l());
}

export const hasCookieAnalytics = gaId !== null;

function useConsent(): Consent | "unknown" {
  return React.useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    readConsent,
    () => "unknown", // server render: decide on the client so the banner never flashes wrongly
  );
}

/**
 * Plausible is cookieless and loads without consent. Google Analytics sets cookies, so it only
 * loads after the visitor accepts. With no analytics configured this renders nothing.
 */
export function Analytics() {
  const consent = useConsent();
  return (
    <>
      {plausibleDomain && (
        <Script
          defer
          data-domain={plausibleDomain}
          src={plausibleSrc}
          strategy="afterInteractive"
        />
      )}
      {gaId && consent === "granted" && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {gaId && consent === null && <ConsentBanner />}
    </>
  );
}

function ConsentBanner() {
  return (
    <section
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-xl rounded-xl border bg-popover p-4 text-sm text-popover-foreground shadow-lg sm:inset-x-6 sm:bottom-6"
    >
      <p className="font-medium">Cookies</p>
      <p className="mt-1 text-muted-foreground">
        We use essential cookies to keep you signed in. With your permission we&apos;d also use
        Google Analytics cookies to understand how the site is used.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => setConsent("granted")}>
          Accept analytics
        </Button>
        <Button size="sm" variant="outline" onClick={() => setConsent("denied")}>
          Essential only
        </Button>
      </div>
    </section>
  );
}

export function CookiePreferencesButton() {
  if (!hasCookieAnalytics) return null;
  return (
    <button type="button" onClick={resetConsent} className="hover:text-foreground">
      Cookie preferences
    </button>
  );
}
