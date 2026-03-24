"use client";
import {
  X,
  Sprout,
  Bug,
  ExternalLink,
  Clock,
  Loader2,
} from "lucide-react";

// Timeline Card Component
const TimelineCard = ({ 
  title, 
  icon: Icon, 
  iconBg, 
  borderColor, 
  emptyIcon: EmptyIcon,
  emptyBg,
  emptyText,
  data = [],
}) => (
  <div className={`bg-white rounded-2xl border-2 ${borderColor} overflow-hidden flex flex-col`}>
    {/* Card Header */}
    <div className="px-5 py-4 flex items-center gap-3">
      <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center`}>
        <Icon size={18} className="text-white" />
      </div>
      <h4 className="font-bold text-slate-800">{title}</h4>
    </div>

    {/* Card Content */}
    <div className="flex-1 px-5 pb-5">
      <div className={`h-48 rounded-xl ${emptyBg} border-l-4 ${borderColor.replace('border-', 'border-l-')} flex flex-col items-center justify-center`}>
        {data.length === 0 ? (
          <>
            <EmptyIcon size={48} className="text-slate-200 mb-3" />
            <p className="text-slate-400 text-sm">{emptyText}</p>
          </>
        ) : (
          <div className="w-full h-full overflow-y-auto p-4">
            {data.map((item, index) => (
              <div key={index} className="flex items-start gap-3 mb-3 last:mb-0">
                {/* ถ้า label เป็น 'ใบข้าวที่ดี' ให้ใช้สีเขียว */}
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 ${
                    item.label === "ใบข้าวที่ดี"
                      ? "bg-emerald-500"
                      : iconBg
                  }`}
                />
                <div>
                  <p
                    className={`font-semibold text-sm ${
                      item.label === "ใบข้าวที่ดี"
                        ? "text-emerald-600"
                        : "text-slate-800"
                    }`}
                  >
                    {item.label}
                  </p>
                  {item.date && (
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock size={10} /> {item.date}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Main Timeline Modal Component
export const TimelineModal = ({
  isOpen,
  onClose,
  areaName,
  deviceCode,
  growthData = [],
  diseaseData = [],
  onViewSensor,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-8 py-6 flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                ไทม์ไลน์ทั้งหมด
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                แปลง: {areaName} ({deviceCode})
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="px-8 pb-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
                <p className="text-slate-500">กำลังโหลดข้อมูล...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Growth Timeline Card */}
                <TimelineCard
                  title="ไทม์ไลน์ระยะการเจริญเติบโต"
                  icon={Sprout}
                  iconBg="bg-emerald-500"
                  borderColor="border-emerald-200"
                  emptyIcon={Sprout}
                  emptyBg="bg-emerald-50/50"
                  emptyText="ยังไม่มีข้อมูลระยะการเจริญเติบโต"
                  data={growthData}
                />

                {/* Disease Timeline Card */}
                <TimelineCard
                  title="ไทม์ไลน์สถานะโรคข้าว"
                  icon={Bug}
                  iconBg="bg-rose-500"
                  borderColor="border-rose-200"
                  emptyIcon={Bug}
                  emptyBg="bg-rose-50/50"
                  emptyText="ยังไม่มีข้อมูลสถานะโรคข้าว"
                  data={diseaseData}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors"
            >
              ปิด
            </button>
            {onViewSensor && (
              <button
                type="button"
                onClick={onViewSensor}
                className="px-6 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-900 font-medium transition-colors flex items-center gap-2"
              >
                ดูรายละเอียดเซนเซอร์
                <ExternalLink size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineModal;
