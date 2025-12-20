"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Cpu,
  Layers,
  AlertTriangle,
  Plus,
  Search,
  Edit,
  Trash2,
  Wifi,
  WifiOff,
  X,
  Save,
  Clock,
  Tag,
  CheckCircle,
  Menu,
  Bell,
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sprout,
  QrCode,
  Ban,
} from "lucide-react";

import {
  AdminSidebar,
  AdminHeader,
} from "../../../components/admin/AdminLayout";
import Footer from "@/app/components/Footer";

import {
  getdataDevices,
  createDevice,
  deleteDevice,
  updateDevice,
} from "@/lib/admin/devices/devices.api";



export default function AdminDashboardPage() {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("manageDevices-List");

 
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiContent, setAiContent] = useState("");

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDevice, setCurrentDevice] = useState(null);
  const [formData, setFormData] = useState({
    device_code: "",
    status: "inactive",
  });

  useEffect(() => {
    async function fetchDevices () {
       const res = await getdataDevices(setLoading, setDevices);
    }
    fetchDevices();
  }, []);

  const generateGeminiInsight = () => {
    setIsAiModalOpen(true);
    setAiContent("AI Insight would appear here...");
  };

  const handleOpenAdd = () => {
    setCurrentDevice(null);
    setFormData({ device_code: "", status: "inactive" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (device) => {
    setCurrentDevice(device);
    setFormData({ device_code: device.device_code });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    deleteDevice(id, setDevices);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentDevice) {
      updateDevice(currentDevice.device_ID, formData.device_code, setDevices);
    } else {
      createDevice(formData.device_code, setDevices);
    }
    setIsModalOpen(false);
  };

  const formatDate = (date) => {
    if (!date) return "เพิ่งสร้าง";
    return new Date(date).toLocaleString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "inactive":
        return "bg-red-100 text-red-700 border-red-200";
      case "registered":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "online":
        return "Online";
      case "inactive":
        return "Inactive";
      case "registered":
        return "Registered";
      default:
        return status;
    }
  };

  const filteredDevices = devices.filter((d) =>
    d.device_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDevices = filteredDevices.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);

  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-600 ">
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      <div className="flex flex-1 flex-col overflow-hidden relative">
        <AdminHeader
          setSidebarOpen={setSidebarOpen}
          onAiClick={generateGeminiInsight}
        />

        {loading && (
           <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
                     <Loader2 className="animate-spin text-green-600" size={48} />
                   </div>
        )}

         

        <main className="flex-1 overflow-y-auto p-4 md:p-8 z-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
                รายการอุปกรณ์ IoT
              </h2>
              <p className="text-slate-500 mt-1">
                จัดการข้อมูลอุปกรณ์และสถานะการทำงานในระบบ
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="ค้นหา Device Code..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={handleOpenAdd}
                className="bg-green-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-green-700 shadow-lg shadow-green-200 transition-all font-medium"
              >
                <Plus size={20} />
                <span className="hidden md:inline">เพิ่มอุปกรณ์</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Cpu size={28} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">
                  {devices.length}
                </div>
                <div className="text-xs text-slate-500 font-bold uppercase">
                  จำนวนอุปกรณ์ทั้งหมด
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Wifi size={28} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">
                  {devices.filter((d) => d.status === "online").length}
                </div>
                <div className="text-xs text-slate-500 font-bold uppercase">
                  จำนวนอุปกรณ์ที่สามารถลงทะเบียนได้
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-slate-50 text-slate-500 rounded-xl">
                <WifiOff size={28} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">
                  {devices.filter((d) => d.status === "inactive").length}
                </div>
                <div className="text-xs text-slate-500 font-bold uppercase">
                  จำนวนอุปกรณ์ที่ยังไม่ลงทะเบียน
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold tracking-wider">
                  <tr>
                    <th className="p-6 pl-8">Device Info</th>
                    <th className="p-6">สถานะ (Status)</th>
                    <th className="p-6">วันที่สร้าง</th>
                    <th className="p-6 text-right pr-8">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentDevices.length > 0 ? (
                    currentDevices.map((device, index) => (
                      <tr key={device.device_ID || index}>
                        <td className="p-6 pl-8">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-100 to-blue-50 flex items-center justify-center text-blue-600 font-bold border border-white shadow-sm">
                              <Tag size={18} />
                            </div>
                            <div>
                              <div className="font-medium text-slate-800">
                                รหัสอุปกรณ์ : {device.device_code}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-6">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border items-center gap-1.5 ${getStatusColor(
                              device.status
                            )}`}
                          >
                            {device.status === "online" && <Wifi size={14} />}
                            {device.status === "inactive" && (
                              <WifiOff size={14} />
                            )}
                            {device.status === "registered" && (
                              <CheckCircle size={14} />
                            )}
                            {getStatusLabel(device.status)}
                          </span>
                        </td>

                        <td className="p-6">
                          <div className="flex flex-col gap-1">
                            <div className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              <Clock size={14} className="text-slate-400" />
                              {formatDate(device.created_at)}
                            </div>
                          </div>
                        </td>

                        <td className="p-6 pr-8 text-right">
                          <div className="flex justify-end gap-2 relative z-10">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(device)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(device.device_ID)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-8 text-center text-slate-400"
                      >
                        ไม่พบข้อมูลอุปกรณ์
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredDevices.length > 0 && (
              <div className="flex items-center justify-between px-8 py-4 border-t border-slate-100 bg-white">
                <div className="text-sm text-slate-500">
                  แสดง{" "}
                  <span className="font-semibold text-slate-700">
                    {indexOfFirstItem + 1}
                  </span>{" "}
                  ถึง{" "}
                  <span className="font-semibold text-slate-700">
                    {Math.min(indexOfLastItem, filteredDevices.length)}
                  </span>{" "}
                  จากทั้งหมด{" "}
                  <span className="font-semibold text-slate-700">
                    {filteredDevices.length}
                  </span>{" "}
                  รายการ
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg border flex items-center gap-1 text-sm font-medium transition-colors ${
                      currentPage === 1
                        ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                  >
                    <ChevronLeft size={16} /> ก่อนหน้า
                  </button>

                  <div className="px-2 text-sm font-medium text-slate-600">
                    หน้า {currentPage} จาก {totalPages}
                  </div>

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg border flex items-center gap-1 text-sm font-medium transition-colors ${
                      currentPage === totalPages
                        ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                  >
                    ถัดไป <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
          <Footer />
        </main>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-40 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:items-center sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsModalOpen(false)}
            />

            {/* Trick for vertical center */}
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle">
              &#8203;
            </span>

            {/* Modal Content */}
            <div
              className="relative inline-block w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:align-middle"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button (Top Right) */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              {/* Header with Icon */}
              <div className="border-b border-slate-100 px-6 py-5 flex items-center gap-4 bg-slate-50/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-sm border border-green-200">
                  <Cpu size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {currentDevice ? "แก้ไขข้อมูลอุปกรณ์" : "เพิ่มอุปกรณ์ใหม่"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    กรอกรหัสอุปกรณ์เพื่อลงทะเบียนในระบบ
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-5">
                  {/* Device Code Input with Icon */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Device Code <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <QrCode size={18} />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="เช่น ESP32-001"
                        value={formData.device_code}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            device_code: e.target.value,
                          })
                        }
                        className="block w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 sm:text-sm transition-all"
                      />
                    </div>
                  </div>

                  {/* คุณสามารถเพิ่ม Field อื่นๆ ตรงนี้ได้ เช่น เลือก Status */}
                </div>

                {/* Footer Actions */}
                <div className="mt-8 flex justify-end gap-3 pt-5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all font-medium text-sm"
                  >
                    <Ban size={18} />
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 hover:shadow-green-300 transition-all font-medium text-sm"
                  >
                    <Save size={18} />
                    บันทึกข้อมูล
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
