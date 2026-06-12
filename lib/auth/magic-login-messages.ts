export const magicLoginErrorMessages: Record<string, string> = {
  invalid: "קישור הכניסה אינו תקין. אפשר להתחבר עם אימייל וסיסמה.",
  expired: "קישור הכניסה פג תוקף. אפשר להתחבר עם אימייל וסיסמה.",
  used: "קישור הכניסה כבר נוצל. אפשר להתחבר עם אימייל וסיסמה.",
  revoked: "קישור הכניסה בוטל. אפשר להתחבר עם אימייל וסיסמה.",
  inactive: "המשתמש אינו פעיל. פנה למנהל המערכת.",
};

export function getMagicLoginErrorMessage(reason: string | null | undefined) {
  return reason ? magicLoginErrorMessages[reason] ?? magicLoginErrorMessages.invalid : null;
}
