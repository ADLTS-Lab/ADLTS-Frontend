"use client";

import { use, useEffect } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
    LayoutDashboard,
    Video,
    Star,
    History,
    HelpCircle,
    Calendar,
    MapPin,
    Award,
  ChevronRight,
} from "lucide-react";

export default function CandidateDashboard() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const { user, isAuthenticated } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/candidate/login");
  }
  // 🛡️ Route protection
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/candidate/login");
    }
  }, [isAuthenticated, router]);

  if (!user) return null; // or a loading spinner

  // Mock stats – replace with real API call later
  const stats = {
    totalExams: 4,
    averageScore: 82,
    passedExams: 3,
    incomplete: 1,
  };

  // Mock past exams – replace with API call later
  const pastExams = [
    { date: "Sep 15, 2024", type: "Theory Mock #4", score: "88/100", status: "Pass", color: "green" },
    { date: "Aug 28, 2024", type: "Traffic Signs Quiz", score: "94/100", status: "Pass", color: "green" },
    { date: "Aug 10, 2024", type: "Theory Mock #3", score: "42/100", status: "Fail", color: "red" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Sidebar – hidden on mobile */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden lg:flex">
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-slate-100">
              <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl">
                {user.name?.charAt(0) || "U"}
              </div>
            </div>
            <h2 className="font-bold text-blue-900">{user.name}</h2>
            <p className="text-[10px] text-slate-400">ID: {user.id || "ET-0000"}</p>
            <span className="mt-1 px-3 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded-full font-bold">
              Candidate Portal
            </span>
          </div>
        </div>

        <nav className="flex-grow px-4 space-y-2">
          <NavItem icon={<LayoutDashboard size={18} />} label="ዳሽቦርድ" active />
          <NavItem icon={<Video size={18} />} label="የቀጥታ ፈተና" />
          <NavItem icon={<Star size={18} />} label="ውጤቶች" />
          <NavItem icon={<History size={18} />} label="ታሪክ" />
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-[10px] font-bold text-slate-500 mb-2">ድጋፍ ያስፈልግዎታል?</p>
            <button className="flex items-center gap-2 text-xs text-blue-700 font-bold">
              <HelpCircle size={14} /> የእገዛ ማዕከል
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow flex flex-col">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8">
  <div className="flex items-center gap-2 font-bold text-blue-900">
    <span className="text-xl">🏛️</span>
    <span className="hidden sm:inline">ADLTS Ethiopia</span>
  </div>
  <div className="flex items-center gap-4 md:gap-6">
    <nav className="hidden md:flex gap-4 md:gap-6 text-xs font-bold text-slate-500">
      <button className="text-blue-700 border-b-2 border-blue-700 pb-5 translate-y-[2px]">ዳሽቦርድ</button>
      <button>የተሰጡ ፈተናዎች</button>
      <button>ውጤቶች</button>
      <button>ታሪክ</button>
    </nav>
    {/* Logout button with icon + text */}
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 transition px-3 py-2 rounded-lg text-slate-700 text-sm font-medium"
    >
      <LogOut size={18} />
      <span className="hidden sm:inline">ውጣ / Logout</span>
    </button>
  </div>
</header>

        {/* Dashboard Body */}
        <main className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Blue Banner */}
            <div className="lg:col-span-2 bg-[#283C86] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden flex flex-col justify-center">
              <div className="max-w-md z-10">
                <p className="text-base md:text-lg mb-6 md:mb-8 leading-relaxed opacity-90">
                  የመንጃ ፍቃድ የብቃት ማረጋገጫ ምዘናዎን እዚህ ይጀምሩ:: ሁሉንም ዝግጅቶችዎን ማጠናቀቅዎን ያረጋግጡ::
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-white text-blue-900 px-5 md:px-6 py-2 md:py-3 rounded-full font-bold flex items-center gap-2 text-sm md:text-base">
                    <span className="w-5 h-5 bg-blue-900 text-white rounded-full flex items-center justify-center text-xs">▶</span>
                    አዲስ ፈተና ጀምር
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 border border-white/20 px-5 md:px-6 py-2 md:py-3 rounded-full font-bold text-sm md:text-base">
                    መመሪያዎችን አንብብ
                  </button>
                </div>
              </div>
            </div>

            {/* Status Info Card – uses real user data from store */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-6">የእርስዎ ሁኔታ</h3>
              <div className="space-y-6">
                <StatusItem icon={<Award className="text-blue-600" />} label="ምድብ" value={user.licenseCategory || "Category B"} />
                <StatusItem icon={<MapPin className="text-blue-600" />} label="የፈተና ማዕከል" value={user.testCenter || "Addis Ababa Center"} />
                <StatusItem icon={<Calendar className="text-blue-600" />} label="የሚቀጥለው ፈተና" value="Oct 24, 2024" />
              </div>
              <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">የምዝገባ ሁኔታ</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] rounded-md font-bold">ንቁ</span>
              </div>
            </div>
          </div>

          {/* Stats Grid – using dynamic mock data */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard label="የተወሰዱ ፈተናዎች" value={stats.totalExams.toString().padStart(2, "0")} />
            <StatCard label="አማካይ ውጤት" value={`${stats.averageScore}%`} />
            <StatCard label="ያለፉ ፈተናዎች" value={stats.passedExams.toString().padStart(2, "0")} />
            <StatCard label="ያልተጠናቀቁ" value={stats.incomplete.toString().padStart(2, "0")} />
          </div>

          {/* Table Section – mock data, replace with API later */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 md:p-6 flex justify-between items-center border-b border-slate-50">
              <h3 className="font-bold text-blue-950 text-base md:text-lg">ያለፉ ፈተናዎች ታሪክ</h3>
              <button className="text-blue-600 text-xs md:text-sm font-bold flex items-center gap-1">
                ሁሉንም ይመልከቱ <ChevronRight size={16} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="px-4 md:px-6 py-4">የፈተና ቀን (Date)</th>
                    <th className="px-4 md:px-6 py-4">የፈተና አይነት (Type)</th>
                    <th className="px-4 md:px-6 py-4">ውጤት (Score)</th>
                    <th className="px-4 md:px-6 py-4">ሁኔታ (Result)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pastExams.map((exam, idx) => (
                    <TableRow key={idx} {...exam} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Helper components (kept as in Gemini, but moved inside same file for simplicity)
const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) => (
  <button
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
      active ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50"
    }`}
  >
    {icon} <span>{label}</span>
  </button>
);

const StatusItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-4">
    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-800 leading-none">{value}</p>
    </div>
  </div>
);

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
    <span className="text-2xl md:text-3xl font-bold text-blue-900 mb-1">{value}</span>
    <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
  </div>
);

const TableRow = ({ date, type, score, status, color }: any) => (
  <tr className="text-xs md:text-sm font-medium text-slate-700 group hover:bg-slate-50/50 transition-colors">
    <td className="px-4 md:px-6 py-4 flex items-center gap-3 whitespace-nowrap">
      <Calendar size={14} className="text-slate-300" /> {date}
    </td>
    <td className="px-4 md:px-6 py-4">{type}</td>
    <td className={`px-4 md:px-6 py-4 font-bold ${color === "green" ? "text-blue-700" : "text-red-500"}`}>{score}</td>
    <td className="px-4 md:px-6 py-4">
      <span
        className={`px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-bold flex w-fit items-center gap-1 ${
          color === "green" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        <span className={`w-1 h-1 rounded-full ${color === "green" ? "bg-green-700" : "bg-red-700"}`} />
        እለፍልዋል ( {status} )
      </span>
    </td>
  </tr>
);