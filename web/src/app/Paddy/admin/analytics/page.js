

"use client";

import React, { useState, useMemo , useEffect } from "react";
import {
  Sprout,
  Search,
  MapPin,
  User,
  LayoutGrid,
  BarChart3,
  History,
  Info,
  ImageIcon ,  Loader2
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";
import Footer from "@/app/components/Footer";
import { AdminSidebar, AdminHeader } from '../../../components/admin/AdminLayout';



export default function GrowthAnalysisPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
   const [RAW_DATA, setData] = useState([]);
   const [isLoading, setIsLoading] = useState(false);

  const DISPLAY_LIMIT = 6;

    useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
         const res = await apiFetch("/api/admin/get_data_growth_analysis", {
             method: "GET",
               headers: {
                   "Content-Type": "application/json",
               },
         });
         if (!res.ok) {
             Swal.fire({
               icon: "error",
               title: "Fetch failed",
               text: res.message || "Unknown error",
             });
               return;
         }
         setData(res.data);
        setIsLoading(false);
      }
      catch (error) {
         console.error("Error fetching growth analysis data:", error);
      }
      };
      fetchData();
   }, []);

const allDevices = useMemo(() => {
  if (!RAW_DATA?.length) return [];
   
  return RAW_DATA.flatMap(user =>
    user.farms.flatMap(farm =>
      farm.areas.flatMap(area =>
        area.devices
          .filter(d => d.growth_analysis?.length > 0)
          .map(deviceInfo => {
            const stageMap = new Map();

            for (const record of deviceInfo.growth_analysis) {
              stageMap.set(
                record.growth_stage,
                (stageMap.get(record.growth_stage) || 0) + 1
              );
            }

            return {
              key: deviceInfo.device_registration_id,

              user: {
                id: user.user_id,
                name: `${user.first_name} ${user.last_name}`
              },

              farm: {
                id: farm.farm_id,
                name: farm.farm_name
              },

              area: {
                id: area.area_id,
                name: area.area_name
              },

              device: deviceInfo.device,
              status: deviceInfo.status,

              latestAnalysis:
                deviceInfo.growth_analysis[
                  deviceInfo.growth_analysis.length - 1
                ],

              stats: Array.from(stageMap, ([stage, count]) => ({
                stage,
                count
              })),

              totalAnalysis: deviceInfo.growth_analysis.length
            };
          })
      )
    )
  );
         

}, [RAW_DATA]);


  const filteredDevices = useMemo(() => {
    return allDevices.filter(item => {
      const lowerSearch = searchTerm.toLowerCase();
      return (
        item.device.device_code.toLowerCase().includes(lowerSearch) ||
        item.user.name.toLowerCase().includes(lowerSearch) ||
        item.farm.name.toLowerCase().includes(lowerSearch) ||
        item.area.name.toLowerCase().includes(lowerSearch)
      );
    });
  }, [allDevices, searchTerm]);

  const displayedDevices = useMemo(() => {
      // กรณี 1: ไม่ได้ค้นหา -> ตัดเหลือแค่ DISPLAY_LIMIT (4 อัน)
      if (!searchTerm) {
          return filteredDevices.slice(0, DISPLAY_LIMIT);
      }
      // กรณี 2: มีการค้นหา -> แสดงทั้งหมดที่ค้นเจอ
      return filteredDevices;
  }, [filteredDevices, searchTerm]);

  const hiddenCount = filteredDevices.length - displayedDevices.length;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-600  overflow-hidden">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="growth-analysis" />

      <div className="flex flex-1 flex-col relative z-0">
        <AdminHeader setSidebarOpen={setSidebarOpen} />




              {isLoading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-green-600" size={48} />
              </div>
            )}



        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    การวิเคราะห์การเจริญเติบโต 
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        แสดงเฉพาะอุปกรณ์ที่มีประวัติการวิเคราะห์
                    </p>
                </div>
            </div>

            {/* --- Search Bar --- */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="ค้นหารหัสอุปกรณ์ / ชื่อฟาร์ม / เจ้าของ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all"
                    />
                </div>
            </div>

            {/* --- Info Banner (แสดงเมื่อมีรายการถูกซ่อน) --- */}
            {!searchTerm && hiddenCount > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-2 text-sm text-blue-700 animate-in fade-in slide-in-from-top-2">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    <span>
                        แสดง <strong>{DISPLAY_LIMIT}</strong> รายการล่าสุด 
                        (มีอีก {hiddenCount} รายการที่ซ่อนอยู่ กรุณาใช้ช่องค้นหาเพื่อดูข้อมูล)
                    </span>
                </div>
            )}

            {/* --- Results Grid --- */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {displayedDevices.map((item) => (
                    <div key={item.key} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-all duration-300 group">
                        
                        {/* 1. Left Side: Image & Info */}
                        <div className="md:w-5/12 p-5 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/30 flex flex-col">
                            {/* Device Info */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm font-bold font-mono shadow-sm shadow-indigo-200">
                                        {item.device.device_code}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 space-y-1.5 ml-1">
                                    <div className="flex items-center gap-2">
                                        <User className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="font-medium text-slate-700">{item.user.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-orange-400" />
                                        <span className="truncate w-48">{item.farm.name} - {item.area.name}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Latest Image */}
                            <div className="flex-1 mt-auto">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                                    <LayoutGrid className="w-3 h-3" /> ภาพถ่ายล่าสุด
                                </p>
                                <div className="relative w-full h-32 bg-slate-200 rounded-xl overflow-hidden border border-slate-200 shadow-sm group-hover:shadow transition-shadow">
                                    <img 
                                        src={item.latestAnalysis.image_url} 
                                        alt="Latest" 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        // onError={(e) => { e.target.src = "https://via.placeholder.com/400x200?text=No+Image"; }}
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                        <p className="text-white text-xs font-medium truncate">{item.latestAnalysis.growth_stage}</p>
                                        <p className="text-[10px] text-slate-200">
                                            {new Date(item.latestAnalysis.created_at).toLocaleDateString('th-TH')}
                                        </p>
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                                            <ImageIcon className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Right Side: Statistics Summary */}
                        <div className="md:w-7/12 p-5 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-green-600" />
                                    สรุปผลการวิเคราะห์
                                </h3>
                                <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-md border border-green-100">
                                    รวม {item.totalAnalysis} ครั้ง
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                                <div className="space-y-3">
                                    {/* Table Header */}
                                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 pb-1 border-b border-slate-50">
                                        <span>ระยะการเติบโต</span>
                                        <span>จำนวน (ครั้ง)</span>
                                    </div>
                                    
                                    {/* Stats List */}
                                    {item.stats.map((stat, idx) => (
                                        <div key={idx} className="flex justify-between items-center group/item hover:bg-slate-50 p-2 rounded-lg transition-colors">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${['bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-purple-400'][idx % 4]}`}></div>
                                                <span className="text-sm font-medium text-slate-600 group-hover/item:text-slate-800">{stat.stage}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full hidden sm:block overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${['bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-purple-400'][idx % 4]}`} 
                                                        style={{ width: `${(stat.count / item.totalAnalysis) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-bold text-slate-700 w-6 text-right">{stat.count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer / Last Update */}
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-400">
                                <History className="w-3 h-3" />
                                <span>อัปเดตล่าสุด: {new Date(item.latestAnalysis.created_at).toLocaleString('th-TH')}</span>
                            </div>
                        </div>

                    </div>
                ))}
            </div>

            {/* No Results State */}
            {displayedDevices.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">
                        {searchTerm 
                            ? "ไม่พบข้อมูลที่ตรงกับคำค้นหา" 
                            : "ยังไม่มีอุปกรณ์ใดที่มีประวัติการวิเคราะห์"}
                    </p>
                </div>
            )}

          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}