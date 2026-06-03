import { Database, LockKeyhole, ShieldCheck, UserCheck } from "lucide-react";

import {
  PublicButtonLink,
  PublicCard,
  PublicHeader,
  PublicList,
  PublicSection,
} from "@/app/components/ui";

const principles = [
  ["Purpose limitation", "Data should be used to operate the testing workflow, secure accounts, process requests, and support oversight."],
  ["Role-based visibility", "Candidates, institutes, administrators, experts, super admins, and authorities should see only the data needed for their tasks."],
  ["Transparency", "Users should understand why information is requested and what it supports."],
  ["Security", "Authentication, sessions, role routing, and password controls protect access to portal data."],
  ["Accuracy", "Profile and booking details should be kept up to date to avoid review and scheduling issues."],
];

const storedData = [
  ["Account data", "Name, email, phone number, role, password credentials, OTP verification state, and session state."],
  ["Candidate profile data", "First name, last name, phone, birth date, gender, address, Fayda ID, license category, and test center details when provided."],
  ["Booking data", "Institution, license category, blood type, preferred date, preferred session, notes, candidate details, status, and timestamps."],
  ["Payment data", "Booking ID, amount, currency, provider, provider reference, checkout URL when returned, status, metadata, and timestamps."],
  ["Exam data", "Exam ID, date, type, score, result, center, performance breakdown, notes, and result visibility."],
  ["Operational data", "Device status, active exam status, reports, staff invitations, institution accounts, audit logs, review queues, compliance alerts, and notifications."],
];

const dataUses = [
  "Authenticate users and route them to the correct portal.",
  "Let candidates submit and track bookings.",
  "Let institutes review candidate requests.",
  "Open payment only after approval.",
  "Show exam history and result details.",
  "Help administrators monitor operational readiness.",
  "Help experts review flagged cases.",
  "Help transport authorities monitor compliance.",
  "Help super admins govern institutions and audit activity.",
  "Send notifications and status updates.",
  "Support troubleshooting and security review.",
];

const roleAccess = [
  ["Candidate", "Own profile, own bookings, own payments, own exams, own notifications and settings."],
  ["Institute", "Booking requests assigned to the institute, candidate details needed for review, institute profile, and related notifications."],
  ["Admin", "Operational device data, active exam monitor, candidates, invitations, reports, and notifications."],
  ["Expert", "Flagged review cases and profile/settings data for the expert account."],
  ["Super admin", "System-level metrics, institution accounts, audit logs, invitations, profile, notifications, and settings."],
  ["Transport authority", "Regional analytics, compliance alerts, profile, notifications, and settings."],
];

const securityPractices = [
  "Login uses authenticated backend sessions.",
  "Role-based redirects send users to the proper home route.",
  "Password reset uses token-based reset links.",
  "Candidate registration may use OTP verification.",
  "Password changes require current and new password fields.",
  "Payment actions are tied to a booking ID.",
  "Result visibility can be restricted while under review.",
  "Audit logs support oversight of system events.",
];

const userResponsibilities = [
  "Use an email account you control.",
  "Keep your password private.",
  "Do not share OTP codes or reset links.",
  "Sign out on shared devices.",
  "Keep profile and contact details accurate.",
  "Contact support immediately if you suspect unauthorized access.",
];

export default function PrivacyPolicyPage() {
  return (
    <main>
      <PublicSection tone="surface" className="pt-16">
        <div className="max-w-4xl">
          <p className="text-[14px] font-medium text-[var(--text-secondary)]">Privacy and security</p>
          <h1 className="mt-4 text-[40px] font-bold leading-tight text-[var(--text-primary)] max-md:text-[32px]">
            How ADLTS handles role-based testing data.
          </h1>
          <p className="mt-5 text-[18px] leading-8 text-[var(--text-secondary)]">
            ADLTS uses personal, booking, payment, exam, and operational data to support official driving license testing workflows. The platform should show only the information needed for each authenticated role.
          </p>
          <p className="mt-6 rounded-[8px] border border-[var(--warning)] bg-[var(--warning-subtle)] p-4 text-[14px] leading-6 text-[var(--text-primary)]">
            This page content is a product privacy explainer and should be reviewed by the responsible legal or policy authority before publication as a binding privacy policy.
          </p>
        </div>
      </PublicSection>

      <PublicSection tone="bg">
        <PublicHeader title="Privacy principles" />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {principles.map(([title, body]) => (
            <PublicCard key={title} icon={ShieldCheck} title={title}>
              {body}
            </PublicCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection tone="surface">
        <PublicHeader title="What ADLTS stores" />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {storedData.map(([title, body]) => (
            <PublicCard key={title} icon={Database} title={title}>
              {body}
            </PublicCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection tone="bg">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <PublicHeader title="How ADLTS uses data" />
          <PublicList items={dataUses} />
        </div>
      </PublicSection>

      <PublicSection tone="surface">
        <PublicHeader title="Who can see what?" />
        <div className="mt-10 overflow-hidden rounded-[8px] border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[var(--surface-2)] text-[12px] font-medium text-[var(--text-secondary)]">
              <tr>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Access</th>
              </tr>
            </thead>
            <tbody>
              {roleAccess.map(([role, access]) => (
                <tr key={role} className="border-t border-[var(--border)]">
                  <td className="px-4 py-4 text-[14px] font-semibold text-[var(--text-primary)]">{role}</td>
                  <td className="px-4 py-4 text-[14px] leading-6 text-[var(--text-secondary)]">{access}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PublicSection>

      <PublicSection tone="bg">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <PublicHeader title="Security practices in the product" />
          <PublicCard icon={LockKeyhole} title="Security practices">
            <PublicList items={securityPractices} />
          </PublicCard>
        </div>
      </PublicSection>

      <PublicSection tone="surface">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <PublicHeader title="How users can protect their accounts" />
          <PublicCard icon={UserCheck} title="User responsibilities">
            <PublicList items={userResponsibilities} />
          </PublicCard>
        </div>
      </PublicSection>

      <PublicSection tone="accent">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-[32px] font-bold leading-tight text-[var(--surface)]">Requesting corrections</h2>
            <p className="mt-4 text-[16px] leading-7 text-[var(--accent-subtle)]">
              If your profile, booking, payment, or exam information appears incorrect, contact support with your account email and the relevant reference ID. Operational corrections may require review by the responsible institute, admin, expert, or authority role.
            </p>
          </div>
          <PublicButtonLink href="/contact" variant="inverse">Contact support</PublicButtonLink>
        </div>
      </PublicSection>
    </main>
  );
}
