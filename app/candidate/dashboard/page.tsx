"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, ChevronRight, MapPin, Award } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { getCurrentUser, type User } from "@/services/auth.service";
import { useI18n } from "@/i18n/useI18n";

export default function CandidateDashboard() {
  const router = useRouter();
  const { user: storedUser, isAuthenticated, setUser } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(storedUser);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;

    if (!isAuthenticated && !token) {
      router.push("/login");
      return;
    }

    let isMounted = true;

    const loadProfile = async () => {
      setIsProfileLoading(true);
      const currentUser = await getCurrentUser();

      if (!isMounted) return;

      if (currentUser) {
        setProfile(currentUser);
        setUser(currentUser);
      } else {
        setProfile(storedUser);
      }

      setIsProfileLoading(false);
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, router, setUser, storedUser]);

  const { t } = useI18n();

  if ((!isAuthenticated && typeof window === "undefined") || isProfileLoading) {
    return (
      <main className="space-y-6 md:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-slate-100 animate-pulse">
            <div className="h-5 w-48 bg-slate-100 rounded mb-4" />
            <div className="h-4 w-full max-w-md bg-slate-100 rounded mb-3" />
            <div className="h-10 w-56 bg-slate-100 rounded-full" />
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-100 animate-pulse">
            <div className="h-5 w-32 bg-slate-100 rounded mb-6" />
            <div className="space-y-4">
              <div className="h-10 bg-slate-100 rounded-xl" />
              <div className="h-10 bg-slate-100 rounded-xl" />
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  const stats = {
    totalExams: 4,
    averageScore: 82,
    passedExams: 3,
    incomplete: 1,
  };

  const pastExams = [
    { date: "Sep 15, 2024", type: "Theory Mock #4", score: "88/100", status: "Pass", color: "green" },
    { date: "Aug 28, 2024", type: "Traffic Signs Quiz", score: "94/100", status: "Pass", color: "green" },
    { date: "Aug 10, 2024", type: "Theory Mock #3", score: "42/100", status: "Fail", color: "red" },
  ];

  return (
    <main className="space-y-6 md:space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#283C86] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden flex flex-col justify-center">
          <div className="max-w-md z-10">
            <p className="text-base md:text-lg mb-6 md:mb-8 leading-relaxed opacity-90">{t('dashboardHero')}</p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-white text-blue-900 px-5 md:px-6 py-2 md:py-3 rounded-full font-bold flex items-center gap-2 text-sm md:text-base">
                <span className="w-5 h-5 bg-blue-900 text-white rounded-full flex items-center justify-center text-xs">▶</span>
                {t('startNewExam')}
              </button>
              <button className="bg-white/10 hover:bg-white/20 border border-white/20 px-5 md:px-6 py-2 md:py-3 rounded-full font-bold text-sm md:text-base">
                {t('readGuides')}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 mb-6">{t('yourStatus')}</h3>
          <div className="space-y-6">
            <StatusItem icon={<Award className="text-blue-600" />} label={t('licenseCategory')} value={profile?.licenseCategory || "Category B"} />
            <StatusItem icon={<MapPin className="text-blue-600" />} label={t('testCenter')} value={profile?.testCenter || "Addis Ababa Center"} />
            <StatusItem icon={<Calendar className="text-blue-600" />} label={t('nextExam')} value="Oct 24, 2024" />
          </div>
          <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400">{t('registrationStatus')}</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] rounded-md font-bold">{t('registrationStatus') === 'Registration status' ? 'Active' : 'ንቁ'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{t('candidateSmall')}</p>
          <p className="text-xl font-bold text-slate-900">{profile?.name || `${profile?.first_name || "Candidate"} ${profile?.last_name || ""}`.trim()}</p>
          <p className="text-sm text-slate-500 mt-1">{profile?.email || "No email available"}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{t('accountSmall')}</p>
          <p className="text-sm text-slate-600">{t('loadedFromApi')}</p>
          <p className="text-sm text-slate-600 mt-2">{t('fallbackAuth')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard label={t('stat_totalExams')} value={stats.totalExams.toString().padStart(2, "0")} />
        <StatCard label={t('stat_averageScore')} value={`${stats.averageScore}%`} />
        <StatCard label={t('stat_passedExams')} value={stats.passedExams.toString().padStart(2, "0")} />
        <StatCard label={t('stat_incomplete')} value={stats.incomplete.toString().padStart(2, "0")} />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 md:p-6 flex justify-between items-center border-b border-slate-50">
          <h3 className="font-bold text-blue-950 text-base md:text-lg">{t('pastExamsTitle')}</h3>
          <button className="text-blue-600 text-xs md:text-sm font-bold flex items-center gap-1">
            {t('viewAll')} <ChevronRight size={16} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-125">
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
  );
}

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

type PastExam = {
  date: string;
  type: string;
  score: string;
  status: string;
  color: string;
};

const TableRow = ({ date, type, score, status, color }: PastExam) => (
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
