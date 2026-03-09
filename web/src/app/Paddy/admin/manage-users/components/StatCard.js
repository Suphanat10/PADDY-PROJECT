"use client";
import { Users, Sprout, Layers } from "lucide-react";

// Stat Card Component
export const StatCard = ({ icon: Icon, value, label, iconBg, iconColor }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-4">
      <div className={`p-3 ${iconBg} ${iconColor} rounded-xl`}>
        <Icon size={26} />
      </div>
      <div>
        <div className="text-2xl font-black text-slate-800">{value}</div>
        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
          {label}
        </div>
      </div>
    </div>
  </div>
);

// Stats Grid Component - Calculate and display all stats
export const StatsGrid = ({ users }) => {
  // Calculate stats
  const totalUsers = users?.length || 0;
  
  const totalFarms = Array.isArray(users)
    ? users.reduce((acc, u) => acc + (Array.isArray(u?.Farm) ? u.Farm.length : 0), 0)
    : 0;

  const totalAreas = Array.isArray(users)
    ? users.reduce((acc, u) => {
        if (!Array.isArray(u?.Farm)) return acc;
        return acc + u.Farm.reduce((farmAcc, f) => 
          farmAcc + (Array.isArray(f?.areas) ? f.areas.length : 0), 0
        );
      }, 0)
    : 0;

  const stats = [
    {
      icon: Users,
      value: totalUsers,
      label: "เกษตรกร (คน)",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: Sprout,
      value: totalFarms,
      label: "ฟาร์ม (แห่ง)",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      icon: Layers,
      value: totalAreas,
      label: "พื้นที่ย่อย (แปลง)",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};
