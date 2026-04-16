// "use client";
 
// import { useEffect, useState, useMemo } from "react";
// import {
//   Droplets,
//   Activity,
//   CheckCircle,
//   XCircle,
//   AlertCircle,
//   Sprout,
//   Search,
//   Plus,
//   Trash2,
//   MapPin,
//   Clock,
//   Loader2,
//   ScanQrCode,
//   ArrowLeftRight,
//   RefreshCw,
//   ChevronRight,
//   X,
//   Cpu,
//   Signal,
// } from "lucide-react";
// import { Kanit } from "next/font/google";
 
// const kanit = Kanit({ subsets: ["thai", "latin"], weight: ["300", "400", "500", "600", "700"] });
// import Link from "next/link";
// import Header from "../components/Header";
// import Footer from "@/app/components/Footer";
// import { closeSensorWebSocket } from "@/lib/devices/sensorWebSocket";
// import { loadDevicesService } from "@/lib/devices/loadDevices";
// import { deleteDeviceByCode } from "@/lib/devices/deleteDevice";
// import { createSensorWebSocket } from "@/lib/devices/sensorWebSocket";
 
// // --- helpers ---
// const getStatusBadge = (status) => {
//   const map = {
//     connected: { text: "เชื่อมต่อแล้ว", dot: "bg-emerald-500", text_color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle },
//     online:    { text: "เชื่อมต่อแล้ว", dot: "bg-emerald-500", text_color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle },
//     disconnected: { text: "ขาดการเชื่อมต่อ", dot: "bg-gray-400", text_color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200", icon: XCircle },
//     offline:      { text: "ขาดการเชื่อมต่อ", dot: "bg-gray-400", text_color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200", icon: XCircle },
//     warning: { text: "ตรวจสอบ", dot: "bg-amber-500", text_color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: AlertCircle },
//   };
//   const item = map[status] || map.disconnected;
//   const Icon = item.icon;
//   return (
//     <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.bg} ${item.text_color} ${item.border}`}>
//       <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
//       {item.text}
//     </span>
//   );
// };
 
// const getStatusIcon = (status) => {
//   if (status === "connected" || status === "online")
//     return <CheckCircle className="w-4 h-4 text-emerald-500" />;
//   if (status === "warning")
//     return <AlertCircle className="w-4 h-4 text-amber-500" />;
//   return <XCircle className="w-4 h-4 text-gray-400" />;
// };
 
// export default function DeviceListPage() {
//   const [sensorDevices, setSensorDevices]   = useState([]);
//   const [selectedDevice, setSelectedDevice] = useState(null);
//   const [isWsConnected, setIsWsConnected]   = useState(false);
//   const [loading, setLoading]               = useState(true);
//   const [searchTerm, setSearchTerm]         = useState("");
//   const [filterStatus, setFilterStatus]     = useState("สถานะทั้งหมด");
//   const [modalOpen, setModalOpen]           = useState(false);
//   const [viewMode, setViewMode]             = useState("devices");
//   const [pumpSearchTerm, setPumpSearchTerm] = useState("");
//   const [pumpFilterStatus, setPumpFilterStatus] = useState("ทั้งหมด");
 
//   useEffect(() => {
//     const fetchDevices = async () => {
//       try {
//         setLoading(true);
//         const mapped = await loadDevicesService();
//         if (mapped.length > 0) {
//           setSensorDevices(mapped);
//         } else {
//           setLoading(false);
//         }
//       } catch (err) {
//         console.error("Load error:", err);
//         setLoading(false);
//       }
//     };
//     fetchDevices();
//   }, []);
 
//   useEffect(() => {
//     if (sensorDevices.length === 0) return;
//     const deviceIds = sensorDevices.map((d) => d.device_code);
//     createSensorWebSocket({
//       url: "https://smart-paddy.space",
//       deviceIds,
//       onConnected:    () => setIsWsConnected(true),
//       onDisconnected: () => { setIsWsConnected(false); setLoading(false); },
//       onSensorUpdate: (deviceId, data, timestamp) => {
//         setSensorDevices((prev) =>
//           prev.map((dev) =>
//             dev.device_code === deviceId
//               ? { ...dev, sensor: data, lastUpdate: timestamp, status: "connected" }
//               : dev
//           )
//         );
//         setLoading(false);
//       },
//       onStatusUpdate: (deviceId, status, reason, timestamp) => {
//         setSensorDevices((prev) =>
//           prev.map((dev) =>
//             dev.device_code === deviceId
//               ? { 
//                   ...dev, 
//                   status: status === "online" ? "connected" : "disconnected",
//                   statusReason: reason,
//                   statusTimestamp: timestamp
//                 }
//               : dev
//           )
//         );
//         setLoading(false);
//       },
//       onError: () => { setIsWsConnected(false); setLoading(false); },
//     });
//     return () => closeSensorWebSocket();
//   }, [sensorDevices.length]);
 
//   const filteredDevices = useMemo(() => {
//     return sensorDevices.filter((device) => {
//       const term = searchTerm.toLowerCase();
//       const matchesSearch =
//         (device.device_code || "").toLowerCase().includes(term) ||
//         (device.farm?.name || "").toLowerCase().includes(term);
//       let matchesStatus = true;
//       if (filterStatus === "เชื่อมต่อแล้ว")   matchesStatus = device.status === "connected";
//       else if (filterStatus === "ขาดการเชื่อมต่อ") matchesStatus = device.status === "disconnected";
//       return matchesSearch && matchesStatus;
//     });
//   }, [sensorDevices, searchTerm, filterStatus]);

//   const allPumps = useMemo(() => {
//     return sensorDevices.flatMap(device => 
//       (device.pumps || []).map(pump => ({
//         ...pump,
//         device_code: device.device_code,
//         device_farm: device.farm?.name,
//         device_status: device.status
//       }))
//     );
//   }, [sensorDevices]);

//   const filteredPumps = useMemo(() => {
//     return allPumps.filter((pump) => {
//       const term = pumpSearchTerm.toLowerCase();
//       const matchesSearch =
//         (pump.name || "").toLowerCase().includes(term) ||
//         (pump.device_code || "").toLowerCase().includes(term);
//       let matchesStatus = true;
//       if (pumpFilterStatus === "ON")  matchesStatus = pump.status === "ON";
//       else if (pumpFilterStatus === "OFF") matchesStatus = pump.status === "OFF";
//       return matchesSearch && matchesStatus;
//     });
//   }, [allPumps, pumpSearchTerm, pumpFilterStatus]);
 
//   const selected = sensorDevices.find((d) => d.device_code === selectedDevice);
 
//   const handleRowClick = (code) => {
//     setSelectedDevice(code);
//     setModalOpen(true);
//   };
 
//   const handleDelete = async (code) => {
//     await deleteDeviceByCode({
//       deviceCode: code,
//       onSuccess: () => {
//         setSensorDevices((prev) => prev.filter((d) => d.device_code !== code));
//         setSelectedDevice(null);
//         setModalOpen(false);
//       },
//     });
//   };
 
//   const connectedCount    = sensorDevices.filter((d) => d.status === "connected" || d.status === "online").length;
//   const disconnectedCount = sensorDevices.filter((d) => d.status === "disconnected" || d.status === "offline").length;
 
//   return (
//     <div className={`min-h-screen bg-[#f5f5f5] flex flex-col text-gray-900 ${kanit.className}`}>
//       <Header />
 
//       <main className="flex-grow container mx-auto px-4 pt-6 pb-12 max-w-7xl">
//         <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
//           <span>หน้าหลัก</span>
//           <ChevronRight className="w-3 h-3" />
//           <span className="text-gray-700 font-medium">อุปกรณ์</span>
//         </div>
//         <h1 className="text-2xl font-semibold text-gray-900 mb-1">อุปกรณ์ <span className="text-gray-400 font-normal">| อุปกรณ์ทั้งหมด</span></h1>
 
//         <div className="flex flex-wrap gap-4 my-5">
//           {[
//             { label: "อุปกรณ์ทั้งหมด",     value: sensorDevices.length,  color: "text-blue-600",    bg: "bg-blue-50 border-blue-200" },
//             { label: "เชื่อมต่อแล้ว",       value: connectedCount,        color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
//             { label: "ขาดการเชื่อมต่อ",     value: disconnectedCount,     color: "text-gray-500",    bg: "bg-gray-50 border-gray-200" },
//             { label: "ปั๊มน้ำ",            value: allPumps.length,       color: "text-purple-600",  bg: "bg-purple-50 border-purple-200" },
//           ].map((s) => (
//             <div key={s.label} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border bg-white shadow-sm ${s.bg}`}>
//               <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
//               <span className="text-xs text-gray-500 leading-tight max-w-[70px]">{s.label}</span>
//             </div>
//           ))}
//           <div className="ml-auto flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm self-center">
//             <span className={`w-2 h-2 rounded-full animate-pulse ${isWsConnected ? "bg-emerald-500" : "bg-red-400"}`} />
//             <span className="text-xs text-gray-600 font-medium">{isWsConnected ? "Real-time เชื่อมต่อ" : "กำลังเชื่อมต่อ..."}</span>
//           </div>
//         </div>

//         <div className="flex gap-2 mb-5 border-b border-gray-200">
//           <button
//             onClick={() => setViewMode("devices")}
//             className={`px-4 py-2.5 font-medium text-sm transition border-b-2 ${
//               viewMode === "devices"
//                 ? "text-blue-600 border-b-blue-600"
//                 : "text-gray-500 border-b-transparent hover:text-gray-700"
//             }`}
//           >
//             <Cpu className="inline mr-2 w-4 h-4" />อุปกรณ์ IoT ({sensorDevices.length})
//           </button>
//           <button
//             onClick={() => setViewMode("pumps")}
//             className={`px-4 py-2.5 font-medium text-sm transition border-b-2 ${
//               viewMode === "pumps"
//                 ? "text-purple-600 border-b-purple-600"
//                 : "text-gray-500 border-b-transparent hover:text-gray-700"
//             }`}
//           >
//             <Activity className="inline mr-2 w-4 h-4" />ปั๊มน้ำ ({allPumps.length})
//           </button>
//         </div>
 
//         <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
//           <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-gray-100">
//             <div className="relative flex-1 min-w-[200px]">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
//               <input
//                 type="text"
//                 placeholder={viewMode === "devices" ? "ค้นหาด้วยรหัส หรือชื่อฟาร์ม..." : "ค้นหาด้วยชื่อปั๊ม หรือรหัสอุปกรณ์..."}
//                 className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
//                 value={viewMode === "devices" ? searchTerm : pumpSearchTerm}
//                 onChange={(e) => viewMode === "devices" ? setSearchTerm(e.target.value) : setPumpSearchTerm(e.target.value)}
//               />
//             </div>
//             <select
//               className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white outline-none focus:border-blue-400 cursor-pointer"
//               value={viewMode === "devices" ? filterStatus : pumpFilterStatus}
//               onChange={(e) => viewMode === "devices" ? setFilterStatus(e.target.value) : setPumpFilterStatus(e.target.value)}
//             >
//               {viewMode === "devices" ? (
//                 <>
//                   <option>สถานะทั้งหมด</option>
//                   <option>เชื่อมต่อแล้ว</option>
//                   <option>ขาดการเชื่อมต่อ</option>
//                 </>
//               ) : (
//                 <>
//                   <option>ทั้งหมด</option>
//                   <option>ON</option>
//                   <option>OFF</option>
//                 </>
//               )}
//             </select>
//             <div className="flex gap-2 ml-auto">
//               <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
//                 <RefreshCw className="w-4 h-4" /> รีเฟรช
//               </button>
//               <Link
//                 href="/Paddy/agriculture/registerdevice"
//                 className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
//               >
//                 <Plus className="w-4 h-4" /> เพิ่มอุปกรณ์
//               </Link>
//             </div>
//           </div>
//           <div className="px-5 py-2 text-xs text-gray-500 border-b border-gray-100">
//             {viewMode === "devices" ? `พบ ${filteredDevices.length} อุปกรณ์` : `พบ ${filteredPumps.length} ปั๊มน้ำ`}
//           </div>

//           {loading ? (
//             <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
//               <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
//               <span className="text-sm">{isWsConnected ? "โหลดข้อมูล..." : "กำลังเชื่อมต่อระบบ Real-time..."}</span>
//             </div>
//           ) : viewMode === "devices" ? (
//             filteredDevices.length === 0 ? (
//               <div className="flex flex-col items-center justify-center py-24 text-gray-400">
//                 <Cpu className="w-10 h-10 mb-3 text-gray-300" />
//                 <span className="text-sm">ไม่พบอุปกรณ์ที่ตรงกับเงื่อนไข</span>
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm">
//                   <thead>
//                     <tr className="border-b border-gray-100 bg-gray-50/70">
//                       <th className="w-10 px-4 py-3"><input type="checkbox" className="rounded border-gray-300 cursor-pointer" /></th>
//                       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">รหัสอุปกรณ์ ↕</th>
//                       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">สถานะ</th>
//                       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">ฟาร์ม / พื้นที่</th>
//                       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">อัปเดตล่าสุด</th>
//                       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">ประเภท</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-50">
//                     {filteredDevices.map((d) => (
//                       <tr key={d.device_code} onClick={() => handleRowClick(d.device_code)} 
//                         className={`cursor-pointer transition-colors hover:bg-blue-50/40 ${selectedDevice === d.device_code && modalOpen ? "bg-blue-50 border-l-2 border-l-blue-500" : ""}`}>
//                         <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="rounded border-gray-300 cursor-pointer" /></td>
//                         <td className="px-4 py-3">
//                           <div className="flex items-center gap-2">
//                             <div className="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
//                               <Cpu className="w-3.5 h-3.5 text-blue-600" />
//                             </div>
//                             <span className="font-medium text-blue-600 hover:underline">{d.device_code}</span>
//                           </div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="flex items-center gap-1.5">
//                             {getStatusIcon(d.status)}
//                             <span className={`text-xs font-medium ${(d.status === "connected" || d.status === "online") ? "text-emerald-700" : "text-gray-500"}`}>
//                               {(d.status === "connected" || d.status === "online") ? "เชื่อมต่อแล้ว" : "ขาดการเชื่อมต่อ"}
//                             </span>
//                           </div>
//                         </td>
//                         <td className="px-4 py-3 text-gray-600">
//                           <div>{d.farm?.name || "-"}</div>
//                           {d.farm?.location && <div className="text-xs text-gray-400">{d.farm.location}</div>}
//                         </td>
//                         <td className="px-4 py-3 text-gray-500 text-xs">{d.lastUpdate || "-"}</td>
//                         <td className="px-4 py-3"><span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">เซ็นเซอร์</span></td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )
//           ) : filteredPumps.length === 0 ? (
//             <div className="flex flex-col items-center justify-center py-24 text-gray-400">
//               <Activity className="w-10 h-10 mb-3 text-gray-300" />
//               <span className="text-sm">ไม่พบปั๊มน้ำที่ตรงกับเงื่อนไข</span>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="border-b border-gray-100 bg-gray-50/70">
//                     <th className="w-10 px-4 py-3"><input type="checkbox" className="rounded border-gray-300 cursor-pointer" /></th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">ชื่อปั๊ม</th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">สถานะ</th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">MAC Address</th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">อุปกรณ์</th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">ฟาร์ม</th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">วันที่สร้าง</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-50">
//                   {filteredPumps.map((pump, idx) => (
//                     <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
//                       <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300 cursor-pointer" /></td>
//                       <td className="px-4 py-3">
//                         <div className="flex items-center gap-2">
//                           <div className="w-7 h-7 rounded-md bg-purple-100 flex items-center justify-center flex-shrink-0">
//                             <Droplets className="w-3.5 h-3.5 text-purple-600" />
//                           </div>
//                           <span className="font-medium text-gray-700">{pump.name}</span>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
//                           pump.status === "ON" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
//                         }`}>{pump.status}</span>
//                       </td>
//                       <td className="px-4 py-3 text-gray-500 text-xs font-mono">{pump.mac || "-"}</td>
//                       <td className="px-4 py-3"><span className="text-blue-600 font-medium text-sm">{pump.device_code}</span></td>
//                       <td className="px-4 py-3 text-gray-600 text-sm">{pump.device_farm || "-"}</td>
//                       <td className="px-4 py-3 text-gray-500 text-xs">
//                         {pump.created_at ? new Date(pump.created_at).toLocaleDateString('th-TH') : "-"}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </main>
 
//       {modalOpen && selected && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center p-4"
//           style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
//           onClick={() => setModalOpen(false)}
//         >
//           <div
//             className={`bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden ${kanit.className}`}
//             onClick={(e) => e.stopPropagation()}
//             style={{ animation: "modalIn 0.2s ease" }}
//           >
//             <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(8px) } to { opacity:1; transform:scale(1) translateY(0) } }`}</style>
//             <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
//               <div className="flex items-center gap-3">
//                 <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
//                   <ScanQrCode className="w-5 h-5 text-white" />
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-900 text-base tracking-wide">{selected.device_code}</p>
//                   <p className="text-xs text-gray-400 font-light">รหัสอุปกรณ์</p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-3">
//                 {getStatusBadge(selected.status || "disconnected")}
//                 <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>
//             <div className="px-6 py-5 space-y-5">
//               {selected.statusReason && (
//                 <div className={`p-4 rounded-xl border-l-4 text-sm ${
//                   selected.status === "connected" ? "bg-emerald-50 border-l-emerald-500" : "bg-amber-50 border-l-amber-500"
//                 }`}>
//                   <p className="font-medium text-gray-800 mb-1">
//                     {selected.status === "connected" ? "🟢" : "🔴"} {selected.status === "connected" ? "เชื่อมต่อแล้ว" : "ขาดการเชื่อมต่อ"}
//                   </p>
//                   <p className="text-xs text-gray-600">{selected.statusReason}</p>
//                   {selected.statusTimestamp && (
//                     <p className="text-xs text-gray-500 mt-1">อัปเดตล่าสุด: {new Date(selected.statusTimestamp).toLocaleString('th-TH')}</p>
//                   )}
//                 </div>
//               )}
//               <div className="grid grid-cols-2 gap-4">
//                 <InfoCard icon={<Sprout className="w-4 h-4 text-emerald-500" />} label="ฟาร์ม" value={selected.farm?.name || "-"} />
//                 <InfoCard icon={<MapPin className="w-4 h-4 text-blue-400" />} label="พื้นที่" value={selected.farm?.location || "-"} />
//                 <InfoCard icon={<Clock className="w-4 h-4 text-gray-400" />} label="อัปเดตล่าสุด" value={selected.lastUpdate || "-"} />
//                 <InfoCard icon={<Signal className="w-4 h-4 text-indigo-400" />} label="ประเภท" value="เซ็นเซอร์ IoT" />
//               </div>
//               {selected.pumps && selected.pumps.length > 0 && (
//                 <div className="space-y-3">
//                   <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">ปั๊มน้ำ ({selected.pumps.length})</p>
//                   <div className="space-y-2">
//                     {selected.pumps.map((pump, idx) => (
//                       <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
//                         <div className="flex items-center justify-between mb-2">
//                           <p className="text-sm font-medium text-gray-800">{pump.name}</p>
//                           <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
//                             pump.status === "ON" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
//                           }`}>{pump.status}</span>
//                         </div>
//                         <p className="text-xs text-gray-500">MAC: {pump.mac || "-"}</p>
//                         {pump.created_at && (
//                           <p className="text-xs text-gray-400 mt-1">สร้างเมื่อ: {new Date(pump.created_at).toLocaleString('th-TH')}</p>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//               {selected.description && (
//                 <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
//                   <p className="text-xs text-gray-400 font-medium mb-1">คำอธิบาย</p>
//                   <p className="text-sm text-gray-700 leading-relaxed font-light">{selected.description}</p>
//                 </div>
//               )}
//             </div>
//             <div className="px-6 pb-6 space-y-2">
//               <Link
//                 href={`/Paddy/agriculture/sensor/${selected.device_code}`}
//                 className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm"
//               >
//                 ดูข้อมูลเซ็นเซอร์
//               </Link>
//               <div className="flex gap-2">
//                 <Link
//                   href="/Paddy/agriculture/DeviceTransfer"
//                   className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
//                 >
//                   <ArrowLeftRight className="w-4 h-4" /> ย้ายอุปกรณ์
//                 </Link>
//                 <button
//                   onClick={() => handleDelete(selected.device_code)}
//                   className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 text-red-500 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 transition"
//                 >
//                   <Trash2 className="w-4 h-4" /> ยกเลิกการลงทะเบียน
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
 
//       <Footer />
//     </div>
//   );
// }
 
// function InfoCard({ icon, label, value }) {
//   return (
//     <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
//       <div className="mt-0.5 flex-shrink-0">{icon}</div>
//       <div>
//         <p className="text-xs text-gray-400 mb-0.5 font-light">{label}</p>
//         <p className="text-sm font-medium text-gray-800">{value}</p>
//       </div>
//     </div>
//   );
// }
 
      

"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Droplets, Activity, CheckCircle, XCircle, AlertCircle,
  Sprout, Search, Plus, Trash2, MapPin, Clock, Loader2,
  ScanQrCode, ArrowLeftRight, RefreshCw, ChevronRight,
  X, Cpu, Signal, Sun, Zap,
} from "lucide-react";
import { Kanit } from "next/font/google";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "@/app/components/Footer";
import { closeSensorWebSocket } from "@/lib/devices/sensorWebSocket";
import { loadDevicesService } from "@/lib/devices/loadDevices";
import { deleteDeviceByCode } from "@/lib/devices/deleteDevice";
import { createSensorWebSocket } from "@/lib/devices/sensorWebSocket";

const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// ─── Status helpers ────────────────────────────────────────────────────────────
const isOnline = (status) => status === "connected" || status === "online";

const StatusBadge = ({ status }) => {
  const on = isOnline(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        on
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-gray-100 text-gray-500 border border-gray-200"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${on ? "bg-emerald-500" : "bg-gray-400"}`}
      />
      {on ? "เชื่อมต่อแล้ว" : "ขาดการเชื่อมต่อ"}
    </span>
  );
};

// ─── Device Card ───────────────────────────────────────────────────────────────
function DeviceCard({ device, selected, onClick }) {
  const on = isOnline(device.status);

  return (
    <div
      onClick={() => onClick(device.device_code)}
      className={`bg-white rounded-2xl border cursor-pointer transition-all duration-200 overflow-hidden
        ${selected
          ? "border-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.14)]"
          : "border-gray-200 hover:border-emerald-300 hover:shadow-[0_4px_16px_rgba(16,185,129,0.10)] hover:-translate-y-0.5"
        }`}
    >
      {/* Card Top */}
      <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{device.device_code}</p>
            <p className="text-xs text-gray-400 mt-0.5">เซ็นเซอร์ IoT</p>
          </div>
        </div>
        <span
          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            on ? "bg-emerald-500 shadow-[0_0_0_3px_rgba(5,150,105,0.15)]" : "bg-gray-300"
          }`}
        />
      </div>

      {/* Card Body */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Sprout className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">{device.farm?.name || "-"}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">{device.farm?.location || "-"}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">{device.lastUpdate || "-"}</span>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
        <StatusBadge status={device.status} />
        <span className="text-xs text-gray-400">เซ็นเซอร์ IoT</span>
      </div>
    </div>
  );
}

// ─── Pump Card ─────────────────────────────────────────────────────────────────
function PumpCard({ pump }) {
  const on = pump.status === "ON";
  const online = isOnline(pump.device_status);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 transition-all duration-200 overflow-hidden hover:border-emerald-300 hover:shadow-[0_4px_16px_rgba(16,185,129,0.10)] hover:-translate-y-0.5">
      {/* Card Top */}
      <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <Droplets className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">{pump.name || "-"}</p>
            <p className="text-xs text-gray-400 mt-0.5">ปั๊มน้ำ</p>
          </div>
        </div>
        <span
          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            on ? "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]" : "bg-gray-300"
          }`}
        />
      </div>

      {/* Card Body */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Cpu className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">{pump.device_code || "-"}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Sprout className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">{pump.device_farm || "-"}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
          <Signal className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">{pump.mac || "-"}</span>
        </div>
        {pump.created_at && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{new Date(pump.created_at).toLocaleDateString("th-TH")}</span>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            on
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-gray-100 text-gray-500 border border-gray-200"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${on ? "bg-emerald-500" : "bg-gray-400"}`} />
          {on ? "เปิดปั๊ม" : "ปิดปั๊ม"}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            online
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-gray-100 text-gray-500 border border-gray-200"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${online ? "bg-emerald-500" : "bg-gray-400"}`} />
          {online ? "ออนไลน์" : "ออฟไลน์"}
        </span>
      </div>
    </div>
  );
}

// ─── Info Card (modal) ─────────────────────────────────────────────────────────
function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
      <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">{label}</p>
      <div className="flex items-center gap-1.5">
        {icon}
        <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DeviceListPage() {
  const [sensorDevices, setSensorDevices] = useState([]);
  const [externalPumps, setExternalPumps] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("devices");
  const [pumpSearchTerm, setPumpSearchTerm] = useState("");

  // Load devices
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        const mapped = await loadDevicesService();
        const devices = Array.isArray(mapped) ? mapped : mapped?.devices || [];
        const pumps = Array.isArray(mapped?.pumps) ? mapped.pumps : [];

        setSensorDevices(devices);
        setExternalPumps(pumps);
        setLoading(false);
      } catch (err) {
        console.error("Load error:", err);
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

  // WebSocket
  useEffect(() => {
    if (sensorDevices.length === 0) return;
    const deviceIds = sensorDevices.map((d) => d.device_code);
    createSensorWebSocket({
      url: "https://smart-paddy.space",
      deviceIds,
      onConnected: () => setIsWsConnected(true),
      onDisconnected: () => { setIsWsConnected(false); setLoading(false); },
      onSensorUpdate: (deviceId, data, timestamp) => {
        setSensorDevices((prev) =>
          prev.map((dev) =>
            dev.device_code === deviceId
              ? { ...dev, sensor: data, lastUpdate: timestamp, status: "connected" }
              : dev
          )
        );
        setLoading(false);
      },
      onStatusUpdate: (deviceId, status, reason, timestamp) => {
        const normalizedIncoming = String(deviceId || "").trim().toUpperCase();
        setSensorDevices((prev) =>
          prev.map((dev) =>
            String(dev.device_code || "").trim().toUpperCase() === normalizedIncoming
              ? {
                  ...dev,
                  status: status === "online" ? "connected" : "disconnected",
                  statusReason: reason,
                  statusTimestamp: timestamp,
                }
              : dev
          )
        );
        setLoading(false);
      },
      onError: () => { setIsWsConnected(false); setLoading(false); },
    });
    return () => closeSensorWebSocket();
  }, [sensorDevices.length]);

  // Derived
  const allPumps = useMemo(() => {
    const fromDevices = sensorDevices.flatMap((device) =>
      (device.pumps || []).map((pump) => ({
        ...pump,
        device_code: device.device_code,
        device_farm: device.farm?.name,
        device_status: device.status,
      }))
    );

    const fromTopLevel = externalPumps.map((pump) => {
      const owner = sensorDevices.find((d) => d.device_code === pump.device_code);
      return {
        ...pump,
        device_code: pump.device_code || owner?.device_code || "-",
        device_farm: owner?.farm?.name || "-",
        device_status: owner?.status || "disconnected",
      };
    });

    const merged = [...fromDevices, ...fromTopLevel];
    const seen = new Set();

    return merged.filter((pump) => {
      const key = `${pump.pump_id || "no-id"}|${pump.mac || "no-mac"}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [sensorDevices, externalPumps]);

  const filteredDevices = useMemo(() => {
    return sensorDevices.filter((device) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        (device.device_code || "").toLowerCase().includes(term) ||
        (device.farm?.name || "").toLowerCase().includes(term) ||
        (device.farm?.location || "").toLowerCase().includes(term);
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "connected" && isOnline(device.status)) ||
        (filterStatus === "disconnected" && !isOnline(device.status));
      return matchesSearch && matchesStatus;
    });
  }, [sensorDevices, searchTerm, filterStatus]);

  const filteredPumps = useMemo(() => {
    const term = pumpSearchTerm.toLowerCase();
    return allPumps.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(term) ||
        (p.device_code || "").toLowerCase().includes(term) ||
        (p.device_farm || "").toLowerCase().includes(term)
    );
  }, [allPumps, pumpSearchTerm]);

  const selected = sensorDevices.find((d) => d.device_code === selectedDevice);
  const connectedCount = sensorDevices.filter((d) => isOnline(d.status)).length;
  const disconnectedCount = sensorDevices.length - connectedCount;

  const handleRowClick = (code) => {
    setSelectedDevice(code);
    setModalOpen(true);
  };

  const handleDelete = async (code) => {
    await deleteDeviceByCode({
      deviceCode: code,
      onSuccess: () => {
        setSensorDevices((prev) => prev.filter((d) => d.device_code !== code));
        setSelectedDevice(null);
        setModalOpen(false);
      },
    });
  };

  // Stat cards config
  const stats = [
    {
      label: "อุปกรณ์ทั้งหมด",
      value: sensorDevices.length,
      color: "text-emerald-700",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      Icon: Cpu,
    },
    {
      label: "เชื่อมต่อแล้ว",
      value: connectedCount,
      color: "text-emerald-500",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      Icon: CheckCircle,
    },
    {
      label: "ขาดการเชื่อมต่อ",
      value: disconnectedCount,
      color: "text-rose-400",
      iconBg: "bg-rose-50",
      iconColor: "text-rose-400",
      Icon: XCircle,
    },
    {
      label: "ปั๊มน้ำ",
      value: allPumps.length,
      color: "text-green-700",
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      Icon: Droplets,
    },
  ];

  return (
    <div className={`min-h-screen bg-[#F8F9FB] flex flex-col text-gray-900 ${kanit.className}`}>
      <Header />

      <main className="flex-grow container mx-auto px-4 pt-6 pb-16 max-w-7xl">
        {/* Breadcrumb + Title */}
      
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            ข้อมูลอุปกรณ์ IoT 
          </h1>
          {/* Realtime indicator */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${
              isWsConnected
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-gray-100 border-gray-200 text-gray-500"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isWsConnected ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
              }`}
            />
            {isWsConnected ? "Real-time เชื่อมต่อ" : "กำลังเชื่อมต่อ..."}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-3">
                <p className="text-[11px] font-black text-slate-400 tracking-widest">
                  {s.label}
                </p>
                <div className={`p-2.5 rounded-xl ${s.iconBg} ${s.iconColor}`}>
                  <s.Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-black leading-none ${s.color}`}>{s.value}</span>
                <span className="text-xs text-slate-400 font-bold">รายการ</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-gray-200 mb-6">
          {[
            { key: "devices", label: "อุปกรณ์ IoT", count: sensorDevices.length, Icon: Cpu },
            { key: "pumps", label: "ปั๊มน้ำ", count: allPumps.length, Icon: Activity },
          ].map(({ key, label, count, Icon }) => (
            <button
              key={key}
              onClick={() => setViewMode(key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                viewMode === key
                  ? key === "devices"
                    ? "text-emerald-700 border-emerald-700"
                    : "text-green-700 border-green-700"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              <span
                className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-semibold ${
                  viewMode === key
                    ? key === "devices"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={
                viewMode === "devices"
                  ? "ค้นหารหัสอุปกรณ์ หรือชื่อฟาร์ม..."
                  : "ค้นหาปั๊มน้ำ หรือรหัสอุปกรณ์..."
              }
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white transition font-[inherit]"
              value={viewMode === "devices" ? searchTerm : pumpSearchTerm}
              onChange={(e) =>
                viewMode === "devices"
                  ? setSearchTerm(e.target.value)
                  : setPumpSearchTerm(e.target.value)
              }
            />
          </div>

          {/* Status filter — devices only */}
          {viewMode === "devices" && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">ทั้งหมด</option>
              <option value="connected">เชื่อมต่อแล้ว</option>
              <option value="disconnected">ขาดการเชื่อมต่อ</option>
            </select>
          )}

          <div className="flex gap-2 ml-auto">
            <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 bg-white transition">
              <RefreshCw className="w-4 h-4" /> รีเฟรช
            </button>
            <Link
              href="/Paddy/agriculture/registerdevice"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition shadow-sm"
            >
              <Plus className="w-4 h-4" /> เพิ่มอุปกรณ์
            </Link>
          </div>
        </div>

        {/* Result count */}
        <p className="text-xs text-gray-400 mb-4">
          {viewMode === "devices"
            ? `พบ ${filteredDevices.length} อุปกรณ์`
            : `พบ ${filteredPumps.length} ปั๊มน้ำ`}
        </p>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <span className="text-sm">
              {isWsConnected ? "โหลดข้อมูล..." : "กำลังเชื่อมต่อระบบ Real-time..."}
            </span>
          </div>
        ) : viewMode === "devices" ? (
          filteredDevices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400 gap-3">
              <Cpu className="w-12 h-12 text-gray-200" />
              <span className="text-sm">ไม่พบอุปกรณ์ที่ตรงกับเงื่อนไข</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredDevices.map((d) => (
                <DeviceCard
                  key={d.device_code}
                  device={d}
                  selected={selectedDevice === d.device_code && modalOpen}
                  onClick={handleRowClick}
                />
              ))}
            </div>
          )
        ) : filteredPumps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400 gap-3">
            <Droplets className="w-12 h-12 text-gray-200" />
            <span className="text-sm">ไม่พบปั๊มน้ำที่ตรงกับเงื่อนไข</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredPumps.map((pump, idx) => (
              <PumpCard key={idx} pump={pump} />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {modalOpen && selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}
          onClick={() => setModalOpen(false)}
        >
          <div
            className={`bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden ${kanit.className}`}
            style={{ animation: "modalIn 0.2s ease" }}
            onClick={(e) => e.stopPropagation()}
          >
            <style>{`
              @keyframes modalIn {
                from { opacity:0; transform:scale(0.96) translateY(10px) }
                to   { opacity:1; transform:scale(1) translateY(0) }
              }
            `}</style>

            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow">
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selected.device_code}</p>
                  <p className="text-xs text-gray-400">รหัสอุปกรณ์</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selected.status || "disconnected"} />
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-5 py-4 space-y-4">
              {/* Status reason */}
              {selected.statusReason && (
                <div
                  className={`p-3.5 rounded-xl border-l-4 text-sm ${
                    isOnline(selected.status)
                      ? "bg-emerald-50 border-l-emerald-500"
                      : "bg-amber-50 border-l-amber-400"
                  }`}
                >
                  <p className="font-medium text-gray-800 mb-1 text-xs">
                    {isOnline(selected.status) ? "🟢 เชื่อมต่อแล้ว" : "🔴 ขาดการเชื่อมต่อ"}
                  </p>
                  <p className="text-xs text-gray-600">{selected.statusReason}</p>
                  {selected.statusTimestamp && (
                    <p className="text-xs text-gray-400 mt-1">
                      อัปเดตล่าสุด: {new Date(selected.statusTimestamp).toLocaleString("th-TH")}
                    </p>
                  )}
                </div>
              )}

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <InfoCard
                  icon={<Sprout className="w-3.5 h-3.5 text-emerald-500" />}
                  label="ฟาร์ม"
                  value={selected.farm?.name || "-"}
                />
                <InfoCard
                  icon={<MapPin className="w-3.5 h-3.5 text-emerald-500" />}
                  label="พื้นที่"
                  value={selected.farm?.location || "-"}
                />
                <InfoCard
                  icon={<Clock className="w-3.5 h-3.5 text-gray-400" />}
                  label="อัปเดตล่าสุด"
                  value={selected.lastUpdate || "-"}
                />
                <InfoCard
                  icon={<Signal className="w-3.5 h-3.5 text-emerald-600" />}
                  label="ประเภท"
                  value="อุปกรณ์ IoT"
                />
              </div>

              {/* Description */}
              {selected.description && (
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-400 font-medium mb-1">คำอธิบาย</p>
                  <p className="text-sm text-gray-700 leading-relaxed font-light">
                    {selected.description}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 pb-5 space-y-2">
              <Link
                href={`/Paddy/agriculture/sensor/${selected.device_code}`}
                className="flex items-center justify-center w-full bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition"
              >
                ดูข้อมูลเซ็นเซอร์
              </Link>
              <div className="flex gap-2">
                <Link
                  href="/Paddy/agriculture/DeviceTransfer"
                  className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                >
                  <ArrowLeftRight className="w-4 h-4" /> ย้ายอุปกรณ์
                </Link>
                <button
                  onClick={() => handleDelete(selected.device_code)}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 text-red-500 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 transition"
                >
                  <Trash2 className="w-4 h-4" /> ยกเลิกการลงทะเบียน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}