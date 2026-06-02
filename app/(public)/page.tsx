'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight, Shield, Calendar, CreditCard, Video,
  FileText, Scale, ChevronDown, CheckCircle2,
  Lock, Eye, BarChart3, Users, Building2, UserCheck,
  Database, Server,
  BookOpen, Phone, Globe, Award, Layers, Mail, KeyRound
} from 'lucide-react'

/* ─── TOKEN MAP (matches ADLTS_DESIGN.md) ─── */
const T = {
  blue600: '#0f62fe',
  blue700: '#0043ce',
  blue800: '#002d9c',
  blue50:  '#eff6ff',
  blue100: '#dbeafe',
  blue200: '#bfdbfe',
  ink950:  '#0b1220',
  ink900:  '#111827',
  ink700:  '#374151',
  ink600:  '#4b5563',
  ink500:  '#6b7280',
  ink400:  '#9ca3af',
  ink800:  '#1f2937',
  ink300:  '#d1d5db',
  canvas:  '#ffffff',
  page:    '#f7f9fc',
  pageSoft:'#f3f6fb',
  border:  '#e5e7eb',
  success: '#16a34a',
  warning: '#d97706',
  error:   '#dc2626',
  navy950: '#071426',
  navy900: '#0b1b3a',
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

/* ─── SCROLL REVEAL HOOK ─── */
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const applyMotionPreference = () => {
      const shouldReduce = mediaQuery.matches
      setReducedMotion(shouldReduce)
      if (shouldReduce) setVisible(true)
    }

    applyMotionPreference()
    if (mediaQuery.matches) return

    // Ensure content is never left fully transparent on first paint.
    const markVisible = () => setVisible(true)
    const rect = el.getBoundingClientRect()
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight
    if (rect.top < viewportHeight && rect.bottom > 0) {
      markVisible()
    }

    if (typeof IntersectionObserver === 'undefined') {
      markVisible()
      return
    }
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { markVisible(); obs.disconnect() } }, { threshold })
    obs.observe(el)
    mediaQuery.addEventListener('change', applyMotionPreference)
    return () => {
      obs.disconnect()
      mediaQuery.removeEventListener('change', applyMotionPreference)
    }
  }, [threshold])
  return { ref, visible, reducedMotion }
}

/* ─── REVEAL WRAPPER ─── */
function Reveal({ children, delay = 0, className = '', direction = 'up' }: {
  children: React.ReactNode; delay?: number; className?: string; direction?: 'up'|'left'|'right'|'none'
}) {
  const { ref, visible, reducedMotion } = useReveal()
  const shouldAnimate = !reducedMotion
  const transforms: Record<string, string> = {
    up: 'translateY(28px)', left: 'translateX(-28px)', right: 'translateX(28px)', none: 'none'
  }
  return (
    <div ref={ref} className={className} style={{
      opacity: shouldAnimate ? (visible ? 1 : 0) : 1,
      transform: shouldAnimate ? (visible ? 'none' : transforms[direction]) : 'none',
      transition: shouldAnimate ? `opacity 0.65s ease ${delay}ms, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms` : 'none'
    }}>
      {children}
    </div>
  )
}

/* ─── SECTION LABEL ─── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.65rem', letterSpacing: '0.2em',
      textTransform: 'uppercase', color: T.blue600, fontWeight: 600,
      display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
      <span style={{ width: 20, height: 1, background: T.blue600, display: 'inline-block', flexShrink: 0 }} />
      {children}
    </p>
  )
}

/* ─── STATUS BADGE ─── */
function StatusBadge({ label, color }: { label: string; color: 'blue'|'green'|'amber'|'red'|'gray' }) {
  const map = {
    blue:  { bg: '#eff6ff', text: T.blue700,   border: T.blue200 },
    green: { bg: '#ecfdf5', text: '#15803d',    border: '#bbf7d0' },
    amber: { bg: '#fffbeb', text: '#b45309',    border: '#fde68a' },
    red:   { bg: '#fef2f2', text: '#b91c1c',    border: '#fecaca' },
    gray:  { bg: '#f9fafb', text: T.ink600,     border: T.border },
  }[color]
  return (
    <span style={{ background: map.bg, color: map.text, border: `1px solid ${map.border}`,
      borderRadius: 999, padding: '0.2rem 0.65rem', fontSize: '0.68rem',
      fontFamily: 'ui-monospace,monospace', fontWeight: 600, letterSpacing: '0.04em',
      whiteSpace: 'nowrap' }}>
      {label}
    </span>
  )
}

/* ─── STAT CARD ─── */
function StatCard({ value, label, sub, delay=0 }: { value: string; label: string; sub?: string; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <div style={{ background: T.canvas, border: `1px solid ${T.border}`, borderRadius: 12,
        padding: '1.5rem', boxShadow: '0 1px 2px rgba(15,23,42,0.05)' }}>
        <div style={{ fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 600,
          color: T.blue600, lineHeight: 1.1, letterSpacing: '-0.02em' }}>{value}</div>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: T.ink900, marginTop: '0.4rem' }}>{label}</div>
        {sub && <div style={{ fontSize: '0.75rem', color: T.ink500, marginTop: '0.2rem' }}>{sub}</div>}
      </div>
    </Reveal>
  )
}

/* ─── PROCESS STEP ─── */
function ProcessStep({ n, icon: Icon, title, desc, badge, delay=0 }: {
  n: string; icon: React.ElementType; title: string; desc: string; badge?: { label: string; color: 'blue'|'green'|'amber'|'red'|'gray' }; delay?: number
}) {
  return (
    <Reveal delay={delay}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: T.blue50,
            border: `1px solid ${T.blue200}`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: T.blue700, fontFamily: 'ui-monospace,monospace',
            fontSize: '0.7rem', fontWeight: 700 }}>
            {n}
          </div>
          <div style={{ width: 1, flexGrow: 1, background: T.border, minHeight: 32, marginTop: 4 }} />
        </div>
        <div style={{ paddingBottom: '1.5rem', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <Icon size={15} color={T.blue600} />
            <span style={{ fontWeight: 600, color: T.ink900, fontSize: '0.925rem' }}>{title}</span>
            {badge && <StatusBadge label={badge.label} color={badge.color} />}
          </div>
          <p style={{ fontSize: '0.83rem', color: T.ink600, lineHeight: 1.6, margin: 0 }}>{desc}</p>
        </div>
      </div>
    </Reveal>
  )
}

/* ─── FEATURE CARD ─── */
function FeatureCard({ icon: Icon, title, desc, tag, delay=0, accent=T.blue600 }: {
  icon: React.ElementType; title: string; desc: string; tag: string; delay?: number; accent?: string
}) {
  const [hov, setHov] = useState(false)
  return (
    <Reveal delay={delay}>
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{ background: T.canvas, border: `1px solid ${hov ? accent : T.border}`,
          borderRadius: 12, padding: '1.75rem', height: '100%',
          boxShadow: hov ? '0 8px 24px rgba(15,23,42,0.09)' : '0 1px 2px rgba(15,23,42,0.04)',
          transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
          transform: hov ? 'translateY(-3px)' : 'none', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${accent}12`,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={accent} />
        </div>
        <div>
          <h3 style={{ fontSize: '0.975rem', fontWeight: 700, color: T.ink950, margin: '0 0 0.35rem' }}>{title}</h3>
          <p style={{ fontSize: '0.83rem', color: T.ink600, lineHeight: 1.65, margin: 0 }}>{desc}</p>
        </div>
        <span style={{ marginTop: 'auto', fontFamily: 'ui-monospace,monospace', fontSize: '0.6rem',
          letterSpacing: '0.1em', textTransform: 'uppercase', color: accent,
          border: `1px solid ${accent}35`, padding: '0.2rem 0.55rem', borderRadius: 4,
          alignSelf: 'flex-start' }}>{tag}</span>
      </div>
    </Reveal>
  )
}

/* ─── TRUST CARD ─── */
function TrustCard({ icon: Icon, title, desc, delay=0 }: {
  icon: React.ElementType; title: string; desc: string; delay?: number
}) {
  return (
    <Reveal delay={delay}>
      <div style={{ background: T.canvas, border: `1px solid ${T.border}`, borderRadius: 12,
        padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start',
        boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: T.blue50,
          border: `1px solid ${T.blue200}`, display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={16} color={T.blue700} />
        </div>
        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: T.ink900, margin: '0 0 0.3rem' }}>{title}</h4>
          <p style={{ fontSize: '0.8rem', color: T.ink600, lineHeight: 1.6, margin: 0 }}>{desc}</p>
        </div>
      </div>
    </Reveal>
  )
}

/* ─── ROLE CARD ─── */
function RoleCard({ icon: Icon, role, desc, actions, href, delay=0 }: {
  icon: React.ElementType; role: string; desc: string; actions: string[]; href: string; delay?: number
}) {
  const [hov, setHov] = useState(false)
  return (
    <Reveal delay={delay}>
      <Link href={href} style={{ textDecoration: 'none' }}>
        <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
          style={{ background: T.canvas, border: `1px solid ${hov ? T.blue600 : T.border}`,
            borderRadius: 12, padding: '1.5rem', height: '100%',
            boxShadow: hov ? '0 8px 28px rgba(15,23,42,0.1)' : '0 1px 2px rgba(15,23,42,0.04)',
            transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
            transform: hov ? 'translateY(-3px)' : 'none',
            display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: T.blue50,
              border: `1px solid ${T.blue200}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={18} color={T.blue700} />
            </div>
            <span style={{ fontWeight: 700, color: T.ink950, fontSize: '0.925rem' }}>{role}</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: T.ink600, lineHeight: 1.6, margin: 0 }}>{desc}</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {actions.map(a => (
              <li key={a} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.78rem', color: T.ink700 }}>
                <CheckCircle2 size={11} color={T.success} />
                {a}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.78rem', fontWeight: 600, color: T.blue600 }}>
            Enter portal <ArrowRight size={12} style={{ transition: 'transform 0.2s', transform: hov ? 'translateX(3px)' : 'none' }} />
          </div>
        </div>
      </Link>
    </Reveal>
  )
}

/* ─── FAQ ITEM ─── */
function FaqItem({ q, a, delay=0 }: { q: string; a: string; delay?: number }) {
  const [open, setOpen] = useState(false)
  const idSuffix = slugify(q)
  const buttonId = `faq-trigger-${idSuffix}`
  const panelId = `faq-panel-${idSuffix}`
  return (
    <Reveal delay={delay}>
      <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden',
        background: T.canvas, boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
        <button id={buttonId} onClick={() => setOpen(o => !o)}
          aria-expanded={open} aria-controls={panelId}
          style={{ width: '100%', padding: '1.1rem 1.25rem', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center', background: 'none',
            border: 'none', cursor: 'pointer', textAlign: 'left', gap: '1rem' }}>
          <span style={{ fontWeight: 600, color: T.ink900, fontSize: '0.9rem', lineHeight: 1.4 }}>{q}</span>
          <ChevronDown size={16} color={T.ink500} style={{ flexShrink: 0, transition: 'transform 0.25s', transform: open ? 'rotate(180deg)' : 'none' }} />
        </button>
        <div id={panelId} role="region" aria-labelledby={buttonId}
          style={{ maxHeight: open ? 200 : 0, overflow: 'hidden', transition: 'max-height 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
          <p style={{ padding: '0 1.25rem 1.1rem', fontSize: '0.83rem', color: T.ink600, lineHeight: 1.7, margin: 0 }}>{a}</p>
        </div>
      </div>
    </Reveal>
  )
}

/* ─── BOOKING STATE CARD ─── */
function BookingStateCard({ status, color, title, action }: {
  status: string; color: 'blue'|'green'|'amber'|'red'|'gray'; title: string; action: string
}) {
  return (
    <div style={{ background: T.canvas, border: `1px solid ${T.border}`, borderRadius: 10,
      padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <StatusBadge label={status} color={color} />
      <div style={{ fontWeight: 600, fontSize: '0.83rem', color: T.ink900 }}>{title}</div>
      <div style={{ fontSize: '0.75rem', color: T.ink500, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <ArrowRight size={11} color={T.blue600} /> {action}
      </div>
    </div>
  )
}

/* ─── SECTION DIVIDER ─── */
function Divider() {
  return <div style={{ height: 1, background: T.border, margin: '0' }} />
}

/* ═══════════════════════════════════════════ */
/* MAIN PAGE                                    */
/* ═══════════════════════════════════════════ */
export default function LandingPage() {
  /* Smooth scroll polyfill for anchor links */
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => { document.documentElement.style.scrollBehavior = '' }
  }, [])

  return (
    <div style={{ fontFamily: 'ui-sans-serif,system-ui,Arial,sans-serif', color: T.ink900,
      background: T.page, overflowX: 'hidden' }}>

      {/* ══════════════════════════════════════ */}
      {/* HERO                                    */}
      {/* ══════════════════════════════════════ */}
      <section style={{ background: T.canvas, borderBottom: `1px solid ${T.border}`,
        position: 'relative',
        padding: 'clamp(3rem,8vw,6rem) clamp(1.25rem,4vw,3rem) clamp(2.5rem,6vw,5rem)' }}>

        {/* Background shape */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '45%', height: '100%',
          background: T.pageSoft,
          zIndex: 0,
          pointerEvents: 'none', overflow: 'hidden' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,480px),1fr))',
          gap: 'clamp(2.5rem,5vw,5rem)', alignItems: 'center', position: 'relative', zIndex: 1 }}>

          {/* Left: text */}
          <div>
            <Reveal>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: T.blue50, border: `1px solid ${T.blue200}`, borderRadius: 999,
                padding: '0.3rem 0.85rem', marginBottom: '1.5rem' }}>
                <Globe size={11} color={T.blue700} />
                <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.62rem',
                  letterSpacing: '0.18em', textTransform: 'uppercase', color: T.blue700, fontWeight: 700 }}>
                  Official Digital Testing Platform — Ethiopia
                </span>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1 style={{ fontSize: 'clamp(2.25rem,5.5vw,3.4rem)', fontWeight: 600,
                lineHeight: 1.08, letterSpacing: '-0.02em', color: T.ink950,
                margin: '0 0 1.25rem', maxWidth: 560 }}>
                A fairer, auditable way to book, conduct, and document{' '}
                <span style={{ color: T.blue600 }}>driving tests.</span>
              </h1>
            </Reveal>

            <Reveal delay={140}>
              <p style={{ fontSize: 'clamp(0.95rem,1.5vw,1.1rem)', color: T.ink600,
                lineHeight: 1.7, marginBottom: '2rem', maxWidth: 500 }}>
                ADLTS connects candidate registration, institution verification, scheduling,
                payments, digital test sessions, recordings, appeals, and reporting in one
                secure, auditable Core Engine.
              </p>
            </Reveal>

            <Reveal delay={200}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2.5rem' }}>
                <Link href="/candidate/register" style={{
                  background: T.blue600, color: '#fff', padding: '0.75rem 1.5rem',
                  borderRadius: 8, fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  transition: 'background 0.15s', boxShadow: '0 2px 8px rgba(15,98,254,0.25)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = T.blue700)}
                  onMouseLeave={e => (e.currentTarget.style.background = T.blue600)}>
                  Create candidate account <ArrowRight size={15} />
                </Link>
                <Link href="/guidelines" style={{
                  background: T.canvas, color: T.ink800, padding: '0.75rem 1.5rem',
                  borderRadius: 8, fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none',
                  border: `1px solid ${T.border}`, display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  transition: 'border-color 0.15s, color 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.blue600; e.currentTarget.style.color = T.blue700 }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.ink800 }}>
                  <BookOpen size={15} /> View testing guidelines
                </Link>
                <Link href="/login" style={{
                  background: T.canvas, color: T.ink800, padding: '0.75rem 1.5rem',
                  borderRadius: 8, fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none',
                  border: `1px solid ${T.border}`, display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  transition: 'border-color 0.15s, color 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.blue600; e.currentTarget.style.color = T.blue700 }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.ink800 }}>
                  <Shield size={15} /> Institution or admin login
                </Link>
              </div>
            </Reveal>

            {/* Trust chips */}
            <Reveal delay={260}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['Role-based access', 'Auditable reports', 'OTP verified onboarding', 'Evidence-backed appeals'].map(t => (
                  <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    background: T.pageSoft, border: `1px solid ${T.border}`, borderRadius: 999,
                    padding: '0.25rem 0.7rem', fontSize: '0.72rem', color: T.ink700, fontWeight: 500 }}>
                    <CheckCircle2 size={11} color={T.success} /> {t}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right: product mockup card stack */}
          <Reveal delay={120} direction="right">
            <div style={{ position: 'relative' }}>
              {/* Main card */}
              <div style={{ background: T.canvas, border: `1px solid ${T.border}`, borderRadius: 16,
                padding: '1.5rem', boxShadow: '0 12px 40px rgba(15,23,42,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: '1.25rem' }}>
                  <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.65rem',
                    letterSpacing: '0.12em', color: T.ink500, textTransform: 'uppercase' }}>
                    Test Booking — #ADLTS-2026-0142
                  </span>
                  <StatusBadge label="confirmed" color="green" />
                </div>
                {/* Steps mini-timeline */}
                {[
                  { label: 'Registration & OTP', done: true },
                  { label: 'Institute Verification', done: true },
                  { label: 'Slot Scheduled', done: true },
                  { label: 'Payment Confirmed', done: true },
                  { label: 'Test Session', done: false, active: true },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.55rem 0', borderBottom: i < 4 ? `1px solid ${T.border}` : 'none' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      background: s.done ? T.blue600 : s.active ? T.blue50 : T.pageSoft,
                      border: `2px solid ${s.done ? T.blue600 : s.active ? T.blue600 : T.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {s.done && <CheckCircle2 size={10} color="#fff" />}
                      {s.active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.blue600 }} />}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: s.done ? T.ink900 : s.active ? T.blue700 : T.ink400,
                      fontWeight: s.active ? 600 : 400 }}>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Floating score badge */}
              <div style={{ position: 'absolute', bottom: -20, right: -16,
                background: T.canvas, border: `1px solid ${T.border}`, borderRadius: 10,
                padding: '0.75rem 1rem', boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
                display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#ecfdf5',
                  border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={18} color={T.success} />
                </div>
                <div>
                  <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: '1.1rem',
                    fontWeight: 700, color: T.success, lineHeight: 1 }}>Product preview</div>
                  <div style={{ fontSize: '0.7rem', color: T.ink500, marginTop: 2 }}>Session outcome sample</div>
                </div>
              </div>

              {/* Floating recording badge */}
              <div style={{ position: 'absolute', top: -16, left: -16,
                background: T.canvas, border: `1px solid ${T.border}`, borderRadius: 10,
                padding: '0.65rem 0.9rem', boxShadow: '0 8px 24px rgba(15,23,42,0.1)',
                display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626',
                  animation: 'pulse 1.5s ease-in-out infinite' }} className="adlts-pulse-dot" />
                <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.62rem',
                  color: '#b91c1c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  REC · LIVE
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* CTA BAND                                */}
      {/* ══════════════════════════════════════ */}
      <section style={{ background: T.navy950, padding: '1.8rem clamp(1.25rem,4vw,3rem)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.68rem',
            letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
            fontWeight: 600 }}>
            ADLTS — Official public testing journey
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <Link href="/contact" style={{
              background: '#fff', color: T.navy900, padding: '0.65rem 1.05rem',
              borderRadius: 999, textDecoration: 'none', fontSize: '0.72rem',
              fontWeight: 700, letterSpacing: '0.01em'
            }}>
              Get Institutional Access
            </Link>
            <Link href="/about" style={{
              background: 'transparent', color: 'rgba(255,255,255,0.75)', padding: '0.65rem 1.05rem',
              borderRadius: 999, border: '1px solid rgba(255,255,255,0.24)',
              textDecoration: 'none', fontSize: '0.7rem', fontWeight: 600
            }}>
              About ADLTS
            </Link>
            <Link href="/privacy-policy" style={{
              background: 'transparent', color: 'rgba(255,255,255,0.75)', padding: '0.65rem 1.05rem',
              borderRadius: 999, border: '1px solid rgba(255,255,255,0.24)',
              textDecoration: 'none', fontSize: '0.7rem', fontWeight: 600
            }}>
              Privacy policy
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* STATS ROW                               */}
      {/* ══════════════════════════════════════ */}
      <section style={{ background: T.pageSoft, padding: 'clamp(3rem,5vw,4.5rem) clamp(1.25rem,4vw,3rem)',
        borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem' }}>
            <StatCard value="6" label="Role portals" sub="Candidate, Institute, Admin, Expert, Authority, Super Admin" delay={0} />
            <StatCard value="State-driven booking lifecycle" label="Process design" sub="Governed transitions across lifecycle stages" delay={80} />
            <StatCard value="Evidence-backed sessions" label="Evidence model" sub="Session recordings and metadata are preserved in a reviewable chain" delay={160} />
            <StatCard value="Controlled payment retries" label="Payment controls" sub="Retries are policy-limited and auditable" delay={240} />
            <StatCard value="PDF-ready reporting" label="Reporting output" sub="Deterministic, reproducible official artifacts" delay={320} />
          </div>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════ */}
      {/* ROLE-BASED ENTRY                        */}
      {/* ══════════════════════════════════════ */}
      <section style={{ background: T.canvas, padding: 'clamp(3.5rem,6vw,5.5rem) clamp(1.25rem,4vw,3rem)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <SectionLabel>Platform roles</SectionLabel>
              <h2 style={{ fontSize: 'clamp(1.75rem,3.5vw,2.6rem)', fontWeight: 600,
                color: T.ink950, letterSpacing: '-0.015em', margin: '0 0 0.75rem' }}>
                One platform, six distinct portals
              </h2>
              <p style={{ fontSize: '1rem', color: T.ink600, maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
                Every role has its own governed workspace. Access is enforced at the API level — not just the UI.
              </p>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,300px),1fr))', gap: '1rem' }}>
            <RoleCard icon={UserCheck} role="Candidate" href="/candidate/register" delay={0}
              desc="Register, verify identity, book tests, pay, view outcomes, and submit appeals within the allowed window."
              actions={['Register & OTP verify', 'Book and pay for tests', 'View results & appeal']} />
            <RoleCard icon={Building2} role="Institute" href="/login" delay={60}
              desc="Review candidate booking requests, validate readiness, and participate in the scheduling pipeline."
              actions={['Review booking requests', 'Approve or reject candidates', 'Manage institution profile']} />
            <RoleCard icon={BarChart3} role="Admin" href="/login" delay={120}
              desc="Operate schedules, manage devices, monitor active exams, handle invitations, and generate reports."
              actions={['Manage candidates & slots', 'Monitor active tests', 'Generate official reports']} />
            <RoleCard icon={Shield} role="Super Admin" href="/login" delay={180}
              desc="System-level governance — institutions, user management, audit logs, and platform-wide oversight."
              actions={['Govern institutions', 'Inspect audit trails', 'Platform-level analytics']} />
            <RoleCard icon={Scale} role="Expert" href="/login" delay={240}
              desc="Review appeals, inspect test evidence and recordings, and issue written resolutions fairly."
              actions={['Review appeal queue', 'Inspect evidence & recordings', 'Write resolution decisions']} />
            <RoleCard icon={Globe} role="Transport Authority" href="/login" delay={300}
              desc="Governance-oriented access to regional compliance, policy signals, and accountability analytics."
              actions={['Regional compliance overview', 'Oversight analytics', 'Policy enforcement tools']} />
          </div>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════ */}
      {/* IDENTITY ONBOARDING                     */}
      {/* ══════════════════════════════════════ */}
      <section style={{ background: T.canvas, padding: 'clamp(3.5rem,6vw,5.5rem) clamp(1.25rem,4vw,3rem)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: '3rem', alignItems: 'start' }}>
          <div>
            <Reveal>
              <SectionLabel>Identity and onboarding</SectionLabel>
              <h2 style={{ fontSize: 'clamp(1.75rem,3.5vw,2.6rem)', fontWeight: 600,
                color: T.ink950, letterSpacing: '-0.015em', margin: '0 0 1rem' }}>
                A secure identity journey before every booking.
              </h2>
              <p style={{ fontSize: '0.95rem', color: T.ink600, lineHeight: 1.75, marginBottom: '1.25rem' }}>
                ADLTS requires identity confidence before booking, scheduling, and testing can begin.
                Each route is explicit and policy-driven.
              </p>
              <ul style={{ margin: 0, paddingLeft: '1rem', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {[
                  'Candidate self-registration',
                  'OTP verification',
                  'Invitation-based onboarding',
                  'Password reset and password change flows',
                  'JWT-authenticated sessions',
                  'Role- and entity-based authorization',
                ].map(item => (
                  <li key={item} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.84rem',
                    color: T.ink700, alignItems: 'center' }}>
                    <CheckCircle2 size={12} color={T.success} /> {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { from: 'Candidate registration', to: 'OTP verified', end: 'active account', icon: Mail, delay: 0 },
                { from: 'Institution invitation', to: 'token accepted', end: 'portal access', icon: Building2, delay: 70 },
                { from: 'Admin role check', to: 'role validated', end: 'dashboard access granted', icon: Shield, delay: 140 },
              ].map(({ from, to, end, icon: Icon, delay }) => (
                <div key={from} style={{ background: T.pageSoft, border: `1px solid ${T.border}`,
                  borderRadius: 12, padding: '1rem 1.15rem' }}>
                  <div style={{ fontSize: '0.67rem', color: T.ink500, fontFamily: 'ui-monospace,monospace',
                    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.45rem' }}>
                    Identity pipeline
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', fontSize: '0.82rem',
                    color: T.ink900, fontWeight: 600, marginBottom: '0.35rem' }}>
                    <Icon size={14} color={T.blue600} /> {from} <ArrowRight size={12} /> {to}
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    background: T.canvas, border: `1px solid ${T.border}`,
                    borderRadius: 999, padding: '0.28rem 0.65rem', fontSize: '0.72rem', color: T.success }}>
                    <KeyRound size={11} /> {end}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════ */}
      {/* BOOKING LIFECYCLE BOARD                  */}
      {/* ══════════════════════════════════════ */}
      <section style={{ background: T.pageSoft, padding: 'clamp(3.5rem,6vw,5.5rem) clamp(1.25rem,4vw,3rem)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Reveal>
            <SectionLabel>Booking, verification, scheduling, and payment</SectionLabel>
            <h2 style={{ fontSize: 'clamp(1.75rem,3.5vw,2.6rem)', fontWeight: 600,
              color: T.ink950, letterSpacing: '-0.015em', margin: '0 0 0.8rem' }}>
              A governed booking lifecycle with explicit state transitions
            </h2>
            <p style={{ fontSize: '0.95rem', color: T.ink600, lineHeight: 1.75, maxWidth: 700, marginBottom: '1.75rem' }}>
              The path from request to completion is governed by explicit states. Candidate booking request,
              institute verification, admin scheduling, and Chapa-hosted checkout are tied together with
              capacity control, controlled retries, and auditability.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <StatusBadge label="pending_verification" color="amber" />
              <StatusBadge label="verified" color="green" />
              <StatusBadge label="scheduled" color="blue" />
              <StatusBadge label="payment_pending" color="amber" />
              <StatusBadge label="confirmed" color="green" />
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: '0.75rem' }}>
            {[
              {
                title: 'Request', icon: UserCheck, status: 'pending_verification',
                body: 'Candidate submits booking request and confirms required documents. Rebooking is only allowed from approved states.',
              },
              {
                title: 'Verify', icon: Building2, status: 'verified',
                body: 'Institute verifies readiness and identity context. Rejection returns clear next actions.',
              },
              {
                title: 'Schedule', icon: Calendar, status: 'scheduled',
                body: 'Admin assigns slot using capacity control and lock windows. Rescheduling is allowed only in allowed states.',
              },
              {
                title: 'Pay', icon: CreditCard, status: 'payment_pending',
                body: 'Chapa hosted checkout with callback verification. Payment retries are logged to support audit trail.',
              },
            ].map(({ title, icon: Icon, status, body }) => (
              <div key={title} style={{ background: T.canvas, border: `1px solid ${T.border}`,
                borderRadius: 12, padding: '1rem 1.15rem', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.8rem', marginBottom: '0.7rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: T.ink800,
                    fontWeight: 600, fontSize: '0.9rem' }}>
                    <Icon size={14} color={T.blue600} /> {title}
                  </span>
                  <StatusBadge label={status} color={status === 'verified' || status === 'scheduled' || status === 'confirmed' ? 'green' : 'amber'} />
                </div>
                <div style={{ fontSize: '0.82rem', color: T.ink600, lineHeight: 1.55 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════ */}
      {/* FEATURES GRID                           */}
      {/* ══════════════════════════════════════ */}
      <section style={{ background: T.canvas, padding: 'clamp(3.5rem,6vw,5.5rem) clamp(1.25rem,4vw,3rem)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Reveal>
            <div style={{ marginBottom: '3rem' }}>
              <SectionLabel>Platform capabilities</SectionLabel>
              <h2 style={{ fontSize: 'clamp(1.75rem,3.5vw,2.6rem)', fontWeight: 600,
                color: T.ink950, letterSpacing: '-0.015em', margin: '0 0 0.75rem', maxWidth: 500 }}>
                Built for scale. Built for accountability.
              </h2>
              <p style={{ fontSize: '0.95rem', color: T.ink600, maxWidth: 520, lineHeight: 1.7 }}>
                Every module is purpose-designed for institutional workflows, not retrofitted from a generic SaaS template.
              </p>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,280px),1fr))', gap: '1rem' }}>
            <FeatureCard icon={Lock} title="Zero-Trust Access Control" tag="Identity & Auth" delay={0}
              desc="Role- and entity-based authorization enforced at the API level. Candidates, admins, experts, institutes, and regulators each operate in isolated scopes." />
            <FeatureCard icon={Calendar} title="Governed Booking Engine" tag="Scheduling" delay={60} accent="#0891b2"
              desc="9 distinct booking states. Every transition is governed, logged, and reversible only through explicit workflows. Capacity controls enforced." />
            <FeatureCard icon={CreditCard} title="Chapa Payment Pipeline" tag="Payments" delay={120} accent="#d97706"
              desc="Hosted checkout integration. Controlled retry limits prevent ambiguous payment states. Webhook-verified outcomes with full audit trail per attempt." />
            <FeatureCard icon={Video} title="Frame-Level Recording" tag="Evidence" delay={180}
              desc="Frame-by-frame session recording stored in MinIO-compatible object storage. MJPEG streaming and presigned URLs for secure, authorized playback." />
            <FeatureCard icon={Scale} title="Time-Windowed Appeals" tag="Fairness" delay={240} accent="#16a34a"
              desc="Candidates appeal within the configured window. Expert resolves with written decision. If accepted, test result status updates automatically." />
            <FeatureCard icon={FileText} title="Deterministic Reports" tag="Reporting" delay={300} accent="#7c3aed"
              desc="Structured analytics as source of truth. AI-assisted narrative for readability. HTML → PDF pipeline with disk caching for repeatable output." />
          </div>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════ */}
      {/* BOOKING STATE MACHINE                   */}
      {/* ══════════════════════════════════════ */}
      <section style={{ background: T.pageSoft, padding: 'clamp(3.5rem,6vw,5.5rem) clamp(1.25rem,4vw,3rem)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Reveal>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem',
              justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
              <div>
                <SectionLabel>Status-driven interface</SectionLabel>
                <h2 style={{ fontSize: 'clamp(1.75rem,3.5vw,2.6rem)', fontWeight: 600,
                  color: T.ink950, letterSpacing: '-0.015em', margin: '0 0 0.5rem' }}>
                  Every booking has a state.
                </h2>
                <p style={{ fontSize: '0.95rem', color: T.ink600, maxWidth: 480, lineHeight: 1.7, margin: 0 }}>
                  The UI always shows the current state and the next expected action. Failure states are explicit and actionable.
                </p>
              </div>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,240px),1fr))', gap: '0.75rem' }}>
            {[
              { status: 'drafted', color: 'gray' as const, title: 'Booking initiated', action: 'Await institute review' },
              { status: 'pending_verification', color: 'amber' as const, title: 'Institute reviewing', action: 'Institute approves or rejects' },
              { status: 'verified', color: 'green' as const, title: 'Candidate approved', action: 'Admin assigns slot' },
              { status: 'scheduled', color: 'blue' as const, title: 'Slot assigned', action: 'Candidate pays via Chapa' },
              { status: 'payment_pending', color: 'amber' as const, title: 'Awaiting payment', action: 'Webhook verifies outcome' },
              { status: 'payment_failed', color: 'red' as const, title: 'Payment not verified', action: 'Retry (max 3×) or use another method' },
              { status: 'confirmed', color: 'green' as const, title: 'Test locked in', action: 'Session created, no reschedule without override' },
              { status: 'rejected', color: 'red' as const, title: 'Booking rejected', action: 'Review comments and request again if allowed' },
              { status: 'cancelled', color: 'red' as const, title: 'Booking cancelled', action: 'Create a new request if needed' },
              { status: 'archived', color: 'gray' as const, title: 'Test completed', action: 'Report & appeal window opens' },
            ].map((s, i) => (
              <Reveal key={s.status} delay={i * 50}>
                <BookingStateCard {...s} />
              </Reveal>
            ))}
          </div>
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '0.98rem', color: T.ink900, fontWeight: 700, margin: '0 0 0.75rem' }}>
              Appeal status mini-preview
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ background: T.canvas, border: `1px solid ${T.border}`, padding: '0.85rem 1rem', borderRadius: 10,
                fontSize: '0.77rem', color: T.ink700, display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                <StatusBadge label="pending" color="amber" /> candidate action: add documents or clarifications
              </div>
              <div style={{ background: T.canvas, border: `1px solid ${T.border}`, padding: '0.85rem 1rem', borderRadius: 10,
                fontSize: '0.77rem', color: T.ink700, display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                <StatusBadge label="accepted" color="green" /> next action: final decision status updates
              </div>
              <div style={{ background: T.canvas, border: `1px solid ${T.border}`, padding: '0.85rem 1rem', borderRadius: 10,
                fontSize: '0.77rem', color: T.ink700, display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                <StatusBadge label="rejected" color="red" /> next action: close case and notify candidate
              </div>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════ */}
      {/* RECORDING & EVIDENCE SECTION            */}
      {/* ══════════════════════════════════════ */}
      <section style={{ background: T.canvas, padding: 'clamp(3.5rem,6vw,5.5rem) clamp(1.25rem,4vw,3rem)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))', gap: '3rem', alignItems: 'center' }}>
          <div>
            <Reveal>
              <SectionLabel>Evidence layer</SectionLabel>
              <h2 style={{ fontSize: 'clamp(1.75rem,3.5vw,2.6rem)', fontWeight: 600,
                color: T.ink950, letterSpacing: '-0.015em', margin: '0 0 1rem' }}>
                Every frame, preserved.
              </h2>
              <p style={{ fontSize: '0.95rem', color: T.ink600, lineHeight: 1.75, marginBottom: '1.75rem' }}>
                Session recordings are stored frame-by-frame in MinIO-compatible object storage.
                Authorized reviewers access footage through presigned URLs — storage buckets are never exposed publicly.
              </p>
            </Reveal>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { icon: Video, label: 'MJPEG streaming playback', sub: 'Frame-by-frame video review for expert appeals' },
                { icon: Lock, label: 'Presigned URL access', sub: 'Time-limited links — no raw bucket exposure' },
                { icon: Database, label: 'MinIO-compatible storage', sub: 'Object storage with organized frame artifacts' },
                { icon: Eye, label: 'Expert evidence review', sub: 'Authorized access during appeal resolution window' },
              ].map(({ icon: Icon, label, sub }, i) => (
                <Reveal key={label} delay={i * 70}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem',
                    background: T.pageSoft, border: `1px solid ${T.border}`,
                    borderRadius: 10, padding: '0.875rem 1rem' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: T.blue50,
                      border: `1px solid ${T.blue200}`, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={15} color={T.blue700} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: T.ink900 }}>{label}</div>
                      <div style={{ fontSize: '0.75rem', color: T.ink500, marginTop: 2 }}>{sub}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Session mock card */}
          <Reveal delay={100} direction="right">
            <div style={{ background: T.canvas, border: `1px solid ${T.border}`, borderRadius: 16,
              padding: '1.75rem', boxShadow: '0 8px 32px rgba(15,23,42,0.09)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.65rem',
                  color: T.ink500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Session preview
                </span>
                <StatusBadge label="completed" color="green" />
              </div>
              {[
                { k: 'Session status', v: 'completed (sample)', vc: T.success },
                { k: 'Recording', v: 'available (sample frames)', vc: T.ink900 },
                { k: 'Evidence URL', v: 'expires in 15 min (sample)', vc: T.warning },
                { k: 'Score', v: 'sample output preserved', vc: T.blue700 },
                { k: 'Decision', v: 'preview result', vc: T.success },
                { k: 'Report', v: 'pdf preview — generated', vc: T.ink900 },
                { k: 'Appeal window', v: 'open (sample)', vc: T.warning },
              ].map(({ k, v, vc }) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.65rem 0', borderBottom: `1px solid ${T.border}`, gap: '1rem' }}>
                  <span style={{ fontSize: '0.78rem', color: T.ink500 }}>{k}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: vc,
                    fontFamily: k === 'Score' || k === 'Session Status' ? 'inherit' : 'ui-monospace,monospace' }}>{v}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════ */}
      {/* REPORT SECTION                          */}
      {/* ══════════════════════════════════════ */}
      <section style={{ background: T.pageSoft, padding: 'clamp(3.5rem,6vw,5.5rem) clamp(1.25rem,4vw,3rem)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))', gap: '3rem', alignItems: 'center' }}>

          {/* Report mockup */}
          <Reveal direction="left">
            <div style={{ background: T.canvas, border: `1px solid ${T.border}`, borderRadius: 16,
              padding: '2rem', boxShadow: '0 8px 32px rgba(15,23,42,0.09)', overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: T.blue600 }} />
              <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.6rem',
                letterSpacing: '0.2em', color: T.blue600, textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                Official Test Report — Addis Central DTC
              </div>
              {/* Skeleton bars */}
              {[100, 80, 60].map(w => (
                <div key={w} style={{ height: 5, width: `${w}%`, background: T.pageSoft,
                  borderRadius: 2, marginBottom: 8 }} />
              ))}
              <div style={{ margin: '1.25rem 0', borderTop: `1px solid ${T.border}` }} />
              {[
                { k: 'Overall Score', v: '87.4', big: true },
                { k: 'Decision', v: 'PASS' },
                { k: 'Candidate ID', v: '#CDT-2041-ETH' },
                { k: 'Session Date', v: '14 May 2026' },
                { k: 'Institute', v: 'Addis Central DTC' },
              ].map(({ k, v, big }) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.65rem 0', borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: '0.75rem', color: T.ink500 }}>{k}</span>
                  <span style={{ fontSize: big ? '1.5rem' : '0.78rem', fontWeight: big ? 700 : 600,
                    color: big ? T.blue600 : k === 'Decision' ? T.success : T.ink900,
                    fontFamily: 'ui-monospace,monospace' }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: 999,
                padding: '0.3rem 0.8rem', fontSize: '0.7rem', color: T.success, fontWeight: 700 }}>
                <CheckCircle2 size={12} color={T.success} /> PDF preview generated
              </div>
            </div>
          </Reveal>

          <div>
            <Reveal>
                <SectionLabel>Reporting</SectionLabel>
                <h2 style={{ fontSize: 'clamp(1.75rem,3.5vw,2.6rem)', fontWeight: 600,
                  color: T.ink950, letterSpacing: '-0.015em', margin: '0 0 1rem' }}>
                Reports that mean something.
              </h2>
              <p style={{ fontSize: '0.95rem', color: T.ink600, lineHeight: 1.75, marginBottom: '1.75rem' }}>
                Product previews only. Deterministic outputs are preserved and formatted for review as PDF-ready
                documents, while narrative helpers stay non-deterministic and clearly labeled.
              </p>
            </Reveal>
            {[
              { n: '01', t: 'Deterministic score analytics', d: 'Scoring logic is algorithmic and reproducible. Core results stay deterministic.' },
              { n: '02', t: 'Readable narrative', d: 'A review layer produces plain-language summaries without changing the official result.' },
              { n: '03', t: 'HTML to PDF pipeline', d: 'Output rendering stays repeatable and versioned for audit replay.' },
              { n: '04', t: 'Regulator-ready format', d: 'Each report includes metadata, evidence pointers, and signer context.' },
            ].map(({ n, t, d }, i) => (
              <Reveal key={n} delay={i * 70}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.65rem',
                    color: T.blue600, fontWeight: 700, flexShrink: 0, paddingTop: 2 }}>{n}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: T.ink900, marginBottom: '0.2rem' }}>{t}</div>
                    <div style={{ fontSize: '0.8rem', color: T.ink600, lineHeight: 1.6 }}>{d}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════ */}
      {/* OVERSIGHT, ANALYTICS, ACCOUNTABILITY    */}
      {/* ══════════════════════════════════════ */}
      <section style={{ background: T.canvas, padding: 'clamp(3.5rem,6vw,5.5rem) clamp(1.25rem,4vw,3rem)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <SectionLabel>Oversight, analytics, and accountability</SectionLabel>
              <h2 style={{ fontSize: 'clamp(1.75rem,3.5vw,2.6rem)', fontWeight: 600,
                color: T.ink950, letterSpacing: '-0.015em', margin: '0 0 0.75rem' }}>
                Representative dashboards for governance workflows
              </h2>
              <p style={{ fontSize: '0.95rem', color: T.ink600, maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
                These are product-preview cards, not live operational numbers. They show how the oversight and
                compliance surfaces are organized in ADLTS.
              </p>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,300px),1fr))', gap: '0.875rem' }}>
            <TrustCard icon={Users} title="Active tests (Product preview)" delay={0}
              desc="Active: 24, in-session: 11, completed this hour: 7. Snapshot for operational monitoring." />
            <TrustCard icon={Server} title="Device health (Product preview)" delay={60}
              desc="Recorder uptime: 98%, pending maintenance: 1 site, health alerts suppressed in this sample view." />
            <TrustCard icon={BarChart3} title="Booking funnel (Product preview)" delay={120}
              desc="Request → Verification → Scheduling → Payment → Result. Each state includes next actions and elapsed SLAs." />
            <TrustCard icon={Layers} title="Candidate status distribution (Product preview)" delay={180}
              desc="Drafted: 6, verified: 11, scheduled: 9, confirmed: 22, rejected: 3, cancelled: 1." />
            <TrustCard icon={Building2} title="Institution throughput (Product preview)" delay={240}
              desc="Throughput scorecards by institution help identify overload and resourcing gaps in pilot regions." />
            <TrustCard icon={Eye} title="Audit trail (Product preview)" delay={300}
              desc="Every state change is evented. Decision events include actor, timestamp, and role scope." />
            <TrustCard icon={Globe} title="Regional compliance (Product preview)" delay={360}
              desc="Regional scorecards include compliance exceptions and transport-policy action flags." />
            <TrustCard icon={Scale} title="Appeal resolution queue (Product preview)" delay={420}
              desc="Pending, accepted, and rejected appeal counts are surfaced with reviewer workload context." />
          </div>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════ */}
      {/* TECHNICAL ARCHITECTURE STRIP            */}
      {/* ══════════════════════════════════════ */}
      <section style={{ background: T.pageSoft, padding: 'clamp(2.5rem,4vw,3.5rem) clamp(1.25rem,4vw,3rem)',
        borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Reveal>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem', justifyContent: 'space-between' }}>
              <div>
                <SectionLabel>Technical architecture</SectionLabel>
                <p style={{ fontSize: '0.875rem', color: T.ink600, maxWidth: 460, lineHeight: 1.65, margin: 0 }}>
                  ADLTS is a modular monolith — one deployable Go service with clean domain boundaries for
                  identity, booking, testing, appeals, media, payments, and reporting.
                </p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['Go Core Engine', 'Modular Monolith', 'PostgreSQL', 'JWT Auth',
                  'Chapa Payments', 'MinIO Storage', 'SMTP Email', 'HTML/PDF Reports',
                  'Docker + Compose', 'Anthropic AI Narrative'].map(chip => (
                  <span key={chip} style={{ background: T.canvas, border: `1px solid ${T.border}`,
                    borderRadius: 999, padding: '0.3rem 0.75rem', fontSize: '0.72rem',
                    color: T.ink700, fontWeight: 500, fontFamily: 'ui-monospace,monospace',
                    boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>{chip}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* FAQ SECTION                             */}
      {/* ══════════════════════════════════════ */}
      <section style={{ background: T.canvas, padding: 'clamp(3.5rem,6vw,5.5rem) clamp(1.25rem,4vw,3rem)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: '3rem' }}>
          <div>
            <Reveal>
              <SectionLabel>Frequently asked</SectionLabel>
              <h2 style={{ fontSize: 'clamp(1.75rem,3.5vw,2.6rem)', fontWeight: 600,
                color: T.ink950, letterSpacing: '-0.015em', margin: '0 0 1rem' }}>
                Common questions
              </h2>
              <p style={{ fontSize: '0.95rem', color: T.ink600, lineHeight: 1.75, marginBottom: '1.5rem' }}>
                Find detailed guidance in the official guidelines, or contact support for role-specific help.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link href="/guidelines" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  fontSize: '0.875rem', fontWeight: 600, color: T.blue600, textDecoration: 'none' }}>
                  <BookOpen size={14} /> Full testing guidelines
                </Link>
                <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  fontSize: '0.875rem', fontWeight: 600, color: T.blue600, textDecoration: 'none' }}>
                  <Phone size={14} /> Contact support
                </Link>
              </div>
            </Reveal>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <FaqItem q="How do I register as a candidate?" delay={0}
              a="Visit the registration page, fill in your personal details including your Fayida ID, and verify your email address using the OTP we send you. Your account becomes active immediately after verification." />
            <FaqItem q="When can I book a driving test?" delay={60}
              a="After your account is active, submit a booking request for your chosen institute. The institute will review your readiness and, once approved, an admin will assign you a time slot." />
            <FaqItem q="What happens after I pay?" delay={120}
              a="Your booking moves to 'confirmed' status and your test date is locked in. You will receive a confirmation and no further rescheduling is permitted after this point." />
            <FaqItem q="How do I view my results?" delay={180}
              a="Results and official PDF reports are available from your candidate dashboard once the test session is finalized. Reports include a deterministic score and a readable narrative explanation." />
            <FaqItem q="When and how can I appeal?" delay={240}
              a="If you believe the result is incorrect, you can submit a written appeal within the allowed window after your test. An expert will review your appeal, inspect the recording evidence, and issue a written resolution." />
            <FaqItem q="Who can access my recordings?" delay={300}
              a="Recordings are only accessible to authorized roles — experts reviewing appeals and administrators conducting audits. Access is through time-limited presigned URLs; storage is never publicly exposed." />
          </div>
        </div>
      </section>

      {/* Pulse keyframe */}
      <style>{`
        @keyframes pulse {
          0%,100%{opacity:1;transform:scale(1)}
          50%{opacity:0.5;transform:scale(0.85)}
        }
        @media (prefers-reduced-motion: reduce) {
          .adlts-pulse-dot { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
