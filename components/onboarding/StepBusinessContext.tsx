"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { BusinessContextForm } from "@/components/business/BusinessContextForm";

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

        <BusinessContextForm
          url={businessUrl}
          name={businessName}
          description={businessDescription}
          urlError={urlError}
          onUrlChange={(url) => {
            setUrlError(false);
            onUpdateUrl(url);
          }}
          onNameChange={onUpdateName}
          onDescriptionChange={onUpdateDescription}
        />

        <p className="text-xs text-text-muted mt-3">
          You can always add more details in Settings later.
        </p>

        <div className="flex gap-3 mt-6">
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
