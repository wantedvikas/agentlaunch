import { siteConfig } from "@/config/site";

import type { Email } from "./index";

const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

export function welcomeEmail(to: string, displayName: string): Email {
  const name = displayName.trim() || "there";
  const dashboard = new URL("/dashboard", siteConfig.url).toString();
  return {
    to,
    subject: `Welcome to ${siteConfig.name}`,
    text: `Hi ${name},\n\nYour account is ready. Open your dashboard: ${dashboard}\n\n— ${siteConfig.name}`,
    html: `<p>Hi ${escape(name)},</p><p>Your account is ready.</p><p><a href="${dashboard}">Open your dashboard</a></p><p>— ${escape(siteConfig.name)}</p>`,
  };
}
