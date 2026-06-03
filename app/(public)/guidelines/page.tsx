import { ClipboardList, CreditCard, FileCheck2, GraduationCap, ListChecks, SearchCheck } from "lucide-react";

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

const beforeBegin = [
  "Use an email address you can access.",
  "Prepare your phone number and personal details.",
  "Use a strong password with at least 8 characters.",
  "Have any institution or training records requested by your reviewing institute.",
  "Confirm that you are selecting the correct license category.",
  "Keep your booking reference when contacting support.",
];

const requiredFields = [
  "First name.",
  "Last name.",
  "Email address.",
  "Phone number.",
  "Password.",
  "Confirmed password.",
];

const optionalFields = [
  "Fayda ID.",
  "Birth date.",
  "Gender.",
  "Additional institution-required documents or records.",
];

const bookingSteps = [
  { title: "Sign in to your candidate portal." },
  { title: "Open the booking page." },
  { title: "Select an active institution." },
  { title: "Choose your license category: A, B, C, or D." },
  { title: "Add blood type, preferred date, preferred session, and optional notes." },
  { title: "Submit the request." },
  { title: "Wait for institution review." },
  { title: "Pay only after the request is approved." },
  { title: "Track scheduling and exam progress from your portal." },
  { title: "Review results once they are available." },
];

const categories = [
  ["Category A", "Motorcycle and two-wheel motorized vehicle testing."],
  ["Category B", "Light vehicle testing for standard private vehicles and everyday driving."],
  ["Category C", "Public service or passenger vehicle testing, depending on local classification."],
  ["Category D", "Heavy vehicle testing requiring advanced control."],
];

const reviewOutcomes = [
  ["Approved", "The request can proceed to payment."],
  ["Rejected", "The request cannot proceed. The candidate should review any available guidance and submit a new request when ready."],
  ["Still pending", "The institution has not completed review yet. Candidates should check the portal instead of submitting duplicate requests."],
];

const paymentStates = [
  ["Pending or initiated", "Payment has started or is waiting for completion."],
  ["Succeeded", "Payment is complete. The booking can proceed toward scheduling."],
  ["Failed or cancelled", "Use retry payment if available."],
  ["Unavailable", "Payment is not available for the current booking status."],
];

const examReminders = [
  "Arrive according to institution or testing center instructions.",
  "Bring any required identity or training documents.",
  "Review your booking details before the test date.",
  "Follow the testing center's safety instructions.",
  "Do not rely on screenshots alone if official staff request live portal verification.",
];

const statusReference = [
  ["Pending", "Your request is waiting for institution review."],
  ["Approved", "Your request was accepted. Complete payment to continue."],
  ["Payment Pending", "Payment is required or in progress."],
  ["Scheduled", "Your test has been scheduled."],
  ["Rejected", "Your request was not accepted by the institution."],
  ["Cancelled", "Your booking was cancelled."],
  ["Completed", "The booking cycle is complete."],
  ["Expired", "The request is no longer active."],
];

const faqItems = [
  {
    question: "Can I change my selected institution?",
    answer: "If the booking is still pending, the current interface allows candidates to change institution details from the booking page. If the request has moved beyond pending, contact support or follow institution instructions.",
  },
  {
    question: "Why can I not submit another booking?",
    answer: "ADLTS prevents duplicate active bookings. Finish, cancel, or close the current workflow before starting a new request.",
  },
  {
    question: "What should I do if payment fails?",
    answer: "Return to the payment page and use retry payment if it is available. If the problem continues, contact support with your booking reference.",
  },
  {
    question: "Who approves my booking?",
    answer: "The selected institute reviews and approves or rejects pending booking requests.",
  },
  {
    question: "Where can I update my profile?",
    answer: "Use the profile page inside the candidate portal after logging in.",
  },
  {
    question: "What should institutions check before approving?",
    answer: "Institutions should review candidate identity, contact details, license category, preferred date, readiness, and any required training or document records.",
  },
];

export default function GuidelinesPage() {
  return (
    <main>
      <PublicSection tone="surface" className="pt-16">
        <div className="max-w-4xl">
          <p className="text-[14px] font-medium text-[var(--text-secondary)]">Platform guidelines</p>
          <h1 className="mt-4 text-[40px] font-bold leading-tight text-[var(--text-primary)] max-md:text-[32px]">
            Know the process before you submit your request.
          </h1>
          <p className="mt-5 text-[18px] leading-8 text-[var(--text-secondary)]">
            These guidelines explain how ADLTS moves a candidate from registration to booking, institution review, payment, examination, and result tracking.
          </p>
        </div>
      </PublicSection>

      <PublicSection tone="bg">
        <PublicHeader title="Before you start registration" />
        <div className="mt-8">
          <PublicList items={beforeBegin} />
        </div>
      </PublicSection>

      <PublicSection tone="surface">
        <PublicHeader title="Candidate registration requirements" />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <PublicCard icon={FileCheck2} title="Required">
            <PublicList items={requiredFields} />
          </PublicCard>
          <PublicCard icon={ClipboardList} title="Optional or contextual">
            <PublicList items={optionalFields} />
          </PublicCard>
        </div>
        <p className="mt-6 rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] p-4 text-[14px] leading-6 text-[var(--text-primary)]">
          Enter details carefully. The same profile information may be used by institutes, exam teams, and support staff when reviewing your booking or resolving an issue.
        </p>
      </PublicSection>

      <PublicSection tone="bg">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <PublicHeader title="How booking works" />
          <PublicTimeline steps={bookingSteps} />
        </div>
      </PublicSection>

      <PublicSection tone="surface">
        <PublicHeader title="License category guide" />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {categories.map(([title, body]) => (
            <PublicCard key={title} icon={GraduationCap} title={title}>
              {body}
            </PublicCard>
          ))}
        </div>
        <p className="mt-6 text-[14px] leading-6 text-[var(--text-secondary)]">
          Use the category provided by your training institution or transport authority instructions. If unsure, contact your institution before submitting the request.
        </p>
      </PublicSection>

      <PublicSection tone="bg">
        <PublicHeader
          title="What happens during institution review"
          lead="When a booking is pending, the selected institution reviews the request. The institute may check candidate readiness, category, preferred date, contact information, and any required training or document trail."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {reviewOutcomes.map(([title, body]) => (
            <PublicCard key={title} icon={SearchCheck} title={title}>
              {body}
            </PublicCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection tone="surface">
        <PublicHeader
          title="Payment opens after approval"
          lead="Candidates should not attempt payment before approval. The payment page shows the selected booking, reference ID, exam date, session, amount due, and available payment action."
        />
        <div className="mt-10 overflow-hidden rounded-[8px] border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[var(--surface-2)] text-[12px] font-medium text-[var(--text-secondary)]">
              <tr>
                <th className="px-4 py-3 font-medium">Payment state</th>
                <th className="px-4 py-3 font-medium">Meaning</th>
              </tr>
            </thead>
            <tbody>
              {paymentStates.map(([state, meaning]) => (
                <tr key={state} className="border-t border-[var(--border)]">
                  <td className="px-4 py-4 text-[14px] font-semibold text-[var(--text-primary)]">{state}</td>
                  <td className="px-4 py-4 text-[14px] leading-6 text-[var(--text-secondary)]">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PublicSection>

      <PublicSection tone="bg">
        <PublicHeader title="Preparing for the practical exam" />
        <div className="mt-8">
          <PublicList items={examReminders} />
        </div>
      </PublicSection>

      <PublicSection tone="surface">
        <PublicHeader title="Viewing results" />
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <PublicCard icon={FileCheck2} title="Results and review">
            After completion, candidates can check exam history from the candidate portal. A result detail page may show date, score, result, center, and performance breakdown. If a result is under review, the page should explain that publication is pending.
          </PublicCard>
          <PublicCard icon={CreditCard} title="Result visibility">
            Some results require review before they are shown. If your result is not visible, wait for the official update or contact support with your booking reference.
          </PublicCard>
        </div>
      </PublicSection>

      <PublicSection tone="bg">
        <PublicHeader title="Booking status reference" />
        <dl className="mt-10 grid gap-4 md:grid-cols-2">
          {statusReference.map(([status, meaning]) => (
            <div key={status} className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-5">
              <dt><StatusBadge status={status} /></dt>
              <dd className="mt-3 text-[14px] leading-6 text-[var(--text-secondary)]">{meaning}</dd>
            </div>
          ))}
        </dl>
      </PublicSection>

      <PublicSection tone="surface">
        <PublicHeader title="Guidelines FAQ" align="center" />
        <div className="mx-auto mt-10 max-w-3xl">
          <PublicFAQ items={faqItems} />
        </div>
      </PublicSection>

      <PublicSection tone="accent">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[32px] font-bold text-[var(--surface)]">Ready to continue?</h2>
            <p className="mt-4 text-[16px] leading-7 text-[var(--accent-subtle)]">
              Create your account or sign in to manage your booking.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <PublicButtonLink href="/candidate/register" variant="inverse">Start registration</PublicButtonLink>
            <PublicButtonLink href="/login" variant="inverse-outline">Login</PublicButtonLink>
          </div>
        </div>
      </PublicSection>
    </main>
  );
}
