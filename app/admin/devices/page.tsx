"use client";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Battery, Wifi, Thermometer, RotateCcw, Settings, AlertTriangle, Plus } from "lucide-react";

// Mock device data (same as before)
const devices = [
  { id: "ADLT-ET-001", status: "Online", battery: 94, storage: 68, temp: "32°C", location: "Addis Ababa Center A" },
  { id: "ADLT-ET-042", status: "Warning", battery: 81, storage: 92, temp: "38°C", location: "Dire Dawa Region 02" },
  { id: "ADLT-ET-109", status: "Offline", battery: 0, storage: 0, temp: "N/A", location: "Bahir Dar Hub" },
];

export default function AdminDevicesPage() {
  return (
    <AdminLayout activeMenu="devices">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Device Management</h1>
          <Button variant="primary">
            <Plus size={16} className="mr-2" /> Provision Device
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <Card key={device.id} className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-xs font-bold text-primary">{device.id}</p>
                  <p className="text-sm text-slate-500">{device.location}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  device.status === "Online" ? "bg-green-100 text-green-700" :
                  device.status === "Warning" ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-500"
                }`}>{device.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2"><Battery size={16} /> {device.battery}%</div>
                <div className="flex items-center gap-2"><Thermometer size={16} /> {device.temp}</div>
                <div className="flex items-center gap-2">Storage: {device.storage}%</div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="secondary" size="sm">Configure</Button>
                <Button variant="danger" size="sm">Emergency Stop</Button>
              </div>
            </Card>
          ))}
          {/* Add new card */}
          <Card className="border-dashed border-2 border-slate-300 flex flex-col items-center justify-center text-center cursor-pointer">
            <Plus size={32} className="text-primary mb-2" />
            <p className="font-bold">Register New Device</p>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}