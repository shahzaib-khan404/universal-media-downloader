import { HeroSection } from '@/components/landing/hero';
import { FeatureGrid } from '@/components/landing/feature-grid';
import { CallToAction } from '@/components/landing/call-to-action';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto py-12 space-y-20">
        <HeroSection />
        <FeatureGrid />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
