"use client";

import { useState } from 'react';

import Header from '../components/Header';
import { CheckCircle, Wifi, Shield, Activity } from 'lucide-react';

export default function DeviceRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [deviceCode, setDeviceCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deviceCode.trim()) {
      alert('กรุณากรอกรหัสอุปกรณ์');
      return;
    }
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep(2);
    }, 2000);
  };

  const renderStepOne = () => (
    <div className="max-w-2xl mx-auto">

      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Wifi className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          ลงทะเบียนอุปกรณ์
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          กรุณากรอกรหัสอุปกรณ์เพื่อเริ่มต้นการใช้งาน Paddy Smart
        </p>
      </div>

   

      {/* Device Code Form */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="deviceCode" className="block text-sm font-semibold text-gray-700 mb-3">
              รหัสอุปกรณ์ (Device Code)
            </label>
            <input
              type="text"
              id="deviceCode"
              value={deviceCode}
              onChange={(e) => setDeviceCode(e.target.value.toUpperCase())}
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 placeholder-gray-400"
              placeholder="เช่น ABC123XYZ"
              disabled={isLoading}
              maxLength={20}
            />
            <p className="text-sm text-gray-500 mt-2">
              รหัสอุปกรณ์ประกอบด้วยตัวอักษรและตัวเลขความยาว 6-20 ตัวอักษร
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            
            
            <button
              type="submit"
              className={`flex-1 py-4 px-6 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 transform ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed scale-95' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-105 shadow-lg hover:shadow-xl'
              } text-white`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังตรวจสอบ...
                </span>
              ) : (
                'ยืนยันโค้ดอุปกรณ์'
              )}
            </button>
          </div>
        </form>
      </div>

    
    </div>
  );

  const renderStepTwo = () => (
    <div className="max-w-2xl mx-auto text-center">
      {/* Success Animation */}
      <div className="mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-800">ลงทะเบียนสำเร็จ</h1>
          <p className="text-xl text-gray-600">อุปกรณ์ของคุณพร้อมใช้งานแล้ว</p>
        </div>
      </div>

      {/* Device Information Card */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 mb-8 border border-green-200">
        <h3 className="text-xl font-bold text-green-800 mb-6">ข้อมูลอุปกรณ์ที่ลงทะเบียน</h3>
        
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
              <span className="block text-sm text-gray-600">สถานะ:</span>
              <p className="font-semibold text-green-600 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                เชื่อมต่อสำเร็จ
              </p>
            </div>
            <div>
              <span className="block text-sm text-gray-600">วันที่ลงทะเบียน:</span>
              <p className="font-semibold text-gray-800">{new Date().toLocaleDateString('th-TH')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-800 mb-2">ตรวจสอบแบบเรียลไทม์</h4>
          <p className="text-sm text-gray-600">รับข้อมูลทันที 24/7</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <h4 className="font-semibold text-gray-800 mb-2">ความปลอดภัยสูง</h4>
          <p className="text-sm text-gray-600">เข้ารหัสข้อมูลทุกการส่ง</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Wifi className="w-6 h-6 text-purple-600" />
          </div>
          <h4 className="font-semibold text-gray-800 mb-2">เชื่อมต่อง่าย</h4>
          <p className="text-sm text-gray-600">ใช้งานผ่าน WiFi/4G</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="flex-1 py-4 px-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold text-lg transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
            ไปที่แดชบอร์ด
        </button>
        
        <button
          onClick={() => {
            setCurrentStep(1);
            setDeviceCode('');
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
        <div className="max-w-6xl mx-auto">
          
          {/* Main Content */}
          <div className="bg-white rounded-2xl   border border-gray-200 p-6 sm:p-8 lg:p-12">
            {currentStep === 1 ? renderStepOne() : renderStepTwo()}
          </div>
        </div>
      </div>
    </div>
  );
}