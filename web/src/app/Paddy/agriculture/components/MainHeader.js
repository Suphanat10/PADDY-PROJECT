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
    const socket = io("http://localhost:8000", {
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
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [weather, setWeather] = useState(null);
  const [farmData, setFarmData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeAreaId, setActiveAreaId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // ฟังก์ชันเช็คสุขภาพพืช
  const checkHealth = useCallback((area) => {
    const alerts = [];
    let waterIssue = false;
    let diseaseIssue = false;
    if (area.sensor && area.status === "online") {
      const val = area.sensor.water_level;
      const { min = 5, max = 30 } = area.thresholds || {};
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
    [farmData, selectedFarmId],
  );

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
    if (!activeArea || !activeArea.sensor_history) return [];

    // รวม N, P, K ที่เวลาเดียวกันเข้าด้วยกัน
    const grouped = activeArea.sensor_history.reduce((acc, curr) => {
      const time = curr.time;
      if (!acc[time]) acc[time] = { time, N: 0, P: 0, K: 0 }; 

      if (curr.N !== undefined) acc[time].N = Number(curr.N);
      if (curr.P !== undefined) acc[time].P = Number(curr.P);
      if (curr.K !== undefined) acc[time].K = Number(curr.K);
    

      return acc;
    }, {});

    // กรองเฉพาะจุดที่มีข้อมูลธาตุอาหารอย่างน้อย 1 อย่าง และเรียงตามเวลา
    return Object.values(grouped)
      .filter((d) => d.N > 0 || d.P > 0 || d.K > 0)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [activeArea]);

  const waterChartData = useMemo(() => {
    if (!activeArea || !activeArea.sensor_history)
      return { data: [], events: [] };

    const thresholds = activeArea.thresholds || { min: 5, max: 30 };

    // จัดกลุ่มข้อมูลตามเวลา
    const grouped = activeArea.sensor_history.reduce((acc, curr) => {
      const time = curr.time;
      if (!acc[time]) acc[time] = { time };
      if (curr.W !== undefined) acc[time].water_level = Number(curr.W);
      return acc;
    }, {});

    const data = Object.values(grouped)
      .filter((d) => d.water_level !== undefined)
      .sort((a, b) => a.time.localeCompare(b.time));

    // สร้าง Custom Events (จุดที่น้ำผิดปกติ)
    const events = data
      .filter(
        (d) => d.water_level < thresholds.min || d.water_level > thresholds.max,
      )
      .map((d) => ({
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
                className="appearance-none bg-white border border-slate-200 text-sm font-bold py-2.5 pl-4 pr-10 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/10 cursor-pointer shadow-sm min-w-[200px]"
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

              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-50">
                <Waves className="w-4 h-4 text-cyan-500" />
                <span className="text-sm font-bold">
                  {farmInsights?.avgWater !== undefined ? `${farmInsights.avgWater} ซม.` : "--"}
                </span>
              </div>
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
                          className="bg-white border-2 border-rose-100 p-6 rounded-[2rem] flex flex-col gap-4 shadow-xl shadow-rose-500/5 group relative overflow-hidden"
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
                <div className="relative min-w-[180px]">
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
                .map((area) => (
                  <div
                    key={area.area_id}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4"
                  >
                    <div className="md:row-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                      <div className="flex items-center gap-2 mb-8 self-start">
                        <Clock className="w-5 h-5 text-purple-500" />
                        <span className="font-bold text-slate-700">
                          ระดับน้ำ (Live)
                        </span>
                        <span className="flex items-center gap-1 ml-auto">
                          <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                          <span className="text-[10px] font-black text-rose-500 uppercase">
                            Live
                          </span>
                        </span>
                      </div>
                      <div className="relative w-24 h-40 border-2 border-slate-200 rounded-xl mb-6 overflow-hidden bg-slate-50">
                        <div
                          className="absolute bottom-0 w-full bg-blue-400 transition-all duration-1000 ease-out flex items-start justify-center"
                          style={{
                            height: `${Math.min((area.sensor?.water_level / 40) * 100, 100)}%`,
                          }}
                        >
                          <div className="w-full h-1 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                          <div className="absolute -right-12 top-0 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg">
                            {area.sensor?.water_level} ซม.
                          </div>
                        </div>
                      </div>
                      <h4 className="text-2xl font-black text-emerald-600">
                        ระดับน้ำ {area.sensor?.water_level} ซม.
                      </h4>
                    </div>
                    <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
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
                    <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
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
                    <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
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
                    <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
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
                ))}
            </div>

            {/* 5. ANALYTICS CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* กราฟ Radar */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-widest mb-6">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />{" "}
                  สัดส่วนธาตุอาหาร (NPK) - แปลง {activeArea?.area_name}
                </h3>
                <div className="h-[350px]">
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
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-widest mb-6">
                  <Waves className="w-4 h-4 text-blue-500" /> แนวโน้มระดับน้ำ
                  (cm) - แปลง {activeArea?.area_name}
                </h3>
                <div className="h-[350px]">
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

            {/* 6. AREA TABLE SECTION */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-widest">
                  <Activity className="w-4 h-4 text-emerald-500" />{" "}
                  ข้อมูลพื้นที่นาทั้งหมด
                </h3>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ค้นหาแปลง..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs w-48 outline-none focus:ring-2 focus:ring-emerald-500/10 font-bold"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[13px] uppercase tracking-widest text-slate-400 font-bold bg-slate-50/30">
                      <th className="px-6 py-5">พื้นที่ / อุปกรณ์</th>
                      <th className="px-6 py-5">ความคืบหน้า</th>
                      <th className="px-6 py-5">ระดับน้ำ</th>
                      <th className="px-6 py-5">ธาตุอาหาร (N-P-K)</th>
                      <th className="px-8 py-5 text-center">สุขภาพ</th>
                      <th className="px-8 py-5 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {selectedFarm.areas
                      .filter(
                        (a) =>
                          // เงื่อนไขที่ 1: สถานะต้องเป็น active เท่านั้น
                          a.status === "active" &&
                          // เงื่อนไขที่ 2: ชื่อแปลงต้องตรงกับคำที่ค้นหา (ถ้ามี)
                          a.area_name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()),
                      )
                      .map((area) => {
                        const health = checkHealth(area);
                        return (
                          <tr
                            key={area.area_id}
                            className="hover:bg-slate-50/50 transition-colors group"
                          >
                            <td className="px-6 py-6">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-xl ${area.status === "online" || area.status === "active" ? "bg-emerald-50 text-emerald-500" : "bg-slate-50 text-slate-300"}`}
                                >
                                  <Server className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-700">
                                    {area.area_name}
                                  </p>
                                  <p className="text-[9px] text-slate-400 font-mono">
                                    {area.device_code} • {area.status}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-6">
                              <div className="space-y-1.5">
                                <p className="text-[13px] font-bold text-slate-600">
                                  {area.growth.stage}
                                </p>
                                <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500"
                                    style={{
                                      width: `${area.growth.progress}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-6">
                              <span
                                className={`text-sm font-bold ${health.waterIssue ? "text-rose-600" : "text-slate-700"}`}
                              >
                                {area.sensor?.water_level ?? "--"}{" "}
                                <span className="text-[10px] font-normal text-slate-400 ml-1">
                                  cm
                                </span>
                              </span>
                            </td>
                            <td className="px-6 py-6">
                              <div className="flex gap-1.5">
                                {["n", "p", "k"].map((k) => (
                                  <span
                                    key={k}
                                    className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100"
                                  >
                                    <span className="text-slate-300 uppercase mr-1">
                                      {k}:
                                    </span>
                                    {area.sensor?.[k] ?? "--"}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-6 text-center">
                              <div
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold border ${area.disease.status === "safe" ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-700 animate-pulse"}`}
                              >
                                {area.disease.status === "safe" ? (
                                  <ShieldCheck className="w-3 h-3" />
                                ) : (
                                  <Bug className="w-3 h-3" />
                                )}
                                {area.disease.name}
                              </div>
                            </td>
                            <td className="px-6 py-6 text-center">
                              <Link
                                href={`/Paddy/agriculture/sensor/${area.device_code}`}
                                className="px-4 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase rounded-xl hover:bg-emerald-600 transition-all inline-flex items-center gap-2 mx-auto"
                              >
                                ดูรายละเอียด
                                <ExternalLink className="w-3 h-3 opacity-50" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        <Footer />
      </main>
    </div>
  );
}
