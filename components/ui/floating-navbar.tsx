"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  motion,
} from "motion/react";
import { cn } from "@/lib/utils";

export const FloatingNav = ({
  navItems,
  className,
  children,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: React.ReactNode;
  }[];
  className?: string;
  children?: React.ReactNode;
}) => {
  const pathname = usePathname();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex fixed top-3 inset-x-0 mx-auto z-[5000] items-center justify-center",
        className
      )}
    >
      <div className="flex items-center justify-center gap-1 rounded-full border border-border bg-surface/80 px-3 py-1.5 shadow-card backdrop-blur-lg w-auto min-w-[280px] sm:min-w-[440px]">
        <div className="flex items-center gap-0.5">
          {navItems.map((navItem, idx: number) => {
            const isActive = pathname === navItem.link ||
              (navItem.link !== "/dashboard" && pathname.startsWith(navItem.link));
            return (
              <Link
                key={`link-${idx}`}
                href={navItem.link}
                className={cn(
                  "relative flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "text-primary bg-primary-muted"
                    : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                )}
              >
                <span className="block sm:hidden">{navItem.icon}</span>
                <span className="hidden sm:block">{navItem.name}</span>
              </Link>
            );
          })}
        </div>

        {children && (
          <>
            <div className="h-5 w-px bg-border" />
            {children}
          </>
        )}
      </div>
    </motion.div>
  );
};
