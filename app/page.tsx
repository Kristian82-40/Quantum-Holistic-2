import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import HowItWorks from '@/components/sections/HowItWorks';
import ProDetail from '@/components/sections/ProDetail';
import Pillars from '@/components/sections/Pillars';
import Pricing from '@/components/sections/Pricing';
import BlogPreview from '@/components/sections/BlogPreview';
import MarqueeBand from '@/components/sections/MarqueeBand';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <MarqueeBand />
        <HowItWorks />
        <Pillars />
        <ProDetail />
        <Pricing />
        <BlogPreview />
      </main>
      <Footer />
    </>
  );
}
