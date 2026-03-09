"use client";
import { Sprout, MapPin, ChevronDown } from "lucide-react";
import { WaterTankCard } from "./WaterTankCard";
import { NPKGrid } from "./NPKGrid";
import { DiseaseCard } from "./DiseaseCard";

/**
 * Farm Accordion Component
 * Expandable card showing farm details with area information
 */
export function FarmAccordion({ farm, isExpanded, onToggle }) {
  return (
    <div
      className={`mb-4 overflow-hidden transition-all duration-400 ${
        isExpanded
          ? "bg-white rounded-[1.5rem] shadow-lg border border-slate-200"
          : "bg-white/80 rounded-xl border border-slate-200 shadow-sm hover:shadow-md"
      }`}
    >
      {/* Header - Farm Summary */}
      <FarmHeader farm={farm} isExpanded={isExpanded} onToggle={onToggle} />

      {/* Content - Areas */}
      <div
        className={`transition-all duration-500 ${
          isExpanded ? "max-h-[2500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-6 md:p-6 pt-0 space-y-6">
          {farm.areas.map((area) => (
            <AreaCard key={area.area_id} area={area} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Farm Header Component
 */
function FarmHeader({ farm, isExpanded, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-3 md:p-4 outline-none"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
            isExpanded
              ? "bg-emerald-500 text-white"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          <Sprout size={24} />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-lg text-slate-800 tracking-tight">
              {farm.farm_name}
            </h4>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">
              {farm.areas?.length || 0} แปลง
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin size={12} /> {farm.location}
            </span>
            <span
              className={`text-[10px] font-bold ${
                farm.status === "Online" ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              ● {farm.status}
            </span>
          </div>
        </div>
      </div>
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
          isExpanded
            ? "bg-slate-800 text-white rotate-180"
            : "bg-slate-50 text-slate-400"
        }`}
      >
        <ChevronDown size={18} />
      </div>
    </button>
  );
}

/**
 * Area Card Component
 */
function AreaCard({ area }) {
  const isDeviceRegistered =
    area.device_code && String(area.device_code).toUpperCase() !== "N/A";

  return (
    <div className="pt-4 border-t border-slate-50">
      {/* Area Sub-header */}
      <AreaHeader area={area} />

      {/* Area Content */}
      {!isDeviceRegistered ? (
        <UnregisteredAreaMessage />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <WaterTankCard area={area} />
          <NPKGrid sensor={area.sensor} />
          <DiseaseCard area={area} />
        </div>
      )}
    </div>
  );
}

/**
 * Area Header Component
 */
function AreaHeader({ area }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
        <h5 className="font-bold text-slate-800 text-base">{area.area_name}</h5>
        <span className="text-[10px] text-slate-400 font-mono">
          #{area.device_code}
        </span>
      </div>
      {area.latest_growth && (
        <span className="text-[14px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
          {area.latest_growth.growth_stage || area.latest_growth.stage}
        </span>
      )}
    </div>
  );
}

/**
 * Unregistered Area Message
 */
function UnregisteredAreaMessage() {
  return (
    <div className="p-6 bg-slate-50/60 rounded-2xl border border-slate-100 text-center">
      <div className="text-sm font-bold text-slate-700">
        พื้นที่นี้ยังไม่มีการลงทะเบียนเชื่อมต่อกับอุปกรณ์ IoT
      </div>
      <div className="text-xs text-slate-400 mt-2">
        โปรดลงทะเบียนอุปกรณ์เพื่อรับข้อมูลเรียลไทม์
      </div>
    </div>
  );
}
