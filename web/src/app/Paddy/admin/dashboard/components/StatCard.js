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


export function ConnectionCard({ onlineCount, offlineCount, icon, dataSource, lastUpdate, onRefresh }) {
  // Format the last update time
  const formatTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleTimeString("th-TH", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  return (
    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] text-slate-400 uppercase font-black tracking-widest">
          การเชื่อมต่อ
        </p>
        <div className="p-3 bg-slate-50 rounded-2xl text-slate-300">{icon}</div>
      </div>
      
      <div className="flex items-center gap-3 mb-4">
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
      
      {/* Data Source Indicator */}
      <div className="pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              dataSource === "socket" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`}></div>
            <span className="text-[10px] font-bold text-slate-500">
              {dataSource === "socket" ? "Real-time" : "ข้อมูลล่าสุดจาก DB"}
            </span>
          </div>
          {dataSource === "database" && onRefresh && (
            <button
              onClick={onRefresh}
              className="text-[10px] font-bold text-blue-500 hover:text-blue-700 hover:underline"
            >
              รีเฟรช
            </button>
          )}
        </div>
        {lastUpdate && (
          <p className="text-[9px] text-slate-400 mt-1">
            อัพเดตล่าสุด: {formatTime(lastUpdate)}
          </p>
        )}
      </div>
    </div>
  );
}
