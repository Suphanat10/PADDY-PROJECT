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
      {/* แสดงระดับปุ๋ย หากมี */}
      {hasData && label.includes("ไนโตรเจน") && (
        <div className="mt-2 text-right">
          <span className="text-xs font-bold text-emerald-600">ระดับ: {sensorLevelLabel(value, 'N')}</span>
          <div>
            <span className="text-[11px] font-semibold text-emerald-500">N%: {formatNPercent(value)}</span>
          </div>
        </div>
      )}
      {hasData && label.includes("ฟอสฟอรัส") && (
        <div className="mt-2 text-right">
          <span className="text-xs font-bold text-orange-600">ระดับ: {sensorLevelLabel(value, 'P')}</span>
        </div>
      )}
      {hasData && label.includes("โพแทสเซียม") && (
        <div className="mt-2 text-right">
          <span className="text-xs font-bold text-purple-600">ระดับ: {sensorLevelLabel(value, 'K')}</span>
        </div>
      )}
    </div>
  );
}

// ช่วยแปลงค่า level โดยรับ value (string/number) และ type
function sensorLevelLabel(value, type) {
  const v = Number(value ?? 0);
  if (type === "N") {
    const nPercent = v / 10000;
    if (nPercent < 0.05) return "ต่ำมาก";
    if (nPercent <= 0.09) return "ต่ำ";
    if (nPercent <= 0.14) return "ปานกลาง";
    return "สูง";
  }
  if (type === "P") {
    if (v < 3) return "ต่ำมาก";
    if (v <= 10) return "ต่ำ";
    if (v <= 25) return "ปานกลาง";
    if (v <= 45) return "สูง";
    return "สูงมาก";
  }
  if (type === "K") {
    if (v < 31) return "ต่ำมาก";
    if (v <= 60) return "ต่ำ";
    if (v <= 90) return "ปานกลาง";
    if (v <= 120) return "สูง";
    return "สูงมาก";
  }
  return "";
}

function formatNPercent(value) {
  const v = Number(value ?? 0);
  return (v / 10000).toFixed(4);
}
