"use client";

import Link from "next/link";
import { Brain } from "lucide-react";
import { useI18n } from "@/i18n/useI18n";

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <>
      {/* Hero */}
      <section className="pb-16 md:pb-24 lg:grid lg:grid-cols-2 lg:gap-x-16 lg:gap-y-10 lg:items-center">
        <div className="space-y-6 md:space-y-8">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
            {t("landing_hero_badge")}
          </p>

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-blue-950 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              {t("landing_hero_title_prefix")}{" "}
              <span className="text-blue-700">{t("landing_hero_title_accent")}</span>
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-slate-600 md:text-lg">
              {t("landing_hero_subtitle")}
            </p>
          </div>

          <p className="text-sm font-medium text-blue-800">{t("landing_ai_powered")}</p>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
            <Link
              href="/candidate/register"
              className="inline-flex items-center justify-center rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-800"
            >
              {t("landing_cta_register")}
            </Link>
            <Link
              href="/guidelines"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-blue-900 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              {t("landing_cta_readGuidelines")}
            </Link>
          </div>
        </div>

        <div className="relative mt-10 lg:mt-0">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero_driving_test.png"
              alt="Automated driving test course with holographic AI sensors"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>

          <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:left-auto sm:right-5 sm:max-w-xs">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-900 text-white">
                <Brain size={20} strokeWidth={2} />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-semibold leading-snug text-slate-900">
                  {t("landing_telemetry_title")}
                </p>
                <p className="text-xs leading-relaxed text-slate-500">{t("landing_telemetry_sub")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process steps */}
      <section className="-mx-4 border-t border-slate-200 bg-slate-50 px-4 sm:-mx-6 sm:px-6">
        <div className="py-16 md:py-20">
          <div className="mx-auto mb-12 max-w-2xl space-y-3 text-center md:mb-14">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              {t("landing_ai_powered")}
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-blue-950 md:text-3xl">
              {t("landing_candidate_benefits_title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            <FeatureCard step="01" title={t("landing_feature1_title")} desc={t("landing_feature1_desc")} />
            <FeatureCard step="02" title={t("landing_feature2_title")} desc={t("landing_feature2_desc")} />
            <FeatureCard step="03" title={t("landing_feature3_title")} desc={t("landing_feature3_desc")} />
            <FeatureCard step="04" title={t("landing_feature4_title")} desc={t("landing_feature4_desc")} />
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-t border-slate-200 py-14 md:py-16">
        <div className="mx-auto max-w-3xl space-y-8 text-center">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              {t("landing_trust_badge")}
            </p>
            <h3 className="text-xl font-semibold tracking-tight text-blue-950 md:text-2xl">
              {t("landing_trust_title")}
            </h3>
          </div>

          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-10">
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
              <span className="flex h-8 w-10 items-center justify-center rounded bg-slate-50 text-base">
                🇪🇹
              </span>
              <span className="text-left text-sm font-medium text-slate-700">
                Ethiopian Transport Authority
              </span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
              {t("landing_trust_certified")}
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-600">
            <Link href="/about" className="transition-colors hover:text-blue-800">
              {t("about")}
            </Link>
            <Link href="/contact" className="transition-colors hover:text-blue-800">
              {t("contact")}
            </Link>
            <Link href="/privacy-policy" className="transition-colors hover:text-blue-800">
              {t("privacy")}
            </Link>
          </nav>
        </div>
      </section>
    </>
  );
}

type FeatureCardProps = {
  step: string;
  title: string;
  desc: string;
};

function FeatureCard({ step, title, desc }: FeatureCardProps) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:border-slate-300">
      <span className="mb-4 text-xs font-medium tabular-nums tracking-wide text-slate-400">{step}</span>
      <h3 className="mb-2 text-base font-semibold leading-snug text-blue-950">{title}</h3>
      <p className="mt-auto text-sm leading-relaxed text-slate-600">{desc}</p>
    </article>
  );
}
