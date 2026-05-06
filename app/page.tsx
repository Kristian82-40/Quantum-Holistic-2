import { Metadata } from 'next';
import Image from 'next/image';

export const dynamic = 'force-dynamic';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import MarqueeBand from '@/components/sections/MarqueeBand';
import StatsBar from '@/components/sections/StatsBar';
import Pillars from '@/components/sections/Pillars';
import HowItWorks from '@/components/sections/HowItWorks';
import ProDetail from '@/components/sections/ProDetail';
import ProfileCTA from '@/components/sections/ProfileCTA';
import Testimonials from '@/components/sections/Testimonials';
import Pricing from '@/components/sections/Pricing';
import BlogPreview from '@/components/sections/BlogPreview';
import ScrollReveal from '@/components/ui/ScrollReveal';
import RomeroPopup from '@/components/ui/RomeroPopup';
import QuoteRail from '@/components/ui/QuoteRail';
import BioZenScene from '@/components/ui/BioZenScene';

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
        <StatsBar />
        <ScrollReveal>
          <Pillars />
        </ScrollReveal>
        <section id="biozen-scene" className="section">
          <Image
            src="/images/biozen-hydrosol-journey-cientifica.jpg"
            alt="BioZen hydrosol journey: Artemisia annua seed to final product"
            width={2560}
            height={1440}
            priority={false}
            className="w-full h-auto"
          />
        </section>
        <ScrollReveal>
          <HowItWorks />
        </ScrollReveal>
        <ScrollReveal>
          <ProDetail />
        </ScrollReveal>
        <ProfileCTA />
        <ScrollReveal>
          <Testimonials />
        </ScrollReveal>
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
