import type { EmailProvider } from "@/lib/email/email-provider";
import type { EmailMessage, EmailSendResult } from "./types";
import { redactMagicLoginTokens } from "@/lib/email/redact";

export class MockEmailProvider implements EmailProvider {
  readonly mode = "mock" as const;

  async send(message: EmailMessage): Promise<EmailSendResult> {
    console.log("\n=========================================");
    console.log("       [MOCK EMAIL PROVIDER - SEND]      ");
    console.log("=========================================");
    console.log(`אל:      ${message.to.join(", ")}`);
    console.log(`נושא:    ${message.subject}`);
    if (message.replyTo) {
      console.log(`Reply-To: ${message.replyTo}`);
    }
    console.log("--- תוכן טקסט (Text Fallback) ---");
    console.log(redactMagicLoginTokens(message.text) || "לא הוגדר טקסט גיבוי");
    console.log("---------------------------------");
    console.log("=========================================\n");

    return {
      id: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      accepted: message.to,
    };
  }
}
