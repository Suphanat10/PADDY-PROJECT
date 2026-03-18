"use client";
import { Sprout, Droplets, Zap, Thermometer, Loader2 } from "lucide-react";

/**
 * NPK Grid Component
 * Displays NPK and moisture sensor readings
 */
export function NPKGrid({ sensor }) {
  // คำนวณระดับปุ๋ยจากค่าที่ได้จากเซ็นเซอร์
  const n_mgkg = Number(sensor?.n ?? 0);
  const p_mgkg = Number(sensor?.p ?? 0);
  const k_mgkg = Number(sensor?.k ?? 0);
  const calculatedOM = n_mgkg / 500;
  const omLevel = calculatedOM < 1.0 ? "ต่ำ" : calculatedOM <= 2.0 ? "ปานกลาง" : "สูง";
  const pLevel = p_mgkg < 5 ? "ต่ำ" : p_mgkg <= 10 ? "ปานกลาง" : "สูง";
  const kLevel = k_mgkg < 60 ? "ต่ำ" : k_mgkg <= 80 ? "ปานกลาง" : "สูง";

  const items = [
    {
      label: "ไนโตรเจน (N)",
      value: sensor.n,
      color: "emerald",
      icon: <Sprout size={16} />,
      levelLabel: `OM: ${omLevel}`,
    },
    {
      label: "ฟอสฟอรัส (P)",
      value: sensor.p,
      color: "orange",
      icon: <Droplets size={16} />,
      levelLabel: pLevel,
    },
    {
      label: "โพแทสเซียม (K)",
      value: sensor.k,
      color: "purple",
      icon: <Zap size={16} />,
      levelLabel: kLevel,
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
      {/* แสดงระดับปุ๋ย หากมี */}
      {hasData && label.includes("ไนโตรเจน") && (
        <div className="mt-2 text-right">
          <span className="text-xs font-bold text-emerald-600">ระดับ: {sensorLevelLabel(value, 'N')}</span>
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
  if (type === 'N') {
    const om = v / 500;
    const omLevel = om < 1.0 ? 'ต่ำ' : om <= 2.0 ? 'ปานกลาง' : 'สูง';
    return `OM: ${omLevel}`;
  }
  if (type === 'P') {
    return v < 5 ? 'ต่ำ' : v <= 10 ? 'ปานกลาง' : 'สูง';
  }
  if (type === 'K') {
    return v < 60 ? 'ต่ำ' : v <= 80 ? 'ปานกลาง' : 'สูง';
  }
  return '';
}
