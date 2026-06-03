"use client";

import { useState } from "react";
import { AlertTriangle, Building2, CreditCard, FileQuestion, Mail, MapPin, MonitorCog, Phone, UserRound } from "lucide-react";

import {
  FormField,
  PublicButtonLink,
  PublicCard,
  PublicHeader,
  PublicList,
  PublicSection,
  formControlClassName,
  formTextareaClassName,
} from "@/app/components/ui";

const channels = [
  {
    icon: Mail,
    title: "Email support",
    value: "support@adlts.et",
    body: "Use for account access, booking questions, payment issues, result visibility, onboarding, and general support.",
  },
  {
    icon: Phone,
    title: "Direct line",
    value: "+251 11 000 0000",
    body: "Use for time-sensitive support during official working hours.",
  },
  {
    icon: MapPin,
    title: "Office",
    value: "Addis Ababa, Ethiopia",
    body: "Use for official in-person support when physical verification is required.",
  },
];

const issueTypes = [
  {
    icon: UserRound,
    title: "Account access",
    body: "Login problems, password reset, OTP verification, locked account, or incorrect role routing.",
  },
  {
    icon: FileQuestion,
    title: "Candidate booking",
    body: "Booking creation, duplicate booking block, institution selection, license category, cancellation, or status questions.",
  },
  {
    icon: CreditCard,
    title: "Payment",
    body: "Payment not opening, failed checkout, retry payment, missing payment update, or receipt questions.",
  },
  {
    icon: FileQuestion,
    title: "Exam and results",
    body: "Scheduled exam details, missing results, hidden result under review, or result breakdown questions.",
  },
  {
    icon: Building2,
    title: "Institution support",
    body: "Institute request queue, approval or rejection errors, profile updates, or institution onboarding.",
  },
  {
    icon: MonitorCog,
    title: "Operational support",
    body: "Admin device data, active exam monitor, reports, invitations, compliance alerts, or audit visibility.",
  },
];

const messageChecklist = [
  "Your full name.",
  "Your account email.",
  "Your role, such as candidate, institute, admin, expert, super admin, or transport authority.",
  "Booking reference, payment reference, or exam ID when relevant.",
  "The page where the problem happened.",
  "The exact status or error message shown.",
  "A short description of what you expected to happen.",
];

const urgentExamples = [
  "Locked account before scheduled exam.",
  "Approved booking with payment unavailable.",
  "Payment completed but booking did not update.",
  "Scheduled exam missing from the portal.",
  "Institution queue not loading.",
  "Active exam monitor or device status unavailable during operations.",
];

export default function ContactPage() {
  const [selectedIssue, setSelectedIssue] = useState(issueTypes[0].title);

  return (
    <main>
      <PublicSection tone="surface" className="pt-16">
        <div className="max-w-4xl">
          <p className="text-[14px] font-medium text-[var(--text-secondary)]">Contact support</p>
          <h1 className="mt-4 text-[40px] font-bold leading-tight text-[var(--text-primary)] max-md:text-[32px]">
            Get the right help for your ADLTS workflow.
          </h1>
          <p className="mt-5 text-[18px] leading-8 text-[var(--text-secondary)]">
            Use this page when you need help with account access, booking status, payment, result visibility, institution onboarding, or operational support.
          </p>
        </div>
      </PublicSection>

      <PublicSection tone="bg">
        <PublicHeader title="Support channels" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {channels.map((channel) => (
            <PublicCard key={channel.title} icon={channel.icon} title={channel.title}>
              <p className="font-mono text-[13px] text-[var(--text-primary)]">{channel.value}</p>
              <p className="mt-3">{channel.body}</p>
            </PublicCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection tone="surface">
        <PublicHeader title="What do you need help with?" />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {issueTypes.map((issue) => {
            const Icon = issue.icon;
            const active = selectedIssue === issue.title;
            return (
              <button
                key={issue.title}
                type="button"
                onClick={() => setSelectedIssue(issue.title)}
                className={`rounded-[8px] border p-6 text-left transition-colors duration-150 ${
                  active
                    ? "border-[var(--accent)] bg-[var(--accent-subtle)]"
                    : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]"
                }`}
              >
                <Icon className="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />
                <span className="mt-4 block text-[15px] font-semibold text-[var(--text-primary)]">{issue.title}</span>
                <span className="mt-3 block text-[14px] leading-6 text-[var(--text-secondary)]">{issue.body}</span>
              </button>
            );
          })}
        </div>
      </PublicSection>

      <PublicSection tone="bg">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <PublicHeader title="Help support resolve your request faster." />
          <div>
            <PublicList items={messageChecklist} />
            <p className="mt-6 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-4 text-[14px] font-medium text-[var(--danger)]">
              Do not send your password. Support should never ask for it.
            </p>
          </div>
        </div>
      </PublicSection>

      <PublicSection tone="surface">
        <PublicHeader title="Send ADLTS support a message" />
        <form className="mt-10 grid gap-4 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-6 md:grid-cols-2">
          {[
            "Full name",
            "Email address",
            "Role",
            "Issue category",
            "Booking or exam reference",
          ].map((label) => {
            const isIssueField = label === "Issue category";

            return (
              <FormField key={label} label={label}>
                {({ id }) => (
                  <input
                    id={id}
                    className={formControlClassName}
                    value={isIssueField ? selectedIssue : undefined}
                    readOnly={isIssueField}
                  />
                )}
              </FormField>
            );
          })}
          <FormField label="Message" className="md:col-span-2">
            {({ id }) => (
              <textarea
                id={id}
                className={formTextareaClassName}
                placeholder="Example: My booking is approved, but the payment button is unavailable. Booking reference: {{bookingId}}."
              />
            )}
          </FormField>
          <div className="md:col-span-2">
            <button
              type="button"
              className="inline-flex h-10 items-center rounded-[6px] border border-[var(--accent)] bg-[var(--accent)] px-4 text-[14px] font-medium text-[var(--surface)] transition-colors hover:bg-[var(--accent-hover)]"
            >
              Send message
            </button>
            <p className="mt-3 text-[13px] leading-5 text-[var(--text-secondary)]">
              Your message has been received. Keep your reference number available for follow-up.
            </p>
            <p className="mt-1 text-[13px] leading-5 text-[var(--text-secondary)]">
              Unable to send your message right now. Check your connection and try again.
            </p>
          </div>
        </form>
      </PublicSection>

      <PublicSection tone="bg">
        <div className="rounded-[8px] border border-[var(--danger)] bg-[var(--danger-subtle)] p-6">
          <div className="flex gap-3">
            <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-[var(--danger)]" />
            <div>
              <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">When the issue is urgent</h2>
              <p className="mt-3 text-[14px] leading-6 text-[var(--text-secondary)]">
                Contact support immediately if the issue prevents an active exam, blocks approved payment, hides a required result, or affects institution review for multiple candidates.
              </p>
              <div className="mt-5">
                <PublicList items={urgentExamples} />
              </div>
            </div>
          </div>
        </div>
      </PublicSection>

      <PublicSection tone="accent">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[32px] font-bold text-[var(--surface)]">Looking for self-service steps?</h2>
            <p className="mt-4 text-[16px] leading-7 text-[var(--accent-subtle)]">
              Many questions are answered in the platform guidelines.
            </p>
          </div>
          <PublicButtonLink href="/guidelines" variant="inverse">Read guidelines</PublicButtonLink>
        </div>
      </PublicSection>
    </main>
  );
}
