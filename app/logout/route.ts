import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { clearSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  await clearSession();
  revalidatePath("/", "layout");

  return NextResponse.redirect(new URL("/login", request.url));
}
