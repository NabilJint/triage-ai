"use client";

import { motion } from "motion/react";
import { Mail, AlertTriangle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { FadeInUp } from "./FadeInUp";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/variants";

const featureCards = [
  {
    title: "Auto-Responds",
    description:
      "TriageAI drafts accurate replies for routine questions — password resets, shipping status, FAQs — using your knowledge base and brand voice.",
    icon: Mail,
  },
  {
    title: "Escalates Smartly",
    description:
      "Complex issues (billing disputes, legal threats, VIPs) are instantly flagged and routed to the right human with full context and suggested actions.",
    icon: AlertTriangle,
  },
  {
    title: "Full Transparency",
    description:
      "Every decision shows the classification, confidence score, and reasoning. You can override, edit, or approve — AI never sends without you.",
    icon: Eye,
  },
];

export function Features() {
  return (
    <section id="features" className="bg-bg-primary py-16 md:py-24 scroll-mt-16">
      <div className="max-w-1280px mx-auto px-6">
        <FadeInUp delay={0.1} className="text-center mb-12 md:mb-16">
          <h2 className="text-lg font-semibold text-text-primary">Precision Utility at Scale</h2>
        </FadeInUp>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {featureCards.map((card, idx) => (
            <motion.div
              key={card.title}
              variants={staggerItem}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group"
            >
              <div className={cn(
                "bg-surface border border-border rounded-lg p-6 shadow-card h-full transition-colors duration-200 hover:border-primary/30"
              )}>
                <div className="text-primary mb-4" aria-hidden="true">
                  <card.icon className="size-8" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-semibold text-text-primary mt-4 mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed mt-2">
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}