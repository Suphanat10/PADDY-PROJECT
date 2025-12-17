"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  Save,
  Tractor,
  LandPlot,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRightLeft,
  History,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AdminSidebar,
  AdminHeader,
} from "../../../../../components/admin/AdminLayout";
import Footer from "@/app/components/Footer";
import Swal from "sweetalert2";
import { GatDataDeviceRegistration , MoveDeviceRegistration } from "@/lib/admin/Move-device-registration/Move-device-registration.api";

export default function MoveDeviceRegistrationPage({ params, searchParams }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user_ID, reg_id } = React.use(params);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [farmsData, setFarmsData] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await GatDataDeviceRegistration(user_ID, reg_id);
        setFarmsData(data);

        const found = findCurrentDeviceLocation(data, reg_id);
        if (found) setCurrentLocation(found);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user_ID, reg_id]);

  const findCurrentDeviceLocation = (farms, regId) => {
    for (const farm of farms) {
      const areas = farm.sub_areas || farm.Area || [];
      for (const area of areas) {
        const device = area.device_registrations.find(
          (d) => d.device_registrations_ID.toString() === regId.toString()
        );
        if (device)
          return {
            farmName: farm.farm_name,
            areaName: area.area_name,
            deviceDetails: device,
          };
      }
    }
    return null;
  };

  const availableSubAreas = useMemo(() => {
    if (!selectedFarmId) return [];

    const farm = farmsData.find((f) => f.farm_id.toString() === selectedFarmId);
    if (!farm) return [];

    const areas = farm.Area || [];

    return areas.map((area) => {
      const isOccupied =
        area.device_registrations && area.device_registrations.length > 0;

      const isSelf = area.device_registrations.some(
        (d) => d.device_registrations_ID.toString() === reg_id.toString()
      );

      return {
        ...area,
        isOccupied: isOccupied,
        isSelf: isSelf,
      };
    });
  }, [selectedFarmId, farmsData, reg_id]);

  const handleSave = () => {
    setIsSaving(true);
    if(!selectedFarmId || !selectedAreaId){
      setIsSaving(false);
      return;
    }

    MoveDeviceRegistration(
      user_ID,
      reg_id,
      selectedFarmId,
      selectedAreaId
    ).then((success) => {
      setIsSaving(false);
      if (success) {
        Swal.fire({
          icon: "success",
          title: "ย้ายการลงทะเบียนอุปกรณ์สำเร็จ", 
            text: "การลงทะเบียนอุปกรณ์ถูกย้ายแล้ว",
        }).then(() => {
            router.back();
        });
      }
    });



  };


  if (isLoading) {
    return (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
                  <Loader2 className="animate-spin text-green-600" size={48} />
                </div>
    );
    }


  return (
    <div className="flex h-screen bg-slate-50 text-slate-600  overflow-hidden">
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeMenu="manageDevices"
      />

      <div className="flex flex-1 flex-col relative z-0">
        <AdminHeader setSidebarOpen={setSidebarOpen} />


        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto pb-10">
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"></div>
                    ย้ายการติดตั้งอุปกรณ์ IOT
                  </h1>
                  <p className="text-sm text-slate-500 mt-1 ml-12">
                    เปลี่ยนจุดติดตั้งอุปกรณ์ไปยังฟาร์มหรือพื้นที่ใหม่
                  </p>
                </div>
              </div>
            </div>

            {/* --- GRID LAYOUT --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Current Location */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50 relative z-10">
                  <div className="p-2 bg-orange-50 rounded-xl text-orange-500">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h2 className="font-bold text-slate-700 text-lg">
                    ตำแหน่งปัจจุบัน
                  </h2>
                </div>

                {currentLocation ? (
                  <div className="space-y-6 flex-1 relative z-10">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                        ฟาร์มเดิม (Current Farm)
                      </label>
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400">
                          <Tractor className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-700">
                          {currentLocation.farmName}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                        พื้นที่เดิม (Current Area)
                      </label>
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400">
                          <LandPlot className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-700">
                          {currentLocation.areaName}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto pt-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 bg-white/50 p-3 rounded-xl border border-slate-100">
                        <History className="w-4 h-4 text-slate-400" />
                        <span>
                          ติดตั้งเมื่อ:{" "}
                          {new Date(
                            currentLocation.deviceDetails.registered_at
                          ).toLocaleDateString("th-TH")}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-red-400 py-10">
                    <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                    <p>ไม่พบข้อมูลตำแหน่งเดิม</p>
                  </div>
                )}
              </div>

              {/* Right Column: Target Location */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col h-full ring-4 ring-indigo-50/30">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                  <div className="p-2 bg-indigo-50 rounded-xl text-indigo-500">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h2 className="font-bold text-slate-700 text-lg">
                    ตำแหน่งใหม่
                  </h2>
                </div>

                <div className="space-y-6 flex-1">
                  {/* Select Farm */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                      เลือกฟาร์มปลายทาง <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Tractor className="w-5 h-5" />
                      </div>
                      <select
                        value={selectedFarmId}
                        onChange={(e) => {
                          setSelectedFarmId(e.target.value);
                          setSelectedAreaId("");
                        }}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none text-slate-700 font-medium transition-all appearance-none cursor-pointer"
                      >
                        <option value="">-- กรุณาเลือกฟาร์ม --</option>
                        {farmsData.map((farm) => (
                          <option key={farm.farm_id} value={farm.farm_id}>
                            {farm.farm_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Select Area (Modified Logic) */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                      เลือกพื้นที่ย่อย <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <LandPlot className="w-5 h-5" />
                      </div>
                      <select
                        value={selectedAreaId}
                        onChange={(e) => setSelectedAreaId(e.target.value)}
                        disabled={!selectedFarmId}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none text-slate-700 font-medium transition-all appearance-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {selectedFarmId
                            ? "-- กรุณาเลือกพื้นที่ --"
                            : "-- รอเลือกฟาร์มก่อน --"}
                        </option>
                        {availableSubAreas.map((area) => (
                          <option
                            key={area.area_id}
                            value={area.area_id}
                            disabled={area.isOccupied && !area.isSelf}
                            className={
                              area.isOccupied && !area.isSelf
                                ? "text-red-400 bg-red-50"
                                : ""
                            }
                          >
                            {area.area_name}{" "}
                            {area.isOccupied && !area.isSelf
                              ? "(ไม่ว่าง - มีอุปกรณ์ติดตั้งแล้ว)"
                              : ""}{" "}
                            {area.isSelf ? "(ตำแหน่งปัจจุบัน)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Error / Info Messages */}
                    {selectedFarmId && availableSubAreas.length === 0 && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1 bg-red-50 p-2 rounded-lg">
                        <AlertCircle className="w-3 h-3" />{" "}
                        ฟาร์มนี้ไม่มีพื้นที่ย่อย
                      </p>
                    )}
                    {selectedAreaId &&
                      availableSubAreas.find(
                        (a) => a.area_id.toString() === selectedAreaId
                      )?.isSelf && (
                        <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />{" "}
                          คุณกำลังเลือกพื้นที่เดิม
                        </p>
                      )}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-2xl text-xs text-blue-700 leading-relaxed border border-blue-100 mt-auto">
                    <strong className="block mb-1 font-bold">
                      ข้อควรระวัง:
                    </strong>
                    ข้อมูลการตรวจวัดหลังจากนี้จะถูกบันทึกภายใต้พื้นที่ใหม่ทันที
                    ข้อมูลย้อนหลังจะถูกลบออกจากพื้นที่เดิมและไม่สามารถกู้คืนได้
                    กรุณาตรวจสอบให้แน่ใจก่อนดำเนินการย้าย
                  </div>
                </div>
              </div>
            </div>

            {/* --- ACTION BUTTONS --- */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => router.back()}
                disabled={isSaving}
                className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                disabled={!selectedFarmId || !selectedAreaId || isSaving}
                className={`
                        px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all
                        ${
                          isSaving
                            ? "bg-green-400 cursor-not-allowed"
                            : !selectedFarmId || !selectedAreaId
                            ? "bg-slate-300 cursor-not-allowed shadow-none"
                            : "bg-green-600 hover:bg-green-700 hover:-translate-y-0.5"
                        }
                    `}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" /> ยืนยันการย้าย
                  </>
                )}
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
