"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Globe, Loader2, Building2 } from "lucide-react";
import { useWebsiteScraper } from "@/lib/hooks/useWebsiteScraper";

type Props = {
  onNext: () => void;
  onBack: () => void;
  businessUrl: string;
  businessName: string;
  businessDescription: string;
  onUpdateUrl: (url: string) => void;
  onUpdateName: (name: string) => void;
  onUpdateDescription: (desc: string) => void;
};

export function StepBusinessContext({
  onNext,
  onBack,
  businessUrl,
  businessName,
  businessDescription,
  onUpdateUrl,
  onUpdateName,
  onUpdateDescription,
}: Props) {
  const [urlError, setUrlError] = useState(false);
  const { scrape, loading, error: fetchError } = useWebsiteScraper();

  const handleAutofill = async () => {
    const result = await scrape(businessUrl);
    if (!result) return;
    if (result.summary) {
      onUpdateDescription(result.summary);
      if (result.businessName) onUpdateName(result.businessName);
    } else if (result.businessName) {
      onUpdateName(result.businessName);
    }
  };

  const handleNext = () => {
    if (businessUrl && !/^https?:\/\/.+/.test(businessUrl)) {
      setUrlError(true);
      return;
    }
    if (!businessUrl && !businessDescription) {
      setUrlError(true);
      return;
    }
    setUrlError(false);
    onNext();
  };

  return (
    <Card className="bg-surface border-border shadow-card">
      <CardContent className="flex flex-col p-8">
        <h1 className="text-xl font-bold text-text-primary mb-1">
          Tell us about your business
        </h1>
        <p className="text-sm text-text-secondary mb-6 leading-relaxed">
          Enter your website URL to auto-fill your business details, or describe
          your business manually below.
        </p>

        <div className="space-y-5">
          <div>
            <label htmlFor="url" className="block text-sm font-semibold text-text-primary mb-1.5">
              Website URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-text-muted pointer-events-none" />
                <input
                  id="url"
                  type="url"
                  value={businessUrl}
                  onChange={(e) => {
                    setUrlError(false);
                    onUpdateUrl(e.target.value);
                  }}
                  placeholder="https://yourcompany.com"
                  className={`w-full bg-surface border rounded-md pl-10 pr-4 py-3.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 transition-all ${
                    urlError
                      ? "border-error focus:border-error focus:ring-error/20"
                      : "border-border focus:border-primary focus:ring-primary"
                  }`}
                />
              </div>
              <Button
                onClick={handleAutofill}
                disabled={loading || !businessUrl}
                className="shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  "Fetch Context"
                )}
              </Button>
            </div>
            {urlError && (
              <p className="text-xs text-error mt-1.5">
                {businessUrl
                  ? "Please enter a valid URL starting with http:// or https://"
                  : "Enter your website URL or describe your business below."}
              </p>
            )}
            {fetchError && (
              <p className="text-xs text-text-muted mt-1.5">{fetchError}</p>
            )}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-text-primary mb-1.5">
              Business Name
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-text-muted pointer-events-none" />
              <input
                id="name"
                type="text"
                value={businessName}
                onChange={(e) => onUpdateName(e.target.value)}
                placeholder="Your Business Name"
                className="w-full bg-surface border border-border rounded-md pl-10 pr-4 py-3.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="desc" className="block text-sm font-semibold text-text-primary mb-1.5">
              Business description
            </label>
            <textarea
              id="desc"
              value={businessDescription}
              onChange={(e) => onUpdateDescription(e.target.value)}
              placeholder="Describe what you sell, your policies, hours — or skip if you auto-filled above..."
              rows={4}
              className="w-full bg-surface border border-border rounded-md px-4 py-3.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
            />
            <p className="text-xs text-text-muted mt-1.5">
              You can always add more details in Settings later.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <Button variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="size-[18px]" />
            Back
          </Button>
          <Button onClick={handleNext} size="lg" className="flex-[2]">
            Continue
            <ArrowRight className="size-[18px]" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
