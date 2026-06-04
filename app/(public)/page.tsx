"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Bot,
  CalendarCheck,
  CarFront,
  ClipboardCheck,
  Database,
  FileCheck2,
  FileText,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";

import { ButtonLink, Card, PageContainer, PageHeader } from "@/app/components/ui";
import { getHomeRouteForRole } from "@/config/routes";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useI18n } from "@/i18n/useI18n";
import { BrandMark } from "@/components/BrandMark";

import manualEvaluationImage from "./images/manual eval image.jpg";
import paperScoreSheetImage from "./images/paper eval.jpg";
import drivingVehicleImage from "./images/solo driving image.jpg";

const problemCards = [
  {
    titleKey: "landing_problem_manual_title",
    bodyKey: "landing_problem_manual_body",
    icon: FileText,
  },
  {
    titleKey: "landing_problem_subjective_title",
    bodyKey: "landing_problem_subjective_body",
    icon: ClipboardCheck,
  },
  {
    titleKey: "landing_problem_transparency_title",
    bodyKey: "landing_problem_transparency_body",
    icon: SearchCheck,
  },
  {
    titleKey: "landing_problem_overhead_title",
    bodyKey: "landing_problem_overhead_body",
    icon: Database,
  },
];

const solutionCards = [
  {
    titleKey: "landing_solution_ai_title",
    bodyKey: "landing_solution_ai_body",
    icon: Bot,
  },
  {
    titleKey: "landing_solution_expert_title",
    bodyKey: "landing_solution_expert_body",
    icon: ShieldCheck,
  },
  {
    titleKey: "landing_solution_records_title",
    bodyKey: "landing_solution_records_body",
    icon: Database,
  },
  {
    titleKey: "landing_solution_reporting_title",
    bodyKey: "landing_solution_reporting_body",
    icon: BarChart3,
  },
];

const processSteps = [
  {
    titleKey: "landing_process_book_title",
    bodyKey: "landing_process_book_body",
    icon: CalendarCheck,
  },
  {
    titleKey: "landing_process_exam_title",
    bodyKey: "landing_process_exam_body",
    icon: CarFront,
  },
  {
    titleKey: "landing_process_ai_title",
    bodyKey: "landing_process_ai_body",
    icon: Bot,
  },
  {
    titleKey: "landing_process_review_title",
    bodyKey: "landing_process_review_body",
    icon: ShieldCheck,
  },
  {
    titleKey: "landing_process_results_title",
    bodyKey: "landing_process_results_body",
    icon: FileCheck2,
  },
];

const impactStats = [
  {
    value: "70%",
    labelKey: "landing_impact_faster_label",
    detailKey: "landing_impact_faster_detail",
  },
  {
    value: "90%",
    labelKey: "landing_impact_paperwork_label",
    detailKey: "landing_impact_paperwork_detail",
  },
  {
    value: "100%",
    labelKey: "landing_impact_records_label",
    detailKey: "landing_impact_records_detail",
  },
  {
    value: "24/7",
    labelKey: "landing_impact_access_label",
    detailKey: "landing_impact_access_detail",
  },
];

function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`px-4 py-20 sm:px-6 lg:px-8 ${className}`}>
      <PageContainer width="wide" className="mx-auto">
        {children}
      </PageContainer>
    </section>
  );
}

function FeatureCard({
  title,
  body,
  icon: Icon,
}: {
  title: string;
  body: string;
  icon: React.ElementType;
}) {
  return (
    <Card padding="md" className="h-full">
      <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-[var(--border)] bg-[var(--accent-subtle)] text-[var(--accent)]">
        <Icon size={18} aria-hidden="true" />
      </div>
      <h3 className="text-[15px] font-semibold leading-6 text-[var(--text-primary)]">{title}</h3>
      <p className="mt-2 text-[14px] leading-6 text-[var(--text-secondary)]">{body}</p>
    </Card>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useAuthSession();
  const { t } = useI18n();

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || !user) return;
    const nextRoute = getHomeRouteForRole(user.role);
    if (nextRoute !== "/login") {
      router.replace(nextRoute);
    }
  }, [hasHydrated, isAuthenticated, router, user]);

  return (
    <main className="bg-[var(--bg)]">
      <Section className="bg-[var(--surface)]">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.92fr] lg:items-center">
          <div className="max-w-3xl">
            <h1 className="text-[48px] font-bold leading-[1.08] tracking-normal text-[var(--text-primary)] max-md:text-[36px]">
              {t("landing_hero_title")}
            </h1>
            <p className="mt-5 max-w-2xl text-[19px] leading-8 text-[var(--text-primary)]">
              {t("landing_hero_lead")}
            </p>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[var(--text-secondary)]">
              {t("landing_hero_body")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/candidate/register" size="lg">
                {t("landing_cta_candidateRegister")}
              </ButtonLink>
              <ButtonLink href="/login" variant="outline" size="lg">
                {t("landing_cta_login")}
              </ButtonLink>
            </div>
            <p className="mt-3 text-[13px] leading-5 text-[var(--text-secondary)]">
              {t("landing_staff_note")}
            </p>
          </div>

          <Card padding="sm" className="shadow-[var(--shadow-resting)]">
            <div className="overflow-hidden rounded-[6px] border border-[var(--border)] bg-[var(--surface-2)]">
              <Image
                src={paperScoreSheetImage}
                alt={t("landing_image_paper_alt")}
                priority
                unoptimized
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="flex items-center justify-between gap-4 px-2 py-3">
              <div>
                <p className="text-[13px] font-semibold text-[var(--text-primary)]">{t("landing_score_title")}</p>
                <p className="mt-1 text-[12px] leading-5 text-[var(--text-secondary)]">{t("landing_score_body")}</p>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      <Section id="problem" className="bg-[var(--surface-2)]">
        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <Card padding="sm" className="overflow-hidden">
            <Image
              src={manualEvaluationImage}
              alt={t("landing_image_manual_alt")}
              unoptimized
              className="aspect-[4/3] w-full rounded-[6px] object-cover"
            />
          </Card>

          <div>
            <PageHeader
              title={t("landing_problem_title")}
              description={t("landing_problem_body")}
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {problemCards.map((card) => (
                <FeatureCard key={card.titleKey} title={t(card.titleKey)} body={t(card.bodyKey)} icon={card.icon} />
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section className="bg-[var(--surface)]">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <PageHeader
              title={t("landing_solution_title")}
              description={t("landing_solution_body")}
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {solutionCards.map((card) => (
                <FeatureCard key={card.titleKey} title={t(card.titleKey)} body={t(card.bodyKey)} icon={card.icon} />
              ))}
            </div>
          </div>

          <Card padding="sm" className="overflow-hidden">
            <Image
              src={drivingVehicleImage}
              alt={t("landing_image_vehicle_alt")}
              unoptimized
              className="aspect-[16/10] w-full rounded-[6px] object-cover"
            />
          </Card>
        </div>
      </Section>

      <Section className="bg-[var(--bg)]">
        <PageHeader title={t("landing_process_title")} />
        <div className="mt-8 grid gap-4 md:grid-cols-5">
          {processSteps.map((step, index) => (
            <Card key={step.titleKey} padding="md" className="relative text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[6px] border border-[var(--border)] bg-[var(--accent-subtle)] text-[var(--accent)]">
                <step.icon size={20} aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-[14px] font-semibold text-[var(--text-primary)]">{t(step.titleKey)}</h3>
              <p className="mt-2 text-[12px] leading-5 text-[var(--text-secondary)]">{t(step.bodyKey)}</p>
              {index < processSteps.length - 1 ? (
                <span className="pointer-events-none absolute right-[-14px] top-10 hidden h-px w-7 bg-[var(--border-strong)] md:block" />
              ) : null}
            </Card>
          ))}
        </div>
      </Section>

      <Section className="bg-[var(--surface-2)]">
        <PageHeader
          title={t("landing_impact_title")}
          description={t("landing_impact_body")}
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {impactStats.map((stat) => (
            <Card key={stat.labelKey} padding="md" variant="metric">
              <p className="text-[13px] font-medium text-[var(--text-secondary)]">{t(stat.labelKey)}</p>
              <p className="mt-3 text-[36px] font-bold leading-none text-[var(--accent)]">{stat.value}</p>
              <p className="mt-4 text-[12px] leading-5 text-[var(--text-secondary)]">{t(stat.detailKey)}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="bg-[var(--accent-hover)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-[32px] font-bold leading-tight" style={{ color: "var(--surface)" }}>
              {t("landing_final_title")}
            </h2>
            <p className="mt-4 text-[16px] leading-7 text-[var(--accent-subtle)]">
              {t("landing_final_body")}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/candidate/register" size="lg" className="!border-blue-600 !bg-blue-600 !text-white hover:!border-blue-700 hover:!bg-blue-700">
              {t("landing_cta_candidateRegister")}
            </ButtonLink>
            <ButtonLink href="/login" variant="secondary" size="lg">
              {t("landing_cta_login")}
            </ButtonLink>
          </div>
        </div>
      </Section>

      <footer className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-10 sm:px-6 lg:px-8">
        <PageContainer width="wide" className="mx-auto">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <BrandMark variant="wordmark" showSubtitle />
              <p className="sr-only">{t("landing_footer_system")}</p>
            </div>
            <nav className="flex flex-wrap gap-4 text-[13px] font-medium text-[var(--text-secondary)]" aria-label="Landing footer">
              <Link href="/about" className="hover:text-[var(--accent)]">{t("landing_footer_about")}</Link>
              <Link href="/guidelines" className="hover:text-[var(--accent)]">{t("landing_footer_documentation")}</Link>
              <Link href="/contact" className="hover:text-[var(--accent)]">{t("landing_footer_support")}</Link>
              <Link href="/contact" className="hover:text-[var(--accent)]">{t("landing_footer_contact")}</Link>
            </nav>
          </div>
        </PageContainer>
      </footer>
    </main>
  );
}
