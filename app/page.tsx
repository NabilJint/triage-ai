import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/landing/Hero";
import { PoweredBy } from "@/components/landing/PoweredBy";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { ContactSection } from "@/components/landing/ContactSection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg-primary">
        <Hero />
        <PoweredBy />
        <Features />
        <HowItWorks />
        <Pricing />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}