"use client";

import React, { useState, useEffect } from "react";
import {
  Droplets,
  Bell,
  Save,
  AlertTriangle,
  ChevronDown,
  Settings,
  Info,
  Smartphone,
  CheckCircle,
  RotateCcw,
  Clock,
  Database,
  Map as MapIcon,
  Loader2,
  X,
  Plus,
} from "lucide-react";

import Header from "../../components/Header";
import Footer from "../../../../components/Footer";
import waterPlots from "@/lib/settings/WaterLeve/waterPlots";
import { waterSettings } from "@/lib/settings/WaterLeve/waterSettings";
import Swal from "sweetalert2";

export default function WaterLevelSettings() {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Settings State
  const [settings, setSettings] = useState({
    minLevel: 0,
    maxLevel: 0,
    dataSendInterval: 1,
    notifyLine: true,
    notifyApp: true,
  });

  // Load Data
  useEffect(() => {
    async function fetchData() {
      // Simulate API Call
      // setLoading(true);
      waterPlots(setDevices, setSettings, setSelectedDeviceId);
      setLoading(false);
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedDeviceId) return;
    if (!Array.isArray(devices)) return;

    const currentDevice = devices.find(
      (d) => d.device_registrations_ID.toString() === selectedDeviceId
    );

    if (!currentDevice) return;

    const safeWaterValue = currentDevice?.latest_water_level?.value ?? 0;

    if (currentDevice.setting) {
      setSettings((prev) => ({
        ...prev,
        minLevel: currentDevice.setting.Water_level_min ?? 0,
        maxLevel: currentDevice.setting.Water_level_mxm ?? 0, // ← แก้ชื่อถูกต้อง
        dataSendInterval:
          parseInt(currentDevice.setting.data_send_interval_days) || 1,
        currentWaterLevel: safeWaterValue,
      }));
    }
  }, [selectedDeviceId, devices]);

  const currentDevice = Array.isArray(devices)
    ? devices.find(
        (d) => d.device_registrations_ID.toString() === selectedDeviceId
      )
    : null;

  const handleLevelChange = (type, value) => {
    const val = parseInt(value) || 0;
    setSettings((prev) => ({
      ...prev,
      [type]: val,
    }));
  };

  const handleSave = () => {
    setLoading(true);
    waterSettings( settings.minLevel, settings.maxLevel, selectedDeviceId, setLoading, setSaveStatus , setSettings );

  };

  const handleReset = () => {
     Swal.fire({
       title: "คืนค่าแนะนำ?",
       text: "คุณต้องการคืนค่าระดับน้ำเป็นค่าแนะนำหรือไม่?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "ใช่, คืนค่า",
        cancelButtonText: "ยกเลิก",
      }).then((result) => {
        if (result.isConfirmed) {
          setSettings((prev) => ({
            ...prev,
            minLevel: 5,
            maxLevel: 20,
          }));
          Swal.fire({
            icon: "success",
            title: "คืนค่าเรียบร้อย",
            text: "ตั้งค่าระดับน้ำถูกคืนเป็นค่าแนะนำแล้ว",
          });
        }
      });
    
  }



  if (!currentDevice)
    return (
      <>
             <Header />
             <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center">
                 <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                     <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4 shadow-sm"></div>
                     <p className="text-gray-500 text-sm font-medium animate-pulse">กำลังโหลดข้อมูล...</p>
                 </div>
             </div>
             <Footer />
           </>
    );

  return (
    <div
      className="min-h-screen bg-gray-50 text-gray-900">

      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="text-blue-600" /> ตั้งค่าแจ้งเตือนระดับน้ำ
          </h1>
          <p className="text-gray-500 mt-1">
            กำหนดช่วงระดับน้ำที่เหมาะสม
            เพื่อรับการแจ้งเตือนเมื่อน้ำมากหรือน้อยเกินไป
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Plot Selection & Settings Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Select Plot Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                เลือกแปลงนาที่ต้องการตั้งค่า
              </label>
              <div className="relative">
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="block w-full pl-4 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border bg-gray-50"
                >
                  {devices.map((device) => (
                    <option
                      key={device.device_registrations_ID}
                      value={device.device_registrations_ID}
                    >
                      {device.farm_name} - {device.area_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Water Level Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Droplets size={20} className="text-blue-500" />{" "}
                  กำหนดช่วงระดับน้ำ (ซม.)
                </h3>
                <button
                  onClick={handleReset}
                  className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw size={14} /> คืนค่าแนะนำ
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Min Level Input */}
                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ระดับน้ำ{" "}
                    <span className="text-red-500 font-bold">ต่ำสุด</span>{" "}
                    (แจ้งเตือนเมื่อต่ำกว่า)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={settings.minLevel}
                      onChange={(e) =>
                        handleLevelChange("minLevel", e.target.value)
                      }
                      className="block w-full border-gray-300 rounded-l-lg py-3 px-4 focus:ring-blue-500 focus:border-blue-500 border bg-white text-lg font-bold text-red-600"
                    />
                    <span className="inline-flex items-center px-4 py-3 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm font-medium">
                      ซม.
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    ค่าแนะนำ: 5 ซม. เพื่อควบคุมวัชพืช
                  </p>
                </div>

                {/* Max Level Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ระดับน้ำ{" "}
                    <span className="text-blue-600 font-bold">สูงสุด</span>{" "}
                    (แจ้งเตือนเมื่อสูงกว่า)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={settings.maxLevel}
                      onChange={(e) =>
                        handleLevelChange("maxLevel", e.target.value)
                      }
                      className="block w-full border-gray-300 rounded-l-lg py-3 px-4 focus:ring-blue-500 focus:border-blue-500 border bg-white text-lg font-bold text-blue-600"
                    />
                    <span className="inline-flex items-center px-4 py-3 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm font-medium">
                      ซม.
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    ค่าแนะนำ: ไม่ควรเกิน 15-20 ซม.
                  </p>
                </div>
              </div>

              {/* Alert Logic Explanation */}
              <div className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-100 flex gap-3 items-start">
                <Info
                  className="text-blue-500 flex-shrink-0 mt-0.5"
                  size={18}
                />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold">เงื่อนไขการแจ้งเตือน:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-blue-700/80">
                    <li>
                      เตือนเมื่อระดับน้ำ{" "}
                      <strong>ต่ำกว่า {settings.minLevel} ซม.</strong>
                    </li>
                    <li>
                      เตือนเมื่อระดับน้ำ{" "}
                      <strong>สูงกว่า {settings.maxLevel} ซม.</strong>
                    </li>
                    <li>
                      ช่วงปลอดภัย:{" "}
                      <strong>
                        {settings.minLevel} - {settings.maxLevel} ซม.
                      </strong>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="flex justify-start mt-6">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl text-white font-bold shadow-lg transition-all transform active:scale-95 ${
                    saveStatus === "success"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? (
                    <span className="animate-spin text-xl">
                      <Loader2 size={20} />
                    </span>
                  ) : saveStatus === "success" ? (
                    <>
                      <CheckCircle size={20} /> บันทึกสำเร็จ
                    </>
                  ) : (
                    <>
                      <Save size={20} /> บันทึกการตั้งค่า
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              {/* <button 
                  onClick={handleSave}
                  disabled={loading}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl text-white font-bold shadow-lg transition-all transform active:scale-95 ${
                     saveStatus === 'success' 
                     ? 'bg-green-500 hover:bg-green-600' 
                     : 'bg-blue-600 hover:bg-blue-700'
                  }`}
               >
                  {loading ? (
                     <span className="animate-spin text-xl"><Loader2 size={20}/></span>
                  ) : saveStatus === 'success' ? (
                     <><CheckCircle size={20} /> บันทึกสำเร็จ</>
                  ) : (
                     <><Save size={20} /> บันทึกการตั้งค่า</>
                  )}
               </button> */}
            </div>
          </div>

          {/* RIGHT: Visual Guide */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">
                ภาพจำลองระดับน้ำ
              </h3>

              {/* Tank Container */}
              <div className="relative w-32 h-80 mx-auto bg-gray-100 rounded-lg border-2 border-gray-300 overflow-hidden shadow-inner">
                {/* Grid */}
                <div
                  className="absolute inset-0 z-0 opacity-20"
                  style={{
                    backgroundImage:
                      "linear-gradient(#000000 1px, transparent 1px)",
                    backgroundSize: "100% 20%",
                  }}
                ></div>

                {/* Water Level */}
                <div
                  className="absolute bottom-0 w-full bg-blue-400/80 transition-all duration-1000 ease-in-out z-10 flex items-center justify-center"
                  style={{
                    height: `${
                      ((currentDevice?.latest_water_level?.value ?? 0) / 30) *
                      100
                    }%`,
                  }}
                >
                  <div className="w-full h-full animate-pulse bg-blue-500/50 absolute top-0 left-0"></div>
                  <span className="relative z-20 text-white font-bold text-xs drop-shadow-md">
                    {currentDevice?.latest_water_level?.value ?? 0} ซม.
                  </span>
                </div>

                {/* Alert Lines */}
                <div
                  className="absolute w-full border-t-2 border-dashed border-red-500 z-20 transition-all duration-500"
                  style={{ bottom: `${(settings.maxLevel / 30) * 100}%` }}
                >
                  <span className="absolute right-0 -top-6 bg-red-100 text-red-600 text-[10px] px-1 py-0.5 rounded font-bold">
                    MAX
                  </span>
                </div>
                <div
                  className="absolute w-full border-t-2 border-dashed border-red-500 z-20 transition-all duration-500"
                  style={{ bottom: `${(settings.minLevel / 30) * 100}%` }}
                >
                  <span className="absolute right-0 top-1 bg-red-100 text-red-600 text-[10px] px-1 py-0.5 rounded font-bold">
                    MIN
                  </span>
                </div>

                {/* Safe Zone */}
                <div
                  className="absolute left-0 w-1 h-full bg-gradient-to-t from-red-400 via-green-400 to-red-400 z-30 opacity-70"
                  style={{
                    background: `linear-gradient(to top, #ef4444 0%, #ef4444 ${
                      (settings.minLevel / 30) * 100
                    }%, #22c55e ${(settings.minLevel / 30) * 100}%, #22c55e ${
                      (settings.maxLevel / 30) * 100
                    }%, #ef4444 ${
                      (settings.maxLevel / 30) * 100
                    }%, #ef4444 100%)`,
                  }}
                ></div>
              </div>

              {/* Legend */}
              <div className="mt-6 text-center">
                <div className="inline-block text-left text-xs text-gray-500 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-sm"></span>
                    <span>โซนอันตราย</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-sm"></span>
                    <span>โซนปลอดภัย</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-400 rounded-sm"></span>
                    <span>ระดับน้ำปัจจุบัน</span>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div
                className={`mt-6 p-3 rounded-lg border text-center ${
                  (currentDevice?.latest_water_level?.value ?? 0) <
                    settings.minLevel ||
                  (currentDevice?.latest_water_level?.value ?? 0) >
                    settings.maxLevel
                    ? "bg-red-50 border-red-200 text-red-600"
                    : "bg-green-50 border-green-200 text-green-600"
                }`}
              >
                <p className="text-sm font-bold flex items-center justify-center gap-1">
                  {currentDevice?.latest_water_level?.value <
                  settings.minLevel ? (
                    <>
                      <AlertTriangle size={16} /> น้ำน้อยเกินไป
                    </>
                  ) : currentDevice?.latest_water_level?.value >
                    settings.maxLevel ? (
                    <>
                      <AlertTriangle size={16} /> น้ำมากเกินไป
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} /> ระดับปกติ
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}
