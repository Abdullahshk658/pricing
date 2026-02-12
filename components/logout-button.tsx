"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        toast.error("Logout failed");
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
      toast.error("Logout failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-card-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isLoading ? "Signing out..." : "Sign out"}
    </button>
  );
}