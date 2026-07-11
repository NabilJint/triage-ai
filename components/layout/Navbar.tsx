"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { motion } from "motion/react";
import { useQuery, useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Menu, X, LogOut, LayoutDashboard, ListTodo, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SignOutButton } from "@/components/ui/sign-out-button";
import { useScrollPosition } from "@/lib/hooks/useScrollPosition";

const landingLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

const appLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/decisions", label: "Triage Feed", icon: ListTodo },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

type NavbarProps = {
  mode?: "landing" | "app";
};

export function Navbar({ mode = "landing" }: NavbarProps) {
  const isScrolled = useScrollPosition(10);
  const pathname = usePathname();
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const profile = useQuery(api.userProfiles.getMe);

  const isLanding = mode === "landing";
  const homeHref = isLanding ? "/" : "/dashboard";

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const avatarSrc = profile?.image;
  const userName = profile?.name ?? "";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const desktopLinks = isLanding
    ? landingLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={(e) => handleNavClick(e, link.href)}
          className="text-text-dark text-sm font-medium hover:text-text-primary transition-colors duration-200"
        >
          {link.label}
        </Link>
      ))
    : appLinks.map((link) => {
        const isActive = pathname.startsWith(link.href);
        const Icon = link.icon!;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`relative flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 ${
              isActive
                ? "text-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Icon className="size-4" />
            {link.label}
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute -bottom-[18px] left-0 right-0 h-0.5 bg-primary"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
        );
      });

  const desktopActions = isLanding ? (
    isAuthenticated ? (
      <SignOutButton />
    ) : (
      <>
        <Link
          href="/login"
          onClick={() =>
            posthog.capture("signup_cta_clicked", {
              label: "sign_in",
              location: "navbar",
            })
          }
        >
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
        </Link>
        <Link
          href="/login"
          onClick={() =>
            posthog.capture("signup_cta_clicked", {
              label: "get_started",
              location: "navbar",
            })
          }
        >
          <Button size="sm">Get Started</Button>
        </Link>
      </>
    )
  ) : isAuthenticated && profile ? (
    <div className="flex items-center gap-3">
      <div className="text-right text-xs leading-tight">
        <p className="font-medium text-text-primary">{userName}</p>
      </div>
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={userName}
          className="size-8 rounded-full border-2 border-border object-cover"
        />
      ) : (
        <div className="size-8 rounded-full bg-primary-muted border-2 border-border flex items-center justify-center text-xs font-semibold text-primary">
          {initials}
        </div>
      )}
      <SignOutButton />
    </div>
  ) : null;

  const mobileLinks = isLanding
    ? landingLinks.map((link) => (
        <SheetClose key={link.href} asChild>
          <Link
            href={link.href}
            onClick={(e) => handleNavClick(e, link.href)}
            className="text-text-dark text-base font-medium hover:text-text-primary transition-colors duration-200"
          >
            {link.label}
          </Link>
        </SheetClose>
      ))
    : appLinks.map((link) => {
        const isActive = pathname.startsWith(link.href);
        const Icon = link.icon!;
        return (
          <SheetClose key={link.href} asChild>
            <Link
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "text-primary bg-primary-muted"
                  : "text-text-dark hover:text-text-primary hover:bg-surface-secondary"
              }`}
            >
              <Icon className="size-4" />
              {link.label}
            </Link>
          </SheetClose>
        );
      });

  const mobileActions = isLanding ? (
    isAuthenticated ? (
      <Button
        variant="outline"
        className="w-full"
        onClick={() => signOut()}
      >
        <LogOut className="size-4 mr-2" />
        Sign Out
      </Button>
    ) : (
      <>
        <Link
          href="/login"
          onClick={() =>
            posthog.capture("signup_cta_clicked", {
              label: "sign_in",
              location: "mobile_menu",
            })
          }
        >
          <Button variant="outline" className="w-full" asChild>
            <a href="/login">Sign In</a>
          </Button>
        </Link>
        <Link
          href="/login"
          onClick={() =>
            posthog.capture("signup_cta_clicked", {
              label: "get_started",
              location: "mobile_menu",
            })
          }
        >
          <Button className="w-full" asChild>
            <a href="/login">Get Started</a>
          </Button>
        </Link>
      </>
    )
  ) : isAuthenticated ? (
    <Button
      variant="outline"
      className="w-full"
      onClick={() => signOut()}
    >
      <LogOut className="size-4 mr-2" />
      Sign Out
    </Button>
  ) : null;

  return (
    <header
      className={`h-16 bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-50 transition-all duration-200 ${
        isScrolled ? "shadow-card" : ""
      }`}
    >
      <div className="max-w-1280px mx-auto px-6 h-full">
        <nav
          className="flex items-center justify-between h-full"
          aria-label={isLanding ? "Main navigation" : "App navigation"}
        >
          <Link
            href={homeHref}
            className="text-primary text-xl font-bold tracking-tight flex items-center gap-2"
            aria-label={isLanding ? "TriageAI home" : "TriageAI dashboard"}
          >
            <Logo size={24} />
            TriageAI
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {desktopLinks}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {desktopActions}
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <button
                className="md:hidden p-2 -ml-2 rounded-md text-text-dark hover:bg-surface-secondary transition-colors"
                aria-label="Open menu"
              >
                <Menu className="size-6" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-72 p-6"
              showCloseButton={false}
            >
              <div className="flex justify-end mb-6">
                <SheetClose
                  className="p-2 -mr-2 -mt-2 rounded-md text-text-dark hover:bg-surface-secondary transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="size-6" />
                </SheetClose>
              </div>
              <nav className={`flex flex-col ${isLanding ? "gap-4" : "gap-2"}`}>
                {mobileLinks}
                <div className={`flex flex-col gap-2 ${isLanding ? "pt-4" : "pt-4 mt-4"} border-t border-border`}>
                  {mobileActions}
                </div>
                <div className="flex items-center justify-center pt-4 mt-4 border-t border-border">
                  <ThemeToggle />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
}
