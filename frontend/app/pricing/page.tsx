import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { PricingPlans } from '@/components/pricing/pricing-plans';

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto py-12 space-y-16">
        <section className="rounded-3xl border border-border bg-surface p-10 shadow-card text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.4em] text-accent">Scalable media solutions</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">Scalable media solutions for every workflow.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted">Unlock high-resolution downloads, batch processing, and dedicated API access. Choose the plan that accelerates your production.</p>
        </section>
        <PricingPlans />
      </main>
      <Footer />
    </div>
  );
}
