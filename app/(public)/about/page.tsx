import { Building2, ClipboardCheck, CreditCard, FileText, LockKeyhole, Scale, UserCheck } from "lucide-react";

import {
  PublicButtonLink,
  PublicCard,
  PublicHeader,
  PublicList,
  PublicSection,
  PublicTimeline,
} from "@/app/components/ui";

const missionBullets = [
  "Give candidates a clear path from account creation to results.",
  "Help institutes review booking requests with the right context.",
  "Support administrators with monitoring and reporting tools.",
  "Keep expert review and appeal resolution organized.",
  "Keep platform ownership and supported authority access clearly separated.",
];

const coordinationCards = [
  {
    icon: UserCheck,
    title: "Registration and identity",
    body: "Candidate accounts, contact details, OTP verification, profile updates, password reset, and role-based login.",
  },
  {
    icon: ClipboardCheck,
    title: "Booking and readiness",
    body: "Institution selection, license category, preferred exam date, session, blood type, notes, and candidate details.",
  },
  {
    icon: Building2,
    title: "Review and approval",
    body: "Institute request queues, filters, candidate details, approve actions, reject actions, and pending-status rules.",
  },
  {
    icon: CreditCard,
    title: "Payments",
    body: "Payment initiation after approval, retry support, payment status, amount due, booking reference, and payment history.",
  },
  {
    icon: FileText,
    title: "Testing and results",
    body: "Active exam monitoring, exam history, score breakdown, result visibility, and hidden results while under review.",
  },
  {
    icon: Scale,
    title: "Governance",
    body: "Institution invitations, review queues, compliance planning, reports, and settings.",
  },
];

const stakeholders = [
  ["Candidate", "Registers, requests booking, pays after approval, tracks exam and results."],
  ["Institute", "Reviews candidate requests, approves or rejects pending bookings, manages institution profile."],
  ["Admin", "Monitors devices, active exams, candidates, invitations, and reports."],
  ["Expert", "Reviews flagged exam concerns and resolves pending cases."],
  ["Super admin", "Manages institutions, candidates, experts, invitations, reports, and platform ownership workflows."],
  ["Transport authority", "Uses lightweight profile and settings access until authority workflows are added to the backend."],
];

const principles = [
  ["Transparency", "Users should understand what a status means and what action comes next."],
  ["Accountability", "Sensitive actions such as approvals, invitations, status changes, and review resolution should be traceable."],
  ["Role clarity", "Users should only see the tools and data needed for their role."],
  ["Operational reliability", "The interface should show loading, empty, unavailable, and error states honestly."],
  ["Accessibility", "The platform should remain usable across devices, languages, and user abilities."],
  ["No fake data", "Dashboards should not invent business records or success states when the backend has not returned them."],
];

const lifecycleSteps = [
  { title: "A candidate creates an account and signs in." },
  { title: "The candidate submits a booking request for an active institute." },
  { title: "The institute reviews the request and decides whether it can proceed." },
  { title: "Approved requests move to payment." },
  { title: "Paid or scheduled requests move toward examination." },
  { title: "Exam results become available after completion and review." },
  { title: "Experts, administrators, super admins, and authorities monitor the system from their portals." },
];

const outcomes = [
  "Fewer manual follow-ups for candidates.",
  "Better visibility for institution request queues.",
  "Faster recognition of device and exam issues.",
  "More consistent handling of appeals and flagged cases.",
  "Clearer operational ownership across supported portal workflows.",
  "Stronger public confidence in the testing process.",
];

export default function AboutPage() {
  return (
    <main>
      <PublicSection tone="surface" className="pt-16">
        <div className="max-w-4xl">
          <p className="text-[14px] font-medium text-[var(--text-secondary)]">About ADLTS</p>
          <h1 className="mt-4 text-[40px] font-bold leading-tight text-[var(--text-primary)] max-md:text-[32px]">
            Digital infrastructure for a clearer driving license testing process.
          </h1>
          <p className="mt-5 text-[18px] leading-8 text-[var(--text-secondary)]">
            ADLTS is a role-based platform for managing the driving license testing lifecycle. It connects candidates, institutes, administrators, experts, super admins, and lightweight transport authority access through one accountable workflow.
          </p>
          <p className="mt-5 text-[15px] leading-7 text-[var(--text-secondary)]">
            The system is designed to reduce uncertainty in the testing process. Candidates can see where they are in the journey. Institutes can review requests assigned to them. Administrators can monitor operational readiness. Experts can resolve flagged concerns. Super admins can review platform-level activity, while transport authority access remains limited to supported profile workflows.
          </p>
        </div>
      </PublicSection>

      <PublicSection tone="bg">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <PublicHeader title="Our mission" />
          <div>
            <p className="text-[16px] leading-7 text-[var(--text-secondary)]">
              ADLTS exists to make driving license testing easier to follow, easier to administer, and easier to oversee. The platform does this by turning scattered tasks into a sequence of authenticated, role-specific actions.
            </p>
            <div className="mt-6">
              <PublicList items={missionBullets} />
            </div>
          </div>
        </div>
      </PublicSection>

      <PublicSection tone="surface">
        <PublicHeader title="What the platform coordinates" />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {coordinationCards.map((card) => (
            <PublicCard key={card.title} icon={card.icon} title={card.title}>
              {card.body}
            </PublicCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection tone="bg">
        <PublicHeader
          title="One process, separate responsibilities."
          lead="Each role has a different responsibility. ADLTS keeps those responsibilities separate while making the full process easier to understand."
        />
        <div className="mt-10 overflow-hidden rounded-[8px] border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[var(--surface-2)] text-[12px] font-medium text-[var(--text-secondary)]">
              <tr>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Responsibility</th>
              </tr>
            </thead>
            <tbody>
              {stakeholders.map(([role, responsibility]) => (
                <tr key={role} className="border-t border-[var(--border)]">
                  <td className="px-4 py-4 text-[14px] font-semibold text-[var(--text-primary)]">{role}</td>
                  <td className="px-4 py-4 text-[14px] leading-6 text-[var(--text-secondary)]">{responsibility}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PublicSection>

      <PublicSection tone="surface">
        <PublicHeader title="Principles behind the system" />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {principles.map(([title, body]) => (
            <PublicCard key={title} icon={LockKeyhole} title={title}>
              {body}
            </PublicCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection tone="bg">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <PublicHeader title="How the ADLTS lifecycle works" />
          <PublicTimeline steps={lifecycleSteps} />
        </div>
      </PublicSection>

      <PublicSection tone="surface">
        <PublicHeader title="What improves when the workflow is connected" />
        <div className="mt-8">
          <PublicList items={outcomes} />
        </div>
      </PublicSection>

      <PublicSection tone="accent">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-[32px] font-bold leading-tight text-[var(--surface)]">
              Start with the right next step.
            </h2>
            <p className="mt-4 text-[16px] leading-7 text-[var(--accent-subtle)]">
              Candidates can register directly. Staff and institutional roles should use authorized onboarding or contact support.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <PublicButtonLink href="/candidate/register" variant="inverse">Register as candidate</PublicButtonLink>
            <PublicButtonLink href="/guidelines" variant="inverse-outline">Read guidelines</PublicButtonLink>
            <PublicButtonLink href="/contact" variant="inverse-outline">Contact ADLTS</PublicButtonLink>
          </div>
        </div>
      </PublicSection>
    </main>
  );
}
