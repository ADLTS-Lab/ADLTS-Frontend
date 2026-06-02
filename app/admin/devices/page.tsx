"use client";

import { useEffect, useState } from "react";
import { Battery, Megaphone, Plus, RotateCcw, Settings, Thermometer, Ticket, Wifi, AlertTriangle, Power } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { listDevicesSafe, type DeviceRecord, type DeviceSummary } from "@/services/devices.service";

function isAdminPortalRole(role: string | null | undefined) {
  return role === "admin" || role === "super_admin";
}

export default function AdminDeviceDashboard() {
  const { isAuthenticated, user } = useAuthStore();
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [summary, setSummary] = useState<DeviceSummary>({ total: 0, online: 0, warning: 0, offline: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !isAdminPortalRole(user?.role)) return;

    let isMounted = true;
    setIsLoading(true);
    setError("");

    listDevicesSafe()
      .then(({ devices: data, summary: nextSummary, error: nextError }) => {
        if (!isMounted) return;
        setDevices(data);
        setSummary(nextSummary);
        setError(nextError ?? "");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.role]);

  if ((!isAuthenticated && typeof window === "undefined") || (isAuthenticated && !isAdminPortalRole(user?.role))) {
    return null;
  }

  const { total: totalDevices, online: onlineCount, warning: warningCount, offline: offlineCount } = summary;

  return (
    <main className="space-y-8">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Admin Portal › Device Management</p>
          <h2 className="text-2xl font-bold text-slate-800">
            Device Management Dashboard • <span className="text-slate-500 font-medium">{totalDevices} Active Units</span>
          </h2>
        </div>
        <button className="fixed bottom-8 right-8 w-14 h-14 bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-red-700 hover:rotate-12 transition-all">
          <Megaphone size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard label="Total Devices" value={totalDevices.toString()} sub="+4 this week" color="blue" />
        <SummaryCard label="Online Now" value={onlineCount.toString()} sub="((•))" color="green" />
        <SummaryCard label="Warning State" value={warningCount.toString()} sub="Battery/Storage" color="orange" />
        <SummaryCard label="Offline/Emergency" value={offlineCount.toString()} sub="!" color="red" />
      </div>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="text-sm text-slate-500 col-span-full">Loading devices…</p>
        ) : devices.length === 0 ? (
          <div className="col-span-full rounded-xl border border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
            No devices found.
          </div>
        ) : (
          devices.map((device) => (
            <DeviceNode key={device.name} {...device} />
          ))
        )}

        <div className="border-2 border-dashed border-slate-300 rounded-4xl flex flex-col items-center justify-center p-8 bg-slate-50/50 hover:bg-white transition-all cursor-pointer group">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="text-blue-600" />
          </div>
          <p className="font-bold text-blue-950">Register New Device</p>
          <p className="text-[10px] text-slate-400 mt-1">Assign serial and set center permissions</p>
        </div>
      </div>
    </main>
  );
}

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
    <div className={`bg-white p-6 rounded-3xl border-b-4 ${colors[color]} shadow-sm`}>
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
    <div className="bg-white rounded-4xl p-6 shadow-sm border border-slate-100 flex flex-col gap-5">
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
          <div className={`h-full rounded-full ${utilization > 80 ? "bg-orange-500" : "bg-blue-600"}`} style={{ width: `${utilization}%` }} />
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
