"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Menu, X, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  return (
    <header
      className={`h-16 bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-50 transition-all duration-200 ${
        isScrolled ? "shadow-card" : ""
      }`}
    >
      <div className="max-w-1280px mx-auto px-6 h-full">
        <nav
          className="flex items-center justify-between h-full"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            className="text-primary text-xl font-bold tracking-tight flex items-center gap-2"
            aria-label="TriageAI home"
          >
            <Logo size={24} />
            TriageAI
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-text-dark text-sm font-medium hover:text-text-primary transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="size-4 mr-1.5" />
                Sign Out
              </Button>
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
            )}
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
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <SheetClose key={link.href} asChild>
                    <Link
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className="text-text-dark text-base font-medium hover:text-text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                  {isAuthenticated ? (
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
                  )}
                </div>
                <div className="flex items-center justify-center pt-4 border-t border-border">
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
