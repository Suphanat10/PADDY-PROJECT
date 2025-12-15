"use client";

import React, { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation"; // รวม import
import {
  Thermometer,
  Droplets,
  Leaf,
  Activity,
  History,
  PieChart,
  BarChart3,
  LineChart,
  Cpu,
  FileX,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  Download
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

import { AdminSidebar, AdminHeader } from '../../../../components/admin/AdminLayout';
import useSensorDetail from "@/lib/admin/sensor/sensor";
import { useSensorWebSocket } from "@/lib/admin/sensor/useSensorWebSocket";
import Footer from "@/app/components/Footer";






export default function SensorDetailPage() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  
  const id = params?.id;
  const {
  historicalData,
  deviceInfo,
  isLoading,
  error,
} = useSensorDetail(id);

const {
  isSocketConnected,
  currentData
} = useSensorWebSocket(id);


  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case "down": return <TrendingDown className="w-4 h-4 text-rose-500" />;
      default: return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const WaterLevelCard = ({ data, color }) => {
    if (!data) return null;
    const maxLevel = 30;
    const waterHeight = Math.min((data.value / maxLevel) * 100, 100);

    return (
      <div className="h-full flex flex-col justify-center">
        <div className="p-4">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-36 border-2 border-slate-300 rounded-b-xl bg-white relative overflow-hidden shadow-inner ring-4 ring-slate-50">
                 {/* Background Markers */}
                <div className="absolute top-0 w-full h-8 border-b border-dashed border-slate-200 opacity-50"></div>
                <div className="absolute top-8 w-full h-16 border-b border-dashed border-slate-200 opacity-50"></div>
                
                {/* Animated Water Level */}
                <div
                  className="absolute bottom-0 w-full bg-gradient-to-t from-cyan-600 to-cyan-400 transition-all duration-1000 ease-in-out opacity-90"
                  style={{ height: `${waterHeight}%` }}
                >
                  <div className="absolute top-0 w-full h-1 bg-white/30 animate-pulse"></div>
                </div>

                {/* Indicator Line */}
                <div
                  className="absolute left-0 right-0 h-0.5 bg-rose-500 z-20 transition-all duration-1000 ease-in-out shadow-sm"
                  style={{ bottom: `${waterHeight}%` }}
                ></div>
              </div>

              {/* Float Tag */}
              <div
                className="absolute left-24 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded shadow-md ml-3 transition-all duration-1000 ease-in-out"
                style={{
                  bottom: `${waterHeight}%`,
                  transform: "translateY(50%)",
                }}
              >
                {data.value} ซม.
                <div className="absolute left-0 top-1/2 -ml-1 -mt-1 w-2 h-2 bg-rose-500 transform rotate-45"></div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className={`text-2xl font-bold ${color}`}>
              {data.value} {data.unit}
            </div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mt-1">ระดับน้ำปัจจุบัน</p>
          </div>
        </div>
      </div>
    );
  };

  const MetricCard = ({ title, icon: Icon, data, color, bgColor }) => {
    if (!data) return <div className="h-32 bg-slate-100 rounded-xl animate-pulse"></div>;

    return (
      <div className="bg-white rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300 group">
        <div className={`p-5 border-b border-slate-50`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 ${bgColor} ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 text-sm">{title}</h3>
                <p className="text-[11px] text-slate-400">Real-time status</p>
              </div>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-full border border-slate-100">
                {getTrendIcon(data.trend)}
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="text-center">
            <div className={`text-3xl font-bold ${color} mb-1 flex items-baseline justify-center gap-1`}>
              {data.value}
              <span className="text-sm text-slate-400 font-medium">{data.unit}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-600 ">
      <AdminSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        activeMenu={activeMenu}
      />

      <div className="flex flex-1 flex-col overflow-hidden relative">
        <AdminHeader setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:px-12 lg:py-10 scroll-smooth">
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
              <p className="font-medium animate-pulse">กำลังโหลดข้อมูลอุปกรณ์...</p>
            </div>
          ) : (
            <div className="max-w-[1600px] mx-auto space-y-12 pb-12"> 
             
              <section>
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                            <Activity className="w-6 h-6 text-rose-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                                การติดตามผลแบบเรียลไทม์ ของ {id || 'อุปกรณ์ไม่ระบุชื่อ'}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="flex w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <p className="text-sm text-slate-500 font-medium">
                                    สถานะ: <span className="text-emerald-600">ออนไลน์</span> • ID: {id}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {currentData && (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">

                    <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500"></div>
                      <div className="flex items-center justify-between mb-4 z-10">
                        <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-cyan-600" />
                          ระดับน้ำ (Live)
                        </h3>
                        <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-100 animate-pulse">
                            LIVE
                        </span>
                      </div>
                      <div className="flex-1">
                        <WaterLevelCard
                          data={currentData.waterLevel}
                          color="text-cyan-600"
                        />
                      </div>
                    </div>

                    {/* Sensor Cards Grid */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 content-start">
                      <MetricCard
                        title="ไนโตรเจน (N)"
                        icon={Leaf}
                        data={currentData.nitrogen}
                        color="text-emerald-600"
                        bgColor="bg-emerald-50"
                      />
                      <MetricCard
                        title="ฟอสฟอรัส (P)"
                        icon={Leaf}
                        data={currentData.phosphorus}
                        color="text-amber-500"
                        bgColor="bg-amber-50"
                      />
                      <MetricCard
                        title="โพแทสเซียม (K)"
                        icon={Leaf}
                        data={currentData.potassium}
                        color="text-violet-600"
                        bgColor="bg-violet-50"
                      />
                      <MetricCard
                        title="ความชื้นดิน"
                        icon={Droplets}
                        data={currentData.humidity}
                        color="text-blue-600"
                        bgColor="bg-blue-50"
                      />
                      <MetricCard
                        title="อุณหภูมิ"
                        icon={Thermometer}
                        data={currentData.temperature}
                        color="text-rose-600"
                        bgColor="bg-rose-50"
                      />
                       <MetricCard
                        title="แบตเตอรี่"
                        icon={Cpu}
                        data={currentData.battery}
                        color="text-slate-700"
                        bgColor="bg-slate-100"
                      />
                    </div>
                  </div>
                )}
              </section>

              {/* SECTION 2: HISTORICAL DATA */}
              {/* ↑ ADJUST 2: ใช้ pt-10 และ border-t เพื่อสร้างเส้นแบ่งที่ดูโปร่งสบาย */}
              <section className="pt-10 border-t border-slate-200">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <History className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                          ข้อมูลย้อนหลัง (Historical Analysis)
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                          กราฟแสดงแนวโน้มข้อมูล 24 ชั่วโมงย้อนหลัง
                        </p>
                      </div>
                   </div>
                   
                   {/* Export Button */}
                   <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm">
                      <Download className="w-4 h-4" />
                      Export CSV
                   </button>
                </div>

                {historicalData && historicalData.length > 0 ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    
                    {/* Chart 1: Main Overview */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 xl:col-span-2">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-indigo-500" />
                            ภาพรวมค่าความสมบูรณ์ (Stacked Area)
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 pl-7">เปรียบเทียบสัดส่วนค่าต่างๆ ในช่วงเวลาเดียวกัน</p>
                        </div>
                      </div>

                      <div className="h-[450px] w-full"> {/* Increased height slightly */}
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorN" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 12}} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="#94a3b8" tick={{fontSize: 12}} tickLine={false} axisLine={false} dx={-10} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />

                            <Area type="monotone" dataKey="nitrogen" stackId="1" stroke="#10B981" fill="url(#colorN)" name="ไนโตรเจน" />
                            <Area type="monotone" dataKey="phosphorus" stackId="1" stroke="#F59E0B" fill="url(#colorP)" name="ฟอสฟอรัส" />
                            <Area type="monotone" dataKey="potassium" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} name="โพแทสเซียม" />
                            <Area type="monotone" dataKey="humidity" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.4} name="ความชื้น" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    {/* Sub Charts Grid */}
                    {/* Chart 2 */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-cyan-500" />
                          ประวัติระดับน้ำ
                        </h3>
                      </div>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={historicalData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 11}} axisLine={false} tickLine={false} />
                            <YAxis stroke="#94a3b8" tick={{fontSize: 11}} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                            <Area type="monotone" dataKey="waterLevel" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.1} strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Chart 3 */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                          <Droplets className="w-5 h-5 text-blue-500" />
                          ประวัติความชื้นดิน
                        </h3>
                      </div>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart data={historicalData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 11}} axisLine={false} tickLine={false} />
                            <YAxis stroke="#94a3b8" tick={{fontSize: 11}} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                            <Line type="monotone" dataKey="humidity" stroke="#3B82F6" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
                    <FileX className="w-16 h-16 mb-4 opacity-50" />
                    <p className="font-medium text-lg text-slate-600">ไม่พบข้อมูลย้อนหลัง</p>
                    <p className="text-sm">ยังไม่มีการบันทึกข้อมูลสำหรับช่วงเวลานี้</p>
                  </div>
                )}
              </section>

            </div>
          )}
        </main>
      <Footer />
      </div>
         
    </div>
  );
}