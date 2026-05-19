"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { LayoutDashboard, Video, Star, History, LogOut } from "lucide-react";

interface CandidateLayoutProps {
  children: ReactNode;
  activeMenu: "dashboard" | "exam" | "results" | "history";
}

export const CandidateLayout = ({ children, activeMenu }: CandidateLayoutProps) => {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { id: "dashboard", label: "ዳሽቦርድ", icon: LayoutDashboard, path: "/candidate/dashboard" },
    { id: "exam", label: "የቀጥታ ፈተና", icon: Video, path: "/candidate/exam" },
    { id: "results", label: "ውጤቶች", icon: Star, path: "/candidate/results" },
    { id: "history", label: "ታሪክ", icon: History, path: "/candidate/history" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white hidden lg:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-2xl">🚗</span>
            <h1 className="font-bold text-xl">ADLTS</h1>
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  activeMenu === item.id
                    ? "bg-white/10 text-white font-bold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <p className="text-sm font-bold">{user?.name}</p>
              <p className="text-xs opacity-70">Candidate</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              localStorage.removeItem("auth-token");
              router.push("/login");
            }}
            className="w-full flex items-center gap-2 text-sm text-white/70 hover:text-white"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};
