import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import QuoteRail from '@/components/ui/QuoteRail';
import MarqueeBand from '@/components/sections/MarqueeBand';
import HowItWorks from '@/components/sections/HowItWorks';
import Pillars from '@/components/sections/Pillars';
import ProDetail from '@/components/sections/ProDetail';
import ProfileCTA from '@/components/sections/ProfileCTA';
import Pricing from '@/components/sections/Pricing';
import BlogPreview from '@/components/sections/BlogPreview';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <QuoteRail />
        <MarqueeBand />
        <HowItWorks />
        <Pillars />
        <ProDetail />
        <ProfileCTA />
        <Pricing />
        <BlogPreview />
      </main>
      <Footer />
    </>
  );
}
