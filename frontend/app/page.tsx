import { HeroSection } from '@/components/landing/hero';
import { FeatureGrid } from '@/components/landing/feature-grid';
import { CallToAction } from '@/components/landing/call-to-action';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 3D Global Ambient Video Background */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        >
          <source src="/videos/Firstpage.mp4" type="video/mp4" />
        </video>
        {/* Subtle warm wash overlay to preserve light mode text legibility */}
        <div className="absolute inset-0 bg-[#F8FAFC]/20 backdrop-blur-[1px]" />
      </div>

      <Navbar />
      <main className="container mx-auto py-12 space-y-20 relative z-10">
        <HeroSection />
        <FeatureGrid />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
