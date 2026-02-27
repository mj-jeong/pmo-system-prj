import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingLogoCloud } from "@/components/landing/LandingLogoCloud";
import { LandingProblem } from "@/components/landing/LandingProblem";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingTrust } from "@/components/landing/LandingTrust";
import { LandingCta } from "@/components/landing/LandingCta";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div className="landing-root min-h-screen bg-white text-slate-900">
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingLogoCloud />
        <LandingProblem />
        <LandingHowItWorks />
        <LandingFeatures />
        <LandingTrust />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
