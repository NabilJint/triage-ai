"use client";

import { useState, useEffect } from "react";
import { SettingsCard } from "@/components/ui/settings-card";
import { Save, Check } from "lucide-react";
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
import { BusinessContextForm } from "@/components/business/BusinessContextForm";

export function BusinessContext() {
  const userProfile = useQuery(api.userProfiles.getMe);
  const updateBusinessContext = useMutation(api.userProfiles.updateBusinessContext);

  const [url, setUrl] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (userProfile) {
      if (userProfile.business_name) setBusinessName(userProfile.business_name);
      if (userProfile.business_url) setUrl(userProfile.business_url);
      if (userProfile.business_context) setDescription(userProfile.business_context);
    }
  }, [userProfile]);

  const handleSave = async () => {
    try {
      await updateBusinessContext({
        business_name: businessName || "My Business",
        business_url: url || undefined,
        business_context: description,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      console.error("Failed to save business context");
    }
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
    <SettingsCard
      title="Business Context"
      description="Provide the details the AI needs to draft accurate, policy-aware replies about your products and policies."
    >
      <BusinessContextForm
        url={url}
        name={businessName}
        description={description}
        onUrlChange={setUrl}
        onNameChange={setBusinessName}
        onDescriptionChange={setDescription}
      />

      <div className="flex justify-end border-t border-border pt-4 mt-6">
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
    </SettingsCard>
  );
}
