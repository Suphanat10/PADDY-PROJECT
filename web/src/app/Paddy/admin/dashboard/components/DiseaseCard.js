"use client";
import Link from "next/link";
import { ShieldCheck, AlertCircle, ChevronDown } from "lucide-react";

/**
 * Disease Card Component
 * Displays disease detection status and details link
 */
export function DiseaseCard({ area }) {

  // ถ้า disease_name เป็น 'ใบข้าวที่ดี' ให้ถือว่าไม่พบโรค
  const isGoodLeaf = area.latest_disease && area.latest_disease.disease_name === "ใบข้าวที่ดี";
  const hasDisease =
    area.latest_disease && !isGoodLeaf || area.disease?.status === "warning";

  return (
    <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck size={18} className="text-emerald-500" />
        <span className="text-xs font-bold text-slate-700">การตรวจจับโรค</span>
      </div>

      {/* Disease Status Card */}
      <div
        className={`p-3 rounded-xl border ${
          hasDisease
            ? "bg-rose-50 border-rose-100"
            : "bg-emerald-50 border-emerald-100"
        }`}
      >
        <div className="flex flex-col items-center text-center">
          {area.latest_disease ? (
            isGoodLeaf ? <HealthyStatus /> : <DiseaseWarning disease={area.latest_disease} />
          ) : (
            <HealthyStatus />
          )}
        </div>
      </div>

      {/* Details Link */}
      <div className="flex items-center justify-center mt-6">
        <Link
          href={`/Paddy/admin/sensor/${area?.device_code || "default"}`}
          className="inline-flex items-center gap-2 bg-slate-800 text-white px-6 py-2 rounded-xl text-[11px] font-bold hover:bg-slate-700 active:scale-95 transition-all shadow-sm"
        >
          ดูรายละเอียดเพิ่มเติม
          <ChevronDown size={14} className="-rotate-90" />
        </Link>
      </div>
    </div>
  );
}

/**
 * Disease Warning Display
 */
function DiseaseWarning({ disease }) {
  return (
    <>
      <AlertCircle size={24} className="text-rose-500 mb-1" />
      <div className="text-[11px] font-bold text-rose-600">พบความเสี่ยง!</div>
      <div className="text-xs font-black text-rose-700 uppercase">
        {disease.disease_name || "ไม่ระบุโรค"}
      </div>
      {disease.confidence != null && (
        <div className="text-[10px] text-rose-600 mt-1">
          ความมั่นใจ: {(disease.confidence * 100).toFixed(1)}%
        </div>
      )}
    </>
  );
}

/**
 * Healthy Status Display
 */
function HealthyStatus() {
  return (
    <>
      <div className="text-[11px] font-bold text-emerald-600">สภาพปกติ</div>
      <div className="text-xs font-black text-emerald-700">ไม่พบโรคพืช</div>
      <div className="text-[9px] text-emerald-500 mt-1 uppercase">
        Checked 100%
      </div>
    </>
  );
}
