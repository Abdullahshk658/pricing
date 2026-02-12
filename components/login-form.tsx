"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { toast } from "sonner";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const nextPath = searchParams.get("next") || "/pricing";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        toast.error(data?.message ?? "Invalid username or password");
        return;
      }

      toast.success("Logged in successfully");
      router.replace(nextPath);
      router.refresh();
    } catch (error) {
      console.error("Login failed", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-2xl border border-border/80 bg-card/95 p-6 shadow-xl shadow-black/5 backdrop-blur"
    >
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Internal Access</p>
        <h1 className="text-2xl font-semibold text-card-foreground">Product Pricing Portal</h1>
      </div>

      <div className="mt-6 space-y-4">
        <label className="block space-y-2 text-sm font-medium text-card-foreground">
          Username
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full rounded-xl border border-input bg-background/90 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Enter username"
            autoComplete="username"
            required
          />
        </label>

        <label className="block space-y-2 text-sm font-medium text-card-foreground">
          Password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-input bg-background/90 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Enter password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-6 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}