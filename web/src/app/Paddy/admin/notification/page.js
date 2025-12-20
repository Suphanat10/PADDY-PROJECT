"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Bell,
  Search,
  Calendar,
  Smartphone,
  User,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  AdminSidebar,
  AdminHeader,
} from "../../../components/admin/AdminLayout";
import { apiFetch } from "@/lib/api";
import Footer from "@/app/components/Footer";

export default function NotificationHistoryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [RAW_ALERTS, setRAW_ALERTS] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 8;

  useEffect(() => {
    let mounted = true;

    const fetchdta = async () => {
      setLoading(true);
      const res = await apiFetch("/api/admin/log_alert", { method: "GET" });
      if (!res.ok) {
        setLoading(false);
        return;
      }

      const prepared = res.data.map((alert) => {
        const created = new Date(alert.created_at);

        const deviceCode =
          alert?.device_registrations?.Device?.device_code ?? "";
        const firstName =
          alert?.device_registrations?.Account?.first_name ?? "";
        const message = alert?.alert_message ?? "";

        return {
          ...alert,
          _search: `${message} ${deviceCode} ${firstName}`.toLowerCase(),
          _device: deviceCode,
          _dateKey: created.toISOString().slice(0, 10),
          _dateTH: created.toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short",
          }),
        };
      });

      if (mounted) setRAW_ALERTS(prepared);
      setLoading(false);    
    };

    fetchdta();
    return () => {
      mounted = false;
    };
  }, []);

  const deviceOptions = useMemo(() => {
    return Array.from(
      new Set(
        RAW_ALERTS.map(
          (a) => a.device_registrations?.Device?.device_code
        ).filter(Boolean)
      )
    );
  }, [RAW_ALERTS]);

  const filteredAlerts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return RAW_ALERTS.filter((a) => {
      if (search && !a._search?.includes(search)) return false;
      if (selectedDevice !== "all" && a._device !== selectedDevice)
        return false;
      return true;
    });
  }, [RAW_ALERTS, searchTerm, selectedDevice]);

  const frequencyData = useMemo(() => {
    const map = new Map();

    for (const a of filteredAlerts) {
      map.set(a._dateKey, (map.get(a._dateKey) || 0) + 1);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => {
        const sample = filteredAlerts.find((a) => a._dateKey === key);
        return {
          date: sample?._dateTH || key,
          count,
        };
      });
  }, [filteredAlerts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDevice]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAlerts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex h-screen bg-slate-50 text-slate-600  overflow-hidden">
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeMenu="notification"
      />

      <div className="flex flex-1 flex-col relative z-0">
        <AdminHeader setSidebarOpen={setSidebarOpen} />


   {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
            <Loader2 className="animate-spin text-green-600" size={48} />
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  ประวัติการแจ้งเตือนในระบบ
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  ตรวจสอบประวัติการแจ้งเตือน
                </p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 shadow-sm text-slate-700">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* 1. Filter Controls */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
                    <Filter className="w-4 h-4 text-indigo-500" /> ตัวกรองข้อมูล
                  </div>

                  <div className="space-y-4">
                    {/* Device Select */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block uppercase">
                        อุปกรณ์ (Device)
                      </label>
                      <select
                        value={selectedDevice}
                        onChange={(e) => setSelectedDevice(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all"
                      >
                        <option value="all">ทั้งหมด (All Devices)</option>
                        {deviceOptions.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Clear Filter */}
                    {selectedDevice !== "all" && (
                      <button
                        onClick={() => setSelectedDevice("all")}
                        className="w-full py-2 flex items-center justify-center gap-2 text-red-500 text-sm hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <XCircle className="w-4 h-4" /> ล้างตัวกรอง
                      </button>
                    )}
                  </div>
                </div>

                {/* Summary Mini Card */}
                <div className="bg-green-600 p-5 rounded-3xl shadow-lg text-white">
                  <p className="text-green-200 text-xs font-medium uppercase mb-1">
                    ผลการค้นหา
                  </p>
                  <h3 className="text-3xl font-bold">
                    {filteredAlerts.length}
                  </h3>
                  <p className="text-sm text-green-100 mt-1">รายการแจ้งเตือน</p>
                </div>
              </div>

              {/* 2. Frequency Chart (Dynamic) */}
              <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    ความถี่การแจ้งเตือน (Timeline)
                  </h3>
                  <div className="text-xs text-slate-400">
                    ข้อมูลตามตัวกรองที่เลือก
                  </div>
                </div>
                <div className="h-[250px] w-full">
                  {frequencyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={frequencyData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorCount"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#6366f1"
                              stopOpacity={0.2}
                            />
                            <stop
                              offset="95%"
                              stopColor="#6366f1"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="date"
                          stroke="#94a3b8"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          dy={10}
                        />
                        <YAxis
                          stroke="#94a3b8"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                          }}
                          cursor={{ stroke: "#6366f1", strokeWidth: 1 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#6366f1"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorCount)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                      <Search className="w-10 h-10 mb-2 opacity-20" />
                      <p>ไม่มีข้อมูลสำหรับช่วงเวลานี้</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* --- TABLE CONTAINER --- */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[500px]">
              {/* Header Table */}
              <div className="p-5 border-b border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="font-bold text-slate-700 text-lg">
                  รายละเอียด (Details)
                </h3>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ค้นหาเพิ่มเติม..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/80 border-b border-slate-100">
                    <tr className="text-slate-500 text-xs uppercase font-semibold tracking-wider">
                      <th className="px-6 py-4 w-48">Timestamp</th>
                      <th className="px-6 py-4">Message</th>
                      <th className="px-6 py-4 w-40">Device Code</th>
                      <th className="px-6 py-4 w-48">Account</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                    {currentItems.map((alert, index) => (
                      <tr
                        key={alert.logs_alert_ID || index}
                        className="hover:bg-indigo-50/30 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 opacity-60" />
                            {formatDate(alert.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-700">
                            <span className="font-medium truncate">
                              {alert.alert_message}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Smartphone className="w-4 h-4 text-slate-400" />
                            <span className="font-mono">
                              {alert.device_registrations.Device.device_code}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 text-xs font-bold">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-700 text-xs">
                                {alert.device_registrations.Account.first_name}{" "}
                                {alert.device_registrations.Account.last_name}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {currentItems.length === 0 && (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-6 py-16 text-center text-slate-400"
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Bell className="w-8 h-8 opacity-20" />
                            <p>ไม่พบข้อมูลตามเงื่อนไข</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-4">
                <div className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-medium text-slate-700">
                    {indexOfFirstItem + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-slate-700">
                    {Math.min(indexOfLastItem, filteredAlerts.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-slate-700">
                    {filteredAlerts.length}
                  </span>{" "}
                  entries
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <div className="px-2 text-sm font-medium text-slate-700">
                    Page {currentPage} / {totalPages || 1}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      <Footer />
      </div>
    </div>
  );
}
