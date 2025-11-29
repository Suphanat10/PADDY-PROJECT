"use client";

import React, { useEffect, useMemo, useState } from "react";
import { 
  CheckCircle, Wifi, QrCode, MapPin, Sprout, ArrowRight, 
  Loader2, AlertTriangle, Home, LayoutDashboard, ChevronDown, PlusCircle
} from "lucide-react";

// import AlertBox from "@/app/components/AlertBox";
import Header from "../components/Header";
import { apiFetch } from "@/lib/api";



const AlertBox = ({ title, message, type, onClose }) => {
  const bg = type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 
             type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' : 
             'bg-red-50 border-red-200 text-red-800';
  const icon = type === 'success' ? <CheckCircle size={20} className="text-green-600"/> :
               type === 'warning' ? <AlertTriangle size={20} className="text-amber-600"/> :
               <AlertTriangle size={20} className="text-red-600"/>;
  
  return (
    <div className={`p-4 rounded-xl border flex gap-3 items-start ${bg} mb-6 animate-fadeIn`}>
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1">
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-sm opacity-90 mt-1">{message}</p>
      </div>
      {onClose && <button onClick={onClose}><span className="sr-only">Close</span>&times;</button>}
    </div>
  );
};

// Mock API Fetch


// Mock Swal
const Swal = {
  fire: (config) => alert(`${config.title}\n${config.text || ''}`)
};
// ----------------------------------------------------

export default function DeviceRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const [deviceCode, setDeviceCode] = useState("");
  const [farmId, setFarmId] = useState("");       
  const [farmPlotId, setFarmPlotId] = useState("");

  const [farms, setFarms] = useState([]);           
  const [farmPlots, setFarmPlots] = useState([]);    

  const [loadingFarms, setLoadingFarms] = useState(false);
  const [loadingPlots, setLoadingPlots] = useState(false);

  const [isLoading, setIsLoading] = useState(false); 
  const [alertMessage, setAlertMessage] = useState(null);
  const [data, setData] = useState(null);

  const extractList = (res) => {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  };
  
  useEffect(() => {
    const fetchFarms = async () => {
      setLoadingFarms(true);
      try {
        const res = await apiFetch(`/api/data/farms`, { method: "GET" });
        if(res.status == 404){
         setAlertMessage({ title: "ไม่มีฟาร์ม", message: "คุณยังไม่มีฟาร์มในระบบ โปรดสร้างฟาร์มก่อนลงทะเบียนอุปกรณ์", type: "warning" });
          return;
        }
        const list = extractList(res);
        setFarms(list);
        if (list.length === 1) setFarmId(String(list[0].farm_id));
      } catch (err) {
        setAlertMessage({ title: "โหลดรายชื่อฟาร์มไม่สำเร็จ", message: "โปรดลองใหม่อีกครั้ง", type: "error" });
      } finally {
        setLoadingFarms(false);
      }
    };
    fetchFarms();
  }, []);

  useEffect(() => {
    if (!farmId) {
      setFarmPlots([]);
      setFarmPlotId("");
      return;
    }
    const fetchPlots = async () => {
      setLoadingPlots(true);
      try {
        const res = await apiFetch(`/api/data/farm-plots/${farmId}`, { method: "GET" });
        const list = extractList(res);
        setFarmPlots(list);
        if (list.length === 1) setFarmPlotId(String(list[0].farm_plot_id));
      } catch (err) {
        setAlertMessage({ title: "โหลดรายชื่อแปลงไม่สำเร็จ", message: "โปรดลองใหม่อีกครั้ง", type: "error" });
      } finally {
        setLoadingPlots(false);
      }
    };
    fetchPlots();
  }, [farmId]);

  const selectedFarm = useMemo(() => farms.find((f) => String(f.farm_id) === String(farmId)), [farms, farmId]);
  const selectedPlot = useMemo(() => farmPlots.find((p) => String(p.farm_plot_id) === String(farmPlotId)), [farmPlots, farmPlotId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertMessage(null);

    if (!deviceCode?.trim() || !farmId) {
      setAlertMessage({ title: "กรอกข้อมูลไม่ครบถ้วน", message: "กรุณากรอกรหัสอุปกรณ์และเลือกฟาร์ม", type: "warning" });
      return;
    }
    if (farmPlots.length > 0 && !farmPlotId) {
      setAlertMessage({ title: "กรอกข้อมูลไม่ครบถ้วน", message: "กรุณาเลือกแปลงในฟาร์ม", type: "warning" });
      return;
    }

    setIsLoading(true);
    try {
      const payload = { device_code: deviceCode.trim(), farm_plot_id: farmPlotId };
      const res = await apiFetch("/api/agriculture/register-device", { method: "POST", body: JSON.stringify(payload) });

      if (res?.success) {
        // Mock Success Data
        setData({
            device_code: deviceCode,
            registered_at: new Date().toISOString(),
            farm_name: selectedFarm?.farm_name,
            plot_name: selectedPlot?.plot_name
        });
        setCurrentStep(2);
      } else {
        setAlertMessage({ title: "ลงทะเบียนไม่สำเร็จ", message: res?.message || "กรุณาลองใหม่อีกครั้ง", type: "error" });
      }
    } catch (err) {
      setAlertMessage({ title: "เกิดข้อผิดพลาด", message: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้", type: "error" });
    } finally {
      setIsLoading(false);
    }
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
              <QrCode size={18} className="text-emerald-500" /> รหัสอุปกรณ์ (Device Code)
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
                    onChange={(e) => {
                        setFarmId(e.target.value);
                        setFarmPlotId(""); 
                    }}
                    className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer text-gray-700"
                    disabled={isLoading || loadingFarms}
                    >
                    <option value="">
                        {loadingFarms ? "กำลังโหลด..." : "-- เลือกฟาร์ม --"}
                    </option>
                    {farms.map((f, idx) => (
                        <option key={f?.farm_id ?? idx} value={String(f.farm_id)}>
                        {f.farm_name}
                        </option>
                    ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                </div>
                {!loadingFarms && farms.length === 0 && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                        <AlertTriangle size={12}/> ยังไม่มีฟาร์ม (ต้องสร้างก่อน)
                    </p>
                )}
            </div>

            {/* Plot Dropdown */}
            <div className={`${!farmId ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'} transition-all duration-300`}>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Sprout size={18} className="text-emerald-500" /> เลือกแปลง
                </label>
                <div className="relative">
                    <select
                        value={farmPlotId}
                        onChange={(e) => setFarmPlotId(e.target.value)}
                        className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer text-gray-700"
                        disabled={isLoading || loadingPlots || !farmId}
                    >
                        <option value="">
                        {loadingPlots
                            ? "กำลังโหลด..."
                            : farmPlots.length === 0
                            ? "-- ไม่มีแปลง --"
                            : "-- เลือกแปลง --"}
                        </option>
                        {farmPlots.map((p, idx) => (
                        <option key={p?.farm_plot_id ?? idx} value={String(p.farm_plot_id)}>
                            {p.plot_name}
                        </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                </div>
            </div>
          </div>

          {/* Submit Button - Redesigned */}
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
        
        <h2 className="text-3xl font-bold text-gray-800 mb-2">ลงทะเบียนสำเร็จ!</h2>
        <p className="text-gray-500 mb-8">อุปกรณ์พร้อมใช้งานและเริ่มเก็บข้อมูลแล้ว</p>

        {/* Ticket/Info Section */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-left mb-8 relative">
            <div className="absolute -left-3 top-1/2 -mt-3 w-6 h-6 bg-white rounded-full border-r border-gray-100"></div>
            <div className="absolute -right-3 top-1/2 -mt-3 w-6 h-6 bg-white rounded-full border-l border-gray-100"></div>
            
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">รายละเอียดอุปกรณ์</h3>
            
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 flex items-center gap-2"><QrCode size={16}/> รหัสอุปกรณ์</span>
                    <span className="font-mono font-bold text-lg text-gray-800 tracking-wide">{data?.device_code}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 flex items-center gap-2"><Home size={16}/> ฟาร์ม</span>
                    <span className="font-medium text-gray-800">{data?.farm_name || selectedFarm?.farm_name}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 flex items-center gap-2"><MapPin size={16}/> แปลง</span>
                    <span className="font-medium text-gray-800">{data?.plot_name || selectedPlot?.plot_name}</span>
                </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-dashed border-gray-300 text-center">
                <p className="text-xs text-emerald-600 font-medium flex items-center justify-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> สถานะ: เชื่อมต่อแล้ว (Online)
                </p>
            </div>
        </div>

        {/* Actions - Redesigned Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
            <button
            onClick={() => (window.location.href = "/dashboard")}
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
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 ? renderStepOne() : renderStepTwo()}
        </div>
      </div>
    </div>
  );
}