import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { PricingPlans } from '@/components/pricing/pricing-plans';

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto py-12 space-y-16">
        <section className="rounded-3xl border border-orange-200/70 bg-gradient-to-b from-[#FFF5ED] via-[#FFEADB] to-[#FEDBC0] p-10 shadow-md shadow-orange-500/5 text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[#FF6B00]">Scalable media solutions</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">Scalable media solutions for every workflow.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-700 font-medium">Unlock high-resolution downloads, batch processing, and dedicated API access. Choose the plan that accelerates your production.</p>
        </section>
        <PricingPlans />
      </main>
      <Footer />
    </div>
  );
}
