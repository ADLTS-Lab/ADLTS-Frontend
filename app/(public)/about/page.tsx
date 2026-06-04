"use client";

import { Building2, ClipboardCheck, CreditCard, FileText, LockKeyhole, Scale, UserCheck } from "lucide-react";

import {
  PublicButtonLink,
  PublicCard,
  PublicHeader,
  PublicList,
  PublicWideSection as PublicSection,
  PublicTimeline,
} from "@/app/components/ui";
import { useI18n } from "@/i18n/useI18n";

const missionBullets = [
  "about_mission_1",
  "about_mission_2",
  "about_mission_3",
  "about_mission_4",
  "about_mission_5",
];

const coordinationCards = [
  {
    icon: UserCheck,
    titleKey: "about_coord_identity_title",
    bodyKey: "about_coord_identity_body",
  },
  {
    icon: ClipboardCheck,
    titleKey: "about_coord_booking_title",
    bodyKey: "about_coord_booking_body",
  },
  {
    icon: Building2,
    titleKey: "about_coord_review_title",
    bodyKey: "about_coord_review_body",
  },
  {
    icon: CreditCard,
    titleKey: "about_coord_payments_title",
    bodyKey: "about_coord_payments_body",
  },
  {
    icon: FileText,
    titleKey: "about_coord_testing_title",
    bodyKey: "about_coord_testing_body",
  },
  {
    icon: Scale,
    titleKey: "about_coord_governance_title",
    bodyKey: "about_coord_governance_body",
  },
];

const stakeholders = [
  ["about_role_candidate", "about_role_candidate_body"],
  ["about_role_institute", "about_role_institute_body"],
  ["about_role_admin", "about_role_admin_body"],
  ["about_role_expert", "about_role_expert_body"],
  ["about_role_super_admin", "about_role_super_admin_body"],
  ["about_role_authority", "about_role_authority_body"],
];

const principles = [
  ["about_principle_transparency_title", "about_principle_transparency_body"],
  ["about_principle_accountability_title", "about_principle_accountability_body"],
  ["about_principle_role_title", "about_principle_role_body"],
  ["about_principle_reliability_title", "about_principle_reliability_body"],
  ["about_principle_accessibility_title", "about_principle_accessibility_body"],
  ["about_principle_data_title", "about_principle_data_body"],
];

const lifecycleSteps = [
  "about_lifecycle_1",
  "about_lifecycle_2",
  "about_lifecycle_3",
  "about_lifecycle_4",
  "about_lifecycle_5",
  "about_lifecycle_6",
  "about_lifecycle_7",
];

const outcomes = [
  "about_outcome_1",
  "about_outcome_2",
  "about_outcome_3",
  "about_outcome_4",
  "about_outcome_5",
  "about_outcome_6",
];

export default function AboutPage() {
  const { t } = useI18n();

  return (
    <main className="bg-[var(--bg)]">
      <PublicSection tone="surface" className="border-b border-[var(--border)] py-16 sm:py-18">
        <div className="max-w-3xl">
          <p className="inline-flex rounded-[6px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 text-[13px] font-semibold text-[var(--accent)]">
            {t("about_eyebrow")}
          </p>
          <h1 className="mt-5 text-[42px] font-bold leading-tight text-[var(--text-primary)] max-md:text-[32px]">
            {t("about_title")}
          </h1>
          <p className="mt-5 text-[18px] leading-8 text-[var(--text-primary)]">
            {t("about_intro")}
          </p>
          <p className="mt-5 text-[15px] leading-7 text-[var(--text-secondary)]">
            {t("about_body")}
          </p>
        </div>
      </PublicSection>

      <PublicSection tone="bg" className="py-16">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <PublicHeader title={t("about_mission_title")} />
          <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-resting)]">
            <p className="text-[16px] leading-7 text-[var(--text-secondary)]">
              {t("about_mission_body")}
            </p>
            <div className="mt-6">
              <PublicList items={missionBullets.map(t)} />
            </div>
          </div>
        </div>
      </PublicSection>

      <PublicSection tone="surface" className="py-16">
        <PublicHeader title={t("about_coordinates_title")} />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {coordinationCards.map((card) => (
            <PublicCard key={card.titleKey} icon={card.icon} title={t(card.titleKey)} className="h-full shadow-[var(--shadow-resting)]">
              {t(card.bodyKey)}
            </PublicCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection tone="bg" className="py-16">
        <PublicHeader
          title={t("about_roles_title")}
          lead={t("about_roles_lead")}
        />
        <div className="mt-8 overflow-x-auto rounded-[8px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-resting)]">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead className="bg-[var(--surface-2)] text-[12px] font-medium text-[var(--text-secondary)]">
              <tr>
                <th className="px-4 py-3 font-medium">{t("about_table_role")}</th>
                <th className="px-4 py-3 font-medium">{t("about_table_responsibility")}</th>
              </tr>
            </thead>
            <tbody>
              {stakeholders.map(([roleKey, responsibilityKey]) => (
                <tr key={roleKey} className="border-t border-[var(--border)]">
                  <td className="px-4 py-4 text-[14px] font-semibold text-[var(--text-primary)]">{t(roleKey)}</td>
                  <td className="px-4 py-4 text-[14px] leading-6 text-[var(--text-secondary)]">{t(responsibilityKey)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PublicSection>

      <PublicSection tone="surface" className="py-16">
        <PublicHeader title={t("about_principles_title")} />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {principles.map(([titleKey, bodyKey]) => (
            <PublicCard key={titleKey} icon={LockKeyhole} title={t(titleKey)} className="h-full shadow-[var(--shadow-resting)]">
              {t(bodyKey)}
            </PublicCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection tone="bg" className="py-16">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <PublicHeader title={t("about_lifecycle_title")} />
          <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-resting)]">
            <PublicTimeline steps={lifecycleSteps.map((key) => ({ title: t(key) }))} />
          </div>
        </div>
      </PublicSection>

      <PublicSection tone="surface" className="py-16">
        <PublicHeader title={t("about_outcomes_title")} />
        <div className="mt-8 rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] p-6">
          <PublicList items={outcomes.map(t)} />
        </div>
      </PublicSection>

      <PublicSection tone="accent" className="py-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-[32px] font-bold leading-tight text-[var(--surface)]">
              {t("about_cta_title")}
            </h2>
            <p className="mt-4 text-[16px] leading-7 text-[var(--accent-subtle)]">
              {t("about_cta_body")}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <PublicButtonLink href="/candidate/register" variant="inverse">{t("about_cta_register")}</PublicButtonLink>
            <PublicButtonLink href="/guidelines" variant="inverse-outline">{t("about_cta_guidelines")}</PublicButtonLink>
            <PublicButtonLink href="/contact" variant="inverse-outline">{t("about_cta_contact")}</PublicButtonLink>
          </div>
        </div>
      </PublicSection>
    </main>
  );
}
