
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Thermometer,
  Droplets,
  Leaf,
  CheckCircle,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  Bell,
  BarChart3,
  PieChart,
  LineChart,
  Wifi,
  WifiOff,
  User,
  Sprout,
  Activity,
  History,
  Cpu,
  FileX,
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import Header from "../../components/Header";
import { apiFetch } from "@/lib/api";
import Footer from "@/app/components/Footer";
import { useSensorWebSocket } from "@/lib/sensor/useSensorWebSocket";
import { useSensorHistory } from "@/lib/sensor/useSensorHistory";



export default function SensorDetailPage() {

const { id } = useParams();
  const { historicalData, isLoading } = useSensorHistory(id);
  const { currentData, isSocketConnected ,  } = useSensorWebSocket(id);
  const [sensorInfo, setSensorInfo] = useState(null);
  const [historyRangeMonths, setHistoryRangeMonths] = useState(1);
  const [useCustomDateRange, setUseCustomDateRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const filteredHistoricalData = useMemo(() => {
    if (!Array.isArray(historicalData) || historicalData.length === 0) return [];

    let startTs;

    if (useCustomDateRange && customStartDate) {
      const customStart = new Date(customStartDate);
      customStart.setHours(0, 0, 0, 0);
      startTs = customStart.getTime();
    } else {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - historyRangeMonths);
      startTs = startDate.getTime();
    }

    let endTs = Infinity;
    if (useCustomDateRange && customEndDate) {
      const customEnd = new Date(customEndDate);
      customEnd.setHours(23, 59, 59, 999);
      endTs = customEnd.getTime();
    }

    return historicalData.filter((item) => {
      const ts = item?.timestamp ? new Date(item.timestamp).getTime() : NaN;
      return Number.isFinite(ts) && ts >= startTs && ts <= endTs;
    });
  }, [historicalData, historyRangeMonths, useCustomDateRange, customStartDate, customEndDate]);

  

  
  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case "stable":
        return <Minus className="w-4 h-4 text-gray-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const buildExportRows = (fields) => {
    const allRows = filteredHistoricalData.map((item) => ({
      timestamp: item?.timestamp ?? "",
      time: item?.time ?? "",
      nitrogen: Number(item?.nitrogen ?? 0),
      phosphorus: Number(item?.phosphorus ?? 0),
      potassium: Number(item?.potassium ?? 0),
      waterLevel: Number(item?.waterLevel ?? 0),
      temperature: Number(item?.temperature ?? 0),
      humidity: Number(item?.humidity ?? 0),
      soilMoisture: Number(item?.soilMoisture ?? 0),
    }));

    if (!Array.isArray(fields) || fields.length === 0) {
      return allRows;
    }

    return allRows.map((row) =>
      fields.reduce((acc, key) => {
        acc[key] = row[key];
        return acc;
      }, {}),
    );
  };

  const downloadFile = (content, fileName, mimeType, addBom = false) => {
    const fileContent = addBom ? `\uFEFF${content}` : content;
    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportJson = (fileLabel = "historical", fields = []) => {
    const rows = buildExportRows(fields);
    if (rows.length === 0) {
      window.alert("ไม่มีข้อมูลย้อนหลังสำหรับส่งออก");
      return;
    }

    const dateSuffix = new Date().toISOString().slice(0, 10);
    const fileName = `sensor-${id ?? "unknown"}-${fileLabel}-${historyRangeMonths}m-${dateSuffix}.json`;
    const json = JSON.stringify(rows, null, 2);
    downloadFile(json, fileName, "application/json;charset=utf-8");
  };

  const handleExportCsv = (fileLabel = "historical", fields = []) => {
    const rows = buildExportRows(fields);
    if (rows.length === 0) {
      window.alert("ไม่มีข้อมูลย้อนหลังสำหรับส่งออก");
      return;
    }

    const headers = Object.keys(rows[0]);
    const escapeCsvValue = (value) => {
      const str = value === null || value === undefined ? "" : String(value);
      if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const lines = [
      headers.join(","),
      ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(",")),
    ];

    const dateSuffix = new Date().toISOString().slice(0, 10);
    const fileName = `sensor-${id ?? "unknown"}-${fileLabel}-${historyRangeMonths}m-${dateSuffix}.csv`;
    const csv = lines.join("\n");
    downloadFile(csv, fileName, "text/csv;charset=utf-8", true);
  };


  const WaterLevelCard = ({ data, color, bgColor }) => {
    if (!data) return null;


    const maxLevel = 30;
    const waterHeight = Math.min((data.value / maxLevel) * 100, 100);


    return (
      <div>
        <div className="p-4">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-32 border-2 border-gray-400 rounded-b-lg bg-white relative overflow-hidden">
                <div className="absolute top-0 w-full h-8 bg-gray-100 border-b border-gray-300"></div>
                <div className="absolute top-8 w-full h-16 bg-gray-100 border-b border-gray-300"></div>
                <div className="absolute top-24 w-full h-8 bg-gray-100"></div>
                <div
                  className="absolute bottom-0 w-full bg-gradient-to-t from-blue-400 to-blue-300 transition-all duration-700 ease-in-out"
                  style={{ height: `${waterHeight}%` }}
                >
                  <div className="absolute top-0 w-full h-1 bg-blue-200 opacity-60 animate-pulse"></div>
                </div>

                <div
                  className="absolute left-0 right-0 h-0.5 bg-red-500 z-20 transition-all duration-700 ease-in-out"
                  style={{ bottom: `${waterHeight}%` }}
                ></div>
              </div>

              <div
                className="absolute left-20 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-30 transition-all duration-700 ease-in-out shadow-sm"
                style={{
                  bottom: `${waterHeight}%`,
                  transform: "translateY(50%)",
                }}
              >
               {data.value} ซม.
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className={`text-2xl font-bold ${color} mb-1`}>
              ระดับน้ำ  {data.value} {data.unit}
            </div>
          
            
          </div>
        </div>
      </div>
    );
  };

  const MetricCard = ({ title, icon: Icon, data, color, bgColor }) => {
    if (!data)
      return <div className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className={`${bgColor} p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm">
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{title}</h3>
                <p className="text-sm text-gray-600">ค่าปัจจุบัน</p>
              </div>
            </div>
            {getTrendIcon(data.trend)}
          </div>
        </div>

        <div className="p-4">
          <div className="text-center mb-3">
            <div
              className={`text-3xl font-bold ${color} mb-1 flex items-end justify-center gap-1`}
            >
              {data.value}
              <span className="text-lg text-gray-500 mb-1">{data.unit}</span>
            </div>
            {/* แสดงระดับปุ๋ย/คำอธิบาย หากถูกส่งมาใน data.levelLabel */}
            {data.levelLabel && (
              <p className={`${color} text-xs mt-2 font-bold`}>ระดับ: {data.levelLabel}</p>
            )}
            {data.nPercentLabel && (
              <p className={`${color} text-[11px] mt-1 font-semibold`}>N%: {data.nPercentLabel}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 animate-pulse">กำลังโหลดข้อมูลอุปกรณ์...</p>
      </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-12">
      <Header />

      <div className="container mx-auto px-4 py-6 mt-4 space-y-8">
     

        {/* =================================================================================
            SECTION 1: REAL-TIME DATA (WebSocket)
           ================================================================================= */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Activity className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                การติดตามผลแบบเรียลไทม์ (Live Monitoring)
              </h2>
              <p className="text-sm text-gray-500">
                ข้อมูลล่าสุดที่ได้รับจากเซ็นเซอร์ผ่าน WebSocket
              </p>
            </div>
          </div>

          {/* ===== Skeleton Loading ระหว่างรอ WebSocket ===== */}
          {currentData === null && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-pulse">
              {/* Skeleton WaterLevel */}
              <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>

              {/* Skeleton Metric Cards */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                  >
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="h-10 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== แสดงผลจริงเมื่อได้ข้อมูล ===== */}
          {currentData && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Water Level Monitor */}
              <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <PieChart className="w-5 h-5 mr-2 text-purple-600" />
                    ระดับน้ำ (Live)
                  </h3>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-red-500">
                      LIVE
                    </span>
                  </div>
                </div>
                <div className="h-64">
                  <WaterLevelCard
                    data={currentData.waterLevel}
                    color="text-cyan-600"
                    bgColor="bg-cyan-50"
                  />
                </div>
              </div>

              {/* Sensor Cards Grid */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(() => {
                    const n_mgkg = Number(currentData.nitrogen?.value ?? 0);
                    const p_mgkg = Number(currentData.phosphorus?.value ?? 0);
                    const k_mgkg = Number(currentData.potassium?.value ?? 0);
                    const nPercent = n_mgkg / 10000;
                    const nLevel =
                      nPercent < 0.05
                        ? "ต่ำมาก"
                        : nPercent <= 0.09
                          ? "ต่ำ"
                          : nPercent <= 0.14
                            ? "ปานกลาง"
                            : "สูง";
                    const pLevel =
                      p_mgkg < 3
                        ? "ต่ำมาก"
                        : p_mgkg <= 10
                          ? "ต่ำ"
                          : p_mgkg <= 25
                            ? "ปานกลาง"
                            : p_mgkg <= 45
                              ? "สูง"
                              : "สูงมาก";
                    const kLevel =
                      k_mgkg < 31
                        ? "ต่ำมาก"
                        : k_mgkg <= 60
                          ? "ต่ำ"
                          : k_mgkg <= 90
                            ? "ปานกลาง"
                            : k_mgkg <= 120
                              ? "สูง"
                              : "สูงมาก";

                    const nitrogenData = {
                      ...currentData.nitrogen,
                      levelLabel: nLevel,
                      nPercentLabel: nPercent.toFixed(4),
                    };
                    const phosphorusData = { ...currentData.phosphorus, levelLabel: pLevel };
                    const potassiumData = { ...currentData.potassium, levelLabel: kLevel };

                    return (
                      <>
                        <MetricCard
                          title="ไนโตรเจน (N)"
                          icon={Leaf}
                          data={nitrogenData}
                          color="text-green-600"
                          bgColor="bg-green-50"
                        />
                        <MetricCard
                          title="ฟอสฟอรัส (P)"
                          icon={Leaf}
                          data={phosphorusData}
                          color="text-orange-600"
                          bgColor="bg-orange-50"
                        />
                        <MetricCard
                          title="โพแทสเซียม (K)"
                          icon={Leaf}
                          data={potassiumData}
                          color="text-purple-600"
                          bgColor="bg-purple-50"
                        />
                      </>
                    );
                  })()}
                        {/* soil moisture removed */}
                <MetricCard
                  title="อุณหภูมิ"
                  icon={Thermometer}
                  data={currentData.temperature}
                  color="text-red-600"
                  bgColor="bg-red-50"
                />
                {/* <MetricCard
                  title="เเบตเตอรี่"
                  icon={Cpu}
                  data={currentData.battery}
                  color="text-cyan-600"
                  bgColor="bg-cyan-50"
                /> */}
              </div>
            </div>
          )}
        </section>
        {/* =================================================================================
            SECTION 2: HISTORICAL DATA (API)
           ================================================================================= */}
        <section className="pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <History className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-gray-800">
                ข้อมูลย้อนหลัง (Historical Analysis)
              </h2>
              <p className="text-sm text-gray-500">
                {useCustomDateRange && customStartDate
                  ? `กราฟแสดงข้อมูลจาก ${customStartDate} ถึง ${customEndDate || "ปัจจุบัน"}`
                  : `กราฟแสดงแนวโน้มข้อมูลย้อนหลัง ${historyRangeMonths} เดือน (จาก API)`}
              </p>
            </div>
            <div className="ml-auto w-full sm:w-auto">
              <div className="flex flex-col gap-3">
                {/* Month Quick Selection */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">ช่วง:</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((month) => (
                      <button
                        key={month}
                        onClick={() => {
                          setUseCustomDateRange(false);
                          setHistoryRangeMonths(month);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          !useCustomDateRange && historyRangeMonths === month
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                        }`}
                      >
                        {month}ด
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Date Range Section */}
                {useCustomDateRange ? (
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-300 shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-blue-900">ระบุช่วงวันที่</span>
                      <button
                        onClick={() => {
                          setUseCustomDateRange(false);
                          setCustomStartDate("");
                          setCustomEndDate("");
                        }}
                        className="text-gray-500 hover:text-gray-700 text-lg font-bold"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-blue-900 block mb-1">วันเริ่มต้น</label>
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-blue-900 block mb-1">วันสิ้นสุด</label>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setUseCustomDateRange(true)}
                    className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-50 hover:from-blue-200 hover:to-blue-100 text-blue-700 rounded-lg border border-blue-300 transition-all"
                  >
                    📅 เลือกช่วงวันที่
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ถ้ามีข้อมูลย้อนหลัง ให้แสดงกราฟ ถ้าไม่มีให้แสดงข้อความแจ้งเตือน */}
          {filteredHistoricalData && filteredHistoricalData.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 xl:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <PieChart className="w-5 h-5 mr-2 text-emerald-600" />
                    กราฟรวม NPK + ความชื้น + ระดับน้ำ (Stacked Area)
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleExportCsv("stacked-area", [
                          "timestamp",
                          "time",
                          "nitrogen",
                          "phosphorus",
                          "potassium",
                          "waterLevel",
                        ])
                      }
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 inline mr-1" />
                      CSV
                    </button>
                    <button
                      onClick={() =>
                        handleExportJson("stacked-area", [
                          "timestamp",
                          "time",
                          "nitrogen",
                          "phosphorus",
                          "potassium",
                          "waterLevel",
                        ])
                      }
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 inline mr-1" />
                      JSON
                    </button>
                  </div>
                </div>

                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredHistoricalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="time" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Legend />

                      <Area
                        type="monotone"
                        dataKey="nitrogen"
                        stackId="1"
                        stroke="#666600"
                        fill="#666600"
                        fillOpacity={0.6}
                        name="ไนโตรเจน (N)"
                      />

                      {/* P (ส้ม) */}
                      <Area
                        type="monotone"
                        dataKey="phosphorus"
                        stackId="1"
                        stroke="#F59E0B"
                        fill="#F59E0B"
                        fillOpacity={0.6}
                        name="ฟอสฟอรัส (P)"
                      />

                      {/* K (ม่วง) */}
                      <Area
                        type="monotone"
                        dataKey="potassium"
                        stackId="1"
                        stroke="#666699"
                        fill="#666699"
                        fillOpacity={0.6}
                        name="โพแทสเซียม (K)"
                      />

                      {/* ความชื้น (ฟ้า) */}
                     
                      {/* ระดับน้ำ (น้ำเงินอมเขียว) */}
                      <Area
                        type="monotone"
                        dataKey="waterLevel"
                        stackId="1"
                        stroke="#6666FF"
                        fill="#6666FF"
                        fillOpacity={0.6}
                        name="ระดับน้ำ (cm)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 xl:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-cyan-600" />
                    สภาพแวดล้อม (ระดับน้ำ )
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportCsv("water-level", ["timestamp", "time", "waterLevel"])}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 inline mr-1" />
                      CSV
                    </button>
                    <button
                      onClick={() => handleExportJson("water-level", ["timestamp", "time", "waterLevel"])}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 inline mr-1" />
                      JSON
                    </button>
                  </div>
                </div>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredHistoricalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="time" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="waterLevel"
                        stackId="1"
                        stroke="#06B6D4"
                        fill="#06B6D4"
                        fillOpacity={0.6}
                        name="ระดับน้ำ (%)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* humidity historical chart removed */}

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 xl:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <LineChart className="w-5 h-5 mr-2 text-blue-600" />
                    แนวโน้มค่า NPK
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleExportCsv("npk", [
                          "timestamp",
                          "time",
                          "nitrogen",
                          "phosphorus",
                          "potassium",
                        ])
                      }
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 inline mr-1" />
                      CSV
                    </button>
                    <button
                      onClick={() =>
                        handleExportJson("npk", [
                          "timestamp",
                          "time",
                          "nitrogen",
                          "phosphorus",
                          "potassium",
                        ])
                      }
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 inline mr-1" />
                      JSON
                    </button>
                  </div>
                </div>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={filteredHistoricalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="time" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="nitrogen"
                        stroke="#10B981"
                        strokeWidth={2}
                        name="N"
                      />
                      <Line
                        type="monotone"
                        dataKey="phosphorus"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        name="P"
                      />
                      <Line
                        type="monotone"
                        dataKey="potassium"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        name="K"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500">
              <FileX className="w-12 h-12 mb-3 text-gray-300" />
              <p className="font-medium">
                ไม่พบข้อมูลย้อนหลัง (No Historical Data)
              </p>
              <p className="text-sm mt-1 text-gray-400">
                ยังไม่มีการบันทึกข้อมูลสำหรับช่วงเวลานี้
              </p>
            </div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
}
