"use client";

import React from "react";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { SiAmd } from "react-icons/si";

const brands = [
  {
    quote: "GPU-accelerated embedding compute on AMD Instinct hardware with ROCm",
    name: "AMD ROCm",
    title: "GPU-Accelerated Embedding Compute",
    logo: <SiAmd className="text-amd" size={72} aria-hidden="true" />,
  },
  {
    quote: "Sub-second LLM inference for email classification and reply drafting",
    name: "Fireworks AI",
    title: "Fast LLM Inference",
    logo: (
      <svg height="1em" style={{ flex: "none", lineHeight: 1 }} viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="size-16 md:size-[72px]">
        <title>Fireworks</title>
        <path clipRule="evenodd" d="M14.8 5l-2.801 6.795L9.195 5H7.397l3.072 7.428a1.64 1.64 0 003.038.002L16.598 5H14.8zm1.196 10.352l5.124-5.244-.699-1.669-5.596 5.739a1.664 1.664 0 00-.343 1.807 1.642 1.642 0 001.516 1.012L16 17l8-.02-.699-1.669-7.303.041h-.002zM2.88 10.104l.699-1.669 5.596 5.739c.468.479.603 1.189.343 1.807a1.643 1.643 0 01-1.516 1.012l-8-.018-.002.002.699-1.669 7.303.042-5.122-5.246z" fill="#5019C5" fillRule="evenodd" />
      </svg>
    ),
  },
  {
    quote: "Reactive backend with realtime sync, ACID guarantees, and type-safe queries",
    name: "Convex",
    title: "Reactive Backend Platform",
    logo: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="31 31.5 122 125" aria-hidden="true" className="size-16 md:size-[72px]">
        <path d="M108.092 130.021C126.258 128.003 143.385 118.323 152.815 102.167C148.349 142.128 104.653 167.385 68.9858 151.878C65.6992 150.453 62.8702 148.082 60.9288 145.034C52.9134 132.448 50.2786 116.433 54.0644 101.899C64.881 120.567 86.8748 132.01 108.092 130.021Z" fill="#F3B01C" />
        <path d="M53.4012 90.1735C46.0375 107.191 45.7186 127.114 54.7463 143.51C22.9759 119.608 23.3226 68.4578 54.358 44.7949C57.2286 42.6078 60.64 41.3097 64.2178 41.1121C78.9312 40.336 93.8804 46.0225 104.364 56.6193C83.0637 56.831 62.318 70.4756 53.4012 90.1735Z" fill="#8D2676" />
        <path d="M114.637 61.8552C103.89 46.8701 87.0686 36.6684 68.6387 36.358C104.264 20.1876 148.085 46.4045 152.856 85.1654C153.3 88.7635 152.717 92.4322 151.122 95.6775C144.466 109.195 132.124 119.679 117.702 123.559C128.269 103.96 126.965 80.0151 114.637 61.8552Z" fill="#EE342F" />
      </svg>
    ),
  },
];

export function PoweredBy() {
  return (
    <section id="powered-by" className="bg-bg-primary py-16 md:py-20 scroll-mt-16">
      <div className="max-w-1280px mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-lg font-semibold text-text-primary mb-2">Powered By</h2>
          <p className="text-sm text-text-secondary max-w-2xl mx-auto">
            TriageAI runs on best-in-class infrastructure from AMD, Fireworks AI, and Convex
          </p>
        </div>
        <InfiniteMovingCards
          items={brands}
          direction="left"
          speed="normal"
          pauseOnHover={true}
          className="py-4"
        />
      </div>
    </section>
  );
}