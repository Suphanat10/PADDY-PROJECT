"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Search,
  Monitor,
  Download,
  Calendar,
  User,
  Shield,
  BarChart3,
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  FileText,
  Loader2,
} from "lucide-react";
import {
  AdminSidebar,
  AdminHeader,
} from "../../../components/admin/AdminLayout";
import { apiFetch } from "@/lib/api";
import Footer from "@/app/components/Footer";

const UserStatsModal = ({ isOpen, onClose, user, logs }) => {
  if (!isOpen || !user) return null;

  const statsData = useMemo(() => {
    if (!user) return [];

    const userLogs = logsByUser.get(user.id) || [];
    const counts = new Map();

    for (const log of userLogs) {
      const action = log.action.replace(/_/g, " ");
      counts.set(action, (counts.get(action) || 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count); // O(k log k)
  }, [user, logsByUser]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">สถิติการใช้งาน</h3>
            <p className="text-sm text-slate-500">{user.name} </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statsData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  fontSize={12}
                  allowDecimals={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={140}
                  stroke="#475569"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#6366f1"
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                >
                  {statsData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        ["#4f46e5", "#8b5cf6", "#ec4899", "#f43f5e"][index % 4]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SystemLogsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [Loading, setLoading] = useState(false);
  const itemsPerPage = 6;
  const [Data_logs, setData_logs] = useState([]);

  useEffect(() => {
    setLoading(true);
    const fetchDataLogs = async () => {
      const response = await apiFetch("/api/admin/log", { method: "GET" });
      if (!response.ok) {
        setLoading(false);
        setData_logs([]);
        return;
      }
      const data = response.data      
      setData_logs(data);
      setLoading(false);
    };
    fetchDataLogs();
  }, []);

  const activityData = useMemo(() => {
    if (!Data_logs || Data_logs.length === 0) return [];

    const counts = new Map();

    for (let i = 0; i < Data_logs.length; i++) {
      const dateKey = Data_logs[i].created_at.slice(0, 10); // YYYY-MM-DD
      counts.set(dateKey, (counts.get(dateKey) || 0) + 1);
    }

    const formatter = new Intl.DateTimeFormat("th-TH", {
      day: "numeric",
      month: "short",
    });

    return Array.from(counts.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, count]) => ({
        date: formatter.format(new Date(date)),
        count,
        fullDate: date,
      }));
  }, [Data_logs]);

  const filteredLogs = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();

    return Data_logs.filter(
      (log) =>
        log.action.toLowerCase().includes(searchLower) ||
        log.Account.first_name.toLowerCase().includes(searchLower) ||
        log.Account.last_name.toLowerCase().includes(searchLower) ||
        log.ip_address.includes(searchLower)
    );
  }, [Data_logs, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getActionStyle = (action) => {
    if (action.includes("login") || action.includes("create_account"))
      return "bg-green-50 text-green-700 border-green-200";
    if (action.includes("create"))
      return "bg-purple-50 text-purple-700 border-purple-200";
    if (action.includes("update"))
      return "bg-orange-50 text-orange-700 border-orange-200";
    if (action.includes("register"))
      return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

if (Loading) {
    return (
      <div className="flex h-screen bg-slate-50 text-slate-600  overflow-hidden">
        <AdminSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeMenu="ActivityLog"
        />
        <div className="flex flex-1 flex-col relative z-0">
          <AdminHeader setSidebarOpen={setSidebarOpen} />

          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6 flex items-center justify-center h-[calc(100vh-200px)]">
              <Loader2 className="animate-spin text-green-600" size={48} />
            </div>
          </main>
        </div>
      </div>
    );
  }
  

  return (
    <div className="flex h-screen bg-slate-50 text-slate-600  overflow-hidden">
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeMenu="ActivityLog"
      />

      <div className="flex flex-1 flex-col relative z-0">
        <AdminHeader setSidebarOpen={setSidebarOpen} />

        {/* {Loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
            <Loader2 className="animate-spin text-green-600" size={48} />
          </div>
        )} */}

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  ประวัติการใช้งานระบบ
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  ประวัติการใช้งานและกิจกรรมในระบบ
                </p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 shadow-sm transition-colors">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>

            {/* --- TOP SECTION: Stats & Chart --- */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* 1. Summary Box (Total Logs) */}
              <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-green-50 rounded-2xl text-green-600">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                      Total Logs
                    </span>
                  </div>
                  <h3 className="text-4xl font-bold text-slate-800">
                    {Data_logs.length.toLocaleString()}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2">
                    รายการบันทึกทั้งหมดในระบบ
                  </p>
                </div>
                {/* Background Decoration */}
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl"></div>
              </div>

              {/* 2. Activity Chart (Daily Frequency) */}
              <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                    {/* <Activity className="w-5 h-5 text-indigo-500" /> */}
                    ปริมาณการใช้งานรายวัน
                  </h3>
                </div>
                <div className="h-[180px] w-full">
                  {activityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={activityData}
                        margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
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
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                          }}
                          cursor={{
                            stroke: "#6366f1",
                            strokeWidth: 1,
                            strokeDasharray: "4 4",
                          }}
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
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm text-slate-400">
                        ไม่มีข้อมูลกิจกรรม
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* --- Table Container --- */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[calc(100vh-450px)] min-h-[400px]">
              {/* Search Bar */}
              <div className="p-5 border-b border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="font-bold text-slate-700 flex items-center gap-2 text-lg">
                  <Monitor className="w-5 h-5 text-slate-400" /> รายการบันทึก
                </h3>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ค้นหา..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Table Area */}
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-sm z-10 shadow-sm border-b border-slate-100">
                    <tr className="text-slate-500 text-xs uppercase font-semibold tracking-wider">
                      <th className="px-6 py-4">ลำดับ</th>

                      <th className="px-6 py-4 w-48">Time</th>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Action</th>
                      <th className="px-6 py-4">IP Address</th>
                      <th className="px-6 py-4 w-24 text-center">Stats</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                    {currentLogs.map((log, index) => (
                      <tr
                        key={log.logs_ID}
                        className="hover:bg-indigo-50/30 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                          {indexOfFirstItem + index + 1}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 opacity-60" />
                            {formatDate(log.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 font-bold text-xs shadow-sm">
                              {log.Account.first_name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-700">
                                {log.Account.first_name} {log.Account.last_name}
                              </p>
                              {/* <p className="text-[10px] text-slate-400 font-mono">ID: {log.user_ID}</p> */}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${getActionStyle(
                              log.action
                            )}`}
                          >
                            {log.action.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                          {log.ip_address}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() =>
                              setSelectedUser({
                                id: log.user_ID,
                                name: `${log.Account.first_name} ${log.Account.last_name}`,
                              })
                            }
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="View User Stats"
                          >
                            <BarChart3 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {currentLogs.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-12 text-center text-slate-400"
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Search className="w-8 h-8 opacity-20" />
                            <p>ไม่พบข้อมูลที่ค้นหา</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-4">
                <div className="text-sm text-slate-500">
                  แสดง{" "}
                  <span className="font-medium text-slate-700">
                    {indexOfFirstItem + 1}
                  </span>{" "}
                  ถึง{" "}
                  <span className="font-medium text-slate-700">
                    {Math.min(indexOfLastItem, filteredLogs.length)}
                  </span>{" "}
                  จากทั้งหมด{" "}
                  <span className="font-medium text-slate-700">
                    {filteredLogs.length}
                  </span>{" "}
                  รายการ
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>

                  <div className="flex items-center gap-1 px-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5 && currentPage > 3) {
                        pageNum = currentPage - 2 + i;
                        if (pageNum > totalPages) return null;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors
                                            ${
                                              currentPage === pageNum
                                                ? "bg-green-600 text-white shadow-sm"
                                                : "text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200"
                                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
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
          <Footer />
        </main>

        <UserStatsModal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          user={selectedUser}
          logs={Data_logs}
        />
      </div>
    </div>
  );
}
