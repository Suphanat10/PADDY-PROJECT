"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import { CheckCircle, Wifi } from "lucide-react";
import AlertBox from "@/app/components/AlertBox";
import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

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


  const userId = 11;


  const extractList = (res) => {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  };

  
  useEffect(() => {
    const fetchFarms = async () => {
      setLoadingFarms(true);
      try {
        const res = await apiFetch(`/api/data/farms/${userId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const list = extractList(res);
        setFarms(list);

        // auto-select ถ้ามีฟาร์มเดียว
        if (list.length === 1) setFarmId(String(list[0].farm_id));
      } catch (err) {
        console.error("Error fetching farms:", err);
        setAlertMessage({
          title: "โหลดรายชื่อฟาร์มไม่สำเร็จ",
          message: err?.data?.message || err?.message || "โปรดลองใหม่อีกครั้ง",
          type: "error",
        });
      } finally {
        setLoadingFarms(false);
      }
    };
    fetchFarms();
  }, [userId]);


  useEffect(() => {
    if (!farmId) {
      setFarmPlots([]);
      setFarmPlotId("");
      return;
    }

    const fetchPlots = async () => {
      setLoadingPlots(true);
      try {
        const res = await apiFetch(`/api/data/farm-plots/${farmId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const list = extractList(res);
        setFarmPlots(list);

        if (list.length === 1) setFarmPlotId(String(list[0].farm_plot_id));
      } catch (err) {
        if (err?.status === 404) {
          setFarmPlots([]);
          setFarmPlotId("");
          console.warn("ฟาร์มนี้ยังไม่มีแปลง");
        } else {
          console.error("Error fetching farm plots:", err);
          setAlertMessage({
            title: "โหลดรายชื่อแปลงไม่สำเร็จ",
            message: err?.data?.message || err?.message || "โปรดลองใหม่อีกครั้ง",
            type: "error",
          });
        }
      } finally {
        setLoadingPlots(false);
      }
    };

    fetchPlots();
  }, [farmId]);


  const selectedFarm = useMemo(
    () => farms.find((f) => String(f.farm_id) === String(farmId)),
    [farms, farmId]
  );

  const selectedPlot = useMemo(
    () => farmPlots.find((p) => String(p.farm_plot_id) === String(farmPlotId)),
    [farmPlots, farmPlotId]
  );


  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertMessage(null);

    if (!deviceCode?.trim() || !farmId) {
      setAlertMessage({
        title: "กรอกข้อมูลไม่ครบถ้วน",
        message: "กรุณากรอกรหัสอุปกรณ์และเลือกฟาร์ม",
        type: "warning",
      });
      return;
    }

  
    if (farmPlots.length > 0 && !farmPlotId) {
      setAlertMessage({
        title: "กรอกข้อมูลไม่ครบถ้วน",
        message: "กรุณาเลือกแปลงในฟาร์ม",
        type: "warning",
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        device_code: deviceCode.trim(),
        user_id: Number(userId),
        farm_plot_id: farmPlotId 
      };

      const res = await apiFetch("/api/agriculture/register-device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res?.success) {
        setAlertMessage({
          title: "ลงทะเบียนอุปกรณ์สำเร็จ",
          message: "อุปกรณ์ของคุณได้ถูกลงทะเบียนเรียบร้อยแล้ว",
          type: "success",
        });
        setData(res.data ?? null);
        setCurrentStep(2);
      } else {
        setAlertMessage({
          title: "ลงทะเบียนอุปกรณ์ไม่สำเร็จ",
          message: res?.message || "กรุณาลองใหม่อีกครั้ง",
          type: "error",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: err?.data?.message || err?.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- Render Step 1 ----------
  const renderStepOne = () => (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)]">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Wifi className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            ลงทะเบียนอุปกรณ์
          </h1>
          <p className="text-lg text-gray-600">
            กรอกรหัสอุปกรณ์และเลือกฟาร์ม/แปลง เพื่อเริ่มใช้งานระบบ Paddy Smart
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Device Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              รหัสอุปกรณ์ (Device Code)
            </label>
            <input
              type="text"
              value={deviceCode}
              onChange={(e) => setDeviceCode(e.target.value.toUpperCase())}
               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="เช่น ABC123XYZ"
              disabled={isLoading}
              maxLength={20}
            />
          </div>

          {/* Farm Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              เลือกฟาร์ม
            </label>

            <select
              value={farmId}
              onChange={(e) => {
                setFarmId(e.target.value);
                setFarmPlotId(""); 
              }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              disabled={isLoading || loadingFarms}
            >
              <option value="">
                {loadingFarms ? "กำลังโหลดรายชื่อฟาร์ม..." : "-- เลือกฟาร์ม --"}
              </option>
              {farms.map((f, idx) => (
                <option key={f?.farm_id ?? `farm-${idx}`} value={String(f.farm_id)}>
                  {f.farm_name}
                </option>
              ))}
            </select>

            {!loadingFarms && farms.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                ยังไม่มีฟาร์ม — โปรดสร้างฟาร์มก่อน
              </p>
            )}
          </div>

      
          {farmId && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                เลือกแปลงในฟาร์ม
              </label>
              <select
                value={farmPlotId}
                 
                onChange={(e) => setFarmPlotId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                disabled={isLoading || loadingPlots || farmPlots.length === 0}
              >
                <option value="">
                  {loadingPlots
                    ? "กำลังโหลดแปลง..."
                    : farmPlots.length === 0
                    ? "-- ไม่มีแปลงในฟาร์มนี้ --"
                    : "-- เลือกแปลง --"}
                </option>
                {farmPlots.map((p, idx) => (
                  <option
                    key={p?.farm_plot_id ?? `plot-${idx}`}
                    value={String(p.farm_plots_id)}
                  >
                    {p.plot_name}
                  </option>
                ))}
              </select>

              {!loadingPlots && farmPlots.length === 0 && (
                <p className="text-sm text-amber-600 mt-2">
                  ฟาร์มนี้ยังไม่มีแปลง — โปรดเพิ่มแปลงก่อน
                </p>
              )}
            </div>
          )}

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 transform text-white ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed scale-95"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-[1.02] shadow-lg hover:shadow-xl"
              }`}
            >
              {isLoading ? "กำลังบันทึก..." : "ยืนยันการลงทะเบียน"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ---------- Render Step 2 ----------
  const renderStepTwo = () => (
    <div className="max-w-2xl mx-auto text-center">
      {/* Success */}
      <div className="mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-800">ลงทะเบียนสำเร็จ</h1>
          <p className="text-xl text-gray-600">อุปกรณ์ของคุณพร้อมใช้งานแล้ว</p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 mb-8 border border-green-200">
        <h3 className="text-xl font-bold text-green-800 mb-6">
          ข้อมูลอุปกรณ์ที่ลงทะเบียน
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="space-y-3">
            <div>
              <span className="block text-sm text-gray-600">รหัสอุปกรณ์:</span>
              <p className="font-bold text-lg text-gray-800">{deviceCode}</p>
            </div>
            <div>
              <span className="block text-sm text-gray-600">ฟาร์ม:</span>
              <p className="font-semibold text-gray-800">
                {selectedFarm?.farm_name || "-"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="block text-sm text-gray-600">แปลงในฟาร์ม:</span>
              <p className="font-semibold text-gray-800">
                {selectedPlot?.plot_name || (farmPlots.length === 0 ? "ไม่มีแปลง" : "-")}
              </p>
            </div>
            <div>
              <span className="block text-sm text-gray-600">สถานะ:</span>
              <p className="font-semibold text-green-600 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                เชื่อมต่อสำเร็จ
              </p>
            </div>
          </div>

          <div className="md:col-span-2">
            <span className="block text-sm text-gray-600">วันที่ลงทะเบียน:</span>
            <p className="font-semibold text-gray-800">
              {new Date().toLocaleDateString("th-TH")}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => (window.location.href = "/dashboard")}
          className="flex-1 py-4 px-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold text-lg transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
        >
          ไปที่แดชบอร์ด
        </button>

        <button
          onClick={() => {
            setCurrentStep(1);
            setDeviceCode("");
            setFarmId("");
            setFarmPlotId("");
            setData(null);
          }}
          className="flex-1 py-4 px-8 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold text-lg"
        >
          ลงทะเบียนอุปกรณ์อื่น
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {alertMessage && (
          <AlertBox
            title={alertMessage.title}
            message={alertMessage.message}
            type={alertMessage.type}
            onClose={() => setAlertMessage(null)}
          />
        )}
        <div className="max-w-6xl mx-auto p-6 sm:p-8 lg:p-12">
          {currentStep === 1 ? renderStepOne() : renderStepTwo()}
        </div>
      </div>
    </div>
  );
}
