"use client";

import { useRouter } from "next/navigation";
import { Eye, Camera, Brain, Globe, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";
import React from "react";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-blue-900">
            <span className="text-2xl">🏛️</span>
            <span>ADLTS</span>
            <span className="ml-1 flex gap-0.5">
              <div className="w-3 h-2 bg-green-600"></div>
              <div className="w-3 h-2 bg-yellow-400"></div>
              <div className="w-3 h-2 bg-red-600"></div>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
            <button className="text-blue-700 border-b-2 border-blue-700 pb-1">መነሻ</button>
            <button className="hover:text-blue-700 transition">ስለ እኛ</button>
            <button className="hover:text-blue-700 transition">እንዴት ይሰራል</button>
          </nav>

          <div className="flex items-center gap-4">
            <div className="bg-slate-100 rounded-full p-1 flex">
              <button className="px-3 py-1 text-[10px] font-bold text-slate-400">EN</button>
              <button className="px-3 py-1 text-[10px] font-bold bg-white rounded-full shadow-sm">አማ</button>
            </div>
            <button
              onClick={() => router.push("/login")}
              className="bg-blue-900 text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-blue-800 transition"
>
              ግቡ
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
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
              ማመልከቻ ይጀምሩ
            </button>
            <button className="border-2 border-blue-100 text-blue-900 px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-all">
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

      {/* Capabilities Section */}
      <section className="py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
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
            <ShieldCheck className="text-slate-400" />
            <span className="font-bold text-slate-600 text-sm">Digital Safety Certified</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 pt-20 pb-10 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-blue-900 mb-6">
              <span className="text-2xl">🏛️</span>
              <span>ADLTS Ethiopia</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              የመንጃ ፈቃድ አሰጣጥ ሂደቱን ዲጂታላይዝ በማድረግ ደህንነቱ የተጠበቀ እና ዘመናዊ የትራንስፖርት ስርዓት ለመገንባት እንሰራለን::
            </p>
          </div>

          <div>
            <h4 className="font-bold text-blue-950 mb-6 text-sm">ፈጣን ሊንኮች</h4>
            <ul className="space-y-4 text-xs font-medium text-slate-500">
              <li className="hover:text-blue-700 cursor-pointer">መነሻ</li>
              <li className="hover:text-blue-700 cursor-pointer">ስለ እኛ</li>
              <li className="hover:text-blue-700 cursor-pointer">እንዴት ይሰራል</li>
              <li className="hover:text-blue-700 cursor-pointer">Contact</li>
              <li className="hover:text-blue-700 cursor-pointer">Privacy Policy</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-blue-950 mb-6 text-sm">አድራሻ</h4>
            <ul className="space-y-4 text-xs font-medium text-slate-500">
              <li className="flex items-center gap-3">
                <MapPin size={14} /> አዲስ አበባ፣ ኢትዮጵያ
              </li>
              <li className="flex items-center gap-3">
                <Mail size={14} /> info@adlts.gov.et
              </li>
              <li className="flex items-center gap-3">
                <Phone size={14} /> 8890 (ነጻ መስመር)
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-400 font-bold">
          <p>© 2024 ADLTS Ethiopia. All rights reserved.</p>
          <div className="flex gap-4">
            <Globe size={16} />
            <ShieldCheck size={16} />
          </div>
        </div>
      </footer>
    </div>
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