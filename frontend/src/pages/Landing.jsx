import React from 'react';
import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '📧', title: 'Phishing Detection', desc: 'Scan emails for credential harvesting, urgency tactics, and brand impersonation before you click.' },
  { icon: '💬', title: 'AI Message Analysis', desc: 'Detect manipulation, romance scams, and social engineering in SMS, WhatsApp, and DMs.' },
  { icon: '🖼️', title: 'Screenshot Threat Detection', desc: 'Upload a screenshot of a suspicious page or message and get an instant risk assessment.' },
  { icon: '🔗', title: 'URL Scanner', desc: 'Structural analysis plus optional live threat-intel lookups for suspicious links.' },
  { icon: '🔑', title: 'Password Security', desc: 'Check password strength locally — nothing you type here ever leaves your browser.' },
  { icon: '📚', title: 'Security Awareness', desc: 'Bite-sized guides on phishing, malware, social engineering, and safe browsing.' },
];

const STEPS = [
  { n: '01', title: 'Paste or Upload', desc: 'Drop in a suspicious email, message, link, or screenshot.' },
  { n: '02', title: 'Instant Analysis', desc: 'Our detection engine scores the content across dozens of threat indicators.' },
  { n: '03', title: 'Clear Verdict', desc: 'Get a risk score, plain-English explanation, and concrete next steps.' },
];

const STATS = [
  { value: '12+', label: 'Threat Categories Covered' },
  { value: '4', label: 'Analysis Tools' },
  { value: '24/7', label: 'Available Anytime' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur bg-bg/80 border-b border-bg-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-accent-cyan text-2xl">🛡️</span>
            <span className="font-bold text-lg tracking-tight">CyberShield</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition">Login</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 badge bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" /> AI-Powered Threat Detection
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
          Detect Threats <span className="text-accent-cyan">Before</span> They Reach You.
        </h1>
        <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto">
          CyberShield analyzes suspicious emails, messages, URLs, and screenshots in seconds —
          helping you spot phishing, scams, and social engineering before you become a victim.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="btn-primary px-8 py-3 text-base">Analyze a Threat</Link>
          <a href="#features" className="btn-secondary px-8 py-3 text-base">Explore Security Tools</a>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-6 pb-16 grid grid-cols-3 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="card p-6 text-center">
            <p className="text-3xl font-extrabold text-accent-cyan">{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center">Every Tool You Need to Stay Safe</h2>
        <p className="text-slate-500 text-center mt-2 max-w-xl mx-auto">
          A full suite of detection tools, backed by AI when configured and a transparent rule-based engine otherwise.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6 hover:border-accent-cyan/40 transition">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-slate-100">{f.title}</h3>
              <p className="text-sm text-slate-500 mt-2">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {STEPS.map((s) => (
            <div key={s.n} className="card p-6">
              <span className="text-accent-cyan/40 text-4xl font-extrabold">{s.n}</span>
              <h3 className="font-semibold mt-3">{s.title}</h3>
              <p className="text-sm text-slate-500 mt-2">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tips teaser */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="card p-8 md:p-12 text-center bg-gradient-to-br from-bg-card to-bg-panel">
          <h2 className="text-2xl md:text-3xl font-bold">Never share your password or OTP — not even with "support."</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Legitimate organizations never ask for your password or one-time code. When in doubt, verify independently.
          </p>
          <Link to="/register" className="btn-primary inline-block mt-6">Create Your Free Account</Link>
        </div>
      </section>

      <footer className="border-t border-bg-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <span>© {new Date().getFullYear()} CyberShield. Educational cybersecurity awareness platform.</span>
          <Link to="/admin/login" className="hover:text-slate-300 transition">Admin Login</Link>
        </div>
      </footer>
    </div>
  );
}
