"use client";
import { Loader2 } from "lucide-react";

/**
 * Water Tank Card Component
 * Displays real-time water level with thresholds
 */
export function WaterTankCard({ area }) {
  const waterLevel = area.sensor?.water_level ?? 0;
  const minThreshold = area.latest_setting?.water_level_min ?? area.thresholds?.min ?? 5;
  const maxThreshold = area.latest_setting?.water_level_max ?? area.thresholds?.max ?? 15;
  const maxScale = Math.max(maxThreshold, 25);
  
  // Check if we have actual water level data
  const hasData = area.sensor?.water_level !== null && 
                  area.sensor?.water_level !== undefined && 
                  area.sensor?.water_level !== 0;

  // Calculate water status
  let waterStatus = "normal";
  let statusText = "ปกติ";
  let statusBg = "bg-emerald-100 text-emerald-600";
  let barColor = "from-sky-500 to-sky-400";

  if (waterLevel < minThreshold) {
    waterStatus = "low";
    statusText = "ต่ำกว่าเกณฑ์";
    statusBg = "bg-rose-100 text-rose-600";
    barColor = "from-rose-400 to-rose-300";
  } else if (waterLevel > maxThreshold) {
    waterStatus = "high";
    statusText = "สูงกว่าเกณฑ์";
    statusBg = "bg-amber-100 text-amber-600";
    barColor = "from-amber-400 to-amber-300";
  }

  // Show waiting state if no data
  if (!hasData) {
    return (
      <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col">
        <div className="w-full flex justify-between items-center mb-3">
          <span className="font-bold text-sky-500">ระดับน้ำ (Live)</span>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-bold text-amber-500 uppercase">รอ</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-slate-300 animate-spin mb-3" />
          <span className="text-sm font-bold text-slate-400">กำลังรอข้อมูล...</span>
          <span className="text-[10px] text-slate-300 mt-1">รอการส่งข้อมูลจากอุปกรณ์</span>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col">
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-3">
        <span className="font-bold text-sky-500">ระดับน้ำ (Live)</span>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-bold text-rose-500 uppercase">
            Live
          </span>
        </div>
      </div>

      {/* Tank Container */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          <div className="relative w-24 h-32 border-4 border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
            {/* Water Fill */}
            <div
              className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out bg-gradient-to-t ${barColor}`}
              style={{
                height: `${Math.min((waterLevel / maxScale) * 100, 100)}%`,
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/40" />
            </div>

            {/* MAX Threshold Line */}
            <div
              className="absolute w-full z-10"
              style={{ bottom: `${(maxThreshold / maxScale) * 100}%` }}
            >
              <div className="w-full border-t-2 border-dashed border-amber-500" />
            </div>

            {/* MIN Threshold Line */}
            <div
              className="absolute w-full z-10"
              style={{ bottom: `${(minThreshold / maxScale) * 100}%` }}
            >
              <div className="w-full border-t-2 border-dashed border-rose-500" />
            </div>

            {/* Current Level Line */}
            <div
              className="absolute w-full z-20 transition-all duration-1000"
              style={{
                bottom: `${Math.min((waterLevel / maxScale) * 100, 100)}%`,
              }}
            >
              <div className="w-full border-t-[3px] border-rose-500" />
            </div>
          </div>

          {/* Labels */}
          <div
            className="absolute -right-10 text-[9px] font-bold text-amber-600 transition-all"
            style={{
              bottom: `calc(${(maxThreshold / maxScale) * 100}% - 6px)`,
            }}
          >
            MAX
          </div>
          <div
            className="absolute -right-10 text-[9px] font-bold text-rose-600 transition-all"
            style={{
              bottom: `calc(${(minThreshold / maxScale) * 100}% - 6px)`,
            }}
          >
            MIN
          </div>
        </div>
      </div>

      {/* Status Text */}
      <div className="text-center mt-3">
        <div className="text-xl font-black text-slate-800">
          {waterLevel} <span className="text-xs text-slate-400">ซม.</span>
        </div>
        <div
          className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBg}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              waterStatus === "low"
                ? "bg-rose-500"
                : waterStatus === "high"
                  ? "bg-amber-500"
                  : "bg-emerald-500"
            }`}
          />
          {statusText}
        </div>
        <div className="text-[9px] text-slate-400 mt-1">
          เกณฑ์: {minThreshold} - {maxThreshold} ซม.
        </div>
      </div>
    </div>
  );
}
