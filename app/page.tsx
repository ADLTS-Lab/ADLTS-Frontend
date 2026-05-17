"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Camera, Brain } from "lucide-react";
import React, { useState, useEffect } from "react";

export default function LandingPage() {
  const router = useRouter();
  const [showVideo, setShowVideo] = useState(false);

  return (
    <>
      {/* Hero Section */}
      <section className="pt-10 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-bold">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            አውቶማቲክ የምዘና ስርዓት
          </div>
          <h1 className="text-5xl lg:text-6xl font-black text-blue-950 leading-tight">
            አውቶማቲክ የመንጃ ፈቃድ <br />
            <span className="text-blue-700">ሙከራ ስርዓት</span>
          </h1>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-blue-600">Automated Driving License Testing System</h2>
            <p className="text-slate-500 max-w-md leading-relaxed">
              የኢትዮጵያን የትራንስፖርት ዘርፍ ለማዘመን የተዘጋጀ፣ በቴክኖሎጂ የታገዘ ግልጽ እና ቀልጣፋ የመንጃ ፈቃድ የምዘና ሂደት።
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push("/candidate/register")}
              className="bg-blue-900 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:-translate-y-1 transition-all"
            >
              ማመልከቻ ጀምር
            </button>
            <button
              type="button"
              onClick={() => setShowVideo(true)}
              className="border-2 border-blue-100 text-blue-900 px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-all"
            >
              <span className="w-6 h-6 border-2 border-blue-900 rounded-full flex items-center justify-center text-[10px]">▶</span>
              ቪዲዮ ይመልከቱ
            </button>
          </div>
        </div>

        {/* Hero Image placeholder */}
        <div className="relative group">
          <div className="rounded-[40px] overflow-hidden shadow-2xl bg-gradient-to-br from-blue-100 to-slate-200 h-[450px] flex items-center justify-center">
            <div className="text-center p-8">
              <Brain size={64} className="text-blue-600 mx-auto mb-4" />
              <p className="text-blue-800 font-bold">AI-Powered Driving Test System</p>
              <p className="text-slate-500 text-sm mt-2">Real-time sensor monitoring</p>
            </div>
          </div>
          <div className="absolute bottom-8 left-8 right-8 bg-white/20 backdrop-blur-xl border border-white/30 p-6 rounded-3xl flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-900 rounded-2xl flex items-center justify-center text-white">
              <Brain size={24} />
            </div>
            <div>
              <p className="text-white font-bold">AI-Powered Sensors</p>
              <p className="text-white/70 text-xs">Real-time precision monitoring</p>
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
            <h2 className="text-3xl font-black text-blue-950 mb-2">የአሰራር ባህሪያት</h2>
            <p className="text-slate-400 font-bold text-sm tracking-widest">CORE SYSTEM CAPABILITIES</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Eye className="text-blue-600" />}
              title="ዘመናዊ እይታ"
              sub="Precision Monitoring"
              desc="በዘመናዊ ሴንሰሮች የታገዘ እና እያንዳንዱን እንቅስቃሴ በቅርበት የሚከታተል የምዘና ሲስተም::"
            />
            <FeatureCard
              icon={<Camera className="text-blue-600" />}
              title="ቀጥታ ካሜራ"
              sub="Live Camera Verification"
              desc="ግልጽነትን ለማረጋገጥ ሂደቱን በቀጥታ የሚከታተሉ እና የሚመዘግቡ ከፍተኛ ጥራት ያላቸው ካሜራዎች::"
            />
            <FeatureCard
              icon={<Brain className="text-blue-600" />}
              title="ብልህ ትንተና"
              sub="AI Result Analysis"
              desc="በአርቲፊሻል ኢንተለጀንስ የታገዘ ፈጣን እና ትክክለኛ የውጤት ትንተና ስርዓት::"
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">በመንግስት እውቅና የተሰጠው</p>
        <h3 className="text-xl font-bold text-blue-900 mb-10">በኢትዮጵያ የትራንስፖርት ባለስልጣን ይፋ የተደገፈ</h3>
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
          <Link href="/about" className="hover:underline">About</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
          <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
        </div>
      </section>
    </>
  );
}

// FeatureCard component
const FeatureCard = ({ icon, title, sub, desc }: any) => (
  <div className="bg-white p-10 rounded-[32px] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 group">
    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors">
      {icon &&
        React.cloneElement(icon as React.ReactElement, {
          size: 28,
          className: "group-hover:text-white transition-colors",
        })}
    </div>
    <h3 className="text-xl font-black text-blue-950 mb-1">{title}</h3>
    <p className="text-blue-600 font-bold text-[10px] uppercase tracking-widest mb-4">{sub}</p>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </div>
);