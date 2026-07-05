"use client";

import Link from "next/link";
import posthog from "posthog-js";
import { Mail, MessageSquare } from "lucide-react";
import { SiGithub } from "react-icons/si";

export function ContactSection() {
  return (
    <section id="contact" className="bg-bg-primary py-16 md:py-24 scroll-mt-16">
      <div className="max-w-1280px mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            Get in Touch
          </h2>
          <p className="text-sm text-text-secondary">
            Have questions? We&apos;d love to hear from you.
          </p>

          <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
            <div className="flex flex-col items-center text-center p-6 bg-surface border border-border rounded-lg">
              <Mail className="text-primary size-8 mb-3" />
              <h3 className="font-semibold text-text-primary">Email Us</h3>
              <p className="mt-2 text-sm text-text-secondary">
                support@triageai.com
              </p>
              <Link
                href="mailto:support@triageai.com"
                className="mt-4 text-sm text-primary hover:underline"
                onClick={() =>
                  posthog.capture("contact_clicked", { method: "email" })
                }
              >
                Send a message →
              </Link>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-surface border border-border rounded-lg">
              <MessageSquare className="text-primary size-8 mb-3" />
              <h3 className="font-semibold text-text-primary">Live Chat</h3>
              <p className="mt-2 text-sm text-text-secondary">
                Available 9am–5pm PST
              </p>
              <Link
                href="/login"
                className="mt-4 text-sm text-primary hover:underline"
                onClick={() =>
                  posthog.capture("contact_clicked", { method: "live_chat" })
                }
              >
                Start chat →
              </Link>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-surface border border-border rounded-lg">
              <SiGithub className="text-primary size-8 mb-3" />
              <h3 className="font-semibold text-text-primary">GitHub</h3>
              <p className="mt-2 text-sm text-text-secondary">
                Report issues or contribute
              </p>
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-sm text-primary hover:underline"
                onClick={() =>
                  posthog.capture("contact_clicked", { method: "github" })
                }
              >
                View repo →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
