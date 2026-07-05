import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { PostHogProvider } from "@/components/PostHogProvider";
import { PostHogAuthWatcher } from "@/components/PostHogAuthWatcher";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "TriageAI — AI-Powered Customer Support Assistant",
  description: "AI that handles your support inbox while you sleep. Auto-responds to routine questions, escalates what matters.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary">
        <PostHogProvider>
          <ConvexClientProvider>
            <ThemeProvider>
              {children}
              <PostHogAuthWatcher />
            </ThemeProvider>
          </ConvexClientProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
