"use client";

import posthog from "posthog-js";
import { motion } from "motion/react";
import { FadeInUp } from "./FadeInUp";
import { staggerContainer, staggerItem } from "@/lib/variants";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for small teams getting started with AI triage.",
    features: [
      "Up to 500 emails/month",
      "Auto-reply for routine questions",
      "Smart escalation rules",
      "Email support",
    ],
    cta: "Start Free Trial",
    featured: false,
  },
  {
    name: "Growth",
    price: "$79",
    period: "/month",
    description: "For growing teams that need more volume and control.",
    features: [
      "Up to 2,500 emails/month",
      "Unlimited custom rules",
      "Priority support",
      "Team collaboration",
      "Reply tone customization",
    ],
    cta: "Start Free Trial",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/month",
    description: "For businesses with high-volume support needs.",
    features: [
      "Up to 10,000 emails/month",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "Advanced analytics",
      "Custom AI model tuning",
    ],
    cta: "Contact Sales",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-bg-primary py-16 md:py-24 scroll-mt-16">
      <div className="max-w-1280px mx-auto px-6">
        <FadeInUp delay={0.1} className="text-center mb-12 md:mb-16">
          <h2 className="text-lg font-semibold text-text-primary mb-2">Simple, Transparent Pricing</h2>
          <p className="text-sm text-text-secondary max-w-2xl mx-auto">
            Choose the plan that&apos;s right for your team. All plans include a 14-day free trial.
          </p>
        </FadeInUp>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-3 gap-6 lg:gap-8"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={staggerItem}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-surface p-6 lg:p-8",
                plan.featured
                  ? "border-primary shadow-lg scale-105 md:scale-110"
                  : "border-border",
              )}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-primary">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl md:text-4xl font-bold text-text-darkest">{plan.price}</span>
                  <span className="text-sm text-text-muted">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-text-secondary">{plan.description}</p>
              </div>
              <ul className="flex-1 space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-text-secondary">
                    <Check className="size-4 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                onClick={() =>
                  posthog.capture("pricing_cta_clicked", {
                    plan: plan.name.toLowerCase(),
                    cta: plan.cta,
                    featured: plan.featured,
                  })
                }
              >
                <Button
                  variant={plan.featured ? "default" : "outline"}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}