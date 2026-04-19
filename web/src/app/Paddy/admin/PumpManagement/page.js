"use client";

import React, { useState, useMemo , useEffect } from "react";
import Swal from "sweetalert2";
import {
  Droplets,
  Power,
  User,
  MapPin,
  Search,
  Zap,
  Activity,
  ToggleLeft,
  ToggleRight,
  Filter,
  LayoutGrid,
  List
} from "lucide-react";
import { AdminSidebar, AdminHeader } from "../../../components/admin/AdminLayout";
import Footer from "@/app/components/Footer";
import { apiFetch } from "@/lib/api";

export default function PumpManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("PumpManagement");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("table"); 
  const [pumps, setPumps] = useState([]);
  const [loadingPumps, setLoadingPumps] = useState(new Set());

        useEffect(() => {
            const fetchPumps = async () => {
                try {
                    const res = await apiFetch('/api/admin/data/PumpSystem');
                    if (!res.ok || !res.data || res.data.length === 0) {
                      setPumps([]);
                      return;
                    }
                    // Flatten pump data from areas structure
                    const flatPumps = [];
                    res.data.forEach(area => {
                      if (area.pumps && Array.isArray(area.pumps)) {
                        area.pumps.forEach(pump => {
                          flatPumps.push({
                            ...pump,
                            Area: { area_id: area.area_id, area_name: area.area_name },
                            owner: area.owner || {}
                          });
                        });
                      }
                    });
                    setPumps(flatPumps);
                } catch (error) {
                    setPumps([]);
                    console.error('Error fetching pumps:', error);
                }
              };
              fetchPumps();
        }, []);


 
  const stats = useMemo(() => {
    return {
      total: pumps.length,
      on: pumps.filter(p => p.pump_status === "ON").length,
      off: pumps.filter(p => p.pump_status === "OFF").length,
    };
  }, [pumps]);

  // --- การกรองข้อมูล ---
  const filteredPumps = pumps.filter(pump => {
    const searchLower = searchQuery.toLowerCase();
    const pumpName = (pump.pump_name || "").toLowerCase();
    const areaName = (pump.Area?.area_name || "").toLowerCase();
    const ownerName = `${pump.owner?.first_name || ""} ${pump.owner?.last_name || ""}`.toLowerCase();
    return (
      pumpName.includes(searchLower) ||
      areaName.includes(searchLower) ||
      ownerName.includes(searchLower)
    );
  });

  const handleTogglePump = async (id, currentStatus) => {
    const newStatus = currentStatus === "ON" ? "OFF" : "ON";
    const previousPumps = pumps;
    
    // Optimistic update
    setLoadingPumps(prev => new Set(prev).add(id));
    setPumps(prev => prev.map(p =>
      p.pump_id === id ? { ...p, pump_status: newStatus } : p
    ));

    try {
      const res = await apiFetch('/api/admin/on_off_pump', {
        method: 'POST',
        body: {
          pump_ID: id,
          command: newStatus
        }
      });

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ',
          text: `ปั๊ม ${newStatus === "ON" ? "เปิด" : "ปิด"} สำเร็จ`,
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        // Revert optimistic update on error
        setPumps(previousPumps);
        Swal.fire({
          icon: 'error',
          title: 'ผิดพลาด',
          text: 'ไม่สามารถเปลี่ยนสถานะปั๊มได้ กรุณาลองใหม่'
        });
        console.error('Failed to update pump status:', res);
      }
    } catch (error) {
      // Revert optimistic update on error
      setPumps(previousPumps);
      Swal.fire({
        icon: 'error',
        title: 'ข้อผิดพลาด',
        text: 'เกิดข้อผิดพลาด กรุณาลองใหม่'
      });
      console.error('Error toggling pump:', error);
    } finally {
      setLoadingPumps(prev => {
        const updated = new Set(prev);
        updated.delete(id);
        return updated;
      });
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-600 overflow-hidden">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu={activeMenu} />

      <div className="flex flex-1 flex-col relative z-0">
        <AdminHeader setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
          
          {/* Section 1: Header & Search & View Toggle */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">จัดการปั๊มน้ำ</h2>
              <p className="text-slate-500 text-sm">ควบคุมและติดตามสถานะปั๊มน้ำรายพื้นที่</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* View Switcher */}
              <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อปั๊ม, พื้นที่..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard title="ปั๊มทั้งหมด" value={stats.total} icon={<Activity />} color="slate" />
            <SummaryCard title="กำลังทำงาน (ON)" value={stats.on} icon={<ToggleRight />} color="green" />
            <SummaryCard title="ปิดการใช้งาน (OFF)" value={stats.off} icon={<ToggleLeft />} color="red" />
          </div>

          {/* Section 3: Data Display */}
          {filteredPumps.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPumps.map((pump) => (
                  <PumpCard key={pump.pump_id} pump={pump} onToggle={handleTogglePump} isLoading={loadingPumps.has(pump.pump_id)} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">สถานะ</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ชื่อปั๊ม </th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">พื้นที่</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">เจ้าของ</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">ควบคุม</th>
                                              

                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPumps.map((pump) => (
                        <tr key={pump.pump_id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              pump.pump_status === "ON" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${pump.pump_status === "ON" ? "bg-green-500 animate-pulse" : "bg-slate-400"}`}></span>
                              {pump.pump_status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">{pump.pump_name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                              {pump.Area?.area_name || "รอการลงทะเบียน"}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              {((pump.owner?.first_name || "").trim() + " " + (pump.owner?.last_name || "").trim()).trim()} 
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              <button
                                onClick={() => handleTogglePump(pump.pump_id, pump.pump_status)}
                                disabled={loadingPumps.has(pump.pump_id)}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                                  pump.pump_status === "ON" ? "bg-green-500" : "bg-slate-300"
                                } ${loadingPumps.has(pump.pump_id) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                              >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                                  pump.pump_status === "ON" ? "translate-x-6" : "translate-x-1"
                                }`} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            <EmptyState />
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, color }) {
  const colorMap = {
    slate: "bg-slate-50 text-slate-600 border-slate-200",
    green: "bg-green-50 text-green-600 border-green-100 border-l-green-500",
    red: "bg-red-50 text-red-600 border-red-100 border-l-red-500"
  };
  
  return (
    <div className={`bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4 ${color === 'slate' ? '' : 'border-l-4'} ${colorMap[color]}`}>
      <div className={`p-3 rounded-lg ${colorMap[color].split(' ')[0]}`}>{React.cloneElement(icon, { className: "w-6 h-6" })}</div>
      <div>
        <p className={`text-xs font-bold uppercase ${color === 'slate' ? 'text-slate-500' : ''}`}>{title}</p>
        <h3 className="text-xl font-black">{value} เครื่อง</h3>
      </div>
    </div>
  );
}

function PumpCard({ pump, onToggle, isLoading }) {
  return (
    <div className={`bg-white rounded-2xl border-2 transition-all duration-300 shadow-sm overflow-hidden ${
      pump.pump_status === "ON" ? "border-green-500 ring-4 ring-green-50" : "border-slate-100 hover:border-slate-300"
    }`}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${pump.pump_status === "ON" ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"}`}>
            <Power className="w-6 h-6" />
          </div>
          <button
            onClick={() => onToggle(pump.pump_id, pump.pump_status)}
            disabled={isLoading}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              pump.pump_status === "ON" ? "bg-green-500" : "bg-slate-300"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              pump.pump_status === "ON" ? "translate-x-7" : "translate-x-1"
            }`} />
          </button>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">{pump.pump_name}</h3>
        <div className="space-y-3 pt-2 border-t border-slate-50">
          <div className="flex items-center gap-3 text-sm font-semibold"><MapPin className="w-4 h-4 text-indigo-500" />{pump.Area?.area_name || "รอการลงทะเบียน"}</div>
          <div className="flex items-center gap-3 text-sm text-slate-600"><User className="w-4 h-4 text-slate-400" />{((pump.owner?.first_name || "").trim() + " " + (pump.owner?.last_name || "").trim()).trim()}</div>
        </div>
      </div>
      <div className={`px-5 py-3 text-xs font-black uppercase flex items-center justify-between ${
        pump.pump_status === "ON" ? "bg-green-50 text-green-700" : "bg-slate-50 text-slate-500"
      }`}>
        <span>STATUS: {pump.pump_status}</span>
        {pump.pump_status === "ON" && <Zap className="w-3 h-3 animate-pulse" />}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
      <Filter className="w-12 h-12 text-slate-200 mb-4" />
      <p className="text-slate-500 font-medium">ไม่พบปั๊มน้ำที่ตรงกับเงื่อนไขการค้นหา</p>
    </div>
  );
}