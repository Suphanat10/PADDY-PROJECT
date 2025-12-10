"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  Clock,
  Monitor,
  Smartphone,
  Globe,
  ShieldCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Download,
  Activity,
  BarChart2,
  Menu,
  Bell,
  User,
} from "lucide-react";

import Header from "../components/Header";
import { getDataHistory } from "@/lib/activity/getDtatahistory";
import Footer from "@/app/components/Footer";

export default function SystemAccessLog() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    function fetchData() {
      getDataHistory(setIsLoading, setLogs);
    }
    fetchData();
  }, []);


  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const ipMatch = (log.ip_address || "").toLowerCase().includes(term);
    const actionMatch = (log.action || "").toLowerCase().includes(term);
    const deviceMatch = (log.device || "").toLowerCase().includes(term);
    return ipMatch || actionMatch || deviceMatch;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const currentLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (isoString) => {
    if (!isoString) return "-";

    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    return new Intl.DateTimeFormat("th-TH", {
      dateStyle: "medium",
      timeStyle: "medium",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 pb-12">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="font-bold text-gray-800 text-lg">
              ประวัติการเข้าใช้งานทั้งหมด
            </h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0 w-full sm:w-64">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="ค้นหา IP, กิจกรรม..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                />
              </div>
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap">
                <Filter size={16} />{" "}
                <span className="hidden sm:inline">กรอง</span>
              </button>
              {/* ลบปุ่ม Export ออกตามคำขอ */}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                  <th className="px-6 py-4">เวลา (Date/Time)</th>
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4">กิจกรรม (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-28"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredLogs.length > 0 ? (
                  currentLogs.map((log, index) => (
                    <tr
                      key={log.logs_ID || index}
                      className="hover:bg-gray-50/80 transition-colors text-sm text-gray-700"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {formatDate(log.created_at || log.timestamp)}
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-600">
                        {log.ip_address}
                      </td>

                      <td className="px-6 py-4 text-gray-500">
                        {log.action || log.location || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      ไม่พบข้อมูลที่ค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && filteredLogs.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500">
                แสดง{" "}
                <span className="font-medium text-gray-900">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                ถึง{" "}
                <span className="font-medium text-gray-900">
                  {Math.min(currentPage * itemsPerPage, filteredLogs.length)}
                </span>{" "}
                จาก{" "}
                <span className="font-medium text-gray-900">
                  {filteredLogs.length}
                </span>{" "}
                รายการ
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>

                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3)
                    pageNum = currentPage - 2 + i;
                  if (pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
