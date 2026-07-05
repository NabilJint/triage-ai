"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Globe } from "lucide-react";

type Props = {
  onNext: () => void;
  onBack: () => void;
  businessUrl: string;
  businessDescription: string;
  onUpdateUrl: (url: string) => void;
  onUpdateDescription: (desc: string) => void;
};

export function StepBusinessContext({
  onNext,
  onBack,
  businessUrl,
  businessDescription,
  onUpdateUrl,
  onUpdateDescription,
}: Props) {
  const [urlError, setUrlError] = useState(false);

  const handleNext = () => {
    if (businessUrl && !/^https?:\/\/.+/.test(businessUrl)) {
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
          Help TriageAI understand your business so it can craft accurate,
          on-brand responses to your customers.
        </p>

        <div className="space-y-5">
          <div>
            <label htmlFor="url" className="block text-sm font-semibold text-text-primary mb-1.5">
              Website URL
            </label>
            <div className="relative">
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
                    : "border-border focus:border-secondary focus:ring-secondary"
                }`}
              />
            </div>
            {urlError && (
              <p className="text-xs text-error mt-1.5">
                Please enter a valid URL starting with http:// or https://
              </p>
            )}
          </div>

          <div>
            <label htmlFor="desc" className="block text-sm font-semibold text-text-primary mb-1.5">
              Business description
            </label>
            <textarea
              id="desc"
              value={businessDescription}
              onChange={(e) => onUpdateDescription(e.target.value)}
              placeholder="Describe what your business does, your products/services, and your typical customer..."
              rows={4}
              className="w-full bg-surface border border-border rounded-md px-4 py-3.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all resize-none"
            />
            <p className="text-xs text-text-muted mt-1.5">
              The more detail you provide, the better TriageAI will understand your business.
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
