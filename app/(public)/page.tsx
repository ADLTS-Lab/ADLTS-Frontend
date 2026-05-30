"use client";

import Link from "next/link";
import { Brain } from "lucide-react";
import React from "react";
import { useI18n } from '@/i18n/useI18n';

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <>
      {/* Hero Section */}
      <section className="pt-10 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <h1 className="text-5xl lg:text-6xl font-black text-blue-950 leading-tight">
            {t('landing_hero_title_prefix')} <br />
            <span className="text-blue-700">{t('landing_hero_title_accent')}</span>
          </h1>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-blue-600">{t('landing_ai_powered')}</h2>
            <p className="text-slate-500 max-w-md leading-relaxed">{t('landing_hero_subtitle')}</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/candidate/register"
              className="bg-blue-900 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:-translate-y-1 transition-all inline-flex items-center"
            >
              {t('landing_cta_register')}
            </Link>
            <Link
              href="/guidelines"
              className="border-2 border-blue-100 text-blue-900 px-8 py-4 rounded-xl font-bold inline-flex items-center gap-2 hover:bg-blue-50 transition-all"
            >
              {t('landing_cta_readGuidelines')}
            </Link>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative group">
          <div className="rounded-[40px] overflow-hidden shadow-2xl bg-slate-100 h-112.5 relative flex items-center justify-center border border-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero_driving_test.png"
              alt="Automated driving test course with holographic AI sensors"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
            />
          </div>
          <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-xl border border-white/70 p-5 rounded-3xl flex items-center gap-4 shadow-xl">
            <div className="w-12 h-12 bg-blue-900 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md">
              <Brain size={24} className="animate-pulse" />
            </div>
            <div>
              <p className="text-slate-900 font-extrabold text-sm leading-none">{t('landing_telemetry_title')}</p>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-medium">{t('landing_telemetry_sub')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-blue-950 mb-2">{t('landing_candidate_benefits_title')}</h2>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <FeatureCard
              title={t('landing_feature1_title')}
              desc={t('landing_feature1_desc')}
            />
            <FeatureCard
              title={t('landing_feature2_title')}
              desc={t('landing_feature2_desc')}
            />
            <FeatureCard
              title={t('landing_feature3_title')}
              desc={t('landing_feature3_desc')}
            />
            <FeatureCard
              title={t('landing_feature4_title')}
              desc={t('landing_feature4_desc')}
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{t('landing_trust_badge')}</p>
        <h3 className="text-xl font-bold text-blue-900 mb-10">{t('landing_trust_title')}</h3>
        <div className="flex justify-center items-center gap-12 opacity-70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-8 bg-green-600/20 rounded flex items-center justify-center">🇪🇹</div>
            <span className="font-bold text-slate-600 text-sm">Ethiopian Transport Authority</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 text-sm">Digital Safety Certified</span>
          </div>
        </div>
        <div className="mt-8 flex justify-center gap-6 text-sm font-semibold text-blue-900">
          <Link href="/about" className="hover:underline">{t('about')}</Link>
          <Link href="/contact" className="hover:underline">{t('contact')}</Link>
          <Link href="/privacy-policy" className="hover:underline">{t('privacy')}</Link>
        </div>
      </section>
    </>
  );
}

// FeatureCard component
type FeatureCardProps = {
  title: string;
  desc: string;
};

const FeatureCard = ({ title, desc }: FeatureCardProps) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200">
    <h3 className="text-lg font-bold text-blue-950 mb-3">{title}</h3>
    <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
  </div>
);