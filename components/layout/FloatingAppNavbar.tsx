"use client";

import { useScrollPosition } from "@/lib/hooks/useScrollPosition";

type FloatingAppNavbarProps = {
  children: React.ReactNode;
};

export function FloatingAppNavbar({ children }: FloatingAppNavbarProps) {
  const isScrolled = useScrollPosition(10);

  return (
    <header
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl rounded-full bg-surface/90 backdrop-blur-lg border border-border shadow-lg transition-all duration-300 ${
        isScrolled ? "shadow-xl" : ""
      }`}
    >
      <nav
        className="flex items-center justify-between h-14 px-6"
        aria-label="Floating app navigation"
      >
        {children}
      </nav>
    </header>
  );
}
