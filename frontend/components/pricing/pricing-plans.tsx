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
        <span className={`text-sm ${billing === 'monthly' ? 'text-white' : 'text-muted'}`}>
          Monthly
        </span>
        <button
          onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            billing === 'yearly' ? 'bg-accent' : 'bg-surface2'
          }`}
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
              billing === 'yearly' ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`text-sm ${billing === 'yearly' ? 'text-white' : 'text-muted'}`}>
          Yearly
        </span>
        <span className="rounded-full bg-amber-400/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
          2 months free
        </span>
      </div>

      {/* Plans */}
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-3xl border p-7 ${
              plan.highlighted
                ? 'border-accent bg-surface shadow-[0_0_40px_rgba(124,118,255,0.12)]'
                : 'border-border bg-surface'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
                  {plan.badge}
                </span>
              </div>
            )}

            <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
            <p className="mt-1 text-sm text-muted">{plan.desc}</p>

            <div className="my-6">
              <span className={`font-bold text-white ${plan.bigPrice ? 'text-4xl' : 'text-5xl'}`}>
                {billing === 'monthly' ? plan.price.monthly : plan.price.yearly}
              </span>
              {plan.price.monthly !== 'Custom' && (
                <span className="text-sm text-muted">/mo</span>
              )}
            </div>

            <ul className="mb-8 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  <span className="text-muted">{f}</span>
                </li>
              ))}
            </ul>

            {plan.ctaStyle === 'default' && (
              <Button className="w-full">{plan.cta}</Button>
            )}
            {plan.ctaStyle === 'secondary' && (
              <Button variant="secondary" className="w-full">{plan.cta}</Button>
            )}
            {plan.ctaStyle === 'ghost' && (
              <p className="text-center text-sm text-muted">{plan.cta}</p>
            )}
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <section>
        <h2 className="mb-8 text-center text-2xl font-semibold text-white">
          Compare capabilities
        </h2>
        <div className="overflow-hidden rounded-3xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface2">
                {['Technical Feature', 'Free', 'Pro', 'Enterprise'].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-muted/60"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {comparisons.map(({ feature, free, pro, ent, proAccent }) => (
                <tr key={feature}>
                  <td className="px-6 py-4 text-sm text-muted">{feature}</td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {free === null ? <X className="h-4 w-4 text-muted/30" /> : free}
                  </td>
                  <td className={`px-6 py-4 text-sm ${proAccent ? 'font-medium text-accent' : 'text-muted'}`}>
                    {pro}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">{ent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Testimonials */}
      <section>
        <h2 className="mb-8 text-center text-2xl font-semibold text-white">
          Trusted by 2M+ Creators
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map(({ quote, name, role, initials }) => (
            <Card key={name} className="flex flex-col gap-5 p-6">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm leading-6 text-muted">{quote}</p>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{name}</p>
                  <p className="text-xs text-muted">{role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="mb-8 text-center text-2xl font-semibold text-white">
          Frequently Asked Questions
        </h2>
        <div className="mx-auto max-w-2xl space-y-2">
          {faqs.map(({ q, a }, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between p-5 text-left text-sm font-medium text-white transition-colors hover:bg-surface2"
              >
                {q}
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${
                    openFaq === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === i && (
                <div className="border-t border-border px-5 py-4 text-sm leading-6 text-muted">
                  {a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="rounded-3xl bg-gradient-to-br from-accentSoft/80 to-accent/70 p-12 text-center">
        <h2 className="text-3xl font-semibold text-white">Ready to supercharge your media?</h2>
        <p className="mx-auto mt-4 max-w-lg text-sm text-white/70">
          Join over 2 million professionals using Universal Media Downloader to streamline their
          content acquisition.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-indigo-900 transition-colors hover:bg-white/90">
            Start 14-Day Free Pro Trial
          </button>
          <Button variant="ghost" className="text-white/80 hover:text-white">
            Contact Sales
          </Button>
        </div>
      </section>
    </div>
  );
}
