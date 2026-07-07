"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";

export default function CallbackPage() {
  const router = useRouter();
  const { isAuthenticated, authLoading } = useAuthGuard();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isAuthenticated && !authLoading) {
        setTimedOut(true);
      }
    }, 10000);
    return () => clearTimeout(timeout);
  }, [authLoading, isAuthenticated]);

  if (timedOut) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary gap-4">
        <div className="text-center">
          <h1 className="text-lg font-semibold text-text-primary mb-2">
            Authentication Timeout
          </h1>
          <p className="text-sm text-text-secondary mb-4">
            The sign-in process took too long. Please try again.
          </p>
          <Button asChild>
            <a href="/login">Back to Login</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="flex items-center gap-3 text-text-secondary text-sm">
        <Loader2 className="size-5 animate-spin" />
        Signing you in...
      </div>
    </div>
  );
}
