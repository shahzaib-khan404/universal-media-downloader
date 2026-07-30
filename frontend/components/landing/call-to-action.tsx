import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CallToAction() {
  return (
    <section className="rounded-3xl bg-gradient-to-br from-accentSoft/90 to-accent/80 p-10 md:p-14">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            Ready to start downloading?
          </h2>
          <p className="mt-3 text-sm text-white/70">
            Join over 2.4 million power users archiving the web.
          </p>
          <div className="mt-6 flex gap-10">
            <div>
              <p className="text-2xl font-bold text-white">240M+</p>
              <p className="text-[10px] uppercase tracking-widest text-white/60">
                Media Files Processed
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">99.9%</p>
              <p className="text-[10px] uppercase tracking-widest text-white/60">Success Rate</p>
            </div>
          </div>
        </div>
        <Link
          href="/pricing"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-semibold text-indigo-900 transition-colors hover:bg-white/90"
        >
          Get Started for Free
        </Link>
      </div>
    </section>
  );
}
