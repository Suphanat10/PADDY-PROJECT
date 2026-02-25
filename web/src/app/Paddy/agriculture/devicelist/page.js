"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import {
  Thermometer,
  Droplets,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Sprout,
  Search,
  Plus,
  Trash2,
  MapPin,
  Clock,
  Loader2,
  Calendar,
  ScanQrCode,
  ArrowLeftRight,
} from "lucide-react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "@/app/components/Footer";
import { closeSensorWebSocket } from "@/lib/devices/sensorWebSocket";
import { loadDevicesService } from "@/lib/devices/loadDevices";
import { deleteDeviceByCode } from "@/lib/devices/deleteDevice";
import { createSensorWebSocket } from "@/lib/devices/sensorWebSocket";

// --- ฟังก์ชันเดิมทั้งหมด ---
const getStatusBadge = (status) => {
  const map = {
    connected: {
      text: "เชื่อมต่อแล้ว",
      color: "bg-emerald-50 text-emerald-600 border border-emerald-200",
      icon: CheckCircle,
    },
    online: {
        text: "เชื่อมต่อแล้ว",
        color: "bg-emerald-50 text-emerald-600 border border-emerald-200",
        icon: CheckCircle,
      },
    disconnected: {
      text: "ขาดการเชื่อมต่อ",
      color: "bg-gray-50 text-gray-500 border border-gray-200",
      icon: XCircle,
    },
    offline: {
        text: "ขาดการเชื่อมต่อ",
        color: "bg-gray-50 text-gray-500 border border-gray-200",
        icon: XCircle,
      },
    warning: {
      text: "ตรวจสอบ",
      color: "bg-amber-50 text-amber-600 border border-amber-200",
      icon: AlertCircle,
    },
  };
  const item = map[status] || map.disconnected;
  const Icon = item.icon;
  return (
    <div className={`px-3 py-1 rounded-full inline-flex items-center ${item.color}`}>
      <Icon className="w-3 h-3 mr-1.5" />
      <span className="text-xs font-medium">{item.text}</span>
    </div>
  );
};

const getSensorIcon = (type = "") => {
  const t = type.toLowerCase();
  if (t.includes("water") || t.includes("humid")) return { icon: Droplets, color: "text-blue-500", bg: "bg-blue-50" };
  if (t.includes("moisture")) return { icon: Activity, color: "text-blue-600", bg: "bg-blue-50" };
  if (t.includes("npk") || t.includes("soil")) return { icon: Sprout, color: "text-emerald-600", bg: "bg-emerald-50" };
  if (t.includes("temp")) return { icon: Thermometer, color: "text-red-500", bg: "bg-red-50" };
  if (t.includes("battery")) return { icon: Zap, color: "text-amber-500", bg: "bg-amber-50" };
  return { icon: Thermometer, color: "text-gray-600", bg: "bg-gray-50" };
};

function combineNPK(sensor) {
  if (!sensor) return [];
  const val = (v) => (v !== undefined && v !== null ? v : "-");
  return [
    { type: "NPK", label: "ธาตุอาหาร (NPK)", values: { N: val(sensor?.N), P: val(sensor?.P), K: val(sensor?.K) } },
    { type: "water_level", label: "ระดับน้ำ", current: val(sensor?.water_level), unit: "cm" },
    { type: "soil_moisture", label: "ความชื้นดิน", current: val(sensor?.soil_moisture), unit: "%" },
  ];
}

export default function DeviceListPage() {
  const [sensorDevices, setSensorDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [loading, setLoading] = useState(true); 

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("สถานะทั้งหมด");
  const [filterArea, setFilterArea] = useState("พื้นที่ทั้งหมด");

  // 1. Fetch รายชื่ออุปกรณ์
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        const mapped = await loadDevicesService();
        if (mapped.length > 0) {
          setSensorDevices(mapped);
          setSelectedDevice(mapped[0].device_code);
        } else {
            setLoading(false);
        }
      } catch (err) {
        console.error("Load error:", err);
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

  useEffect(() => {
    if (sensorDevices.length === 0) return;

    const deviceIds = sensorDevices.map((d) => d.device_code);

    createSensorWebSocket({
      url: "https://smart-paddy.space",
      deviceIds,
      onConnected: () => setIsWsConnected(true),
      onDisconnected: () => {
        setIsWsConnected(false);
        setLoading(false);
      },
      onSensorUpdate: (deviceId, data, timestamp) => {
        setSensorDevices((prev) =>
          prev.map((dev) =>
            dev.device_code === deviceId
              ? { ...dev, sensor: data, lastUpdate: timestamp, status: "connected" }
              : dev
          )
        );
        setLoading(false);
      },
      onStatusUpdate: (deviceId, status) => {
        setSensorDevices((prev) =>
          prev.map((dev) =>
            dev.device_code === deviceId ? { ...dev, status: status === "online" ? "connected" : "disconnected" } : dev
          )
        );
        setLoading(false);
      },
      onError: () => {
        setIsWsConnected(false);
        setLoading(false);
      },
    });

    return () => closeSensorWebSocket();
  }, [sensorDevices.length]);

  const filteredDevices = useMemo(() => {
    return sensorDevices.filter((device) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = (device.device_code || "").toLowerCase().includes(term) || (device.farm || "").toLowerCase().includes(term);
      let matchesStatus = true;
      if (filterStatus === "เชื่อมต่อแล้ว") matchesStatus = device.status === "connected";
      else if (filterStatus === "ขาดการเชื่อมต่อ") matchesStatus = device.status === "disconnected";
      let matchesArea = true;
      if (filterArea !== "พื้นที่ทั้งหมด") matchesArea = device.farm === filterArea || device.area === filterArea;
      return matchesSearch && matchesStatus && matchesArea;
    });
  }, [sensorDevices, searchTerm, filterStatus, filterArea]);

  const uniqueAreas = useMemo(() => {
    return Array.from(new Set(sensorDevices.map((d) => d.farm).filter(Boolean)));
  }, [sensorDevices]);

  const selected = sensorDevices.find((d) => d.device_code === selectedDevice);

  const handleDelete = async (code) => {
    await deleteDeviceByCode({
      deviceCode: code,
      onSuccess: () => {
        setSensorDevices((prev) => prev.filter((d) => d.device_code !== code));
        setSelectedDevice(null);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12 text-gray-900 flex flex-col">
      <Header />
      <main className="container mx-auto px-4 pt-8 max-w-7xl flex-grow">
        
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ข้อมูลอุปกรณ์</h1>
              <p className="text-gray-500 text-sm mt-1">จัดการและตรวจสอบสถานะเซ็นเซอร์ทั้งหมด ({sensorDevices.length} อุปกรณ์)</p>
            </div>
            <div className="flex gap-3">
              <Link href="/Paddy/agriculture/registerdevice" className="flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-lg text-sm font-medium text-white hover:bg-emerald-700 transition-colors shadow-sm">
                <Plus size={16} /> เพิ่มอุปกรณ์
              </Link>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ค้นหา..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none text-sm shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option>สถานะทั้งหมด</option>
              <option>เชื่อมต่อแล้ว</option>
              <option>ขาดการเชื่อมต่อ</option>
            </select>
          </div>
        </div>

        {/* Tab List */}
        <div className="mb-6 bg-white p-2 rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {filteredDevices.map((d) => (
              <button
                key={d.device_code}
                onClick={() => setSelectedDevice(d.device_code)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedDevice === d.device_code ? "bg-emerald-500 text-white shadow-md" : "bg-transparent text-gray-600 hover:bg-gray-100"}`}
              >
                {d.device_code}
              </button>
            ))}
          </div>
        </div>

        {/* ✅ Main Content / Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
            <p className="text-gray-400">กำลังเชื่อมต่อระบบ Real-time...</p>
          </div>
        ) : !selected ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-400">
            <p>ไม่พบอุปกรณ์ที่ตรงกับเงื่อนไข</p>
          </div>
        ) : (
          <>
            {/* Device Detail Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/3 flex flex-col items-center justify-center border-r border-gray-100 pr-0 lg:pr-8">
                  <p className="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wide">รหัสอุปกรณ์</p>
                  <div className="flex items-center gap-3 mb-4">
                    <ScanQrCode className="w-8 h-8 text-blue-600" />
                    <h2 className="text-3xl font-bold text-gray-800 tracking-tight">{selected.device_code}</h2>
                  </div>
                </div>

                <div className="lg:w-2/3">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">รายละเอียดอุปกรณ์</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">{selected.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg"><Clock className="w-5 h-5 text-gray-600" /></div>
                      <div>
                        <p className="text-xs text-gray-500">อัปเดตล่าสุด</p>
                        <p className="text-sm font-semibold text-gray-800">{selected.lastUpdate || "-"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1"><Sprout size={14} /> {selected.farm}</div>
                    <div className="flex items-center gap-1"><MapPin size={14} /> {selected.area}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                <Link href={`/Paddy/agriculture/sensor/${selected.device_code}`} className="flex-1 bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-emerald-600 transition-colors text-center">ดูข้อมูลเซ็นเซอร์</Link>
                <button onClick={() => handleDelete(selected.device_code)} className="flex items-center justify-center gap-2 px-6 py-2.5 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50">
                  <Trash2 className="w-4 h-4" /> ยกเลิกการลงทะเบียน
                </button>
                <Link href="/Paddy/agriculture/DeviceTransfer" className="flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-100">
                  <ArrowLeftRight className="w-4 h-4" /> ย้ายอุปกรณ์
                </Link>
                
              </div>
            </div>

            {/* Sensors Grid */}
            <h3 className="text-lg font-bold text-gray-800 mb-4">เซ็นเซอร์ทั้งหมด</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {combineNPK(selected.sensor).map((s, idx) => {
                const style = getSensorIcon(s.type);
                const Icon = style.icon;

                if (s.type === "NPK") {
                  return (
                    <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 col-span-1 md:col-span-2 lg:col-span-3">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${style.bg}`}><Icon className={`w-6 h-6 ${style.color}`} /></div>
                          <div>
                            <h4 className="font-bold text-gray-800">{s.label}</h4>
                            <div className="mt-1">{getStatusBadge(selected.status)}</div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {Object.entries(s.values).map(([k, v]) => (
                          <div key={k} className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-500 font-bold mb-1">{k}</p>
                            <p className={`text-xl font-bold ${style.color}`}>{v}</p>
                            <p className="text-xs text-gray-400">mg/kg</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2 rounded-lg ${style.bg}`}><Icon className={`w-6 h-6 ${style.color}`} /></div>
                      {getStatusBadge(selected.status)}
                    </div>
                    <h4 className="font-semibold text-gray-700 mb-1">{s.label}</h4>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className={`text-3xl font-bold ${style.color}`}>{s.current}</span>
                      <span className="text-sm text-gray-500">{s.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}