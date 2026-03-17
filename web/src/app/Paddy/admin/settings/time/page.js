
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Save, Clock, Loader2, Check, AlertCircle } from "lucide-react";
import { AdminSidebar, AdminHeader } from "../../../../components/admin/AdminLayout";
import Footer from "@/app/components/Footer";
import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

// --- Helper Functions ---
const formatISOToTime = (isoString) => {
  if (!isoString) return "00:00";
  // ใช้การตัด String เพื่อให้ได้ค่าเวลาตรงๆ ไม่โดน Timezone Offset กวน
  // จาก "1970-01-01T12:30:00.000Z" -> "12:30"
  const timePart = isoString.split("T")[1]; 
  return timePart.substring(0, 5); 
};

// --- Analog Clock Component ---
function AnalogClock({ time, size = 80 }) {
  if (!time) return <div style={{ width: size, height: size }} className="rounded-full bg-slate-100 animate-pulse" />;
  
  const hour = time.getHours() % 12;
  const minute = time.getMinutes();
  const second = time.getSeconds();
  const hourAngle = (hour + minute / 60) * 30;
  const minuteAngle = (minute + second / 60) * 6;
  const secondAngle = second * 6;
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={center} cy={center} r={center - 2} fill="#fff" stroke="#e2e8f0" strokeWidth="2" />
      <line x1={center} y1={center} x2={center + (size * 0.22) * Math.sin((Math.PI / 180) * hourAngle)} y2={center - (size * 0.22) * Math.cos((Math.PI / 180) * hourAngle)} stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
      <line x1={center} y1={center} x2={center + (size * 0.32) * Math.sin((Math.PI / 180) * minuteAngle)} y2={center - (size * 0.32) * Math.cos((Math.PI / 180) * minuteAngle)} stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
      <line x1={center} y1={center} x2={center + (size * 0.38) * Math.sin((Math.PI / 180) * secondAngle)} y2={center - (size * 0.38) * Math.cos((Math.PI / 180) * secondAngle)} stroke="#f59e42" strokeWidth="1" strokeLinecap="round" />
      <circle cx={center} cy={center} r="2.5" fill="#6366f1" />
    </svg>
  );
}

export default function TimeSettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [workStart, setWorkStart] = useState("08:00");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showCheck, setShowCheck] = useState(false);
  const [now, setNow] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

           const res = await apiFetch("/api/admin/get_system_settings", {
                   method: "GET",
                   headers: {
                      "Content-Type": "application/json",
                   },
                });
          
                if(!res.ok) {
                   Swal.fire({
                      icon: "error",
                      title: "ข้อผิดพลาด",
                      text: res.message || "Fetch failed",
                   });
                   return;
                }

         const settings = res.data[0];

        setWorkStart(formatISOToTime(settings.scheduler_time));
        setLastUpdated(new Date(settings.updated_at));
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // คำนวณเวลาสำหรับเข็มนาฬิกาฝั่งขวา (Selected Time)
  const workStartDate = useMemo(() => {
    const [h, m] = workStart.split(":");
    const d = new Date();
    d.setHours(Number(h), Number(m), 0);
    return d;
  }, [workStart]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
       const res = await apiFetch("/api/admin/update_scheduler_time", {
         method: "POST",
         body: { scheduler_time: workStart },
      });

      if (!res.ok) {
         Swal.fire({
            icon: "error",
            title: "ข้อผิดพลาด",
            text: res.message || "Update failed",
         });
         return;
      }

      Swal.fire({
         icon: "success",
         title: "สำเร็จ",
         text: "การตั้งค่าถูกบันทึกเรียบร้อยแล้ว",
      });

      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setLastUpdated(new Date());
      setShowCheck(true);
      setTimeout(() => setShowCheck(false), 2000);
    } catch (error) {
      Swal.fire({
         icon: "error",
         title: "ข้อผิดพลาด",
         text: "เกิดข้อผิดพลาดในการบันทึก",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-600 overflow-hidden">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="Settings-Time" />
      
      <div className="flex flex-1 flex-col relative z-0 overflow-y-auto">
        <AdminHeader setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-tr from-indigo-50 to-white">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 relative">
            
            {/* Header */}
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="bg-emerald-600 rounded-2xl p-4 mb-4 shadow-lg shadow-indigo-200">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800">ตั้งค่า Scheduler</h1>
              <p className="text-slate-400 mt-2">กำหนดเวลาที่ระบบจะเริ่มประมวลผลข้อมูลในแต่ละวัน</p>
            </div>

            {isLoading ? (
              <div className="py-20 flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-slate-400 animate-pulse">กำลังโหลดการตั้งค่าปัจจุบัน...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8 relative">
                {/* Left: Current Time */}
                <div className="bg-slate-50 rounded-2xl p-6 flex flex-col items-center border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Current System Time</span>
                  <AnalogClock time={now} size={110} />
                  <div className="mt-4 text-2xl font-mono font-bold text-slate-700">
                    {now ? now.toLocaleTimeString('th-TH', { hour12: false }) : "--:--:--"}
                  </div>
                </div>

                {/* Right: Input Area */}
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="w-full">
                    <label className="text-xs font-semibold text-slate-500 mb-2 block ml-1">Scheduler Start Time</label>
                    <div className="relative group">
                      <input
                        type="time"
                        value={workStart}
                        onChange={e => setWorkStart(e.target.value)}
                        className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none text-center font-bold text-xl text-slate-700 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                      showCheck ? 'bg-emerald-500 shadow-emerald-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                    }`}
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : showCheck ? <Check size={20} /> : <Save size={20} />}
                    {isSaving ? 'กำลังบันทึก...' : showCheck ? 'บันทึกสำเร็จ' : 'บันทึกเวลาใหม่'}
                  </button>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 italic">
                    <AlertCircle size={12} />
                    <span>อัปเดตล่าสุด: {lastUpdated ? new Date(lastUpdated).toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : 'ยังไม่มีข้อมูล'}</span>
                  </div>
                </div>

                {/* Middle Clock Indicator for Selected Time (Floating) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block opacity-10 pointer-events-none">
                  <AnalogClock time={workStartDate} size={200} />
                </div>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}