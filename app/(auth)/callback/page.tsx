"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function CallbackPage() {
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [mounted, isAuthenticated, router]);

  // Timeout after 10 seconds of waiting
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isAuthenticated && mounted) {
        setTimedOut(true);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [mounted, isAuthenticated]);

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
