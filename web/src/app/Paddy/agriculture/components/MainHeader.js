// "use client";
// import React, {
//   useState,
//   useEffect,
//   useMemo,
//   useCallback,
//   useRef,
// } from "react";
// import { apiFetch } from "@/lib/api";
// import Footer from "../../../components/Footer";
// import {
//   Wifi,
//   MapPin,
//   CloudSun,
//   Droplets,
//   Clock,
//   Loader2,
//   Server,
//   Search,
//   Waves,
//   DropletOff,
//   Zap,
//   Sprout,
//   AlertTriangle,
//   ChevronRight,
//   LayoutGrid,
//   Activity,
//   ChevronDown,
//   ShieldCheck,
//   Bug,
//   flame,
//   Droplet,
//   AlertCircle,
//   BarChart3,
//   LineChart as LineIcon,
//   ExternalLink,
//   X,
//   Calendar,
// } from "lucide-react";
// import Link from "next/link"; 
// import {
//   Radar,
//   RadarChart,
//   PolarGrid,
//   PolarAngleAxis,
//   PolarRadiusAxis,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   AreaChart,
//   Area,
//   Cell,
//   BarChart,
//   Bar,
//   ReferenceLine,
//   ReferenceDot,
// } from "recharts";
// import { io } from "socket.io-client";

// function useDeviceWebSocket({ deviceIds = [], onSensor, onStatus }) {
//   const socketRef = useRef(null);
//   useEffect(() => {
//     if (!deviceIds.length) return;
//     const socket = io("https://smart-paddy.space", {
//       transports: ["websocket"],
//       reconnection: true,
//     });
//     socketRef.current = socket;
//     const emitJoinEvents = () => {
//       const validIds = Array.from(new Set(deviceIds || []))
//         .map((id) => (typeof id === "string" ? id.trim() : id))
//         .filter((id) => id && id !== "N/A" && id !== "undefined" && id !== "null");

//       validIds.forEach((id) => socket.emit("join-device", id));
//       socket.emit("join-all");
//     };
//     socket.on("connect", () => {
//       console.log("📡 Connected:", socket.id);
//       emitJoinEvents();
//     });
//     socket.on("sensorData", (payload) => {
//       if (payload?.device_code && payload?.data)
//         onSensor(payload.device_code, payload.data);
//     });
//     socket.on("deviceStatus", (payload) => {
//       if (payload?.device_code && payload?.status)
//         onStatus(payload.device_code, payload.status);
//     });
//     return () => {
//       if (socket) socket.disconnect();
//     };
//   }, [JSON.stringify(deviceIds), onSensor, onStatus]);
// }

// export default function App() {
//     // Fallback logic state
//     const [wsDataReceived, setWsDataReceived] = useState(false);
//     const [fallbackTriggered, setFallbackTriggered] = useState(false);
//   const [selectedFarmId, setSelectedFarmId] = useState("");
//   const [weather, setWeather] = useState(null);
//   const [farmData, setFarmData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeAreaId, setActiveAreaId] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showTimelineModal, setShowTimelineModal] = useState(false);

//   // ฟังก์ชันเช็คสุขภาพพืช
//   const checkHealth = useCallback((area) => {
//     const alerts = [];
//     let waterIssue = false;
//     let diseaseIssue = false;
//     if (area.sensor && area.status === "online") {
//       const val = area.sensor.water_level;
//       const min = area.setting?.Water_level_min ?? area.thresholds?.min ?? 5;
//       const max = area.setting?.Water_level_mxm ?? area.setting?.Water_level_max ?? area.thresholds?.max ?? 15;
//       if (val < min) {
//         alerts.push({ type: "water", msg: `น้ำต่ำ (${val} cm)` });
//         waterIssue = true;
//       }
//       if (val > max) {
//         alerts.push({ type: "water", msg: `น้ำสูง (${val} cm)` });
//         waterIssue = true;
//       }
//     }
//     // ตรวจสอบข้อความผลวิเคราะห์โรคข้าว
//     const diseaseNormalKeywords = [
//       "ข้าวปกติ",
//       "ใบข้าวสุขภาพดี",
//       "ใบข้าวที่ดี"
//     ];
//     const diseaseName = (area.disease?.name || "").trim();
//     const isDiseaseNormal =
//       area.disease?.status === "safe" ||
//       diseaseNormalKeywords.some((kw) => diseaseName.includes(kw));

//     if (area.disease?.status === "warning" && !isDiseaseNormal) {
//       alerts.push({ type: "disease", msg: `ตรวจพบ: ${area.disease.name}` });
//       diseaseIssue = true;
//     }
//     // ถ้าโรคข้าวปกติ/สุขภาพดี/ไม่พบโรค ไม่ถือเป็นวิกฤต
//     const isCritical = alerts.length > 0 && !isDiseaseNormal;
//     return { isCritical, alerts, waterIssue, diseaseIssue, isDiseaseNormal };
//   }, []);

//   const loadDashboard = async () => {
//     setLoading(true);
//     try {
//       const res = await apiFetch("/api/data/analysis");
//       if (res?.ok && Array.isArray(res.data)) {
//         setFarmData(res.data);
//         if (res.data.length > 0)
//           setSelectedFarmId(res.data[0].farm_id.toString());
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadDashboard();
//   }, []);

//   const handleSensorData = useCallback((deviceId, incoming) => {
//     setFarmData((prev) =>
//       prev.map((farm) => ({
//         ...farm,
//         areas: farm.areas.map((area) =>
//           area.device_code === deviceId
//             ? {
//                 ...area,
//                 status: "online",
//                 sensor: {
//                   ...area.sensor,
//                   n: incoming.N ?? incoming.n ?? area.sensor?.n,
//                   p: incoming.P ?? incoming.p ?? area.sensor?.p,
//                   k: incoming.K ?? incoming.k ?? area.sensor?.k,
//                   s : incoming.S ?? incoming.s ?? area.sensor?.s,
//                   water_level:
//                     incoming.W ??
//                     incoming.water_level ??
//                     area.sensor?.water_level,
//                 },
//               }
//             : area,
//         ),
//       })),
//     );
//   }, []);

//   const handleStatusChange = useCallback((deviceId, status) => {
//     setFarmData((prev) =>
//       prev.map((farm) => ({
//         ...farm,
//         areas: farm.areas.map((area) =>
//           area.device_code === deviceId ? { ...area, status } : area,
//         ),
//       })),
//     );
//     setWsDataReceived(true);
//   }, []);

//   const allDeviceIds = useMemo(
//     () => farmData.flatMap((f) => f.areas.map((a) => a.device_code)),
//     [farmData],
//   );
//   useDeviceWebSocket({
//     deviceIds: allDeviceIds,
//     onSensor: handleSensorData,
//     onStatus: handleStatusChange,
//   });


//   const selectedFarm = useMemo(
//   () => farmData.find((f) => f.farm_id.toString() === selectedFarmId),
//   [farmData, selectedFarmId]
// );

//   // Scheduler summary for selected farm
//   const schedulerSummary = useMemo(() => {
//     if (!selectedFarm) return { total: 0, due: 0, queued: 0, not_due: 0, never_analyzed: 0, nextCheck: null };
//     const summary = { total: 0, due: 0, queued: 0, not_due: 0, never_analyzed: 0 };
//     let nextCheck = null;
//     selectedFarm.areas.forEach((a) => {
//       if (!a.scheduler) return;
//       summary.total += 1;
//       const s = a.scheduler.status;
//     setWsDataReceived(true);
//       if (s === 'due') summary.due += 1;
//       else if (s === 'queued') summary.queued += 1;
//       else if (s === 'not_due') summary.not_due += 1;
//       else if (s === 'never_analyzed') summary.never_analyzed += 1;

//       // determine next check time: prefer last_check if available, otherwise use days_remaining to compute rough date
//       if (a.scheduler.last_check) {
//         const t = new Date(a.scheduler.last_check).getTime();
//         if (!nextCheck || t < nextCheck) nextCheck = t;
//       } else if (typeof a.scheduler.days_remaining === 'number') {
//         const approx = Date.now() + a.scheduler.days_remaining * 24 * 3600 * 1000;
//         if (!nextCheck || approx < nextCheck) nextCheck = approx;
//       }
//     });
//     return { ...summary, nextCheck };
//   }, [selectedFarm]);

//   const getNPKLevel = (k, val) => {
//     const v = Number(val ?? 0);
//     if (k === "N") {
//       const om = v / 500;
//       return { level: om < 1.0 ? "ต่ำ" : om <= 2.0 ? "ปานกลาง" : "สูง", om: om };
//     }
//     if (k === "P") return { level: v < 5 ? "ต่ำ" : v <= 10 ? "ปานกลาง" : "สูง" };
//     if (k === "K") return { level: v < 60 ? "ต่ำ" : v <= 80 ? "ปานกลาง" : "สูง" };
//     return { level: "", om: 0 };
//   };

//   // Logic สำหรับข้อมูลพื้นที่ที่เลือก (ใช้สำหรับกราฟ)
//   const activeArea = useMemo(() => {
//     if (!selectedFarm) return null;
//     return (
//       selectedFarm.areas.find((a) => a.area_id === activeAreaId) ||
//       selectedFarm.areas[0]
//     );
//   }, [selectedFarm, activeAreaId]);

//   // 1. Radar Chart Data: ดึงค่าล่าสุดจาก History ของแปลงที่เลือก
//   const radarChartData = useMemo(() => {
//     if (!activeArea || !activeArea.sensor_history) return [];
//     const history = activeArea.sensor_history;
//     const getValue = (key) => {
//       const item = [...history].reverse().find((h) => h[key] !== undefined);
//       return item ? Number(item[key]) : 0;
//     };
//     return [
//       { subject: "Nitrogen (N)", value: getValue("N") },
//       { subject: "Phosphorus (P)", value: getValue("P") },
//       { subject: "Potassium (K)", value: getValue("K") },
//     ];
//   }, [activeArea]);

//   // 2. Area Chart Data: รวมข้อมูล NPKW ตามช่วงเวลาของแปลงที่เลือก
//   const areaHistoryData = useMemo(() => {
//     if (!activeArea || !activeArea.sensor_history) return [];
//     const grouped = activeArea.sensor_history.reduce((acc, curr) => {
//       const time = curr.time;
//       if (!acc[time]) acc[time] = { time };
//       if (curr.W !== undefined) acc[time].water_level = curr.W;
//       return acc;
//     }, {});
//     return Object.values(grouped).sort((a, b) => a.time.localeCompare(b.time));
//   }, [activeArea]);

//   const farmInsights = useMemo(() => {
//     if (!selectedFarm)
//       return { avgN: 0, avgP: 0, avgK: 0, avgWater: 0, activeCount: 0 };
//     const activeAreas = selectedFarm.areas.filter((a) => a.sensor);
//     const onlineCount = selectedFarm.areas.filter(
//       (a) => a.status === "online" || a.status === "active",
//     ).length;
//     if (activeAreas.length === 0)
//       return {
//         avgN: 0,
//         avgP: 0,
//         avgK: 0,
//         avgWater: 0,
//         activeCount: onlineCount,
//       };
//     const total = activeAreas.reduce(
//       (acc, curr) => ({
//         n: acc.n + (Number(curr.sensor.n) || 0),
//         p: acc.p + (Number(curr.sensor.p) || 0),
//         k: acc.k + (Number(curr.sensor.k) || 0),
//         water: acc.water + (Number(curr.sensor.water_level) || 0),
//       }),
//       { n: 0, p: 0, k: 0, water: 0 },
//     );
//     return {
//       avgN: Math.round(total.n / activeAreas.length),
//       avgP: Math.round(total.p / activeAreas.length),
//       avgK: Math.round(total.k / activeAreas.length),
//       avgWater: Math.round(total.water / activeAreas.length),
//       activeCount: onlineCount,
//     };
//   }, [selectedFarm]);

//   // กราฟที่ 1: Stacked Area Chart (สัดส่วนธาตุอาหาร NPK ตามเวลา)
//   const npkStackedData = useMemo(() => {
//   if (!activeArea?.sensor_history) return [];

//   const grouped = activeArea.sensor_history.reduce((acc, curr) => {
//     const ts = curr.timestamp; // ใช้ timestamp จริง

//     if (!acc[ts]) {
//       acc[ts] = {
//         timestamp: ts,
//         time: curr.time, // เอาไว้แสดงบนแกน X
//         N: 0,
//         P: 0,
//         K: 0
//       };
//     }

//     if (curr.N !== undefined) acc[ts].N = Number(curr.N);
//     if (curr.P !== undefined) acc[ts].P = Number(curr.P);
//     if (curr.K !== undefined) acc[ts].K = Number(curr.K);

//     return acc;
//   }, {});

//   return Object.values(grouped)
//     .filter(d => d.N > 0 || d.P > 0 || d.K > 0)
//     .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

// }, [activeArea]);

//  const waterChartData = useMemo(() => {
//   if (!activeArea?.sensor_history)
//     return { data: [], events: [], thresholds: { min: 5, max: 30 } };

//   // อ่าน thresholds จาก area.setting (Water_level_min, Water_level_mxm) หรือ area.thresholds
//   const thresholds = {
//     min: activeArea.setting?.Water_level_min ?? activeArea.thresholds?.min ?? 5,
//     max: activeArea.setting?.Water_level_mxm ?? activeArea.setting?.Water_level_max ?? activeArea.thresholds?.max ?? 30
//   };

//   const grouped = activeArea.sensor_history.reduce((acc, curr) => {
//     const ts = curr.timestamp; // ✅ ใช้ timestamp แทน time

//     if (!acc[ts]) {
//       acc[ts] = {
//         timestamp: ts,
//         time: curr.time, // ไว้แสดงบนแกน X
//         water_level: null
//       };
//     }

//     if (curr.W !== undefined) {
//       acc[ts].water_level = Number(curr.W);
//     }

//     return acc;
//   }, {});

//   const data = Object.values(grouped)
//     .filter(d => d.water_level !== null)
//     .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); 

//   const events = data
//     .filter(
//       d => d.water_level < thresholds.min || d.water_level > thresholds.max
//     )
//     .map(d => ({
//       ...d,
//       type: d.water_level < thresholds.min ? "Low" : "High",
//       color: d.water_level < thresholds.min ? "#f43f5e" : "#f59e0b",
//     }));

//   return { data, events, thresholds };

// }, [activeArea]);

//   useEffect(() => {
//     if (selectedFarm?.areas.length > 0 && !activeAreaId)
//       setActiveAreaId(selectedFarm.areas[0].area_id);
//   }, [selectedFarm, activeAreaId]);

//   useEffect(() => {
//     fetch(
//       `https://api.open-meteo.com/v1/forecast?latitude=13.75&longitude=100.5&current=temperature_2m,relative_humidity_2m`,
//     )
//       .then((r) => r.json())
//       .then((d) =>
//         setWeather({
//           temp: Math.round(d.current.temperature_2m),
//           humidity: d.current.relative_humidity_2m,
//         }),
//       )
//       .catch(() => setWeather({ temp: 32, humidity: 62 }));
//   }, []);

//   return (
//     <div className="min-h-screen bg-[#FBFBFC] pb-20 text-slate-700">
//       <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
//         {/* 1. TOP HEADER & WEATHER */}
//         <div className="flex flex-col md:flex-row justify-between items-center gap-6">
//           <div>
//             <h1 className="text-xl font-bold text-slate-800 tracking-tight">
//               ภาพรวมการทำงานของระบบ
//             </h1>
//             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
//               <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
//               การเชื่อมต่อระบบเรียลไทม์: Online
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <div className="relative">
//               <select
//                 value={selectedFarmId}
//                 onChange={(e) => setSelectedFarmId(e.target.value)}
//                 className="appearance-none bg-white border border-slate-200 text-sm font-bold py-2.5 pl-4 pr-10 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/10 cursor-pointer shadow-sm min-w-50"
//               >
//                 {farmData.map((f) => (
//                   <option key={f.farm_id} value={f.farm_id}>
//                     {f.farm_name}
//                   </option>
//                 ))}
//               </select>
//               <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
//             </div>
//             <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block" />
//             <div className="flex items-center gap-4 text-slate-500">
//               <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-50">
//                 <CloudSun className="w-4 h-4 text-blue-400" />
//                 <span className="text-sm font-bold">
//                   {weather?.temp || "--"}°C
//                 </span>
//               </div>
//               <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-50">
//                 <Droplets className="w-4 h-4 text-emerald-400" />
//                 <span className="text-sm font-bold">
//                   {weather?.humidity ?? 0}%
//                 </span>
//               </div>

//               {/* Scheduler per-device removed */}

//             </div>
//           </div>
//         </div>

//         {loading ? (
//           <div className="flex flex-col items-center justify-center py-20 gap-3">
//             <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
//             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
//               กำลังโหลดข้อมูล...
//             </p>
//           </div>
//         ) : !selectedFarm ? (
//           <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-200">
//             <LayoutGrid className="w-12 h-12 text-slate-200 mx-auto mb-4" />
//             <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
//               ไม่พบข้อมูลฟาร์ม
//             </p>
//           </div>
//         ) : (
//           <div className="space-y-10 animate-in fade-in duration-500">
//             {/* 2. ACTION REQUIRED (ALERTS) */}
//             {selectedFarm.areas.some((a) => checkHealth(a).isCritical) && (
//               <div className="space-y-4">
//                 <div className="flex items-center gap-2 mb-2">
//                   <Zap className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
//                   <h2 className="text-lg font-bold text-slate-800">
//                     พื้นที่ที่ต้องดูแลเป็นพิเศษ
//                   </h2>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {selectedFarm.areas
//                     .filter((a) => checkHealth(a).isCritical)
//                     .map((area, idx) => {
//                       const health = checkHealth(area);
//                       const isDiseaseNormal = health.isDiseaseNormal;
//                       return (
//                         <div
//                           key={area.area_id || idx}
//                           className={`bg-white border-2 ${isDiseaseNormal ? "border-emerald-400" : "border-rose-100"} p-6 rounded-4xl flex flex-col gap-4 shadow-xl ${isDiseaseNormal ? "shadow-emerald-500/10" : "shadow-rose-500/5"} group relative overflow-hidden`}
//                         >
//                           <div className="flex justify-between items-start z-10">
//                             <div>
//                               <h4 className="font-black text-slate-800 text-xl">
//                                 {area.area_name}
//                               </h4>
//                               <p
//                                 className={`text-[10px] font-bold uppercase tracking-widest ${isDiseaseNormal ? "text-emerald-600" : "text-rose-400"}`}
//                               >
//                                 {isDiseaseNormal ? "✔️ ปกติ (ไม่พบโรค)" : "🚨 ภาวะวิกฤต"}
//                               </p>
//                             </div>
//                             <div className="flex gap-1.5">
//                               {health.waterIssue && (
//                                 <div className="p-2.5 bg-blue-50 text-blue-500 rounded-2xl border border-blue-100">
//                                   <Droplet className="w-5 h-5" />
//                                 </div>
//                               )}
//                               {health.diseaseIssue && !isDiseaseNormal && (
//                                 <div className="p-2.5 bg-rose-50 text-rose-500 rounded-2xl border border-rose-100">
//                                   <Bug className="w-5 h-5" />
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                           <div className="space-y-2">
//                             {health.alerts.map((alert, i) => (
//                               <div
//                                 key={i}
//                                 className={`flex items-center gap-3 p-3 rounded-2xl text-[12px] font-bold border ${alert.type === "water" ? "bg-blue-50/50 border-blue-100 text-blue-700" : isDiseaseNormal ? "bg-emerald-50 border-emerald-400 text-emerald-700" : "bg-rose-50/50 border-rose-100 text-rose-700"}`}
//                               >
//                                 <AlertCircle className="w-4 h-4" />
//                                 <span>{alert.msg}</span>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       );
//                     })}
//                 </div>
//               </div>
//             )}

//             {/* 3. OVERVIEW STATS CARDS */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//               <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
//                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
//                   ระดับน้ำเฉลี่ยในฟาร์ม
//                 </p>
//                 <div className="flex items-end justify-between">
//                   <span className="text-4xl font-black text-slate-800">
//                     {farmInsights.avgWater}
//                     <span className="text-sm text-slate-400 ml-1">ซม.</span>
//                   </span>
//                   <Waves className="w-8 h-8 text-blue-500" />
//                 </div>
//               </div>
//               <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
//                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
//                   อุปกรณ์ที่ Online
//                 </p>
//                 <div className="flex items-end justify-between">
//                   <span className="text-4xl font-black text-slate-800">
//                     {farmInsights.activeCount} / {selectedFarm.areas.length}
//                   </span>
//                   <Server className="w-8 h-8 text-slate-500" />
//                 </div>
//               </div>
//               <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm col-span-1 lg:col-span-2">
//                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
//                   สมดุลธาตุอาหารรวม (NPK)
//                 </p>
//                 <div className="grid grid-cols-3 gap-3 mt-2">
//                   {["N", "P", "K"].map((k) => {
//                     const val = farmInsights[`avg${k}`] ?? 0;
//                     const info = getNPKLevel(k, val);
//                     return (
//                       <div
//                         key={k}
//                         className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100"
//                       >
//                         <p className="text-[8px] font-bold text-slate-400 mb-0.5">
//                           {k} Value
//                         </p>
//                         <p className="text-lg font-black text-slate-700">{val}</p>
//                         {k === "N" && (
//                           <p className="text-xs text-slate-400 mt-1">
//                             ค่าปุ๋ย (OM): {Number(info.om ?? 0).toFixed(2)}
//                           </p>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>

//             {/* 4. LIVE MONITORING */}
//             <div className="space-y-6">
//               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center">
//                     <Activity className="w-5 h-5 text-rose-500" />
//                   </div>
//                   <div>
//                     <h2 className="text-lg font-bold text-slate-800">
//                       การติดตามผลแบบเรียลไทม์ (Live Monitoring)
//                     </h2>
//                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
//                       ข้อมูลล่าสุดจากเซนเซอร์ผ่าน WebSocket
//                     </p>
//                   </div>
//                 </div>
//                 <div className="relative min-w-45">
//                   <select
//                     value={activeAreaId ?? ""}
//                     onChange={(e) => setActiveAreaId(Number(e.target.value))}
//                     className="w-full appearance-none bg-white border border-slate-200 text-[12px] font-bold py-2.5 pl-4 pr-10 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/10 cursor-pointer shadow-sm transition-all"
//                   >
//                     {selectedFarm.areas.map((area) => (
//                       <option key={area.area_id} value={area.area_id}>
//                         แปลง: {area.area_name}
//                       </option>
//                     ))}
//                   </select>
//                   <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
//                 </div>
//               </div>

//               {selectedFarm.areas
//                 .filter((a) => a.area_id === activeAreaId)
//                 .map((area) => {
//                   // คำนวณระดับ OM, N, P, K
//                   const n_mgkg = Number(area.sensor?.n ?? 0);
//                   const p_mgkg = Number(area.sensor?.p ?? 0);
//                   const k_mgkg = Number(area.sensor?.k ?? 0);
//                   const calculatedOM = n_mgkg / 500;
//                   const omLevel = calculatedOM < 1.0 ? "ต่ำ" : calculatedOM <= 2.0 ? "ปานกลาง" : "สูง";
//                   const pLevel = p_mgkg < 5 ? "ต่ำ" : p_mgkg <= 10 ? "ปานกลาง" : "สูง";
//                   const kLevel = k_mgkg < 60 ? "ต่ำ" : k_mgkg <= 80 ? "ปานกลาง" : "สูง";
//                   const nLevel = n_mgkg < 10 ? "ต่ำ" : n_mgkg <= 20 ? "ปานกลาง" : "สูง";
//                   // ตรวจสอบว่ามีข้อมูลเซนเซอร์หรือไม่
//                   const hasNoSensorData = !area.sensor || (
//                     area.sensor.water_level === null && 
//                     area.sensor.water_level === undefined &&
//                     area.sensor.n === null && 
//                     area.sensor.n === undefined
//                   );
//                   const isOffline = area.status === 'offline';
                  
//                   // หากไม่มีข้อมูลหรือ offline ให้แสดงหน้าจอ connecting
//                   if (isOffline || (hasNoSensorData && area.status !== 'online' && area.status !== 'active')) {
//                     return (
//                       <div key={area.area_id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center">
//                         <div className="flex flex-col items-center justify-center gap-4">
//                           <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center animate-pulse">
//                             <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
//                           </div>
//                           <div>
//                             <h3 className="text-lg font-bold text-slate-700 mb-1">กำลังเชื่อมต่อ...</h3>
//                             <p className="text-sm text-slate-400">รอรับข้อมูลจากเซนเซอร์ แปลง {area.area_name}</p>
//                           </div>
//                           <div className="flex items-center gap-2 mt-2">
//                             <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
//                             <span className="text-xs font-medium text-amber-600">รอการเชื่อมต่อ WebSocket</span>
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   }
                  
//                   const waterLevel = area.sensor?.water_level ?? 0;
//                   const minThreshold = area.thresholds?.min ;
//                   const maxThreshold = area.thresholds?.max;
//                   const maxScale =30;
                  
//                   // คำนวณสถานะระดับน้ำ
//                   let waterStatus = 'normal';
//                   let statusText = 'ปกติ';
//                   let statusColor = 'text-emerald-600';
//                   let statusBg = 'bg-emerald-50';
//                   let barColor = 'bg-blue-400';
                  
//                   if (waterLevel < minThreshold) {
//                     waterStatus = 'low';
//                     statusText = 'ต่ำเกินไป';
//                     statusColor = 'text-rose-600';
//                     statusBg = 'bg-rose-50';
//                     barColor = 'bg-rose-400';
//                   } else if (waterLevel > maxThreshold) {
//                     waterStatus = 'high';
//                     statusText = 'สูงเกินไป';
//                     statusColor = 'text-amber-600';
//                     statusBg = 'bg-amber-50';
//                     barColor = 'bg-amber-400';
//                   }
                  
//                   return (
//                   <div
//                     key={area.area_id}
//                     className="grid grid-cols-1 md:grid-cols-4 gap-4"
//                   >
//                     <div className="md:row-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
//                       {/* Header */}
//                       <div className="flex items-center justify-between mb-6">
//                         <div className="flex items-center gap-2">
//                           <Clock className="w-5 h-5 text-purple-500" />
//                           <span className="font-bold text-sky-500 text-lg">
//                             ระดับน้ำ (Live)
//                           </span>
//                         </div>
//                         <div className="flex items-center gap-1.5">
//                           <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
//                           <span className="text-xs font-bold text-rose-500 uppercase">
//                             Live
//                           </span>
//                         </div>
//                       </div>
                      
//                       {/* Water Tank Visualization */}
//                       <div className="flex-1 flex items-center justify-center">
//                         <div className="relative">
//                           {/* Tank Container */}
//                           <div className="relative w-28 h-40 border-4 border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
//                             {/* Water Fill - ใช้ maxScale คำนวณเพื่อให้น้ำเกิน MAX ได้ */}
//                             <div
//                               className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out ${
//                                 waterStatus === 'low' ? 'bg-gradient-to-t from-rose-400 to-rose-300' : 
//                                 waterStatus === 'high' ? 'bg-gradient-to-t from-amber-400 to-amber-300' : 
//                                 'bg-gradient-to-t from-sky-500 to-sky-400'
//                               }`}
//                               style={{
//                                 height: `${Math.min((waterLevel / maxScale) * 100, 100)}%`,
//                               }}
//                             >
//                               {/* Water surface shine */}
//                               <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/40" />
//                             </div>
                            
//                             {/* MAX Threshold Line */}
//                             <div 
//                               className="absolute w-full z-10 flex items-center"
//                               style={{ bottom: `${(maxThreshold / maxScale) * 100}%` }}
//                             >
//                               <div className="flex-1 border-t-2 border-dashed border-amber-500" />
//                             </div>
                            
//                             {/* MIN Threshold Line */}
//                             <div 
//                               className="absolute w-full z-10 flex items-center"
//                               style={{ bottom: `${(minThreshold / maxScale) * 100}%` }}
//                             >
//                               <div className="flex-1 border-t-2 border-dashed border-rose-500" />
//                             </div>
                            
//                             {/* Current Level Line (Red solid line) */}
//                             <div 
//                               className="absolute w-full z-20 transition-all duration-1000"
//                               style={{ bottom: `${Math.min((waterLevel / maxScale) * 100, 100)}%` }}
//                             >
//                               <div className="w-full border-t-[3px] border-rose-500" />
//                             </div>
//                           </div>
                          
//                           {/* Current Level Label (Right side) */}
//                           <div 
//                             className="absolute -left-16 transition-all duration-1000 flex items-center"
//                             style={{ bottom: `calc(${Math.min((waterLevel / maxScale) * 100, 100)}% - 8px)` }}
//                           >
//                             <div className="bg-rose-500 text-white px-2 py-1 rounded-lg text-sm font-bold whitespace-nowrap">
//                               {waterLevel} ซม.
//                             </div>
//                           </div>
                          
//                           {/* MAX Label (Right side) */}
//                           <div 
//                             className="absolute -right-12 transition-all duration-300 flex items-center"
//                             style={{ bottom: `calc(${(maxThreshold / maxScale) * 100}% - 8px)` }}
//                           >
//                              <span className="text-xs font-bold text-amber-600">{maxThreshold} ซม.</span>
//                           </div>
                          
//                           {/* MIN Label (Right side) */}
//                           <div 
//                             className="absolute -right-12 transition-all duration-300 flex items-center"
//                             style={{ bottom: `calc(${(minThreshold / maxScale) * 100}% - 8px)` }}
//                           >
//                              <span className="text-xs font-bold text-amber-600">{minThreshold} ซม.</span>
//                           </div>
//                         </div>
//                       </div>
                      
//                       {/* Bottom Status Text */}
//                       <div className="text-center mt-6">
//                         <p className={`text-2xl font-black ${
//                           waterStatus === 'low' ? 'text-rose-500' : 
//                           waterStatus === 'high' ? 'text-amber-500' : 
//                           'text-sky-500'
//                         }`}>
//                           ระดับน้ำ {waterLevel} ซม.
//                         </p>
//                         <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full ${
//                           waterStatus === 'low' ? 'bg-rose-100 text-rose-600' : 
//                           waterStatus === 'high' ? 'bg-amber-100 text-amber-600' : 
//                           'bg-emerald-100 text-emerald-600'
//                         }`}>
//                           <span className={`w-2 h-2 rounded-full ${
//                             waterStatus === 'low' ? 'bg-rose-500' : 
//                             waterStatus === 'high' ? 'bg-amber-500' : 
//                             'bg-emerald-500'
//                           }`} />
//                           <span className="text-sm font-bold">
//                             {waterStatus === 'low' ? 'ต่ำกว่าเกณฑ์' : 
//                              waterStatus === 'high' ? 'สูงกว่าเกณฑ์' : 
//                              'อยู่ในเกณฑ์ปกติ'}
//                           </span>
//                         </div>
//                         <p className="text-xs text-slate-400 mt-2">
//                           ช่วงที่เหมาะสม: {minThreshold} - {maxThreshold} ซม.
//                         </p>
//                       </div>
//                     </div>
//                     <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
//                       <div className="bg-emerald-50/50 px-6 py-4 flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm border border-emerald-100">
//                             <Sprout className="w-4 h-4 text-emerald-500" />
//                           </div>
//                           <div>
//                             <p className="text-xs font-black text-slate-800">
//                               ไนโตรเจน (N)
//                             </p>
//                             <p className="text-[10px] text-slate-400 font-bold">
//                               ค่าปัจจุบัน
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="p-8 text-center">
//                         <p className="text-3xl font-black text-emerald-500">
//                           {area.sensor?.n}{" "}
//                           <span className="text-sm text-slate-400 ml-1">mg/kg</span>
//                         </p>
//                         <p className="text-xs mt-2 font-bold text-emerald-600">ระดับ: {nLevel}</p>
//                       </div>
//                     </div>
//                     <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
//                       <div className="bg-orange-50/50 px-6 py-4 flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm border border-orange-100">
//                             <Droplet className="w-4 h-4 text-orange-500" />
//                           </div>
//                           <div>
//                             <p className="text-xs font-black text-slate-800">
//                               ฟอสฟอรัส (P)
//                             </p>
//                             <p className="text-[10px] text-slate-400 font-bold">
//                               ค่าปัจจุบัน
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="p-8 text-center">
//                         <p className="text-3xl font-black text-orange-500">
//                           {area.sensor?.p}{" "}
//                           <span className="text-sm text-slate-400 ml-1">mg/kg</span>
//                         </p>
//                         <p className="text-xs mt-2 font-bold text-orange-600">ระดับ: {pLevel}</p>
//                       </div>
//                     </div>
//                     <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
//                       <div className="bg-purple-50/50 px-6 py-4 flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm border border-purple-100">
//                             <Zap className="w-4 h-4 text-purple-500" />
//                           </div>
//                           <div>
//                             <p className="text-xs font-black text-slate-800">
//                               โพแทสเซียม (K)
//                             </p>
//                             <p className="text-[10px] text-slate-400 font-bold">
//                               ค่าปัจจุบัน
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="p-8 text-center">
//                         <p className="text-3xl font-black text-purple-500">
//                           {area.sensor?.k}{" "}
//                           <span className="text-sm text-slate-400 ml-1">mg/kg</span>
//                         </p>
//                         <p className="text-xs mt-2 font-bold text-purple-600">ระดับ: {kLevel}</p>
//                       </div>
//                     </div>
//                     {/* soil moisture removed as requested */}
//                   </div>
//                 )})}
//             </div>

//             {/* 5. ANALYTICS CHARTS */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {/* กราฟ Radar */}
//               <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
//                 <div className="flex items-center justify-between mb-6">
//                   <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-widest">
//                     <BarChart3 className="w-4 h-4 text-emerald-500" /> สัดส่วนธาตุอาหาร
//                     (NPK) - แปลง {activeArea?.area_name}
//                   </h3>
//                   <Link
//                     href={`/Paddy/agriculture/sensor/${activeArea?.device_code || ''}`}
//                     className="px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-600 transition-all inline-flex items-center gap-1.5"
//                   >
//                     ดูข้อมูลย้อนหลัง 30 วัน
//                     <ExternalLink className="w-3 h-3" />
//                   </Link>
//                 </div>
//                 <div className="h-87.5">
//                   {npkStackedData.length > 0 ? (
//                     <ResponsiveContainer width="100%" height="100%">
//                       <AreaChart
//                         data={npkStackedData}
//                         margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
//                       >
//                         <CartesianGrid
//                           strokeDasharray="3 3"
//                           vertical={false}
//                           stroke="#f1f5f9"
//                         />
//                         <XAxis
//                           dataKey="time"
//                           axisLine={false}
//                           tickLine={false}
//                           tick={{ fontSize: 10, fill: "#94a3b8" }}
//                         />
//                         <YAxis
//                           axisLine={false}
//                           tickLine={false}
//                           tick={{ fontSize: 10, fill: "#94a3b8" }}
//                         />
//                         <Tooltip
//                           contentStyle={{
//                             borderRadius: "16px",
//                             border: "none",
//                             boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
//                           }}
//                         />
//                         <Legend
//                           verticalAlign="top"
//                           align="right"
//                           iconType="circle"
//                           wrapperStyle={{
//                             fontSize: "10px",
//                             fontWeight: "bold",
//                             paddingBottom: "20px",
//                           }}
//                         />

//                         {/* ไนโตรเจน - สีเขียว */}
//                         <Area
//                           type="monotone"
//                           dataKey="N"
//                           stackId="1"
//                           stroke="#10b981"
//                           fill="#10b981"
//                           fillOpacity={0.6}
//                         />
//                         {/* ฟอสฟอรัส - สีส้ม */}
//                         <Area
//                           type="monotone"
//                           dataKey="P"
//                           stackId="1"
//                           stroke="#f97316"
//                           fill="#f97316"
//                           fillOpacity={0.6}
//                         />
//                         {/* โพแทสเซียม - สีม่วง */}
//                         <Area
//                           type="monotone"
//                           dataKey="K"
//                           stackId="1"
//                           stroke="#a855f7"
//                           fill="#a855f7"
//                           fillOpacity={0.6}
//                         />
//                       </AreaChart>
//                     </ResponsiveContainer>
//                   ) : (
//                     <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold">
//                       ไม่มีข้อมูลประวัติธาตุอาหาร
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* กราฟแนวโน้มระดับน้ำ */}
//               <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
//                 <div className="flex items-center justify-between mb-6">
//                   <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-widest">
//                     <Waves className="w-4 h-4 text-blue-500" /> แนวโน้มระดับน้ำ
//                     (cm) - แปลง {activeArea?.area_name}
//                   </h3>
//                   <Link
//                     href={`/Paddy/agriculture/sensor/${activeArea?.device_code || ''}`}
//                     className="px-3 py-1.5 bg-blue-500 text-white text-[10px] font-bold rounded-lg hover:bg-blue-600 transition-all inline-flex items-center gap-1.5"
//                   >
//                     ดูข้อมูลย้อนหลัง 30 วัน
//                     <ExternalLink className="w-3 h-3" />
//                   </Link>
//                 </div>
//                 <div className="h-87.5">
//                   {waterChartData.data.length > 0 ? (
//                     <ResponsiveContainer width="100%" height="100%">
//                       <AreaChart data={waterChartData.data}>
//                         <defs>
//                           <linearGradient
//                             id="colorWater"
//                             x1="0"
//                             y1="0"
//                             x2="0"
//                             y2="1"
//                           >
//                             <stop
//                               offset="5%"
//                               stopColor="#3b82f6"
//                               stopOpacity={0.3}
//                             />
//                             <stop
//                               offset="95%"
//                               stopColor="#3b82f6"
//                               stopOpacity={0}
//                             />
//                           </linearGradient>
//                         </defs>
//                         <CartesianGrid
//                           strokeDasharray="3 3"
//                           vertical={false}
//                           stroke="#f1f5f9"
//                         />
//                         <XAxis
//                           dataKey="time"
//                           axisLine={false}
//                           tickLine={false}
//                           tick={{ fontSize: 10, fill: "#94a3b8" }}
//                         />
//                         <YAxis
//                           axisLine={false}
//                           tickLine={false}
//                           tick={{ fontSize: 10, fill: "#94a3b8" }}
//                         />
//                         <Tooltip
//                           contentStyle={{
//                             borderRadius: "16px",
//                             border: "none",
//                             boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
//                           }}
//                           cursor={{
//                             stroke: "#3b82f6",
//                             strokeWidth: 1,
//                             strokeDasharray: "4 4",
//                           }}
//                         />

//                         {/* เส้นเกณฑ์ Min / Max (Thresholds) */}
//                         <ReferenceLine
//                           y={waterChartData.thresholds.max}
//                           stroke="#f59e0b"
//                           strokeDasharray="3 3"
//                           label={{
//                             position: "right",
//                             value: "Max",
//                             fill: "#f59e0b",
//                             fontSize: 10,
//                           }}
//                         />
//                         <ReferenceLine
//                           y={waterChartData.thresholds.min}
//                           stroke="#f43f5e"
//                           strokeDasharray="3 3"
//                           label={{
//                             position: "right",
//                             value: "Min",
//                             fill: "#f43f5e",
//                             fontSize: 10,
//                           }}
//                         />

//                         <Area
//                           type="monotone"
//                           dataKey="water_level"
//                           stroke="#3b82f6"
//                           strokeWidth={3}
//                           fill="url(#colorWater)"
//                           animationDuration={1500}
//                         />

//                         {/* วาดจุด Custom Events เมื่อค่าน้ำผิดปกติ */}
//                         {waterChartData.events.map((event, idx) => (
//                           <ReferenceDot
//                             key={idx}
//                             x={event.time}
//                             y={event.water_level}
//                             r={5}
//                             fill={event.color}
//                             stroke="#fff"
//                             strokeWidth={2}
//                           />
//                         ))}
//                       </AreaChart>
//                     </ResponsiveContainer>
//                   ) : (
//                     <div className="h-full flex flex-col items-center justify-center text-slate-400">
//                       <Waves className="w-12 h-12 text-slate-100 mb-3" />
//                       <p className="text-xs font-bold uppercase tracking-widest">
//                         ยังไม่มีข้อมูลประวัติระดับน้ำ
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Scheduler summary (below graphs) */}
//             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-widest">
//                   <Calendar className="w-4 h-4 text-emerald-500" /> ตารางวิเคราะห์
//                 </h3>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {activeArea && activeArea.scheduler ? (
//                   <div key={activeArea.area_id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
//                     <div className="flex items-start justify-between gap-4">
//                       <div className="min-w-0">
//                         <div className="flex items-center gap-3">
//                           <Calendar className="w-5 h-5 text-emerald-500 flex-shrink-0" />
//                           <div className="truncate">
//                             <div className="font-bold text-sm text-slate-800 truncate">{activeArea.area_name}</div>
//                             <div className="text-[12px] text-slate-500 truncate">{activeArea.device_code || "-"}</div>
//                           </div>
//                         </div>
//                         <div className="mt-3 text-sm text-slate-600 flex items-center gap-2">
//                           <span className="inline-flex items-center gap-2">
//                             <svg className="w-3 h-3 text-slate-400" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4" /></svg>
//                             <span className="font-medium">
//                               {activeArea.scheduler.status === "due"
//                                 ? "ถึงกำหนดวิเคราะห์"
//                                 : activeArea.scheduler.status === "queued"
//                                 ? "ออกคำสั่งแล้ว รอวิเคราะห์"
//                                 : activeArea.scheduler.status === "not_due"
//                                 ? "ยังไม่ถึงกำหนด"
//                                 : activeArea.scheduler.status === "never_analyzed"
//                                 ? "ยังไม่เคยวิเคราะห์"
//                                 : "ไม่ทราบสถานะ"}
//                             </span>
//                           </span>
//                           <span className="text-slate-400">·</span>
//                           <span className="text-slate-500">
//                             {typeof activeArea.scheduler.days_remaining === "number"
//                               ? `${activeArea.scheduler.days_remaining} วัน คงเหลือ`
//                               : activeArea.scheduler.last_check
//                               ? `${new Date(activeArea.scheduler.last_check).toLocaleString("th-TH", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`
//                               : "-"}
//                           </span>
//                         </div>
//                       </div>
//                       <div className="flex-shrink-0 flex flex-col items-end">
//                         <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
//                           activeArea.scheduler.status === 'due' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
//                           activeArea.scheduler.status === 'queued' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
//                           activeArea.scheduler.status === 'not_due' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
//                           'bg-slate-50 text-slate-600 border border-slate-100'
//                         }` }>
//                           {activeArea.scheduler.status === 'due' ? 'ถึงกำหนด' : activeArea.scheduler.status === 'queued' ? 'คิว' : activeArea.scheduler.status === 'not_due' ? 'ยังไม่ถึง' : activeArea.scheduler.status}
//                         </div>
//                         <div className="mt-2 text-[11px] text-slate-400">ล่าสุด: {activeArea.scheduler.last_check ? new Date(activeArea.scheduler.last_check).toLocaleString('th-TH', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}</div>
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="text-sm text-slate-400 col-span-full">ยังไม่มีข้อมูลตารางวิเคราะห์สำหรับพื้นที่ที่เลือก</div>
//                 )}
//               </div>
//             </div>

//             {/* 6. Rice Stage & Disease Timeline */}
//             <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
//               <div className="p-6">
//                 <div className="flex items-center justify-between mb-6">
//                   <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-widest">
//                     <Sprout className="w-4 h-4 text-emerald-500" /> ระยะข้าวและโรคข้าว - แปลง {activeArea?.area_name}
//                   </h3>
//                   <button
//                     onClick={() => setShowTimelineModal(true)}
//                     className="px-4 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase rounded-xl hover:bg-emerald-600 transition-all inline-flex items-center gap-2"
//                   >
//                     ดูไทม์ไลน์ทั้งหมด
//                     <ChevronRight className="w-3 h-3" />
//                   </button>
//                 </div>

//                 {activeArea ? (
//                   <div className="relative pl-10">
//                     {/* Vertical Timeline Line */}
//                     <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-slate-200"></div>

//                     {/* Growth Stage Item */}
//                     <div className="relative pb-8">
//                       {/* Timeline Dot */}
//                       <div className="absolute -left-10 top-2 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
//                         <Sprout className="w-3.5 h-3.5 text-white" />
//                       </div>
//                       {/* Content Card */}
//                       <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
//                         {activeArea.growth?.stage ? (
//                           <div className="flex flex-col sm:flex-row items-start gap-5">
//                             <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 shrink-0 shadow-inner border-2 border-white">
//                               <img
//                                 src={activeArea.growth?.image_url || '/no-image.png'}
//                                 alt="ระยะข้าว"
//                                 className="object-cover w-full h-full"
//                                 onError={e => { e.target.onerror = null; e.target.src = '/no-image.png'; }}
//                               />
//                             </div>
//                             <div className="flex-1 min-w-0">
//                               <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">ระยะการเจริญเติบโต</p>
//                               <h4 className="text-xl font-black text-slate-800 mb-2">{activeArea.growth?.stage}</h4>
//                               <div className="flex items-center gap-3 mb-3">
//                                 <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
//                                   <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${activeArea.growth?.progress ?? 0}%` }}></div>
//                                 </div>
//                                 <span className="text-sm font-bold text-emerald-600">{activeArea.growth?.progress ?? 0}%</span>
//                               </div>
//                               {activeArea.growth?.advice && (
//                                 <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-4 leading-relaxed">{activeArea.growth.advice}</p>
//                               )}
//                             </div>
//                           </div>
//                         ) : (
//                           <div className="flex items-center gap-4 py-4">
//                             <div className="w-20 h-20 rounded-xl bg-slate-50 flex items-center justify-center">
//                               <Sprout className="w-8 h-8 text-slate-200" />
//                             </div>
//                             <div>
//                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">ระยะการเจริญเติบโต</p>
//                               <h4 className="text-base font-bold text-slate-400">ยังไม่มีข้อมูล</h4>
//                               <p className="text-xs text-slate-300 mt-1">กรุณาเพิ่มข้อมูลระยะการเจริญเติบโต</p>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     {/* Disease Status Item */}
//                     <div className="relative">
//                       {/* Timeline Dot */}
//                       <div className={`absolute -left-10 top-2 w-7 h-7 rounded-full flex items-center justify-center shadow-lg ${activeArea.disease?.name === 'ใบข้าวที่ดี' ? 'bg-emerald-500 shadow-emerald-200' : activeArea.disease?.name ? 'bg-rose-500 shadow-rose-200 animate-pulse' : 'bg-slate-300 shadow-slate-100'}`}>
//                         {activeArea.disease?.name === 'ใบข้าวที่ดี' ? (
//                           <ShieldCheck className="w-3.5 h-3.5 text-white" />
//                         ) : activeArea.disease?.name ? (
//                           <Bug className="w-3.5 h-3.5 text-white" />
//                         ) : (
//                           <AlertCircle className="w-3.5 h-3.5 text-white" />
//                         )}
//                       </div>
//                       {/* Content Card */}
//                       <div className={`border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow ${activeArea.disease?.name === 'ใบข้าวที่ดี' ? 'bg-white border-emerald-100' : activeArea.disease?.name ? 'bg-rose-50/50 border-rose-100' : 'bg-slate-50/50 border-slate-100'}`}>
//                         {activeArea.disease?.status ? (
//                           <div className="flex flex-col sm:flex-row items-start gap-5">
//                             <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 shrink-0 shadow-inner border-2 border-white">
//                               <img
//                                 src={activeArea.disease?.image_url || '/no-image.png'}
//                                 alt="สถานะโรคข้าว"
//                                 className="object-cover w-full h-full"
//                                 onError={e => { e.target.onerror = null; e.target.src = '/no-image.png'; }}
//                               />
//                             </div>
//                             <div className="flex-1 min-w-0">
//                               <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${activeArea.disease?.name === 'ใบข้าวที่ดี' ? 'text-emerald-500' : 'text-rose-500'}`}>สถานะโรคข้าว</p>
//                               <h4 className={`text-xl font-black mb-2 ${activeArea.disease?.name === 'ใบข้าวที่ดี' ? 'text-slate-800' : 'text-rose-700'}`}>
//                                 {activeArea.disease?.name || 'ไม่พบโรค'}
//                               </h4>
//                               <div className="flex items-center gap-2 mb-2">
//                                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeArea.disease?.name === 'ใบข้าวที่ดี' ? 'bg-emerald-50' : 'bg-rose-100'}`}>
//                                   {activeArea.disease?.name === 'ใบข้าวที่ดี' ? (
//                                     <ShieldCheck className="w-5 h-5 text-emerald-500" />
//                                   ) : (
//                                     <Bug className="w-5 h-5 text-rose-500" />
//                                   )}
//                                 </div>
//                                 <p className={`text-sm font-bold ${activeArea.disease?.name === 'ใบข้าวที่ดี' ? 'text-emerald-600' : 'text-rose-600'}`}>
//                                   {activeArea.disease?.name === 'ใบข้าวที่ดี' ? 'ปลอดภัย' : 'ต้องดูแลเป็นพิเศษ'}
//                                 </p>
//                               </div>
//                               {activeArea.disease?.advice && (
//                                 <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-4 leading-relaxed">{activeArea.disease.advice}</p>
//                               )}
//                             </div>
//                           </div>
//                         ) : (
//                           <div className="flex items-center gap-4 py-2">
//                             <div className="w-20 h-20 rounded-xl bg-slate-50 flex items-center justify-center">
//                               <Bug className="w-8 h-8 text-slate-200" />
//                             </div>
//                             <div>
//                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">สถานะโรคข้าว</p>
//                               <h4 className="text-base font-bold text-slate-400">ยังไม่มีข้อมูล</h4>
//                               <p className="text-xs text-slate-300 mt-1">กรุณาเพิ่มข้อมูลสถานะโรคข้าว</p>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="text-center py-16 text-slate-400">
//                     <Sprout className="w-16 h-16 mx-auto mb-4 text-slate-200" />
//                     <p className="text-sm font-bold uppercase tracking-widest mb-2">ยังไม่มีข้อมูล</p>
//                     <p className="text-xs text-slate-300">กรุณาเลือกพื้นที่เพื่อดูข้อมูลระยะข้าวและโรคข้าว</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Timeline Modal Popup */}
//             {showTimelineModal && (
//               <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
//                 <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
//                   {/* Modal Header */}
//                   <div className="flex items-center justify-between p-6 border-b border-slate-100">
//                     <div>
//                       <h2 className="text-lg font-black text-slate-800">ไทม์ไลน์ทั้งหมด</h2>
//                       <p className="text-xs text-slate-400 mt-1">แปลง: {activeArea?.area_name} ({activeArea?.device_code})</p>
//                     </div>
//                     <button
//                       onClick={() => setShowTimelineModal(false)}
//                       className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
//                     >
//                       <X className="w-5 h-5 text-slate-500" />
//                     </button>
//                   </div>

//                   {/* Modal Content */}
//                   <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                       {/* Growth Timeline Section */}
//                       <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100">
//                         <div className="flex items-center gap-2 mb-4">
//                           <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
//                             <Sprout className="w-4 h-4 text-white" />
//                           </div>
//                           <h3 className="font-bold text-slate-800">ไทม์ไลน์ระยะการเจริญเติบโต</h3>
//                         </div>
                        
//                         <div className="space-y-4 relative pl-6">
//                           <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-emerald-200"></div>
                          
//                           {activeArea?.growth_timeline && activeArea.growth_timeline.length > 0 ? (
//                             activeArea.growth_timeline.map((item, idx) => (
//                               <div key={idx} className="relative">
//                                 <div className="absolute -left-6 top-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow"></div>
//                                 <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100">
//                                   <div className="flex gap-4">
//                                     <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0">
//                                       <img
//                                         src={item.image_url || '/no-image.png'}
//                                         alt={item.stage}
//                                         className="object-cover w-full h-full"
//                                         onError={e => { e.target.onerror = null; e.target.src = '/no-image.png'; }}
//                                       />
//                                     </div>
//                                     <div className="flex-1 min-w-0">
//                                       <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-bold mb-1">
//                                         <Calendar className="w-3 h-3" />
//                                         {item.date}
//                                       </div>
//                                       <h4 className="text-sm font-bold text-slate-800 mb-1">{item.stage}</h4>
//                                       <div className="flex items-center gap-2 mb-2">
//                                         <span className="text-xs text-emerald-600 font-bold">{item.confidence}%</span>
//                                         <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
//                                           <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.confidence}%` }}></div>
//                                         </div>
//                                       </div>
//                                       {item.advice && <p className="text-[10px] text-slate-500 line-clamp-2">{item.advice}</p>}
//                                     </div>
//                                   </div>
//                                 </div>
//                               </div>
//                             ))
//                           ) : activeArea?.growth?.stage ? (
//                             <div className="relative">
//                               <div className="absolute -left-6 top-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow"></div>
//                               <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100">
//                                 <div className="flex gap-4">
//                                   <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0">
//                                     <img
//                                       src={activeArea.growth?.image_url || '/no-image.png'}
//                                       alt={activeArea.growth?.stage}
//                                       className="object-cover w-full h-full"
//                                       onError={e => { e.target.onerror = null; e.target.src = '/no-image.png'; }}
//                                     />
//                                   </div>
//                                   <div className="flex-1 min-w-0">
//                                     <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-bold mb-1">
//                                       <Calendar className="w-3 h-3" />
//                                       ปัจจุบัน
//                                     </div>
//                                     <h4 className="text-sm font-bold text-slate-800 mb-1">{activeArea.growth?.stage}</h4>
//                                     <div className="flex items-center gap-2 mb-2">
//                                       <span className="text-xs text-emerald-600 font-bold">{activeArea.growth?.progress ?? 0}%</span>
//                                       <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
//                                         <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${activeArea.growth?.progress ?? 0}%` }}></div>
//                                       </div>
//                                     </div>
//                                     {activeArea.growth?.advice && <p className="text-[10px] text-slate-500 line-clamp-2">{activeArea.growth.advice}</p>}
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           ) : (
//                             <div className="text-center py-8">
//                               <Sprout className="w-12 h-12 mx-auto mb-3 text-slate-200" />
//                               <p className="text-sm text-slate-400 font-bold">ยังไม่มีข้อมูลระยะการเจริญเติบโต</p>
//                             </div>
//                           )}
//                         </div>
//                       </div>

//                       {/* Disease Timeline Section */}
//                       <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-100">
//                         <div className="flex items-center gap-2 mb-4">
//                           <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
//                             <Bug className="w-4 h-4 text-white" />
//                           </div>
//                           <h3 className="font-bold text-slate-800">ไทม์ไลน์สถานะโรคข้าว</h3>
//                         </div>
                        
//                         <div className="space-y-4 relative pl-6">
//                           <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-rose-200"></div>
                          
//                           {activeArea?.disease_timeline && activeArea.disease_timeline.length > 0 ? (
//                             activeArea.disease_timeline.map((item, idx) => (
//                               <div key={idx} className="relative">
//                                 <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white shadow ${item.status === 'safe' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
//                                 <div className={`rounded-xl p-4 shadow-sm border ${item.status === 'safe' ? 'bg-white border-emerald-100' : 'bg-white border-rose-100'}`}>
//                                   <div className="flex gap-4">
//                                     <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0">
//                                       <img
//                                         src={item.image_url || '/no-image.png'}
//                                         alt={item.name || 'โรคข้าว'}
//                                         className="object-cover w-full h-full"
//                                         onError={e => { e.target.onerror = null; e.target.src = '/no-image.png'; }}
//                                       />
//                                     </div>
//                                     <div className="flex-1 min-w-0">
//                                       <div className={`flex items-center gap-2 text-[10px] font-bold mb-1 ${item.status === 'safe' ? 'text-emerald-500' : 'text-rose-500'}`}>
//                                         <Calendar className="w-3 h-3" />
//                                         {item.date}
//                                       </div>
//                                       <div className="flex items-center gap-2 mb-1">
//                                         <div className={`w-6 h-6 rounded-md flex items-center justify-center ${item.status === 'safe' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
//                                           {item.status === 'safe' ? (
//                                             <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
//                                           ) : (
//                                             <Bug className="w-3.5 h-3.5 text-rose-500" />
//                                           )}
//                                         </div>
//                                         <h4 className={`text-sm font-bold ${item.status === 'safe' ? 'text-emerald-700' : 'text-rose-700'}`}>{item.name || 'ไม่พบโรค'}</h4>
//                                       </div>
//                                       {item.confidence && (
//                                         <div className="flex items-center gap-2 mb-1">
//                                           <span className={`text-xs font-bold ${item.status === 'safe' ? 'text-emerald-600' : 'text-rose-600'}`}>{item.confidence}%</span>
//                                           <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
//                                             <div className={`h-full rounded-full ${item.status === 'safe' ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${item.confidence}%` }}></div>
//                                           </div>
//                                         </div>
//                                       )}
//                                       <p className={`text-[10px] ${item.status === 'safe' ? 'text-emerald-400' : 'text-rose-400'}`}>
//                                         {item.status === 'safe' ? 'ปลอดภัย' : 'ต้องดูแลเป็นพิเศษ'}
//                                       </p>
//                                     </div>
//                                   </div>
//                                 </div>
//                               </div>
//                             ))
//                           ) : activeArea?.disease?.status ? (
//                             <div className="relative">
//                               <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white shadow ${activeArea.disease?.status === 'safe' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
//                               <div className={`rounded-xl p-4 shadow-sm border ${activeArea.disease?.status === 'safe' ? 'bg-white border-emerald-100' : 'bg-white border-rose-100'}`}>
//                                 <div className="flex gap-4">
//                                   <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0">
//                                     <img
//                                       src={activeArea.disease?.image_url || '/no-image.png'}
//                                       alt={activeArea.disease?.name || 'โรคข้าว'}
//                                       className="object-cover w-full h-full"
//                                       onError={e => { e.target.onerror = null; e.target.src = '/no-image.png'; }}
//                                     />
//                                   </div>
//                                   <div className="flex-1 min-w-0">
//                                     <div className={`flex items-center gap-2 text-[10px] font-bold mb-1 ${activeArea.disease?.status === 'safe' ? 'text-emerald-500' : 'text-rose-500'}`}>
//                                       <Calendar className="w-3 h-3" />
//                                       ปัจจุบัน
//                                     </div>
//                                     <div className="flex items-center gap-2 mb-1">
//                                       <div className={`w-6 h-6 rounded-md flex items-center justify-center ${activeArea.disease?.status === 'safe' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
//                                         {activeArea.disease?.status === 'safe' ? (
//                                           <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
//                                         ) : (
//                                           <Bug className="w-3.5 h-3.5 text-rose-500" />
//                                         )}
//                                       </div>
//                                       <h4 className={`text-sm font-bold ${activeArea.disease?.status === 'safe' ? 'text-emerald-700' : 'text-rose-700'}`}>{activeArea.disease?.name || 'ไม่พบโรค'}</h4>
//                                     </div>
//                                     <p className={`text-[10px] ${activeArea.disease?.status === 'safe' ? 'text-emerald-400' : 'text-rose-400'}`}>
//                                       {activeArea.disease?.status === 'safe' ? 'ปลอดภัย' : 'ต้องดูแลเป็นพิเศษ'}
//                                     </p>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           ) : (
//                             <div className="text-center py-8">
//                               <Bug className="w-12 h-12 mx-auto mb-3 text-slate-200" />
//                               <p className="text-sm text-slate-400 font-bold">ยังไม่มีข้อมูลสถานะโรคข้าว</p>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Modal Footer */}
//                   <div className="p-4 border-t border-slate-100 flex justify-end gap-3">
//                     <button
//                       onClick={() => setShowTimelineModal(false)}
//                       className="px-6 py-2.5 bg-slate-100 text-slate-600 text-xs font-bold uppercase rounded-xl hover:bg-slate-200 transition-colors"
//                     >
//                       ปิด
//                     </button>
//                     <Link
//                       href={`/Paddy/agriculture/sensor/${activeArea?.device_code || ''}`}
//                       className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase rounded-xl hover:bg-emerald-600 transition-colors inline-flex items-center gap-2"
//                     >
//                       ดูรายละเอียดเซนเซอร์
//                       <ExternalLink className="w-3 h-3" />
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             )}

//           </div>
//         )}
//         <Footer />
//       </main>
//     </div>
//   );
// }


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
  Droplet,
  AlertCircle,
  BarChart3,
  LineChart as LineIcon,
  ExternalLink,
  X,
  Calendar,
  Camera,
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

    const normalizePacket = (packet, expectedEvent) => {
      if (Array.isArray(packet)) {
        if (packet[0] === expectedEvent && packet[1] && typeof packet[1] === "object") {
          return packet[1];
        }
        return null;
      }
      if (packet && typeof packet === "object") return packet;
      return null;
    };

    socket.on("sensorData", (packet) => {
      const payload = normalizePacket(packet, "sensorData");
      const deviceCode =
        typeof payload?.device_code === "string"
          ? payload.device_code.trim()
          : payload?.device_code;
      const sensorData = payload?.data && typeof payload.data === "object"
        ? payload.data
        : payload;

      if (deviceCode && sensorData) {
        onSensor(deviceCode, sensorData, payload?.measured_at);
      }
    });

    socket.on("deviceStatus", (packet) => {
      const payload = normalizePacket(packet, "deviceStatus");
      const deviceCode =
        typeof payload?.device_code === "string"
          ? payload.device_code.trim()
          : payload?.device_code;

      if (deviceCode && payload?.status)
        onStatus(deviceCode, payload.status);
    });

    return () => {
      if (socket) socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(deviceIds), onSensor, onStatus]);
}

export default function App() {
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [weather, setWeather] = useState(null);
  const [farmData, setFarmData] = useState([]);
  const [loading, setLoading] = useState(true);
  // FIX #1: activeAreaId ควรเก็บเป็น number ตรงๆ ไม่ใช่ string
  const [activeAreaId, setActiveAreaId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [captureLoading, setCaptureLoading] = useState(false);
  const [captureStatus, setCaptureStatus] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // ฟังก์ชันเช็คสุขภาพพืช
  const checkHealth = useCallback((area) => {
    const alerts = [];
    let waterIssue = false;
    let diseaseIssue = false;

    if (area.sensor && area.status === "online") {
      const val = area.sensor.water_level;
      const min = area.setting?.Water_level_min ?? area.thresholds?.min ?? 5;
      const max =
        area.setting?.Water_level_mxm ??
        area.setting?.Water_level_max ??
        area.thresholds?.max ??
        15;
      if (val < min) {
        alerts.push({ type: "water", msg: `น้ำต่ำ (${val} cm)` });
        waterIssue = true;
      }
      if (val > max) {
        alerts.push({ type: "water", msg: `น้ำสูง (${val} cm)` });
        waterIssue = true;
      }
    }

    const diseaseNormalKeywords = ["ข้าวปกติ", "ใบข้าวสุขภาพดี", "ใบข้าวที่ดี"];
    const diseaseName = (area.disease?.name || "").trim();
    const isDiseaseNormal =
      area.disease?.status === "safe" ||
      diseaseNormalKeywords.some((kw) => diseaseName.includes(kw));

    if (area.disease?.status === "warning" && !isDiseaseNormal) {
      alerts.push({ type: "disease", msg: `ตรวจพบ: ${area.disease.name}` });
      diseaseIssue = true;
    }

    const isCritical = alerts.length > 0 && !isDiseaseNormal;
    return { isCritical, alerts, waterIssue, diseaseIssue, isDiseaseNormal };
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

  const loadTimeline = async (area) => {
    setTimelineLoading(true);
    try {
   

      const res = await apiFetch(`/api/data/Timeline/` ,{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: {
          area_id: area.area_id,
          device_code: area.device_code,
        },
      });
        
      if (res?.ok && res?.data?.success && Array.isArray(res?.data?.data)) {
        setTimelineData(res.data.data);
      } else {
        setTimelineData([]);
      }
    } catch (err) {
      console.error("Error loading timeline:", err);
      setTimelineData([]);
    } finally {
      setTimelineLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // FIX #2: useCallback สำหรับ handleSensorData และ handleStatusChange
  // ใช้ functional updater เพื่อไม่ต้อง depend on farmData
  const handleSensorData = useCallback((deviceId, incoming, measuredAt) => {
    const normalizedDeviceId = String(deviceId ?? "").trim().toUpperCase();
    setFarmData((prev) =>
      prev.map((farm) => ({
        ...farm,
        areas: farm.areas.map((area) =>
          String(area.device_code ?? "").trim().toUpperCase() === normalizedDeviceId
            ? {
                ...area,
                status: "online",
                measured_at: measuredAt ?? area.measured_at,
                sensor: {
                  ...area.sensor,
                  n: incoming.N ?? incoming.n ?? area.sensor?.n,
                  p: incoming.P ?? incoming.p ?? area.sensor?.p,
                  k: incoming.K ?? incoming.k ?? area.sensor?.k,
                  s: incoming.S ?? incoming.s ?? area.sensor?.s,
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
    const normalizedDeviceId = String(deviceId ?? "").trim().toUpperCase();
    setFarmData((prev) =>
      prev.map((farm) => ({
        ...farm,
        areas: farm.areas.map((area) =>
          String(area.device_code ?? "").trim().toUpperCase() === normalizedDeviceId
            ? { ...area, status }
            : area,
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

  const normalizeImageUrl = useCallback((url) => {
    if (!url || typeof url !== "string") return "/no-image.png";
    return url.replace(/^http:\/\//i, "https://");
  }, []);

  const normalizeReferenceUrl = useCallback((url) => {
    if (!url || typeof url !== "string") return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed.replace(/^http:\/\//i, "https://");
    }
    return `https://${trimmed}`;
  }, []);

  const getApiReferenceLink = useCallback(
    (item) => normalizeReferenceUrl(item?.link || item?.Link || item?.LInk),
    [normalizeReferenceUrl],
  );

  const openImagePreview = useCallback(
    (item) => {
      setPreviewImage({
        src: normalizeImageUrl(item?.image),
        title: item?.title || "รูปภาพ",
        source: item?.type_uplode || "ไม่ระบุ",
      });
    },
    [normalizeImageUrl],
  );

  const selectedFarm = useMemo(
    () => farmData.find((f) => f.farm_id.toString() === selectedFarmId),
    [farmData, selectedFarmId],
  );

  // FIX #3: schedulerSummary — ลบ setWsDataReceived ออกจาก useMemo (side effect ห้ามอยู่ใน useMemo)
  const schedulerSummary = useMemo(() => {
    if (!selectedFarm)
      return {
        total: 0,
        due: 0,
        queued: 0,
        not_due: 0,
        never_analyzed: 0,
        nextCheck: null,
      };

    const summary = { total: 0, due: 0, queued: 0, not_due: 0, never_analyzed: 0 };
    let nextCheck = null;

    selectedFarm.areas.forEach((a) => {
      if (!a.scheduler) return;
      summary.total += 1;
      const s = a.scheduler.status;
      if (s === "due") summary.due += 1;
      else if (s === "queued") summary.queued += 1;
      else if (s === "not_due") summary.not_due += 1;
      else if (s === "never_analyzed") summary.never_analyzed += 1;

      if (a.scheduler.last_check) {
        const t = new Date(a.scheduler.last_check).getTime();
        if (!nextCheck || t < nextCheck) nextCheck = t;
      } else if (typeof a.scheduler.days_remaining === "number") {
        const approx =
          Date.now() + a.scheduler.days_remaining * 24 * 3600 * 1000;
        if (!nextCheck || approx < nextCheck) nextCheck = approx;
      }
    });

    return { ...summary, nextCheck };
  }, [selectedFarm]);

  const getNPKLevel = (k, val) => {
    const v = Number(val ?? 0);
    if (k === "N") {
      const nPercent = (v/0.1) / 10000;
      return {
        level:
          nPercent <= 0.05
            ? "ต่ำมาก"
            : nPercent <= 0.09
              ? "ต่ำ"
              : nPercent <= 0.14
                ? "ปานกลาง"
                : "สูง",
        nPercent,
      };
    }
    if (k === "P") {
      if (v < 3) return { level: "ต่ำมาก" };
      if (v <= 10) return { level: "ต่ำ" };
      if (v <= 25) return { level: "ปานกลาง" };
      if (v <= 45) return { level: "สูง" };
      return { level: "สูงมาก" };
    }
    if (k === "K") {
      if (v < 31) return { level: "ต่ำมาก" };
      if (v <= 60) return { level: "ต่ำ" };
      if (v <= 90) return { level: "ปานกลาง" };
      if (v <= 120) return { level: "สูง" };
      return { level: "สูงมาก" };
    }
    return { level: "", om: 0 };
  };

  const activeArea = useMemo(() => {
    if (!selectedFarm) return null;
    return (
      selectedFarm.areas.find((a) => a.area_id === activeAreaId) ||
      selectedFarm.areas[0]
    );
  }, [selectedFarm, activeAreaId]);

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
    const deviceCount = selectedFarm.areas.length;
    const onlineCount = selectedFarm.areas.filter(
      (a) => a.status === "online" || a.status === "active",
    ).length;
    if (deviceCount === 0)
      return { avgN: 0, avgP: 0, avgK: 0, avgWater: 0, activeCount: onlineCount };

    const total = selectedFarm.areas.reduce(
      (acc, curr) => ({
        n: acc.n + (Number(curr.sensor?.n) || 0),
        p: acc.p + (Number(curr.sensor?.p) || 0),
        k: acc.k + (Number(curr.sensor?.k) || 0),
        water: acc.water + (Number(curr.sensor?.water_level) || 0),
      }),
      { n: 0, p: 0, k: 0, water: 0 },
    );

    return {
      avgN: Math.round(total.n / deviceCount),
      avgP: Math.round(total.p / deviceCount),
      avgK: Math.round(total.k / deviceCount),
      avgWater: Math.round(total.water / deviceCount),
      activeCount: onlineCount,
    };
  }, [selectedFarm]);

  const npkStackedData = useMemo(() => {
    if (!activeArea?.sensor_history) return [];
    const grouped = activeArea.sensor_history.reduce((acc, curr) => {
      const ts = curr.timestamp;
      if (!acc[ts]) {
        acc[ts] = { timestamp: ts, time: curr.time, N: 0, P: 0, K: 0 };
      }
      if (curr.N !== undefined) acc[ts].N = Number(curr.N);
      if (curr.P !== undefined) acc[ts].P = Number(curr.P);
      if (curr.K !== undefined) acc[ts].K = Number(curr.K);
      return acc;
    }, {});
    return Object.values(grouped)
      .filter((d) => d.N > 0 || d.P > 0 || d.K > 0)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [activeArea]);

  const waterChartData = useMemo(() => {
    if (!activeArea?.sensor_history)
      return { data: [], events: [], thresholds: { min: 5, max: 30 } };

    const thresholds = {
      min: activeArea.setting?.Water_level_min ?? activeArea.thresholds?.min ?? 5,
      max:
        activeArea.setting?.Water_level_mxm ??
        activeArea.setting?.Water_level_max ??
        activeArea.thresholds?.max ??
        30,
    };

    const grouped = activeArea.sensor_history.reduce((acc, curr) => {
      const ts = curr.timestamp;
      if (!acc[ts]) {
        acc[ts] = { timestamp: ts, time: curr.time, water_level: null };
      }
      if (curr.W !== undefined) {
        acc[ts].water_level = Number(curr.W);
      }
      return acc;
    }, {});

    const data = Object.values(grouped)
      .filter((d) => d.water_level !== null)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

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

  // Handle early photo capture command
  const handleCapturePhoto = useCallback(async () => {
    if (!activeArea?.device_code) {
      setCaptureStatus("error");
      setTimeout(() => setCaptureStatus(null), 3000);
      return;
    }
    setCaptureLoading(true);
    setCaptureStatus(null);
    try {
      const response = await apiFetch("/api/admin/devices/capture", {
        method: "POST",
        body: { device_code: activeArea.device_code },
      });
      if (response?.ok) {
        setCaptureStatus("success");
        console.log("Photo capture command sent successfully");
      } else {
        setCaptureStatus("error");
        console.error("Failed to send capture command:", response?.message);
      }
    } catch (error) {
      setCaptureStatus("error");
      console.error("Error sending capture command:", error);
    } finally {
      setCaptureLoading(false);
      setTimeout(() => setCaptureStatus(null), 3000);
    }
  }, [activeArea?.device_code]);

  // FIX #4: เมื่อเปลี่ยน selectedFarm ให้ reset activeAreaId เป็น area_id (number) ของแปลงแรก
  useEffect(() => {
    if (selectedFarm?.areas.length > 0) {
      setActiveAreaId(selectedFarm.areas[0].area_id);
    }
  }, [selectedFarm]);

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
                <span className="text-sm font-bold">{weather?.temp || "--"}°C</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-50">
                <Droplets className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold">{weather?.humidity ?? 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              กำลังโหลดข้อมูล...
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
            {/* 1. URGENT WARNINGS - Water & Disease Alerts */}
            <div className="space-y-3">
              {selectedFarm.areas.map((area) => {
                const alerts = [];
                
                // Check water level alerts
                if (area.sensor && area.status === "online") {
                  const waterLevel = area.sensor.water_level;
                  const minThreshold = area.setting?.Water_level_min ?? area.thresholds?.min ?? 5;
                  const maxThreshold = area.setting?.Water_level_max ?? area.thresholds?.max ?? 30;
                  
                  if (waterLevel < minThreshold) {
                    alerts.push({
                      type: "low_water",
                      title: `เเจ้งเตือนน้ำต่า ⚠️`,
                      message: `${area.area_name} - ระดับน้ำ ${waterLevel} ซม. (ต่ำกว่า ${minThreshold} ซม.)`,
                      color: "blue",
                      severity: "warning"
                    });
                  } else if (waterLevel > maxThreshold) {
                    alerts.push({
                      type: "high_water",
                      title: `เเจ้งเตือนน้ำสูง ⚠️`,
                      message: `${area.area_name} - ระดับน้ำ ${waterLevel} ซม. (สูงกว่า ${maxThreshold} ซม. )`,
                      color: "amber",
                      severity: "warning"
                    });
                  }
                }
                
                // Check disease alerts
                if (area.latest_disease && area.latest_disease.disease_name && area.latest_disease.disease_name.toLowerCase() !== "healthy leaf") {
                  alerts.push({
                    type: "disease",
                    title: `เเจ้งเตือนข้าวเป็นโรค 🚨`,
                    message: `${area.area_name} - ${area.latest_disease.disease_name}${area.latest_disease.confidence ? ` (ความมั่นใจ ${Math.round(area.latest_disease.confidence * 100)}%)` : ""}`,
                    advice: area.latest_disease.advice,
                    color: "rose",
                    severity: "critical"
                  });
                }
                
                return alerts.map((alert) => (
                  <div
                    key={`${area.area_id}-${alert.type}`}
                    className={`border-l-4 rounded-lg p-4 ${
                      alert.color === "blue"
                        ? "bg-blue-50 border-blue-300"
                        : alert.color === "amber"
                          ? "bg-amber-50 border-amber-300"
                          : "bg-rose-50 border-rose-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 text-lg ${
                        alert.color === "blue" ? "text-blue-600" :
                        alert.color === "amber" ? "text-amber-600" :
                        "text-rose-600"
                      }`}>
                        {alert.color === "blue" ? "💧" : alert.color === "amber" ? "⚠️" : "🚨"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-sm ${
                          alert.color === "blue" ? "text-blue-900" :
                          alert.color === "amber" ? "text-amber-900" :
                          "text-rose-900"
                        }`}>
                          {alert.title}
                        </h3>
                        <p className={`text-sm mt-1 ${
                          alert.color === "blue" ? "text-blue-800" :
                          alert.color === "amber" ? "text-amber-800" :
                          "text-rose-800"
                        }`}>
                          {alert.message}
                        </p>
                        {alert.advice && (
                          <p className={`text-xs italic mt-2 ${
                            alert.color === "blue" ? "text-blue-700" :
                            alert.color === "amber" ? "text-amber-700" :
                            "text-rose-700"
                          }`}>
                            💡 {alert.advice}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ));
              }).flat().filter((item) => item !== undefined)}
            </div>

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
                      const isDiseaseNormal = health.isDiseaseNormal;
                      return (
                        <div
                          key={area.area_id || idx}
                          className={`bg-white border-2 ${isDiseaseNormal ? "border-emerald-400" : "border-rose-100"} p-6 rounded-4xl flex flex-col gap-4 shadow-xl ${isDiseaseNormal ? "shadow-emerald-500/10" : "shadow-rose-500/5"} group relative overflow-hidden`}
                        >
                          <div className="flex justify-between items-start z-10">
                            <div>
                              <h4 className="font-black text-slate-800 text-xl">
                                {area.area_name}
                              </h4>
                              <p
                                className={`text-[10px] font-bold uppercase tracking-widest ${isDiseaseNormal ? "text-emerald-600" : "text-rose-400"}`}
                              >
                                {isDiseaseNormal ? "✔️ ปกติ (ไม่พบโรค)" : "🚨 ภาวะวิกฤต"}
                              </p>
                            </div>
                            <div className="flex gap-1.5">
                              {health.waterIssue && (
                                <div className="p-2.5 bg-blue-50 text-blue-500 rounded-2xl border border-blue-100">
                                  <Droplet className="w-5 h-5" />
                                </div>
                              )}
                              {health.diseaseIssue && !isDiseaseNormal && (
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
                                className={`flex items-center gap-3 p-3 rounded-2xl text-[12px] font-bold border ${alert.type === "water" ? "bg-blue-50/50 border-blue-100 text-blue-700" : isDiseaseNormal ? "bg-emerald-50 border-emerald-400 text-emerald-700" : "bg-rose-50/50 border-rose-100 text-rose-700"}`}
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
                  {["N", "P", "K"].map((k) => {
                    const val = farmInsights[`avg${k}`] ?? 0;
                    const info = getNPKLevel(k, val);
                    return (
                      <div
                        key={k}
                        className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100"
                      >
                        <p className="text-[8px] font-bold text-slate-400 mb-0.5">
                          {k} Value
                        </p>
                        <p className="text-lg font-black text-slate-700">{val}</p>
                        {k === "N" && (
                          <p className="text-xs text-slate-400 mt-1">
                            ค่า N (%): {Number(info.nPercent ?? 0).toFixed(4)}
                          </p>
                        )}
                      </div>
                    );
                  })}
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
                  {/* FIX #5: แปลง e.target.value เป็น Number เพื่อให้ match กับ area.area_id ที่เป็น number */}
                  <select
                    value={activeAreaId ?? ""}
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

              {/* FIX #6: filter ด้วย Number เพื่อให้ตรงกัน */}
              {selectedFarm.areas
                .filter((a) => a.area_id === activeAreaId)
                .map((area) => {
                  const n_mgkg = Number(area.sensor?.n ?? 0);
                  const p_mgkg = Number(area.sensor?.p ?? 0);
                  const k_mgkg = Number(area.sensor?.k ?? 0);
                  const nPercent = (n_mgkg / 0.1) / 10000;

                  const getNLevel = (value) => {
                    if (value <= 0.05) return "ต่ำมาก";
                    if (value <= 0.09) return "ต่ำ";
                    if (value <= 0.14) return "ปานกลาง";
                    return "สูง";
                  };

                  const getPLevel = (value) => {
                    if (value < 3) return "ต่ำมาก";
                    if (value <= 10) return "ต่ำ";
                    if (value <= 25) return "ปานกลาง";
                    if (value <= 45) return "สูง";
                    return "สูงมาก";
                  };

                  const getKLevel = (value) => {
                    if (value < 31) return "ต่ำมาก";
                    if (value <= 60) return "ต่ำ";
                    if (value <= 90) return "ปานกลาง";
                    if (value <= 120) return "สูง";
                    return "สูงมาก";
                  };

                  const nLevel = getNLevel(nPercent);
                  const pLevel = getPLevel(p_mgkg);
                  const kLevel = getKLevel(k_mgkg);

                  const hasNoSensorData =
                    !area.sensor ||
                    (area.sensor.water_level == null && area.sensor.n == null);
                  const hasRecentSensorPayload =
                    area?.measured_at != null ||
                    area?.sensor?.water_level != null ||
                    area?.sensor?.n != null ||
                    area?.sensor?.p != null ||
                    area?.sensor?.k != null;
                  const shouldShowSocketLoading =
                    hasNoSensorData &&
                    !hasRecentSensorPayload &&
                    area.status !== "online" &&
                    area.status !== "active";

                  if (shouldShowSocketLoading) {
                    return (
                      <div
                        key={area.area_id}
                        className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center"
                      >
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center animate-pulse">
                            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-700 mb-1">
                              กำลังเชื่อมต่อ...
                            </h3>
                            <p className="text-sm text-slate-400">
                              รอรับข้อมูลจากเซนเซอร์ แปลง {area.area_name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                            <span className="text-xs font-medium text-amber-600">
                              รอการเชื่อมต่อ WebSocket
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const waterLevel = area.sensor?.water_level ?? 0;
                  const minThreshold = area.thresholds?.min ?? 5;
                  const maxThreshold = area.thresholds?.max ?? 30;
                  const maxScale = 30;

                  let waterStatus = "normal";
                  if (waterLevel < minThreshold) waterStatus = "low";
                  else if (waterLevel > maxThreshold) waterStatus = "high";

                  return (
                    <div
                      key={area.area_id}
                      className="grid grid-cols-1 md:grid-cols-4 gap-4"
                    >
                      {/* Water Tank */}
                      <div className="md:row-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
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

                        <div className="flex-1 flex items-center justify-center">
                          <div className="relative">
                            <div className="relative w-28 h-40 border-4 border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
                              <div
                                className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out ${
                                  waterStatus === "low"
                                    ? "bg-gradient-to-t from-rose-400 to-rose-300"
                                    : waterStatus === "high"
                                      ? "bg-gradient-to-t from-amber-400 to-amber-300"
                                      : "bg-gradient-to-t from-sky-500 to-sky-400"
                                }`}
                                style={{
                                  height: `${Math.min((waterLevel / maxScale) * 100, 100)}%`,
                                }}
                              >
                                <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/40" />
                              </div>
                              <div
                                className="absolute w-full z-10 flex items-center"
                                style={{
                                  bottom: `${(maxThreshold / maxScale) * 100}%`,
                                }}
                              >
                                <div className="flex-1 border-t-2 border-dashed border-amber-500" />
                              </div>
                              <div
                                className="absolute w-full z-10 flex items-center"
                                style={{
                                  bottom: `${(minThreshold / maxScale) * 100}%`,
                                }}
                              >
                                <div className="flex-1 border-t-2 border-dashed border-rose-500" />
                              </div>
                              <div
                                className="absolute w-full z-20 transition-all duration-1000"
                                style={{
                                  bottom: `${Math.min((waterLevel / maxScale) * 100, 100)}%`,
                                }}
                              >
                                <div className="w-full border-t-[3px] border-rose-500" />
                              </div>
                            </div>
                            <div
                              className="absolute -left-16 transition-all duration-1000 flex items-center"
                              style={{
                                bottom: `calc(${Math.min((waterLevel / maxScale) * 100, 100)}% - 8px)`,
                              }}
                            >
                              <div className="bg-rose-500 text-white px-2 py-1 rounded-lg text-sm font-bold whitespace-nowrap">
                                {waterLevel} ซม.
                              </div>
                            </div>
                            <div
                              className="absolute -right-12 transition-all duration-300 flex items-center"
                              style={{
                                bottom: `calc(${(maxThreshold / maxScale) * 100}% - 8px)`,
                              }}
                            >
                              <span className="text-xs font-bold text-amber-600">
                                {maxThreshold} ซม.
                              </span>
                            </div>
                            <div
                              className="absolute -right-12 transition-all duration-300 flex items-center"
                              style={{
                                bottom: `calc(${(minThreshold / maxScale) * 100}% - 8px)`,
                              }}
                            >
                              <span className="text-xs font-bold text-amber-600">
                                {minThreshold} ซม.
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-center mt-6">
                          <p
                            className={`text-2xl font-black ${
                              waterStatus === "low"
                                ? "text-rose-500"
                                : waterStatus === "high"
                                  ? "text-amber-500"
                                  : "text-sky-500"
                            }`}
                          >
                            ระดับน้ำ {waterLevel} ซม.
                          </p>
                          <div
                            className={`inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full ${
                              waterStatus === "low"
                                ? "bg-rose-100 text-rose-600"
                                : waterStatus === "high"
                                  ? "bg-amber-100 text-amber-600"
                                  : "bg-emerald-100 text-emerald-600"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                waterStatus === "low"
                                  ? "bg-rose-500"
                                  : waterStatus === "high"
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                              }`}
                            />
                            <span className="text-sm font-bold">
                              {waterStatus === "low"
                                ? "ต่ำกว่าเกณฑ์"
                                : waterStatus === "high"
                                  ? "สูงกว่าเกณฑ์"
                                  : "อยู่ในเกณฑ์ปกติ"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-2">
                            ช่วงที่เหมาะสม: {minThreshold} - {maxThreshold} ซม.
                          </p>
                        </div>
                      </div>

                      {/* N Card */}
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
                                ค่าปัจจุบัน (N %)
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-8 text-center">
                          <p className="text-3xl font-black text-emerald-500">
                            {nPercent.toFixed(2)}
                            <span className="text-sm text-slate-400 ml-1">%</span>
                          </p>
                          <p className="text-[10px] mt-1 text-slate-400">ค่าเซนเซอร์ N: {n_mgkg} mg/kg</p>
                          <p className="text-xs mt-2 font-bold text-emerald-600">
                            ระดับ: {nLevel}
                          </p>
                        </div>
                      </div>

                      {/* P Card */}
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
                            <span className="text-sm text-slate-400 ml-1">mg/kg</span>
                          </p>
                          <p className="text-xs mt-2 font-bold text-orange-600">
                            ระดับ: {pLevel}
                          </p>
                        </div>
                      </div>

                      {/* K Card */}
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
                            <span className="text-sm text-slate-400 ml-1">mg/kg</span>
                          </p>
                          <p className="text-xs mt-2 font-bold text-purple-600">
                            ระดับ: {kLevel}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* 5. ANALYTICS CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-widest">
                    <BarChart3 className="w-4 h-4 text-emerald-500" /> สัดส่วนธาตุอาหาร
                    (NPK) - แปลง {activeArea?.area_name}
                  </h3>
                  <Link
                    href={`/Paddy/agriculture/sensor/${activeArea?.device_code || ""}`}
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
                        <Area
                          type="monotone"
                          dataKey="N"
                          stackId="1"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.6}
                        />
                        <Area
                          type="monotone"
                          dataKey="P"
                          stackId="1"
                          stroke="#f97316"
                          fill="#f97316"
                          fillOpacity={0.6}
                        />
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

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-widest">
                    <Waves className="w-4 h-4 text-blue-500" /> แนวโน้มระดับน้ำ (cm) -
                    แปลง {activeArea?.area_name}
                  </h3>
                  <Link
                    href={`/Paddy/agriculture/sensor/${activeArea?.device_code || ""}`}
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
                          <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                {activeArea?.device_code && (
                  <button
                    onClick={handleCapturePhoto}
                    disabled={captureLoading}
                    className={`px-3 py-2 text-[11px] font-bold uppercase rounded-lg transition-all inline-flex items-center gap-2 ${captureLoading ? "bg-slate-400 text-white cursor-not-allowed" : captureStatus === "success" ? "bg-emerald-500 text-white" : captureStatus === "error" ? "bg-red-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                  >
                    <Camera className="w-3 h-3" />
                    {captureLoading ? "กำลังส่ง..." : "ถ่ายรูปก่อนกำหนด"}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeArea && activeArea.scheduler ? (
                  <div
                    key={activeArea.area_id}
                    className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          <div className="truncate">
                            <div className="font-bold text-sm text-slate-800 truncate">
                              {activeArea.area_name}
                            </div>
                            <div className="text-[12px] text-slate-500 truncate">
                              {activeArea.device_code || "-"}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 text-sm text-slate-600 flex items-center gap-2">
                          <span className="inline-flex items-center gap-2">
                            <svg
                              className="w-3 h-3 text-slate-400"
                              viewBox="0 0 8 8"
                              fill="currentColor"
                            >
                              <circle cx="4" cy="4" r="4" />
                            </svg>
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
                                ? `${new Date(activeArea.scheduler.last_check).toLocaleString("th-TH", {
                                    day: "2-digit",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}`
                                : "-"}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-end">
                        <div
                          className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                            activeArea.scheduler.status === "due"
                              ? "bg-amber-50 text-amber-700 border border-amber-100"
                              : activeArea.scheduler.status === "queued"
                                ? "bg-blue-50 text-blue-700 border border-blue-100"
                                : activeArea.scheduler.status === "not_due"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                  : "bg-slate-50 text-slate-600 border border-slate-100"
                          }`}
                        >
                          {activeArea.scheduler.status === "due"
                            ? "ถึงกำหนด"
                            : activeArea.scheduler.status === "queued"
                              ? "คิว"
                              : activeArea.scheduler.status === "not_due"
                                ? "ยังไม่ถึง"
                                : activeArea.scheduler.status}
                        </div>
                        {/* <div className="mt-2 text-[11px] text-slate-400">
                          ล่าสุด:{" "} 
                           {activeArea.scheduler.last_check && !isNaN(Date.parse(activeArea.scheduler.last_check))
  ? new Date(activeArea.scheduler.last_check).toLocaleString("th-TH", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  : "ไม่มีข้อมูล"}
                        </div> */}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 col-span-full">
                    ยังไม่มีข้อมูลตารางวิเคราะห์สำหรับพื้นที่ที่เลือก
                  </div>
                )}
              </div>
            </div>

            {/* 6. Rice Stage & Disease Timeline */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-widest">
                    <Sprout className="w-4 h-4 text-emerald-500" /> ระยะข้าวและโรคข้าว -
                    แปลง {activeArea?.area_name}
                  </h3>
                  <button
                    onClick={() => {
                      loadTimeline(activeArea);
                      setShowTimelineModal(true);
                    }}
                    className="px-4 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase rounded-xl hover:bg-emerald-600 transition-all inline-flex items-center gap-2"
                  >
                    ดูไทม์ไลน์ทั้งหมด
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {activeArea ? (
                  <div className="relative pl-10">
                    <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-slate-200"></div>

                    {/* Growth Stage */}
                    <div className="relative pb-8">
                      <div className="absolute -left-10 top-2 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                        <Sprout className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        {activeArea.growth?.stage ? (
                          <div className="flex flex-col sm:flex-row items-start gap-5">
                            <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 shrink-0 shadow-inner border-2 border-white">
                              <img
                                src={activeArea.growth?.image_url || "/no-image.png"}
                                alt="ระยะข้าว"
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/no-image.png";
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">
                                ระยะการเจริญเติบโต
                              </p>
                              <h4 className="text-xl font-black text-slate-800 mb-2">
                                {activeArea.growth?.stage}
                              </h4>
                              <div className="flex items-center gap-3 mb-3">
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 rounded-full transition-all"
                                    style={{ width: `${activeArea.growth?.progress ?? 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-bold text-emerald-600">
                                  {activeArea.growth?.progress ?? 0}%
                                </span>
                              </div>
                              {activeArea.growth?.advice && (
                                <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-4 leading-relaxed">
                                  {activeArea.growth.advice}
                                </p>
                              )}
                              {getApiReferenceLink(activeArea.growth) && (
                                <a
                                  href={getApiReferenceLink(activeArea.growth)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-800"
                                >
                                  อ้างอิง: ข้อมูลจากระบบ
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4 py-4">
                            <div className="w-20 h-20 rounded-xl bg-slate-50 flex items-center justify-center">
                              <Sprout className="w-8 h-8 text-slate-200" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                ระยะการเจริญเติบโต
                              </p>
                              <h4 className="text-base font-bold text-slate-400">
                                ยังไม่มีข้อมูล
                              </h4>
                              <p className="text-xs text-slate-300 mt-1">
                                กรุณาเพิ่มข้อมูลระยะการเจริญเติบโต
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Disease Status */}
                    <div className="relative">
                      <div
                        className={`absolute -left-10 top-2 w-7 h-7 rounded-full flex items-center justify-center shadow-lg ${activeArea.disease?.name === "ใบข้าวที่ดี" ? "bg-emerald-500 shadow-emerald-200" : activeArea.disease?.name ? "bg-rose-500 shadow-rose-200 animate-pulse" : "bg-slate-300 shadow-slate-100"}`}
                      >
                        {activeArea.disease?.name === "ใบข้าวที่ดี" ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-white" />
                        ) : activeArea.disease?.name ? (
                          <Bug className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                      <div
                        className={`border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow ${activeArea.disease?.name === "ใบข้าวที่ดี" ? "bg-white border-emerald-100" : activeArea.disease?.name ? "bg-rose-50/50 border-rose-100" : "bg-slate-50/50 border-slate-100"}`}
                      >
                        {activeArea.disease?.status ? (
                          <div className="flex flex-col sm:flex-row items-start gap-5">
                            <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 shrink-0 shadow-inner border-2 border-white">
                              <img
                                src={activeArea.disease?.image_url || "/no-image.png"}
                                alt="สถานะโรคข้าว"
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/no-image.png";
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${activeArea.disease?.name === "ใบข้าวที่ดี" ? "text-emerald-500" : "text-rose-500"}`}
                              >
                                สถานะโรคข้าว
                              </p>
                              <h4
                                className={`text-xl font-black mb-2 ${activeArea.disease?.name === "ใบข้าวที่ดี" ? "text-slate-800" : "text-rose-700"}`}
                              >
                                {activeArea.disease?.name || "ไม่พบโรค"}
                              </h4>
                              <div className="flex items-center gap-2 mb-2">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeArea.disease?.name === "ใบข้าวที่ดี" ? "bg-emerald-50" : "bg-rose-100"}`}
                                >
                                  {activeArea.disease?.name === "ใบข้าวที่ดี" ? (
                                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                  ) : (
                                    <Bug className="w-5 h-5 text-rose-500" />
                                  )}
                                </div>
                                <p
                                  className={`text-sm font-bold ${activeArea.disease?.name === "ใบข้าวที่ดี" ? "text-emerald-600" : "text-rose-600"}`}
                                >
                                  {activeArea.disease?.name === "ใบข้าวที่ดี"
                                    ? "ปลอดภัย"
                                    : "ต้องดูแลเป็นพิเศษ"}
                                </p>
                              </div>
                              {activeArea.disease?.advice && (
                                <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-4 leading-relaxed">
                                  {activeArea.disease.advice}
                                </p>
                              )}
                              {getApiReferenceLink(activeArea.disease) && (
                                <a
                                  href={getApiReferenceLink(activeArea.disease)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 hover:text-rose-800"
                                >
                                  อ้างอิง: ข้อมูลจากระบบ
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4 py-2">
                            <div className="w-20 h-20 rounded-xl bg-slate-50 flex items-center justify-center">
                              <Bug className="w-8 h-8 text-slate-200" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                สถานะโรคข้าว
                              </p>
                              <h4 className="text-base font-bold text-slate-400">
                                ยังไม่มีข้อมูล
                              </h4>
                              <p className="text-xs text-slate-300 mt-1">
                                กรุณาเพิ่มข้อมูลสถานะโรคข้าว
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-400">
                    <Sprout className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                    <p className="text-sm font-bold uppercase tracking-widest mb-2">
                      ยังไม่มีข้อมูล
                    </p>
                    <p className="text-xs text-slate-300">
                      กรุณาเลือกพื้นที่เพื่อดูข้อมูลระยะข้าวและโรคข้าว
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Modal */}
            {showTimelineModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                      <h2 className="text-lg font-black text-slate-800">
                        ไทม์ไลน์ทั้งหมด
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        แปลง: {activeArea?.area_name} ({activeArea?.device_code})
                      </p>
                    </div>
                    <button
                      onClick={() => setShowTimelineModal(false)}
                      className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>

                  <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {timelineLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Loader2 className="w-12 h-12 mx-auto mb-4 text-slate-400 animate-spin" />
                          <p className="text-sm text-slate-500 font-bold">
                            กำลังโหลดข้อมูลไทม์ไลน์...
                          </p>
                        </div>
                      </div>
                    ) : timelineData && timelineData.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Growth Timeline */}
                        <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                              <Sprout className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="font-bold text-slate-800">ไทม์ไลน์ระยะการเจริญเติบโต</h3>
                          </div>
                          <div className="space-y-4 relative pl-6">
                            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-emerald-200"></div>
                            {timelineData.filter(item => item.type === 'growth').length > 0 ? (
                              timelineData
                                .filter(item => item.type === 'growth')
                                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                .map((item) => (
                                  <div key={`${item.type}-${item.id}-${item.created_at}`} className="relative">
                                    <div className="absolute -left-6 top-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow"></div>
                                    <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100">
                                      <div className="flex gap-4">
                                        {item.image && (
                                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                            <img
                                              src={normalizeImageUrl(item.image)}
                                              alt={item.title}
                                              className="object-cover w-full h-full cursor-zoom-in"
                                              onClick={() => openImagePreview(item)}
                                              onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/no-image.png";
                                              }}
                                            />
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-bold mb-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(item.created_at).toLocaleDateString('th-TH', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric'
                                            })}
                                          </div>
                                          <h4 className="text-sm font-bold text-slate-800 mb-1">{item.title}</h4>
                                          <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                            <Server className="h-3 w-3" />
                                            ที่มารูปภาพ: {item.type_uplode || "ไม่ระบุ"}
                                          </div>
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs text-emerald-600 font-bold">
                                              {Math.round(Number(item.confidence) <= 1 ? Number(item.confidence) * 100 : Number(item.confidence))}%
                                            </span>
                                            <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                              <div
                                                className="h-full bg-emerald-500 rounded-full"
                                                style={{
                                                  width: `${Math.round(Number(item.confidence) <= 1 ? Number(item.confidence) * 100 : Number(item.confidence))}%`,
                                                }}
                                              ></div>
                                            </div>
                                          </div>
                                          {item.description && (
                                            <p className="text-[10px] text-slate-500 line-clamp-2">{item.description}</p>
                                          )}
                                          {getApiReferenceLink(item) && (
                                            <a
                                              href={getApiReferenceLink(item)}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-800"
                                            >
                                              อ้างอิง: ข้อมูลจากระบบ
                                              <ExternalLink className="w-3 h-3" />
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))
                            ) : (
                              <div className="text-center py-8">
                                <Sprout className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                                <p className="text-sm text-slate-400 font-bold">ยังไม่มีข้อมูลระยะการเจริญเติบโต</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Disease Timeline */}
                        <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-100">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
                              <Bug className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="font-bold text-slate-800">ไทม์ไลน์สถานะโรคข้าว</h3>
                          </div>
                          <div className="space-y-4 relative pl-6">
                            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-rose-200"></div>
                            {timelineData.filter(item => item.type === 'disease').length > 0 ? (
                              timelineData
                                .filter(item => item.type === 'disease')
                                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                .map((item) => {
                                  const isHealthyLeaf =
                                    (item.title || "").trim() === "ใบข้าวที่ดี";

                                  return (
                                  <div key={`${item.type}-${item.id}-${item.created_at}`} className="relative">
                                    <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white shadow ${isHealthyLeaf ? "bg-emerald-500" : "bg-rose-500"}`}></div>
                                    <div className={`bg-white rounded-xl p-4 shadow-sm border ${isHealthyLeaf ? "border-emerald-100" : "border-rose-100"}`}>
                                      <div className="flex gap-4">
                                        {item.image && (
                                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                            <img
                                              src={normalizeImageUrl(item.image)}
                                              alt={item.title}
                                              className="object-cover w-full h-full cursor-zoom-in"
                                              onClick={() => openImagePreview(item)}
                                              onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/no-image.png";
                                              }}
                                            />
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <div className={`flex items-center gap-2 text-[10px] font-bold mb-1 ${isHealthyLeaf ? "text-emerald-500" : "text-rose-500"}`}>
                                            <Calendar className="w-3 h-3" />
                                            {new Date(item.created_at).toLocaleDateString('th-TH', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric'
                                            })}
                                          </div>
                                          <h4 className="text-sm font-bold text-slate-800 mb-1">{item.title}</h4>
                                          <div className={`mb-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${isHealthyLeaf ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                                            <Server className="h-3 w-3" />
                                            ที่มารูปภาพ: {item.type_uplode || "ไม่ระบุ"}
                                          </div>
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-xs font-bold ${isHealthyLeaf ? "text-emerald-600" : "text-rose-600"}`}>
                                              {Math.round(Number(item.confidence) <= 1 ? Number(item.confidence) * 100 : Number(item.confidence))}%
                                            </span>
                                            <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                              <div
                                                className={`h-full rounded-full ${isHealthyLeaf ? "bg-emerald-500" : "bg-rose-500"}`}
                                                style={{
                                                  width: `${Math.round(Number(item.confidence) <= 1 ? Number(item.confidence) * 100 : Number(item.confidence))}%`,
                                                }}
                                              ></div>
                                            </div>
                                          </div>
                                          {item.description && (
                                            <p className="text-[10px] text-slate-500 line-clamp-2">{item.description}</p>
                                          )}
                                          {getApiReferenceLink(item) && (
                                            <a
                                              href={getApiReferenceLink(item)}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className={`mt-2 inline-flex items-center gap-1 text-[10px] font-bold ${isHealthyLeaf ? "text-emerald-700 hover:text-emerald-800" : "text-rose-700 hover:text-rose-800"}`}
                                            >
                                              อ้างอิง: ข้อมูลจากระบบ
                                              <ExternalLink className="w-3 h-3" />
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                                })
                            ) : (
                              <div className="text-center py-8">
                                <Bug className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                                <p className="text-sm text-slate-400 font-bold">ยังไม่มีข้อมูลสถานะโรคข้าว</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                        <p className="text-sm text-slate-400 font-bold mb-1">ไม่มีข้อมูลไทม์ไลน์</p>
                        <p className="text-xs text-slate-300">กรุณารอสักครู่หรือลองใหม่อีกครั้ง</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-slate-100 flex justify-end gap-3">
                    <button
                      onClick={() => setShowTimelineModal(false)}
                      className="px-6 py-2.5 bg-slate-100 text-slate-600 text-xs font-bold uppercase rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      ปิด
                    </button>
                    {/* <Link
                      href={`/Paddy/agriculture/sensor/${activeArea?.device_code || ""}`}
                      className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase rounded-xl hover:bg-emerald-600 transition-colors inline-flex items-center gap-2"
                    >
                      ดูรายละเอียดเซนเซอร์
                      <ExternalLink className="w-3 h-3" />
                    </Link> */}
                  </div>
                </div>
              </div>
            )}

            {previewImage && (
              <div
                className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setPreviewImage(null)}
              >
                <div
                  className="relative w-full max-w-5xl max-h-[92vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setPreviewImage(null)}
                    className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white text-slate-600 flex items-center justify-center shadow-lg hover:bg-slate-100"
                    aria-label="ปิดรูปภาพขยาย"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <img
                    src={previewImage.src}
                    alt={previewImage.title}
                    className="w-full max-h-[82vh] object-contain rounded-2xl bg-slate-900"
                  />
                  <div className="mt-3 rounded-xl bg-white/95 p-3 text-center">
                    <p className="text-sm font-bold text-slate-800">{previewImage.title}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      ที่มารูปภาพ: {previewImage.source}
                    </p>
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