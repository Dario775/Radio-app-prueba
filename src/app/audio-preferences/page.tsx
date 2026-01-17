'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import type { AudioPreferences } from '@/types/radio';

const qualityOptions = [
  { id: 'auto', label: 'Auto', description: 'Adjusts based on connection' },
  { id: 'high', label: 'High', description: '320 kbps or best available' },
  { id: 'medium', label: 'Medium', description: '128 kbps' },
  { id: 'low', label: 'Low', description: '64 kbps - saves data' },
];

const bufferOptions = [
  { id: 'small', label: 'Small', description: 'Faster start, may buffer more' },
  { id: 'medium', label: 'Medium', description: 'Balanced performance' },
  { id: 'large', label: 'Large', description: 'Stable playback, slower start' },
];

const sleepTimerOptions = [
  { id: null, label: 'Off' },
  { id: 15, label: '15 min' },
  { id: 30, label: '30 min' },
  { id: 60, label: '1 hour' },
  { id: 120, label: '2 hours' },
];

export default function AudioPreferences() {
  const [preferences, setPreferences] = useState<AudioPreferences>({
    quality: 'auto',
    bufferSize: 'medium',
    sleepTimer: null,
    autoPlay: true,
  });
  const [saved, setSaved] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('audioPreferences');
    if (stored) {
      setPreferences(JSON.parse(stored));
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = () => {
    localStorage.setItem('audioPreferences', JSON.stringify(preferences));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updatePreference = <K extends keyof AudioPreferences>(
    key: K,
    value: AudioPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-dark border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold gradient-text">Settings</h1>
          <p className="text-sm text-[var(--text-muted)]">Customize your listening experience</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Audio Quality Section */}
        <section className="bg-[var(--surface)] rounded-2xl overflow-hidden border border-[var(--border)]">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[var(--primary)]/10">
                <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold">Audio Quality</h2>
                <p className="text-sm text-[var(--text-muted)]">Choose stream quality</p>
              </div>
            </div>
          </div>
          <div className="p-2">
            {qualityOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => updatePreference('quality', option.id as AudioPreferences['quality'])}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${preferences.quality === option.id
                    ? 'bg-[var(--primary)]/10 border border-[var(--primary)]/30'
                    : 'hover:bg-[var(--surface-hover)]'
                  }`}
              >
                <div className="text-left">
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-[var(--text-muted)]">{option.description}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${preferences.quality === option.id
                    ? 'border-[var(--primary)] bg-[var(--primary)]'
                    : 'border-[var(--text-muted)]'
                  }`}>
                  {preferences.quality === option.id && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Buffer Size Section */}
        <section className="bg-[var(--surface)] rounded-2xl overflow-hidden border border-[var(--border)]">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold">Streaming Buffer</h2>
                <p className="text-sm text-[var(--text-muted)]">Balance between speed and stability</p>
              </div>
            </div>
          </div>
          <div className="p-2">
            {bufferOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => updatePreference('bufferSize', option.id as AudioPreferences['bufferSize'])}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${preferences.bufferSize === option.id
                    ? 'bg-purple-500/10 border border-purple-500/30'
                    : 'hover:bg-[var(--surface-hover)]'
                  }`}
              >
                <div className="text-left">
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-[var(--text-muted)]">{option.description}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${preferences.bufferSize === option.id
                    ? 'border-purple-500 bg-purple-500'
                    : 'border-[var(--text-muted)]'
                  }`}>
                  {preferences.bufferSize === option.id && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Sleep Timer Section */}
        <section className="bg-[var(--surface)] rounded-2xl overflow-hidden border border-[var(--border)]">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold">Sleep Timer</h2>
                <p className="text-sm text-[var(--text-muted)]">Auto-stop after specified time</p>
              </div>
            </div>
          </div>
          <div className="p-4 flex flex-wrap gap-2">
            {sleepTimerOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => updatePreference('sleepTimer', option.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${preferences.sleepTimer === option.id
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--foreground)]'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        {/* Auto Play Toggle */}
        <section className="bg-[var(--surface)] rounded-2xl overflow-hidden border border-[var(--border)]">
          <div className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-500/10">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold">Auto Play</h2>
                  <p className="text-sm text-[var(--text-muted)]">Start playing when selecting station</p>
                </div>
              </div>
              <button
                onClick={() => updatePreference('autoPlay', !preferences.autoPlay)}
                className={`relative w-12 h-7 rounded-full transition-colors ${preferences.autoPlay ? 'bg-green-500' : 'bg-[var(--border)]'
                  }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${preferences.autoPlay ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <button
          onClick={savePreferences}
          className={`w-full py-4 rounded-2xl font-semibold transition-all ${saved
              ? 'bg-green-500 text-white'
              : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]'
            }`}
        >
          {saved ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Saved!
            </span>
          ) : (
            'Save Preferences'
          )}
        </button>

        {/* App Info */}
        <div className="text-center text-sm text-[var(--text-muted)] pt-4">
          <p className="gradient-text font-semibold">RadioWave v1.0</p>
          <p className="mt-1">Made with ❤️ for music lovers</p>
        </div>
      </main>

      <Navbar />
    </div>
  );
}
