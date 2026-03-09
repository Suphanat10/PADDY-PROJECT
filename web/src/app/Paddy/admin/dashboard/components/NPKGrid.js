"use client";
import { Sprout, Droplets, Zap, Thermometer, Loader2 } from "lucide-react";

/**
 * NPK Grid Component
 * Displays NPK and moisture sensor readings
 */
export function NPKGrid({ sensor }) {
  const items = [
    {
      label: "ไนโตรเจน (N)",
      value: sensor.n,
      color: "emerald",
      icon: <Sprout size={16} />,
    },
    {
      label: "ฟอสฟอรัส (P)",
      value: sensor.p,
      color: "orange",
      icon: <Droplets size={16} />,
    },
    {
      label: "โพแทสเซียม (K)",
      value: sensor.k,
      color: "purple",
      icon: <Zap size={16} />,
    },
    {
      label: "ความชื้นดิน",
      value: sensor.moisture,
      color: "blue",
      icon: <Thermometer size={16} />,
    },
  ];

  return (
    <div className="lg:col-span-6 grid grid-cols-2 gap-3">
      {items.map((item, index) => (
        <NPKCard key={index} {...item} />
      ))}
    </div>
  );
}

/**
 * Individual NPK Card
 */
function NPKCard({ label, value, color, icon }) {
  const colorClasses = {
    emerald: "text-emerald-500",
    orange: "text-orange-500",
    purple: "text-purple-500",
    blue: "text-blue-500",
  };

  // Check if value is empty/null/undefined/0
  const hasData = value !== null && value !== undefined && value !== 0 && value !== "-";

  return (
    <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col justify-between">
      <div className="flex items-center gap-2">
        <div className={colorClasses[color]}>{icon}</div>
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
          {label}
        </span>
      </div>
      <div className="mt-3 flex items-baseline justify-end gap-1">
        {hasData ? (
          <>
            <span className="text-2xl font-black text-slate-800">{value}</span>
            <span className="text-[9px] font-bold text-slate-300">mg/kg</span>
          </>
        ) : (
          <div className="flex items-center gap-1 text-slate-400">
            <Loader2 size={14} className="animate-spin" />
            <span className="text-[10px] font-bold">รอข้อมูล...</span>
          </div>
        )}
      </div>
    </div>
  );
}
