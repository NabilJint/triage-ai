"use client";

import { useEffect, useState } from "react";
import posthog from "posthog-js";
import { motion } from "motion/react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowRight } from "lucide-react";
import { popIn, staggerContainer, staggerItem } from "@/lib/variants";
import { useAuthActions } from "@convex-dev/auth/react";
import Link from "next/link";

export default function LoginPage() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const profile = useQuery(api.userProfiles.getMe);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuthActions();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) return;
    if (profile === undefined) return;

    window.location.href = profile?.business_name ? "/dashboard" : "/onboarding";
  }, [authLoading, isAuthenticated, profile]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    posthog.capture("login", { method: "google" });
    try {
      await signIn("google", { redirectTo: "/dashboard" });
    } catch (err) {
      setIsLoading(false);
      const message =
        err instanceof Error ? err.message : "Failed to sign in. Please try again.";
      setError(message);
      posthog.captureException(err instanceof Error ? err : new Error(message));
      posthog.capture("login_error", { method: "google" });
    }
  };

  if (authLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="flex items-center gap-3 text-text-secondary text-sm">
          <Loader2 className="size-5 animate-spin" />
          {authLoading ? "Loading..." : "Redirecting..."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(
              circle at top right,
              var(--color-primary-muted),
              transparent 40%
            ),
            radial-gradient(
              circle at bottom left,
              var(--color-primary-light),
              transparent 30%
            )
          `,
        }}
      />
      <motion.div
        className="z-10 w-full max-w-md px-4 md:px-0"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={staggerItem} className="flex justify-center mb-8">
          <Link
            href="/"
            className="text-lg font-bold text-primary flex items-center gap-2"
          >
            <Logo />
            TriageAI
          </Link>
        </motion.div>

        <motion.div variants={popIn}>
          <Card className="bg-surface border-border shadow-card rounded-lg w-full">
            <CardContent className="p-8 flex flex-col gap-0">
              <motion.div variants={staggerItem} className="text-center mb-8">
                <h1 className="text-3xl md:text-[32px] font-bold text-text-primary mb-2 leading-10 md:leading-10">
                  Welcome to TriageAI
                </h1>
                <p className="text-text-secondary text-sm">
                  Log in to manage your support inbox with AI precision.
                </p>
              </motion.div>

              {error && (
                <motion.div
                  variants={staggerItem}
                  className="p-3 bg-error-light border border-error rounded-md mb-4"
                >
                  <p className="text-sm text-error font-medium">{error}</p>
                </motion.div>
              )}

              <motion.div
                variants={staggerItem}
                className="flex flex-col gap-4 w-full"
              >
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  size="lg"
                  className="w-full"
                  variant="outline"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <svg className="size-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </Button>
              </motion.div>

              <motion.div
                variants={staggerItem}
                className="flex items-center gap-4 my-6"
              >
                <Separator className="flex-1" />
                <span className="text-text-muted text-xs font-medium">
                  coming soon
                </span>
                <Separator className="flex-1" />
              </motion.div>

              <motion.div
                variants={staggerItem}
                className="flex flex-col gap-4 w-full opacity-50 pointer-events-none"
              >
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Email address"
                    disabled
                    className="w-full bg-surface border border-border rounded-md px-4 py-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <Button disabled size="lg" className="w-full">
                  Continue with Email
                  <ArrowRight className="size-[18px]" />
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="mt-8 text-center flex flex-col gap-2"
        >
          <p className="text-xs text-text-muted">
            By continuing, you agree to TriageAI&apos;s{" "}
            <a
              href="#"
              className="text-primary hover:text-primary-dark underline transition-colors"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-primary hover:text-primary-dark underline transition-colors"
            >
              Privacy Policy
            </a>
            .
          </p>
          <Logo size={14} className="inline-block text-amd mx-auto mt-1" />
        </motion.div>
      </motion.div>
    </div>
  );
}
