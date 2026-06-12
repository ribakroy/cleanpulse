import { NextRequest, NextResponse } from "next/server";
import { consumeMagicLoginToken } from "@/lib/auth/magic-login";
import { magicLoginErrorMessages } from "@/lib/auth/magic-login-messages";
import { createSessionCookie } from "@/lib/auth/session";

function loginRedirect(request: NextRequest, reason: keyof typeof magicLoginErrorMessages) {
  const url = new URL("/login", request.url);
  url.searchParams.set("magic", reason);

  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const rawToken = request.nextUrl.searchParams.get("token") ?? "";

  if (!rawToken) {
    return loginRedirect(request, "invalid");
  }

  const result = await consumeMagicLoginToken(rawToken);

  if (!result.ok) {
    return loginRedirect(request, result.reason);
  }

  await createSessionCookie(result.user);

  return NextResponse.redirect(new URL(result.redirectPath, request.url));
}
