"use client";

import { CandidateLayout } from "@/components/layout/CandidateLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { Calendar, MapPin, Award } from "lucide-react";

export default function CandidateDashboard() {
  const { user } = useAuthStore();

  // Mock stats
  const stats = {
    totalExams: 4,
    averageScore: 82,
    passedExams: 3,
  };

  return (
    <CandidateLayout activeMenu="dashboard">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">
            እንኳን ደህና መጡ, {user?.name || "Candidate"}!
          </h1>
          <Button variant="primary">አዲስ ፈተና ጀምር</Button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <p className="text-3xl font-bold text-primary">{stats.totalExams}</p>
            <p className="text-sm text-slate-500">የተወሰዱ ፈተናዎች</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-primary">{stats.averageScore}%</p>
            <p className="text-sm text-slate-500">አማካይ ውጤት</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-primary">{stats.passedExams}</p>
            <p className="text-sm text-slate-500">ያለፉ ፈተናዎች</p>
          </Card>
        </div>

        {/* Upcoming test info */}
        <Card>
          <h2 className="font-bold text-lg mb-4">ቀጣይ ፈተና</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-primary" />
              <span>ሰኔ ፲፭, ፳፻፲፰ (June 15, 2026)</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-primary" />
              <span>ቦሌ ተሞክሮ መንገድ</span>
            </div>
            <div className="flex items-center gap-3">
              <Award size={18} className="text-primary" />
              <span>ምድብ B</span>
            </div>
          </div>
        </Card>
      </div>
    </CandidateLayout>
  );
}