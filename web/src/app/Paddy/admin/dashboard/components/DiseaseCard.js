"use client";
import Link from "next/link";
import { ShieldCheck, AlertCircle, ChevronDown, Calendar, TrendingUp } from "lucide-react";

/**
 * Disease Card Component
 * Displays disease detection status with image, advice, and details
 */
export function DiseaseCard({ area }) {
  const isGoodLeaf = area.latest_disease && area.latest_disease.disease_name === "ใบข้าวที่ดี";
  const hasDisease = area.latest_disease && !isGoodLeaf;

  return (
    <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck size={18} className={isGoodLeaf || !area.latest_disease ? "text-emerald-500" : "text-rose-500"} />
        <span className="text-xs font-bold text-slate-700">การตรวจจับโรค</span>
      </div>

      {/* Status Display */}
      {area.latest_disease ? (
        <div className={`p-3 rounded-xl border ${hasDisease ? "bg-rose-50 border-rose-100" : "bg-emerald-50 border-emerald-100"}`}>
          {hasDisease ? (
            <DiseaseWarningFull disease={area.latest_disease} />
          ) : (
            <GoodLeafStatusFull disease={area.latest_disease} />
          )}
        </div>
      ) : (
        <div className="p-3 rounded-xl border bg-emerald-50 border-emerald-100">
          <HealthyStatus />
        </div>
      )}

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
 * Disease Warning Full Display with Image and Advice
 */
function DiseaseWarningFull({ disease }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    
    try {
      // Try parsing ISO format first (2026-03-28T01:55:07.000Z)
      let date = new Date(dateStr);
      
      // If it's invalid, try parsing Thai format (28/3/2569 12:33:48)
      if (isNaN(date.getTime())) {
        const parts = dateStr.split(/[\s\/:]/);  
        if (parts.length >= 5) {
          // Format: day/month/year hour:minute:second
          let day = parseInt(parts[0]);
          let month = parseInt(parts[1]) - 1; // Month is 0-indexed
          let year = parseInt(parts[2]);
          
          // Convert Thai year (2569) to Christian year (2026)
          if (year > 2500) {
            year = year - 543;
          }
          
          let hour = parseInt(parts[3]) || 0;
          let minute = parseInt(parts[4]) || 0;
          let second = parseInt(parts[5]) || 0;
          
          date = new Date(year, month, day, hour, minute, second);
        }
      }
      
      // If still invalid, return empty
      if (isNaN(date.getTime())) {
        return dateStr; // Return original string as fallback
      }
      
      return date.toLocaleString("th-TH", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.error("Date formatting error:", e);
      return dateStr; // Return original string as fallback
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle size={20} className="text-rose-500 flex-shrink-0" />
        <div>
          <div className="text-[11px] font-bold text-rose-600">พบความเสี่ยง!</div>
          <div className="text-xs font-black text-rose-700">{disease.disease_name || "ไม่ระบุโรค"}</div>
        </div>
      </div>

      {/* Image Section */}
      {disease.image_url && (
        <div className="my-2 rounded-lg overflow-hidden border border-rose-200">
          <img 
            src={disease.image_url} 
            alt={disease.disease_name} 
            className="w-full h-40 object-cover"
          />
        </div>
      )}

      {/* Confidence & Date */}
      <div className="flex items-center gap-2 text-[10px] text-rose-600 mb-2">
        {disease.confidence != null && (
          <span className="bg-rose-100 px-2 py-0.5 rounded-full font-bold">
            ความมั่นใจ: {(disease.confidence * 100).toFixed(1)}%
          </span>
        )}
        {disease.created_at && (
          <span className="flex items-center gap-1 bg-rose-100 px-2 py-0.5 rounded-full">
            <Calendar size={10} />
            {formatDate(disease.created_at)}
          </span>
        )}
      </div>

      {/* Advice Section */}
      {disease.advice && (
        <div className="mt-2 p-2 bg-rose-100/50 border border-rose-200 rounded-lg">
          <div className="text-[10px] font-bold text-rose-700 mb-1 flex items-center gap-1">
            <TrendingUp size={12} /> คำแนะนำ
          </div>
          <div className="text-[10px] text-rose-600 leading-relaxed whitespace-pre-wrap break-words">
            {disease.advice}
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Good Leaf Status Full Display
 */
function GoodLeafStatusFull({ disease }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    
    try {
      // Try parsing ISO format first (2026-03-28T01:55:07.000Z)
      let date = new Date(dateStr);
      
      // If it's invalid, try parsing Thai format (28/3/2569 12:33:48)
      if (isNaN(date.getTime())) {
        const parts = dateStr.split(/[\s\/:]/);  
        if (parts.length >= 5) {
          // Format: day/month/year hour:minute:second
          let day = parseInt(parts[0]);
          let month = parseInt(parts[1]) - 1; // Month is 0-indexed
          let year = parseInt(parts[2]);
          
          // Convert Thai year (2569) to Christian year (2026)
          if (year > 2500) {
            year = year - 543;
          }
          
          let hour = parseInt(parts[3]) || 0;
          let minute = parseInt(parts[4]) || 0;
          let second = parseInt(parts[5]) || 0;
          
          date = new Date(year, month, day, hour, minute, second);
        }
      }
      
      // If still invalid, return empty
      if (isNaN(date.getTime())) {
        return dateStr; // Return original string as fallback
      }
      
      return date.toLocaleString("th-TH", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.error("Date formatting error:", e);
      return dateStr; // Return original string as fallback
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck size={20} className="text-emerald-500 flex-shrink-0" />
        <div>
          <div className="text-[11px] font-bold text-emerald-600">สภาพปกติ</div>
          <div className="text-xs font-black text-emerald-700">{disease.disease_name || "ใบข้าวที่ดี"}</div>
        </div>
      </div>

      {/* Image Section */}
      {disease.image_url && (
        <div className="my-2 rounded-lg overflow-hidden border border-emerald-200">
          <img 
            src={disease.image_url} 
            alt={disease.disease_name} 
            className="w-full h-40 object-cover"
          />
        </div>
      )}

      {/* Confidence & Date */}
      <div className="flex items-center gap-2 text-[10px] text-emerald-600 mb-2">
        {disease.confidence != null && (
          <span className="bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
            ความมั่นใจ: {(disease.confidence * 100).toFixed(1)}%
          </span>
        )}
        {disease.created_at && (
          <span className="flex items-center gap-1 bg-emerald-100 px-2 py-0.5 rounded-full">
            <Calendar size={10} />
            {formatDate(disease.created_at)}
          </span>
        )}
      </div>

      {/* Advice Section */}
      {disease.advice && (
        <div className="mt-2 p-2 bg-emerald-100/50 border border-emerald-200 rounded-lg">
          <div className="text-[10px] font-bold text-emerald-700 mb-1 flex items-center gap-1">
            <TrendingUp size={12} /> คำแนะนำ
          </div>
          <div className="text-[10px] text-emerald-600 leading-relaxed whitespace-pre-wrap break-words">
            {disease.advice}
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Disease Warning Display (Simple)
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
 * Good Leaf Status Display (Simple)
 */
function GoodLeafStatus({ disease }) {
  return (
    <>
      <ShieldCheck size={24} className="text-emerald-500 mb-1" />
      <div className="text-[11px] font-bold text-emerald-600">สภาพปกติ</div>
      <div className="text-xs font-black text-emerald-700">
        {disease.disease_name || "ใบข้าวที่ดี"}
      </div>
      {disease.confidence != null && (
        <div className="text-[10px] text-emerald-600 mt-1">
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
