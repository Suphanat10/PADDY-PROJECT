"use client";
import React, { useState, useEffect, useMemo } from "react"; // ✅ เพิ่ม React ตรงนี้
import {
  Wifi,
  WifiOff,
  MapPin,
  CloudSun,
  Sun,
  CloudRain,
  Cloud,
  Signal,
  Radio,
  Droplets,
  Wind,
  Thermometer,

  Clock,
  Loader2,
  Server,
  Search,
  Plus,
  Trash2,
  Edit2,
  Save,
  XCircle,
  Waves,
  DropletOff ,
  Zap,
  Sprout
} from "lucide-react";

import { getDashboardData } from "@/lib/dashboard/dashboard"; 
import { useDeviceWebSocket } from "@/lib/dashboard/useDeviceWebSocket";
import Footer from "@/app/components/Footer";

export default function SmartFarmDashboard() {
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [locationName, setLocationName] = useState("ระบุพิกัด...");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [deviceIds, setDeviceIds] = useState([]);  

  const [devices, setDevices] = useState([]);
  const [pumpDevices, setPumpDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    loadDashboard();
    setLastUpdate(new Date());
  }, []);


useDeviceWebSocket({
  deviceIds: devices.map(d => d.device_code),
  
  // เมื่อได้รับข้อมูลเซนเซอร์
  onSensor: (deviceId, sensorData) => {
    setDevices(prev =>
      prev.map(d =>
        d.device_code === deviceId 
          ? { 
              ...d, 
              status: "online", // ได้รับข้อมูลแสดงว่ายังออนไลน์
              sensor: sensorData,
              // อัปเดตค่าแบตเตอรี่และสัญญาณ (ถ้ามีส่งมาใน JSON)
              battery: sensorData.battery || d.battery,
              signal: sensorData.signal || d.signal,
              lastSeen: new Date().toLocaleString("th-TH") 
            }
          : d
      )
    );
  },

  // เมื่อได้รับสถานะ Online/Offline จาก MQTT Status Topic
  onStatus: (deviceId, status) => {
    setDevices(prev =>
      prev.map(d =>
        d.device_code === deviceId 
          ? { 
              ...d, 
              status: status,
              lastSeen: new Date().toLocaleString("th-TH")
            } 
          : d
      )
    );
  }
});

  async function loadDashboard() {
    const apiData = await getDashboardData();
    if (!apiData) return;

    const ids = apiData.map(item => item.device_code);
    setDeviceIds(ids);

    const formattedData = apiData.map(item => ({
      id: item.device_id,
      device_code: item.device_code,  
      farm_id : item.farm_id,
      area_id : item.area_id,
      area_name: item.area_name || "ไม่ระบุพื้นที่",
      farm_name: item.farm_name || "ฟาร์มทั่วไป",
      type: "Sensor Node",
      status: "offline",
      sensor: null
    }));
      setDevices(formattedData);


//       [
//     {
//         "device_id": 1,
//         "device_code": "G9H-001",
//         "registered_at": "2025-12-21T09:19:50.000Z",
//         "area_id": 10,
//         "area_name": "พื้นที่ A",
//         "farm_id": 6,
//         "farm_name": "เเปลงทดสอบ",
//         "owner_id": 19,
//         "owner_name": "ศุภณัฏฐ์ บำรุงนา",
//         "pump_id": 1,
//         "pump_name": "ปั๊มน้ำ ใกล้สระ",
//         "status": "OFF"
//     }
// ]
    const formattedPumpDevices = apiData.filter(item => 
      item.pump_id !== null
    ).map(item => ({
      id: item.pump_id,
      type: "Water Pump",
      status: item.status || "OFF",
      sensor: null
      
    }));

    setPumpDevices(formattedPumpDevices);
  }
  const systemSummary = {
    total: devices.length,
    online: devices.filter(d => d.status === 'online').length,
    offline: devices.filter(d => d.status === 'offline').length,
  };

  const pump_summary = {
    total: pumpDevices.length,
    online: pumpDevices.filter(d => d.status === 'ON').length,
    offline: pumpDevices.filter(d => d.status === 'OFF').length,
  };

  // กรองข้อมูล
  const filteredDevices = devices.filter(device => 
    device.area_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.farm_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedDevices = useMemo(() => {
    return filteredDevices.reduce((groups, device) => {
      const farm = device.farm_name;
      if (!groups[farm]) {
        groups[farm] = [];
      }
      groups[farm].push(device);
      return groups;
    }, {});
  }, [filteredDevices]);



  const handleInputChange = (field, value) => {
    setEditFormData({ ...editFormData, [field]: value });
  };

  // --- UI Components ---
  const StatusBadge = ({ status }) => (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ring-1 ring-inset
      ${status === 'online' 
        ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' 
        : 'bg-rose-50 text-rose-700 ring-rose-600/20'}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'online' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
      {status === 'online' ? 'ออนไลน์' : 'ออฟไลน์'}
    </span>
  );




  // --- Weather Logic ---
  const getWeatherDetails = (code) => {
    if (code === 0) return { label: "ท้องฟ้าแจ่มใส", icon: Sun };
    if (code >= 1 && code <= 3) return { label: "มีเมฆบางส่วน", icon: CloudSun };
    if (code >= 45 && code <= 48) return { label: "มีหมอก", icon: Cloud };
    if (code >= 51 && code <= 67) return { label: "ฝนตกปรอยๆ", icon: CloudRain };
    if (code >= 80 && code <= 99) return { label: "ฝนตกหนัก", icon: CloudRain };
    return { label: "มีเมฆมาก", icon: Cloud };
  };

  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      try {
        setLoadingWeather(true);
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
        );
        const data = await response.json();
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          code: data.current.weather_code
        });
        setLoadingWeather(false);
      } catch (err) {
        console.error(err);
        setLoadingWeather(false);
      }
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationName(`Lat: ${pos.coords.latitude.toFixed(2)}, Lon: ${pos.coords.longitude.toFixed(2)}`);
          fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
           setLocationName("Bangkok (Default)");
           fetchWeather(13.7563, 100.5018);
        }
      );
    } else {
       setLocationName("Bangkok (Default)");
       fetchWeather(13.7563, 100.5018);
    }
  }, []);

  const weatherInfo = weather ? getWeatherDetails(weather.code) : { label: "--", icon: Cloud };
  const WeatherIcon = weatherInfo.icon;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 selection:bg-emerald-100 selection:text-emerald-900">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header & Stats Cards */}
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
           <div>
              <h2 className="text-2xl font-bold text-slate-800">ภาพรวมระบบ</h2>
              <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                 <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span>{locationName}</span>
                 </div>
                 <span className="text-slate-300">•</span>
                 <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{lastUpdate ? lastUpdate.toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'}) : "--:--"}</span>
                 </div>
              </div>
           </div>
           {/* Weather Card */}
           <div className="w-full lg:w-auto min-w-[300px] bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-0.5 shadow-xl shadow-blue-200/50">
              <div className="bg-white/10 backdrop-blur-md rounded-[14px] p-4 flex items-center justify-between text-white relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
                 {loadingWeather ? (
                    <div className="flex gap-3 items-center w-full justify-center py-2">
                       <Loader2 className="w-5 h-5 animate-spin text-blue-200" />
                       <span className="text-sm font-medium text-blue-100">กำลังโหลด...</span>
                    </div>
                 ) : (
                    <>
                       <div className="z-10">
                          <div className="flex items-center gap-2 mb-1 text-blue-100">
                             <WeatherIcon className="w-5 h-5" />
                             <span className="text-sm font-medium">{weatherInfo.label}</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                             <span className="text-4xl font-bold tracking-tight">{weather?.temp}°</span>
                             <span className="text-sm text-blue-200">C</span>
                          </div>
                       </div>
                       <div className="flex flex-col items-end gap-1 z-10 pl-6 border-l border-white/10">
                          <div className="flex items-center gap-1.5 text-xs text-blue-100 bg-white/10 px-2 py-1 rounded-md">
                             <Droplets className="w-3 h-3" /> 
                             <span>{weather?.humidity}%</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-blue-100 bg-white/10 px-2 py-1 rounded-md">
                             <Wind className="w-3 h-3" /> 
                             <span>{weather?.windSpeed} km/h</span>
                          </div>
                       </div>
                    </>
                 )}
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
           <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-slate-500 mb-1">อุปกรณ์ทั้งหมด</p>
              <h3 className="text-4xl font-bold text-slate-800">{systemSummary.total}</h3>
           </div>
           <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-emerald-600 mb-1 flex items-center gap-2"><Wifi className="w-4 h-4" /> ทำงานปกติ</p>
              <h3 className="text-4xl font-bold text-emerald-700">{systemSummary.online}</h3>
           </div>
           <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-rose-500 mb-1 flex items-center gap-2"><WifiOff className="w-4 h-4" /> ขาดการเชื่อมต่อ</p>
              <h3 className="text-4xl font-bold text-rose-600">{systemSummary.offline}</h3>
           </div>

           <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-yellow-500 mb-1 flex items-center gap-2"><Waves  className="w-4 h-4" />จำนวนปั๊มน้ำ</p>
             <p className="text-4xl font-bold text-yellow-800">{pump_summary.total}</p>
           </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-green-500 mb-1 flex items-center gap-2"><Droplets className="w-4 h-4" /> ปั๊มน้ำที่ทำงานอยู่</p>
             <p className="text-4xl font-bold text-green-800">{pump_summary.online}</p>
           </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-rose-500 mb-1 flex items-center gap-2"><DropletOff  className="w-4 h-4" /> ปั๊มน้ำที่ออฟไลน์</p>
             <p className="text-4xl font-bold text-rose-800">{pump_summary.offline}</p>
            </div>
          
                 


        </div>

        {/* 3. Devices Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             
             {/* Controls */}
             <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                   <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                      <Radio className="w-5 h-5 text-emerald-500" />
                      จัดการอุปกรณ์ (Device Management)
                   </h3>
                   <p className="text-sm text-slate-500 mt-1">
                      ทั้งหมด: <span className="font-medium text-slate-900">{devices.length}</span>
                   </p>
                </div>
                <div className="flex items-center gap-2">
                   <div className="relative hidden sm:block">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="ค้นหาพื้นที่ หรือ ฟาร์ม..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-64 transition-all"
                      />
                   </div>
                
                </div>
             </div>
             
             {/* Table */}
             <div className="overflow-x-auto min-h-[300px]">
               <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                   <tr>
                     <th className="px-6 py-4 w-[35%]">พื้นที่ /เเปลง </th>
                     <th className="px-6 py-4">ประเภท</th>
                     <th className="px-6 py-4 text-center">สถานะ</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {Object.keys(groupedDevices).length > 0 ? (
                     Object.entries(groupedDevices).map(([farmName, farmDevices]) => (
                       /* ✅ ใช้ React.Fragment เพื่อแก้ Hydration Error */
                       <React.Fragment key={farmName}> 
                         
                         {/* ⭐ Farm Header Row */}
                         <tr className="bg-slate-100/50">
                           <td colSpan="6" className="px-6 py-2.5 font-bold text-slate-700 border-b border-slate-100">
                             <div className="flex items-center gap-2">
                               <Sprout className="w-4 h-4 text-emerald-600" />
                               ฟาร์ม: {farmName} <span className="text-xs font-normal text-slate-400">({farmDevices.length} จุด)</span>
                             </div>
                           </td>
                         </tr>

                         {/* Device Rows */}
                         {farmDevices.map((device) => {
                           const isEditing = editingId === device.id;
                           return (
                             <tr key={device.id} className={`transition-colors group ${isEditing ? 'bg-amber-50' : 'hover:bg-slate-50/80'}`}>
                               <td className="px-6 py-4">
                                 {isEditing ? (
                                   <div className="space-y-2">
                                      <input 
                                        type="text" 
                                        value={editFormData.area_name}
                                        onChange={(e) => handleInputChange('area_name', e.target.value)}
                                        className="w-full border border-amber-300 rounded px-2 py-1 text-sm"
                                        placeholder="ชื่อพื้นที่"
                                      />
                                   </div>
                                 ) : (
                                   <div className="flex items-center gap-3">
                                      <div className={`p-2 rounded-lg ${device.status === 'online' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                         <Server className="w-4 h-4" />
                                      </div>
                                      <div>
                                         <p className="font-medium text-slate-700">{device.area_name}</p>
                                         <p className="text-[11px] text-slate-400 font-mono">
                                            รหัสอุปกรณ์ : {device.device_code}
                                         </p>
                                      </div>
                                   </div>
                                 )}
                               </td>

                               <td className="px-6 py-4 text-slate-600">
                                   <span className="bg-slate-100 px-2 py-1 rounded text-xs font-medium text-slate-500 border border-slate-200">
                                      {device.type}
                                   </span>
                               </td>

                               <td className="px-6 py-4 text-center">
                                   <StatusBadge status={device.status} />
                               </td>

                               
                             </tr>
                           );
                         })}
                       </React.Fragment>
                     ))
                   ) : (
                     <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                           <div className="flex flex-col items-center justify-center gap-2">
                              <Search className="w-8 h-8 opacity-20" />
                              <p>ไม่พบข้อมูลอุปกรณ์</p>
                           </div>
                        </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
             
             {/* Pagination */}
             <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center text-xs text-slate-500">
                <span>แสดง {filteredDevices.length} รายการ</span>
             </div>
        </div>
        
      </main>
      <Footer />
    </div>
  );
}