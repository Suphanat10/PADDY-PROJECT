"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  Droplets,
  Clock,
  Sprout,
  RefreshCw,
  CheckCircle2,
  Sliders,
  RotateCcw,
   Loader2,
} from "lucide-react";
import {
  AdminSidebar,
  AdminHeader,
} from "../../../../components/admin/AdminLayout";
import Footer from "@/app/components/Footer";
import { fetchGeneralSettings , updateGeneralSettings } from "@/lib/admin/settings/general/general.api";

export default function SystemSettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading , setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);


  const [config, setConfig] = useState({
    system_settings_ID: null,
    data_send_interval_days: 0,
    growth_analysis_period: 0,
    water_level_min: 0,
    water_level_max: 0,
    updated_at: ""
  });

  useEffect(() => {
       setLoading(true);
    const fetchConfig = async () => {
      try {
        const data = await fetchGeneralSettings();
        if (Array.isArray(data) && data.length > 0) {
            setConfig(data[0]);
            setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        setLoading(false);
      }
    };


    fetchConfig();
  }, []);


  const handleChange = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSaveStatus(null);
  };

  const handleSave = () => {
    setIsSaving(true);
    const saveData = async () => {
      try {
        await updateGeneralSettings(config , setConfig);
        setSaveStatus("success");
      } catch (error) {
        setSaveStatus("error");
      } finally {
        setIsSaving(false);
      }
      };
      saveData();


     
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-600 overflow-hidden">
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeMenu="Settings-General"
      />

      <div className="flex flex-1 flex-col relative z-0">
        <AdminHeader setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  การตั้งค่าการทำงานของระบบ
                </h1>
                <p className="text-sm text-slate-500 mt-1 ml-8">
                  จัดการเงื่อนไขการทำงานของเซนเซอร์และการแจ้งเตือน
                </p>
              </div>
            </div>


              {loading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-green-600" size={48} />
              </div>
            )}


            {/* --- GRID LAYOUT --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* 1. WATER THRESHOLDS (Full Width) */}
              <div className="lg:col-span-12 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-500">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <h2 className="font-bold text-slate-700 text-lg">
                    ระดับน้ำแจ้งเตือน
                  </h2>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center">
                  {/* Visual Gauge */}
                  <div className="w-full md:w-1/3 flex justify-center bg-slate-50 rounded-2xl p-6 border border-dashed border-slate-200">
                    <div className="relative h-48 w-28 bg-white border-2 border-slate-300 rounded-xl overflow-hidden flex flex-col justify-end shadow-inner">
                      {/* Max Line Animation */}
                      <div
                        className="absolute w-full border-t-2 border-red-400 border-dashed z-10 transition-all duration-500 ease-out"
                        style={{
                          bottom: `${Math.min((config.water_level_max / 50) * 100, 100)}%`,
                        }}
                      >
                        <span className="absolute right-1 -top-5 text-[10px] text-red-500 font-bold bg-white/80 px-1 rounded">
                          MAX {config.water_level_max}
                        </span>
                      </div>
                      
                      {/* Min Line Animation inside Fill */}
                      <div className="w-full bg-gradient-to-t from-blue-500 to-cyan-300 h-1/2 transition-all duration-500 relative opacity-80">
                        <div
                          className="absolute w-full border-t-2 border-amber-400 border-dashed z-10"
                          style={{
                            bottom: `${Math.min((config.water_level_min / 30) * 100, 100)}%`,
                          }}
                        >
                          <span className="absolute right-1 -top-5 text-[10px] text-amber-600 font-bold bg-white/80 px-1 rounded">
                            MIN {config.water_level_min}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                        ระดับน้ำสูงสุด (Max)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={config.water_level_max || 0}
                          onChange={(e) =>
                            handleChange(
                              "water_level_max",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
                        />
                      </div>
                      <p className="text-[13px] text-red-400 mt-1">
                        * เตือนเมื่อน้ำท่วมสูงเกินเกณฑ์
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                        ระดับน้ำต่ำสุด (Min)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={config.water_level_min || 0}
                          onChange={(e) =>
                            handleChange(
                              "water_level_min",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
                        />
                      </div>
                      <p className="text-[13px] text-amber-500 mt-1">
                        * เตือนเมื่อน้ำแห้ง/ต้องเติมน้ำ
                      </p>
                    </div>
                  </div>
                </div>
              </div>


              <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                  <div className="p-2 bg-indigo-50 rounded-xl text-indigo-500">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h2 className="font-bold text-slate-700 text-lg">
                    รอบการส่งข้อมูล
                  </h2>
                </div>

                <div className="space-y-5 flex-1">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                      ระยะเวลาส่งข้อมูล (วัน)
                    </label>
                    <div className="flex items-center gap-3">
                      <select
                        value={config.data_send_interval_days || 0}
                        onChange={(e) =>
                           handleChange(
                              "data_send_interval_days",
                              parseInt(e.target.value) || 0
                              )
                        }
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700  font-medium"
                        >
                           <option value="0.0208">ทุกๆ 30 นาที</option>
                      <option value="0.0417">ทุกๆ 1 ชั่วโมง</option>
                      <option value="0.1667">ทุกๆ 4 ชั่วโมง</option>
                      <option value="0.25">ทุกๆ 6 ชั่วโมง</option>
                      <option value="0.5">ทุกๆ 12 ชั่วโมง</option>
                      <option value="1">ทุกๆ 1 วัน</option>
                      <option value="3">ทุกๆ 3 วัน</option>
                       <option value="7">ทุกๆ 7 วัน</option>
                       <option value="15">ทุกๆ 15 วัน</option>
                      </select>
                  
                        <span className="text-sm font-medium text-slate-500 whitespace-nowrap">
                        วัน
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">
                        * กำหนดความถี่ในการส่งข้อมูลสรุปขึ้น Server
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. GROWTH ANALYSIS (Right Column) */}
              <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                  <div className="p-2 bg-green-50 rounded-xl text-green-500">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <h2 className="font-bold text-slate-700 text-lg">
                    การวิเคราะห์ผลผลิต
                  </h2>
                </div>

                <div className="space-y-5 flex-1">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                      ระยะเวลาวิเคราะห์การเติบโต
                    </label>
                    <div className="flex items-center gap-3">
                      <select
                        value={config.growth_analysis_period || 0}
                        onChange={(e) =>
                           handleChange(
                              "growth_analysis_period",
                              parseInt(e.target.value) || 0
                           )
                        }
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-slate-700  font-medium"
                      >
                                           <option value="3">ทุกๆ 3 วัน</option>
                      <option value="7">ทุกๆ 7 วัน</option>
                      <option value="10">ทุกๆ 10 วัน</option>
                      <option value="15">ทุกๆ 15 วัน</option>
                      <option value="20">ทุกๆ 20 วัน</option>
                      <option value="25">ทุกๆ 25 วัน</option>

                        </select>
                 
                      <span className="text-sm font-medium text-slate-500 whitespace-nowrap">
                        วัน
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">
                        * รอบเวลาในการประมวลผลเพื่อวิเคราะห์ความสมบูรณ์ของพืช
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* --- ACTION BUTTONS (Moved Inside Content) --- */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-4">
              <p className="text-xs text-slate-400 mr-auto">
                <span className="text-red-500 font-bold">*</span>{" "}
                อัปเดตล่าสุด: {config.updated_at ? new Date(config.updated_at).toLocaleString('th-TH') : '-'}
              </p>

          

              <button
                onClick={handleSave}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-xl shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            
               >
                
               บันทึกข้อมูล
              </button>
            </div>
          </div>
        </main>
       <Footer />
      </div>
    </div>
  );
}