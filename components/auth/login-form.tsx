"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { LockKeyhole } from "lucide-react";
import { loginAction, type LoginActionState } from "@/app/(public)/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: LoginActionState = {
  email: "",
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" fullWidth disabled={pending}>
      <LockKeyhole className="size-4" aria-hidden="true" />
      {pending ? "מתחבר..." : "כניסה למערכת"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4">
        <Input
          label="אימייל"
          name="email"
          type="email"
          placeholder="owner@cleanpulse.app"
          autoComplete="email"
          defaultValue={state.email}
          required
        />
        <Input
          label="סיסמה"
          name="password"
          type="password"
          placeholder="הקלד סיסמה"
          autoComplete="current-password"
          required
        />
      </div>

      {state.error ? (
        <div className="rounded-[var(--radius-md)] border border-danger/25 bg-danger/8 px-4 py-3 text-sm font-medium text-danger">
          {state.error}
        </div>
      ) : null}

      <SubmitButton />
    </form>
  );
}
