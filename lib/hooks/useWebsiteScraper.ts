"use client";

import { useState } from "react";

type ScrapeResult = {
  summary: string;
  businessName: string;
  note?: string;
};

export function useWebsiteScraper() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const scrape = async (url: string): Promise<ScrapeResult | null> => {
    if (!url || !/^https?:\/\/.+/.test(url)) {
      setError("Please enter a valid URL starting with http:// or https://");
      return null;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/scrape-summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (res.ok && data.summary) {
        return { summary: data.summary, businessName: data.businessName };
      }
      if (res.ok && data.businessName) {
        setError(data.note || "");
        return { summary: "", businessName: data.businessName, note: data.note };
      }
      setError(data.error || "Could not fetch website content.");
      return null;
    } catch {
      setError("Network error. Try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { scrape, loading, error, reset: () => setError("") };
}
