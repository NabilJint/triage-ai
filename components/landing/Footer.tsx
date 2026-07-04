import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border py-6">
      <div className="max-w-1280px mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-muted">
          <p className="text-text-muted">
            TriageAI. Powered by AMD ROCm.
          </p>
          <nav className="flex gap-6" aria-label="Footer navigation">
            <Link
              href="/privacy"
              className="hover:text-text-primary transition-colors duration-200"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-text-primary transition-colors duration-200"
            >
              Terms
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}