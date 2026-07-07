"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";

export function SignOutButton() {
  const { signOut } = useAuthActions();
  return (
    <Button variant="ghost" size="sm" onClick={() => signOut()}>
      <LogOut className="size-4" />
      Sign Out
    </Button>
  );
}
