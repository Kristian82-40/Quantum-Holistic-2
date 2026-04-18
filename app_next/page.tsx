import { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'Quantum Holistic — Nutrición KM0, Herbología & Bienestar con IA',
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <MarqueeBand />
        <StatsBar />
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
