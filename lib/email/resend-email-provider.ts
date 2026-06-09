import type { EmailProvider } from "@/lib/email/email-provider";
import type { EmailMessage, EmailSendResult } from "./types";
import { env } from "@/lib/utils/env";

export class ResendEmailProvider implements EmailProvider {
  readonly mode = "resend" as const;

  async send(message: EmailMessage): Promise<EmailSendResult> {
    if (!env.resendApiKey) {
      throw new Error("RESEND_API_KEY חסר. אין להשתמש ב־Resend לפני חיבור מפורש של הסביבה.");
    }

    if (!env.emailFrom) {
      throw new Error("EMAIL_FROM חסר. יש להגדיר כתובת שולח מורשית ב-Resend.");
    }

    const replyTo = message.replyTo || env.emailReplyTo || undefined;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.emailFrom,
        to: message.to,
        reply_to: replyTo,
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Resend API call failed with status ${response.status}. ${errorText}`);
    }

    const payload = (await response.json()) as { id: string };

    return {
      id: payload.id,
      accepted: message.to,
    };
  }
}
