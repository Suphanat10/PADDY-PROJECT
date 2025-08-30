"use client";

import { useState } from "react";
import Header from "../components/Header";
import { CheckCircle, Wifi, Shield, Activity } from "lucide-react";
import AlertBox from "@/app/components/AlertBox";
import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

export default function DeviceRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [deviceCode, setDeviceCode] = useState("");
  const [farmName, setFarmName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [data, setData] = useState([]);

 const handleSubmit = async (e) => {
  e.preventDefault();

  // reset alert ก่อน
  setAlertMessage(null);

  // ตรวจความครบถ้วน
  if (!deviceCode?.trim() || !farmName?.trim()) {
    setAlertMessage({
      title: "กรอกข้อมูลไม่ครบถ้วน",
      message: "กรุณากรอกรหัสอุปกรณ์และชื่อฟาร์มให้ครบถ้วน",
      type: "warning",
    });
    return; // <— สำคัญ
  }

  setIsLoading(true);
  try {
    const res = await apiFetch("/api/agriculture/register-device", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        device_code: deviceCode.trim(),
        device_name: farmName.trim(), // ใช้ชื่อฟาร์มเป็น device_name ตาม API ที่ให้มา
        user_id: 11,
      }),
    });

    if (res?.success) {
      setAlertMessage({
        title: "ลงทะเบียนอุปกรณ์สำเร็จ",
        message: "อุปกรณ์ของคุณได้ถูกลงทะเบียนเรียบร้อยแล้ว",
        type: "success",
      });
      setData(res.data);
      console.log(res.data);
      setCurrentStep(2);
    } else {
      setAlertMessage({
        title: "ลงทะเบียนอุปกรณ์ไม่สำเร็จ",
        message: "กรุณาลองใหม่อีกครั้ง",
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
          กรอกรหัสอุปกรณ์และชื่อฟาร์ม เพื่อเริ่มใช้งานระบบ Paddy Smart
        </p>
      </div>

      {/* Card */}
     
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Device Code */}
          <div>
            <label
              htmlFor="deviceCode"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              รหัสอุปกรณ์ (Device Code)
            </label>
            <input
              type="text"
              id="deviceCode"
              value={deviceCode}
              onChange={(e) => setDeviceCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 outline-none transition-all duration-200 placeholder-gray-400"
              placeholder="เช่น ABC123XYZ"
              disabled={isLoading}
              maxLength={20}
            />
            <p className="text-sm text-gray-500 mt-2">
              ใช้ตัวอักษร A–Z และตัวเลข 0–9 ความยาว 6–20 ตัวอักษร
            </p>
          </div>

          {/* Farm Name */}
          <div>
            <label
              htmlFor="farmName"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              ชื่อฟาร์ม
            </label>
            <input
              type="text"
              id="farmName"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              className="w-full px-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 outline-none transition-all duration-200 placeholder-gray-400"
              placeholder="เช่น ฟาร์มนาข้าวทุ่งใหญ่"
              disabled={isLoading}
              maxLength={100}
            />
            <p className="text-sm text-gray-500 mt-2">
              แนะนำให้ตั้งชื่อให้จำง่าย หากมีหลายแปลง/หลายพื้นที่
            </p>
          </div>

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
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  กำลังตรวจสอบ...
                </span>
              ) : (
                "ยืนยันการลงทะเบียน"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

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
              <span className="block text-sm text-gray-600">ประเภท:</span>
              <p className="font-semibold text-gray-800">อุปกรณ์ตรวจสอบนาข้าว</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="block text-sm text-gray-600">ชื่อฟาร์ม:</span>
              <p className="font-semibold text-gray-800">{farmName}</p>
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
            setFarmName("");
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
        <div className="max-w-6xl mx-auto">
          <div className=" p-6 sm:p-8 lg:p-12">
            {currentStep === 1 ? renderStepOne() : renderStepTwo()}
          </div>
        </div>
      </div>
    </div>
  );
}
