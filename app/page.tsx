import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import MarqueeBand from '@/components/sections/MarqueeBand';
import Pillars from '@/components/sections/Pillars';
import HowItWorks from '@/components/sections/HowItWorks';
import ProDetail from '@/components/sections/ProDetail';
import ProfileCTA from '@/components/sections/ProfileCTA';
import Pricing from '@/components/sections/Pricing';
import BlogPreview from '@/components/sections/BlogPreview';
import ScrollReveal from '@/components/ui/ScrollReveal';
import RomeroPopup from '@/components/ui/RomeroPopup';
import QuoteRail from '@/components/ui/QuoteRail';

export const metadata: Metadata = {
  title: 'Quantum Holistic — Nutrición KM0, Herbología & Bienestar con IA',
};

export default function HomePage() {
  return (
    <>
      <RomeroPopup />
      <Navbar />
      <main>
        <Hero />
        <MarqueeBand />
        <QuoteRail />
        <ScrollReveal>
          <Pillars />
        </ScrollReveal>
        <ScrollReveal>
          <HowItWorks />
        </ScrollReveal>
        <ScrollReveal>
          <ProDetail />
        </ScrollReveal>
        <ProfileCTA />
        <ScrollReveal>
          <Pricing />
        </ScrollReveal>
        <ScrollReveal>
          <BlogPreview />
        </ScrollReveal>
      </main>
      <Footer />
    </>
  );
}
