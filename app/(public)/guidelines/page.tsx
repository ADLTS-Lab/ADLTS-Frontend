"use client";

import { ClipboardList, CreditCard, FileCheck2, GraduationCap, SearchCheck } from "lucide-react";

import {
  PublicButtonLink,
  PublicCard,
  PublicFAQ,
  PublicHeader,
  PublicList,
  PublicWideSection as PublicSection,
  PublicTimeline,
  StatusBadge,
} from "@/app/components/ui";
import { useI18n } from "@/i18n/useI18n";

const beforeBegin = [
  "guidelines_before_1",
  "guidelines_before_2",
  "guidelines_before_3",
  "guidelines_before_4",
  "guidelines_before_5",
  "guidelines_before_6",
];

const requiredFields = [
  "guidelines_required_first",
  "guidelines_required_last",
  "guidelines_required_email",
  "guidelines_required_phone",
  "guidelines_required_password",
  "guidelines_required_confirm",
];

const optionalFields = [
  "guidelines_optional_fayda",
  "guidelines_optional_birth",
  "guidelines_optional_gender",
  "guidelines_optional_docs",
];

const bookingSteps = [
  "guidelines_booking_1",
  "guidelines_booking_2",
  "guidelines_booking_3",
  "guidelines_booking_4",
  "guidelines_booking_5",
  "guidelines_booking_6",
  "guidelines_booking_7",
  "guidelines_booking_8",
  "guidelines_booking_9",
  "guidelines_booking_10",
];

const categories = [
  ["guidelines_category_a_title", "guidelines_category_a_body"],
  ["guidelines_category_b_title", "guidelines_category_b_body"],
  ["guidelines_category_c_title", "guidelines_category_c_body"],
  ["guidelines_category_d_title", "guidelines_category_d_body"],
];

const reviewOutcomes = [
  ["guidelines_review_approved_title", "guidelines_review_approved_body"],
  ["guidelines_review_rejected_title", "guidelines_review_rejected_body"],
  ["guidelines_review_pending_title", "guidelines_review_pending_body"],
];

const paymentStates = [
  ["guidelines_payment_pending_title", "guidelines_payment_pending_body"],
  ["guidelines_payment_success_title", "guidelines_payment_success_body"],
  ["guidelines_payment_failed_title", "guidelines_payment_failed_body"],
  ["guidelines_payment_unavailable_title", "guidelines_payment_unavailable_body"],
];

const examReminders = [
  "guidelines_exam_1",
  "guidelines_exam_2",
  "guidelines_exam_3",
  "guidelines_exam_4",
  "guidelines_exam_5",
];

const statusReference = [
  ["Pending", "guidelines_status_label_pending", "guidelines_status_pending"],
  ["Approved", "guidelines_status_label_approved", "guidelines_status_approved"],
  ["Payment Pending", "guidelines_status_label_payment_pending", "guidelines_status_payment_pending"],
  ["Scheduled", "guidelines_status_label_scheduled", "guidelines_status_scheduled"],
  ["Rejected", "guidelines_status_label_rejected", "guidelines_status_rejected"],
  ["Cancelled", "guidelines_status_label_cancelled", "guidelines_status_cancelled"],
  ["Completed", "guidelines_status_label_completed", "guidelines_status_completed"],
  ["Expired", "guidelines_status_label_expired", "guidelines_status_expired"],
];

const faqItems = [
  {
    questionKey: "guidelines_faq_change_question",
    answerKey: "guidelines_faq_change_answer",
  },
  {
    questionKey: "guidelines_faq_duplicate_question",
    answerKey: "guidelines_faq_duplicate_answer",
  },
  {
    questionKey: "guidelines_faq_payment_question",
    answerKey: "guidelines_faq_payment_answer",
  },
  {
    questionKey: "guidelines_faq_approval_question",
    answerKey: "guidelines_faq_approval_answer",
  },
  {
    questionKey: "guidelines_faq_profile_question",
    answerKey: "guidelines_faq_profile_answer",
  },
  {
    questionKey: "guidelines_faq_institute_question",
    answerKey: "guidelines_faq_institute_answer",
  },
];

export default function GuidelinesPage() {
  const { t } = useI18n();

  return (
    <main className="bg-[var(--bg)]">
      <PublicSection tone="surface" className="border-b border-[var(--border)] py-16 sm:py-18">
        <div className="max-w-3xl">
          <p className="inline-flex rounded-[6px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 text-[13px] font-semibold text-[var(--accent)]">
            {t("guidelines_eyebrow")}
          </p>
          <h1 className="mt-5 text-[42px] font-bold leading-tight text-[var(--text-primary)] max-md:text-[32px]">
            {t("guidelines_title")}
          </h1>
          <p className="mt-5 text-[18px] leading-8 text-[var(--text-primary)]">
            {t("guidelines_intro")}
          </p>
        </div>
      </PublicSection>

      <PublicSection tone="bg" className="py-16">
        <PublicHeader title={t("guidelines_before_title")} />
        <div className="mt-8 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-resting)]">
          <PublicList items={beforeBegin.map(t)} />
        </div>
      </PublicSection>

      <PublicSection tone="surface" className="py-16">
        <PublicHeader title={t("guidelines_requirements_title")} />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <PublicCard icon={FileCheck2} title={t("guidelines_required_title")} className="h-full shadow-[var(--shadow-resting)]">
            <PublicList items={requiredFields.map(t)} />
          </PublicCard>
          <PublicCard icon={ClipboardList} title={t("guidelines_optional_title")} className="h-full shadow-[var(--shadow-resting)]">
            <PublicList items={optionalFields.map(t)} />
          </PublicCard>
        </div>
        <p className="mt-6 rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] p-4 text-[14px] leading-6 text-[var(--text-primary)]">
          {t("guidelines_profile_note")}
        </p>
      </PublicSection>

      <PublicSection tone="bg" className="py-16">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <PublicHeader title={t("guidelines_booking_title")} />
          <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-resting)]">
            <PublicTimeline steps={bookingSteps.map((key) => ({ title: t(key) }))} />
          </div>
        </div>
      </PublicSection>

      <PublicSection tone="surface" className="py-16">
        <PublicHeader title={t("guidelines_category_title")} />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {categories.map(([titleKey, bodyKey]) => (
            <PublicCard key={titleKey} icon={GraduationCap} title={t(titleKey)} className="h-full shadow-[var(--shadow-resting)]">
              {t(bodyKey)}
            </PublicCard>
          ))}
        </div>
        <p className="mt-6 text-[14px] leading-6 text-[var(--text-secondary)]">
          {t("guidelines_category_note")}
        </p>
      </PublicSection>

      <PublicSection tone="bg" className="py-16">
        <PublicHeader
          title={t("guidelines_review_title")}
          lead={t("guidelines_review_lead")}
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {reviewOutcomes.map(([titleKey, bodyKey]) => (
            <PublicCard key={titleKey} icon={SearchCheck} title={t(titleKey)} className="h-full shadow-[var(--shadow-resting)]">
              {t(bodyKey)}
            </PublicCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection tone="surface" className="py-16">
        <PublicHeader
          title={t("guidelines_payment_title")}
          lead={t("guidelines_payment_lead")}
        />
        <div className="mt-8 overflow-x-auto rounded-[8px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-resting)]">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead className="bg-[var(--surface-2)] text-[12px] font-medium text-[var(--text-secondary)]">
              <tr>
                <th className="px-4 py-3 font-medium">{t("guidelines_payment_state")}</th>
                <th className="px-4 py-3 font-medium">{t("guidelines_payment_meaning")}</th>
              </tr>
            </thead>
            <tbody>
              {paymentStates.map(([stateKey, meaningKey]) => (
                <tr key={stateKey} className="border-t border-[var(--border)]">
                  <td className="px-4 py-4 text-[14px] font-semibold text-[var(--text-primary)]">{t(stateKey)}</td>
                  <td className="px-4 py-4 text-[14px] leading-6 text-[var(--text-secondary)]">{t(meaningKey)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PublicSection>

      <PublicSection tone="bg" className="py-16">
        <PublicHeader title={t("guidelines_exam_title")} />
        <div className="mt-8 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-resting)]">
          <PublicList items={examReminders.map(t)} />
        </div>
      </PublicSection>

      <PublicSection tone="surface" className="py-16">
        <PublicHeader title={t("guidelines_results_title")} />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <PublicCard icon={FileCheck2} title={t("guidelines_results_review_title")} className="h-full shadow-[var(--shadow-resting)]">
            {t("guidelines_results_review_body")}
          </PublicCard>
          <PublicCard icon={CreditCard} title={t("guidelines_results_visibility_title")} className="h-full shadow-[var(--shadow-resting)]">
            {t("guidelines_results_visibility_body")}
          </PublicCard>
        </div>
      </PublicSection>

      <PublicSection tone="bg" className="py-16">
        <PublicHeader title={t("guidelines_status_title")} />
        <dl className="mt-8 grid gap-4 md:grid-cols-2">
          {statusReference.map(([status, labelKey, meaningKey]) => (
            <div key={status} className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-resting)]">
              <dt><StatusBadge status={status} label={t(labelKey)} /></dt>
              <dd className="mt-3 text-[14px] leading-6 text-[var(--text-secondary)]">{t(meaningKey)}</dd>
            </div>
          ))}
        </dl>
      </PublicSection>

      <PublicSection tone="surface" className="py-16">
        <PublicHeader title={t("guidelines_faq_title")} align="center" />
        <div className="mx-auto mt-8 max-w-3xl shadow-[var(--shadow-resting)]">
          <PublicFAQ items={faqItems.map((item) => ({ question: t(item.questionKey), answer: t(item.answerKey) }))} />
        </div>
      </PublicSection>

      <PublicSection tone="accent" className="py-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[32px] font-bold text-[var(--surface)]">{t("guidelines_cta_title")}</h2>
            <p className="mt-4 text-[16px] leading-7 text-[var(--accent-subtle)]">
              {t("guidelines_cta_body")}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <PublicButtonLink href="/candidate/register" variant="inverse">{t("guidelines_cta_register")}</PublicButtonLink>
            <PublicButtonLink href="/login" variant="inverse-outline">{t("login")}</PublicButtonLink>
          </div>
        </div>
      </PublicSection>
    </main>
  );
}
