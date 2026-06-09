export type EmailMessage = {
  to: string[];
  subject: string;
  html: string;
  text?: string | undefined;
  replyTo?: string | undefined;
};

export type EmailSendResult = {
  id: string;
  accepted: string[];
};
