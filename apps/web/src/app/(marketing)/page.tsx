import { LandingNav } from "@/components/marketing/landing-nav";
import { HeroSection } from "@/components/marketing/hero-section";
import { LogoBar } from "@/components/marketing/logo-bar";
import { FeaturesSection } from "@/components/marketing/features-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { FrameworksSection } from "@/components/marketing/frameworks-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { LandingFooter } from "@/components/marketing/landing-footer";

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <main>
        <HeroSection />
        <LogoBar />
        <FeaturesSection />
        <HowItWorksSection />
        <FrameworksSection />
        <PricingSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </>
  );
}
