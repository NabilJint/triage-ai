"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SettingsCard } from "@/components/ui/settings-card";
import { Globe, Loader2, Save, Check, Building2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Modal,
  ModalTrigger,
  ModalBody,
  ModalContent,
  ModalFooter,
  useModal,
} from "@/components/ui/animated-modal";
import { SuccessOverlay } from "@/components/success/SuccessOverlay";
import { useWebsiteScraper } from "@/lib/hooks/useWebsiteScraper";

export function BusinessContext() {
  const userProfile = useQuery(api.userProfiles.getMe);
  const updateBusinessContext = useMutation(api.userProfiles.updateBusinessContext);

  const [url, setUrl] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const { scrape, loading: loadingWeb, error: fetchError } = useWebsiteScraper();
  const [saved, setSaved] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (userProfile) {
      if (userProfile.business_name) setBusinessName(userProfile.business_name);
      if (userProfile.business_url) setUrl(userProfile.business_url);
      if (userProfile.business_context) setDescription(userProfile.business_context);
    }
  }, [userProfile]);

  const handleAutofill = async () => {
    const result = await scrape(url);
    if (!result) return;
    if (result.summary) {
      setDescription(result.summary);
      if (result.businessName) setBusinessName(result.businessName);
    } else if (result.businessName) {
      setBusinessName(result.businessName);
    }
  };

  const handleSave = async () => {
    await updateBusinessContext({
      business_name: businessName || "My Business",
      business_url: url || undefined,
      business_context: description,
    });
    setShowCelebration(true);
  };

  function ConfirmButton() {
    const { setOpen } = useModal();
    return (
      <button
        onClick={async () => {
          await handleSave();
          setOpen(false);
        }}
        className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary-dark transition-colors"
      >
        Confirm & Save
      </button>
    );
  }

  return (
    <>
      <SuccessOverlay
        open={showCelebration}
        onClose={() => {
          setShowCelebration(false);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
      />
      <SettingsCard
        title="Business Context"
        description="Provide the details the AI needs to draft accurate, policy-aware replies about your products and policies."
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Business Name
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted pointer-events-none" />
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
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
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
              <Button
                onClick={handleAutofill}
                disabled={loadingWeb || !url}
                className="shrink-0"
              >
                {loadingWeb ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Fetch Context"
                )}
              </Button>
            </div>
            {fetchError && (
              <p className="text-xs text-error mt-1.5">{fetchError}</p>
            )}
            <p className="text-xs text-text-muted mt-1.5">
              Optional: We&apos;ll scan your site to pre-fill your business details.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Business Description &amp; Policies
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you sell, your shipping/return policies, business hours, and any other details the AI should know about your business..."
              rows={6}
              className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
            />
          </div>

          <div className="flex justify-end border-t border-border pt-4">
            <Modal>
              <ModalTrigger
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
              >
                {saved ? (
                  <>
                    <Check className="size-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Save Context
                  </>
                )}
              </ModalTrigger>
              <ModalBody>
                <ModalContent>
                  <h4 className="text-lg font-semibold text-text-primary mb-2">
                    Save Business Context
                  </h4>
                  <p className="text-sm text-text-secondary">
                    This information will be used by the AI agent when classifying
                    emails and drafting replies. Are you sure you want to save
                    these details?
                  </p>
                </ModalContent>
                <ModalFooter>
                  <ConfirmButton />
                </ModalFooter>
              </ModalBody>
            </Modal>
          </div>
        </div>
      </SettingsCard>
    </>
  );
}
