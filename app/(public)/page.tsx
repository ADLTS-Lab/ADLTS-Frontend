import {
  Building2,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileText,
  GraduationCap,
  Landmark,
  LockKeyhole,
  MonitorCheck,
  Scale,
  SearchCheck,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";

import {
  PublicButtonLink,
  PublicCard,
  PublicFAQ,
  PublicHeader,
  PublicList,
  PublicSection,
  PublicTimeline,
  StatusBadge,
} from "@/app/components/ui";

const roleCards = [
  {
    icon: Users,
    title: "Candidates",
    body: "Create an account, submit booking requests, complete payment, track exam status, view result history, and update profile details.",
  },
  {
    icon: Building2,
    title: "Institutes",
    body: "Review booking requests assigned to your institution, confirm candidate readiness, approve or reject requests, and manage institution profile details.",
  },
  {
    icon: MonitorCheck,
    title: "Administrators",
    body: "Monitor biometric devices, active exams, candidate accounts, staff invitations, reports, and operational notifications.",
  },
  {
    icon: SearchCheck,
    title: "Experts",
    body: "Review flagged exam concerns and resolve appeal or review queues with traceable action.",
  },
  {
    icon: ShieldCheck,
    title: "Super admins",
    body: "Manage institution onboarding, monitor system metrics, review audit logs, and keep platform governance visible.",
  },
  {
    icon: Landmark,
    title: "Transport authorities",
    body: "Review regional performance indicators and compliance alerts across active test centers.",
  },
];

const problemPoints = [
  "Candidates need to know what step they are in and what action is required next.",
  "Institutes need a reliable request queue with candidate details, filters, and approval actions.",
  "Administrators need visibility into devices, active exams, candidates, reports, and invitations.",
  "Experts need flagged cases collected into a review queue.",
  "Transport authorities need compliance and performance signals from official workflows.",
  "Super admins need account governance, institution onboarding, and audit visibility.",
];

const workflowSteps = [
  {
    title: "Candidate account creation",
    body: "The candidate registers with identity and contact details, creates a password, and verifies the account when OTP verification is required.",
  },
  {
    title: "Booking request",
    body: "The candidate selects an active institute, license category, blood type, preferred exam date, session, and optional notes.",
  },
  {
    title: "Institution review",
    body: "The institute reviews the request and candidate details. Pending requests can be approved or rejected according to workflow rules.",
  },
  {
    title: "Payment",
    body: "Payment opens after approval. The candidate can initiate or retry payment and then return to the booking page for updated status.",
  },
  {
    title: "Scheduling and examination",
    body: "Approved and paid requests move toward scheduling. Admin teams can monitor active exams and device readiness where backend data is available.",
  },
  {
    title: "Result publication",
    body: "Candidates view exam history and score breakdown after results are available. Results can remain hidden while under review.",
  },
  {
    title: "Review and oversight",
    body: "Experts resolve flagged concerns, super admins review audit activity, and transport authorities monitor compliance alerts.",
  },
];

const journeyCards = [
  {
    icon: UserCheck,
    title: "Create your profile",
    body: "Register with name, email, phone number, password, and optional identity details such as Fayda ID, birth date, and gender.",
  },
  {
    icon: ClipboardCheck,
    title: "Submit a booking request",
    body: "Choose an active institution and license category. Add blood type, preferred date, session, and notes to help the institution review the request.",
  },
  {
    icon: SearchCheck,
    title: "Wait for review",
    body: "A pending booking means the institution is reviewing it. Candidates should not submit duplicate active bookings.",
  },
  {
    icon: CreditCard,
    title: "Complete payment",
    body: "Payment becomes available after approval. The payment page shows booking reference, amount due, payment status, and retry actions when needed.",
  },
  {
    icon: GraduationCap,
    title: "Prepare for the test",
    body: "Once scheduled, candidates can review the booking and wait for exam instructions from the responsible institution or testing center.",
  },
  {
    icon: FileText,
    title: "Review results",
    body: "The exam history page shows completed tests, pass/fail result, score, center, and breakdown when result visibility is enabled.",
  },
];

const institutionCapabilities = [
  "View recent enrollments and request counts.",
  "Filter requests by search term, status, and license category.",
  "Review candidate name, email, phone, license category, preferred date, session, and booking date.",
  "Open candidate details before approving or rejecting.",
  "Approve or reject only pending bookings.",
  "Maintain institution profile details, contact person, phone, address, description, and logo.",
];

const adminCards = [
  {
    title: "Device management",
    body: "Track biometric units, status, storage utilization, uptime, battery, signal, latency, and warnings where backend data is available.",
  },
  {
    title: "Active exams",
    body: "Monitor running exams, progress, live score, violations, and status categories such as stable, warning, excellent, or review.",
  },
  {
    title: "Candidate management",
    body: "Search candidates, review contact and testing information, and activate or suspend accounts.",
  },
  {
    title: "Invitations",
    body: "Create, resend, and delete staff invitations for roles such as expert, admin, super admin, institute, and transport authority.",
  },
  {
    title: "Reports",
    body: "Generate and download exam reports by test ID when backend endpoints are available.",
  },
];

const oversightCards = [
  {
    icon: SearchCheck,
    title: "Expert review",
    body: "Experts see pending reviews, completed work, flagged issues, candidate names, exam dates, issue types, statuses, and resolve actions.",
  },
  {
    icon: ShieldCheck,
    title: "Super admin governance",
    body: "Super admins monitor system metrics, institution accounts, invitation status, active devices, audit events, and platform health.",
  },
  {
    icon: Landmark,
    title: "Transport authority oversight",
    body: "Authority users review licensed driver counts, regional pass rates, active centers, pending violations, and compliance alerts when the endpoints provide data.",
  },
];

const statuses = [
  ["Pending", "Your request has been submitted and is waiting for institution review."],
  ["Approved", "Your request has been accepted by the institution. Payment is now required unless it has already been completed."],
  ["Payment Pending", "Payment is required or in progress before scheduling can continue."],
  ["Scheduled", "Your test has been scheduled. Review your booking details and follow official instructions."],
  ["Rejected", "The institution rejected the request. Review the reason if provided and submit a new request when ready."],
  ["Cancelled", "The booking was cancelled. You can create a new booking after cancellation."],
  ["Completed", "The test workflow is complete and results may be available."],
  ["Expired", "The request is no longer active. Start a new booking if you still need to test."],
];

const securityPoints = [
  "Users sign in through authenticated sessions.",
  "Role redirects send users to the correct portal.",
  "Candidate information is shown only where operationally necessary.",
  "Payment details are linked to booking records.",
  "Exam details and results can remain hidden while under review.",
  "Audit logs support system accountability.",
  "Sensitive support requests should include request IDs, not unnecessary personal details.",
];

const benefits = [
  "Candidates understand the process before and after they apply.",
  "Institutes review requests from one queue.",
  "Admins monitor devices and active exams from dedicated pages.",
  "Experts resolve flagged cases through a structured review path.",
  "Authorities review compliance issues from a regional view.",
  "Super admins govern institutions and audit logs from a system-level portal.",
];

const faqs = [
  {
    question: "Who can register directly?",
    answer: "Candidates can create an account through the registration page. Staff roles such as institute, expert, admin, super admin, and transport authority are invitation-based or managed through authorized onboarding.",
  },
  {
    question: "Can I create more than one active booking?",
    answer: "No. If you already have a pending, approved, payment pending, or scheduled booking, finish or close that workflow before creating another request.",
  },
  {
    question: "When does payment become available?",
    answer: "Payment becomes available after the selected institution approves the booking request.",
  },
  {
    question: "Where do I see my results?",
    answer: "Candidates can view exam history and result breakdowns in the candidate portal after results are available and visible.",
  },
  {
    question: "What if my result is not visible?",
    answer: "Some results may be under review. The result detail page should explain that the result will be published once approved.",
  },
  {
    question: "Who reviews flagged exams?",
    answer: "Expert users review flagged exams or appeals through the expert portal.",
  },
  {
    question: "How are institutions added?",
    answer: "Super admins can invite institutions, resend invitations, and disable institution accounts through the super admin portal.",
  },
  {
    question: "Does ADLTS replace institution review?",
    answer: "No. ADLTS gives institutions and authorities a structured digital workflow. It does not remove official review responsibilities.",
  },
];

export default function LandingPage() {
  return (
    <main>
      <PublicSection tone="surface" className="pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-[14px] font-medium text-[var(--text-secondary)]">
              Automated Driving License Testing System
            </p>
            <h1 className="mt-4 max-w-3xl text-[48px] font-bold leading-tight text-[var(--text-primary)] max-md:text-[36px]">
              Driving license testing, coordinated from registration to results.
            </h1>
            <p className="mt-5 max-w-2xl text-[18px] leading-8 text-[var(--text-secondary)]">
              ADLTS brings candidates, driving institutes, exam teams, administrators, experts, and transport authorities into one transparent testing workflow. Register once, track every milestone, and let each responsible role complete its part with clear status updates.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PublicButtonLink href="/candidate/register">Start registration</PublicButtonLink>
              <PublicButtonLink href="/guidelines" variant="secondary">Read guidelines</PublicButtonLink>
              <PublicButtonLink href="/login" variant="secondary">Already have an account? Login</PublicButtonLink>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                ["Register", "Create your candidate profile and verify your account."],
                ["Book", "Choose an active institution, license category, preferred date, and session."],
                ["Pay", "Complete the required payment after institution approval."],
                ["Test", "Attend the scheduled practical exam and wait for verified results."],
              ].map(([title, body], index) => (
                <div key={title} className="rounded-[8px] border border-[var(--border)] bg-[var(--accent-subtle)] p-4">
                  <span className="text-[12px] font-semibold text-[var(--accent)]">{index + 1}. {title}</span>
                  <p className="mt-1 text-[13px] leading-5 text-[var(--text-secondary)]">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-4">
            <img
              src="/hero_driving_test.png"
              alt="ADLTS workflow dashboard preview"
              className="aspect-[4/3] w-full rounded-[6px] object-cover"
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                "Role-based access for every participant.",
                "Transparent booking lifecycle.",
                "Secure account and session handling.",
                "Operational dashboards for institutions and authorities.",
              ].map((item) => (
                <div key={item} className="flex gap-2 text-[13px] leading-5 text-[var(--text-secondary)]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PublicSection>

      <PublicSection tone="bg">
        <PublicHeader
          title="Built for every role in the testing process."
          lead="Driving license testing requires more than a candidate form. ADLTS gives each participant a focused portal so the whole process can move with fewer manual handoffs and clearer accountability."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roleCards.map((card) => (
            <PublicCard key={card.title} icon={card.icon} title={card.title}>
              {card.body}
            </PublicCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection tone="surface">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <PublicHeader
            title="Testing should not depend on disconnected handoffs."
            lead="When registration, institution review, payment, scheduling, exam monitoring, and result publication live in separate channels, candidates lose visibility and operators lose time. ADLTS reduces that fragmentation by making the workflow visible, role-based, and easier to audit."
          />
          <div>
            <PublicList items={problemPoints} />
            <p className="mt-6 rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] p-4 text-[14px] leading-6 text-[var(--text-primary)]">
              ADLTS does not remove institutional responsibility. It gives each role a structured place to perform that responsibility.
            </p>
          </div>
        </div>
      </PublicSection>

      <PublicSection tone="bg">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <PublicHeader
            title="The complete testing lifecycle in one platform."
            lead="Every candidate journey follows a visible path. Each step has a responsible role, a clear status, and a next action."
          />
          <PublicTimeline steps={workflowSteps} />
        </div>
      </PublicSection>

      <PublicSection tone="surface">
        <PublicHeader
          title="A candidate experience designed around next steps."
          lead="The candidate portal should answer three questions at every moment: where am I, what changed, and what should I do next?"
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {journeyCards.map((card) => (
            <PublicCard key={card.title} icon={card.icon} title={card.title}>
              {card.body}
            </PublicCard>
          ))}
        </div>
        <p className="mt-6 rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] p-4 text-[14px] leading-6 text-[var(--text-primary)]">
          Each booking has a status. Each status has a next action. If a step is unavailable, ADLTS should explain why.
        </p>
      </PublicSection>

      <PublicSection tone="bg">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <PublicHeader
              title="Institutions get a clear request queue."
              lead="Institutes are responsible for reviewing booking requests assigned to them. ADLTS gives them the context they need to act carefully and consistently."
            />
            <p className="mt-6 text-[14px] leading-6 text-[var(--text-secondary)]">
              Institutes can focus on readiness review instead of chasing scattered submissions. Every request is tied to a candidate, a category, a preferred session, and a current status.
            </p>
          </div>
          <PublicCard icon={Building2} title="Institution capabilities">
            <PublicList items={institutionCapabilities} />
          </PublicCard>
        </div>
      </PublicSection>

      <PublicSection tone="surface">
        <PublicHeader
          title="Operational monitoring for devices, exams, candidates, and reports."
          lead="Admin users manage the operational layer of the platform. Their pages should be efficient, scan-friendly, and built for repeated daily use."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {adminCards.map((card) => (
            <PublicCard key={card.title} title={card.title}>
              {card.body}
            </PublicCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection tone="bg">
        <PublicHeader
          title="Review queues and authority visibility."
          lead="Automated systems still need human oversight. ADLTS includes expert review, audit logs, and transport authority views to support accountable decisions."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {oversightCards.map((card) => (
            <PublicCard key={card.title} icon={card.icon} title={card.title}>
              {card.body}
            </PublicCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection tone="surface">
        <PublicHeader
          title="Every status should tell users what it means."
          lead="A status label is not enough. Each status should be paired with a next action and a short explanation."
        />
        <dl className="mt-10 grid gap-4 md:grid-cols-2">
          {statuses.map(([status, description]) => (
            <div key={status} className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-5">
              <dt><StatusBadge status={status} /></dt>
              <dd className="mt-3 text-[14px] leading-6 text-[var(--text-secondary)]">{description}</dd>
            </div>
          ))}
        </dl>
      </PublicSection>

      <PublicSection tone="bg">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <PublicHeader
            title="Role-based access for sensitive testing data."
            lead="ADLTS handles identity, booking, payment, examination, and operational data. The interface should make privacy and role access visible without overwhelming users."
          />
          <PublicCard icon={LockKeyhole} title="Security and privacy promise">
            <PublicList items={securityPoints} />
          </PublicCard>
        </div>
      </PublicSection>

      <PublicSection tone="surface">
        <PublicHeader
          title="A stronger foundation for modern license testing."
          lead="Digital testing infrastructure is not only about speed. It is about clearer responsibility, fewer blind spots, better candidate communication, and more reliable operational records."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((item) => (
            <PublicCard key={item} icon={Scale} title={item}>
              {item}
            </PublicCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection tone="bg">
        <PublicHeader title="Common questions before you start." align="center" />
        <div className="mx-auto mt-10 max-w-3xl">
          <PublicFAQ items={faqs} />
        </div>
      </PublicSection>

      <PublicSection tone="accent">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-[32px] font-bold leading-tight text-[var(--surface)]">
              Ready to begin your driving test journey?
            </h2>
            <p className="mt-4 text-[16px] leading-7 text-[var(--accent-subtle)]">
              Create your candidate account, submit your booking request, and track every step from review to results.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <PublicButtonLink href="/candidate/register" variant="inverse">Start registration</PublicButtonLink>
            <PublicButtonLink href="/guidelines" variant="inverse-outline">Read guidelines</PublicButtonLink>
            <PublicButtonLink href="/contact" variant="inverse-outline">Need help? Contact support</PublicButtonLink>
          </div>
        </div>
      </PublicSection>
    </main>
  );
}
