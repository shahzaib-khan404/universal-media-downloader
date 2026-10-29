import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';

export const metadata = {
  title: 'Terms of Service — Universal Media Downloader',
  description: 'Terms of service, acceptable use, and copyright compliance.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-12 flex-1 max-w-4xl">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Terms of Service</h1>
        <p className="text-xs text-slate-500 mb-8">Last updated: October 2026</p>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-2">1. Permitted Use</h2>
            <p>
              Universal Media Downloader provides tools for backing up, converting, and accessing media you own or have legal rights to download (such as public domain, Creative Commons, or personal archive content).
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-2">2. Copyright & Intellectual Property</h2>
            <p>
              Users must respect intellectual property rights. You agree not to use this service to infringe upon the copyrights, trademarks, or proprietary rights of creators and platforms.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-2">3. DMCA & Takedown Requests</h2>
            <p>
              If you are a copyright owner or an agent thereof and believe any material processed through this service infringes upon your copyrights, please submit a formal takedown request with relevant URLs and proof of ownership to legal@universal-media-downloader.com.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
