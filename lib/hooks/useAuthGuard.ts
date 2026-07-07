"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type UseAuthGuardOptions = {
  redirectTo?: string;
};

export function useAuthGuard(options?: UseAuthGuardOptions) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const profile = useQuery(api.userProfiles.getMe);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push(options?.redirectTo ?? "/login");
    }
  }, [authLoading, isAuthenticated, router, options?.redirectTo]);

  return {
    isAuthenticated,
    authLoading,
    profile,
    isLoading: authLoading || profile === undefined || !isAuthenticated,
  };
}
