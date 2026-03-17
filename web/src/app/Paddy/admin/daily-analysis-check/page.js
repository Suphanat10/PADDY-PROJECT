"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  AlertCircle,
  Cpu,
  RefreshCw,
  Loader2,
  Timer,
  ListChecks,
  XCircle,
  Pause,
  History,
  Filter,
  Calendar,
  Camera,
  ChevronDown,
} from "lucide-react";
import { AdminSidebar, AdminHeader } from "../../../components/admin/AdminLayout";
import Footer from "@/app/components/Footer";
import { API_BASE } from "@/lib/api";
import Swal from "sweetalert2";
import { apiFetch } from "../../../../lib/api";

const HistorySummaryCard = ({ data }) => {
  const dailySummary = data.find((d) => d.level === "daily") || {};
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
          <ListChecks className="w-5 h-5" />
          อุปกรณ์ทั้งหมด
        </div>
        <p className="text-3xl font-bold text-slate-800">{dailySummary.total_devices || 0}</p>
      </div>
      <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm">
        <div className="flex items-center gap-2 text-amber-600 text-sm mb-2">
          <Clock className="w-5 h-5" />
          ออกคำสั่งวิเคราะห์แล้ว (เข้าคิว)
        </div>
        <p className="text-3xl font-bold text-amber-600">{dailySummary.queued || 0}</p>
      </div>
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
          <Pause className="w-5 h-5" />
          ยังไม่ถึงกำหนด
        </div>
        <p className="text-3xl font-bold text-slate-600">{dailySummary.not_due || 0}</p>
      </div>
      <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
        <div className="flex items-center gap-2 text-blue-600 text-sm mb-2">
          <AlertCircle className="w-5 h-5" />
          ไม่เคยวิเคราะห์
        </div>
        <p className="text-3xl font-bold text-blue-600">{dailySummary.never_analyzed || 0}</p>
      </div>
      <div className="bg-white rounded-xl p-4 border border-red-200 shadow-sm">
        <div className="flex items-center gap-2 text-red-500 text-sm mb-2">
          <XCircle className="w-5 h-5" />
          ข้อผิดพลาด
        </div>
        <p className="text-3xl font-bold text-red-600">{dailySummary.errors || 0}</p>
      </div>
    </div>
  );
};

export default function DailyAnalysisCheckPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // History state (API)
  const [historyData, setHistoryData] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [farms, setFarms] = useState([]);
  const [subAreas, setSubAreas] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState("");
  const [selectedSubArea, setSelectedSubArea] = useState("");
  const [expandedDates, setExpandedDates] = useState({});
  const [capturingDevice, setCapturingDevice] = useState(null);

  // Toggle date expansion
  const toggleDateExpand = (logDate) => {
    setExpandedDates(prev => ({
      ...prev,
      [logDate]: !prev[logDate]
    }));
  };

  // Fetch history data from API
  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const url = `${API_BASE}/api/scheduler-summary`;
      const response = await fetch(url, {
        credentials: "include",
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setHistoryData(result.data || []);
          
          // Extract unique farms and areas for filters
          const uniqueFarms = [...new Set(result.data.filter((d) => d.farm_name).map((d) => d.farm_name))];
          const uniqueAreas = [...new Set(result.data.filter((d) => d.area_name).map((d) => d.area_name))];
          
          setFarms(uniqueFarms);
          setSubAreas(uniqueAreas);
        }
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Get filtered data based on selected filters
  const getFilteredData = useCallback(() => {
    return historyData.filter((d) => {
      if (selectedFarm && d.farm_name && d.farm_name !== selectedFarm) return false;
      if (selectedSubArea && d.area_name && d.area_name !== selectedSubArea) return false;
      return true;
    });
  }, [historyData, selectedFarm, selectedSubArea]);

  // Get filtered sub-areas based on selected farm
  const filteredSubAreas = selectedFarm
    ? [...new Set(historyData.filter((d) => d.farm_name === selectedFarm && d.area_name).map((d) => d.area_name))]
    : subAreas;

  // Handle capture device photo
  const handleCaptureDevice = useCallback(async (deviceCode) => {
    if (capturingDevice === deviceCode) return; // Prevent double click
    
    const result = await Swal.fire({
      title: `ส่งคำสั่งถ่ายรูปไปยัง ${deviceCode}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก"
    });

    if (!result.isConfirmed) return;

    setCapturingDevice(deviceCode);
    try {
      const response = await apiFetch(`/api/admin/devices/capture`, {
        method: "POST",
        body: {
          device_code: deviceCode
        }
      });
      const data = response.data;

      if (response.ok && data.success) {
        Swal.fire({
          title: "สำเร็จ",
          text: `คำสั่งถ่ายรูปถูกส่งไปยัง ${deviceCode} แล้ว`,
          icon: "success"
        });
      } else {
        throw new Error(data?.message || "ไม่สามารถส่งคำสั่งถ่ายรูปได้");
      }
       
    } catch (err) {
      Swal.fire({
        title: "ผิดพลาด",
        text: `ไม่สามารถส่งคำสั่งถ่ายรูปไปยัง ${deviceCode} ได้`,
        icon: "error"
      });
    } finally {
      setCapturingDevice(null);
    }
  }, [capturingDevice]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeMenu="DailyAnalysisCheck"
        setActiveMenu={() => {}}
      />

      <div className="flex flex-1 flex-col">
        <AdminHeader setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <History className="w-7 h-7 text-emerald-600" />
                    ตรวจสอบการวิเคราะห์ประจำวัน
                  </h1>
                  <p className="text-slate-500 mt-1">
                    แสดงประวัติและสถานะการวิเคราะห์การเจริญเติบโต
                  </p>
                </div>
                <button
                  onClick={() => fetchHistory()}
                  disabled={isLoadingHistory}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingHistory ? "animate-spin" : ""}`} />
                  รีเฟรช
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-slate-500" />
                <span className="font-medium text-slate-700">ตัวกรองข้อมูล</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                      <label className="block text-sm text-slate-600 mb-1">ฟาร์ม</label>
                      <select
                        value={selectedFarm}
                        onChange={(e) => {
                          setSelectedFarm(e.target.value);
                          setSelectedSubArea(""); // Reset sub-area when farm changes
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="">ทั้งหมด</option>
                        {farms.map((farm) => (
                          <option key={farm} value={farm}>{farm}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">พื้นที่ย่อย</label>
                      <select
                        value={selectedSubArea}
                        onChange={(e) => {
                          setSelectedSubArea(e.target.value);
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="">ทั้งหมด</option>
                        {filteredSubAreas.map((area) => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedFarm("");
                          setSelectedSubArea("");
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        ล้างตัวกรอง
                      </button>
                      <button
                        onClick={fetchHistory}
                        disabled={isLoadingHistory}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${isLoadingHistory ? "animate-spin" : ""}`} />
                        รีเฟรช
                      </button>
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                {getFilteredData().length > 0 && <HistorySummaryCard data={getFilteredData()} />}

                {/* History List - Grouped by Date */}
                <div className="space-y-4">
                  {isLoadingHistory ? (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12">
                      <div className="text-center text-slate-400">
                        <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin text-emerald-500" />
                        <p>กำลังโหลดข้อมูล...</p>
                      </div>
                    </div>
                  ) : getFilteredData().length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12">
                      <div className="text-center text-slate-400">
                        <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>ไม่พบข้อมูลประวัติการรายงาน</p>
                      </div>
                    </div>
                  ) : (
                    // Group by date
                    [...new Set(getFilteredData().map(d => d.log_date))].map((logDate) => {
                      const filteredData = getFilteredData();
                      const dailySummary = filteredData.find(d => d.level === "daily" && d.log_date === logDate);
                      const rawDevices = filteredData.filter(d => d.level === "device" && d.log_date === logDate);
                      
                      // Deduplicate devices by device_code and aggregate statuses
                      const deviceMap = {};
                      rawDevices.forEach(d => {
                        if (!deviceMap[d.device_code]) {
                          deviceMap[d.device_code] = {
                            device_code: d.device_code,
                            farm_name: d.farm_name,
                            area_name: d.area_name,
                            days_remaining: d.days_remaining,
                            queued: 0,
                            not_due: 0,
                            never_analyzed: 0,
                            errors: 0,
                          };
                        }
                        // Aggregate status counts
                        deviceMap[d.device_code].queued += d.queued || 0;
                        deviceMap[d.device_code].not_due += d.not_due || 0;
                        deviceMap[d.device_code].never_analyzed += d.never_analyzed || 0;
                        deviceMap[d.device_code].errors += d.errors || 0;
                        // Keep the highest days_remaining (for not_due status)
                        if (d.days_remaining !== null && d.days_remaining !== undefined) {
                          const current = deviceMap[d.device_code].days_remaining;
                          if (current === null || current === undefined || d.days_remaining > current) {
                            deviceMap[d.device_code].days_remaining = d.days_remaining;
                          }
                        }
                      });
                      const devices = Object.values(deviceMap);
                      
                      const isExpanded = expandedDates[logDate] !== false; // Default expanded
                      
                      return (
                        <div key={logDate} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                          {/* Date Header - Clickable */}
                          <button
                            onClick={() => toggleDateExpand(logDate)}
                            className="w-full bg-gradient-to-r from-slate-50 to-white px-4 py-4 border-b border-slate-200 hover:from-slate-100 hover:to-slate-50 transition-colors"
                          >
                            <div className="flex items-center justify-between flex-wrap gap-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100">
                                  <Calendar className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="text-left">
                                  <h3 className="font-semibold text-slate-800">{logDate}</h3>
                                  <p className="text-sm text-slate-500">
                                    {devices.length} อุปกรณ์
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                {/* Daily Summary Stats */}
                                {dailySummary && (
                                  <div className="flex items-center gap-3 text-sm">
                                    <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg">
                                      <ListChecks className="w-4 h-4 text-slate-400" />
                                      <span className="font-semibold text-slate-800">{dailySummary.total_devices}</span>
                                    </div>
                                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-lg">
                                      <Clock className="w-4 h-4 text-amber-500" />
                                      <span className="text-amber-600 font-semibold">{dailySummary.queued}</span>
                                    </div>
                                    <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg">
                                      <Pause className="w-4 h-4 text-slate-400" />
                                      <span className="text-slate-600 font-semibold">{dailySummary.not_due}</span>
                                    </div>
                                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-lg">
                                      <AlertCircle className="w-4 h-4 text-blue-500" />
                                      <span className="text-blue-600 font-semibold">{dailySummary.never_analyzed}</span>
                                    </div>
                                    {dailySummary.errors > 0 && (
                                      <div className="flex items-center gap-1 px-2 py-1 bg-red-50 rounded-lg">
                                        <XCircle className="w-4 h-4 text-red-500" />
                                        <span className="text-red-600 font-semibold">{dailySummary.errors}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* Expand/Collapse Icon */}
                                <ChevronDown 
                                  className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                                />
                              </div>
                            </div>
                          </button>
                          
                          {/* Device List - Collapsible */}
                          {isExpanded && (
                            <div className="p-4">
                              {devices.length === 0 ? (
                                <p className="text-center text-slate-400 py-4">ไม่มีข้อมูลอุปกรณ์</p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                  {devices.map((device, idx) => (
                                    <div 
                                      key={idx} 
                                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 hover:shadow-sm transition-all group"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-white border border-slate-200 group-hover:border-emerald-200 transition-colors">
                                          <Cpu className="w-4 h-4 text-slate-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-mono font-bold text-slate-800 text-sm">{device.device_code}</span>
                                            {device.queued > 0 && (
                                              <span className="px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded">
                                                ออกคำสั่งแล้ว
                                              </span>
                                            )}
                                            {device.not_due > 0 && (
                                              <span className="px-1.5 py-0.5 text-xs font-medium bg-slate-200 text-slate-600 rounded">
                                                ยังไม่ถึง
                                              </span>
                                            )}
                                            {device.never_analyzed > 0 && (
                                              <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                                                ใหม่
                                              </span>
                                            )}
                                            {device.errors > 0 && (
                                              <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                                                ผิดพลาด
                                              </span>
                                            )}
                                          </div>
                                          <div className="mt-0.5 text-xs text-slate-500 truncate">
                                            {device.farm_name || device.area_name ? (
                                              <>
                                                {device.farm_name}
                                                {device.farm_name && device.area_name && " • "}
                                                {device.area_name}
                                              </>
                                            ) : (
                                              <span className="text-slate-400">ไม่ระบุฟาร์ม</span>
                                            )}
                                          </div>
                                      

                                          {device.days_remaining !== null && device.days_remaining !== undefined && (
  <div
    className={`mt-1 flex items-center gap-1 text-xs ${
      device.days_remaining <= 0
        ? "text-emerald-600 font-medium"
        : "text-slate-500"
    }`}
  >
    <Timer className="w-3 h-3" />

    {device.status === "never_analyzed" ? (
      <span>ยังไม่เคยวิเคราะห์</span>

    ) : device.status === "queued" ? (
      <span>กำลังเข้าคิววิเคราะห์</span>

    ) : device.status === "checking" ? (
      <span>กำลังตรวจสอบ</span>

    ) : device.days_remaining <= 0 ? (
      <span>ถึงกำหนดแล้ว</span>

    ) : (
      <span>อีก {device.days_remaining} วัน</span>
    )}
  </div>
)}
                                        </div>
                                        
                                        {/* Capture Button */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCaptureDevice(device.device_code);
                                          }}
                                          disabled={capturingDevice === device.device_code}
                                          className={`p-2 rounded-lg transition-colors shrink-0 ${
                                            capturingDevice === device.device_code 
                                              ? "bg-slate-400 text-white cursor-not-allowed" 
                                              : "bg-emerald-600 text-white hover:bg-emerald-700"
                                          }`}
                                          title="ถ่ายรูป"
                                        >
                                          {capturingDevice === device.device_code ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                          ) : (
                                            <Camera className="w-4 h-4" />
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
          </div>
        </main>

        <Footer />
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
