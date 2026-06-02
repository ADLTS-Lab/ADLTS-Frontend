'use client'

import Link from 'next/link'
import {
  ArrowRight, Award, BarChart3, BookOpen, Building2, Calendar, CheckCircle2, ChevronDown, CreditCard, Eye,
  FileText, Globe, Lock, Scale, Shield, UserCheck, Users, Video
} from 'lucide-react'
import {
  type ElementType,
  type ReactNode,
  useEffect,
  useRef,
  useState
} from 'react'

/* ─── TOKEN MAP (matches ADLTS_DESIGN.md) ─── */
const T = {
  blue600: '#0f62fe',
  blue700: '#0043ce',
  blue800: '#002d9c',
  blue50: '#eff6ff',
  blue100: '#dbeafe',
  blue200: '#bfdbfe',
  ink950: '#0b1220',
  ink900: '#111827',
  ink800: '#1f2937',
  ink700: '#374151',
  ink600: '#4b5563',
  ink500: '#6b7280',
  ink400: '#9ca3af',
  ink300: '#d1d5db',
  canvas: '#ffffff',
  page: '#f7f9fc',
  pageSoft: '#f3f6fb',
  border: '#e5e7eb',
  success: '#16a34a',
  warning: '#d97706',
  error: '#dc2626',
  navy900: '#0b1b3a',
  navy950: '#071426',
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const MARQUEE_TOPICS = [
  'Booking & Scheduling',
  'Chapa Payments',
  'Recording & Playback',
  'Appeal Management',
  'PDF Reports',
  'JWT Authentication',
  'Role-Based Access',
]

const CAPABILITY_STATS = [
  { value: '6', label: 'Role portals', sub: 'Distinct entry points by responsibility.' },
  { value: 'State-driven', label: 'Booking lifecycle', sub: 'Transition rules govern every lifecycle move.' },
  { value: 'Evidence-backed', label: 'Sessions', sub: 'Artifact and metadata are preserved.' },
  { value: 'Controlled', label: 'Payment retries', sub: 'Retries are policy-limited and auditable.' },
  { value: 'PDF-ready', label: 'Reporting', sub: 'Deterministic outputs with stable formatting.' },
]

const SOLUTION_CARDS = [
  { icon: Shield, title: 'Role-based permissions', desc: 'Each role accesses only its allowed workspace and actions.' },
  { icon: Calendar, title: 'State-driven workflows', desc: 'Actions are available only when lifecycle rules permit them.' },
  { icon: Eye, title: 'Evidence-backed review', desc: 'Every outcome is tied to captured artifacts and logs.' },
  { icon: FileText, title: 'Reproducible reports', desc: 'Official reports are rendered with repeatable templates.' },
]

const DEEP_DIVE_PANELS = [
  {
    title: 'Zero-trust access',
    icon: Shield,
    bullets: ['OTP', 'JWT', 'role scopes'],
    visual: ['Email OTP', 'Signed token', 'Scope checks'],
  },
  {
    title: 'State machine, not just a form',
    icon: Calendar,
    bullets: ['request', 'verify', 'schedule', 'pay'],
    visual: ['Drafted', 'Verified', 'Scheduled', 'Paid'],
  },
  {
    title: 'Every session can be reviewed',
    icon: Video,
    bullets: ['recordings', 'presigned URLs', 'appeal evidence'],
    visual: ['Capture', 'Store', 'Review', 'Appeal'],
  },
]

const LIFECYCLE_STEPS = [
  { icon: UserCheck, title: 'Identity', desc: 'Candidate and access signals are captured before booking work begins.' },
  { icon: Users, title: 'Booking', desc: 'A booking request is created and routed for review.' },
  { icon: Calendar, title: 'Scheduling', desc: 'Admin assigns slots against capacity and policy constraints.' },
  { icon: CreditCard, title: 'Payment', desc: 'Chapa hosted checkout confirms payment before test confirmation.' },
  { icon: Video, title: 'Testing', desc: 'Session execution runs under auditable lifecycle tracking.' },
  { icon: FileText, title: 'Outcome', desc: 'Result and report become effective when the case is finalized.' },
]

const FEATURE_CARDS = [
  { icon: Lock, title: 'Access Control', desc: 'Entity and role policies control visibility and action permissions.' },
  { icon: Calendar, title: 'Smart Booking', desc: 'Rescheduling and slot assignment follow state-aware rules.' },
  { icon: CreditCard, title: 'Payment Pipeline', desc: 'Hosted checkout with callback validation and retry history.' },
  { icon: Video, title: 'Session Recording', desc: 'Session artifacts are structured for future review and appeals.' },
  { icon: Scale, title: 'Appeals System', desc: 'Appeals are managed with clear evidence links and reviewer decisions.' },
  { icon: FileText, title: 'Official Reports', desc: 'Report generation is deterministic and export-friendly.' },
]

const STATUS_MACHINE_STATES = [
  { id: 'drafted', status: 'Drafted', color: 'gray' as const, meaning: 'The request has been created and is waiting for review.', action: 'Collect required documents and route to review.' },
  { id: 'pending_verification', status: 'Pending verification', color: 'amber' as const, meaning: 'Identity and request data are being verified.', action: 'Complete institution verification steps.' },
  { id: 'verified', status: 'Verified', color: 'green' as const, meaning: 'Identity checks are complete and accepted.', action: 'Proceed to scheduling.' },
  { id: 'scheduled', status: 'Scheduled', color: 'blue' as const, meaning: 'A valid slot has been assigned.', action: 'Complete payment before testing.' },
  { id: 'payment_pending', status: 'Payment pending', color: 'amber' as const, meaning: 'Slot is assigned but payment is not finalized.', action: 'Open the hosted checkout and confirm payment.' },
  { id: 'payment_failed', status: 'Payment failed', color: 'red' as const, meaning: 'Payment validation failed.', action: 'Retry payment according to configured policy.' },
  { id: 'confirmed', status: 'Confirmed', color: 'green' as const, meaning: 'Booking is paid and locked in.', action: 'Run test workflow as scheduled.' },
  { id: 'rejected', status: 'Rejected', color: 'red' as const, meaning: 'Review cannot continue in current context.', action: 'Correct issues and re-submit if allowed.' },
  { id: 'cancelled', status: 'Cancelled', color: 'red' as const, meaning: 'Booking was intentionally stopped.', action: 'Start a new request when ready.' },
  { id: 'archived', status: 'Archived', color: 'gray' as const, meaning: 'The lifecycle is complete.', action: 'Keep the outcome available for audit.' },
]

const TRUST_CARDS = [
  { icon: Users, title: 'Role separation', desc: 'Role boundaries prevent unintended actions across workspaces.' },
  { icon: Eye, title: 'Evidence-backed review', desc: 'Reviewers access complete, linked artifacts for every outcome.' },
  { icon: BarChart3, title: 'Deterministic analytics', desc: 'Operational summaries derive from stable event sources.' },
  { icon: FileText, title: 'Repeatable reports', desc: 'The same input produces the same structured output layout.' },
  { icon: Scale, title: 'Audit trail', desc: 'State transitions and actor actions are auditable by design.' },
  { icon: Shield, title: 'Secure artifacts', desc: 'Storage and access for sensitive records are policy constrained.' },
]

const APPEAL_STATUSES = [
  { label: 'pending', color: 'amber' as const, text: 'Under review with clarification if needed.' },
  { label: 'accepted', color: 'green' as const, text: 'Result updated after evidence and decision closure.' },
  { label: 'rejected', color: 'red' as const, text: 'Appeal closed with recorded rationale.' },
]

/* ─── SCROLL REVEAL HOOK (reduced-motion aware) ─── */
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const applyMotionPreference = () => {
      const shouldReduce = mediaQuery.matches
      setReducedMotion(shouldReduce)
      if (shouldReduce) setVisible(true)
    }

    applyMotionPreference()
    if (mediaQuery.matches) return

    const el = ref.current
    if (!el) return

    const markVisible = () => setVisible(true)

    const rect = el.getBoundingClientRect()
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight
    if (rect.top < viewportHeight && rect.bottom > 0) markVisible()

    if (typeof IntersectionObserver === 'undefined') {
      markVisible()
      return
    }

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        markVisible()
        obs.disconnect()
      }
    }, { threshold })

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
  children: ReactNode
  delay?: number
  className?: string
  direction?: 'up' | 'left' | 'right' | 'none'
}) {
  const { ref, visible, reducedMotion } = useReveal()
  const shouldAnimate = !reducedMotion
  const transforms: Record<string, string> = {
    up: 'translateY(24px)',
    left: 'translateX(-24px)',
    right: 'translateX(24px)',
    none: 'none',
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shouldAnimate ? (visible ? 1 : 0) : 1,
        transform: shouldAnimate ? (visible ? 'none' : transforms[direction]) : 'none',
        transition: shouldAnimate
          ? `opacity 0.62s ease ${delay}ms, transform 0.62s cubic-bezier(0.16,1,0.3,1) ${delay}ms`
          : 'none',
      }}>
      {children}
    </div>
  )
}

/* ─── SECTION LABEL ─── */
function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'ui-monospace,monospace',
        fontSize: '0.65rem',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: T.blue600,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.75rem',
      }}>
      <span
        style={{
          width: 20,
          height: 1,
          background: T.blue600,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {children}
    </p>
  )
}

/* ─── STATUS BADGE ─── */
function StatusBadge({ label, color }: { label: string; color: 'blue' | 'green' | 'amber' | 'red' | 'gray' }) {
  const map = {
    blue: { bg: '#eff6ff', text: T.blue700, border: T.blue200 },
    green: { bg: '#ecfdf5', text: '#15803d', border: '#bbf7d0' },
    amber: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
    red: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
    gray: { bg: '#f9fafb', text: T.ink600, border: T.border },
  }[color]

  return (
    <span
      style={{
        background: map.bg,
        color: map.text,
        border: `1px solid ${map.border}`,
        borderRadius: 999,
        padding: '0.2rem 0.65rem',
        fontSize: '0.68rem',
        fontFamily: 'ui-monospace,monospace',
        fontWeight: 600,
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

/* ─── STAT CARD ─── */
function StatCard({ value, label, sub, delay = 0 }: {
  value: string
  label: string
  sub?: string
  delay?: number
}) {
  return (
    <Reveal delay={delay}>
      <div
        style={{
          background: T.canvas,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: '1.25rem',
          boxShadow: '0 1px 2px rgba(15,23,42,0.05)',
        }}
      >
        <div
          style={{
            fontSize: 'clamp(1.6rem,3vw,2.25rem)',
            fontWeight: 600,
            color: T.blue600,
            lineHeight: 1.1,
          }}>
          {value}
        </div>
        <div
          style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: T.ink900,
            marginTop: '0.45rem',
          }}>
          {label}
        </div>
        {sub && (
          <div style={{ fontSize: '0.74rem', color: T.ink500, marginTop: '0.2rem' }}>{sub}</div>
        )}
      </div>
    </Reveal>
  )
}

/* ─── PROBLEM / SOLUTION CARD ─── */
function ProblemSolutionCard({ icon: Icon, title, desc, delay = 0 }: {
  icon: ElementType
  title: string
  desc: string
  delay?: number
}) {
  return (
    <Reveal delay={delay}>
      <div
        style={{
          background: T.pageSoft,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: '1rem',
          display: 'flex',
          gap: '0.8rem',
          alignItems: 'flex-start',
        }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: T.blue50,
            border: `1px solid ${T.blue200}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
          <Icon size={17} color={T.blue700} />
        </div>
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: T.ink900, margin: '0 0 0.3rem' }}>
            {title}
          </h4>
          <p style={{ fontSize: '0.78rem', color: T.ink600, margin: 0, lineHeight: 1.65 }}>{desc}</p>
        </div>
      </div>
    </Reveal>
  )
}

/* ─── DEEP DIVE PANEL ─── */
function DeepDivePanel({ title, bullets, icon: Icon, visual, delay = 0 }: {
  title: string
  bullets: string[]
  icon: ElementType
  visual: string[]
  delay?: number
}) {
  return (
    <Reveal delay={delay}>
      <div
        style={{
          background: T.canvas,
          border: `1px solid ${T.border}`,
          borderRadius: 14,
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: '0 1px 2px rgba(15,23,42,0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: T.blue50,
              border: `1px solid ${T.blue200}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Icon size={16} color={T.blue700} />
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: T.ink900 }}>{title}</div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
          {bullets.map((bullet) => (
            <span
              key={bullet}
              style={{
                fontSize: '0.67rem',
                fontFamily: 'ui-monospace,monospace',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                background: T.pageSoft,
                border: `1px solid ${T.border}`,
                color: T.ink700,
                padding: '0.26rem 0.55rem',
                borderRadius: 999,
              }}
            >
              {bullet}
            </span>
          ))}
        </div>

        <div
          style={{
            background: T.pageSoft,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: '0.75rem',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
              gap: '0.45rem',
            }}
          >
            {visual.map((node, index) => (
              <div
                key={node}
                style={{
                  fontSize: '0.7rem',
                  color: T.ink700,
                  borderRadius: 8,
                  border: `1px solid ${T.border}`,
                  background: T.canvas,
                  padding: '0.46rem 0.35rem',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                }}
              >
                <span style={{ fontFamily: 'ui-monospace,monospace', color: T.blue700 }}>{index + 1}.</span>
                {node}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  )
}

/* ─── FEATURE CARD ─── */
function FeatureCard({ icon: Icon, title, desc, accent = T.blue600, delay = 0 }: {
  icon: ElementType
  title: string
  desc: string
  accent?: string
  delay?: number
}) {
  const [hov, setHov] = useState(false)

  return (
    <Reveal delay={delay}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: T.canvas,
          border: `1px solid ${hov ? accent : T.border}`,
          borderRadius: 12,
          padding: '1.15rem',
          minHeight: 170,
          boxShadow: hov ? '0 8px 24px rgba(15,23,42,0.08)' : '0 1px 2px rgba(15,23,42,0.04)',
          transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
          transform: hov ? 'translateY(-2px)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `${accent}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'flex-start',
          }}
        >
          <Icon size={17} color={accent} />
        </div>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: T.ink950, margin: '0 0 0.4rem' }}>{title}</h3>
          <p style={{ fontSize: '0.78rem', color: T.ink600, margin: 0, lineHeight: 1.62 }}>{desc}</p>
        </div>
      </div>
    </Reveal>
  )
}

/* ─── TRUST CARD ─── */
function TrustCard({ icon: Icon, title, desc, delay = 0 }: {
  icon: ElementType
  title: string
  desc: string
  delay?: number
}) {
  return (
    <Reveal delay={delay}>
      <div
        style={{
          background: T.canvas,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: '1.25rem',
          display: 'flex',
          gap: '0.85rem',
          alignItems: 'flex-start',
          boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: T.blue50,
            border: `1px solid ${T.blue200}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={16} color={T.blue700} />
        </div>
        <div>
          <h4 style={{ fontSize: '0.84rem', fontWeight: 700, color: T.ink900, margin: '0 0 0.35rem' }}>{title}</h4>
          <p style={{ fontSize: '0.76rem', color: T.ink600, lineHeight: 1.62, margin: 0 }}>{desc}</p>
        </div>
      </div>
    </Reveal>
  )
}

/* ─── REPORT CARD ─── */
function ReportPreviewCard() {
  return (
    <Reveal delay={70}>
      <div
        style={{
          background: T.canvas,
          border: `1px solid ${T.border}`,
          borderRadius: 14,
          padding: '1.45rem',
          boxShadow: '0 10px 30px rgba(15,23,42,0.07)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '0 auto auto 0',
            width: 4,
            height: '100%',
            background: T.blue600,
          }}
        />

        <div
          style={{
            fontFamily: 'ui-monospace,monospace',
            fontSize: '0.62rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: T.ink500,
            marginBottom: '1rem',
          }}
        >
          Product preview
        </div>

        <div
          style={{
            fontSize: '0.88rem',
            fontWeight: 700,
            color: T.ink900,
            marginBottom: '0.85rem',
          }}
        >
          Structured Testing Report Layout
        </div>

        {[
          ['Report ID', 'RPT-ADLTS-SAMPLE-0142'],
          ['Candidate', 'ADLTS sample record'],
          ['Booking status', 'confirmed'],
          ['Payment', 'verified'],
          ['Evidence', 'recording + logs'],
          ['Decision', 'pass'],
          ['Appeal', 'available window'],
        ].map(([k, v]) => (
          <div
            key={k}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '1rem',
              padding: '0.55rem 0',
              borderBottom: `1px solid ${T.border}`,
              fontSize: '0.76rem',
              color: T.ink600,
            }}
          >
            <span>{k}</span>
            <strong style={{ color: T.ink900, fontWeight: 600 }}>{v}</strong>
          </div>
        ))}
      </div>
    </Reveal>
  )
}

/* ─── FAQ ITEM ─── */
function FaqItem({ q, a, delay = 0 }: { q: string; a: string; delay?: number }) {
  const [open, setOpen] = useState(false)
  const idSuffix = slugify(q)
  const buttonId = `faq-trigger-${idSuffix}`
  const panelId = `faq-panel-${idSuffix}`

  return (
    <Reveal delay={delay}>
      <div
        style={{
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          overflow: 'hidden',
          background: T.canvas,
          boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
        }}
      >
        <button
          id={buttonId}
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls={panelId}
          style={{
            width: '100%',
            padding: '1.05rem 1.2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            gap: '1rem',
          }}
        >
          <span style={{ fontWeight: 600, color: T.ink900, fontSize: '0.9rem', lineHeight: 1.4 }}>{q}</span>
          <ChevronDown
            size={16}
            color={T.ink500}
            style={{ flexShrink: 0, transition: 'transform 0.25s', transform: open ? 'rotate(180deg)' : 'none' }}
          />
        </button>
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          style={{
            maxHeight: open ? 220 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.35s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <p style={{ padding: '0 1.2rem 1.1rem', fontSize: '0.82rem', color: T.ink600, lineHeight: 1.7, margin: 0 }}>
            {a}
          </p>
        </div>
      </div>
    </Reveal>
  )
}

/* ─── SUPPORT CTA ─── */
function SupportCTA() {
  return (
    <section style={{ background: T.navy950, padding: '2rem clamp(1.25rem, 4vw, 3rem)' }}>
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gap: '1rem',
          alignItems: 'center',
          gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontFamily: 'ui-monospace,monospace',
              fontSize: '0.68rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.45)',
              fontWeight: 600,
              marginBottom: '0.45rem',
            }}>
            Need support
          </p>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.35rem', fontWeight: 650 }}>
            We are available for institutional onboarding and candidate support.
          </h2>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'flex-end' }}>
          <Link
            href="/candidate/register"
            style={{
              background: '#fff',
              color: T.navy900,
              padding: '0.7rem 1.1rem',
              borderRadius: 999,
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
            }}
          >
            Candidate registration
          </Link>
          <Link
            href="/contact"
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              padding: '0.7rem 1.1rem',
              borderRadius: 999,
              textDecoration: 'none',
              fontWeight: 700,
              border: '1px solid rgba(255,255,255,0.24)',
              fontSize: '0.8rem',
            }}
          >
            Request institutional access
          </Link>
          <Link
            href="/guidelines"
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              padding: '0.7rem 1.1rem',
              borderRadius: 999,
              textDecoration: 'none',
              fontWeight: 700,
              border: '1px solid rgba(255,255,255,0.24)',
              fontSize: '0.8rem',
            }}
          >
            View guidelines
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ─── SIMPLE DIVIDER ─── */
function Divider() {
  return <div style={{ height: 1, background: T.border, margin: '0' }} />
}

/* ═══════════════════════════════════════════ */
/* MAIN PAGE                                    */
/* ═══════════════════════════════════════════ */
export default function LandingPage() {
  const [activeStatus, setActiveStatus] = useState(STATUS_MACHINE_STATES[0].id)
  const currentStatus = STATUS_MACHINE_STATES.find((s) => s.id === activeStatus) || STATUS_MACHINE_STATES[0]

  /* Smooth scroll polyfill for anchor links */
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.documentElement.style.scrollBehavior = ''
    }
  }, [])

  return (
    <div style={{ fontFamily: 'ui-sans-serif,system-ui,Arial,sans-serif', color: T.ink900, background: T.page, overflowX: 'hidden' }}>
      {/* ══════════════════════════════════════ */}
      {/* HERO                                    */}
      {/* ══════════════════════════════════════ */}
      <section
        style={{
          background: T.canvas,
          borderBottom: `1px solid ${T.border}`,
          position: 'relative',
          padding: 'clamp(3rem,8vw,6rem) clamp(1.25rem,4vw,3rem) clamp(2.5rem,6vw,5rem)',
        }}
      >

        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '45%',
            height: '100%',
            background: T.pageSoft,
            zIndex: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        />

        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,480px),1fr))',
            gap: 'clamp(2.5rem,5vw,5rem)',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >

          <div>
            <Reveal>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: T.blue50,
                  border: `1px solid ${T.blue200}`,
                  borderRadius: 999,
                  padding: '0.3rem 0.85rem',
                  marginBottom: '1.5rem',
                }}
              >
                <Globe size={11} color={T.blue700} />
                <span
                  style={{
                    fontFamily: 'ui-monospace,monospace',
                    fontSize: '0.62rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: T.blue700,
                    fontWeight: 700,
                  }}
                >
                  Official Digital Testing Platform — Ethiopia
                </span>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1
                style={{
                  fontSize: 'clamp(2.25rem,5.5vw,3.4rem)',
                  fontWeight: 600,
                  lineHeight: 1.08,
                  letterSpacing: '-0.02em',
                  color: T.ink950,
                  margin: '0 0 1.25rem',
                  maxWidth: 560,
                }}
              >
                A fairer, auditable way to book, conduct, and document{' '}
                <span style={{ color: T.blue600 }}>driving tests.</span>
              </h1>
            </Reveal>

            <Reveal delay={140}>
              <p
                style={{
                  fontSize: 'clamp(0.95rem,1.5vw,1.1rem)',
                  color: T.ink600,
                  lineHeight: 1.7,
                  marginBottom: '2rem',
                  maxWidth: 500,
                }}
              >
                ADLTS connects candidate registration, institution verification, scheduling,
                payments, digital test sessions, recordings, appeals, and reporting in one
                secure, auditable Core Engine.
              </p>
            </Reveal>

            <Reveal delay={200}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  marginBottom: '2.5rem',
                }}>
                <Link
                  href="/candidate/register"
                  style={{
                    background: T.blue600,
                    color: '#fff',
                    padding: '0.75rem 1.5rem',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'background 0.15s',
                    boxShadow: '0 2px 8px rgba(15,98,254,0.25)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = T.blue700
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = T.blue600
                  }}
                >
                  Create candidate account <ArrowRight size={15} />
                </Link>
                <Link
                  href="/guidelines"
                  style={{
                    background: T.canvas,
                    color: T.ink800,
                    padding: '0.75rem 1.5rem',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    border: `1px solid ${T.border}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'border-color 0.15s, color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = T.blue600
                    e.currentTarget.style.color = T.blue700
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = T.border
                    e.currentTarget.style.color = T.ink800
                  }}
                >
                  <BookOpen size={15} /> View testing guidelines
                </Link>
                <Link
                  href="/login"
                  style={{
                    background: T.canvas,
                    color: T.ink800,
                    padding: '0.75rem 1.5rem',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    border: `1px solid ${T.border}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'border-color 0.15s, color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = T.blue600
                    e.currentTarget.style.color = T.blue700
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = T.border
                    e.currentTarget.style.color = T.ink800
                  }}
                >
                  <Shield size={15} /> Institution or admin login
                </Link>
              </div>
            </Reveal>

            <Reveal delay={260}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['Role-based access', 'Auditable reports', 'OTP verified onboarding', 'Evidence-backed appeals'].map((t) => (
                  <span
                    key={t}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: T.pageSoft,
                      border: `1px solid ${T.border}`,
                      borderRadius: 999,
                      padding: '0.25rem 0.7rem',
                      fontSize: '0.72rem',
                      color: T.ink700,
                      fontWeight: 500,
                    }}
                  >
                    <CheckCircle2 size={11} color={T.success} /> {t}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={120} direction="right">
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  background: T.canvas,
                  border: `1px solid ${T.border}`,
                  borderRadius: 16,
                  padding: '1.5rem',
                  boxShadow: '0 12px 40px rgba(15,23,42,0.1)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.25rem',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'ui-monospace,monospace',
                      fontSize: '0.65rem',
                      letterSpacing: '0.12em',
                      color: T.ink500,
                      textTransform: 'uppercase',
                    }}
                  >
                    Test Booking — #ADLTS-2026-0142
                  </span>
                  <StatusBadge label="confirmed" color="green" />
                </div>

                {[
                  { label: 'Registration & OTP', done: true },
                  { label: 'Institute Verification', done: true },
                  { label: 'Slot Scheduled', done: true },
                  { label: 'Payment Confirmed', done: true },
                  { label: 'Test Session', done: false, active: true },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.55rem 0',
                      borderBottom: i < 4 ? `1px solid ${T.border}` : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: s.done ? T.blue600 : s.active ? T.blue50 : T.pageSoft,
                        border: `2px solid ${s.done ? T.blue600 : s.active ? T.blue600 : T.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {s.done && <CheckCircle2 size={10} color="#fff" />}
                      {s.active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.blue600 }} />}
                    </div>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: s.done ? T.ink900 : s.active ? T.blue700 : T.ink400,
                        fontWeight: s.active ? 600 : 400,
                      }}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  position: 'absolute',
                  bottom: -20,
                  right: -16,
                  background: T.canvas,
                  border: `1px solid ${T.border}`,
                  borderRadius: 10,
                  padding: '0.75rem 1rem',
                  boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: '#ecfdf5',
                    border: '1px solid #bbf7d0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Award size={18} color={T.success} />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'ui-monospace,monospace',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: T.success,
                      lineHeight: 1,
                    }}
                  >
                    Product preview
                  </div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: T.ink500,
                      marginTop: 2,
                    }}
                  >
                    Session outcome sample
                  </div>
                </div>
              </div>

              <div
                style={{
                  position: 'absolute',
                  top: -16,
                  left: -16,
                  background: T.canvas,
                  border: `1px solid ${T.border}`,
                  borderRadius: 10,
                  padding: '0.65rem 0.9rem',
                  boxShadow: '0 8px 24px rgba(15,23,42,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                }}
              >
                <div className="adlts-pulse-dot" style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#dc2626',
                }} />
                <span
                  style={{
                    fontFamily: 'ui-monospace,monospace',
                    fontSize: '0.62rem',
                    color: '#b91c1c',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  REC · LIVE
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* MARQUEE                                */}
      {/* ══════════════════════════════════════ */}
      <section style={{ background: T.pageSoft, padding: '1.35rem clamp(1.25rem,4vw,3rem)', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Reveal>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.55rem',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              className="adlts-marquee"
            >
              {MARQUEE_TOPICS.map((item) => (
                <span
                  key={item}
                  style={{
                    fontFamily: 'ui-monospace,monospace',
                    fontSize: '0.7rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: T.ink700,
                    background: T.canvas,
                    border: `1px solid ${T.border}`,
                    borderRadius: 999,
                    padding: '0.32rem 0.75rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* CAPABILITY STATS                       */}
      {/* ══════════════════════════════════════ */}
      <section
        style={{
          background: T.canvas,
          padding: 'clamp(3rem,5vw,4.4rem) clamp(1.25rem,4vw,3rem)',
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '0.95rem' }}>
            {CAPABILITY_STATS.map((item, index) => (
              <StatCard key={item.label} value={item.value} label={item.label} sub={item.sub} delay={index * 70} />
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════ */}
      {/* PROBLEM SOLUTION                       */}
      {/* ══════════════════════════════════════ */}
      <section
        style={{
          background: T.pageSoft,
          padding: 'clamp(3.3rem,6vw,5rem) clamp(1.25rem,4vw,3rem)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))',
            gap: '2.5rem',
            alignItems: 'start',
          }}
        >
          <Reveal>
            <SectionLabel>Problem → solution</SectionLabel>
            <h2
              style={{
                fontSize: 'clamp(1.8rem,3.6vw,2.6rem)',
                fontWeight: 600,
                color: T.ink950,
                letterSpacing: '-0.015em',
                margin: '0 0 0.95rem',
                maxWidth: 520,
              }}
            >
              Manual testing creates gaps. ADLTS closes them.
            </h2>
            <p style={{ fontSize: '0.94rem', color: T.ink600, lineHeight: 1.72 }}>
              A governance-first platform replaces ambiguous process steps with enforceable sequence control.
            </p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '1rem 0 0',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              {['Inconsistent decisions', 'Scheduling ambiguity', 'Weak audit trail'].map((item) => (
                <li
                  key={item}
                  style={{
                    fontSize: '0.85rem',
                    color: T.ink700,
                    display: 'flex',
                    gap: '0.45rem',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: T.blue600,
                      display: 'inline-block',
                    }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
            {SOLUTION_CARDS.map((item, index) => (
              <ProblemSolutionCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                desc={item.desc}
                delay={120 + index * 55}
              />
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════ */}
      {/* PLATFORM DEEP DIVE PANELS              */}
      {/* ══════════════════════════════════════ */}
      <section
        style={{
          background: T.canvas,
          padding: 'clamp(3.3rem,6vw,5rem) clamp(1.25rem,4vw,3rem)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Reveal>
            <SectionLabel>Platform deep dive</SectionLabel>
            <h2
              style={{
                fontSize: 'clamp(1.8rem,3.6vw,2.6rem)',
                fontWeight: 600,
                color: T.ink950,
                letterSpacing: '-0.015em',
                margin: '0 0 1.3rem',
              }}
            >
              ADLTS in three operating layers
            </h2>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: '0.95rem' }}>
            {DEEP_DIVE_PANELS.map((item, index) => (
              <DeepDivePanel
                key={item.title}
                title={item.title}
                icon={item.icon}
                bullets={item.bullets}
                visual={item.visual}
                delay={index * 70}
              />
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════ */}
      {/* LIFECYCLE TIMELINE                    */}
      {/* ══════════════════════════════════════ */}
      <section
        style={{
          background: T.pageSoft,
          padding: 'clamp(3.3rem,6vw,5rem) clamp(1.25rem,4vw,3rem)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Reveal>
            <SectionLabel>Booking, verification, scheduling, and payment</SectionLabel>
            <h2
              style={{
                fontSize: 'clamp(1.8rem,3.6vw,2.6rem)',
                fontWeight: 600,
                color: T.ink950,
                letterSpacing: '-0.015em',
                margin: '0 0 1rem',
              }}
            >
              Governed lifecycle timeline
            </h2>
            <p style={{ fontSize: '0.94rem', color: T.ink600, marginBottom: '1.75rem', maxWidth: 640 }}>
              Each step is explicit and policy-constrained.
            </p>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,190px),1fr))', gap: '0.75rem' }}>
            {LIFECYCLE_STEPS.map((step, index) => (
              <Reveal key={step.title} delay={index * 60}>
                <div
                  style={{
                    background: T.canvas,
                    border: `1px solid ${T.border}`,
                    borderRadius: 12,
                    padding: '1rem',
                    boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.8rem', marginBottom: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <step.icon
                        size={15}
                        color={T.blue700}
                      />
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: T.ink900 }}>{step.title}</span>
                    </div>
                    <StatusBadge label={step.title.toLowerCase()} color={index <= 2 ? 'amber' : index === 5 ? 'green' : 'blue'} />
                  </div>
                  <p style={{ margin: 0, color: T.ink600, fontSize: '0.78rem', lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════ */}
      {/* FEATURE GRID                           */}
      {/* ══════════════════════════════════════ */}
      <section
        style={{
          background: T.canvas,
          padding: 'clamp(3.3rem,6vw,5rem) clamp(1.25rem,4vw,3rem)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Reveal>
            <SectionLabel>Feature grid</SectionLabel>
            <h2
              style={{
                fontSize: 'clamp(1.8rem,3.6vw,2.6rem)',
                fontWeight: 600,
                color: T.ink950,
                letterSpacing: '-0.015em',
                margin: '0 0 1.1rem',
              }}
            >
              Capabilities designed for official use
            </h2>
            <p style={{ fontSize: '0.94rem', color: T.ink600, marginBottom: '1.5rem' }}>
              Short, operational cards for daily workflow.
            </p>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,260px),1fr))', gap: '0.85rem' }}>
            {FEATURE_CARDS.map((item, index) => (
              <FeatureCard key={item.title} icon={item.icon} title={item.title} desc={item.desc} delay={index * 55} />
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════ */}
      {/* STATUS MACHINE SECTION                 */}
      {/* ══════════════════════════════════════ */}
      <section
        style={{
          background: T.pageSoft,
          padding: 'clamp(3.3rem,6vw,5rem) clamp(1.25rem,4vw,3rem)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Reveal>
            <SectionLabel>Status machine</SectionLabel>
            <h2
              style={{
                fontSize: 'clamp(1.8rem,3.6vw,2.6rem)',
                fontWeight: 600,
                color: T.ink950,
                letterSpacing: '-0.015em',
                margin: '0 0 0.6rem',
              }}
            >
              Current state, next action, explicit failures
            </h2>
            <p style={{ fontSize: '0.93rem', color: T.ink600, marginBottom: '1.5rem', maxWidth: 640 }}>
              The state rail makes operational transitions readable and testable.
            </p>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 280px) 1fr', gap: '1rem', alignItems: 'start' }}>
            <div
              style={{
                background: T.canvas,
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                padding: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
              }}
            >
              {STATUS_MACHINE_STATES.map((state) => (
                <button
                  key={state.id}
                  type="button"
                  onClick={() => setActiveStatus(state.id)}
                  className="adlts-status-button"
                  aria-pressed={activeStatus === state.id}
                  style={{
                    width: '100%',
                    border: `1px solid ${activeStatus === state.id ? T.blue600 : T.border}`,
                    background: activeStatus === state.id ? `${T.blue50}` : T.canvas,
                    color: activeStatus === state.id ? T.blue800 : T.ink800,
                    borderRadius: 10,
                    padding: '0.58rem 0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.74rem',
                    fontWeight: activeStatus === state.id ? 700 : 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ textTransform: 'lowercase' }}>{state.id}</span>
                  <StatusBadge label={state.status} color={state.color} />
                </button>
              ))}
            </div>

            <div
              style={{
                background: T.canvas,
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                minHeight: '100%',
              }}
            >
              <div>
                <div style={{ fontSize: '0.7rem', color: T.ink500, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'ui-monospace,monospace' }}>
                  Selected status
                </div>
                <div style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: T.ink900,
                  marginTop: '0.2rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  textTransform: 'capitalize',
                }}>
                  <StatusBadge label={currentStatus.status} color={currentStatus.color} />
                  {currentStatus.id}
                </div>
              </div>
              <div>
                <div style={{ color: T.ink600, fontSize: '0.76rem', marginBottom: '0.35rem' }}>Current state</div>
                <p style={{ margin: 0, color: T.ink800, fontSize: '0.9rem', lineHeight: 1.65 }}>{currentStatus.meaning}</p>
              </div>
              <div>
                <div style={{ color: T.ink600, fontSize: '0.76rem', marginBottom: '0.35rem' }}>Next expected action</div>
                <p style={{ margin: 0, color: T.ink800, fontSize: '0.9rem', lineHeight: 1.65 }}>{currentStatus.action}</p>
              </div>

              <div>
                <div style={{ color: T.ink600, fontSize: '0.76rem', marginBottom: '0.45rem' }}>Appeal mini-preview</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  {APPEAL_STATUSES.map((status) => (
                    <span
                      key={status.label}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.74rem',
                        color: T.ink700,
                      }}
                    >
                      <StatusBadge label={status.label} color={status.color} /> {status.text}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════ */}
      {/* TRUST AND AUDITABILITY                */}
      {/* ══════════════════════════════════════ */}
      <section
        style={{
          background: T.canvas,
          padding: 'clamp(3.3rem,6vw,5rem) clamp(1.25rem,4vw,3rem)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Reveal>
            <SectionLabel>Trust and auditability</SectionLabel>
            <h2
              style={{
                fontSize: 'clamp(1.8rem,3.6vw,2.6rem)',
                fontWeight: 600,
                color: T.ink950,
                letterSpacing: '-0.015em',
                margin: '0 0 0.7rem',
              }}
            >
              Oversight and accountability as design primitives
            </h2>
            <p style={{ fontSize: '0.94rem', color: T.ink600, maxWidth: 600, marginBottom: '1.45rem' }}>
              Representative analytics previews for governance views, not live operational figures.
            </p>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,260px),1fr))', gap: '0.85rem' }}>
            {TRUST_CARDS.map((item, index) => (
              <TrustCard key={item.title} icon={item.icon} title={item.title} desc={item.desc} delay={index * 60} />
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════ */}
      {/* REPORT PREVIEW                         */}
      {/* ══════════════════════════════════════ */}
      <section
        style={{
          background: T.pageSoft,
          padding: 'clamp(3.3rem,6vw,5rem) clamp(1.25rem,4vw,3rem)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))',
            gap: '2rem',
            alignItems: 'center',
          }}
        >
          <Reveal>
            <SectionLabel>Report preview</SectionLabel>
            <h2
              style={{
                fontSize: 'clamp(1.8rem,3.6vw,2.6rem)',
                fontWeight: 600,
                color: T.ink950,
                letterSpacing: '-0.015em',
                margin: '0 0 0.9rem',
              }}
            >
              Structured analytics, sample report layout
            </h2>
            <p style={{ fontSize: '0.94rem', color: T.ink600, lineHeight: 1.72, marginBottom: '1rem' }}>
              Structured analytics remain the source of truth. Narrative explains results without changing deterministic decisions.
            </p>
            <p style={{ color: T.ink500, fontSize: '0.77rem', margin: 0 }}>
              Product preview only.
            </p>
          </Reveal>
          <ReportPreviewCard />
        </div>
      </section>

      <SupportCTA />

      {/* ══════════════════════════════════════ */}
      {/* FOOTER                                */}
      {/* ══════════════════════════════════════ */}
      <footer
        style={{
          background: T.navy950,
          borderTop: `1px solid rgba(255,255,255,0.18)`,
          color: '#d6def2',
          padding: '2.2rem clamp(1.25rem,4vw,3rem)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,190px),1fr))',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 700,
                color: '#fff',
                fontSize: '0.95rem',
                marginBottom: '0.4rem',
              }}
            >
              ADLTS
            </div>
            <p style={{ margin: 0, maxWidth: 280, color: '#9fb0d9', fontSize: '0.76rem', lineHeight: 1.6 }}>
              A public service journey for transparent, auditable, and structured driver testing operations.
            </p>
          </div>

          <div>
            <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.67rem', letterSpacing: '0.08em', color: '#9fb0d9', textTransform: 'uppercase', marginBottom: '0.55rem' }}>
              Product
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <Link href="/about" className="adlts-footer-link">About</Link>
              <Link href="/guidelines" className="adlts-footer-link">Guidelines</Link>
              <Link href="/privacy-policy" className="adlts-footer-link">Privacy policy</Link>
            </div>
          </div>

          <div>
            <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.67rem', letterSpacing: '0.08em', color: '#9fb0d9', textTransform: 'uppercase', marginBottom: '0.55rem' }}>
              Access
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <Link href="/login" className="adlts-footer-link">Login</Link>
              <Link href="/candidate/register" className="adlts-footer-link">Candidate registration</Link>
              <Link href="/contact" className="adlts-footer-link">Contact</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Pulse + focus-visible styles */}
      <style>{`
        @keyframes pulse {
          0%,100%{opacity:1;transform:scale(1)}
          50%{opacity:0.5;transform:scale(0.85)}
        }

        .adlts-pulse-dot {
          animation: pulse 1.5s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .adlts-pulse-dot {
            animation: none;
          }
        }

        .adlts-status-button:focus-visible {
          outline: 2px solid ${T.blue600};
          outline-offset: 2px;
        }

        .adlts-footer-link {
          color: #d6def2;
          text-decoration: none;
          font-size: 0.78rem;
          width: fit-content;
        }

        .adlts-footer-link:hover {
          color: #ffffff;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
      `}</style>
    </div>
  )
}
