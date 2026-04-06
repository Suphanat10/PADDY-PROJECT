// "use client";

// import React, { useState, useEffect, useRef, useMemo } from "react";
// import {
//   Server,
//   Wifi,
//   WifiOff,
//   Activity,
//   Zap,
//   Terminal,
//   Cpu,
//   Trash2,
//   PauseCircle,
//   PlayCircle,
//   Battery,
//   BatteryWarning,
//   Droplets,
//   Sprout,
//   AlertCircle,
//   Filter,
//   ChevronDown,
//   Building2,
//   Layers,
//   X,
//   MapPin,
// } from "lucide-react";
// import {
//   AdminSidebar,
//   AdminHeader,
// } from "../../../components/admin/AdminLayout";
// import {fetchDevices} from "@/lib/admin/send-data/device";
// import Footer from "@/app/components/Footer";
// import { useMonitorWebSocket } from "@/lib/admin/send-data/useMonitorWebSocket";


// export default function SystemLogPage() {
// const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [isPaused, setIsPaused] = useState(false);
//   const [activeMenu, setActiveMenu] = useState("sendData");

//   const [devices, setDevices] = useState([]);
//   const [logs, setLogs] = useState([]);
  
//   // Filter states
//   const [selectedFarm, setSelectedFarm] = useState("all");
//   const [selectedArea, setSelectedArea] = useState("all");
  
//   // 🔹 เพิ่ม State สำหรับเก็บสถานะล่าสุดของแต่ละเครื่อง
//   const [deviceStatusMap, setDeviceStatusMap] = useState({});

//   const logsEndRef = useRef(null);

//   // 🔹 โหลดอุปกรณ์จาก API
//   useEffect(() => {
//     fetchDevices()
//       .then((res) => {
//         // Handle nested data structure
//         const data = res?.data || res || [];
//         const deviceList = Array.isArray(data) ? data : [];
//         setDevices(deviceList);
//         // ตั้งค่าเริ่มต้นให้ทุกเครื่องเป็น offline ก่อนจนกว่าจะมีสัญญาณมา
//         const initialStatus = {};
//         deviceList.forEach(d => initialStatus[d.device_code] = d.status === "online" ? "online" : "offline");
//         setDeviceStatusMap(initialStatus);
//       })
//       .catch(console.error);
//   }, []);

//   // ดึงรายชื่อฟาร์มจากข้อมูล devices
//   const farms = useMemo(() => {
//     const farmMap = new Map();
//     devices.forEach(d => {
//       if (d.farm?.farm_id) {
//         farmMap.set(d.farm.farm_id, d.farm.farm_name);
//       }
//     });
//     return Array.from(farmMap, ([id, name]) => ({ id, name }));
//   }, [devices]);

//   // ดึงรายชื่อ areas ตามฟาร์มที่เลือก
//   const areas = useMemo(() => {
//     const areaMap = new Map();
//     devices.forEach(d => {
//       if (d.area?.area_id) {
//         // ถ้าเลือกฟาร์มแล้ว ให้แสดงเฉพาะ area ในฟาร์มนั้น
//         if (selectedFarm === "all" || d.farm?.farm_id === parseInt(selectedFarm)) {
//           areaMap.set(d.area.area_id, d.area.area_name);
//         }
//       }
//     });
//     return Array.from(areaMap, ([id, name]) => ({ id, name }));
//   }, [devices, selectedFarm]);

//   // Reset area filter เมื่อเปลี่ยนฟาร์ม
//   useEffect(() => {
//     setSelectedArea("all");
//   }, [selectedFarm]);

//   // กรองอุปกรณ์ตามตัวกรอง
//   const filteredDevices = useMemo(() => {
//     return devices.filter(d => {
//       if (selectedFarm !== "all" && d.farm?.farm_id !== parseInt(selectedFarm)) return false;
//       if (selectedArea !== "all" && d.area?.area_id !== parseInt(selectedArea)) return false;
//       return true;
//     });
//   }, [devices, selectedFarm, selectedArea]);

//   const onlineDeviceCodes = devices.map((d) => d.device_code);

//   const totalDevices = filteredDevices.length;
//   const onlineDevices = filteredDevices.filter(d => deviceStatusMap[d.device_code] === "online").length;
//   const offlineDevices = totalDevices - onlineDevices;

//   const hasActiveFilters = selectedFarm !== "all" || selectedArea !== "all";

//   // Device codes ที่ผ่านการกรอง
//   const filteredDeviceCodes = useMemo(() => {
//     return filteredDevices.map(d => d.device_code);
//   }, [filteredDevices]);

//   // กรอง logs ตาม device ที่เลือก
//   const filteredLogs = useMemo(() => {
//     if (!hasActiveFilters) return logs;
//     return logs.filter(log => filteredDeviceCodes.includes(log.deviceCode));
//   }, [logs, filteredDeviceCodes, hasActiveFilters]);

//   const clearFilters = () => {
//     setSelectedFarm("all");
//     setSelectedArea("all");
//   };

//   useMonitorWebSocket(onlineDeviceCodes, (msg) => {
//   if (isPaused) return;

//   if (msg.type === "SENSOR_UPDATE") {
//     const { deviceId, data, measured_at } = msg;
//     const thaiTime = new Date(measured_at).toLocaleString("th-TH", {
//       timeZone: "Asia/Bangkok",
//     });

//     // ตรวจสอบ log ล่าสุดของ device นี้
//     const lastLog = logs.slice().reverse().find(l => l.deviceCode === deviceId && l.text.includes('RECV'));
//     let isCache = false;
//     if (lastLog && lastLog.text.includes(`[${thaiTime}]`)) {
//       isCache = true;
//     }

//     // ถ้าเป็น cache: ไม่อัปเดตสถานะเป็น online
//     if (!isCache) {
//       setDeviceStatusMap(prev => ({ ...prev, [deviceId]: "online" }));
//     } else {
//       setDeviceStatusMap(prev => ({ ...prev, [deviceId]: "offline" })); 
//     }

//     // --- ปรับเกณฑ์ระดับน้ำ ---
//     let waterLevelStatus = "-";
//     const waterValue = typeof data?.water_level === "number" ? data.water_level : parseFloat(data?.water_level);
//     if (!isNaN(waterValue)) {
//       if (waterValue < 10) waterLevelStatus = "ต่ำ";
//       else if (waterValue > 30) waterLevelStatus = "สูง";
//       else waterLevelStatus = "ปกติ";
//     }

//     // เพิ่ม log ตามปกติ
//     const logLine = `[${thaiTime}] RECV (${deviceId}) -> ${JSON.stringify({
//       N: data?.N ?? "-",
//       P: data?.P ?? "-",
//       K: data?.K ?? "-",
//       water: data?.water_level ?? "-",
//       water_status: waterLevelStatus
//     })}${isCache ? " [CACHE]" : ""}`;

//     setLogs((prev) => [...prev, { id: Date.now(), text: logLine, deviceCode: deviceId }].slice(-1000));
//   }
// });

//   useEffect(() => {
//     logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [logs]);
//   return (
//     <div className="flex h-screen bg-slate-50 text-slate-600 overflow-hidden">
//       <AdminSidebar
//         sidebarOpen={sidebarOpen}
//         setSidebarOpen={setSidebarOpen}
//         activeMenu={activeMenu}
//       />

//       <div className="flex flex-1 flex-col relative z-0">
//         <AdminHeader setSidebarOpen={setSidebarOpen} />

//         <main className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
//           {/* === PART 1: TOP SECTION (SUMMARY CARDS) === */}
//           <div className="flex-none">
//             <div className="flex items-center justify-between mb-4">
//               <div className="flex items-center gap-2">
//                 <Server className="w-6 h-6 text-indigo-600" />
//                 <h2 className="text-xl font-bold text-slate-800">
//                  Data Monitoring
//                 </h2>
//               </div>
//             </div>

//             {/* Filter Section */}
//             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4">
//               <div className="flex items-center gap-2 mb-3">
//                 <Filter className="w-4 h-4 text-slate-400" />
//                 <span className="text-sm font-medium text-slate-700">ตัวกรอง</span>
//                 {hasActiveFilters && (
//                   <button
//                     onClick={clearFilters}
//                     className="ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-rose-500 transition-colors"
//                   >
//                     <X className="w-3 h-3" />
//                     ล้างตัวกรอง
//                   </button>
//                 )}
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {/* Farm Filter */}
//                 <div>
//                   <label className="block text-xs font-medium text-slate-500 mb-1.5">
//                     <Building2 className="w-3 h-3 inline mr-1" />
//                     ฟาร์ม
//                   </label>
//                   <div className="relative">
//                     <select
//                       value={selectedFarm}
//                       onChange={(e) => setSelectedFarm(e.target.value)}
//                       className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
//                     >
//                       <option value="all">ทุกฟาร์ม</option>
//                       {farms.map(f => (
//                         <option key={f.id} value={f.id}>{f.name}</option>
//                       ))}
//                     </select>
//                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
//                   </div>
//                 </div>

//                 {/* Area Filter */}
//                 <div>
//                   <label className="block text-xs font-medium text-slate-500 mb-1.5">
//                     <Layers className="w-3 h-3 inline mr-1" />
//                     แปลง/พื้นที่
//                   </label>
//                   <div className="relative">
//                     <select
//                       value={selectedArea}
//                       onChange={(e) => setSelectedArea(e.target.value)}
//                       className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
//                     >
//                       <option value="all">ทุกพื้นที่</option>
//                       {areas.map(a => (
//                         <option key={a.id} value={a.id}>{a.name}</option>
//                       ))}
//                     </select>
//                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* 3 Summary Cards Grid */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//               {/* Card 1: Total */}
//               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
//                 <div>
//                   <p className="text-xs text-slate-500 font-medium uppercase mb-1">
//                     อุปกรณ์ทั้งหมด
//                   </p>
//                   <h3 className="text-2xl font-bold text-slate-800">
//                     {totalDevices}
//                   </h3>
//                 </div>
//                 <div className="p-3 bg-slate-100 rounded-lg text-slate-500">
//                   <Cpu className="w-6 h-6" />
//                 </div>
//               </div>

//               {/* Card 2: Online */}
//               <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex items-center justify-between relative overflow-hidden">
//                 <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-full -mr-10 -mt-10 opacity-50"></div>
//                 <div className="relative z-10">
//                   <p className="text-xs text-green-600 font-medium uppercase mb-1">
//                     กำลังส่งข้อมูล (Online)
//                   </p>
//                   <h3 className="text-2xl font-bold text-green-700">
//                       {onlineDevices}
//                   </h3>
//                 </div>
//                 <div className="relative z-10 p-3 bg-green-100 rounded-lg text-green-600">
//                   <Wifi className="w-6 h-6" />
//                   <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
//                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
//                     <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
//                   </span>
//                 </div>
//               </div>

//               {/* Card 3: Offline */}
//               <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex items-center justify-between">
//                 <div>
//                   <p className="text-xs text-red-500 font-medium uppercase mb-1">
//                     ไม่ส่งข้อมูล (Offline)
//                   </p>
//                   <h3 className="text-2xl font-bold text-red-600">
//                     {offlineDevices}
//                   </h3>
//                 </div>
//                 <div className="p-3 bg-red-50 rounded-lg text-red-500">
//                   <WifiOff className="w-6 h-6" />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* === PART 2: BOTTOM SECTION (SERIAL MONITOR) === */}
//           <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
//             {/* Console Header */}
//             <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
//               <div className="flex items-center gap-2">
//                 <Terminal className="w-4 h-4 text-slate-500" />
//                 <h3 className="text-sm font-bold text-slate-700 font-mono">
//                   Live Serial Monitor
//                 </h3>
//               </div>

//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => setLogs([])}
//                   className="text-xs text-slate-500 hover:text-rose-500 transition-colors flex items-center gap-1"
//                 >
//                   <Trash2 className="w-3.5 h-3.5" />
//                   Clear
//                 </button>
//               </div>
//             </div>

//             {/* Console Body */}
//             <div className="flex-1 bg-[#1e1e1e] p-4 overflow-y-auto font-mono text-xs leading-relaxed custom-scrollbar">
//               {filteredLogs.length === 0 && (
//                 <div className="text-gray-500 text-center mt-10 opacity-50">
//                   {hasActiveFilters ? 'ไม่มีข้อมูลจากอุปกรณ์ในพื้นที่ที่เลือก...' : 'Waiting for data...'}
//                 </div>
//               )}
//               {filteredLogs.map((log, index) => (
//                 <div
//                   key={index}
//                   className="text-gray-300 border-l-2 border-transparent hover:border-green-500 pl-2 -ml-2 py-0.5"
//                 >
//                   <span className="text-green-500 mr-2 opacity-70">➜</span>
//                   {log.text}
//                 </div>
//               ))}
//               <div ref={logsEndRef} />
//             </div>
//           </div>
//         </main>
//         <Footer />
//       </div>
//       <style jsx global>{`
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 8px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: #1e1e1e;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: #4b5563;
//           border-radius: 4px;
//         }
//       `}</style>
//     </div>
//   );
// }
// "use client";

// import React, { useState, useEffect, useRef, useMemo } from "react";
// import {
//   Server,
//   Wifi,
//   WifiOff,
//   Terminal,
//   Cpu,
//   Trash2,
//   PauseCircle,
//   PlayCircle,
//   Filter,
//   ChevronDown,
//   Building2,
//   Layers,
//   X,
// } from "lucide-react";
// import {
//   AdminSidebar,
//   AdminHeader,
// } from "../../../components/admin/AdminLayout";
// import { fetchDevices } from "@/lib/admin/send-data/device";
// import Footer from "@/app/components/Footer";
// import { useMonitorWebSocket } from "@/lib/admin/send-data/useMonitorWebSocket";

// // ✅ แปลงวันเวลาเป็นแบบไทย รองรับทั้ง ISO และ "d/m/พ.ศ. HH:MM:SS"
// function formatThaiDateTime(input) {
//   if (!input) return "-";

//   let date;

//   // กรณีเป็น พ.ศ. อยู่แล้ว
//   const thaiMatch = input
//     .toString()
//     .match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})/);

//   if (thaiMatch) {
//     const [, dd, mm, buddhistYear, hh, min, ss] = thaiMatch;
//     const gregorianYear = parseInt(buddhistYear) - 543;

//     date = new Date(
//       gregorianYear,
//       parseInt(mm) - 1,
//       parseInt(dd),
//       parseInt(hh),
//       parseInt(min),
//       parseInt(ss)
//     );
//   } else {
//     // ✅ ใช้ตรงๆ ไม่ต้อง +7 แล้ว
//     date = new Date(input);
//   }

//   if (isNaN(date.getTime())) return String(input);

//   const dd = String(date.getDate()).padStart(2, "0");
//   const mm = String(date.getMonth() + 1).padStart(2, "0");
//   const yyyy = date.getFullYear() + 543;
//   const hh = String(date.getHours()).padStart(2, "0");
//   const min = String(date.getMinutes()).padStart(2, "0");
//   const ss = String(date.getSeconds()).padStart(2, "0");

//   return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
// }

// export default function SystemLogPage() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [isPaused, setIsPaused] = useState(false);
//   const [activeMenu, setActiveMenu] = useState("sendData");

//   const [devices, setDevices] = useState([]);
//   const [logs, setLogs] = useState([]);

//   const [selectedFarm, setSelectedFarm] = useState("all");
//   const [selectedArea, setSelectedArea] = useState("all");

//   const [deviceStatusMap, setDeviceStatusMap] = useState({});

//   const isPausedRef = useRef(false);
//   const cacheCountRef = useRef({});
//   // ✅ เปลี่ยนเป็น payload-based cache detection
//   const lastPayloadRef = useRef({});

//   const logsContainerRef = useRef(null);
//   const logsEndRef = useRef(null);
//   const isAtBottomRef = useRef(true);

//   useEffect(() => {
//     isPausedRef.current = isPaused;
//   }, [isPaused]);

//   useEffect(() => {
//     fetchDevices()
//       .then((res) => {
//         const data = res?.data || res || [];
//         const deviceList = Array.isArray(data) ? data : [];
//         setDevices(deviceList);
//         const initialStatus = {};
//         deviceList.forEach(
//           (d) =>
//             (initialStatus[d.device_code] =
//               d.status === "online" ? "online" : "offline")
//         );
//         setDeviceStatusMap(initialStatus);
//       })
//       .catch(console.error);
//   }, []);

//   const handleScroll = () => {
//     const el = logsContainerRef.current;
//     if (!el) return;
//     isAtBottomRef.current =
//       el.scrollHeight - el.scrollTop - el.clientHeight < 60;
//   };

//   useEffect(() => {
//     if (isAtBottomRef.current) {
//       logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [logs]);

//   const farms = useMemo(() => {
//     const farmMap = new Map();
//     devices.forEach((d) => {
//       if (d.farm?.farm_id) farmMap.set(d.farm.farm_id, d.farm.farm_name);
//     });
//     return Array.from(farmMap, ([id, name]) => ({ id, name }));
//   }, [devices]);

//   const areas = useMemo(() => {
//     const areaMap = new Map();
//     devices.forEach((d) => {
//       if (d.area?.area_id) {
//         if (
//           selectedFarm === "all" ||
//           d.farm?.farm_id === parseInt(selectedFarm)
//         ) {
//           areaMap.set(d.area.area_id, d.area.area_name);
//         }
//       }
//     });
//     return Array.from(areaMap, ([id, name]) => ({ id, name }));
//   }, [devices, selectedFarm]);

//   useEffect(() => {
//     setSelectedArea("all");
//   }, [selectedFarm]);

//   const filteredDevices = useMemo(() => {
//     return devices.filter((d) => {
//       if (
//         selectedFarm !== "all" &&
//         d.farm?.farm_id !== parseInt(selectedFarm)
//       )
//         return false;
//       if (
//         selectedArea !== "all" &&
//         d.area?.area_id !== parseInt(selectedArea)
//       )
//         return false;
//       return true;
//     });
//   }, [devices, selectedFarm, selectedArea]);

//   const onlineDeviceCodes = devices.map((d) => d.device_code);

//   const totalDevices = filteredDevices.length;
//   const onlineDevices = filteredDevices.filter(
//     (d) => deviceStatusMap[d.device_code] === "online"
//   ).length;
//   const offlineDevices = totalDevices - onlineDevices;

//   const hasActiveFilters = selectedFarm !== "all" || selectedArea !== "all";

//   const filteredDeviceCodes = useMemo(
//     () => filteredDevices.map((d) => d.device_code),
//     [filteredDevices]
//   );

//   const filteredLogs = useMemo(() => {
//     if (!hasActiveFilters) return logs;
//     return logs.filter((log) => filteredDeviceCodes.includes(log.deviceCode));
//   }, [logs, filteredDeviceCodes, hasActiveFilters]);

//   const clearFilters = () => {
//     setSelectedFarm("all");
//     setSelectedArea("all");
//   };

//   useMonitorWebSocket(onlineDeviceCodes, (msg) => {
//     if (isPausedRef.current) return;

//     if (msg.type === "SENSOR_UPDATE") {
//       const { deviceId, data, measured_at } = msg;

//       // ✅ แปลงเวลาไทย
//       const thaiDateTime = formatThaiDateTime(measured_at);

//       // ✅ Cache = timestamp + ข้อมูลเหมือนกันทุกตัว
//       const currentKey = `${thaiDateTime}|${data?.N}|${data?.P}|${data?.K}|${data?.water_level}`;
//       const lastKey = lastPayloadRef.current[deviceId];
//       const isCache = lastKey === currentKey;
//       lastPayloadRef.current[deviceId] = currentKey;

//       // ✅ นับ CACHE ต่อเนื่อง ≥ 1 → offline
//       if (!isCache) {
//         cacheCountRef.current[deviceId] = 0;
//         setDeviceStatusMap((prev) => ({ ...prev, [deviceId]: "online" }));
//       } else {
//         const count = (cacheCountRef.current[deviceId] ?? 0) + 1;
//         cacheCountRef.current[deviceId] = count;
//         if (count >= 1) {
//           setDeviceStatusMap((prev) => ({ ...prev, [deviceId]: "offline" }));
//         }
//       }

    
//       const logLine = `[${thaiDateTime}] RECV (${deviceId}) -> ${JSON.stringify(
//         {
//           N: data?.N ?? "-",
//           P: data?.P ?? "-",
//           K: data?.K ?? "-",
//           water: data?.water_level ?? "-",
//         }
//       )}${isCache ? ` [CACHE x${cacheCountRef.current[deviceId]}]` : ""}`;

//       setLogs((prev) =>
//         [
//           ...prev,
//           {
//             id: Date.now() + Math.random(),
//             text: logLine,
//             deviceCode: deviceId,
//           },
//         ].slice(-1000)
//       );
//     }
//   });

//   return (
//     <div className="flex h-screen bg-slate-50 text-slate-600 overflow-hidden">
//       <AdminSidebar
//         sidebarOpen={sidebarOpen}
//         setSidebarOpen={setSidebarOpen}
//         activeMenu={activeMenu}
//       />

//       <div className="flex flex-1 flex-col relative z-0">
//         <AdminHeader setSidebarOpen={setSidebarOpen} />

//         <main className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
//           {/* PART 1: SUMMARY */}
//           <div className="flex-none">
//             <div className="flex items-center justify-between mb-4">
//               <div className="flex items-center gap-2">
//                 <Server className="w-6 h-6 text-indigo-600" />
//                 <h2 className="text-xl font-bold text-slate-800">
//                   Data Monitoring
//                 </h2>
//               </div>
//             </div>

//             {/* Filter */}
//             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4">
//               <div className="flex items-center gap-2 mb-3">
//                 <Filter className="w-4 h-4 text-slate-400" />
//                 <span className="text-sm font-medium text-slate-700">
//                   ตัวกรอง
//                 </span>
//                 {hasActiveFilters && (
//                   <button
//                     onClick={clearFilters}
//                     className="ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-rose-500 transition-colors"
//                   >
//                     <X className="w-3 h-3" />
//                     ล้างตัวกรอง
//                   </button>
//                 )}
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-xs font-medium text-slate-500 mb-1.5">
//                     <Building2 className="w-3 h-3 inline mr-1" />
//                     ฟาร์ม
//                   </label>
//                   <div className="relative">
//                     <select
//                       value={selectedFarm}
//                       onChange={(e) => setSelectedFarm(e.target.value)}
//                       className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
//                     >
//                       <option value="all">ทุกฟาร์ม</option>
//                       {farms.map((f) => (
//                         <option key={f.id} value={f.id}>
//                           {f.name}
//                         </option>
//                       ))}
//                     </select>
//                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-slate-500 mb-1.5">
//                     <Layers className="w-3 h-3 inline mr-1" />
//                     แปลง/พื้นที่
//                   </label>
//                   <div className="relative">
//                     <select
//                       value={selectedArea}
//                       onChange={(e) => setSelectedArea(e.target.value)}
//                       className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
//                     >
//                       <option value="all">ทุกพื้นที่</option>
//                       {areas.map((a) => (
//                         <option key={a.id} value={a.id}>
//                           {a.name}
//                         </option>
//                       ))}
//                     </select>
//                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Summary Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
//                 <div>
//                   <p className="text-xs text-slate-500 font-medium uppercase mb-1">
//                     อุปกรณ์ทั้งหมด
//                   </p>
//                   <h3 className="text-2xl font-bold text-slate-800">
//                     {totalDevices}
//                   </h3>
//                 </div>
//                 <div className="p-3 bg-slate-100 rounded-lg text-slate-500">
//                   <Cpu className="w-6 h-6" />
//                 </div>
//               </div>

//               <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex items-center justify-between relative overflow-hidden">
//                 <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-full -mr-10 -mt-10 opacity-50" />
//                 <div className="relative z-10">
//                   <p className="text-xs text-green-600 font-medium uppercase mb-1">
//                     กำลังส่งข้อมูล (Online)
//                   </p>
//                   <h3 className="text-2xl font-bold text-green-700">
//                     {onlineDevices}
//                   </h3>
//                 </div>
//                 <div className="relative z-10 p-3 bg-green-100 rounded-lg text-green-600">
//                   <Wifi className="w-6 h-6" />
//                   <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
//                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
//                     <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
//                   </span>
//                 </div>
//               </div>

//               <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex items-center justify-between">
//                 <div>
//                   <p className="text-xs text-red-500 font-medium uppercase mb-1">
//                     ไม่ส่งข้อมูล (Offline)
//                   </p>
//                   <h3 className="text-2xl font-bold text-red-600">
//                     {offlineDevices}
//                   </h3>
//                 </div>
//                 <div className="p-3 bg-red-50 rounded-lg text-red-500">
//                   <WifiOff className="w-6 h-6" />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* PART 2: SERIAL MONITOR */}
//           <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
//             <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
//               <div className="flex items-center gap-3">
//                 <Terminal className="w-4 h-4 text-slate-500" />
//                 <h3 className="text-sm font-bold text-slate-700 font-mono">
//                   Live Serial Monitor
//                 </h3>
//                 <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-mono">
//                   {filteredLogs.length} entries
//                 </span>
//                 {isPaused ? (
//                   <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full flex items-center gap-1">
//                     <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
//                     Paused
//                   </span>
//                 ) : (
//                   <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1">
//                     <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
//                     Live
//                   </span>
//                 )}
//               </div>

//               <div className="flex items-center gap-3">
//                 <button
//                   onClick={() => setIsPaused((p) => !p)}
//                   className={`text-xs flex items-center gap-1 transition-colors ${
//                     isPaused
//                       ? "text-amber-500 hover:text-amber-600"
//                       : "text-slate-500 hover:text-slate-700"
//                   }`}
//                 >
//                   {isPaused ? (
//                     <>
//                       <PlayCircle className="w-3.5 h-3.5" />
//                       Resume
//                     </>
//                   ) : (
//                     <>
//                       <PauseCircle className="w-3.5 h-3.5" />
//                       Pause
//                     </>
//                   )}
//                 </button>
//                 <div className="w-px h-4 bg-slate-200" />
//                 <button
//                   onClick={() => setLogs([])}
//                   className="text-xs text-slate-500 hover:text-rose-500 transition-colors flex items-center gap-1"
//                 >
//                   <Trash2 className="w-3.5 h-3.5" />
//                   Clear
//                 </button>
//               </div>
//             </div>

//             <div
//               ref={logsContainerRef}
//               onScroll={handleScroll}
//               className="flex-1 bg-[#1e1e1e] p-4 overflow-y-auto font-mono text-xs leading-relaxed custom-scrollbar"
//             >
//               {filteredLogs.length === 0 && (
//                 <div className="text-gray-500 text-center mt-10 opacity-50">
//                   {hasActiveFilters
//                     ? "ไม่มีข้อมูลจากอุปกรณ์ในพื้นที่ที่เลือก..."
//                     : "Waiting for data..."}
//                 </div>
//               )}
//               {filteredLogs.map((log, index) => {
//                 const isCache = log.text.includes("[CACHE");
//                 return (
//                   <div
//                     key={log.id ?? index}
//                     className="border-l-2 border-transparent hover:border-green-500 pl-2 -ml-2 py-0.5"
//                   >
//                     <span className="text-green-500 mr-2 opacity-70">➜</span>
//                     {/* timestamp สีฟ้า */}
//                     <span className={isCache ? "text-yellow-300" : "text-cyan-400"}>
//                       {log.text.match(/^\[.*?\]/)?.[0] ?? ""}
//                     </span>
//                     {/* ข้อมูล */}
//                     <span className={isCache ? "text-yellow-400" : "text-gray-300"}>
//                       {log.text.replace(/^\[.*?\]\s*/, " ")}
//                     </span>
//                   </div>
//                 );
//               })}
//               <div ref={logsEndRef} />
//             </div>
//           </div>
//         </main>
//         <Footer />
//       </div>

//       <style jsx global>{`
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 8px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: #1e1e1e;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: #4b5563;
//           border-radius: 4px;
//         }
//       `}</style>
//     </div>
//   );
// }

"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Server,
  Wifi,
  WifiOff,
  Terminal,
  Cpu,
  Trash2,
  PauseCircle,
  PlayCircle,
  Filter,
  ChevronDown,
  Building2,
  Layers,
  X,
} from "lucide-react";
import {
  AdminSidebar,
  AdminHeader,
} from "../../../components/admin/AdminLayout";
import { fetchDevices } from "@/lib/admin/send-data/device";
import Footer from "@/app/components/Footer";
import { useMonitorWebSocket } from "@/lib/admin/send-data/useMonitorWebSocket";

const OFFLINE_TIMEOUT_MS = 5 * 60 * 1000; // 5 นาที
const CHECK_INTERVAL_MS  = 30 * 1000;     // ตรวจทุก 30 วินาที

// ✅ แปลงวันเวลาเป็นแบบไทย รองรับทั้ง ISO และ "d/m/พ.ศ. HH:MM:SS"
function formatThaiDateTime(input) {
  if (!input) return "-";

  let date;

  // กรณีเป็น พ.ศ. อยู่แล้ว
  const thaiMatch = input
    .toString()
    .match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})/);

  if (thaiMatch) {
    const [, dd, mm, buddhistYear, hh, min, ss] = thaiMatch;
    const gregorianYear = parseInt(buddhistYear) - 543;

    date = new Date(
      gregorianYear,
      parseInt(mm) - 1,
      parseInt(dd),
      parseInt(hh),
      parseInt(min),
      parseInt(ss)
    );
  } else {
    // ✅ ใช้ตรงๆ ไม่ต้อง +7 แล้ว
    date = new Date(input);
  }

  if (isNaN(date.getTime())) return String(input);

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear() + 543;
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");

  return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
}

export default function SystemLogPage() {
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [isPaused, setIsPaused]         = useState(false);
  const [activeMenu]                    = useState("sendData");
  const [devices, setDevices]           = useState([]);
  const [logs, setLogs]                 = useState([]);
  const [selectedFarm, setSelectedFarm] = useState("all");
  const [selectedArea, setSelectedArea] = useState("all");
  const [deviceStatusMap, setDeviceStatusMap] = useState({});

  // Refs — ไม่มี stale closure
  const isPausedRef    = useRef(false);
  const cacheCountRef  = useRef({});
  const lastPayloadRef = useRef({});

  // ✅ เก็บเวลา (Date.now()) ที่ได้รับข้อมูลจริง (ไม่ใช่ cache) ล่าสุดของแต่ละ device
  const lastReceivedAtRef = useRef({});

  const logsContainerRef = useRef(null);
  const logsEndRef       = useRef(null);
  const isAtBottomRef    = useRef(true);

  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

  // โหลด devices
  useEffect(() => {
    fetchDevices()
      .then((res) => {
        const data       = res?.data || res || [];
        const deviceList = Array.isArray(data) ? data : [];
        setDevices(deviceList);
        const initialStatus = {};
        deviceList.forEach(
          (d) => (initialStatus[d.device_code] =
            d.status === "online" ? "online" : "offline")
        );
        setDeviceStatusMap(initialStatus);
      })
      .catch(console.error);
  }, []);

  // ✅ Timer ตรวจ offline ทุก 30 วินาที
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setDeviceStatusMap((prev) => {
        const next = { ...prev };
        let changed = false;
        Object.entries(lastReceivedAtRef.current).forEach(([deviceId, ts]) => {
          // ถ้าเกิน 5 นาทีนับจากครั้งสุดท้ายที่ได้รับข้อมูลจริง
          if (now - ts > OFFLINE_TIMEOUT_MS && next[deviceId] !== "offline") {
            next[deviceId] = "offline";
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const handleScroll = () => {
    const el = logsContainerRef.current;
    if (!el) return;
    isAtBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  };

  useEffect(() => {
    if (isAtBottomRef.current) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const farms = useMemo(() => {
    const map = new Map();
    devices.forEach((d) => {
      if (d.farm?.farm_id) map.set(d.farm.farm_id, d.farm.farm_name);
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [devices]);

  const areas = useMemo(() => {
    const map = new Map();
    devices.forEach((d) => {
      if (d.area?.area_id) {
        if (selectedFarm === "all" || d.farm?.farm_id === parseInt(selectedFarm))
          map.set(d.area.area_id, d.area.area_name);
      }
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [devices, selectedFarm]);

  useEffect(() => { setSelectedArea("all"); }, [selectedFarm]);

  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      if (selectedFarm !== "all" && d.farm?.farm_id !== parseInt(selectedFarm)) return false;
      if (selectedArea !== "all" && d.area?.area_id !== parseInt(selectedArea)) return false;
      return true;
    });
  }, [devices, selectedFarm, selectedArea]);

  const onlineDeviceCodes = devices.map((d) => d.device_code);
  const totalDevices      = filteredDevices.length;
  const onlineDevices     = filteredDevices.filter(
    (d) => deviceStatusMap[d.device_code] === "online"
  ).length;
  const offlineDevices    = totalDevices - onlineDevices;
  const hasActiveFilters  = selectedFarm !== "all" || selectedArea !== "all";

  const filteredDeviceCodes = useMemo(
    () => filteredDevices.map((d) => d.device_code),
    [filteredDevices]
  );

  const filteredLogs = useMemo(() => {
    let result = logs;
    
    // ✅ กรอง: แสดงเฉพาะ logs จากอุปกรณ์ที่ status เป็น "online"
    result = result.filter((log) => deviceStatusMap[log.deviceCode] === "online");
    
    // ✅ กรอง: ตามพื้นที่ที่เลือก (ถ้ามี)
    if (hasActiveFilters) {
      result = result.filter((log) => filteredDeviceCodes.includes(log.deviceCode));
    }
    
    return result;
  }, [logs, filteredDeviceCodes, hasActiveFilters, deviceStatusMap]);

  // WebSocket
  useMonitorWebSocket(onlineDeviceCodes, (msg) => {
    if (isPausedRef.current) return;

    if (msg.type === "SENSOR_UPDATE") {
      const { deviceId, data, measured_at } = msg;
      const thaiDateTime = formatThaiDateTime(measured_at);

      // Cache = timestamp + ค่าเซ็นเซอร์เหมือนกันทุกตัว
      const currentKey = `${thaiDateTime}|${data?.N}|${data?.P}|${data?.K}|${data?.water_level}`;
      const isCache    = lastPayloadRef.current[deviceId] === currentKey;
      lastPayloadRef.current[deviceId] = currentKey;

      if (!isCache) {
        // ✅ รับข้อมูลจริง → reset counter + บันทึกเวลาล่าสุด + online
        cacheCountRef.current[deviceId]    = 0;
        lastReceivedAtRef.current[deviceId] = Date.now();
        setDeviceStatusMap((prev) => ({ ...prev, [deviceId]: "online" }));

        // ✅ บันทึก log เฉพาะข้อมูลที่ส่งจริง (ไม่ใช่ cache)
        const logLine = `[${thaiDateTime}] RECV (${deviceId}) -> ${JSON.stringify({
          N: data?.N ?? "-",
          P: data?.P ?? "-",
          K: data?.K ?? "-",
          water: data?.water_level ?? "-",
        })}`;

        setLogs((prev) =>
          [
            ...prev,
            { id: Date.now() + Math.random(), text: logLine, deviceCode: deviceId },
          ].slice(-1000)
        );
      } else {
        // CACHE ต่อเนื่อง ≥ 2 → offline
        const count = (cacheCountRef.current[deviceId] ?? 0) + 1;
        cacheCountRef.current[deviceId] = count;
        if (count >= 2) {
          setDeviceStatusMap((prev) => ({ ...prev, [deviceId]: "offline" }));
        }
        // ❌ ไม่บันทึก log สำหรับ cache
      }
    }

    // ✅ จัดการ DEVICE_STATUS จากเซิร์ฟเวอร์
    if (msg.type === "DEVICE_STATUS") {
      const { deviceId, status, reason } = msg;
      
      // อัปเดตสถานะอุปกรณ์ตามที่เซิร์ฟเวอร์ส่งมา
      setDeviceStatusMap((prev) => ({ ...prev, [deviceId]: status }));

      // บันทึกเหตุผลลงใน log
      if (reason) {
        const statusIcon = status === "online" ? "🟢" : "🔴";
        const logLine = `[${formatThaiDateTime(new Date().toISOString())}] STATUS (${deviceId}) -> ${statusIcon} ${status.toUpperCase()} | ${reason}`;
        
        setLogs((prev) =>
          [
            ...prev,
            { id: Date.now() + Math.random(), text: logLine, deviceCode: deviceId },
          ].slice(-1000)
        );
      }

      // ✅ ถ้าสถานะคืณ "online" ให้ reset cache counter
      if (status === "online") {
        cacheCountRef.current[deviceId] = 0;
        lastReceivedAtRef.current[deviceId] = Date.now();
      }
    }
  });

  return (
    <div className="flex h-screen bg-slate-50 text-slate-600 overflow-hidden">
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeMenu={activeMenu}
      />

      <div className="flex flex-1 flex-col relative z-0">
        <AdminHeader setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
          {/* PART 1: HEADER + FILTERS + CARDS */}
          <div className="flex-none">
            <div className="flex items-center gap-2 mb-4">
              <Server className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-800">Data Monitoring</h2>
            </div>

            {/* Filter */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">ตัวกรอง</span>
                {hasActiveFilters && (
                  <button
                    onClick={() => { setSelectedFarm("all"); setSelectedArea("all"); }}
                    className="ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-rose-500 transition-colors"
                  >
                    <X className="w-3 h-3" /> ล้างตัวกรอง
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Farm */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    <Building2 className="w-3 h-3 inline mr-1" /> ฟาร์ม
                  </label>
                  <div className="relative">
                    <select
                      value={selectedFarm}
                      onChange={(e) => setSelectedFarm(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                    >
                      <option value="all">ทุกฟาร์ม</option>
                      {farms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                {/* Area */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    <Layers className="w-3 h-3 inline mr-1" /> แปลง/พื้นที่
                  </label>
                  <div className="relative">
                    <select
                      value={selectedArea}
                      onChange={(e) => setSelectedArea(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                    >
                      <option value="all">ทุกพื้นที่</option>
                      {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Total */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase mb-1">อุปกรณ์ทั้งหมด</p>
                  <h3 className="text-2xl font-bold text-slate-800">{totalDevices}</h3>
                </div>
                <div className="p-3 bg-slate-100 rounded-lg text-slate-500">
                  <Cpu className="w-6 h-6" />
                </div>
              </div>

              {/* Online */}
              <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-full -mr-10 -mt-10 opacity-50" />
                <div className="relative z-10">
                  <p className="text-xs text-green-600 font-medium uppercase mb-1">กำลังส่งข้อมูล (Online)</p>
                  <h3 className="text-2xl font-bold text-green-700">{onlineDevices}</h3>
                </div>
                <div className="relative z-10 p-3 bg-green-100 rounded-lg text-green-600">
                  <Wifi className="w-6 h-6" />
                  <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                  </span>
                </div>
              </div>

              {/* Offline */}
              <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-500 font-medium uppercase mb-1">ไม่ส่งข้อมูล (Offline)</p>
                  <h3 className="text-2xl font-bold text-red-600">{offlineDevices}</h3>
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-red-500">
                  <WifiOff className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* PART 2: SERIAL MONITOR */}
          <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <Terminal className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-700 font-mono">Live Serial Monitor</h3>
                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                  {filteredLogs.length} entries
                </span>
                {isPaused ? (
                  <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Paused
                  </span>
                ) : (
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPaused((p) => !p)}
                  className={`text-xs flex items-center gap-1 transition-colors ${
                    isPaused ? "text-amber-500 hover:text-amber-600" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {isPaused
                    ? <><PlayCircle className="w-3.5 h-3.5" /> Resume</>
                    : <><PauseCircle className="w-3.5 h-3.5" /> Pause</>
                  }
                </button>
                <div className="w-px h-4 bg-slate-200" />
                <button
                  onClick={() => setLogs([])}
                  className="text-xs text-slate-500 hover:text-rose-500 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              </div>
            </div>

            <div
              ref={logsContainerRef}
              onScroll={handleScroll}
              className="flex-1 bg-[#1e1e1e] p-4 overflow-y-auto font-mono text-xs leading-relaxed custom-scrollbar"
            >
              {filteredLogs.length === 0 && (
                <div className="text-gray-500 text-center mt-10 opacity-50">
                  {hasActiveFilters ? "ไม่มีข้อมูลจากอุปกรณ์ในพื้นที่ที่เลือก..." : "Waiting for data..."}
                </div>
              )}
              {filteredLogs.map((log, index) => {
                const isCache = log.text.includes("[CACHE");
                return (
                  <div
                    key={log.id ?? index}
                    className="border-l-2 border-transparent hover:border-green-500 pl-2 -ml-2 py-0.5"
                  >
                    <span className="text-green-500 mr-2 opacity-70">➜</span>
                    <span className={isCache ? "text-yellow-300" : "text-cyan-400"}>
                      {log.text.match(/^\[.*?\]/)?.[0] ?? ""}
                    </span>
                    <span className={isCache ? "text-yellow-400" : "text-gray-300"}>
                      {log.text.replace(/^\[.*?\]\s*/, " ")}
                    </span>
                  </div>
                );
              })}
              <div ref={logsEndRef} />
            </div>
          </div>
        </main>
        <Footer />
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1e1e1e; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 4px; }
      `}</style>
    </div>
  );
}