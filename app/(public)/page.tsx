"use client";

import Link from "next/link";
import { Eye, Camera, Brain } from "lucide-react";
import React, { useState } from "react";
import { useI18n } from '@/i18n/useI18n';

export default function LandingPage() {
  const [showVideo, setShowVideo] = useState(false);
  const { t } = useI18n();

  return (
    <>
      {/* Hero Section */}
      <section className="pt-10 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-bold">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            {t('landing_hero_badge')}
          </div>
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
            <button
              type="button"
              onClick={() => setShowVideo(true)}
              className="border-2 border-blue-100 text-blue-900 px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-all"
            >
              <span className="w-6 h-6 border-2 border-blue-900 rounded-full flex items-center justify-center text-[10px]">▶</span>
              {t('landing_cta_watchVideo')}
            </button>
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

      {/* Video modal */}
      {showVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setShowVideo(false)}
        >
          <div className="w-full max-w-3xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="relative bg-black rounded-xl overflow-hidden">
              <button
                onClick={() => setShowVideo(false)}
                className="absolute top-3 right-3 z-50 bg-white/20 hover:bg-white/40 rounded-full p-2 text-white"
                aria-label="Close video"
              >
                ✕
              </button>
              <div className="aspect-video w-full">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0"
                  title="Intro Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Capabilities Section */}
      <section className="py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-blue-950 mb-2">{t('landing_feature1_title')}</h2>
            <p className="text-slate-400 font-bold text-sm tracking-widest">CORE SYSTEM CAPABILITIES</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Eye />}
              title={t('landing_feature1_title')}
              sub={t('landing_feature1_sub')}
              desc={t('landing_feature1_desc')}
            />
            <FeatureCard
              icon={<Camera />}
              title={t('landing_feature2_title')}
              sub={t('landing_feature2_sub')}
              desc={t('landing_feature2_desc')}
            />
            <FeatureCard
              icon={<Brain />}
              title={t('landing_feature3_title')}
              sub={t('landing_feature3_sub')}
              desc={t('landing_feature3_desc')}
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
  icon: React.ReactNode;
  title: string;
  sub: string;
  desc: string;
};

const FeatureCard = ({ icon, title, sub, desc }: FeatureCardProps) => (
  <div className="bg-white p-10 rounded-4xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 group">
    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
      {icon}
    </div>
    <h3 className="text-xl font-black text-blue-950 mb-1">{title}</h3>
    <p className="text-blue-600 font-bold text-[10px] uppercase tracking-widest mb-4">{sub}</p>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </div>
);