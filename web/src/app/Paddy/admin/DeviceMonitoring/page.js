"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Smartphone,
  Users,
  Tractor,
  Map as MapIcon,
  Wifi,
  WifiOff,
  Search,
  Activity,
  Zap,
  TrendingUp,
  Clock,
  Server,
  ChevronRight,
  Building2,
  MapPin,
  Loader2,
  RefreshCw,
  Eye,
} from "lucide-react";

import { AdminSidebar, AdminHeader } from "../../../components/admin/AdminLayout";
import { apiFetch } from "@/lib/api";
import Footer from "@/app/components/Footer";
import { useDeviceWebSocket } from "@/lib/dashboard/useDeviceWebSocket";

// ===================== COMPONENTS =====================

// Hero Stats - การ์ดสถิติหลักด้านบน
const HeroStat = ({ icon: Icon, label, value, subLabel, color = "emerald" }) => {
  const themes = {
    emerald: {
      bg: "bg-white",
      iconBg: "bg-emerald-500",
      iconRing: "ring-emerald-100",
      accent: "text-emerald-600",
      badge: "bg-emerald-50 text-emerald-600",
      border: "border-emerald-100 hover:border-emerald-200",
      glow: "group-hover:shadow-emerald-200/40",
    },
    blue: {
      bg: "bg-white",
      iconBg: "bg-blue-500",
      iconRing: "ring-blue-100",
      accent: "text-blue-600",
      badge: "bg-blue-50 text-blue-600",
      border: "border-blue-100 hover:border-blue-200",
      glow: "group-hover:shadow-blue-200/40",
    },
    amber: {
      bg: "bg-white",
      iconBg: "bg-amber-500",
      iconRing: "ring-amber-100",
      accent: "text-amber-600",
      badge: "bg-amber-50 text-amber-600",
      border: "border-amber-100 hover:border-amber-200",
      glow: "group-hover:shadow-amber-200/40",
    },
    violet: {
      bg: "bg-white",
      iconBg: "bg-violet-500",
      iconRing: "ring-violet-100",
      accent: "text-violet-600",
      badge: "bg-violet-50 text-violet-600",
      border: "border-violet-100 hover:border-violet-200",
      glow: "group-hover:shadow-violet-200/40",
    },
  };

  const theme = themes[color] || themes.emerald;

  return (
    <div className={`group relative ${theme.bg} rounded-2xl p-5 border-2 ${theme.border} shadow-sm hover:shadow-xl ${theme.glow} transition-all duration-300 hover:-translate-y-1`}>
      {/* Top section with icon and label */}
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${theme.iconBg} rounded-xl shadow-lg ring-4 ${theme.iconRing}`}>
          <Icon size={22} className="text-white" />
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${theme.badge} uppercase tracking-wider`}>
          {label}
        </span>
      </div>

      {/* Value */}
      <div className="mb-2">
        <span className={`text-5xl font-black ${theme.accent} tracking-tight`}>{value ?? 0}</span>
      </div>

      {/* SubLabel */}
      {subLabel && (
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <span className={`w-2 h-2 rounded-full ${theme.iconBg}`}></span>
          {subLabel}
        </div>
      )}

      {/* Decorative corner */}
      <div className={`absolute bottom-0 right-0 w-20 h-20 ${theme.iconBg} opacity-5 rounded-tl-full`}></div>
    </div>
  );
};

// Mini Stats - การ์ดสถิติเล็กๆ
const MiniStat = ({ icon: Icon, label, value, trend, color = "slate" }) => {
  const iconColors = {
    slate: "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600",
    green: "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600",
    red: "bg-gradient-to-br from-red-100 to-red-200 text-red-600",
    amber: "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600",
  };

  const borderColors = {
    slate: "hover:border-slate-300",
    green: "hover:border-emerald-300",
    red: "hover:border-red-300",
    amber: "hover:border-amber-300",
  };

  return (
    <div className={`bg-white rounded-2xl p-5 border-2 border-slate-100 ${borderColors[color]} hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-xl ${iconColors[color]} shadow-sm`}>
          <Icon size={20} />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="text-3xl font-black text-slate-800 tracking-tight">{value ?? 0}</div>
        <div className="text-xs text-slate-500 font-semibold mt-1 uppercase tracking-wide">{label}</div>
      </div>
    </div>
  );
};

// Device Card - การ์ดอุปกรณ์แบบใหม่
const DeviceCard = ({ device }) => {
  const isOnline = device.status === "online";
  const isSending = device.is_sending;

  return (
    <div className={`group relative bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden hover:-translate-y-1 ${
      isOnline 
        ? isSending 
          ? "border-amber-300 shadow-xl shadow-amber-100/60 hover:shadow-amber-200/80" 
          : "border-emerald-300 shadow-lg shadow-emerald-100/50 hover:shadow-emerald-200/70"
        : "border-slate-200 shadow-md hover:border-slate-300 hover:shadow-lg"
    }`}>
      {/* Status Bar */}
      <div className={`h-2 ${
        isOnline 
          ? isSending 
            ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 animate-pulse' 
            : 'bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400'
          : 'bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200'
      }`} />
      
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`relative p-3.5 rounded-xl shadow-inner ${
              isOnline 
                ? isSending 
                  ? "bg-gradient-to-br from-amber-100 to-orange-100" 
                  : "bg-gradient-to-br from-emerald-100 to-green-100"
                : "bg-gradient-to-br from-slate-100 to-slate-200"
            }`}>
              <Server size={24} className={
                isOnline 
                  ? isSending ? "text-amber-600" : "text-emerald-600"
                  : "text-slate-400"
              } />
              {isOnline && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSending ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-white ${isSending ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                </span>
              )}
            </div>
            <div>
              <h4 className="font-black text-slate-800 text-lg tracking-tight">{device.device_code}</h4>
              <div className="flex items-center gap-1.5 mt-1">
                {isOnline ? (
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                    isSending 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isSending ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                    {isSending ? 'กำลังส่งข้อมูล' : 'พร้อมใช้งาน'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    ออฟไลน์
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="space-y-2 mb-4 bg-slate-50/70 rounded-xl p-3">
          <div className="flex items-center gap-2.5 text-sm">
            <div className="p-1.5 bg-white rounded-lg shadow-sm">
              <Building2 size={14} className="text-emerald-500" />
            </div>
            <span className="text-slate-700 font-medium truncate">
              {device.farm?.farm_name || <span className="text-slate-400 italic font-normal">ยังไม่ลงทะเบียนฟาร์ม</span>}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <div className="p-1.5 bg-white rounded-lg shadow-sm">
              <MapPin size={14} className="text-orange-500" />
            </div>
            <span className="text-slate-700 font-medium truncate">
              {device.area?.area_name || <span className="text-slate-400 italic font-normal">ยังไม่ระบุพื้นที่</span>}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Clock size={12} />
            <span>{isOnline ? 'เชื่อมต่ออยู่' : 'ขาดการเชื่อมต่อ'}</span>
          </div>
          {isSending && (
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-full animate-pulse">
              <Zap size={12} fill="currentColor" />
              <span>LIVE</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ===================== MAIN COMPONENT =====================

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, online, offline, sending
  const [devices, setDevices] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const res = await apiFetch("/api/admin/get_dashboard_overview", { method: "GET" });
    if (res.ok) {
      const data = res.data?.data || res.data;
      setDevices(data.devices || []);
      setSummary(data.summary || {});
      setLastUpdate(new Date());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deviceCodes = useMemo(() => devices.map((d) => d.device_code), [devices]);

  useDeviceWebSocket({
    deviceIds: deviceCodes,
    onStatus: (deviceCode, status) => {
      setDevices((prev) =>
        prev.map((d) =>
          d.device_code === deviceCode
            ? { ...d, status, is_sending: status === "online" ? d.is_sending : false }
            : d
        )
      );
    },
  });

  // Stats calculations
  const stats = useMemo(() => ({
    total: devices.length,
    online: devices.filter((d) => d.status === "online").length,
    offline: devices.filter((d) => d.status !== "online").length,
    sending: devices.filter((d) => d.status === "online" && d.is_sending).length,
  }), [devices]);

  // Filtered devices
  const filteredDevices = useMemo(() => {
    return devices
      .filter((d) => d.device_code.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((d) => {
        if (statusFilter === "all") return true;
        if (statusFilter === "online") return d.status === "online";
        if (statusFilter === "offline") return d.status !== "online";
        if (statusFilter === "sending") return d.status === "online" && d.is_sending;
        return true;
      });
  }, [devices, searchTerm, statusFilter]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="DeviceMonitoring" />

      <div className="flex flex-1 flex-col relative">
        <AdminHeader setSidebarOpen={setSidebarOpen} />

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-emerald-600" size={48} />
              <span className="text-slate-600 font-medium">กำลังโหลดข้อมูล...</span>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                 Device Monitoring (การติดตามอุปกรณ์)
                </h1>
                <p className="text-slate-500 mt-1 flex items-center gap-2">
                  <Activity size={16} className="text-emerald-500" />
                  ติดตามสถานะอุปกรณ์และข้อมูลฟาร์มแบบเรียลไทม์
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {lastUpdate && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    อัปเดตล่าสุด: {lastUpdate.toLocaleTimeString('th-TH')}
                  </span>
                )}
                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                  รีเฟรช
                </button>
              </div>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <HeroStat
                icon={Smartphone}
                label="อุปกรณ์ทั้งหมด"
                value={summary.total_devices}
                subLabel="ในระบบทั้งหมด"
                color="blue"
              />
              <HeroStat
                icon={Wifi}
                label="ออนไลน์"
                value={stats.online}
                subLabel={`${stats.total > 0 ? Math.round((stats.online / stats.total) * 100) : 0}% ของทั้งหมด`}
                color="emerald"
              />
              <HeroStat
                icon={Zap}
                label="กำลังส่งข้อมูล"
                value={stats.sending}
                subLabel="Active streaming"
                color="amber"
              />
              <HeroStat
                icon={Users}
                label="ผู้ใช้งานระบบ"
                value={summary.agriculture_users}
                subLabel="เกษตรกรทั้งหมด"
                color="violet"
              />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MiniStat icon={Tractor} label="จำนวนฟาร์ม" value={summary.total_farms} color="green" />
              <MiniStat icon={MapIcon} label="พื้นที่ย่อย" value={summary.total_areas} color="slate" />
              <MiniStat icon={WifiOff} label="ออฟไลน์" value={stats.offline} color="red" />
              <MiniStat icon={TrendingUp} label="อัตราออนไลน์" value={`${stats.total > 0 ? Math.round((stats.online / stats.total) * 100) : 0}%`} color="amber" />
            </div>

            {/* Devices Section */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Section Header */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 rounded-xl">
                      <Server size={22} className="text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">สถานะอุปกรณ์ IoT</h2>
                      <p className="text-sm text-slate-500">
                        แสดง {filteredDevices.length} จาก {devices.length} อุปกรณ์
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Status Filter */}
                    <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                      {[
                        { key: "all", label: "ทั้งหมด", count: devices.length },
                        { key: "online", label: "ออนไลน์", count: stats.online },
                        { key: "sending", label: "กำลังส่ง", count: stats.sending },
                        { key: "offline", label: "ออฟไลน์", count: stats.offline },
                      ].map(({ key, label, count }) => (
                        <button
                          key={key}
                          onClick={() => setStatusFilter(key)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            statusFilter === key
                              ? "bg-white text-slate-800 shadow-sm"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          {label} ({count})
                        </button>
                      ))}
                    </div>

                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        placeholder="ค้นหาอุปกรณ์..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Devices Grid */}
              <div className="p-6">
                {filteredDevices.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredDevices.map((device) => (
                      <DeviceCard key={device.device_code} device={device} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                      <Search className="text-slate-400" size={28} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">ไม่พบอุปกรณ์</h3>
                    <p className="text-sm text-slate-500">
                      {searchTerm ? `ไม่พบผลลัพธ์สำหรับ "${searchTerm}"` : 'ไม่มีอุปกรณ์ในหมวดหมู่นี้'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Footer />
        </main>
      </div>
    </div>
  );
}