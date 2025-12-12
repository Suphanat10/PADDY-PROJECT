"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  Wifi,
  QrCode,
  MapPin,
  Sprout,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Home,
  LayoutDashboard,
  ChevronDown,
  PlusCircle,
  User,
} from "lucide-react";

import Header from "../components/Header";
import Footer from "../../../components/Footer";
import getFarmArea from "@/lib/registerdevice/getFarmArea";
import reghandleSubmit from "@/lib/registerdevice/reghandleSubmit";

const AlertBox = ({ title, message, type, onClose }) => {
  const bg =
    type === "success"
      ? "bg-green-50 border-green-200 text-green-800"
      : type === "warning"
      ? "bg-amber-50 border-amber-200 text-amber-800"
      : "bg-red-50 border-red-200 text-red-800";
  const icon =
    type === "success" ? (
      <CheckCircle size={20} className="text-green-600" />
    ) : type === "warning" ? (
      <AlertTriangle size={20} className="text-amber-600" />
    ) : (
      <AlertTriangle size={20} className="text-red-600" />
    );

  return (
    <div
      className={`p-4 rounded-xl border flex gap-3 items-start ${bg} mb-6 animate-fadeIn`}
    >
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1">
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-sm opacity-90 mt-1">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose}>
          <span className="sr-only">Close</span>&times;
        </button>
      )}
    </div>
  );
};


export default function DeviceRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const [deviceCode, setDeviceCode] = useState("");
  const [farmId, setFarmId] = useState("");
  const [farmPlotId, setFarmPlotId] = useState("");

  const [farms, setFarms] = useState([]);

  const [loadingData, setLoadingData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [data, setData] = useState(null);

  // 1. Fetch ครั้งเดียวตอนโหลดหน้าเว็บ
  useEffect(() => {
    const fetchData = async () => {
      try {
        getFarmArea(setLoadingData, setFarms, setAlertMessage, setFarmId);
      } catch (err) {
        console.error(err);
        setAlertMessage({
          title: "โหลดข้อมูลไม่สำเร็จ",
          message: "โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่",
          type: "error",
        });
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // 2. คำนวณ Farm ที่เลือก
  const selectedFarm = useMemo(
    () => farms.find((f) => String(f.farm_id) === String(farmId)),
    [farms, farmId]
  );

  const availablePlots = useMemo(() => {
    if (!selectedFarm || !selectedFarm.sub_areas) return [];
    return selectedFarm.sub_areas; // แสดงทุก sub_area
  }, [selectedFarm]);

  // 4. คำนวณ Plot ที่เลือก (เพื่อใช้แสดงชื่อตอน success)
  const selectedPlot = useMemo(
    () => availablePlots.find((p) => String(p.area_id) === String(farmPlotId)),
    [availablePlots, farmPlotId]
  );

  // Reset Plot ID เมื่อเปลี่ยน Farm
  useEffect(() => {
    if (availablePlots.length === 1) {
      setFarmPlotId(String(availablePlots[0].area_id));
    } else {
      setFarmPlotId("");
    }
  }, [farmId, availablePlots]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertMessage(null);

    reghandleSubmit(deviceCode, farmPlotId, setIsLoading , setData , setCurrentStep);


   

  };

  // ---------- Render Step 1 ----------
  const renderStepOne = () => (
    <div className="bg-white rounded-3xl border border-gray-100 p-8 lg:p-10 shadow-xl shadow-gray-200/50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-50 opacity-50 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-blue-50 opacity-50 blur-3xl pointer-events-none"></div>

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-2xl mb-6 shadow-inner">
            <Wifi className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
            ลงทะเบียนอุปกรณ์
          </h1>
          <p className="text-lg text-gray-500 font-light">
            เชื่อมต่ออุปกรณ์ IoT เข้ากับระบบ SmartFarm ของคุณ
          </p>
        </div>

        {alertMessage && (
          <AlertBox
            title={alertMessage.title}
            message={alertMessage.message}
            type={alertMessage.type}
            onClose={() => setAlertMessage(null)}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Device Code Input */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <QrCode size={18} className="text-emerald-500" /> รหัสอุปกรณ์
              (Device Code)
            </label>
            <div className="relative transition-all duration-300 transform group-focus-within:-translate-y-1">
              <input
                type="text"
                value={deviceCode}
                onChange={(e) => setDeviceCode(e.target.value.toUpperCase())}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-mono text-lg tracking-wider placeholder-gray-400 uppercase"
                placeholder="เช่น DEV-X8900"
                disabled={isLoading}
                maxLength={20}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs bg-gray-100 px-2 py-1 rounded">
                ระบุข้างกล่อง
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Farm Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Home size={18} className="text-emerald-500" /> เลือกฟาร์ม
              </label>
              <div className="relative">
                <select
                  value={farmId}
                  onChange={(e) => setFarmId(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer text-gray-700"
                  disabled={isLoading || loadingData}
                >
                  <option value="">
                    {loadingData ? "กำลังโหลดข้อมูล..." : "-- เลือกฟาร์ม --"}
                  </option>
                  {farms.map((f, idx) => (
                    <option key={f?.farm_id ?? idx} value={String(f.farm_id)}>
                      {f.farm_name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={20}
                />
              </div>
              {!loadingData && farms.length === 0 && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <AlertTriangle size={12} /> ยังไม่มีฟาร์ม (ต้องสร้างก่อน)
                </p>
              )}
            </div>

            {/* Plot Dropdown (Derived from Sub Areas) */}
            <div
              className={`${
                !farmId
                  ? "opacity-50 pointer-events-none grayscale"
                  : "opacity-100"
              } transition-all duration-300`}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Sprout size={18} className="text-emerald-500" /> เลือกแปลง
              </label>
              <div className="relative">
                <select
                  value={farmPlotId}
                  onChange={(e) => setFarmPlotId(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-2xl 
             focus:outline-none focus:border-emerald-500 focus:ring-4 
             focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer text-gray-700"
                  disabled={isLoading || !farmId}
                >
                  <option value="">-- เลือกแปลง --</option>

                  {availablePlots.map((p) => (
                    <option
                      key={p.area_id}
                      value={String(p.area_id)}
                      disabled={p.disabled} 
                      className={
                        p.disabled
                          ? "text-gray-400 bg-gray-100"
                          : "text-gray-800"
                      }
                    >
                      {p.area_name} {p.disabled ? "(ลงทะเบียนอุปกรณ์แล้ว)" : ""}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={20}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-lg text-white shadow-emerald-200 shadow-xl transition-all duration-300 flex items-center justify-center gap-3 transform active:scale-[0.98] border-2 border-transparent ${
              isLoading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-2xl hover:border-emerald-500"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" /> กำลังตรวจสอบ...
              </>
            ) : (
              <>
                ลงทะเบียนอุปกรณ์ <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );

  // ---------- Render Step 2 (Success) ----------
  const renderStepTwo = () => (
    <div className="max-w-xl mx-auto text-center animate-fadeIn">
      {/* Success Card */}
      <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-emerald-100 border border-emerald-50 overflow-hidden relative">
        {/* Confetti Background (Simulated) */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500"></div>

        <div className="w-28 h-28 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
          <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-20"></div>
          <CheckCircle className="w-14 h-14 text-emerald-600 relative z-10" />
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          ลงทะเบียนสำเร็จ!
        </h2>
        <p className="text-gray-500 mb-8">
          อุปกรณ์พร้อมใช้งานและเริ่มเก็บข้อมูลแล้ว
        </p>


       

           

          {/* <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <QrCode size={16} /> รหัสอุปกรณ์
              </span>
              <span className="font-mono font-bold text-lg text-gray-800 tracking-wide">
                {data?.device_code}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <Home size={16} /> ฟาร์ม
              </span>
              <span className="font-medium text-gray-800">
                {data?.farm_name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <MapPin size={16} /> แปลง
              </span>
              <span className="font-medium text-gray-800">
                
              </span>
            </div>
          </div>

          {/* <div className="mt-6 pt-4 border-t border-dashed border-gray-300 text-center">
            <p className="text-xs text-emerald-600 font-medium flex items-center justify-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>{" "}
              สถานะ: เชื่อมต่อแล้ว (Online)
            </p>
          </div> */}
        {/* </div> */}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => (window.location.href = "/Paddy/agriculture/dashboard")}
            className="flex-1 py-4 px-6 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all font-bold text-lg shadow-lg shadow-emerald-200 hover:shadow-xl flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <LayoutDashboard size={20} /> ไปที่แดชบอร์ด
          </button>

          <button
            onClick={() => {
              setCurrentStep(1);
              setDeviceCode("");
              setFarmId("");
              setFarmPlotId("");
              setData(null);
            }}
            className="flex-1 py-4 px-6 bg-white border-2 border-gray-100 text-gray-600 rounded-2xl hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50 transition-all font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <PlusCircle size={20} /> ลงทะเบียนเพิ่ม
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 ? renderStepOne() : renderStepTwo()}
        </div>
      </div>
      <Footer />
    </div>
    
    </>
  );
}
