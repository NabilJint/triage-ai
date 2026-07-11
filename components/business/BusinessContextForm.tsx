"use client";

import { Globe, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebsiteScraper } from "@/lib/hooks/useWebsiteScraper";

type BusinessContextFormProps = {
  url: string;
  name: string;
  description: string;
  urlError?: boolean;
  onUrlChange: (url: string) => void;
  onNameChange: (name: string) => void;
  onDescriptionChange: (desc: string) => void;
};

export function BusinessContextForm({
  url,
  name,
  description,
  urlError,
  onUrlChange,
  onNameChange,
  onDescriptionChange,
}: BusinessContextFormProps) {
  const { scrape, loading, error: fetchError } = useWebsiteScraper();

  const handleAutofill = async () => {
    const result = await scrape(url);
    if (!result) return;
    if (result.summary) {
      onDescriptionChange(result.summary);
      if (result.businessName) onNameChange(result.businessName);
    } else if (result.businessName) {
      onNameChange(result.businessName);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Business Name
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Your Business Name"
            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Auto-fill from Website
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted pointer-events-none" />
            <input
              type="url"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="https://yourwebsite.com"
              className={`w-full bg-surface border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 transition-all ${
                urlError
                  ? "border-error focus:border-error focus:ring-error/20"
                  : "border-border focus:border-primary focus:ring-primary"
              }`}
            />
          </div>
          <Button
            onClick={handleAutofill}
            disabled={loading || !url}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Fetch Context"
            )}
          </Button>
        </div>
        {urlError && (
          <p className="text-xs text-error mt-1.5">
            Please enter a valid URL starting with http:// or https://
          </p>
        )}
        {fetchError && (
          <p className="text-xs text-error mt-1.5">{fetchError}</p>
        )}
        <p className="text-xs text-text-muted mt-1.5">
          We&apos;ll scan your site to pre-fill your business details.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Business Description &amp; Policies
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe what you sell, your shipping/return policies, business hours, and any other details the AI should know about your business..."
          rows={6}
          className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
        />
      </div>
    </div>
  );
}
