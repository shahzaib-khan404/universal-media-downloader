'use client';

import { useState } from 'react';
import { Check, X, ChevronDown, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type Billing = 'monthly' | 'yearly';

const plans = [
  {
    name: 'Free',
    desc: 'Essential tools for individual users.',
    price: { monthly: '$0', yearly: '$0' },
    features: ['Up to 1080p Resolution', 'Single file downloads', 'Standard speed'],
    cta: 'Current Plan',
    ctaStyle: 'ghost' as const,
    highlighted: false,
  },
  {
    name: 'Pro',
    desc: 'Advanced features for creators & pros.',
    price: { monthly: '$19', yearly: '$15' },
    features: [
      'Uncapped 4K/8K Resolution',
      'Batch processing (Unlimited)',
      'High-speed parallel lanes',
      'Remove all watermarks',
    ],
    cta: 'Upgrade to Pro',
    ctaStyle: 'default' as const,
    highlighted: true,
    badge: 'RECOMMENDED',
  },
  {
    name: 'Enterprise',
    desc: 'High-volume solutions for teams.',
    price: { monthly: 'Custom', yearly: 'Custom' },
    features: [
      'REST API Access',
      'Team seat management',
      'White-glove 24/7 support',
      'SLA & Custom Contracts',
    ],
    cta: 'Contact Sales',
    ctaStyle: 'secondary' as const,
    highlighted: false,
    bigPrice: true,
  },
];

const comparisons = [
  { feature: 'Resolution Limit', free: '1080p', pro: '8K Ultra HD', ent: 'Uncapped', proAccent: false },
  { feature: 'Concurrent Tasks', free: '1 Task', pro: 'Unlimited', ent: 'Custom Queueing', proAccent: true },
  { feature: 'Download Speed', free: 'Standard', pro: 'Turbo (+500%)', ent: 'Dedicated Fiber Lanes', proAccent: true },
  { feature: 'Formats', free: 'MP4, MP3', pro: 'All (HEVC, FLAC, RAW)', ent: 'Custom Encoding', proAccent: true },
  { feature: 'API Access', free: null, pro: 'Limited Webhooks', ent: 'Full REST/GraphQL', proAccent: false },
  { feature: 'Support', free: 'Community', pro: 'Priority Email', ent: 'Dedicated Manager', proAccent: true },
];

const testimonials = [
  {
    quote:
      '"UMD Pro has completely transformed my video editing workflow. No more waiting for hours for stock assets to download."',
    name: 'James Smith',
    role: 'Motion Designer',
    initials: 'JS',
  },
  {
    quote:
      '"The API integration for our enterprise plan was seamless. Reliability is 99.9% — essential for our platform."',
    name: 'Anya Kovic',
    role: 'CTO, MediaFlux',
    initials: 'AK',
  },
  {
    quote:
      '"Fastest downloader I\'ve ever used. The 8K support is actually real and works perfectly with high-bitrate files."',
    name: 'Riley Chen',
    role: 'YouTube Creator',
    initials: 'RC',
  },
];

const faqs = [
  {
    q: 'Can I cancel my subscription at any time?',
    a: 'Yes, you can cancel anytime. Your access continues until the end of the billing period.',
  },
  {
    q: 'How does the API billing work?',
    a: 'API usage is metered. Each plan includes a base quota, with overages billed per request.',
  },
  {
    q: 'Is my data and history secure?',
    a: 'We process downloads in isolated sandboxes and never retain your media beyond the download window.',
  },
  {
    q: 'Do you offer student discounts?',
    a: 'Yes, we offer 50% off Pro for verified students. Contact support with your .edu email.',
  },
];

export function PricingPlans() {
  const [billing, setBilling] = useState<Billing>('yearly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="space-y-20">
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3">
        <span className={`text-sm font-semibold ${billing === 'monthly' ? 'text-slate-900' : 'text-slate-500'}`}>
          Monthly
        </span>
        <button
          onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
          className={`relative h-7 w-12 rounded-full transition-all duration-300 border border-slate-300 p-0.5 ${
            billing === 'yearly' ? 'bg-[#FF6B00]' : 'bg-slate-200'
          }`}
        >
          <span
            className={`block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
              billing === 'yearly' ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <span className={`text-sm font-semibold ${billing === 'yearly' ? 'text-slate-900' : 'text-slate-500'}`}>
          Yearly
        </span>
        <span className="rounded-full bg-[#FF6B00]/15 border border-[#FF6B00]/30 px-3 py-1 text-xs font-bold text-[#FF6B00] shadow-sm">
          2 months free ✨
        </span>
      </div>

      {/* Plans */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-3xl p-8 transition-all duration-300 ${
              plan.highlighted
                ? 'bg-gradient-to-b from-[#FFF0E5] via-[#FFE5D3] to-[#FED7BA] border-2 border-[#FF6B00] shadow-[0_15px_40px_rgba(255,107,0,0.25)] -translate-y-2'
                : 'bg-gradient-to-b from-[#FFF8F3] to-[#FFEEDB] border border-[#FF6B00]/30 hover:border-[#FF6B00] hover:shadow-[0_10px_30px_rgba(255,107,0,0.18)] hover:-translate-y-1 shadow-sm'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FFA040] px-4 py-1 text-xs font-bold text-white shadow-md uppercase tracking-wider">
                  {plan.badge}
                </span>
              </div>
            )}

            <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
            <p className="mt-1 text-sm text-slate-600 font-medium">{plan.desc}</p>

            <div className="my-6">
              <span className={`font-black text-slate-900 tracking-tight ${plan.bigPrice ? 'text-4xl' : 'text-5xl'}`}>
                {billing === 'monthly' ? plan.price.monthly : plan.price.yearly}
              </span>
              {plan.price.monthly !== 'Custom' && (
                <span className="text-sm font-semibold text-slate-500 ml-1">/mo</span>
              )}
            </div>

            <ul className="mb-8 space-y-3.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#FF6B00]/15 text-[#FF6B00]">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span className="text-slate-700 font-medium">{f}</span>
                </li>
              ))}
            </ul>

            {plan.ctaStyle === 'default' && (
              <Button className="w-full btn-3d-orange font-bold py-6 text-base text-white">{plan.cta}</Button>
            )}
            {plan.ctaStyle === 'secondary' && (
              <Button variant="secondary" className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 font-semibold py-6 text-base">{plan.cta}</Button>
            )}
            {plan.ctaStyle === 'ghost' && (
              <p className="text-center text-sm font-medium text-slate-500 py-3">{plan.cta}</p>
            )}
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <section>
        <h2 className="mb-8 text-center text-3xl font-extrabold text-slate-900">
          Compare <span className="text-[#FF6B00]">Capabilities</span>
        </h2>
        <div className="overflow-hidden rounded-3xl glass-panel border border-slate-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                {['Technical Feature', 'Free', 'Pro', 'Enterprise'].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {comparisons.map(({ feature, free, pro, ent, proAccent }) => (
                <tr key={feature} className="hover:bg-orange-50/40 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{feature}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {free === null ? <X className="h-4 w-4 text-slate-400" /> : free}
                  </td>
                  <td className={`px-6 py-4 text-sm ${proAccent ? 'font-bold text-[#FF6B00]' : 'text-slate-700'}`}>
                    {pro}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">{ent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Testimonials */}
      <section>
        <h2 className="mb-8 text-center text-3xl font-extrabold text-slate-900">
          Loved by <span className="text-[#FF6B00]">2M+ Creators</span> Worldwide
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map(({ quote, name, role, initials }) => (
            <div key={name} className="bg-gradient-to-b from-[#FFF8F3] to-[#FFEEDB] flex flex-col justify-between gap-5 p-7 rounded-3xl border border-[#FF6B00]/30 hover:border-[#FF6B00] transition-all hover:-translate-y-1 shadow-[0_10px_25px_-5px_rgba(255,107,0,0.12)]">
              <div>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#FF6B00] text-[#FF6B00]" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-slate-800 font-normal">{quote}</p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-[#FF6B00]/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#E05300] text-sm font-black text-white shadow-sm">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{name}</p>
                  <p className="text-xs text-[#FF6B00] font-semibold">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="mb-8 text-center text-3xl font-extrabold text-slate-900">
          Frequently Asked Questions
        </h2>
        <div className="mx-auto max-w-2xl space-y-3">
          {faqs.map(({ q, a }, i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFF8F3] to-[#FFF1E6] border border-[#FF6B00]/30 shadow-sm">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-slate-900 transition-colors hover:bg-orange-100/50"
              >
                {q}
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[#FF6B00] transition-transform duration-200 ${
                    openFaq === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === i && (
                <div className="border-t border-[#FF6B00]/20 px-5 py-4 text-sm leading-6 text-slate-700 font-medium bg-white/70">
                  {a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#FFF5ED] via-[#FFEADB] to-[#FEDBC0] border border-[#FF6B00]/30 p-12 text-center shadow-[0_15px_40px_-5px_rgba(255,107,0,0.22)]">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-[#FF6B00]/15 blur-3xl pointer-events-none" />
        <h2 className="relative text-3xl md:text-4xl font-black text-slate-900">Ready to supercharge your media?</h2>
        <p className="relative mx-auto mt-4 max-w-lg text-sm text-slate-700 font-medium leading-relaxed">
          Join over 2 million professionals using Universal Media Downloader to streamline their
          content acquisition with 3D ultra-speed extraction.
        </p>
        <div className="relative mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button className="btn-3d-orange px-8 py-3.5 text-sm font-bold text-white rounded-2xl shadow-md">
            Start 14-Day Free Pro Trial
          </button>
          <Button variant="ghost" className="text-slate-700 hover:bg-slate-100 rounded-2xl px-6 font-semibold">
            Contact Sales
          </Button>
        </div>
      </section>
    </div>
  );
}
