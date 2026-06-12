# Magic Login Links and Branded Email

CleanPulse now has infrastructure for secure magic login links and branded RTL email previews.

## Safety Defaults

- Real email sending remains disabled unless the environment and Super Admin settings explicitly allow it.
- `EMAIL_PROVIDER=mock` remains the safe default.
- Resend is not activated by this feature.
- API keys and secrets are not stored through the UI.
- Raw magic tokens are never stored in data records.
- Mock provider logs redact `?token=...` values.

## Magic Login Tokens

Collection: `magic_login_tokens`

Fields:

- `organizationId`
- `userId`
- `tokenHash`
- `targetPath`
- `purpose`
- `expiresAt`
- `usedAt`
- `revokedAt`
- `createdAt`
- `updatedAt`
- `createdByUserId`
- `metadata`

The raw token is generated once, sent in a link, hashed with SHA-256, and discarded by the data layer. `/auth/magic?token=...` hashes the incoming token and compares it with stored hashes.

## Route

`/auth/magic?token=...`

Flow:

1. Validate token exists.
2. Hash incoming token.
3. Reject missing, expired, used, revoked, inactive, or cross-organization tokens.
4. Load the target user.
5. Check role and scope for `targetPath`.
6. Create a normal session cookie.
7. Mark token as used.
8. Write `activity_logs` with `actionType: magic_login_used`.
9. Redirect to the authorized target, or to the role fallback route.

Magic links do not bypass route permissions. Workers still land in `/work`; area managers still respect restroom scope.

## Email and Domain Settings

Collection: `system_settings`, record id `email_domain_settings`.

Fields:

- `appUrl`
- `emailProvider`
- `emailMode`
- `fromName`
- `fromEmail`
- `replyToEmail`
- `allowedTestRecipients`
- `domainStatus`
- `resendDomain`
- `updatedAt`
- `updatedByUserId`

Super Admin route:

- `/super/email-settings`

Capabilities:

- View and edit safe email/domain settings.
- Preview all branded RTL email templates.
- Generate a local/mock QA magic link.
- See HTML and text versions.
- No secrets are displayed or saved.

## Templates

Implemented templates:

- `incident_alert`
- `urgent_incident_alert`
- `worker_task_assigned`
- `incident_resolved`
- `restroom_reset`
- `shift_summary`
- `user_invite`
- `password_reset`

All templates include RTL HTML, text fallback, escaped dynamic values, and a CTA link.

## Test Mode

`emailMode = test` restricts sending to `allowedTestRecipients`. If a recipient is not allowed, the notification is skipped and logged as a local failure instead of being sent.
