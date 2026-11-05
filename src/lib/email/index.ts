import "server-only";

import nodemailer from "nodemailer";

export type Email = { to: string; subject: string; text: string; html?: string };
export type SendResult = { ok: true } | { ok: false; error: string };

type Transport = "resend" | "smtp" | "log";

export function emailTransport(): Transport {
  const t = process.env.EMAIL_TRANSPORT;
  return t === "resend" || t === "smtp" ? t : "log";
}

/**
 * Sends one email with the configured transport. Never throws and never logs message content
 * or recipient addresses: failures log the transport and an error code only.
 */
export async function sendEmail(email: Email): Promise<SendResult> {
  const transport = emailTransport();
  const from = process.env.EMAIL_FROM ?? "";
  try {
    if (transport === "log") {
      // Local default: nothing leaves the machine. Subject only, to keep addresses out of logs.
      console.info(`[email:log] would send "${email.subject}"`);
      return { ok: true };
    }
    if (!from) return fail(transport, "EMAIL_FROM not set");

    if (transport === "resend") {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY ?? ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [email.to],
          subject: email.subject,
          text: email.text,
          html: email.html,
        }),
      });
      return res.ok ? { ok: true } : fail(transport, `HTTP ${res.status}`);
    }

    const port = Number(process.env.SMTP_PORT ?? 587);
    await nodemailer
      .createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
          : undefined,
      })
      .sendMail({ from, ...email });
    return { ok: true };
  } catch (err) {
    return fail(transport, err instanceof Error ? err.name : "unknown error");
  }
}

function fail(transport: Transport, error: string): SendResult {
  console.error(`[email:${transport}] send failed: ${error}`);
  return { ok: false, error };
}
