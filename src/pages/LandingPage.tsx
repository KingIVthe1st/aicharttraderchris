import Header from "../components/Header";
import Hero from "../components/Hero";
import LogoCarousel from "../components/LogoCarousel";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";
import Testimonials from "../components/Testimonials";
import Pricing from "../components/Pricing";
import FAQ from "../components/FAQ";
import FinalCTA from "../components/FinalCTA";
import { Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <LogoCarousel />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <footer className="bg-dark-800 border-t border-white/5 py-8">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="relative">
                <Sparkles className="w-7 h-7 text-purple-400 animate-pulse" />
                <div className="absolute inset-0 blur-lg animate-pulse bg-purple-500/50" />
              </div>
              <span className="text-lg font-bold gradient-text">
                AI Chart Trader
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-black bg-gradient-to-r from-purple-500 to-cyan-400 text-white rounded">
                3.0
              </span>
            </div>
            <p className="text-white/60 text-sm">
              © 2025 AI Chart Trader. Institutional Clarity. Retail Agility.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
