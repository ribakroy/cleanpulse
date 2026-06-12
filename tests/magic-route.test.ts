import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  consumeMagicLoginToken: vi.fn(),
  createSessionCookie: vi.fn(),
}));

vi.mock("@/lib/auth/magic-login", () => ({
  consumeMagicLoginToken: mocks.consumeMagicLoginToken,
}));

vi.mock("@/lib/auth/session", () => ({
  createSessionCookie: mocks.createSessionCookie,
}));

import { GET } from "@/app/auth/magic/route";

describe("/auth/magic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects missing tokens to login with a Hebrew fallback reason", async () => {
    const response = await GET(new NextRequest("http://localhost:3000/auth/magic"));

    expect(response.headers.get("location")).toBe("http://localhost:3000/login?magic=invalid");
    expect(mocks.createSessionCookie).not.toHaveBeenCalled();
  });

  it("creates a normal session and redirects to the authorized target", async () => {
    mocks.consumeMagicLoginToken.mockResolvedValue({
      ok: true,
      redirectPath: "/work",
      targetPath: "/work",
      authorizedTarget: true,
      user: {
        id: "user_1",
        organizationId: "org_1",
        email: "worker@example.com",
        fullName: "Worker",
        role: "operations_worker",
      },
    });

    const response = await GET(new NextRequest("http://localhost:3000/auth/magic?token=raw"));

    expect(mocks.consumeMagicLoginToken).toHaveBeenCalledWith("raw");
    expect(mocks.createSessionCookie).toHaveBeenCalledWith(expect.objectContaining({ id: "user_1" }));
    expect(response.headers.get("location")).toBe("http://localhost:3000/work");
  });
});
