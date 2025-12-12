// "use client";

// import { useState, useEffect, useMemo } from "react";
// import {
//   Settings,
//   Save,
//   CheckCircle2,
//   Database,
//   Camera,
//   Clock,
//   Calendar,
//   Timer,
//   ArrowRight,
//   History,
//   PlayCircle,
//   MapPin,
//   Cpu,
// } from "lucide-react";

// import Header from "../../components/Header";
// import loadData from "@/lib/settings/GrowthAnalysisSettings/loadData";
// import GrowthSettings from "@/lib/settings/GrowthAnalysisSettings/GrowthSettings";
// import Footer from "@/app/components/Footer";

// export default function GrowthAnalysisSettings() {
//   const [isLoading, setIsLoading] = useState(false);
//   const [isPageLoading, setIsPageLoading] = useState(true);
//   const [successMessage, setSuccessMessage] = useState("");
//   const [nextCaptureTime, setNextCaptureTime] = useState(null);
//   const [currentTime, setCurrentTime] = useState(new Date());

//   const [devices, setDevices] = useState([]);

//   const [selectedFarm, setSelectedFarm] = useState("");
//   const [selectedRegID, setSelectedRegID] = useState("");

//   const [config, setConfig] = useState({
//     imageCaptureIntervalHours: "72",
//     waterMin: 0,
//     waterMax: 0,
//   });

//   // --- Derived Data for Dropdowns ---
//   const uniqueFarms = useMemo(() => {
//     return [...new Set(devices.map((d) => d.farm_name))];
//   }, [devices]);

//   const filteredAreas = useMemo(() => {
//     return devices.filter((d) => d.farm_name === selectedFarm);
//   }, [devices, selectedFarm]);

//   const currentDevice = useMemo(() => {
//     return devices.find((d) => d.device_registrations_ID == selectedRegID);
//   }, [devices, selectedRegID]);

//   // --- Effects ---

//   // 1. Initial Load
//   useEffect(() => {
//     loadData(setDevices, setSelectedFarm, setSelectedRegID, setIsPageLoading);
//   }, []);

//   // 2. Clock Timer
//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 60000);
//     return () => clearInterval(timer);
//   }, []);

//   // 3. Reset Area selection when Farm changes
//   useEffect(() => {
//     if (selectedFarm) {
//       const firstDeviceInFarm = devices.find(
//         (d) => d.farm_name === selectedFarm
//       );
//       if (firstDeviceInFarm) {
//         setSelectedRegID(firstDeviceInFarm.device_registrations_ID);
//       }
//     }
//   }, [selectedFarm, devices]);

//   // 4. Sync Config State when Device Changes
//   useEffect(() => {
//     if (currentDevice && currentDevice.setting) {
//       // API now provides Hours (e.g., "72", "168") which matches UI values directly
//       setConfig({
//         imageCaptureIntervalHours: String(
//           currentDevice.setting.data_send_interval_days
//         ),
//         waterMin: currentDevice.setting.Water_level_min,
//         waterMax: currentDevice.setting.Water_level_mxm,
//       });
//     }
//   }, [currentDevice]);

//   // 5. Calculate Next Capture Time
//   useEffect(() => {
//     const intervalHours = parseFloat(config.imageCaptureIntervalHours);
//     if (intervalHours > 0) {
//       const now = new Date();
//       const nextTime = new Date(now.getTime() + intervalHours * 60 * 60 * 1000);
//       setNextCaptureTime(nextTime);
//     } else {
//       setNextCaptureTime(null);
//     }
//   }, [config.imageCaptureIntervalHours, currentTime]);

//   // --- Handlers ---

//   const handleSave = () => {
//     GrowthSettings(
//       config.waterMin,
//       config.waterMax,
//       selectedRegID,

//       setIsLoading,
//       setSuccessMessage,
//       setConfig,
//       config.imageCaptureIntervalHours
//     );
//   };

//   // --- Helper Functions ---
//   const getCurrentDeviceStatus = () => {
//     if (!currentDevice) return "unknown";
//     return currentDevice.status === "active" ? "online" : "offline";
//   };

//   const formatTimeOnly = (date) => {
//     if (!date) return "--:--";
//     return date.toLocaleTimeString("th-TH", {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const getTimeRemainingText = () => {
//     if (config.imageCaptureIntervalHours === "0") return "หยุด";
//     const hours = parseFloat(config.imageCaptureIntervalHours);
//     if (hours >= 24) {
//       const days = Math.floor(hours / 24);
//       return `รอ ${days} วัน`;
//     }
//     return `รอ ${hours} ชม.`;
//   };

//   const StatusIndicator = ({ status }) => {
//     const styles = {
//       online: "bg-emerald-500",
//       offline: "bg-red-500",
//       unknown: "bg-gray-400",
//     };
//     const labels = {
//       online: "Active",
//       offline: "Inactive",
//       unknown: "Unknown",
//     };
//     return (
//       <div className="flex items-center gap-1.5">
//         <div
//           className={`w-2 h-2 rounded-full ${
//             styles[status] || styles.unknown
//           } ${status === "online" ? "animate-pulse" : ""}`}
//         ></div>
//         <span className="text-xs text-gray-500 font-medium">
//           {labels[status] || labels.unknown}
//         </span>
//       </div>
//     );
//   };

//   if (isPageLoading) {
//     return (
//       <>
//         <Header />
//         <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center">
//           <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
//             <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4 shadow-sm"></div>
//             <p className="text-gray-500 text-sm font-medium animate-pulse">
//               กำลังโหลดข้อมูล...
//             </p>
//           </div>
//         </div>
//       </>
//     );
//   }

//   return (
//     <>
//       <Header />
//       <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
//         {/* Page Header */}
//         <div className="max-w-2xl mx-auto mb-6">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//               <Settings className="w-6 h-6 text-emerald-600" />
//               ตั้งค่าการวิเคราะห์การเจริญเติบโต
//             </h1>
//             <p className="text-sm text-gray-500 mt-1">
//               กำหนดค่าความถี่ในการส่งข้อมูลและวิเคราะห์ภาพถ่ายรายแปลง
//             </p>
//           </div>

//           {successMessage && (
//             <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
//               <CheckCircle2 className="w-5 h-5" />
//               {successMessage}
//             </div>
//           )}
//         </div>

//         <div className="max-w-2xl mx-auto">
//           {/* Data Collection Section */}
//           <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
//             <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
//               <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
//                 <Database className="w-5 h-5 text-blue-500" />
//                 การตั้งค่าอุปกรณ์ (Device Configuration)
//               </h2>
//             </div>

//             <div className="p-6 space-y-6">
//               {/* --- Selection Grid --- */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 {/* Select Farm */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     เลือกฟาร์ม (Farm)
//                   </label>
//                   <div className="relative">
//                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
//                       <MapPin className="w-5 h-5" />
//                     </div>
//                     <select
//                       className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white appearance-none"
//                       value={selectedFarm}
//                       onChange={(e) => setSelectedFarm(e.target.value)}
//                     >
//                       {uniqueFarms.map((farm) => (
//                         <option key={farm} value={farm}>
//                           {farm}
//                         </option>
//                       ))}
//                     </select>
//                     <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
//                       <ArrowRight className="w-4 h-4 rotate-90" />
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     เลือกพื้นที่ (Area)
//                   </label>
//                   <div className="relative">
//                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
//                       <Cpu className="w-5 h-5" />
//                     </div>
//                     <select
//                       className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white appearance-none disabled:bg-gray-50 disabled:text-gray-400"
//                       value={selectedRegID}
//                       onChange={(e) => setSelectedRegID(e.target.value)}
//                       disabled={filteredAreas.length === 0}
//                     >
//                       {filteredAreas.map((item) => (
//                         <option
//                           key={item.device_registrations_ID}
//                           value={item.device_registrations_ID}
//                         >
//                           {item.area_name} (ID: {item.device_ID})
//                         </option>
//                       ))}
//                       {filteredAreas.length === 0 && (
//                         <option>ไม่พบพื้นที่</option>
//                       )}
//                     </select>
//                     <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
//                       <StatusIndicator status={getCurrentDeviceStatus()} />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="border-t border-gray-100 my-4"></div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   ความถี่ในการวิเคราะห์การเจริญเติบโต
//                 </label>
//                 <div className="flex items-center gap-3">
//                   <div className="p-2.5 bg-gray-100 rounded-xl">
//                     <Camera className="w-6 h-6 text-gray-500" />
//                   </div>
//                   <div className="relative flex-1">
//                     <select
//                       className="w-full appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-all bg-white"
//                       value={config.imageCaptureIntervalHours}
//                       onChange={(e) =>
//                         setConfig({
//                           ...config,
//                           imageCaptureIntervalHours: e.target.value,
//                         })
//                       }
//                     >
//                       <option value="72">ทุกๆ 3 วัน</option>
//                       <option value="168">ทุกๆ 7 วัน</option>
//                       <option value="240">ทุกๆ 10 วัน</option>
//                       <option value="360">ทุกๆ 15 วัน</option>
//                       <option value="480">ทุกๆ 20 วัน</option>
//                       <option value="600">ทุกๆ 25 วัน</option>
//                       <option value="0">ปิดการใช้งาน</option>
//                     </select>
//                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
//                       <Clock className="w-4 h-4" />
//                     </div>
//                   </div>
//                 </div>
//                 <p className="text-xs text-red-500 mt-2 ml-14">
//                   * ค่าจากระบบ:{" "}
//                   <span className="font-mono">
//                     {currentDevice?.setting?.data_send_interval_days
//                       ? (
//                           parseFloat(
//                             currentDevice.setting.data_send_interval_days
//                           ) / 24
//                         ).toFixed(0)
//                       : "-"}
//                   </span>{" "}
//                   วัน
//                 </p>
//               </div>

//               {/* --- Schedule Visualization --- */}
//               <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-5 shadow-sm relative overflow-hidden mt-4">
//                 {/* Background Decoration */}
//                 <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -mr-10 -mt-10 opacity-60 pointer-events-none"></div>

//                 <div className="flex items-center justify-between mb-6 relative z-10">
//                   <div className="flex items-center gap-2">
//                     <div className="p-1.5 bg-emerald-100/80 rounded-lg text-emerald-700">
//                       <Timer className="w-4 h-4" />
//                     </div>
//                     <h3 className="text-sm font-bold text-gray-800">
//                       จำลองการทำงานถัดไป
//                     </h3>
//                   </div>
//                   <span
//                     className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
//                       config.imageCaptureIntervalHours !== "0"
//                         ? "bg-emerald-50 text-emerald-700 border-emerald-100"
//                         : "bg-gray-100 text-gray-500 border-gray-200"
//                     }`}
//                   >
//                     {config.imageCaptureIntervalHours !== "0"
//                       ? "Active"
//                       : "Disabled"}
//                   </span>
//                 </div>

//                 {config.imageCaptureIntervalHours !== "0" ? (
//                   <div className="space-y-5 relative z-10">
//                     {/* Timeline Visualization */}
//                     <div className="relative flex items-center justify-between px-2">
//                       {/* Start Point (Now) */}
//                       <div className="flex flex-col items-center group cursor-default">
//                         <div className="w-4 h-4 bg-gray-200 rounded-full border-[3px] border-white shadow-sm z-10 group-hover:scale-110 transition-transform"></div>
//                         <span className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-wide">
//                           ขณะนี้
//                         </span>
//                         <span className="text-sm font-bold text-gray-700 font-mono">
//                           {formatTimeOnly(currentTime)}
//                         </span>
//                       </div>

//                       {/* Connecting Line & Duration Badge */}
//                       <div className="flex-1 mx-3 relative flex flex-col items-center -mt-6">
//                         <div className="w-full h-0.5 bg-gray-200 absolute top-1/2 -translate-y-1/2"></div>

//                         {/* Arrow Head */}
//                         <div className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300">
//                           <ArrowRight className="w-3 h-3" />
//                         </div>

//                         {/* Duration Pill */}
//                         <div className="bg-white px-3 py-1 relative z-10 border border-emerald-100 rounded-full shadow-sm flex items-center gap-1.5 group hover:border-emerald-300 transition-colors cursor-help">
//                           <History className="w-3 h-3 text-emerald-500" />
//                           <span className="text-xs font-semibold text-emerald-700 whitespace-nowrap">
//                             {getTimeRemainingText()}
//                           </span>
//                         </div>
//                       </div>

//                       {/* End Point (Next) */}
//                       <div className="flex flex-col items-center">
//                         <div className="relative z-10">
//                           <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
//                           <div className="w-4 h-4 bg-emerald-500 rounded-full border-[3px] border-white shadow-md relative z-20"></div>
//                         </div>
//                         <span className="text-[10px] text-emerald-600 mt-2 font-medium uppercase tracking-wide">
//                           เริ่มงาน
//                         </span>
//                         <span className="text-sm font-bold text-emerald-700 font-mono">
//                           {formatTimeOnly(nextCaptureTime)}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="text-center py-8 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
//                     <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
//                       <PlayCircle className="w-6 h-6" />
//                     </div>
//                     <p className="text-sm font-medium text-gray-600">
//                       ระบบถูกปิดการใช้งานชั่วคราว
//                     </p>
//                   </div>
//                 )}
//               </div>

//               <div className="flex items-center justify-end gap-3 pt-2">
//                 <button
//                   onClick={handleSave}
//                   disabled={isLoading}
//                   className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
//                 >
//                   {isLoading ? (
//                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                   ) : (
//                     <Save className="w-4 h-4" />
//                   )}
//                   {isLoading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
//                 </button>
//               </div>
//             </div>
//           </section>
      
//         </div>
//         <Footer />
//       </div>
//     </>
//   );
// }

"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Settings,
  Save,
  CheckCircle2,
  Database,
  Camera,
  Clock,
  Calendar,
  Timer,
  ArrowRight,
  History,
  PlayCircle,
  MapPin,
  Cpu,
  Wifi,
} from "lucide-react";

import Header from "../../components/Header";
import loadData from "@/lib/settings/GrowthAnalysisSettings/loadData";
import GrowthSettings from "@/lib/settings/GrowthAnalysisSettings/GrowthSettings";
import Footer from "@/app/components/Footer";

export default function GrowthAnalysisSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [nextCaptureTime, setNextCaptureTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [devices, setDevices] = useState([]);

  const [selectedFarm, setSelectedFarm] = useState("");
  const [selectedRegID, setSelectedRegID] = useState("");

  const [config, setConfig] = useState({
    imageCaptureIntervalHours: "72",
    dataInterval: "24", // Default 24 hours (1 day)
    waterMin: 0,
    waterMax: 0,
  });

  // --- Derived Data for Dropdowns ---
  const uniqueFarms = useMemo(() => {
    return [...new Set(devices.map((d) => d.farm_name))];
  }, [devices]);

  const filteredAreas = useMemo(() => {
    return devices.filter((d) => d.farm_name === selectedFarm);
  }, [devices, selectedFarm]);

  const currentDevice = useMemo(() => {
    return devices.find((d) => d.device_registrations_ID == selectedRegID);
  }, [devices, selectedRegID]);

  // --- Effects ---

  // 1. Initial Load
  useEffect(() => {
    // ในสถานการณ์จริง loadData จะดึงข้อมูล JSON ที่คุณให้มา
    loadData(setDevices, setSelectedFarm, setSelectedRegID, setIsPageLoading);
  }, []);

  // 2. Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 3. Reset Area selection when Farm changes
  useEffect(() => {
    if (selectedFarm) {
      const firstDeviceInFarm = devices.find(
        (d) => d.farm_name === selectedFarm
      );
      if (firstDeviceInFarm) {
        setSelectedRegID(firstDeviceInFarm.device_registrations_ID);
      }
    }
  }, [selectedFarm, devices]);

  // 4. Sync Config State when Device Changes (แก้ไขใหม่ตาม JSON ที่ให้มา)
  useEffect(() => {
    if (currentDevice && currentDevice.setting) {
      
      // แปลง data_send_interval_days (วัน) เป็น ชั่วโมง
      const dataDays = parseFloat(currentDevice.setting.data_send_interval_days || "1");
      const dataHours = dataDays * 24;

      setConfig({
        // Map 'growth_analysis_period' -> Image Analysis (Camera)
        // ค่าใน JSON: 168, 72 (หน่วยชั่วโมงอยู่แล้ว)
        imageCaptureIntervalHours: String(currentDevice.setting.growth_analysis_period || "72"),

        // Map 'data_send_interval_days' -> Data Transmission (Wifi)
        // ค่าใน JSON: "3", "1" (หน่วยวัน -> แปลงเป็นชั่วโมง)
        dataInterval: String(dataHours),

        waterMin: currentDevice.setting.Water_level_min,
        waterMax: currentDevice.setting.Water_level_mxm,
      });
    }
  }, [currentDevice]);

  // 5. Calculate Next Capture Time
  useEffect(() => {
    const intervalHours = parseFloat(config.imageCaptureIntervalHours);
    if (intervalHours > 0) {
      const now = new Date();
      const nextTime = new Date(now.getTime() + intervalHours * 60 * 60 * 1000);
      setNextCaptureTime(nextTime);
    } else {
      setNextCaptureTime(null);
    }
  }, [config.imageCaptureIntervalHours, currentTime]);

  // --- Handlers ---

  const handleSave = () => {
    // เวลาบันทึก อาจต้องแปลง dataInterval (ชั่วโมง) กลับเป็น data_send_interval_days (วัน) ถ้า API ต้องการแบบนั้น
    const dataDaysToSend = (parseFloat(config.dataInterval) / 24).toFixed(2);

    GrowthSettings(
      config.waterMin,
      config.waterMax,
      selectedRegID,

      setIsLoading,
      setSuccessMessage,
      setConfig,
      config.imageCaptureIntervalHours, 
      dataDaysToSend 
    );
  };

  // --- Helper Functions ---
  const getCurrentDeviceStatus = () => {
    if (!currentDevice) return "unknown";
    return currentDevice.status === "active" ? "online" : "offline";
  };

  const formatTimeOnly = (date) => {
    if (!date) return "--:--";
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeRemainingText = () => {
    if (config.imageCaptureIntervalHours === "0") return "หยุด";
    const hours = parseFloat(config.imageCaptureIntervalHours);
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `รอ ${days} วัน`;
    }
    return `รอ ${hours} ชม.`;
  };

  const StatusIndicator = ({ status }) => {
    const styles = {
      online: "bg-emerald-500",
      offline: "bg-red-500",
      unknown: "bg-gray-400",
    };
    const labels = {
      online: "Active",
      offline: "Inactive",
      unknown: "Unknown",
    };
    return (
      <div className="flex items-center gap-1.5">
        <div
          className={`w-2 h-2 rounded-full ${
            styles[status] || styles.unknown
          } ${status === "online" ? "animate-pulse" : ""}`}
        ></div>
        <span className="text-xs text-gray-500 font-medium">
          {labels[status] || labels.unknown}
        </span>
      </div>
    );
  };

  if (isPageLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4 shadow-sm"></div>
            <p className="text-gray-500 text-sm font-medium animate-pulse">
              กำลังโหลดข้อมูล...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
        {/* Page Header */}
        <div className="max-w-2xl mx-auto mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-6 h-6 text-emerald-600" />
              ตั้งค่าการวิเคราะห์การเจริญเติบโต
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              กำหนดค่าความถี่ในการส่งข้อมูลและวิเคราะห์ภาพถ่ายรายแปลง
            </p>
          </div>

          {successMessage && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5" />
              {successMessage}
            </div>
          )}
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Data Collection Section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-500" />
                การตั้งค่าอุปกรณ์ (Device Configuration)
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* --- Selection Grid --- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Select Farm */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เลือกฟาร์ม (Farm)
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <select
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white appearance-none"
                      value={selectedFarm}
                      onChange={(e) => setSelectedFarm(e.target.value)}
                    >
                      {uniqueFarms.map((farm) => (
                        <option key={farm} value={farm}>
                          {farm}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <ArrowRight className="w-4 h-4 rotate-90" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เลือกพื้นที่ (Area)
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <select
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white appearance-none disabled:bg-gray-50 disabled:text-gray-400"
                      value={selectedRegID}
                      onChange={(e) => setSelectedRegID(e.target.value)}
                      disabled={filteredAreas.length === 0}
                    >
                      {filteredAreas.map((item) => (
                        <option
                          key={item.device_registrations_ID}
                          value={item.device_registrations_ID}
                        >
                          {item.area_name} (ID: {item.device_ID})
                        </option>
                      ))}
                      {filteredAreas.length === 0 && (
                        <option>ไม่พบพื้นที่</option>
                      )}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <StatusIndicator status={getCurrentDeviceStatus()} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 my-4"></div>

              {/* --- SECTION 1: Data Transmission Frequency --- */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ความถี่ในการส่งข้อมูล (Data Transmission)
                </label>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 rounded-xl">
                    <Wifi className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="relative flex-1">
                    <select
                      className="w-full appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all bg-white"
                      value={config.dataInterval}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          dataInterval: e.target.value,
                        })
                      }
                    >
                      <option value="0.25">ทุกๆ 15 นาที</option>
                      <option value="0.5">ทุกๆ 30 นาที</option>
                      <option value="1">ทุกๆ 1 ชั่วโมง</option>
                      <option value="2">ทุกๆ 2 ชั่วโมง</option>
                      <option value="4">ทุกๆ 4 ชั่วโมง</option>
                      <option value="6">ทุกๆ 6 ชั่วโมง</option>
                      <option value="12">ทุกๆ 12 ชั่วโมง</option>
                      <option value="24">ทุกๆ 1 วัน</option>
                      {/* เพิ่มตัวเลือกสำหรับข้อมูลที่มีค่า 3 วัน (72 ชม.) */}
                      <option value="72">ทุกๆ 3 วัน</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2 ml-14">
                  * กำหนดความถี่ที่อุปกรณ์จะส่งข้อมูลเซนเซอร์ขึ้นสู่ระบบ
                  {/* แสดงค่าดิบจาก DB เพื่อ Debug */}
                   {" "}(ค่าปัจจุบัน: {currentDevice?.setting?.data_send_interval_days} วัน)
                </p>
              </div>

              <div className="border-t border-gray-100 my-4"></div>

              {/* --- SECTION 2: Image Analysis Frequency --- */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ความถี่ในการวิเคราะห์การเจริญเติบโต (Image Analysis)
                </label>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 rounded-xl">
                    <Camera className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="relative flex-1">
                    <select
                      className="w-full appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-all bg-white"
                      value={config.imageCaptureIntervalHours}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          imageCaptureIntervalHours: e.target.value,
                        })
                      }
                    >
                      <option value="72">ทุกๆ 3 วัน</option>
                      <option value="168">ทุกๆ 7 วัน</option>
                      <option value="240">ทุกๆ 10 วัน</option>
                      <option value="360">ทุกๆ 15 วัน</option>
                      <option value="480">ทุกๆ 20 วัน</option>
                      <option value="600">ทุกๆ 25 วัน</option>
                      <option value="0">ปิดการใช้งาน</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-red-500 mt-2 ml-14">
                  * ค่าจากระบบ:{" "}
                  <span className="font-mono">
                    {currentDevice?.setting?.growth_analysis_period
                      ? (
                          parseFloat(
                            currentDevice.setting.growth_analysis_period
                          ) / 24
                        ).toFixed(0)
                      : "-"}
                  </span>{" "}
                  วัน ({currentDevice?.setting?.growth_analysis_period} ชั่วโมง)
                </p>
              </div>

              {/* --- Schedule Visualization --- */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-5 shadow-sm relative overflow-hidden mt-4">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -mr-10 -mt-10 opacity-60 pointer-events-none"></div>

                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-100/80 rounded-lg text-emerald-700">
                      <Timer className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-800">
                      จำลองการทำงานถัดไป (วิเคราะห์ภาพ)
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                      config.imageCaptureIntervalHours !== "0"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-gray-100 text-gray-500 border-gray-200"
                    }`}
                  >
                    {config.imageCaptureIntervalHours !== "0"
                      ? "Active"
                      : "Disabled"}
                  </span>
                </div>

                {config.imageCaptureIntervalHours !== "0" ? (
                  <div className="space-y-5 relative z-10">
                    {/* Timeline Visualization */}
                    <div className="relative flex items-center justify-between px-2">
                      {/* Start Point (Now) */}
                      <div className="flex flex-col items-center group cursor-default">
                        <div className="w-4 h-4 bg-gray-200 rounded-full border-[3px] border-white shadow-sm z-10 group-hover:scale-110 transition-transform"></div>
                        <span className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-wide">
                          ขณะนี้
                        </span>
                        <span className="text-sm font-bold text-gray-700 font-mono">
                          {formatTimeOnly(currentTime)}
                        </span>
                      </div>

                      {/* Connecting Line & Duration Badge */}
                      <div className="flex-1 mx-3 relative flex flex-col items-center -mt-6">
                        <div className="w-full h-0.5 bg-gray-200 absolute top-1/2 -translate-y-1/2"></div>

                        {/* Arrow Head */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300">
                          <ArrowRight className="w-3 h-3" />
                        </div>

                        {/* Duration Pill */}
                        <div className="bg-white px-3 py-1 relative z-10 border border-emerald-100 rounded-full shadow-sm flex items-center gap-1.5 group hover:border-emerald-300 transition-colors cursor-help">
                          <History className="w-3 h-3 text-emerald-500" />
                          <span className="text-xs font-semibold text-emerald-700 whitespace-nowrap">
                            {getTimeRemainingText()}
                          </span>
                        </div>
                      </div>

                      {/* End Point (Next) */}
                      <div className="flex flex-col items-center">
                        <div className="relative z-10">
                          <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                          <div className="w-4 h-4 bg-emerald-500 rounded-full border-[3px] border-white shadow-md relative z-20"></div>
                        </div>
                        <span className="text-[10px] text-emerald-600 mt-2 font-medium uppercase tracking-wide">
                          เริ่มงาน
                        </span>
                        <span className="text-sm font-bold text-emerald-700 font-mono">
                          {formatTimeOnly(nextCaptureTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                      <PlayCircle className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">
                      ระบบถูกปิดการใช้งานชั่วคราว
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isLoading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </button>
              </div>
            </div>
          </section>
        </div>
        <Footer />
      </div>
    </>
  );
}