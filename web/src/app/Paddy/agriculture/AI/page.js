
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Sprout,
  Clock,
  Search,
  History,
  Info,
  Upload,
  AlertCircle,
  PlayCircle,
  FileQuestion,
  Loader2,
  Image as LucideImage,
  ShieldCheck,
  Bug,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

import Header from "../components/Header";
import Footer from "@/app/components/Footer";
import { loadGrowthAnalysis } from "@/lib/growthAnalysis/loadGrowthAnalysis";
import { fetchGrowthAnalysisApi } from "@/lib/growthAnalysis/fetchGrowthAnalysisApi";
import Swal from "sweetalert2";

export default function SmartRiceMonitoring() {
  const [activeTab, setActiveTab] = useState("growth");
  const [selectedDeviceRegId, setSelectedDeviceRegId] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const [devicesList, setDevicesList] = useState([]);
  const [growthHistory, setGrowthHistory] = useState([]);
  const [diseaseHistory, setDiseaseHistory] = useState([]);

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        const response = await loadGrowthAnalysis(fetchGrowthAnalysisApi);

        setDevicesList(response.devicesList || []);
        setGrowthHistory(response.historyList || []);
        setDiseaseHistory(response.diseaseList || []);

      } catch (err) {
        console.error("Load Analysis error:", err);
        Swal.fire("ข้อผิดพลาด", "ไม่สามารถดึงข้อมูลจากระบบได้", "error");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };


  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (selectedDeviceRegId === "all") {
      Swal.fire("กรุณาเลือกแปลงนา", "กรุณาเลือกแปลงนาที่ต้องการก่อนอัปโหลด", "warning");
      e.target.value = null;
      return;
    }

    const selectedDevice = devicesList.find(dev => dev.reg_id === parseInt(selectedDeviceRegId));
    const deviceCode = selectedDevice ? selectedDevice.device_code : "Unknown";

    if (!file.type.startsWith("image/")) {
      Swal.fire("รูปแบบไฟล์ไม่ถูกต้อง", "กรุณาเลือกไฟล์รูปภาพเท่านั้น", "error");
      e.target.value = null;
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      // แนะนำ: append ข้อมูล text ก่อนไฟล์ เพื่อให้ Multer ที่ Backend อ่านง่ายขึ้น
      formData.append("registration_id", selectedDeviceRegId);
      formData.append("device_code", deviceCode);
      formData.append("Type", activeTab);
      formData.append("image", file);

      const res = await apiFetch("/api/analyze_image", {
        method: "POST",
        body: formData,
      });

      if (res && (res.status === 200 || res.ok || res.status === "success")) {
        const modeLabel = activeTab === "growth" ? "การเจริญเติบโต" : "สุขภาพและโรค";

        await Swal.fire({
          title: "สำเร็จ!",
          text: "ส่งข้อมูลวิเคราะห์เรียบร้อยแล้ว",
          icon: "success",
          confirmButtonColor: "#10b981",
        });


        if (typeof init === 'function') init();
        window.location.reload();
      }
      else if (res && (res.status === 422 || res.error === "Validation Error" || res.message)) {
        Swal.fire({
          title: "รูปภาพไม่ผ่านเกณฑ์",
          text: res.message || "กรุณาตรวจสอบการเลือกประเภทการวิเคราะห์",
          icon: "warning",
          confirmButtonColor: "#f59e0b",
        });
      }
      else {
        throw new Error("เกิดข้อผิดพลาดที่ไม่รู้จัก");
      }

    } catch (error) {
      console.error("Upload error:", error);
      // แจ้งเตือน Error ที่มาจาก Backend (เช่น "กรุณาระบุ Type")
      Swal.fire({
        title: "ตรวจสอบข้อมูล",
        text: error.message, // จะแสดง "กรุณาระบุ Type"
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = null;
    }
  };

  const filteredData = useMemo(() => {
    const sourceData = activeTab === "growth" ? growthHistory : diseaseHistory;
    let data = sourceData;

    if (selectedDeviceRegId !== "all") {
      data = data.filter(
        (item) => item.device_info?.reg_id === parseInt(selectedDeviceRegId)
      );
    }

    return [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [growthHistory, diseaseHistory, activeTab, selectedDeviceRegId]);

  const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm w-full">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <FileQuestion className="w-8 h-8 text-gray-300" />
      </div>
      <p className="text-gray-500 font-medium">{message || "ไม่พบข้อมูลในระบบ"}</p>
    </div>
  );

  const UploadSection = () => (
    <div className="space-y-4">
      <div
        onClick={!isUploading ? triggerFileInput : undefined}
        className={`bg-white rounded-3xl p-8 border-2 border-dashed transition-all text-center ${isUploading ? "border-gray-200 cursor-not-allowed" : "border-emerald-200 hover:border-emerald-400 cursor-pointer group"
          }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,video/*"
          className="hidden"
        />

        {isUploading ? (
          <div className="py-4">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
            <h3 className="font-bold text-gray-800 mb-1">กำลังส่งข้อมูลเพื่อวิเคราะห์...</h3>
            <p className="text-xs text-gray-400">กรุณาอย่าปิดหน้าต่างนี้ ระบบ AI กำลังประมวลผล</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">
              {activeTab === "growth" ? "วิเคราะห์การเติบโตใหม่" : "วิเคราะห์สุขภาพข้าวใหม่"}
            </h3>
            <p className="text-xs text-gray-500 mb-6 px-4">
              อัปโหลดรูปภาพใบข้าว หรือวิดีโอเดินชมแปลงนาเพื่อให้ AI ตรวจสอบ
            </p>
            <button className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
              เลือกจากคลังภาพ / ถ่ายรูป
            </button>
          </>
        )}
      </div>

      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-amber-800">คำแนะนำจากผู้เชี่ยวชาญ</h4>
            <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
              {activeTab === "growth"
                ? "ควรถ่ายภาพจากด้านข้างให้เห็นความสูงของต้นข้าวเมื่อเทียบกับวัตถุอ้างอิง"
                : "ควรซูมภาพให้เห็นรอยโรคบนใบข้าวอย่างชัดเจนและมีแสงสว่างเพียงพอ"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 ">
      <Header />
      <div className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h4 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Sprout className="text-emerald-500" />
              ระบบติดตามและวิเคราะห์สุขภาพข้าว
            </h4>
            <p className="text-sm text-gray-500 mt-1">ใช้ AI ตรวจสอบแปลงนาเพื่อเพิ่มผลผลิตและป้องกันโรค</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1.5 bg-white rounded-2xl border border-gray-200 shadow-sm mb-8 w-fit">
            <button
              onClick={() => setActiveTab("growth")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === "growth" ? "bg-emerald-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
                }`}
            >
              <History className="w-5 h-5" /> ประวัติการเจริญเติบโต
            </button>
            <button
              onClick={() => setActiveTab("disease")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === "disease" ? "bg-emerald-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
                }`}
            >
              <Bug className="w-5 h-5" /> ตรวจสุขภาพและโรคข้าว
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-medium">กำลังเตรียมข้อมูล...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sidebar: Upload & Info */}
              <div className="lg:col-span-1 space-y-8">
                <UploadSection />

                {/* Guide Cards */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                    <Info className="w-5 h-5 text-emerald-500" />
                    {activeTab === "growth" ? "ระยะการเติบโต" : "โรคข้าวที่พบบ่อย"}
                  </h3>
                  <div className="space-y-4">
                    {activeTab === "growth" ? (
                      [
                        { label: "ระยะกล้า", desc: "ข้าวเริ่มแทงยอด", color: "bg-green-100" },
                        { label: "ระยะตั้งท้อง", desc: "ลำต้นกลม แข็ง", color: "bg-emerald-100" },
                        { label: "ระยะออกรวง", desc: "ดอกข้าวเริ่มสลัดเกสร", color: "bg-yellow-100" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-2 h-10 rounded-full ${item.color}`}></div>
                          <div>
                            <p className="text-xs font-bold text-gray-700">{item.label}</p>
                            <p className="text-[10px] text-gray-400">{item.desc}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      [
                        { label: "โรคไหม้ (Rice Blast)", desc: "แผลรูปตา ใบแห้งไหม้" },
                        { label: "โรคขอบใบแห้ง", desc: "ใบมีสีเหลืองขนานเส้นใบ" },
                        { label: "เพลี้ยกระโดด", desc: "ต้นข้าวแห้งเป็นหย่อมๆ" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-700">{item.label}</p>
                            <p className="text-[10px] text-gray-400">{item.desc}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Main Content: History List */}
              <div className="lg:col-span-2">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    {activeTab === "growth" ? <Clock className="text-emerald-500" /> : <ShieldCheck className="text-emerald-500" />}
                    {activeTab === "growth" ? "ไทม์ไลน์พัฒนาการ" : "บันทึกการตรวจโรค"}
                  </h2>
                  <select
                    value={selectedDeviceRegId}
                    onChange={(e) => setSelectedDeviceRegId(e.target.value)}
                    className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-2"
                  >
                    <option value="all">ทุกแปลงนา</option>
                    {devicesList.map((dev) => (
                      <option key={dev.reg_id} value={dev.reg_id}>{dev.farm_name}   พื้นที : {dev.area_name}</option>
                    ))}
                  </select>
                </div>

                {filteredData.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredData.map((item) => (
                      <div key={item.analysis_id || item.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all">
                        <div className="flex flex-col md:flex-row gap-5">
                          <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                            <img src={item.image_url} className="w-full h-full object-cover" alt="Rice Data" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <span className={`text-[13px] font-bold px-2 py-1 rounded-full ${activeTab === "growth" ? "bg-emerald-50 text-emerald-600" : (item.status === 'danger' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600")
                                }`}>
                                {activeTab === "growth"
                                  ? (item.growth_stage_th || item.growth_stage)
                                  : (item.disease_name || "กำลังวิเคราะห์")}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {new Date(item.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                            </div>
                            <h4 className="font-bold text-gray-800 text-sm mb-1">
                              ความแม่นยำ {(item.confidence * 100).toFixed(1)}%
                            </h4>
                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                              {item.advice || item.analysis_result || "ไม่มีคำแนะนำเพิ่มเติม"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message={activeTab === "growth" ? "ยังไม่มีข้อมูลการเติบโต" : "ไม่พบประวัติการตรวจโรค"} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}