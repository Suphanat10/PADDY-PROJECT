"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { apiFetch } from "@/lib/api";
import Footer from "../../../components/Footer";
import {
  Wifi,
  MapPin,
  CloudSun,
  Droplets,
  Clock,
  Loader2,
  Server,
  Search,
  Waves,
  DropletOff,
  Zap,
  Sprout,
  AlertTriangle,
  ChevronRight,
  LayoutGrid,
  Activity,
  ChevronDown,
  ShieldCheck,
  Bug,
  flame,
  Droplet,
  AlertCircle,
  BarChart3,
  LineChart as LineIcon,
  ExternalLink,
  X,
  Calendar,
} from "lucide-react";
import Link from "next/link"; 
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  Cell,
  BarChart,
  Bar,
  ReferenceLine,
  ReferenceDot,
} from "recharts";
import { io } from "socket.io-client";

// --- Custom Hook สำหรับ WebSocket ---
function useDeviceWebSocket({ deviceIds = [], onSensor, onStatus }) {
  const socketRef = useRef(null);
  useEffect(() => {
    if (!deviceIds.length) return;
    const socket = io("https://smart-paddy.space", {
      transports: ["websocket"],
      reconnection: true,
    });
    socketRef.current = socket;
    const emitJoinEvents = () => {
      // Filter out invalid IDs (empty, N/A, null-like) and deduplicate
      const validIds = Array.from(new Set(deviceIds || []))
        .map((id) => (typeof id === "string" ? id.trim() : id))
        .filter((id) => id && id !== "N/A" && id !== "undefined" && id !== "null");

      validIds.forEach((id) => socket.emit("join-device", id));
      socket.emit("join-all");
    };
    socket.on("connect", () => {
      console.log("📡 Connected:", socket.id);
      emitJoinEvents();
    });
    socket.on("sensorData", (payload) => {
      if (payload?.device_code && payload?.data)
        onSensor(payload.device_code, payload.data);
    });
    socket.on("deviceStatus", (payload) => {
      if (payload?.device_code && payload?.status)
        onStatus(payload.device_code, payload.status);
    });
    return () => {
      if (socket) socket.disconnect();
    };
  }, [JSON.stringify(deviceIds), onSensor, onStatus]);
}

export default function App() {
    // Fallback logic state
    const [wsDataReceived, setWsDataReceived] = useState(false);
    const [fallbackTriggered, setFallbackTriggered] = useState(false);
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [weather, setWeather] = useState(null);
  const [farmData, setFarmData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeAreaId, setActiveAreaId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTimelineModal, setShowTimelineModal] = useState(false);

  // ฟังก์ชันเช็คสุขภาพพืช
  const checkHealth = useCallback((area) => {
    const alerts = [];
    let waterIssue = false;
    let diseaseIssue = false;
    if (area.sensor && area.status === "online") {
      const val = area.sensor.water_level;
      // อ่าน thresholds จาก area.setting (Water_level_min, Water_level_mxm) หรือ area.thresholds
      const min = area.setting?.Water_level_min ?? area.thresholds?.min ?? 5;
      const max = area.setting?.Water_level_mxm ?? area.setting?.Water_level_max ?? area.thresholds?.max ?? 15;
      console.log(`Checking water level for ${area.area_name}: ${val} (min: ${min}, max: ${max})`);
      if (val < min) {
        alerts.push({ type: "water", msg: `น้ำต่ำ (${val} cm)` });
        waterIssue = true;
      }
      if (val > max) {
        alerts.push({ type: "water", msg: `น้ำสูง (${val} cm)` });
        waterIssue = true;
      }
    }
    if (area.disease?.status === "warning") {
      alerts.push({ type: "disease", msg: `ตรวจพบ: ${area.disease.name}` });
      diseaseIssue = true;
    }
    return { isCritical: alerts.length > 0, alerts, waterIssue, diseaseIssue };
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/data/analysis");
      if (res?.ok && Array.isArray(res.data)) {
        setFarmData(res.data);
        if (res.data.length > 0)
          setSelectedFarmId(res.data[0].farm_id.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSensorData = useCallback((deviceId, incoming) => {
    setFarmData((prev) =>
      prev.map((farm) => ({
        ...farm,
        areas: farm.areas.map((area) =>
          area.device_code === deviceId
            ? {
                ...area,
                status: "online",
                sensor: {
                  ...area.sensor,
                  n: incoming.N ?? incoming.n ?? area.sensor?.n,
                  p: incoming.P ?? incoming.p ?? area.sensor?.p,
                  k: incoming.K ?? incoming.k ?? area.sensor?.k,
                  s : incoming.S ?? incoming.s ?? area.sensor?.s,
                  water_level:
                    incoming.W ??
                    incoming.water_level ??
                    area.sensor?.water_level,
                },
              }
            : area,
        ),
      })),
    );
  }, []);

  const handleStatusChange = useCallback((deviceId, status) => {
    setFarmData((prev) =>
      prev.map((farm) => ({
        ...farm,
        areas: farm.areas.map((area) =>
          area.device_code === deviceId ? { ...area, status } : area,
        ),
      })),
    );
    setWsDataReceived(true);
  }, []);

  const allDeviceIds = useMemo(
    () => farmData.flatMap((f) => f.areas.map((a) => a.device_code)),
    [farmData],
  );
  useDeviceWebSocket({
    deviceIds: allDeviceIds,
    onSensor: handleSensorData,
    onStatus: handleStatusChange,
  });


  const selectedFarm = useMemo(
  () => farmData.find((f) => f.farm_id.toString() === selectedFarmId),
  [farmData, selectedFarmId]
);

  // Scheduler summary for selected farm
  const schedulerSummary = useMemo(() => {
    if (!selectedFarm) return { total: 0, due: 0, queued: 0, not_due: 0, never_analyzed: 0, nextCheck: null };
    const summary = { total: 0, due: 0, queued: 0, not_due: 0, never_analyzed: 0 };
    let nextCheck = null;
    selectedFarm.areas.forEach((a) => {
      if (!a.scheduler) return;
      summary.total += 1;
      const s = a.scheduler.status;
    setWsDataReceived(true);
      if (s === 'due') summary.due += 1;
      else if (s === 'queued') summary.queued += 1;
      else if (s === 'not_due') summary.not_due += 1;
      else if (s === 'never_analyzed') summary.never_analyzed += 1;

      // determine next check time: prefer last_check if available, otherwise use days_remaining to compute rough date
      if (a.scheduler.last_check) {
        const t = new Date(a.scheduler.last_check).getTime();
        if (!nextCheck || t < nextCheck) nextCheck = t;
      } else if (typeof a.scheduler.days_remaining === 'number') {
        const approx = Date.now() + a.scheduler.days_remaining * 24 * 3600 * 1000;
        if (!nextCheck || approx < nextCheck) nextCheck = approx;
      }
    });
    return { ...summary, nextCheck };
  }, [selectedFarm]);

  // Logic สำหรับข้อมูลพื้นที่ที่เลือก (ใช้สำหรับกราฟ)
  const activeArea = useMemo(() => {
    if (!selectedFarm) return null;
    return (
      selectedFarm.areas.find((a) => a.area_id === activeAreaId) ||
      selectedFarm.areas[0]
    );
  }, [selectedFarm, activeAreaId]);

  // 1. Radar Chart Data: ดึงค่าล่าสุดจาก History ของแปลงที่เลือก
  const radarChartData = useMemo(() => {
    if (!activeArea || !activeArea.sensor_history) return [];
    const history = activeArea.sensor_history;
    const getValue = (key) => {
      const item = [...history].reverse().find((h) => h[key] !== undefined);
      return item ? Number(item[key]) : 0;
    };
    return [
      { subject: "Nitrogen (N)", value: getValue("N") },
      { subject: "Phosphorus (P)", value: getValue("P") },
      { subject: "Potassium (K)", value: getValue("K") },
    ];
  }, [activeArea]);

  // 2. Area Chart Data: รวมข้อมูล NPKW ตามช่วงเวลาของแปลงที่เลือก
  const areaHistoryData = useMemo(() => {
    if (!activeArea || !activeArea.sensor_history) return [];
    const grouped = activeArea.sensor_history.reduce((acc, curr) => {
      const time = curr.time;
      if (!acc[time]) acc[time] = { time };
      if (curr.W !== undefined) acc[time].water_level = curr.W;
      return acc;
    }, {});
    return Object.values(grouped).sort((a, b) => a.time.localeCompare(b.time));
  }, [activeArea]);

  const farmInsights = useMemo(() => {
    if (!selectedFarm)
      return { avgN: 0, avgP: 0, avgK: 0, avgWater: 0, activeCount: 0 };
    const activeAreas = selectedFarm.areas.filter((a) => a.sensor);
    const onlineCount = selectedFarm.areas.filter(
      (a) => a.status === "online" || a.status === "active",
    ).length;
    if (activeAreas.length === 0)
      return {
        avgN: 0,
        avgP: 0,
        avgK: 0,
        avgWater: 0,
        activeCount: onlineCount,
      };
    const total = activeAreas.reduce(
      (acc, curr) => ({
        n: acc.n + (Number(curr.sensor.n) || 0),
        p: acc.p + (Number(curr.sensor.p) || 0),
        k: acc.k + (Number(curr.sensor.k) || 0),
        water: acc.water + (Number(curr.sensor.water_level) || 0),
      }),
      { n: 0, p: 0, k: 0, water: 0 },
    );
    return {
      avgN: Math.round(total.n / activeAreas.length),
      avgP: Math.round(total.p / activeAreas.length),
      avgK: Math.round(total.k / activeAreas.length),
      avgWater: Math.round(total.water / activeAreas.length),
      activeCount: onlineCount,
    };
  }, [selectedFarm]);

  // กราฟที่ 1: Stacked Area Chart (สัดส่วนธาตุอาหาร NPK ตามเวลา)
  const npkStackedData = useMemo(() => {
  if (!activeArea?.sensor_history) return [];

  const grouped = activeArea.sensor_history.reduce((acc, curr) => {
    const ts = curr.timestamp; // ใช้ timestamp จริง

    if (!acc[ts]) {
      acc[ts] = {
        timestamp: ts,
        time: curr.time, // เอาไว้แสดงบนแกน X
        N: 0,
        P: 0,
        K: 0
      };
    }

    if (curr.N !== undefined) acc[ts].N = Number(curr.N);
    if (curr.P !== undefined) acc[ts].P = Number(curr.P);
    if (curr.K !== undefined) acc[ts].K = Number(curr.K);

    return acc;
  }, {});

  return Object.values(grouped)
    .filter(d => d.N > 0 || d.P > 0 || d.K > 0)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

}, [activeArea]);

 const waterChartData = useMemo(() => {
  if (!activeArea?.sensor_history)
    return { data: [], events: [], thresholds: { min: 5, max: 30 } };

  // อ่าน thresholds จาก area.setting (Water_level_min, Water_level_mxm) หรือ area.thresholds
  const thresholds = {
    min: activeArea.setting?.Water_level_min ?? activeArea.thresholds?.min ?? 5,
    max: activeArea.setting?.Water_level_mxm ?? activeArea.setting?.Water_level_max ?? activeArea.thresholds?.max ?? 30
  };

  const grouped = activeArea.sensor_history.reduce((acc, curr) => {
    const ts = curr.timestamp; // ✅ ใช้ timestamp แทน time

    if (!acc[ts]) {
      acc[ts] = {
        timestamp: ts,
        time: curr.time, // ไว้แสดงบนแกน X
        water_level: null
      };
    }

    if (curr.W !== undefined) {
      acc[ts].water_level = Number(curr.W);
    }

    return acc;
  }, {});

  const data = Object.values(grouped)
    .filter(d => d.water_level !== null)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); 

  const events = data
    .filter(
      d => d.water_level < thresholds.min || d.water_level > thresholds.max
    )
    .map(d => ({
      ...d,
      type: d.water_level < thresholds.min ? "Low" : "High",
      color: d.water_level < thresholds.min ? "#f43f5e" : "#f59e0b",
    }));

  return { data, events, thresholds };

}, [activeArea]);

  useEffect(() => {
    if (selectedFarm?.areas.length > 0 && !activeAreaId)
      setActiveAreaId(selectedFarm.areas[0].area_id);
  }, [selectedFarm, activeAreaId]);

  useEffect(() => {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=13.75&longitude=100.5&current=temperature_2m,relative_humidity_2m`,
    )
      .then((r) => r.json())
      .then((d) =>
        setWeather({
          temp: Math.round(d.current.temperature_2m),
          humidity: d.current.relative_humidity_2m,
        }),
      )
      .catch(() => setWeather({ temp: 32, humidity: 62 }));
  }, []);

  return (
    <div className="min-h-screen bg-[#FBFBFC] pb-20 text-slate-700">
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* 1. TOP HEADER & WEATHER */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              ภาพรวมการทำงานของระบบ
            </h1>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              การเชื่อมต่อระบบเรียลไทม์: Online
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selectedFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value)}
                className="appearance-none bg-white border border-slate-200 text-sm font-bold py-2.5 pl-4 pr-10 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/10 cursor-pointer shadow-sm min-w-50"
              >
                {farmData.map((f) => (
                  <option key={f.farm_id} value={f.farm_id}>
                    {f.farm_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block" />
            <div className="flex items-center gap-4 text-slate-500">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-50">
                <CloudSun className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-bold">
                  {weather?.temp || "--"}°C
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-50">
                <Droplets className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold">
                  {weather?.humidity ?? 0}%
                </span>
              </div>

              {/* Scheduler per-device removed */}

            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Synchronizing Data...
            </p>
          </div>
        ) : !selectedFarm ? (
          <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-200">
            <LayoutGrid className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
              ไม่พบข้อมูลฟาร์ม
            </p>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in duration-500">
            {/* 2. ACTION REQUIRED (ALERTS) */}
            {selectedFarm.areas.some((a) => checkHealth(a).isCritical) && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
                  <h2 className="text-lg font-bold text-slate-800">
                    พื้นที่ที่ต้องดูแลเป็นพิเศษ
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedFarm.areas
                    .filter((a) => checkHealth(a).isCritical)
                    .map((area, idx) => {
                      const health = checkHealth(area);
                      return (
                        <div
                          key={area.area_id || idx}
                          className="bg-white border-2 border-rose-100 p-6 rounded-4xl flex flex-col gap-4 shadow-xl shadow-rose-500/5 group relative overflow-hidden"
                        >
                          <div className="flex justify-between items-start z-10">
                            <div>
                              <h4 className="font-black text-slate-800 text-xl">
                                {area.area_name}
                              </h4>
                              <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">
                                🚨 ภาวะวิกฤต
                              </p>
                            </div>
                            <div className="flex gap-1.5">
                              {health.waterIssue && (
                                <div className="p-2.5 bg-blue-50 text-blue-500 rounded-2xl border border-blue-100">
                                  <Droplet className="w-5 h-5" />
                                </div>
                              )}
                              {health.diseaseIssue && (
                                <div className="p-2.5 bg-rose-50 text-rose-500 rounded-2xl border border-rose-100">
                                  <Bug className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            {health.alerts.map((alert, i) => (
                              <div
                                key={i}
                                className={`flex items-center gap-3 p-3 rounded-2xl text-[12px] font-bold border ${alert.type === "water" ? "bg-blue-50/50 border-blue-100 text-blue-700" : "bg-rose-50/50 border-rose-100 text-rose-700"}`}
                              >
                                <AlertCircle className="w-4 h-4" />
                                <span>{alert.msg}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* 3. OVERVIEW STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  ระดับน้ำเฉลี่ยในฟาร์ม
                </p>
                <div className="flex items-end justify-between">
                  <span className="text-4xl font-black text-slate-800">
                    {farmInsights.avgWater}
                    <span className="text-sm text-slate-400 ml-1">ซม.</span>
                  </span>
                  <Waves className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  อุปกรณ์ที่ Online
                </p>
                <div className="flex items-end justify-between">
                  <span className="text-4xl font-black text-slate-800">
                    {farmInsights.activeCount} / {selectedFarm.areas.length}
                  </span>
                  <Server className="w-8 h-8 text-slate-500" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm col-span-1 lg:col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  สมดุลธาตุอาหารรวม (NPK)
                </p>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {["N", "P", "K"].map((k) => (
                    <div
                      key={k}
                      className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100"
                    >
                      <p className="text-[8px] font-bold text-slate-400 mb-0.5">
                        {k} Value
                      </p>
                      <p className="text-lg font-black text-slate-700">
                        {farmInsights[`avg${k}`]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. LIVE MONITORING */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-rose-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      การติดตามผลแบบเรียลไทม์ (Live Monitoring)
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      ข้อมูลล่าสุดจากเซนเซอร์ผ่าน WebSocket
                    </p>
                  </div>
                </div>
                <div className="relative min-w-45">
                  <select
                    value={activeAreaId || ""}
                    onChange={(e) => setActiveAreaId(Number(e.target.value))}
                    className="w-full appearance-none bg-white border border-slate-200 text-[12px] font-bold py-2.5 pl-4 pr-10 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/10 cursor-pointer shadow-sm transition-all"
                  >
                    {selectedFarm.areas.map((area) => (
                      <option key={area.area_id} value={area.area_id}>
                        แปลง: {area.area_name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {selectedFarm.areas
                .filter((a) => a.area_id === activeAreaId)
                .map((area) => {
                  // ตรวจสอบว่ามีข้อมูลเซนเซอร์หรือไม่
                  const hasNoSensorData = !area.sensor || (
                    area.sensor.water_level === null && 
                    area.sensor.water_level === undefined &&
                    area.sensor.n === null && 
                    area.sensor.n === undefined
                  );
                  const isOffline = area.status === 'offline';
                  
                  // หากไม่มีข้อมูลหรือ offline ให้แสดงหน้าจอ connecting
                  if (isOffline || (hasNoSensorData && area.status !== 'online' && area.status !== 'active')) {
                    return (
                      <div key={area.area_id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center animate-pulse">
                            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-700 mb-1">กำลังเชื่อมต่อ...</h3>
                            <p className="text-sm text-slate-400">รอรับข้อมูลจากเซนเซอร์ แปลง {area.area_name}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                            <span className="text-xs font-medium text-amber-600">รอการเชื่อมต่อ WebSocket</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  const waterLevel = area.sensor?.water_level ?? 0;
                  const minThreshold = area.thresholds?.min ?? 5;
                  const maxThreshold = area.thresholds?.Water_level_mxm ?? area.setting?.thresholds ?? area.thresholds?.max ?? 15;
                  const maxScale = 30; 
                  
                  // คำนวณสถานะระดับน้ำ
                  let waterStatus = 'normal';
                  let statusText = 'ปกติ';
                  let statusColor = 'text-emerald-600';
                  let statusBg = 'bg-emerald-50';
                  let barColor = 'bg-blue-400';
                  
                  if (waterLevel < minThreshold) {
                    waterStatus = 'low';
                    statusText = 'ต่ำเกินไป';
                    statusColor = 'text-rose-600';
                    statusBg = 'bg-rose-50';
                    barColor = 'bg-rose-400';
                  } else if (waterLevel > maxThreshold) {
                    waterStatus = 'high';
                    statusText = 'สูงเกินไป';
                    statusColor = 'text-amber-600';
                    statusBg = 'bg-amber-50';
                    barColor = 'bg-amber-400';
                  }
                  
                  return (
                  <div
                    key={area.area_id}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4"
                  >
                    <div className="md:row-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-purple-500" />
                          <span className="font-bold text-sky-500 text-lg">
                            ระดับน้ำ (Live)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
                          <span className="text-xs font-bold text-rose-500 uppercase">
                            Live
                          </span>
                        </div>
                      </div>
                      
                      {/* Water Tank Visualization */}
                      <div className="flex-1 flex items-center justify-center">
                        <div className="relative">
                          {/* Tank Container */}
                          <div className="relative w-28 h-40 border-4 border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
                            {/* Water Fill - ใช้ maxScale คำนวณเพื่อให้น้ำเกิน MAX ได้ */}
                            <div
                              className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out ${
                                waterStatus === 'low' ? 'bg-gradient-to-t from-rose-400 to-rose-300' : 
                                waterStatus === 'high' ? 'bg-gradient-to-t from-amber-400 to-amber-300' : 
                                'bg-gradient-to-t from-sky-500 to-sky-400'
                              }`}
                              style={{
                                height: `${Math.min((waterLevel / maxScale) * 100, 100)}%`,
                              }}
                            >
                              {/* Water surface shine */}
                              <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/40" />
                            </div>
                            
                            {/* MAX Threshold Line */}
                            <div 
                              className="absolute w-full z-10 flex items-center"
                              style={{ bottom: `${(maxThreshold / maxScale) * 100}%` }}
                            >
                              <div className="flex-1 border-t-2 border-dashed border-amber-500" />
                            </div>
                            
                            {/* MIN Threshold Line */}
                            <div 
                              className="absolute w-full z-10 flex items-center"
                              style={{ bottom: `${(minThreshold / maxScale) * 100}%` }}
                            >
                              <div className="flex-1 border-t-2 border-dashed border-rose-500" />
                            </div>
                            
                            {/* Current Level Line (Red solid line) */}
                            <div 
                              className="absolute w-full z-20 transition-all duration-1000"
                              style={{ bottom: `${Math.min((waterLevel / maxScale) * 100, 100)}%` }}
                            >
                              <div className="w-full border-t-[3px] border-rose-500" />
                            </div>
                          </div>
                          
                          {/* Current Level Label (Right side) */}
                          <div 
                            className="absolute -left-16 transition-all duration-1000 flex items-center"
                            style={{ bottom: `calc(${Math.min((waterLevel / maxScale) * 100, 100)}% - 8px)` }}
                          >
                            <div className="bg-rose-500 text-white px-2 py-1 rounded-lg text-sm font-bold whitespace-nowrap">
                              {waterLevel} ซม.
                            </div>
                          </div>
                          
                          {/* MAX Label (Right side) */}
                          <div 
                            className="absolute -right-12 transition-all duration-300 flex items-center"
                            style={{ bottom: `calc(${(maxThreshold / maxScale) * 100}% - 8px)` }}
                          >
                             <span className="text-xs font-bold text-amber-600">{maxThreshold} ซม.</span>
                          </div>
                          
                          {/* MIN Label (Right side) */}
                          <div 
                            className="absolute -right-12 transition-all duration-300 flex items-center"
                            style={{ bottom: `calc(${(minThreshold / maxScale) * 100}% - 8px)` }}
                          >
                             <span className="text-xs font-bold text-amber-600">{minThreshold} ซม.</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bottom Status Text */}
                      <div className="text-center mt-6">
                        <p className={`text-2xl font-black ${
                          waterStatus === 'low' ? 'text-rose-500' : 
                          waterStatus === 'high' ? 'text-amber-500' : 
                          'text-sky-500'
                        }`}>
                          ระดับน้ำ {waterLevel} ซม.
                        </p>
                        <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full ${
                          waterStatus === 'low' ? 'bg-rose-100 text-rose-600' : 
                          waterStatus === 'high' ? 'bg-amber-100 text-amber-600' : 
                          'bg-emerald-100 text-emerald-600'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            waterStatus === 'low' ? 'bg-rose-500' : 
                            waterStatus === 'high' ? 'bg-amber-500' : 
                            'bg-emerald-500'
                          }`} />
                          <span className="text-sm font-bold">
                            {waterStatus === 'low' ? 'ต่ำกว่าเกณฑ์' : 
                             waterStatus === 'high' ? 'สูงกว่าเกณฑ์' : 
                             'อยู่ในเกณฑ์ปกติ'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          ช่วงที่เหมาะสม: {minThreshold} - {maxThreshold} ซม.
                        </p>
                      </div>
                    </div>
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="bg-emerald-50/50 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm border border-emerald-100">
                            <Sprout className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800">
                              ไนโตรเจน (N)
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold">
                              ค่าปัจจุบัน
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-8 text-center">
                        <p className="text-3xl font-black text-emerald-500">
                          {area.sensor?.n}{" "}
                          <span className="text-sm text-slate-400 ml-1">
                            mg/kg
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="bg-orange-50/50 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm border border-orange-100">
                            <Droplet className="w-4 h-4 text-orange-500" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800">
                              ฟอสฟอรัส (P)
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold">
                              ค่าปัจจุบัน
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-8 text-center">
                        <p className="text-3xl font-black text-orange-500">
                          {area.sensor?.p}{" "}
                          <span className="text-sm text-slate-400 ml-1">
                            mg/kg
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="bg-purple-50/50 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm border border-purple-100">
                            <Zap className="w-4 h-4 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800">
                              โพแทสเซียม (K)
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold">
                              ค่าปัจจุบัน
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-8 text-center">
                        <p className="text-3xl font-black text-purple-500">
                          {area.sensor?.k}{" "}
                          <span className="text-sm text-slate-400 ml-1">
                            mg/kg
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="bg-blue-50/50 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm border border-blue-100">
                            <Droplets className="w-4 h-4 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800">
                              ความชื้นดิน
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold">
                              ค่าปัจจุบัน
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-8 text-center">
                        <p className="text-3xl font-black text-blue-600">
                            {area.sensor?.s ?? 0}{" "}
                          <span className="text-sm text-slate-400 ml-1">%</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )})}
            </div>

            {/* 5. ANALYTICS CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* กราฟ Radar */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-widest">
                    <BarChart3 className="w-4 h-4 text-emerald-500" />{" "}
                    สัดส่วนธาตุอาหาร (NPK) - แปลง {activeArea?.area_name}
                  </h3>
                  <Link
                    href={`/Paddy/agriculture/sensor/${activeArea?.device_code || ''}`}
                    className="px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-600 transition-all inline-flex items-center gap-1.5"
                  >
                    ดูข้อมูลย้อนหลัง 30 วัน
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="h-87.5">
                  {npkStackedData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={npkStackedData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="time"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: "#94a3b8" }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: "#94a3b8" }}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "16px",
                            border: "none",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Legend
                          verticalAlign="top"
                          align="right"
                          iconType="circle"
                          wrapperStyle={{
                            fontSize: "10px",
                            fontWeight: "bold",
                            paddingBottom: "20px",
                          }}
                        />

                        {/* ไนโตรเจน - สีเขียว */}
                        <Area
                          type="monotone"
                          dataKey="N"
                          stackId="1"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.6}
                        />
                        {/* ฟอสฟอรัส - สีส้ม */}
                        <Area
                          type="monotone"
                          dataKey="P"
                          stackId="1"
                          stroke="#f97316"
                          fill="#f97316"
                          fillOpacity={0.6}
                        />
                        {/* โพแทสเซียม - สีม่วง */}
                        <Area
                          type="monotone"
                          dataKey="K"
                          stackId="1"
                          stroke="#a855f7"
                          fill="#a855f7"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                      ไม่มีข้อมูลประวัติธาตุอาหาร
                    </div>
                  )}
                </div>
              </div>

              {/* กราฟแนวโน้มระดับน้ำ */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-widest">
                    <Waves className="w-4 h-4 text-blue-500" /> แนวโน้มระดับน้ำ
                    (cm) - แปลง {activeArea?.area_name}
                  </h3>
                  <Link
                    href={`/Paddy/agriculture/sensor/${activeArea?.device_code || ''}`}
                    className="px-3 py-1.5 bg-blue-500 text-white text-[10px] font-bold rounded-lg hover:bg-blue-600 transition-all inline-flex items-center gap-1.5"
                  >
                    ดูข้อมูลย้อนหลัง 30 วัน
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="h-87.5">
                  {waterChartData.data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={waterChartData.data}>
                        <defs>
                          <linearGradient
                            id="colorWater"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#3b82f6"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#3b82f6"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="time"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: "#94a3b8" }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: "#94a3b8" }}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "16px",
                            border: "none",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                          }}
                          cursor={{
                            stroke: "#3b82f6",
                            strokeWidth: 1,
                            strokeDasharray: "4 4",
                          }}
                        />

                        {/* เส้นเกณฑ์ Min / Max (Thresholds) */}
                        <ReferenceLine
                          y={waterChartData.thresholds.max}
                          stroke="#f59e0b"
                          strokeDasharray="3 3"
                          label={{
                            position: "right",
                            value: "Max",
                            fill: "#f59e0b",
                            fontSize: 10,
                          }}
                        />
                        <ReferenceLine
                          y={waterChartData.thresholds.min}
                          stroke="#f43f5e"
                          strokeDasharray="3 3"
                          label={{
                            position: "right",
                            value: "Min",
                            fill: "#f43f5e",
                            fontSize: 10,
                          }}
                        />

                        <Area
                          type="monotone"
                          dataKey="water_level"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          fill="url(#colorWater)"
                          animationDuration={1500}
                        />

                        {/* วาดจุด Custom Events เมื่อค่าน้ำผิดปกติ */}
                        {waterChartData.events.map((event, idx) => (
                          <ReferenceDot
                            key={idx}
                            x={event.time}
                            y={event.water_level}
                            r={5}
                            fill={event.color}
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                      <Waves className="w-12 h-12 text-slate-100 mb-3" />
                      <p className="text-xs font-bold uppercase tracking-widest">
                        ยังไม่มีข้อมูลประวัติระดับน้ำ
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Scheduler summary (below graphs) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-widest">
                  <Calendar className="w-4 h-4 text-emerald-500" /> ตารางวิเคราะห์
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeArea && activeArea.scheduler ? (
                  <div key={activeArea.area_id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          <div className="truncate">
                            <div className="font-bold text-sm text-slate-800 truncate">{activeArea.area_name}</div>
                            <div className="text-[12px] text-slate-500 truncate">{activeArea.device_code || "-"}</div>
                          </div>
                        </div>
                        <div className="mt-3 text-sm text-slate-600 flex items-center gap-2">
                          <span className="inline-flex items-center gap-2">
                            <svg className="w-3 h-3 text-slate-400" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4" /></svg>
                            <span className="font-medium">
                              {activeArea.scheduler.status === "due"
                                ? "ถึงกำหนดวิเคราะห์"
                                : activeArea.scheduler.status === "queued"
                                ? "ออกคำสั่งแล้ว รอวิเคราะห์"
                                : activeArea.scheduler.status === "not_due"
                                ? "ยังไม่ถึงกำหนด"
                                : activeArea.scheduler.status === "never_analyzed"
                                ? "ยังไม่เคยวิเคราะห์"
                                : "ไม่ทราบสถานะ"}
                            </span>
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500">
                            {typeof activeArea.scheduler.days_remaining === "number"
                              ? `${activeArea.scheduler.days_remaining} วัน คงเหลือ`
                              : activeArea.scheduler.last_check
                              ? `${new Date(activeArea.scheduler.last_check).toLocaleString("th-TH", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`
                              : "-"}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-end">
                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          activeArea.scheduler.status === 'due' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          activeArea.scheduler.status === 'queued' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          activeArea.scheduler.status === 'not_due' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          'bg-slate-50 text-slate-600 border border-slate-100'
                        }` }>
                          {activeArea.scheduler.status === 'due' ? 'ถึงกำหนด' : activeArea.scheduler.status === 'queued' ? 'คิว' : activeArea.scheduler.status === 'not_due' ? 'ยังไม่ถึง' : activeArea.scheduler.status}
                        </div>
                        <div className="mt-2 text-[11px] text-slate-400">ล่าสุด: {activeArea.scheduler.last_check ? new Date(activeArea.scheduler.last_check).toLocaleString('th-TH', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 col-span-full">ยังไม่มีข้อมูลตารางวิเคราะห์สำหรับพื้นที่ที่เลือก</div>
                )}
              </div>
            </div>

            {/* 6. Rice Stage & Disease Timeline */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-widest">
                    <Sprout className="w-4 h-4 text-emerald-500" /> ระยะข้าวและโรคข้าว - แปลง {activeArea?.area_name}
                  </h3>
                  <button
                    onClick={() => setShowTimelineModal(true)}
                    className="px-4 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase rounded-xl hover:bg-emerald-600 transition-all inline-flex items-center gap-2"
                  >
                    ดูไทม์ไลน์ทั้งหมด
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {activeArea ? (
                  <div className="relative pl-10">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-slate-200"></div>

                    {/* Growth Stage Item */}
                    <div className="relative pb-8">
                      {/* Timeline Dot */}
                      <div className="absolute -left-10 top-2 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                        <Sprout className="w-3.5 h-3.5 text-white" />
                      </div>
                      {/* Content Card */}
                      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        {activeArea.growth?.stage ? (
                          <div className="flex flex-col sm:flex-row items-start gap-5">
                            <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 shrink-0 shadow-inner border-2 border-white">
                              <img
                                src={activeArea.growth?.image_url || '/no-image.png'}
                                alt="ระยะข้าว"
                                className="object-cover w-full h-full"
                                onError={e => { e.target.onerror = null; e.target.src = '/no-image.png'; }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">ระยะการเจริญเติบโต</p>
                              <h4 className="text-xl font-black text-slate-800 mb-2">{activeArea.growth?.stage}</h4>
                              <div className="flex items-center gap-3 mb-3">
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${activeArea.growth?.progress ?? 0}%` }}></div>
                                </div>
                                <span className="text-sm font-bold text-emerald-600">{activeArea.growth?.progress ?? 0}%</span>
                              </div>
                              {activeArea.growth?.advice && (
                                <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-4 leading-relaxed">{activeArea.growth.advice}</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4 py-4">
                            <div className="w-20 h-20 rounded-xl bg-slate-50 flex items-center justify-center">
                              <Sprout className="w-8 h-8 text-slate-200" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">ระยะการเจริญเติบโต</p>
                              <h4 className="text-base font-bold text-slate-400">ยังไม่มีข้อมูล</h4>
                              <p className="text-xs text-slate-300 mt-1">กรุณาเพิ่มข้อมูลระยะการเจริญเติบโต</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Disease Status Item */}
                    <div className="relative">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-10 top-2 w-7 h-7 rounded-full flex items-center justify-center shadow-lg ${activeArea.disease?.status === 'safe' ? 'bg-emerald-500 shadow-emerald-200' : activeArea.disease?.status ? 'bg-rose-500 shadow-rose-200 animate-pulse' : 'bg-slate-300 shadow-slate-100'}`}>
                        {activeArea.disease?.status === 'safe' ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-white" />
                        ) : activeArea.disease?.status ? (
                          <Bug className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                      {/* Content Card */}
                      <div className={`border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow ${activeArea.disease?.status === 'safe' ? 'bg-white border-slate-100' : activeArea.disease?.status ? 'bg-rose-50/50 border-rose-100' : 'bg-slate-50/50 border-slate-100'}`}>
                        {activeArea.disease?.status ? (
                          <div className="flex flex-col sm:flex-row items-start gap-5">
                            <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 shrink-0 shadow-inner border-2 border-white">
                              <img
                                src={activeArea.disease?.image_url || '/no-image.png'}
                                alt="สถานะโรคข้าว"
                                className="object-cover w-full h-full"
                                onError={e => { e.target.onerror = null; e.target.src = '/no-image.png'; }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${activeArea.disease?.status === 'safe' ? 'text-emerald-500' : 'text-rose-500'}`}>สถานะโรคข้าว</p>
                              <h4 className={`text-xl font-black mb-2 ${activeArea.disease?.status === 'safe' ? 'text-slate-800' : 'text-rose-700'}`}>
                                {activeArea.disease?.name || 'ไม่พบโรค'}
                              </h4>
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeArea.disease?.status === 'safe' ? 'bg-emerald-50' : 'bg-rose-100'}`}>
                                  {activeArea.disease?.status === 'safe' ? (
                                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                  ) : (
                                    <Bug className="w-5 h-5 text-rose-500" />
                                  )}
                                </div>
                                <p className={`text-sm font-bold ${activeArea.disease?.status === 'safe' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {activeArea.disease?.status === 'safe' ? 'ปลอดภัย' : 'ต้องดูแลเป็นพิเศษ'}
                                </p>
                              </div>
                              {activeArea.disease?.advice && (
                                <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-4 leading-relaxed">{activeArea.disease.advice}</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4 py-2">
                            <div className="w-20 h-20 rounded-xl bg-slate-50 flex items-center justify-center">
                              <Bug className="w-8 h-8 text-slate-200" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">สถานะโรคข้าว</p>
                              <h4 className="text-base font-bold text-slate-400">ยังไม่มีข้อมูล</h4>
                              <p className="text-xs text-slate-300 mt-1">กรุณาเพิ่มข้อมูลสถานะโรคข้าว</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-400">
                    <Sprout className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                    <p className="text-sm font-bold uppercase tracking-widest mb-2">ยังไม่มีข้อมูล</p>
                    <p className="text-xs text-slate-300">กรุณาเลือกพื้นที่เพื่อดูข้อมูลระยะข้าวและโรคข้าว</p>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Modal Popup */}
            {showTimelineModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                      <h2 className="text-lg font-black text-slate-800">ไทม์ไลน์ทั้งหมด</h2>
                      <p className="text-xs text-slate-400 mt-1">แปลง: {activeArea?.area_name} ({activeArea?.device_code})</p>
                    </div>
                    <button
                      onClick={() => setShowTimelineModal(false)}
                      className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Growth Timeline Section */}
                      <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                            <Sprout className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="font-bold text-slate-800">ไทม์ไลน์ระยะการเจริญเติบโต</h3>
                        </div>
                        
                        <div className="space-y-4 relative pl-6">
                          <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-emerald-200"></div>
                          
                          {activeArea?.growth_timeline && activeArea.growth_timeline.length > 0 ? (
                            activeArea.growth_timeline.map((item, idx) => (
                              <div key={idx} className="relative">
                                <div className="absolute -left-6 top-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow"></div>
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100">
                                  <div className="flex gap-4">
                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                      <img
                                        src={item.image_url || '/no-image.png'}
                                        alt={item.stage}
                                        className="object-cover w-full h-full"
                                        onError={e => { e.target.onerror = null; e.target.src = '/no-image.png'; }}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-bold mb-1">
                                        <Calendar className="w-3 h-3" />
                                        {item.date}
                                      </div>
                                      <h4 className="text-sm font-bold text-slate-800 mb-1">{item.stage}</h4>
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs text-emerald-600 font-bold">{item.confidence}%</span>
                                        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.confidence}%` }}></div>
                                        </div>
                                      </div>
                                      {item.advice && <p className="text-[10px] text-slate-500 line-clamp-2">{item.advice}</p>}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : activeArea?.growth?.stage ? (
                            <div className="relative">
                              <div className="absolute -left-6 top-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow"></div>
                              <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100">
                                <div className="flex gap-4">
                                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                    <img
                                      src={activeArea.growth?.image_url || '/no-image.png'}
                                      alt={activeArea.growth?.stage}
                                      className="object-cover w-full h-full"
                                      onError={e => { e.target.onerror = null; e.target.src = '/no-image.png'; }}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-bold mb-1">
                                      <Calendar className="w-3 h-3" />
                                      ปัจจุบัน
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-800 mb-1">{activeArea.growth?.stage}</h4>
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-xs text-emerald-600 font-bold">{activeArea.growth?.progress ?? 0}%</span>
                                      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${activeArea.growth?.progress ?? 0}%` }}></div>
                                      </div>
                                    </div>
                                    {activeArea.growth?.advice && <p className="text-[10px] text-slate-500 line-clamp-2">{activeArea.growth.advice}</p>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Sprout className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                              <p className="text-sm text-slate-400 font-bold">ยังไม่มีข้อมูลระยะการเจริญเติบโต</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Disease Timeline Section */}
                      <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-100">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
                            <Bug className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="font-bold text-slate-800">ไทม์ไลน์สถานะโรคข้าว</h3>
                        </div>
                        
                        <div className="space-y-4 relative pl-6">
                          <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-rose-200"></div>
                          
                          {activeArea?.disease_timeline && activeArea.disease_timeline.length > 0 ? (
                            activeArea.disease_timeline.map((item, idx) => (
                              <div key={idx} className="relative">
                                <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white shadow ${item.status === 'safe' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                <div className={`rounded-xl p-4 shadow-sm border ${item.status === 'safe' ? 'bg-white border-emerald-100' : 'bg-white border-rose-100'}`}>
                                  <div className="flex gap-4">
                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                      <img
                                        src={item.image_url || '/no-image.png'}
                                        alt={item.name || 'โรคข้าว'}
                                        className="object-cover w-full h-full"
                                        onError={e => { e.target.onerror = null; e.target.src = '/no-image.png'; }}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className={`flex items-center gap-2 text-[10px] font-bold mb-1 ${item.status === 'safe' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        <Calendar className="w-3 h-3" />
                                        {item.date}
                                      </div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${item.status === 'safe' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                                          {item.status === 'safe' ? (
                                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                          ) : (
                                            <Bug className="w-3.5 h-3.5 text-rose-500" />
                                          )}
                                        </div>
                                        <h4 className={`text-sm font-bold ${item.status === 'safe' ? 'text-emerald-700' : 'text-rose-700'}`}>{item.name || 'ไม่พบโรค'}</h4>
                                      </div>
                                      {item.confidence && (
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className={`text-xs font-bold ${item.status === 'safe' ? 'text-emerald-600' : 'text-rose-600'}`}>{item.confidence}%</span>
                                          <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${item.status === 'safe' ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${item.confidence}%` }}></div>
                                          </div>
                                        </div>
                                      )}
                                      <p className={`text-[10px] ${item.status === 'safe' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {item.status === 'safe' ? 'ปลอดภัย' : 'ต้องดูแลเป็นพิเศษ'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : activeArea?.disease?.status ? (
                            <div className="relative">
                              <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white shadow ${activeArea.disease?.status === 'safe' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                              <div className={`rounded-xl p-4 shadow-sm border ${activeArea.disease?.status === 'safe' ? 'bg-white border-emerald-100' : 'bg-white border-rose-100'}`}>
                                <div className="flex gap-4">
                                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                    <img
                                      src={activeArea.disease?.image_url || '/no-image.png'}
                                      alt={activeArea.disease?.name || 'โรคข้าว'}
                                      className="object-cover w-full h-full"
                                      onError={e => { e.target.onerror = null; e.target.src = '/no-image.png'; }}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className={`flex items-center gap-2 text-[10px] font-bold mb-1 ${activeArea.disease?.status === 'safe' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                      <Calendar className="w-3 h-3" />
                                      ปัจจุบัน
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className={`w-6 h-6 rounded-md flex items-center justify-center ${activeArea.disease?.status === 'safe' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                                        {activeArea.disease?.status === 'safe' ? (
                                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                        ) : (
                                          <Bug className="w-3.5 h-3.5 text-rose-500" />
                                        )}
                                      </div>
                                      <h4 className={`text-sm font-bold ${activeArea.disease?.status === 'safe' ? 'text-emerald-700' : 'text-rose-700'}`}>{activeArea.disease?.name || 'ไม่พบโรค'}</h4>
                                    </div>
                                    <p className={`text-[10px] ${activeArea.disease?.status === 'safe' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                      {activeArea.disease?.status === 'safe' ? 'ปลอดภัย' : 'ต้องดูแลเป็นพิเศษ'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Bug className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                              <p className="text-sm text-slate-400 font-bold">ยังไม่มีข้อมูลสถานะโรคข้าว</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-4 border-t border-slate-100 flex justify-end gap-3">
                    <button
                      onClick={() => setShowTimelineModal(false)}
                      className="px-6 py-2.5 bg-slate-100 text-slate-600 text-xs font-bold uppercase rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      ปิด
                    </button>
                    <Link
                      href={`/Paddy/agriculture/sensor/${activeArea?.device_code || ''}`}
                      className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase rounded-xl hover:bg-emerald-600 transition-colors inline-flex items-center gap-2"
                    >
                      ดูรายละเอียดเซนเซอร์
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
        <Footer />
      </main>
    </div>
  );
}
