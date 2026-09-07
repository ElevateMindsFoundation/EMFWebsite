// Email sending abstraction. For Phase C there is no real transactional email
// provider wired up — ConsoleEmailProvider just logs the message (including
// the verification/reset link) to the server console so auth flows are fully
// testable end-to-end without SMTP credentials.
//
// TODO(Phase D+): implement a real provider (e.g. SendGrid, Postmark, SES) that
// satisfies the same EmailService interface, and swap it in below via the
// EMAIL_PROVIDER env flag. Nothing else in the codebase should need to change —
// routes only ever depend on the EmailService interface, never on a concrete
// provider.

export interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
}

export interface EmailService {
  send(input: SendEmailInput): Promise<void>;
}

class ConsoleEmailProvider implements EmailService {
  async send(input: SendEmailInput): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(
      [
        '\n===== [ConsoleEmailProvider] Outgoing email =====',
        `To:      ${input.to}`,
        `Subject: ${input.subject}`,
        '---',
        input.text,
        '===================================================\n',
      ].join('\n'),
    );
  }
}

// EMAIL_PROVIDER selects the implementation. Only "console" exists today;
// this is the single line to change once a real provider is built.
const provider = process.env.EMAIL_PROVIDER ?? 'console';

function createEmailService(): EmailService {
  switch (provider) {
    case 'console':
    default:
      return new ConsoleEmailProvider();
  }
}

export const emailService: EmailService = createEmailService();

export function buildVerificationEmailLink(baseUrl: string, token: string): string {
  return `${baseUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
}

export function buildPasswordResetLink(frontendUrl: string, token: string): string {
  return `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
}
