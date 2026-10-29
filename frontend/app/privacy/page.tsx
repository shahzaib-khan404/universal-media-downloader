import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';

export const metadata = {
  title: 'Privacy Policy — Universal Media Downloader',
  description: 'Privacy Policy and data retention terms for Universal Media Downloader.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-12 flex-1 max-w-4xl">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Privacy Policy</h1>
        <p className="text-xs text-slate-500 mb-8">Last updated: October 2026</p>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-2">1. No Account Required</h2>
            <p>
              Universal Media Downloader allows public media conversion and extraction without creating an account.
              We issue a secure, anonymous visitor cookie (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">umd_vid</code>) so you can view your personal download history without sharing it with other visitors.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-2">2. Ephemeral Storage & 24-Hour File Lifecycle</h2>
            <p>
              We operate on an ephemeral, zero-permanent-storage architecture. All extracted media files and download job records are automatically deleted from server memory and temporary storage within 24 hours of creation.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-2">3. Data We Process</h2>
            <p>
              We only process the public media URLs you submit for conversion. We do not sell, rent, or share personal data, browsing habits, or download logs with third parties or advertising networks.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
