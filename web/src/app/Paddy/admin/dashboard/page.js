"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Sprout,
  Wifi,
  Bug,
  Target,
  Search,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

// Layout Components
import {
  AdminSidebar,
  AdminHeader,
} from "../../../components/admin/AdminLayout";
import Footer from "@/app/components/Footer";

// Local Components
import { StatCard, ConnectionCard, FarmAccordion } from "./components";

// Hooks & Utils
import { useFarmSocket } from "./hooks/useFarmSocket";
import { transformApiFarms } from "./utils/transformApiFarms";
import { apiFetch } from "../../../../lib/api";

// Constants
const PIE_COLORS = ["#10b981", "#ef4444"];

/**
 * Farm Dashboard Page
 * Admin dashboard for monitoring all farms in the system
 */
export default function FarmDashboard() {
  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedFarmId, setExpandedFarmId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRisks, setExpandedRisks] = useState([]);

  // Data State
  const [farmData, setFarmData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch farms data
  const fetchFarms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch("/api/data/admin/analysis");
      // apiFetch returns { ok, status, data } where data is the API response
      // API response is { ok: true, data: [...farms...] }
      const apiData = response?.data;
      console.log("Fetched farm data:", apiData);
      const farms = apiData?.data || apiData?.farms || apiData || [];
      setFarmData(transformApiFarms(farms));
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to fetch farm data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchFarms();
  }, [fetchFarms]);

  // WebSocket connection with status tracking
  const { isConnected, connectionError, reconnect, dataSource, lastSocketUpdate, refreshFromDB } = useFarmSocket(setFarmData);

  // Computed statistics
  const stats = useMemo(() => {
    const totalFarms = farmData.length;
    const totalAreas = farmData.reduce(
      (acc, farm) => acc + (farm.areas?.length || 0),
      0
    );
    const warningDiseases = farmData.reduce((acc, farm) =>
      acc +
      (farm.areas?.filter((a) => {
        const diseaseName = a.latest_disease?.disease_name || a.disease?.name || "";
        return a.disease.status === "warning" && diseaseName !== "ใบข้าวที่ดี";
      }).length || 0),
      0
    );
    const onlineFarms = farmData.filter((f) => f.status === "Online").length;

    return {
      totalFarms,
      totalAreas,
      warningDiseases,
      onlineFarms,
      offlineFarms: totalFarms - onlineFarms,
    };
  }, [farmData]);

  // Chart data
  const statusData = useMemo(
    () => [
      { name: "Online", value: stats.onlineFarms },
      { name: "Offline", value: stats.offlineFarms },
    ],
    [stats]
  );

  // Filtered farms
  const filteredFarms = useMemo(
    () =>
      farmData.filter(
        (farm) =>
          (farm.farm_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (farm.location || "").toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [farmData, searchTerm]
  );

  // Loading state
  if (loading) {
    return <LoadingScreen />;
  }

  // No data state
  // if (!loading && farmData.length === 0) {
  //   return <WaitingForDataScreen onRetry={fetchFarms} />;
  // }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-600 overflow-hidden">
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeMenu="dashboard"
      />

      <div className="flex flex-1 flex-col relative z-0">
        <AdminHeader setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4 md:p-12">
          {/* Header with Connection Status */}
          <PageHeader isConnected={isConnected} />

          {/* Socket Error Alert */}
          {connectionError && (
            <SocketErrorAlert error={connectionError} onReconnect={reconnect} />
          )}

          {/* Error Alert */}
          {error && <ErrorAlert error={error} onRetry={fetchFarms} />}

          {/* Summary Cards */}
          <SummaryCards 
            stats={stats} 
            dataSource={dataSource}
            lastUpdate={lastSocketUpdate}
            onRefresh={refreshFromDB}
          />

          {/* Charts Section */}
          <ChartsSection
            statusData={statusData}
            farmData={farmData}
            expandedRisks={expandedRisks}
            setExpandedRisks={setExpandedRisks}
          />

          {/* Farm List */}
          <FarmList
            farms={filteredFarms}
            expandedFarmId={expandedFarmId}
            onToggle={(farmId) =>
              setExpandedFarmId(expandedFarmId === farmId ? null : farmId)
            }
          />
        </main>

        <Footer />
      </div>
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

/**
 * Loading Screen
 */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
      <p className="text-slate-500 font-bold animate-pulse">
        กำลังโหลดข้อมูลฟาร์ม...
      </p>
    </div>
  );
}

/**
 * Waiting For Data Screen
 */
function WaitingForDataScreen({ onRetry }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="bg-white rounded-3xl p-12 shadow-lg border border-slate-100 text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 bg-amber-50 rounded-full flex items-center justify-center">
          <Wifi className="w-10 h-10 text-amber-500 animate-pulse" />
        </div>
        <h2 className="text-xl font-black text-slate-800 mb-2">กำลังรอข้อมูล...</h2>
        <p className="text-slate-500 text-sm mb-6">
          ยังไม่มีข้อมูลฟาร์มในระบบ หรือกำลังรอการเชื่อมต่อ
        </p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-600 transition-colors"
        >
          <Loader2 size={16} />
          ลองใหม่อีกครั้ง
        </button>
      </div>
    </div>
  );
}

/**
 * Page Header with Connection Status
 */
function PageHeader({ isConnected }) {
  return (
    <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
          <LayoutDashboard className="text-emerald-600" size={32} />
          แผงควบคุมภาพรวม
        </h1>
        <p className="text-slate-500 mt-1">
          ติดตามสถานะการเจริญเติบโตและระบบเซนเซอร์แบบ Real-time
        </p>
      </div>
      {/* Connection Status Indicator */}
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
        isConnected 
          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
          : 'bg-amber-50 text-amber-600 border border-amber-200'
      }`}>
        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
        {isConnected ? 'เชื่อมต่อ Real-time' : 'กำลังเชื่อมต่อ...'}
      </div>
    </header>
  );
}

/**
 * Socket Error Alert
 */
function SocketErrorAlert({ error, onReconnect }) {
  return (
    <div className="mb-4 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Wifi size={18} className="text-amber-500" />
        <div className="text-sm font-bold">การเชื่อมต่อ Real-time: {error}</div>
      </div>
      <button
        onClick={onReconnect}
        className="ml-4 bg-amber-500 text-white px-3 py-1 rounded hover:bg-amber-600 transition-colors text-sm font-bold"
      >
        เชื่อมต่อใหม่
      </button>
    </div>
  );
}

/**
 * Error Alert
 */
function ErrorAlert({ error, onRetry }) {
  return (
    <div className="mb-4 p-4 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 flex items-center justify-between">
      <div className="text-sm font-bold">ไม่สามารถโหลดข้อมูล: {error}</div>
      <button
        onClick={onRetry}
        className="ml-4 bg-rose-600 text-white px-3 py-1 rounded"
      >
        ลองใหม่
      </button>
    </div>
  );
}

/**
 * Summary Cards Grid
 */
function SummaryCards({ stats, dataSource, lastUpdate, onRefresh }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="ฟาร์มทั้งหมด"
        value={stats.totalFarms}
        icon={<Sprout />}
        unit="ฟาร์ม"
        color="text-emerald-600"
      />
      <StatCard
        title="พื้นที่ดูแล"
        value={stats.totalAreas}
        icon={<Target />}
        unit="แปลง"
        color="text-blue-600"
      />
      <StatCard
        title="ความเสี่ยงโรค"
        value={stats.warningDiseases}
        icon={<Bug />}
        unit="จุด"
        color="text-rose-500"
        isAlert={stats.warningDiseases > 0}
      />
      <ConnectionCard
        onlineCount={stats.onlineFarms}
        offlineCount={stats.offlineFarms}
        icon={<Wifi size={28} />}
        dataSource={dataSource}
        lastUpdate={lastUpdate}
        onRefresh={onRefresh}
      />
    </div>
  );
}

/**
 * Charts Section
 */
function ChartsSection({ statusData, farmData, expandedRisks, setExpandedRisks }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
      {/* Device Status Pie Chart */}
      <DeviceStatusChart statusData={statusData} />

      {/* Risk Areas List */}
      <RiskAreasList
        farmData={farmData}
        expandedRisks={expandedRisks}
        setExpandedRisks={setExpandedRisks}
      />
    </div>
  );
}

/**
 * Device Status Pie Chart
 */
function DeviceStatusChart({ statusData }) {
  return (
    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
      <h3 className="text-sm font-black text-slate-700 uppercase mb-6 flex items-center gap-2">
        <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
        สถานะอุปกรณ์
      </h3>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={8}
              dataKey="value"
            >
              {statusData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i]} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "16px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div> เชื่อมต่อ
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <div className="w-3 h-3 rounded-full bg-rose-500"></div> ขาดการติดต่อ
        </div>
      </div>
    </div>
  );
}

/**
 * Risk Areas List
 */
function RiskAreasList({ farmData, expandedRisks, setExpandedRisks }) {

  
  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
      <h3 className="text-sm font-black text-slate-700 uppercase mb-4 flex items-center gap-2">
        <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
        พื้นที่เสี่ยงในแต่ละฟาร์ม (ระดับน้ำ & โรค) 
      </h3>
      <div className="text-xs text-slate-500 mb-3">ค่าตั้งต้น: </div>
      <div className="max-h-[250px] overflow-y-auto space-y-3">
        {farmData.map((farm, index) => (
          <RiskFarmItem
            key={farm.farm_id || `farm-${index}`}
            farm={farm}
            isExpanded={expandedRisks.includes(farm.farm_id)}
            onToggle={() =>
              setExpandedRisks((prev) =>
                prev.includes(farm.farm_id)
                  ? prev.filter((id) => id !== farm.farm_id)
                  : [...prev, farm.farm_id]
              )
            }
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Risk Farm Item
 */
function RiskFarmItem({ farm, isExpanded, onToggle }) {

  console.log("Evaluating risk for farm:", farm);
  
  // Collect all thresholds from all areas
  const allThresholds = (farm.areas || [])
    .map(a => {
      // Priority: use thresholds from area, then from farm settings
      if (a.thresholds && (a.thresholds.min != null || a.thresholds.max != null)) {
        return a.thresholds;
      }
      // Fallback to farm-level settings
      return {
        min: farm.latest_setting?.water_level_min,
        max: farm.latest_setting?.water_level_max,
      };
    })
    .filter(t => t && (t.min != null || t.max != null));

  // Calculate min and max from all areas
  let minW = null;
  let maxW = null;

  if (allThresholds.length > 0) {
    const mins = allThresholds.map(t => t.min).filter(v => v != null);
    const maxs = allThresholds.map(t => t.max).filter(v => v != null);
    
    if (mins.length > 0) minW = Math.min(...mins);
    if (maxs.length > 0) maxW = Math.max(...maxs);
  }
  
  // Fallback to defaults if still no value
  if (minW === null) minW = farm.latest_setting?.water_level_min ?? 5;
  if (maxW === null) maxW = farm.latest_setting?.water_level_max ?? 15;

  const reasons = [];

  (farm.areas || []).forEach((area) => {
    const code = String(area.device_code ?? "").trim().toUpperCase();
    if (!code || code === "N/A" || code === "NA") return;

    // Disease check (ไม่นับใบข้าวที่ดีเป็นจุดเสี่ยง)
    const diseaseName = area.latest_disease?.disease_name || area.disease?.name || "";
    const isGoodLeaf = diseaseName === "ใบข้าวที่ดี";
    if ((area.latest_disease || area.disease?.status === "warning") && !isGoodLeaf) {
      const name = diseaseName || "ความเสี่ยงโรค";
      reasons.push({ type: "disease", text: `${area.area_name}: พบโรค ${name}` });
    }

    // Water level check (ใช้ min/max ของแต่ละ area)
    const waterLevel = area.sensor?.water_level;
    const min = area.thresholds?.min;
    const max = area.thresholds?.max;
    if (
      waterLevel != null &&
      min != null &&
      max != null &&
      (waterLevel > max || waterLevel < min)
    ) {
      const type = waterLevel > max ? "water-high" : "water-low";
      const direction = type === "water-high" ? "สูงกว่า" : "ต่ำกว่า";
      reasons.push({
        type,
        text: `${area.area_name}: ระดับน้ำ ${waterLevel}cm (${direction}เกณฑ์)`,
      });
    }
  });

  const riskCount = reasons.length;
  const displayedReasons = isExpanded ? reasons : reasons.slice(0, 3);

  return (
    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-bold text-slate-800 truncate">{farm.farm_name}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            พื้นที่เสี่ยง:{" "}
            <span className="font-black text-rose-500">{riskCount}</span>
          </div>

          {reasons.length > 0 && (
            <div className="mt-2">
              <ul className="text-[12px] text-slate-600 space-y-1">
                {displayedReasons.map((r, i) => (
                  <li key={i} className="truncate flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        r.type === "disease"
                          ? "bg-rose-100 text-rose-600"
                          : r.type === "water-high"
                            ? "bg-orange-100 text-orange-600"
                            : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {r.type === "disease"
                        ? "โรค"
                        : r.type === "water-high"
                          ? "น้ำ-สูง"
                          : "น้ำ-ต่ำ"}
                    </span>
                    <span className="truncate">{r.text}</span>
                  </li>
                ))}
              </ul>
              {reasons.length > 3 && (
                <div className="mt-1">
                  <button
                    onClick={onToggle}
                    className="text-xs text-emerald-600 hover:underline"
                  >
                    {isExpanded ? "ย่อ" : `ดูทั้งหมด (${reasons.length})`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-right text-[11px] text-slate-500">
          <div>
            W max:{" "}
            <span className="font-bold text-slate-700">
              {maxW !== null ? maxW : '-'}
            </span>
          </div>
          <div>
            W min:{" "}
            <span className="font-bold text-slate-700">
              {minW !== null ? minW : '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Farm List Section
 */
function FarmList({ farms, expandedFarmId, onToggle }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-black text-slate-800">
          รายชื่อฟาร์มในระบบ ({farms.length})
        </h2>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full italic">
          อัปเดตล่าสุด: เมื่อสักครู่
        </span>
      </div>

      {farms.length > 0 ? (
        farms.map((farm, index) => (
          <FarmAccordion
            key={farm.farm_id || `farm-list-${index}`}
            farm={farm}
            isExpanded={expandedFarmId === farm.farm_id}
            onToggle={() => onToggle(farm.farm_id)}
          />
        ))
      ) : (
        <EmptyFarmMessage />
      )}
    </section>
  );
}

/**
 * Empty Farm Message
 */
function EmptyFarmMessage() {
  return (
    <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-200">
      <Search size={48} className="mx-auto text-slate-300 mb-4" />
      <p className="text-slate-500 font-bold">ไม่พบข้อมูลฟาร์มที่ค้นหา</p>
    </div>
  );
}
