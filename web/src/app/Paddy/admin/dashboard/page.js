"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Smartphone,
  Users,
  Tractor,
  Map as MapIcon,
  Sprout,
  Wifi,
  WifiOff,
  Search,
  Activity,
  Battery,
  BatteryCharging,
  Signal,
  MoreVertical,
} from "lucide-react";

import {
  AdminSidebar,
  AdminHeader,
} from "../../../components/admin/AdminLayout";
import { apiFetch } from "@/lib/api";
import Footer from "@/app/components/Footer";

import { useDeviceWebSocket } from "@/lib/dashboard/useDeviceWebSocket";

const StatCard = ({ title, value, unit, icon: Icon, theme = "blue" }) => {
  const themes = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
  };

  const activeTheme = themes[theme] || themes.blue;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800">
            {value}{" "}
            <span className="text-sm font-normal text-slate-400">{unit}</span>
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${activeTheme}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

const DeviceStatusCard = ({ device }) => {
  const isOnline = device.status === "online";

  return (
    <div
      className={`group relative rounded-2xl border p-5 transition-all duration-300 ${
        isOnline
          ? "bg-white border-emerald-200 shadow-lg shadow-emerald-100/50"
          : "bg-slate-50 border-slate-200 hover:shadow-sm"
      }`}
    >
      {/* Header Card */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-lg ${
              isOnline
                ? "bg-emerald-100 text-emerald-600"
                : "bg-slate-200 text-slate-500"
            }`}
          >
            <Wifi size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-lg">
              {device.device_code}
            </h4>
            {/* <span className="text-xs text-slate-500">ID: {device.device_ID}</span> */}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              ออนไลน์
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-500 text-xs font-semibold">
              ออฟไลน์
            </span>
          )}
        </div>
      </div>

      <hr className="border-slate-100 my-3" />

      {/* Footer Info */}
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2 text-slate-500">
          {isOnline ? (
            <>
              <Activity size={16} className="text-emerald-500 animate-pulse" />
              <span>ออนไลน์</span>
            </>
          ) : (
            <>
              <WifiOff size={16} className="text-slate-400" />
              <span>ออฟไลน์</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [devices, setDevices] = useState([]);
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const res = await apiFetch("/api/admin/get_dashboard_overview", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        console.error("Dashboard API error:", res);
        return;
      }
      setDevices(res.data.devices);
      setSummary(res.data.summary);
    };

    getData();
  }, []);

  const deviceCodes = useMemo(
    () => devices.map((d) => d.device_code),
    [devices]
  );

  useDeviceWebSocket({
    deviceIds: deviceCodes,
    onStatus: (deviceCode, status) => {
      setDevices((prev) =>
        prev.map((d) => (d.device_code === deviceCode ? { ...d, status } : d))
      );
    },
  });

  const filteredDevices = useMemo(() => {
    return devices.filter((d) =>
      d.device_code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [devices, searchTerm]);

  return (
    <div className="flex h-screen bg-slate-50/50 overflow-hidden">
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeMenu="dashboard"
      />

      <div className="flex flex-1 flex-col relative">
        <AdminHeader setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* 1. Header Section */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                ภาพรวมระบบ
              </h1>
              <p className="text-slate-500 mt-1">
                ติดตามสถานะอุปกรณ์และข้อมูลฟาร์มแบบเรียลไทม์
              </p>
            </div>

            {/* 2. STATS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <StatCard
                title="อุปกรณ์ทั้งหมด"
                value={summary.total_devices}
                icon={Smartphone}
                theme="blue"
              />
              <StatCard
                title="ลงทะเบียนแล้ว"
                value={summary.registered_devices}
                icon={Signal}
                theme="indigo"
              />
              <StatCard
                title="ผู้ใช้งาน"
                value={summary.agriculture_users}
                icon={Users}
                theme="orange"
              />
              <StatCard
                title="จำนวนฟาร์ม"
                value={summary.total_farms}
                icon={Tractor}
                theme="green"
              />
              <StatCard
                title="พื้นที่ย่อย"
                value={summary.total_areas}
                icon={MapIcon}
                theme="green"
              />
              <StatCard
                title="อุปกรณ์ออนไลน์"
                value={devices.filter((d) => d.status === "online").length}
                icon={Wifi}
                theme="blue"
              />
              <StatCard
                title="อุปกรณ์ออฟไลน์"
                value={devices.filter((d) => d.status !== "online").length}
                icon={WifiOff}
                theme="blue"
              />
            </div>

            {/* 3. DEVICE MONITOR SECTION */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="text-emerald-500" />
                  สถานะอุปกรณ์
                  <span className="text-sm font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {filteredDevices.length} เครื่อง
                  </span>
                </h2>

                {/* Search Bar Styled */}
                <div className="relative w-full md:w-80">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm transition-all shadow-sm"
                    placeholder="ค้นหารหัสอุปกรณ์ (Device Code)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Device Grid */}
              {filteredDevices.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredDevices.map((device) => (
                    <DeviceStatusCard key={device.device_ID} device={device} />
                  ))}
                </div>
              ) : (
                // Empty State
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                  <Search className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <h3 className="text-lg font-medium text-slate-900">
                    ไม่พบอุปกรณ์
                  </h3>
                  <p className="text-slate-500">
                    ลองตรวจสอบรหัสอุปกรณ์อีกครั้ง
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
