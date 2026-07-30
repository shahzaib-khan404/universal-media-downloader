'use client';

import { useState } from 'react';
import { Moon, Sun, Monitor, Globe, User, CreditCard, Shield, Code2, Bell, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const sidebarItems = [
  { label: 'Appearance', Icon: Globe },
  { label: 'Account', Icon: User },
  { label: 'Billing', Icon: CreditCard },
  { label: 'Privacy', Icon: Shield },
  { label: 'API Settings', Icon: Code2 },
  { label: 'Notifications', Icon: Bell },
];

const videoFormats = ['MP4', 'MOV', 'WEBM'];
const audioFormats = ['MP3', 'WAV', 'FLAC'];

const notificationItems = [
  {
    label: 'Download Complete',
    desc: 'Receive a push notification when a file finishes downloading.',
    defaultOn: true,
  },
  {
    label: 'Download Failed',
    desc: 'Get alerted immediately if an error occurs during processing.',
    defaultOn: true,
  },
  {
    label: 'System Updates',
    desc: 'Stay updated with the latest features and security patches.',
    defaultOn: false,
  },
];

export function SettingsPanel() {
  const [activeSection, setActiveSection] = useState('Appearance');
  const [theme, setTheme] = useState<'Dark' | 'Light' | 'System'>('Dark');
  const [videoFormat, setVideoFormat] = useState('MP4');
  const [audioFormat, setAudioFormat] = useState('MP3');
  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    'Download Complete': true,
    'Download Failed': true,
    'System Updates': false,
  });

  const toggleNotif = (label: string) =>
    setNotifs((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
      {/* Settings sidebar */}
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted/50">
          System
        </p>
        <nav className="space-y-0.5">
          {sidebarItems.map(({ label, Icon }) => (
            <button
              key={label}
              onClick={() => setActiveSection(label)}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                activeSection === label
                  ? 'bg-accent/10 font-medium text-accent'
                  : 'text-muted hover:bg-surface2 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Appearance */}
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <Globe className="h-4 w-4 text-accent" />
            <h3 className="font-semibold text-white">Appearance</h3>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-3 block text-sm text-muted">Theme Interface</label>
              <div className="flex gap-2">
                {(
                  [
                    { label: 'Dark', Icon: Moon },
                    { label: 'Light', Icon: Sun },
                    { label: 'System', Icon: Monitor },
                  ] as const
                ).map(({ label, Icon }) => (
                  <button
                    key={label}
                    onClick={() => setTheme(label)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border px-4 py-3 text-xs transition-colors ${
                      theme === label
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border text-muted hover:border-muted/40 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-3 block text-sm text-muted">Language</label>
              <select className="w-full rounded-xl border border-border bg-surface2 px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent">
                <option>English (United States)</option>
                <option>English (UK)</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Download Preferences */}
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <span className="text-sm text-accent">↓</span>
            <h3 className="font-semibold text-white">Download Preferences</h3>
          </div>
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-muted">Default Download Path</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  defaultValue="/Users/username/Downloads/UMD"
                  className="flex-1 rounded-xl border border-border bg-surface2 px-4 py-3 text-sm text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button className="rounded-xl border border-border px-4 py-3 text-sm text-muted transition-colors hover:bg-surface2 hover:text-white">
                  Browse
                </button>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-muted">Preferred Video Format</label>
                <div className="flex flex-wrap gap-2">
                  {videoFormats.map((f) => (
                    <button
                      key={f}
                      onClick={() => setVideoFormat(f)}
                      className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                        videoFormat === f ? 'bg-accent text-white' : 'bg-surface2 text-muted hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm text-muted">Preferred Audio Format</label>
                <div className="flex flex-wrap gap-2">
                  {audioFormats.map((f) => (
                    <button
                      key={f}
                      onClick={() => setAudioFormat(f)}
                      className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                        audioFormat === f ? 'bg-accent text-white' : 'bg-surface2 text-muted hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <Bell className="h-4 w-4 text-accent" />
            <h3 className="font-semibold text-white">Notifications</h3>
          </div>
          <div className="space-y-5">
            {notificationItems.map(({ label, desc }) => (
              <div key={label} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="mt-0.5 text-xs text-muted">{desc}</p>
                </div>
                <button
                  onClick={() => toggleNotif(label)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    notifs[label] ? 'bg-accent' : 'bg-surface2'
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      notifs[label] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* API Settings */}
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <Code2 className="h-4 w-4 text-accent" />
            <h3 className="font-semibold text-white">API Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-muted">Secret API Key</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value="umd_live_8293knasdkjh923kjn"
                  readOnly
                  className="flex-1 rounded-xl border border-border bg-surface2 px-4 py-3 font-mono text-sm text-muted focus:outline-none"
                />
                <button className="rounded-xl border border-border p-3 text-muted transition-colors hover:bg-surface2 hover:text-white">
                  <Copy className="h-4 w-4" />
                </button>
                <button className="rounded-xl border border-border px-4 py-3 text-sm text-muted transition-colors hover:bg-surface2 hover:text-white">
                  Regenerate
                </button>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Webhook URL</label>
              <input
                type="url"
                placeholder="https://yourdomain.com/webhooks/umd"
                className="w-full rounded-xl border border-border bg-surface2 px-4 py-3 text-sm text-muted placeholder:text-muted/40 focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        </Card>

        {/* Profile + Billing */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-accent" />
              <h3 className="font-semibold text-white">Profile</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/20 text-lg font-semibold text-accent">
                A
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-white">Alex Thompson</p>
                <p className="truncate text-xs text-muted">alex.t@media-stream.io</p>
              </div>
            </div>
            <Button variant="secondary" className="mt-5 w-full text-sm">
              Edit Profile
            </Button>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-accent" />
                <h3 className="font-semibold text-white">Billing</h3>
              </div>
              <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                Pro Plan
              </span>
            </div>
            <div className="space-y-1 text-sm text-muted">
              <p>Next invoice: $12.00 on Dec 1, 2024</p>
              <p>Visa ending in 4242</p>
            </div>
            <Button variant="secondary" className="mt-5 w-full text-sm">
              Manage Subscription
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
