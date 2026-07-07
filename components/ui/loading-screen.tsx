import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type LoadingScreenProps = {
  text?: string;
  variant?: "spinner" | "skeleton";
};

export function LoadingScreen({ text = "Loading...", variant = "spinner" }: LoadingScreenProps) {
  if (variant === "skeleton") {
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="flex items-center gap-3 text-text-secondary text-sm">
        <Loader2 className="size-5 animate-spin" />
        {text}
      </div>
    </div>
  );
}
