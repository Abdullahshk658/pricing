import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import LoginForm from "@/components/login-form";
import { AUTH_COOKIE_NAME, hasAuthCookie } from "@/lib/auth";

export default function LoginPage() {
  const isAuthenticated = hasAuthCookie(cookies().get(AUTH_COOKIE_NAME)?.value);

  if (isAuthenticated) {
    redirect("/pricing");
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-center gap-8 lg:justify-between">
        <div className="hidden max-w-md space-y-4 lg:block">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Pricing Operations</p>
          <h2 className="text-4xl font-semibold leading-tight text-foreground">
            Enter and review retail and bulk prices faster.
          </h2>
          <p className="text-base text-muted-foreground">
            Secure access for the internal catalog pricing workflow.
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}