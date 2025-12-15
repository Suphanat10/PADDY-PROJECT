"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Server,
  Wifi,
  WifiOff,
  Activity,
  Zap,
  Terminal,
  Cpu,
  Trash2,
  PauseCircle,
  PlayCircle,
  Battery,
  BatteryWarning,
  Droplets,
  Sprout,
  AlertCircle,
} from "lucide-react";
import {
  AdminSidebar,
  AdminHeader,
} from "../../../components/admin/AdminLayout";
import {fetchDevices} from "@/lib/admin/send-data/device";
import { useMonitorWebSocket } from "@/lib/admin/send-data/useMonitorWebSocket";


export default function SystemLogPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeMenu, setActiveMenu] = useState("sendData");

  const [devices, setDevices] = useState([]);
  const [logs, setLogs] = useState([]);

  const logsEndRef = useRef(null);

  // 🔹 โหลดอุปกรณ์จาก API
  useEffect(() => {
    fetchDevices()
      .then(setDevices)
      .catch(console.error);
  }, []);


  const onlineDeviceCodes = devices
    .map((d) => d.device_code);

  // 🔹 Summary
  const totalDevices = devices.length;
  const onlineDevices = logs.filter((log) => log.text.includes("STATUS") && log.text.includes("online")).length;
  const offlineDevices = logs.filter((log) => log.text.includes("STATUS") && log.text.includes("offline")).length;

    useMonitorWebSocket(onlineDeviceCodes, (msg) => {
  if (isPaused) return;

  if (msg.type === "SENSOR_UPDATE") {
    const logLine = `RECV (${msg.deviceId}) -> ${JSON.stringify({
      N: msg.npk?.N,
      P: msg.npk?.P,
      K: msg.npk?.K,
      water: msg.water_level,
      moisture: msg.soil_moisture,
      battery: msg.battery,
    })}`;

    setLogs((prev) =>
      [...prev, { id: Date.now(), text: logLine }].slice(-1000)
    );
  }

  if (msg.type === "DEVICE_STATUS") {
    const logLine = `STATUS (${msg.deviceId}) -> ${msg.status}`;
    setLogs((prev) =>
      [...prev, { id: Date.now(), text: logLine }].slice(-1000)
    );
  }
});

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);
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
          {/* === PART 1: TOP SECTION (SUMMARY CARDS) === */}
          <div className="flex-none">
            <div className="flex items-center gap-2 mb-4">
              <Server className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-800">
                Device Monitor (ภาพรวมระบบ)
              </h2>
            </div>

            {/* 3 Summary Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Card 1: Total */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase mb-1">
                    อุปกรณ์ทั้งหมด
                  </p>
                  <h3 className="text-2xl font-bold text-slate-800">
                    {totalDevices}
                  </h3>
                </div>
                <div className="p-3 bg-slate-100 rounded-lg text-slate-500">
                  <Cpu className="w-6 h-6" />
                </div>
              </div>

              {/* Card 2: Online */}
              <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-full -mr-10 -mt-10 opacity-50"></div>
                <div className="relative z-10">
                  <p className="text-xs text-green-600 font-medium uppercase mb-1">
                    กำลังส่งข้อมูล (Online)
                  </p>
                  <h3 className="text-2xl font-bold text-green-700">
                    {onlineDevices}
                  </h3>
                </div>
                <div className="relative z-10 p-3 bg-green-100 rounded-lg text-green-600">
                  <Wifi className="w-6 h-6" />
                  <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                </div>
              </div>

              {/* Card 3: Offline */}
              <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-500 font-medium uppercase mb-1">
                    ไม่ส่งข้อมูล (Offline)
                  </p>
                  <h3 className="text-2xl font-bold text-red-600">
                    {offlineDevices}
                  </h3>
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-red-500">
                  <WifiOff className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Device Cards Grid */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"> */}
          </div>

          {/* === PART 2: BOTTOM SECTION (SERIAL MONITOR) === */}
          <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-2">
            {/* Console Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-700 font-mono">
                  Live Serial Monitor
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-1.5 hover:bg-slate-200 rounded text-slate-500"
                >
                  {isPaused ? (
                    <PlayCircle className="w-4 h-4" />
                  ) : (
                    <PauseCircle className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setLogs([])}
                  className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded text-slate-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Console Body */}
            <div className="flex-1 bg-[#1e1e1e] p-4 overflow-y-auto font-mono text-xs leading-relaxed custom-scrollbar">
              {logs.length === 0 && (
                <div className="text-gray-500 text-center mt-10 opacity-50">
                  Waiting for data...
                </div>
              )}
              {logs.map((log,index) => (
                <div
                  key={index}
                  className="text-gray-300 border-l-2 border-transparent hover:border-green-500 pl-2 -ml-2 py-0.5"
                >
                  <span className="text-green-500 mr-2 opacity-70">➜</span>
                  {log.text}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        </main>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e1e1e;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
