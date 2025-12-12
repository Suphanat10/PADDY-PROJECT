"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Move,
  MapPin,
  Search,
  ArrowRight,
  CheckCircle2,
  Truck,
  Building2,
  Cpu,
  AlertCircle,
  RefreshCw,
  Ban,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "@/app/components/Footer";
import { loadDeviceTransferData } from "@/lib/deviceTransfer/fetchDeviceData";
import { submitDeviceTransfer } from "@/lib/deviceTransfer/submitDeviceTransfer";

export default function DeviceTransfer() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [devices, setDevices] = useState([]);
  const [farms, setFarms] = useState([]);
  const [occupiedAreaIds, setOccupiedAreaIds] = useState(new Set());

  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [targetFarmId, setTargetFarmId] = useState("");
  const [targetAreaId, setTargetAreaId] = useState("");

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const result = await loadDeviceTransferData();
      setDevices(result.devices);
      setFarms(result.farms);
      setOccupiedAreaIds(result.occupiedAreaIds);

      if (result.autoSelectedDevice) {
        setSelectedDeviceId(String(result.autoSelectedDevice));
      }

      setIsLoading(false);
    };

    init();
  }, []);

  const currentDevice = useMemo(() => {
    return devices.find((d) => String(d.id) === String(selectedDeviceId));
  }, [devices, selectedDeviceId]);

  const availableAreas = useMemo(() => {
    if (!targetFarmId) return [];

    const farm = farms.find((f) => f.id === parseInt(targetFarmId));
    if (!farm) return [];

    return farm.areas.map((area) => {
      let isDisabled = false;
      let reason = "";

      if (currentDevice && area.id === currentDevice.current_area_id) {
        isDisabled = true;
        reason = "(ที่ตั้งปัจจุบัน)";
      } else if (area.isOccupied) {
        isDisabled = true;
        reason = "(มีอุปกรณ์แล้ว)";
      }

      return {
        ...area,
        isDisabled,
        reason,
      };
    });
  }, [targetFarmId, farms, currentDevice]);

  const handleDeviceChange = (e) => {
    setSelectedDeviceId(e.target.value);
    setSuccessMsg("");
    setTargetFarmId("");
    setTargetAreaId("");
  };

  const handleFarmChange = (e) => {
    setTargetFarmId(e.target.value);
    setTargetAreaId("");
  };

  const handleSubmit = async () => {
    await submitDeviceTransfer({
      selectedDeviceId,
      targetFarmId,
      targetAreaId,
      setIsLoading,
      setSuccessMsg,
    });

    setSelectedDeviceId("");
    setTargetFarmId("");
    setTargetAreaId("");
  };

  if (isLoading && devices.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4 shadow-sm"></div>
            <p className="text-gray-500 text-sm font-medium animate-pulse">
              กำลังโหลดข้อมูล...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 ">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              ย้ายตำแหน่งอุปกรณ์ (Device Transfer)
            </h1>
            <p className="text-gray-500 mt-1">
              จัดการย้ายอุปกรณ์ระหว่างฟาร์มหรือเปลี่ยนพื้นที่ติดตั้ง
            </p>
          </div>

          {/* Success Alert */}
          {successMsg && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="bg-emerald-100 p-1 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-emerald-800">
                  ดำเนินการสำเร็จ
                </h3>
                <p className="text-sm text-emerald-600">{successMsg}</p>
              </div>
              <button
                onClick={() => setSuccessMsg("")}
                className="ml-auto text-emerald-500 hover:text-emerald-700"
              >
                ✕
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Selection Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Select Device */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    เลือกอุปกรณ์ที่ต้องการย้าย
                  </h2>
                </div>
                <div className="p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ค้นหา หรือ เลือกอุปกรณ์ (Device ID)
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Search className="w-5 h-5" />
                    </div>
                    <select
                      value={selectedDeviceId}
                      onChange={handleDeviceChange}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none transition-all"
                    >
                      <option value="" disabled>
                        -- กรุณาเลือกอุปกรณ์ --
                      </option>
                      {devices.map((dev) => (
                        <option key={dev.id} value={dev.id}>
                          {dev.name} - {dev.current_farm_name} (
                          {dev.current_area_name})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* Step 2: Select Destination */}
              <section
                className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${
                  !selectedDeviceId
                    ? "opacity-50 pointer-events-none grayscale"
                    : ""
                }`}
              >
                <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    กำหนดปลายทางใหม่ (New Location)
                  </h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Select New Farm */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ไปยังฟาร์ม (To Farm)
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <select
                        value={targetFarmId}
                        onChange={handleFarmChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="">-- เลือกฟาร์มปลายทาง --</option>
                        {farms.map((farm) => (
                          <option key={farm.id} value={farm.id}>
                            {farm.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Select New Area */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ไปยังพื้นที่ (To Area)
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <select
                        value={targetAreaId}
                        onChange={(e) => setTargetAreaId(e.target.value)}
                        disabled={!targetFarmId}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        <option value="">
                          {!targetFarmId
                            ? "-- กรุณาเลือกฟาร์มก่อน --"
                            : "-- เลือกพื้นที่ย่อย --"}
                        </option>
                        {availableAreas.map((area) => (
                          <option
                            key={area.id}
                            value={area.id}
                            disabled={area.isDisabled}
                            className={
                              area.isDisabled ? "text-gray-400 bg-gray-50" : ""
                            }
                          >
                            {area.name} {area.isDisabled ? area.reason : ""}
                          </option>
                        ))}
                        {availableAreas.length === 0 && targetFarmId && (
                          <option disabled>ไม่พบพื้นที่ย่อย</option>
                        )}
                      </select>
                    </div>
                    {/* Helper Text */}
                    {targetFarmId && (
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <Ban className="w-3 h-3 text-gray-400" />
                        พื้นที่ที่เป็นสีเทาไม่สามารถเลือกได้
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Preview & Action */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">
                {/* Summary Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-5 bg-gradient-to-br from-gray-800 to-gray-900 text-white">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                        <Cpu className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">
                          {" "}
                          อุปกรณ์ที่เลือก
                        </p>
                        {/* <h3 className="font-bold text-lg">
                          {currentDevice ? currentDevice.name : "..."}
                        </h3> */}
                      </div>
                    </div>
                    {/* <div className="text-xs font-mono text-gray-500 bg-black/20 rounded px-2 py-1 inline-block">
                      ID: {currentDevice ? currentDevice.id : "---"}
                    </div> */}
                  </div>

                  <div className="p-5 space-y-6">
                    {/* Current Location */}
                    <div className="relative">
                      <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gray-200 rounded-full"></div>
                      <div className="pl-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                          From (เดิม)
                        </h4>
                        {currentDevice ? (
                          <>
                            <p className="font-semibold text-gray-800 flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-gray-400" />
                              {currentDevice.current_farm_name}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              {currentDevice.current_area_name}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-400 italic">
                            ยังไม่ได้เลือกอุปกรณ์
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Arrow Down */}
                    <div className="flex justify-center -my-2">
                      <div className="bg-emerald-50 p-1.5 rounded-full text-emerald-500 border border-emerald-100">
                        <ArrowRight className="w-4 h-4 rotate-90" />
                      </div>
                    </div>

                    {/* New Location */}
                    <div className="relative">
                      <div className="absolute -left-2 top-0 bottom-0 w-1 bg-emerald-200 rounded-full"></div>
                      <div className="pl-4">
                        <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                          To (ใหม่)
                        </h4>
                        {targetFarmId ? (
                          <>
                            <p className="font-semibold text-gray-800 flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                              {farms.find((f) => f.id == targetFarmId)?.name}
                            </p>
                            <p
                              className={`text-sm flex items-center gap-1.5 mt-1 ${
                                targetAreaId
                                  ? "text-gray-600"
                                  : "text-gray-400 italic"
                              }`}
                            >
                              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                              {targetAreaId
                                ? availableAreas.find(
                                    (a) => a.id == targetAreaId
                                  )?.name
                                : "รอเลือกพื้นที่..."}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-400 italic">
                            รอเลือกปลายทาง
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="p-5 border-t border-gray-100 bg-gray-50">
                    <button
                      onClick={handleSubmit}
                      disabled={
                        !selectedDeviceId ||
                        !targetFarmId ||
                        !targetAreaId ||
                        isLoading
                      }
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          กำลังบันทึก...
                        </>
                      ) : (
                        <>
                          <Truck className="w-4 h-4" />
                          ยืนยันการย้ายอุปกรณ์
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
