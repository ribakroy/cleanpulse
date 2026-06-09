import type { EmailProviderMode } from "@/types/env";
import type { EmailMessage, EmailSendResult } from "./types";

export interface EmailProvider {
  readonly mode: EmailProviderMode;
  send(message: EmailMessage): Promise<EmailSendResult>;
}
