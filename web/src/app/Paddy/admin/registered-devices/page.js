"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

import {
  Users,
  Cpu,
  Layers,
  AlertTriangle,
  Search,
  MapPin,
  Calendar,
  Smartphone,
  MoreVertical,
  CheckCircle,
  Filter,
  Computer,
  Eye,
  Loader2,
  FileText,
  Activity,
  ArrowRightLeft,
} from "lucide-react";

import {
  AdminSidebar,
  AdminHeader,
} from "../../../components/admin/AdminLayout";
import { fetchDeviceRegistrations } from "@/lib/admin/deviceRegistrations/deviceRegistrations.api";
import Footer from "@/app/components/Footer";

export default function RegistrationListPage() {
  // State สำหรับจัดการ Sidebar และ Menu
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("registered-devices");

  // State สำหรับข้อมูลและการค้นหา
  const [searchTerm, setSearchTerm] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // คำนวณข้อมูลสรุป (Stats)
  const totalRegistrations = registrations.length;
  const activeRegistrations = registrations.filter(
    (r) => r.status === "active"
  ).length;
  const inactiveRegistrations = totalRegistrations - activeRegistrations;

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchDeviceRegistrations();
        if (isMounted) {
          setRegistrations(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredRegistrations = registrations.filter(
    (reg) =>
      reg.Device.device_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.Account.first_name.includes(searchTerm) ||
      reg.Account.last_name.includes(searchTerm) ||
      reg.Area.Farm.farm_name.includes(searchTerm)
  );

  const handleViewDetails = (id, deviceCode) => {};

  return (
    <div className="flex h-screen bg-slate-50 text-slate-600">
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      <div className="flex flex-1 flex-col overflow-hidden relative">
        <AdminHeader setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 z-0">
          {/* Header Section */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                ข้อมูลการลงทะเบียน
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                รายการจับคู่อุปกรณ์กับผู้ใช้งานและพื้นที่การเกษตร
              </p>
            </div>
          </div>

          {/* Stats Section (สรุปข้อมูล) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <FileText size={24} />
              </div>
              <div>
                <div className="text-sm text-slate-500 font-medium">
                  ลงทะเบียนทั้งหมด
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {loading ? "-" : totalRegistrations}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle size={24} />
              </div>
              <div>
                <div className="text-sm text-slate-500 font-medium">
                  ใช้งานอยู่ (Active)
                </div>
                <div className="text-2xl font-bold text-emerald-600">
                  {loading ? "-" : activeRegistrations}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-slate-50 text-slate-500 rounded-xl">
                <Activity size={24} />
              </div>
              <div>
                <div className="text-sm text-slate-500 font-medium">
                  สถานะอื่นๆ
                </div>
                <div className="text-2xl font-bold text-slate-600">
                  {loading ? "-" : inactiveRegistrations}
                </div>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="space-y-4">
            {/* Search Bar (ย้ายมาไว้เหนือตารางให้ชัดเจนขึ้น) */}
            <div className="flex justify-end">
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, รหัสอุปกรณ์..."
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm shadow-sm transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            {loading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-green-600" size={48} />
              </div>
            )}

            {/* Table Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative min-h-[400px]">
              {/* Loading Overlay */}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                      >
                        อุปกรณ์ (Device)
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                      >
                        เจ้าของ (Owner)
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                      >
                        พื้นที่ติดตั้ง (Location)
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                      >
                        วันที่ลงทะเบียน
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider"
                      >
                        สถานะ
                      </th>
                      <th scope="col" className="relative px-6 py-4 text-right">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          จัดการ
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {filteredRegistrations.length > 0 ? (
                      filteredRegistrations.map((item) => (
                        <tr
                          key={item.device_registrations_ID}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          {/* Device Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100">
                                <Computer size={20} />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-bold text-slate-800">
                                  รหัสอุปกรณ์ : {item.Device.device_code}
                                </div>
                                {/* <div className="text-xs text-slate-500">ID: {item.device_registrations_ID}</div> */}
                              </div>
                            </div>
                          </td>

                          {/* Owner Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center">
                                <Users size={16} />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-slate-700">
                                  {item.Account.first_name}{" "}
                                  {item.Account.last_name}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Location Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center text-sm text-slate-700 font-medium">
                                <MapPin
                                  size={14}
                                  className="mr-1.5 text-red-400"
                                />
                                {item.Area.Farm.farm_name}
                              </div>
                              <div className="text-xs text-slate-500 pl-5">
                                {item.Area.area_name}
                              </div>
                            </div>
                          </td>

                          {/* Date Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-slate-600">
                              <Calendar
                                size={16}
                                className="mr-2 text-slate-400"
                              />
                              {formatDate(item.registered_at)}
                            </div>
                          </td>

                          {/* Status Column */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${
                                item.status === "active"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                            >
                              {item.status === "active" && (
                                <CheckCircle size={12} className="mr-1.5" />
                              )}
                              {item.status}
                            </span>
                          </td>

                          {/* Action Column (เพิ่มปุ่มดูข้อมูล) */}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/Paddy/admin/sensor/${item.Device.device_code}`}
                              >
                                <button
                                  type="button"
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100 shadow-sm"
                                >
                                  <Eye size={16} />
                                  <span>ดูข้อมูล</span>
                                </button>
                              </Link>

                              <Link
                                href={`/Paddy/admin/Move-device-registration/${item.Account.user_ID}/${item.device_registrations_ID}`}
                              >
                                <button
                                  type="button"
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 shadow-sm"
                                >
                                  <ArrowRightLeft size={16} />
                                  <span>ย้ายพื้นที่</span>
                                </button>
                              </Link>

                              {/* 
                              <button className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg">
                                <MoreVertical size={18} />
                              </button> */}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-12 text-center text-slate-400"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <Filter size={48} className="text-slate-200 mb-3" />
                            <p>ไม่พบข้อมูลที่ค้นหา</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  แสดง {filteredRegistrations.length} รายการ
                </span>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 text-sm border border-slate-200 rounded-lg bg-white text-slate-500 disabled:opacity-50"
                    disabled
                  >
                    ก่อนหน้า
                  </button>
                  <button className="px-3 py-1 text-sm border border-slate-200 rounded-lg bg-white text-slate-500 hover:bg-slate-50">
                    ถัดไป
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
