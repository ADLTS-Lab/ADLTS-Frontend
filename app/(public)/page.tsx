"use client";

import Link from "next/link";
import { ArrowRight, Brain, CheckCircle2, ShieldCheck, Users } from "lucide-react";
import { useI18n } from "@/i18n/useI18n";

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <main className="space-y-16 pb-6">
      <section className="relative overflow-hidden rounded-3xl border border-[var(--adlts-border)] bg-gradient-to-br from-[var(--adlts-surface)] to-[var(--adlts-page-soft)] px-6 py-10 md:px-8 md:py-14">
        <div className="absolute -left-24 top-12 hidden h-48 w-48 rounded-full bg-[var(--adlts-blue-200)]/35 blur-2xl lg:block" />
        <div className="absolute -right-20 bottom-8 hidden h-48 w-48 rounded-full bg-[var(--adlts-civic-green)]/20 blur-2xl lg:block" />
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-[var(--adlts-border)] bg-[var(--adlts-surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--adlts-ink-500)]">
              {t("landing_hero_badge")}
            </p>
            <div className="space-y-4">
              <h1 className="text-[clamp(2.1rem,5vw,3.35rem)] font-semibold leading-[1.08] tracking-tight text-[var(--adlts-ink-950)]">
                {t("landing_hero_title_prefix")} <span className="text-[var(--adlts-blue-700)]">{t("landing_hero_title_accent")}</span>
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-[var(--adlts-ink-600)] md:text-lg">
                {t("landing_hero_subtitle")}
              </p>
            </div>
            <p className="inline-flex items-center gap-2 rounded-md border border-[var(--adlts-blue-200)] bg-[var(--adlts-blue-50)] px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--adlts-blue-700)]">
              <CheckCircle2 size={14} />
              {t("landing_ai_powered")}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/candidate/register"
                className="inline-flex items-center justify-center rounded-md bg-[var(--adlts-blue-600)] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-base hover:bg-[var(--adlts-blue-700)] focus-visible:ring-2 focus-visible:ring-[var(--adlts-focus-ring)]"
              >
                {t("landing_cta_register")}
              </Link>
              <Link
                href="/guidelines"
                className="inline-flex items-center justify-center rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface)] px-5 py-2.5 text-sm font-semibold text-[var(--adlts-ink-800)] transition-all duration-base hover:border-[var(--adlts-blue-600)] hover:text-[var(--adlts-blue-700)]"
              >
                {t("landing_cta_readGuidelines")}
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface)] px-3.5 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--adlts-ink-500)]">
                  End-to-end workflow
                </p>
                <p className="mt-1 text-sm font-medium text-[var(--adlts-ink-900)]">Register → Book → Pay → Take Test → Track Results</p>
              </div>
              <div className="rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface)] px-3.5 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--adlts-ink-500)]">
                  Government aligned
                </p>
                <p className="mt-1 text-sm font-medium text-[var(--adlts-ink-900)]">Built for institution-level role workflows</p>
              </div>
            </div>
          </div>

          <div className="relative space-y-4">
            <div className="overflow-hidden rounded-xl border border-[var(--adlts-border)] bg-[var(--adlts-surface)] shadow-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero_driving_test.png"
                alt="Automated driving test workflow dashboard preview"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <a
              href="/guidelines"
              className="group flex items-start gap-3 rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface)] p-4 transition-colors hover:border-[var(--adlts-blue-300)] hover:bg-[var(--adlts-blue-50)]"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--adlts-blue-100)] text-[var(--adlts-blue-700)]">
                <Brain size={20} />
              </span>
              <span>
                <p className="text-sm font-semibold text-[var(--adlts-ink-900)]">{t("landing_telemetry_title")}</p>
                <p className="mt-1 text-xs text-[var(--adlts-ink-600)]">{t("landing_telemetry_sub")}</p>
                <span className="mt-2 inline-flex items-center text-xs font-semibold text-[var(--adlts-blue-700)]">
                  Learn more <ArrowRight size={12} className="ml-1 transition-transform group-hover:translate-x-1" />
                </span>
              </span>
            </a>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--adlts-ink-500)]">{t("landing_ai_powered")}</p>
          <h2 className="text-2xl font-semibold leading-tight text-[var(--adlts-ink-950)] md:text-3xl">{t("landing_candidate_benefits_title")}</h2>
          <p className="text-sm text-[var(--adlts-ink-600)]">{t("landing_candidate_benefits_title")}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FeatureCard step="01" title={t("landing_feature1_title")} desc={t("landing_feature1_desc")} />
          <FeatureCard step="02" title={t("landing_feature2_title")} desc={t("landing_feature2_desc")} />
          <FeatureCard step="03" title={t("landing_feature3_title")} desc={t("landing_feature3_desc")} />
          <FeatureCard step="04" title={t("landing_feature4_title")} desc={t("landing_feature4_desc")} />
        </div>
      </section>

      <section className="rounded-xl border border-[var(--adlts-border)] bg-[var(--adlts-surface)] p-6 md:p-8">
        <div className="mx-auto max-w-3xl space-y-8 text-center">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--adlts-ink-500)]">
              {t("landing_trust_badge")}
            </p>
            <h3 className="text-xl font-semibold tracking-tight text-[var(--adlts-ink-950)] md:text-2xl">
              {t("landing_trust_title")}
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:items-center lg:gap-6">
            <div className="flex items-center gap-3 rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-page-soft)] p-4">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-base"><ShieldCheck size={18} className="text-[var(--adlts-blue-700)]" /></span>
              <span className="text-left text-sm font-semibold text-[var(--adlts-ink-700)]">
                Ethiopian Transport Authority
              </span>
            </div>
            <p className="flex items-center justify-center gap-2 rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-page-soft)] px-4 py-3 text-sm font-medium text-[var(--adlts-ink-700)]">
              <Users size={16} />
              {t("landing_trust_certified")}
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-[var(--adlts-ink-600)]">
            <Link href="/about" className="transition-colors hover:text-[var(--adlts-blue-700)]">
              {t("about")}
            </Link>
            <Link href="/contact" className="transition-colors hover:text-[var(--adlts-blue-700)]">
              {t("contact")}
            </Link>
            <Link href="/privacy-policy" className="transition-colors hover:text-[var(--adlts-blue-700)]">
              {t("privacy")}
            </Link>
          </nav>
        </div>
      </section>
    </main>
  );
}

type FeatureCardProps = {
  step: string;
  title: string;
  desc: string;
};

function FeatureCard({ step, title, desc }: FeatureCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-lg border border-[var(--adlts-border)] bg-[var(--adlts-surface)] p-5 transition duration-base hover:border-[var(--adlts-blue-300)] hover:bg-[var(--adlts-page-soft)]">
      <span className="mb-4 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--adlts-blue-50)] text-xs font-semibold text-[var(--adlts-blue-700)]">
        {step}
      </span>
      <h3 className="mb-2 text-base font-semibold leading-snug text-[var(--adlts-ink-950)]">{title}</h3>
      <p className="mt-auto text-sm leading-relaxed text-[var(--adlts-ink-600)]">{desc}</p>
    </article>
  );
}
