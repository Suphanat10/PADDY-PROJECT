"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Sprout, Calendar, Clock, ImageIcon, Search, Filter, ChevronRight,
  History, Leaf, Info, MapPin, Building2, Video, Upload,
  AlertCircle, PlayCircle, FileQuestion, Loader2, CheckCircle2
} from "lucide-react";
import Header from "../components/Header";
import Footer from "@/app/components/Footer";
import { loadGrowthAnalysis } from "@/lib/growthAnalysis/loadGrowthAnalysis";
import { fetchGrowthAnalysisApi } from "@/lib/growthAnalysis/fetchGrowthAnalysisApi";
import Swal from 'sweetalert2';

export default function SmartRiceMonitoring() {
  const [activeTab, setActiveTab] = useState("growth");
  const [selectedDeviceRegId, setSelectedDeviceRegId] = useState("all");
  const [processedHistory, setProcessedHistory] = useState([]);
  const [devicesList, setDevicesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        const { devicesList, historyList } = await loadGrowthAnalysis(fetchGrowthAnalysisApi);
        setDevicesList(devicesList || []);
        setProcessedHistory(historyList || []);
      } catch (err) {
        console.error("Load Growth Analysis error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // ฟังก์ชันจัดการการคลิกปุ่มอัปโหลด
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // ฟังก์ชันเมื่อเลือกไฟล์
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ตรวจสอบประเภทไฟล์ (รับเฉพาะวิดีโอ)
    if (!file.type.startsWith('video/')) {
      Swal.fire("ไฟล์ไม่ถูกต้อง", "กรุณาเลือกไฟล์วิดีโอเท่านั้น", "error");
      return;
    }

    try {
      setIsUploading(true);
      
      // --- ส่วนนี้คือจุดที่คุณจะเชื่อมต่อกับ API จริง ---
      // ตัวอย่างจำลองการอัปโหลด 3 วินาที
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      Swal.fire({
        icon: 'success',
        title: 'อัปโหลดสำเร็จ',
        text: 'ระบบกำลังวิเคราะห์วิดีโอของคุณ กรุณารอสักครู่',
        timer: 2000,
        showConfirmButton: false
      });
      
    } catch (error) {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถอัปโหลดวิดีโอได้", "error");
    } finally {
      setIsUploading(false);
      e.target.value = null; // Reset input
    }
  };

  const filteredHistory = useMemo(() => {
    let data = processedHistory;
    if (selectedDeviceRegId !== "all") {
      data = data.filter(item => item.device_info.reg_id === parseInt(selectedDeviceRegId));
    }
    return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [processedHistory, selectedDeviceRegId]);

  const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm w-full">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <FileQuestion className="w-8 h-8 text-gray-300" />
      </div>
      <p className="text-gray-500 font-medium">{message || "ไม่พบข้อมูลในระบบ"}</p>
    </div>
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-kanit">
        <div className="max-w-6xl mx-auto">
          
          <div className="mb-8">
            <h4 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-3">
              
              ระบบติดตามและวิเคราะห์สุขภาพข้าว
            </h4>
          </div>

          {/* Navigation Tabs */}
          <div className="flex p-1.5 bg-white rounded-2xl border border-gray-200 shadow-sm mb-8 w-fit">
            <button 
              onClick={() => setActiveTab("growth")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'growth' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <History className="w-5 h-5" /> ประวัติการเติบโต
            </button>
            <button 
              onClick={() => setActiveTab("disease")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'disease' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Video className="w-5 h-5" /> วิเคราะห์โรค
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-medium">กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <>
              {activeTab === "growth" ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
                  <div className="lg:col-span-3">
                    <div className="mb-6 flex items-center justify-between">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Clock className="text-emerald-500" /> ไทม์ไลน์การเติบโต
                      </h2>
                      <select
                        value={selectedDeviceRegId}
                        onChange={(e) => setSelectedDeviceRegId(e.target.value)}
                        className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      >
                        {devicesList.map(dev => (
                          <option key={dev.reg_id} value={dev.reg_id}>{dev.device_code}</option>
                        ))}
                      </select>
                    </div>

                    {filteredHistory.length > 0 ? (
                      <div className="space-y-8 relative">
                        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-emerald-100"></div>
                        {filteredHistory.map((item) => (
                          <div key={item.analysis_id} className="relative pl-14 group">
                            <div className="absolute left-4 top-0 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white shadow-sm z-10"></div>
                            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
                              <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                  <img src={item.image_url} className="w-full h-full object-cover" alt="Growth" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                      {item.growth_stage}
                                    </span>
                                    <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString('th-TH')}</span>
                                  </div>
                                  <h4 className="font-bold text-gray-800 mb-2">ผลการวิเคราะห์</h4>
                                  <p className="text-sm text-gray-600 leading-relaxed">{item.remarks || "สภาพข้าวสมบูรณ์ดีตามเกณฑ์ระยะเวลา"}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState message="ยังไม่มีประวัติการวิเคราะห์การเจริญเติบโต" />
                    )}
                  </div>

                  <div className="lg:col-span-1 space-y-6">
                    <h3 className="font-bold text-gray-800">คู่มือระยะการเติบโต</h3>

                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4">
                      {['ระยะกล้า', 'ระยะแตกกอ', 'ระยะสร้างรวง', 'ระยะสุกแก่'].map((s, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                            0{i+1}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-500">
                  <div className="md:col-span-1">
                    {/* ส่วนอัปโหลดวิดีโอ */}
                    <div 
                      onClick={!isUploading ? triggerFileInput : undefined}
                      className={`bg-white rounded-3xl p-8 border-2 border-dashed transition-all text-center ${isUploading ? 'border-gray-200 cursor-not-allowed' : 'border-emerald-200 hover:border-emerald-400 cursor-pointer group'}`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="video/*" 
                        className="hidden" 
                      />
                      
                      {isUploading ? (
                        <div className="py-4">
                          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
                          <h3 className="font-bold text-gray-800 mb-1">กำลังอัปโหลด...</h3>
                          <p className="text-xs text-gray-400">กรุณาอย่าปิดหน้าต่างนี้</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8 text-emerald-600" />
                          </div>
                          <h3 className="font-bold text-gray-800 mb-2">วิเคราะห์วิดีโอใหม่</h3>
                          <p className="text-xs text-gray-500 mb-6">คลิกเพื่อเลือกไฟล์วิดีโอต้นข้าว</p>
                          <button className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
                            เลือกไฟล์
                          </button>
                        </>
                      )}
                    </div>

                    <div className="mt-6 bg-amber-50 rounded-2xl p-4 border border-amber-100">
                      <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                        <div>
                          <h4 className="text-sm font-bold text-amber-800">ข้อแนะนำ</h4>
                          <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                            ควรถ่ายวิดีโอให้เห็นใบข้าวชัดเจน และเดินกล้องช้าๆ เพื่อผลลัพธ์ที่แม่นยำ
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <PlayCircle className="text-emerald-500" /> ประวัติการวิเคราะห์โรค
                    </h3>
                    {/* ตัวอย่างแสดง EmptyState ถ้ายังไม่มีข้อมูลวิดีโอ */}
                    <EmptyState message="ยังไม่มีประวัติการส่งวิเคราะห์โรค" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
             <Footer />
      </div>
 
    </>
  );
}