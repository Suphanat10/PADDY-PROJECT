"use client";
import { Sprout, Droplets, Zap, Thermometer, Loader2 } from "lucide-react";

/**
 * NPK Grid Component
 * Displays NPK and moisture sensor readings
 */
export function NPKGrid({ sensor }) {
  const items = [
    {
      label: "อินทรียวัตถุ (N)",
      type: "N",
      value: sensor.n,
      color: "emerald",
      icon: <Sprout size={16} />,
    },
    {
      label: "ฟอสฟอรัส (P)",
      type: "P",
      value: sensor.p,
      color: "orange",
      icon: <Droplets size={16} />,
    },
    {
      label: "โพแทสเซียม (K)",
      type: "K",
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
function NPKCard({ label, type, value, color, icon }) {
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
      {hasData && (
        <div className="mt-2 text-right">
          <span className={`text-xs font-bold ${
            type === "N"
              ? "text-emerald-600"
              : type === "P"
                ? "text-orange-600"
                : "text-purple-600"
          }`}>
            ระดับ: {sensorLevelLabel(value, type)}
          </span>
          {type === "N" && (
            <div>
              <span className="text-[11px] font-semibold text-emerald-500">
              อินทรียวัตถุ (N): {formatNBy500(value)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ช่วยแปลงค่า level โดยรับ value (string/number) และ type
function sensorLevelLabel(value, type) {
  const v = Number(value ?? 0);
  if (type === "N") {
    const n_mgkg = v;
    const calculatedOM = n_mgkg / 500;
    const omLevel = calculatedOM < 1.0 ? "ต่ำ" : calculatedOM >= 1.0 && calculatedOM <= 2.0 ? "ปานกลาง" : "สูง";
    return omLevel;
  }
  if (type === "P") {
    const p_mgkg = v;
    const pLevel = p_mgkg < 5 ? "ต่ำ" : p_mgkg >= 5 && p_mgkg <= 10 ? "ปานกลาง" : "สูง";
    return pLevel;
  }
  if (type === "K") {
    const k_mgkg = v;
    const kLevel = k_mgkg < 60 ? "ต่ำ" : k_mgkg >= 60 && k_mgkg <= 80 ? "ปานกลาง" : "สูง";
    return kLevel;
  }
  return "";
}

function formatNBy500(value) {
  const v = Number(value ?? 0);
  return (v / 500).toFixed(2);
}
