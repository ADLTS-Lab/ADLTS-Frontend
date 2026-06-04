"use client";

import { useState } from "react";
import { AlertTriangle, Building2, CreditCard, FileQuestion, Mail, MapPin, MonitorCog, Phone, UserRound } from "lucide-react";

import {
  FormField,
  PublicButtonLink,
  PublicCard,
  PublicHeader,
  PublicList,
  PublicWideSection as PublicSection,
  formControlClassName,
  formTextareaClassName,
} from "@/app/components/ui";
import { useI18n } from "@/i18n/useI18n";

const channels = [
  {
    icon: Mail,
    titleKey: "contact_email_title",
    valueKey: "contact_email_value",
    bodyKey: "contact_email_body",
  },
  {
    icon: Phone,
    titleKey: "contact_phone_title",
    valueKey: "contact_phone_value",
    bodyKey: "contact_phone_body",
  },
  {
    icon: MapPin,
    titleKey: "contact_office_title",
    valueKey: "contact_office_value",
    bodyKey: "contact_office_body",
  },
];

const issueTypes = [
  {
    icon: UserRound,
    key: "account",
    titleKey: "contact_issue_account_title",
    bodyKey: "contact_issue_account_body",
  },
  {
    icon: FileQuestion,
    key: "booking",
    titleKey: "contact_issue_booking_title",
    bodyKey: "contact_issue_booking_body",
  },
  {
    icon: CreditCard,
    key: "payment",
    titleKey: "contact_issue_payment_title",
    bodyKey: "contact_issue_payment_body",
  },
  {
    icon: FileQuestion,
    key: "exam",
    titleKey: "contact_issue_exam_title",
    bodyKey: "contact_issue_exam_body",
  },
  {
    icon: Building2,
    key: "institution",
    titleKey: "contact_issue_institution_title",
    bodyKey: "contact_issue_institution_body",
  },
  {
    icon: MonitorCog,
    key: "operations",
    titleKey: "contact_issue_operations_title",
    bodyKey: "contact_issue_operations_body",
  },
];

const messageChecklist = [
  "contact_checklist_name",
  "contact_checklist_email",
  "contact_checklist_role",
  "contact_checklist_reference",
  "contact_checklist_page",
  "contact_checklist_error",
  "contact_checklist_expected",
];

const urgentExamples = [
  "contact_urgent_1",
  "contact_urgent_2",
  "contact_urgent_3",
  "contact_urgent_4",
  "contact_urgent_5",
  "contact_urgent_6",
];

export default function ContactPage() {
  const { t } = useI18n();
  const [selectedIssue, setSelectedIssue] = useState(issueTypes[0].key);
  const selectedIssueTitle = t(issueTypes.find((issue) => issue.key === selectedIssue)?.titleKey ?? issueTypes[0].titleKey);
  const formLabels = [
    "contact_form_full_name",
    "contact_form_email",
    "contact_form_role",
    "contact_form_issue",
    "contact_form_reference",
  ];

  return (
    <main className="bg-[var(--bg)]">
      <PublicSection tone="surface" className="border-b border-[var(--border)] py-16 sm:py-18">
        <div className="max-w-3xl">
          <p className="inline-flex rounded-[6px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 text-[13px] font-semibold text-[var(--accent)]">
            {t("contact_eyebrow")}
          </p>
          <h1 className="mt-5 text-[42px] font-bold leading-tight text-[var(--text-primary)] max-md:text-[32px]">
            {t("contact_title")}
          </h1>
          <p className="mt-5 text-[18px] leading-8 text-[var(--text-primary)]">
            {t("contact_intro")}
          </p>
        </div>
      </PublicSection>

      <PublicSection tone="bg" className="py-16">
        <PublicHeader title={t("contact_channels_title")} />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {channels.map((channel) => (
            <PublicCard key={channel.titleKey} icon={channel.icon} title={t(channel.titleKey)} className="h-full shadow-[var(--shadow-resting)]">
              <p className="font-mono text-[13px] text-[var(--text-primary)]">
                {t(channel.valueKey)}
              </p>
              <p className="mt-3">{t(channel.bodyKey)}</p>
            </PublicCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection tone="surface" className="py-16">
        <PublicHeader title={t("contact_help_title")} />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {issueTypes.map((issue) => {
            const Icon = issue.icon;
            const active = selectedIssue === issue.key;
            return (
              <button
                key={issue.key}
                type="button"
                onClick={() => setSelectedIssue(issue.key)}
                className={`rounded-[8px] border p-6 text-left shadow-[var(--shadow-resting)] transition-colors duration-150 ${
                  active
                    ? "border-[var(--accent)] bg-[var(--accent-subtle)]"
                    : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]"
                }`}
              >
                <Icon className="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />
                <span className="mt-4 block text-[15px] font-semibold text-[var(--text-primary)]">{t(issue.titleKey)}</span>
                <span className="mt-3 block text-[14px] leading-6 text-[var(--text-secondary)]">{t(issue.bodyKey)}</span>
              </button>
            );
          })}
        </div>
      </PublicSection>

      <PublicSection tone="bg" className="py-16">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <PublicHeader title={t("contact_resolve_title")} />
          <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-resting)]">
            <PublicList items={messageChecklist.map(t)} />
            <p className="mt-6 rounded-[8px] border border-[var(--danger)] bg-[var(--danger-subtle)] p-4 text-[14px] font-medium text-[var(--danger)]">
              {t("contact_password_warning")}
            </p>
          </div>
        </div>
      </PublicSection>

      <PublicSection tone="surface" className="py-16">
        <PublicHeader title={t("contact_form_title")} />
        <form className="mt-8 grid gap-4 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-resting)] md:grid-cols-2">
          {formLabels.map((labelKey) => {
            const isIssueField = labelKey === "contact_form_issue";

            return (
              <FormField key={labelKey} label={t(labelKey)}>
                {({ id }) => (
                  <input
                    id={id}
                    className={formControlClassName}
                    value={isIssueField ? selectedIssueTitle : undefined}
                    readOnly={isIssueField}
                  />
                )}
              </FormField>
            );
          })}
          <FormField label={t("contact_form_message")} className="md:col-span-2">
            {({ id }) => (
              <textarea
                id={id}
                className={formTextareaClassName}
                placeholder={t("contact_form_placeholder")}
              />
            )}
          </FormField>
          <div className="md:col-span-2">
            <button
              type="button"
              className="inline-flex h-10 items-center rounded-[6px] border border-[var(--accent)] bg-[var(--accent)] px-4 text-[14px] font-medium text-[var(--surface)] transition-colors hover:bg-[var(--accent-hover)]"
            >
              {t("contact_form_send")}
            </button>
          </div>
        </form>
      </PublicSection>

      <PublicSection tone="bg" className="py-16">
        <div className="rounded-[8px] border border-[var(--danger)] bg-[var(--danger-subtle)] p-6 shadow-[var(--shadow-resting)]">
          <div className="flex gap-3">
            <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-[var(--danger)]" />
            <div>
              <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">{t("contact_urgent_title")}</h2>
              <p className="mt-3 text-[14px] leading-6 text-[var(--text-secondary)]">
                {t("contact_urgent_body")}
              </p>
              <div className="mt-5">
                <PublicList items={urgentExamples.map(t)} />
              </div>
            </div>
          </div>
        </div>
      </PublicSection>

      <PublicSection tone="accent" className="py-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[32px] font-bold text-[var(--surface)]">{t("contact_cta_title")}</h2>
            <p className="mt-4 text-[16px] leading-7 text-[var(--accent-subtle)]">
              {t("contact_cta_body")}
            </p>
          </div>
          <PublicButtonLink href="/guidelines" variant="inverse">{t("about_cta_guidelines")}</PublicButtonLink>
        </div>
      </PublicSection>
    </main>
  );
}
