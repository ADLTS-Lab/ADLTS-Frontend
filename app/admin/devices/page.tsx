"use client";

import { useEffect } from "react";
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
  Filter,
  Plus,
  Battery,
  Thermometer,
  Signal,
  Wifi,
  AlertTriangle,
  Power,
  RotateCcw,
  Ticket,
  Megaphone,
} from "lucide-react";

// Mock device data – replace with real API later
const mockDevices = [
  {
    type: "Tablet Node",
    name: "ADLT-ET-001",
    location: "Addis Ababa Center A",
    utilization: 68,
    battery: 94,
    detailLabel: "Temp",
    detailValue: "32°C",
    status: "Online",
  },
  {
    type: "Server Module",
    name: "ADLT-ET-042",
    location: "Dire Dawa Region 02",
    utilization: 92,
    battery: 81,
    detailLabel: "Latency",
    detailValue: "12ms",
    status: "Warning",
  },
  {
    type: "Terminal Unit",
    name: "ADLT-ET-109",
    location: "Bahir Dar Hub",
    utilization: 0,
    battery: 0,
    detailLabel: "Sync",
    detailValue: "None",
    status: "Offline",
  },
  {
    type: "Biometric Scanner",
    name: "ADLT-ET-004",
    location: "Addis Ababa Center B",
    utilization: 14,
    battery: 48,
    detailLabel: "Last Auth",
    detailValue: "2m ago",
    status: "Online",
  },
  {
    type: "Mobile Unit",
    name: "ADLT-ET-221",
    location: "Hawassa Center Hub",
    utilization: 45,
    battery: 100,
    detailLabel: "Signal",
    detailValue: "-45dBm",
    status: "Online",
  },
];

export default function AdminDeviceDashboard() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();

  // Protect route – admin only
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role !== "admin") {
      router.push("/candidate/dashboard");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "admin") return null;

  const handleLogout = () => {
    logout();
    localStorage.removeItem("auth-token");
    router.push("/login");
  };

  // Summary counts
  const totalDevices = mockDevices.length;
  const onlineCount = mockDevices.filter((d) => d.status === "Online").length;
  const warningCount = mockDevices.filter((d) => d.status === "Warning").length;
  const offlineCount = mockDevices.filter((d) => d.status === "Offline").length;

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex font-sans text-slate-900">
      {/* Dark Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-[#1D3B8A] to-[#162D6D] text-white flex flex-col hidden xl:flex">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-black/20 rounded-lg flex items-center justify-center font-bold border border-white/10">
              🏛️
            </div>
            <div>
              <h1 className="font-bold leading-none tracking-tight">ADLTS Admin</h1>
              <p className="text-[10px] opacity-60 uppercase tracking-tighter mt-1">
                Ethiopian Digital Platform
              </p>
            </div>
          </div>

          <nav className="space-y-1">
            <SidebarLink icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <SidebarLink icon={<Laptop size={18} />} label="Devices" active />
            <SidebarLink icon={<Activity size={18} />} label="Active Exams" />
            <SidebarLink icon={<History size={18} />} label="Exam History" />
            <SidebarLink icon={<Users size={18} />} label="Candidates" />
            <SidebarLink icon={<BarChart3 size={18} />} label="Analytics" />
          </nav>
        </div>

        <div className="mt-auto p-6 bg-black/10 border-t border-white/5">
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="opacity-60">System Health</span>
              <span className="text-blue-300">98%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400 w-[98%]" />
            </div>
            <p className="text-[10px] opacity-50">All systems operational</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col">
        {/* Top Navbar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search devices, IDs, or locations..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-full text-sm border-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 border-r pr-6 border-slate-100 text-slate-400">
              <Bell size={20} className="hover:text-blue-600 cursor-pointer" />
              <Settings size={20} className="hover:text-blue-600 cursor-pointer" />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800">{user?.name || "Admin"}</p>
                <p className="text-[10px] text-slate-400">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold">
                  {user?.name?.charAt(0) || "A"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-8 space-y-8">
          <div className="flex justify-between items-end flex-wrap gap-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Admin Portal › Device Management
              </p>
              <h2 className="text-2xl font-bold text-slate-800">
                Device Management Dashboard •{" "}
                <span className="text-slate-500 font-medium">{totalDevices} Active Units</span>
              </h2>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-300 transition">
                <Filter size={16} /> Filter
              </button>
              <button className="flex items-center gap-2 bg-[#1D3B8A] text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-800 transition shadow-lg shadow-blue-900/20">
                <Plus size={18} /> Provision New Device
              </button>
            </div>
          </div>

          {/* Stats Summary Rows */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <SummaryCard label="Total Devices" value={totalDevices.toString()} sub="+4 this week" color="blue" />
            <SummaryCard label="Online Now" value={onlineCount.toString()} sub="((•))" color="green" />
            <SummaryCard label="Warning State" value={warningCount.toString()} sub="Battery/Storage" color="orange" />
            <SummaryCard label="Offline/Emergency" value={offlineCount.toString()} sub="!" color="red" />
          </div>

          {/* Device Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockDevices.map((device, idx) => (
              <DeviceNode key={idx} {...device} />
            ))}
            {/* Add Device Placeholder */}
            <div className="border-2 border-dashed border-slate-300 rounded-[32px] flex flex-col items-center justify-center p-8 bg-slate-50/50 hover:bg-white transition-all cursor-pointer group">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="text-blue-600" />
              </div>
              <p className="font-bold text-blue-950">Register New Device</p>
              <p className="text-[10px] text-slate-400 mt-1">Assign serial and set center permissions</p>
            </div>
          </div>
        </main>

        {/* Floating Action Button */}
        <button className="fixed bottom-8 right-8 w-14 h-14 bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-red-700 hover:rotate-12 transition-all">
          <Megaphone size={24} />
        </button>
      </div>
    </div>
  );
}

// --- Helper Components ---

const SidebarLink = ({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) => (
  <div
    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
      active
        ? "bg-white/10 text-white font-bold border border-white/5 shadow-inner"
        : "text-white/50 hover:text-white"
    }`}
  >
    {icon} <span className="text-sm">{label}</span>
  </div>
);

const SummaryCard = ({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: "blue" | "green" | "orange" | "red";
}) => {
  const colors = {
    blue: "text-blue-900 border-blue-500",
    green: "text-emerald-600 border-emerald-500",
    orange: "text-orange-600 border-orange-500",
    red: "text-red-600 border-red-500",
  };
  return (
    <div className={`bg-white p-6 rounded-[24px] border-b-4 ${colors[color]} shadow-sm`}>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex justify-between items-end">
        <h3 className="text-4xl font-black">{value}</h3>
        <span className={`text-[10px] font-bold py-1 px-2 rounded-md bg-slate-50 ${colors[color]}`}>{sub}</span>
      </div>
    </div>
  );
};

const DeviceNode = ({
  type,
  name,
  location,
  utilization,
  battery,
  detailLabel,
  detailValue,
  status,
}: {
  type: string;
  name: string;
  location: string;
  utilization: number;
  battery: number;
  detailLabel: string;
  detailValue: string;
  status: string;
}) => {
  const isOffline = status === "Offline";
  const statusColor =
    status === "Online"
      ? "bg-green-50 text-green-600"
      : status === "Warning"
      ? "bg-orange-50 text-orange-600"
      : "bg-slate-100 text-slate-400";

  return (
    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col gap-5">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">{type}</p>
          <h4 className="text-xl font-black text-slate-800">{name}</h4>
          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">📍 {location}</p>
        </div>
        <span className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 ${statusColor}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" /> {status}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
          <span className="text-slate-400">Storage Utilization</span>
          <span className="text-slate-800">{utilization}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full">
          <div
            className={`h-full rounded-full ${utilization > 80 ? "bg-orange-500" : "bg-blue-600"}`}
            style={{ width: `${utilization}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-2xl p-3 flex items-center gap-3">
          <Battery size={18} className={isOffline ? "text-slate-300" : "text-blue-600"} />
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase">Battery</p>
            <p className="text-xs font-bold">{isOffline ? "N/A" : `${battery}%`}</p>
          </div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-3 flex items-center gap-3">
          {detailLabel === "Latency" ? (
            <RotateCcw size={18} className="text-blue-600" />
          ) : detailLabel === "Signal" ? (
            <Wifi size={18} className="text-blue-600" />
          ) : (
            <Thermometer size={18} className="text-blue-600" />
          )}
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase">{detailLabel}</p>
            <p className="text-xs font-bold">{detailValue}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        {isOffline ? (
          <>
            <button className="flex-1 bg-blue-900 text-white py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2">
              <Power size={12} /> Remote Wake
            </button>
            <button className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2">
              <Ticket size={12} /> Ticket
            </button>
          </>
        ) : (
          <>
            <button className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition">
              <Settings size={12} /> Configure
            </button>
            <button className="flex-1 border border-red-100 text-red-600 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition">
              <AlertTriangle size={12} /> Emergency Stop
            </button>
          </>
        )}
      </div>
    </div>
  );
};