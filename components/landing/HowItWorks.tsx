"use client";

import { motion } from "motion/react";
import { FadeInUp } from "./FadeInUp";
import { staggerContainer, staggerItem } from "@/lib/variants";

const steps = [
  {
    number: "01",
    title: "Connect Your Inbox",
    description: "Link Gmail or Outlook in one click. TriageAI starts reading emails instantly — no forwarding, no setup headaches.",
  },
  {
    number: "02",
    title: "AI Classifies & Drafts",
    description: "Every email is analyzed, classified by type and urgency, and a reply is drafted using your tone, knowledge base, and rules.",
  },
  {
    number: "03",
    title: "You Review & Approve",
    description: "See every decision with confidence scores and reasoning. Edit, approve, or escalate — AI never sends without you.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-bg-primary py-16 md:py-24 scroll-mt-16">
      <div className="max-w-1280px mx-auto px-6">
        <FadeInUp delay={0.1} className="text-center mb-12 md:mb-16">
          <h2 className="text-lg font-semibold text-text-primary">How It Works</h2>
        </FadeInUp>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-3 gap-8 md:gap-12"
        >
          {steps.map((step) => (
            <motion.div key={step.number} variants={staggerItem} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary/30 mb-3">
                {step.number}
              </div>
              <h3 className="text-base md:text-lg font-semibold text-text-primary mb-2">
                {step.title}
              </h3>
              <p className="text-sm md:text-base text-text-secondary leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}