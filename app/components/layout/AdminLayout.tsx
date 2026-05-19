"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard,
  Laptop,
  Activity,
  History,
  Users,
  BarChart3,
  Search,
  Bell,
  Settings,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  activeMenu: "devices" | "dashboard" | "active-exams" | "exam-history" | "candidates" | "analytics";
}

export const AdminLayout = ({ children, activeMenu }: AdminLayoutProps) => {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { id: "devices", label: "Devices", icon: Laptop, path: "/admin/devices" },
    { id: "active-exams", label: "Active Exams", icon: Activity, path: "/admin/exams" },
    { id: "exam-history", label: "Exam History", icon: History, path: "/admin/history" },
    { id: "candidates", label: "Candidates", icon: Users, path: "/admin/candidates" },
    { id: "analytics", label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-[#1D3B8A] to-[#162D6D] text-white hidden xl:flex flex-col">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-black/20 rounded-lg flex items-center justify-center font-bold border border-white/10">🏛️</div>
            <div>
              <h1 className="font-bold leading-none tracking-tight">ADLTS Admin</h1>
              <p className="text-[10px] opacity-60">Ethiopian Digital Platform</p>
            </div>
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  activeMenu === item.id
                    ? "bg-white/10 text-white font-bold"
                    : "text-white/50 hover:text-white"
                }`}
              >
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-6 bg-black/10 border-t border-white/5">
          <button onClick={logout} className="w-full text-left text-sm text-white/60 hover:text-white">
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              aria-label="Search"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-full text-sm"
            />
          </div>
          <div className="flex items-center gap-4">
            <Bell size={20} className="text-slate-400" />
            <Settings size={20} className="text-slate-400" />
            <div className="text-right">
              <p className="text-sm font-bold">{user?.name}</p>
              <p className="text-[10px] text-slate-400">Admin</p>
            </div>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
};
