"use client";

/**
 * Stat Card Component
 * Displays a summary statistic with icon
 */
export function StatCard({ title, value, icon, unit, color, isAlert }) {
  return (
    <div
      className={`bg-white p-6 rounded-[24px] shadow-sm border transition-all duration-300 hover:shadow-md ${
        isAlert ? "border-rose-200 bg-rose-50/20" : "border-slate-100"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
          {title}
        </p>
        <div
          className={`p-2.5 rounded-xl ${
            isAlert ? "bg-rose-100 text-rose-600" : "bg-slate-50 text-slate-400"
          }`}
        >
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-black ${color}`}>{value}</span>
        <span className="text-xs text-slate-400 font-bold">{unit}</span>
      </div>
    </div>
  );
}


export function ConnectionCard({ onlineCount, offlineCount, icon }) {
  return (
    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <p className="text-[11px] text-slate-400 uppercase font-black mb-2 tracking-widest">
          การเชื่อมต่อ
        </p>
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-emerald-500 leading-none">
              {onlineCount}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Online
            </span>
          </div>
          <div className="h-8 w-[1px] bg-slate-100"></div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-rose-400 leading-none">
              {offlineCount}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Offline
            </span>
          </div>
        </div>
      </div>
      <div className="p-3 bg-slate-50 rounded-2xl text-slate-300">{icon}</div>
    </div>
  );
}
