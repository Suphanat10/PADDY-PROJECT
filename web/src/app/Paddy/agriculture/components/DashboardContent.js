"use client";
import { useMemo, useState } from "react";
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Thermometer,
  Droplets,
  Sprout,
  BarChart3,
  TrendingUp,
  MapPin,
  Crosshair,
  Compass,
  Activity,
  Wifi,
  WifiOff,
  AlertTriangle,
  Wind,
  CloudSun,
  MoreHorizontal,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

/** =============== MAIN DASHBOARD =============== **/
export default function DashboardContent() {
  
  // --- Mock Data ---
  const systemStatus = {
    totalDevices: 12,
    onlineDevices: 10,
    offlineDevices: 2,
    activeAlerts: 3,
    avgHealth: 92,
  };

  const weatherData = {
    temp: 32,
    humidity: 65,
    condition: "Partly Cloudy",
    windSpeed: 12,
  };

  const sensorHighlights = [
    { 
      id: 1, 
      label: "ความชื้นในดิน", 
      value: "78", 
      unit: "%", 
      status: "normal", 
      icon: Droplets, 
      color: "text-blue-500", 
      bg: "bg-blue-50",
      barColor: "bg-blue-500",
      trend: "up"
    },
    { 
      id: 2, 
      label: "อุณหภูมิแปลง", 
      value: "31", 
      unit: "°C", 
      status: "warning", 
      icon: Thermometer, 
      color: "text-orange-500", 
      bg: "bg-orange-50",
      barColor: "bg-orange-500",
      trend: "up"
    },
    { 
      id: 3, 
      label: "ระดับน้ำ", 
      value: "10", 
      unit: "cm", 
      status: "normal", 
      icon: BarChart3, 
      color: "text-cyan-500", 
      bg: "bg-cyan-50",
      barColor: "bg-cyan-500",
      trend: "down"
    },
    { 
      id: 4, 
      label: "ความสมบูรณ์", 
      value: "92", 
      unit: "%", 
      status: "good", 
      icon: Sprout, 
      color: "text-emerald-500", 
      bg: "bg-emerald-50",
      barColor: "bg-emerald-500",
      trend: "stable"
    },
  ];

  const recentAlerts = [
    { id: 1, message: "ตรวจพบระดับน้ำต่ำกว่าเกณฑ์", location: "แปลงนาโซน A", time: "10 นาทีที่แล้ว", type: "critical" },
    { id: 2, message: "อุณหภูมิสูงเกินกำหนด", location: "โรงเรือนเพาะชำ 2", time: "1 ชั่วโมงที่แล้ว", type: "warning" },
    { id: 3, message: "อุปกรณ์ Node-04 ขาดการเชื่อมต่อ", location: "แปลงนาโซน B", time: "3 ชั่วโมงที่แล้ว", type: "offline" },
    { id: 4, message: "ความชื้นต่ำกว่าเกณฑ์ที่กำหนด", location: "แปลงนาโซน C", time: "5 ชั่วโมงที่แล้ว", type: "warning" },
  ];

  // --- Helper Functions ---
  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'offline': return <WifiOff className="w-5 h-5 text-gray-400" />;
      default: return <AlertCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gray-50/50 min-h-screen font-sans">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard ภาพรวม</h1>
          <p className="text-sm text-gray-500 mt-1">ติดตามสถานะและข้อมูลสำคัญของแปลงนาแบบเรียลไทม์</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
              <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                 <CloudSun className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-xs text-gray-500 font-medium">สภาพอากาศ</p>
                 <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-gray-800">{weatherData.temp}°C</span>
                    <span className="text-xs text-gray-400">{weatherData.condition}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 2. Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Devices */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                <Wifi className="w-6 h-6" />
             </div>
             <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                Online {Math.round((systemStatus.onlineDevices/systemStatus.totalDevices)*100)}%
             </span>
          </div>
          <div className="space-y-1">
             <p className="text-gray-500 text-sm font-medium">อุปกรณ์ทั้งหมด</p>
             <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-gray-900">{systemStatus.totalDevices}</h3>
                <span className="text-sm text-gray-400">เครื่อง</span>
             </div>
          </div>
        </div>

        {/* Card 2: Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2.5 bg-red-50 rounded-xl text-red-500">
                <AlertCircle className="w-6 h-6" />
             </div>
             {systemStatus.activeAlerts > 0 && (
                <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100 animate-pulse">
                   Action Needed
                </span>
             )}
          </div>
          <div className="space-y-1">
             <p className="text-gray-500 text-sm font-medium">แจ้งเตือนรอการแก้ไข</p>
             <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-gray-900">{systemStatus.activeAlerts}</h3>
                <span className="text-sm text-gray-400">รายการ</span>
             </div>
          </div>
        </div>

        {/* Card 3: Moisture Avg */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2.5 bg-cyan-50 rounded-xl text-cyan-600">
                <Droplets className="w-6 h-6" />
             </div>
          </div>
          <div className="space-y-1">
             <p className="text-gray-500 text-sm font-medium">ความชื้นเฉลี่ยในดิน</p>
             <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-gray-900">76</h3>
                <span className="text-sm text-gray-400">%</span>
             </div>
          </div>
          <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
             <div className="bg-cyan-500 h-full rounded-full" style={{ width: '76%' }}></div>
          </div>
        </div>

        {/* Card 4: Health */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                <Sprout className="w-6 h-6" />
             </div>
             <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="space-y-1">
             <p className="text-gray-500 text-sm font-medium">สุขภาพพืชโดยรวม</p>
             <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-gray-900">{systemStatus.avgHealth}</h3>
                <span className="text-sm text-gray-400">%</span>
             </div>
          </div>
          <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
             <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${systemStatus.avgHealth}%` }}></div>
          </div>
        </div>
      </div>

      {/* 3. Real-time Environment Section (ปรับใหม่ให้เด่นขึ้น) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                สภาพแวดล้อมปัจจุบัน (Real-time)
            </h2>
            <span className="text-xs text-gray-400">อัปเดตเมื่อ: 2 นาทีที่แล้ว</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sensorHighlights.map((sensor) => (
                <div key={sensor.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-emerald-200 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-2xl ${sensor.bg} ${sensor.color} group-hover:scale-110 transition-transform duration-300`}>
                            <sensor.icon className="w-6 h-6" />
                        </div>
                        {sensor.trend === 'up' && <ArrowUpRight className="w-4 h-4 text-red-400" />}
                        {sensor.trend === 'down' && <ArrowDownRight className="w-4 h-4 text-emerald-400" />}
                    </div>
                    
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">{sensor.label}</p>
                        <div className="flex items-baseline gap-1 mb-3">
                            <span className="text-3xl font-bold text-gray-900">{sensor.value}</span>
                            <span className="text-sm text-gray-500 font-medium">{sensor.unit}</span>
                        </div>
                        
                        {/* Progress Bar Visual */}
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${sensor.barColor} transition-all duration-1000`} 
                                style={{ width: `${Math.min(parseInt(sensor.value), 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* 4. Bottom Grid: Alerts & Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Recent Alerts (2 columns wide) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                 <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-gray-500" />
                    การแจ้งเตือนล่าสุด
                 </h3>
                 <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium px-3 py-1 rounded-full hover:bg-emerald-50 transition-colors">
                    ดูประวัติทั้งหมด
                 </button>
            </div>
            <div className="divide-y divide-gray-50 flex-1">
                 {recentAlerts.map((alert) => (
                    <div key={alert.id} className="p-4 hover:bg-gray-50 transition-colors flex gap-4 items-start group">
                       <div className="mt-1 flex-shrink-0 group-hover:scale-110 transition-transform">
                          {getAlertIcon(alert.type)}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 leading-tight mb-1">{alert.message}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                             <span className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {alert.location}
                             </span>
                             <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Activity className="w-3 h-3" /> {alert.time}
                             </span>
                          </div>
                       </div>
                       <div className="self-center">
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                       </div>
                    </div>
                 ))}
                 {recentAlerts.length === 0 && (
                    <div className="p-8 text-center text-gray-400">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>ไม่มีการแจ้งเตือน</p>
                    </div>
                 )}
            </div>
        </div>

        {/* Right: Device Status (1 column wide) */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                 <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Wifi className="w-5 h-5 text-gray-500" />
                    สถานะอุปกรณ์
                 </h3>
                 <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online"></span>
                    <span className="w-2 h-2 rounded-full bg-gray-300" title="Offline"></span>
                 </div>
            </div>
            <div className="p-3 space-y-2 flex-1 overflow-y-auto max-h-[400px]">
                 {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl cursor-pointer border border-transparent hover:border-gray-100 transition-all group">
                       <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-offset-2 ${i === 3 ? 'bg-gray-400 ring-gray-100' : 'bg-emerald-500 ring-emerald-100'}`}></div>
                          <div>
                             <p className="text-sm font-medium text-gray-700 group-hover:text-emerald-700 transition-colors">Sensor Node 0{i}</p>
                             <p className="text-[10px] text-gray-400">{i === 3 ? 'Offline 2h' : 'Active • 98%'}</p>
                          </div>
                       </div>
                       <div className={`px-2 py-0.5 rounded text-[10px] font-medium ${i === 3 ? 'bg-gray-100 text-gray-500' : 'bg-emerald-50 text-emerald-600'}`}>
                          {i === 3 ? 'Offline' : 'Online'}
                       </div>
                    </div>
                 ))}
            </div>
            <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                 <button className="text-xs font-medium text-gray-500 hover:text-emerald-600 transition-colors flex items-center justify-center gap-1 w-full py-1">
                    <MoreHorizontal className="w-3 h-3" /> จัดการอุปกรณ์
                 </button>
            </div>
        </div>

      </div>
      
    </div>
  );
}