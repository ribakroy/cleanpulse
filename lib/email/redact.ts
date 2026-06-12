export function redactMagicLoginTokens(value: string | undefined) {
  if (!value) {
    return value;
  }

  return value.replace(/([?&]token=)[A-Za-z0-9_-]+/g, "$1[REDACTED]");
}
