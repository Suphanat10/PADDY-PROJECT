"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Sprout,
  Calendar,
  Clock,
  ImageIcon,
  Search,
  Filter,
  ChevronRight,
  History,
  Leaf,
  Info,
  MapPin,
  Building2,
  Tractor
} from "lucide-react";
import Header from "../components/Header";
import Footer from "@/app/components/Footer";
import { loadGrowthAnalysis } from "@/lib/growthAnalysis/loadGrowthAnalysis";
import { fetchGrowthAnalysisApi } from "@/lib/growthAnalysis/fetchGrowthAnalysisApi";


export default function GrowthHistory() {
  const [selectedDeviceRegId, setSelectedDeviceRegId] = useState("all");
  const [rawData, setRawData] = useState([]);
  const [processedHistory, setProcessedHistory] = useState([]);
  const [devicesList, setDevicesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);



useEffect(() => {
  const init = async () => {
    try {
      setIsLoading(true);

      const { devicesList, historyList } =
        await loadGrowthAnalysis(fetchGrowthAnalysisApi);

        if(!devicesList || !historyList){
          setDevicesList([]);
          setProcessedHistory([]);
          return;
        }

      setDevicesList(devicesList);
      setProcessedHistory(historyList);

    } catch (err) {
      console.error("Load Growth Analysis error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  init();
}, []);

  // --- Filtering ---
  const filteredHistory = useMemo(() => {
    let data = processedHistory;
    
    if (selectedDeviceRegId !== "all") {
      data = data.filter(item => item.device_info.reg_id === parseInt(selectedDeviceRegId));
    }
    
    // เรียงลำดับจากใหม่ไปเก่า
    return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [processedHistory, selectedDeviceRegId]);

  // --- Helper Functions ---
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <>
    <Header />
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 ">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 rounded-xl">
                 <History className="w-8 h-8 text-emerald-600" />
              </div>
              ประวัติการเจริญเติบโต
            </h1>
            <p className="text-gray-500 mt-2 text-sm md:text-base ml-1">
              ติดตามพัฒนาการของข้าวจากข้อมูลการวิเคราะห์ภาพถ่าย
            </p>
          </div>

          {/* Device Filter */}
          <div className="flex items-center gap-2 bg-white px-1 py-1 rounded-xl border border-gray-200 shadow-sm hover:border-emerald-400 transition-colors">
             <div className="pl-3 pr-1 text-gray-400">
                <Filter className="w-4 h-4" />
             </div>
             <select
                value={selectedDeviceRegId}
                onChange={(e) => setSelectedDeviceRegId(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-700 py-2.5 pr-10 pl-1 focus:ring-0 border-none outline-none cursor-pointer"
             >
                <option value="all">แสดงทุกอุปกรณ์</option>
                {devicesList.map(dev => (
                   <option key={dev.reg_id} value={dev.reg_id}>
                      {dev.device_code} - {dev.farm_name} - ({dev.area_name})
                   </option>
                ))}
             </select>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
             <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin mb-4 shadow-sm"></div>
             <p className="text-gray-500 animate-pulse font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        ) : filteredHistory.length > 0 ? (
          <div className="relative pl-4 md:pl-8 space-y-10">
            {/* Timeline Vertical Line */}
            <div className="absolute left-4 md:left-8 top-6 bottom-6 w-0.5 bg-gray-200 -translate-x-1/2 rounded-full"></div>

            {filteredHistory.map((item) => (
              <div key={`${item.device_info.reg_id}-${item.analysis_id}`} className="relative pl-8 md:pl-12 group">
                
                {/* Timeline Dot with Date Badge */}
                <div className="absolute left-0 md:left-0 top-0 w-8 h-8 md:-translate-x-1/2 bg-white border-4 border-emerald-50 rounded-full flex items-center justify-center z-10 group-hover:border-emerald-200 group-hover:scale-110 transition-all shadow-sm">
                   <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden hover:shadow-lg hover:border-emerald-100 transition-all duration-300">
                   {/* Card Header: Device Info */}
                   <div className="bg-gray-50/80 px-5 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                         <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">
                            <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                            {item.device_info.code}
                         </div>
                         <div className="h-4 w-px bg-gray-300"></div>
                         <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Building2 className="w-3.5 h-3.5" />
                            {item.device_info.farm_name}
                         </div>
                         <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3.5 h-3.5" />
                            {item.device_info.area_name}
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                         <Clock className="w-3.5 h-3.5" />
                         {formatTime(item.created_at)}
                      </div>
                   </div>

                   <div className="flex flex-col md:flex-row">
                      {/* Image Section */}
                      <div className="w-full md:w-72 h-56 md:h-auto relative bg-gray-100 shrink-0 group-hover:brightness-105 transition-all">
                         <img 
                            src={item.image_url}
                            alt={`Analysis ${item.analysis_id}`} 
                           className="w-full h-full object-cover"
                         />
                         {/* Confidence Badge */}
                         {item.confidence && (
                           <div className="absolute top-3 left-3 bg-black/50 text-white text-[10px] font-medium px-2 py-1 rounded-full backdrop-blur-md border border-white/20 flex items-center gap-1">
                              <Search className="w-3 h-3" />
                              ความมั่นใจ {item.confidence}%
                           </div>
                         )}
                      </div>

                      {/* Content Section */}
                      <div className="p-6 flex-1 flex flex-col justify-center">
                         <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                            <div>
                               <div className="text-sm text-gray-400 mb-1 flex items-center gap-1.5">
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(item.created_at)}
                               </div>
                               <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                  {item.growth_stage}
                               </h3>
                            </div>
                            
                            <div className ="text-sm font-medium text-emerald-600 border border-emerald-100 bg-emerald-50 px-3 py-1 rounded-full shadow-sm">
                               ระยะการเจริญเติบโต:
                               {item.growth_stage}
                            </div>
                         </div>

                         <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-50">
                            <p className="text-sm text-gray-600 flex items-start gap-2.5 leading-relaxed">
                               <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                               <span>
                                  <span className="font-semibold text-gray-700 block mb-0.5">ผลวิเคราะห์ / หมายเหตุ:</span> 
                                  {item.remarks || "ไม่มีหมายเหตุเพิ่มเติม"}
                               </span>
                            </p>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5 animate-in fade-in zoom-in duration-500">
                <Sprout className="w-10 h-10 text-gray-300" />
             </div>
             <h3 className="text-lg font-bold text-gray-800">ไม่พบข้อมูลประวัติ</h3>
             <p className="text-gray-500 text-sm mt-1 max-w-sm text-center">
                ยังไม่มีข้อมูลการเจริญเติบโตสำหรับอุปกรณ์ที่เลือก หรือยังไม่มีการวิเคราะห์เกิดขึ้น
             </p>
          </div>
        )}

      </div>
          <Footer />
    </div>

    </>
  );
}