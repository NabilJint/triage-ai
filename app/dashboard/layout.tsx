"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LayoutDashboard, ListTodo, Settings } from "lucide-react";

const navItems = [
  { name: "Dashboard", link: "/dashboard", icon: <LayoutDashboard className="size-4" /> },
  { name: "Triage Feed", link: "/dashboard/decisions", icon: <ListTodo className="size-4" /> },
  { name: "Settings", link: "/dashboard/settings", icon: <Settings className="size-4" /> },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = useQuery(api.userProfiles.getMe);

  const userName = profile?.name ?? "";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const avatarSrc = profile?.image;

  return (
    <div className="min-h-screen bg-bg-primary">
      <FloatingNav navItems={navItems}>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2 text-sm">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={userName}
                className="size-7 rounded-full border-2 border-border object-cover"
              />
            ) : (
              <div className="size-7 rounded-full bg-primary-muted border-2 border-border flex items-center justify-center text-[10px] font-semibold text-primary">
                {initials}
              </div>
            )}
            <span className="hidden sm:block text-text-secondary max-w-[100px] truncate">
              {userName || "User"}
            </span>
          </div>
        </div>
      </FloatingNav>
      <div className="pt-16">
        {children}
      </div>
    </div>
  );
}
