'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { Filter, Calendar, Download, TrendingUp, Thermometer, Droplets, Sun, Loader2, AlertCircle, Sprout, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Header from "../components/Header";
import { fetchdata } from '@/lib/statistics/fetchdata';
import Footer from '../../../components/Footer';

export default function StatisticsPage() {
  const [allData, setAllData] = useState([]);
  
  // State สำหรับตัวเลือก
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedSensor, setSelectedSensor] = useState('N');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      try {
         await fetchdata(setIsLoading, setAllData, setError);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("ไม่สามารถดึงข้อมูลได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []); // Empty dependency array = run once on mount

  // Effect: เลือกอุปกรณ์ตัวแรกเป็นค่าเริ่มต้นเมื่อข้อมูลมาแล้ว
  useEffect(() => {
    if (allData.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(allData[0].device_ID.toString());
    }
  }, [allData, selectedDeviceId]);

  // หาข้อมูลอุปกรณ์ที่ถูกเลือกจาก State (Client-side)
  const currentDevice = useMemo(() => {
    return allData.find(d => d.device_ID.toString() === selectedDeviceId);
  }, [allData, selectedDeviceId]);

  // ดึง object stats ออกมา
  const apiStats = currentDevice ? currentDevice.stats : null;

  // แปลงข้อมูลสำหรับกราฟ (Client-side Processing)
  const displayData = useMemo(() => {
    if (!apiStats) return [];

    const dataMap = new Map();
    // คำนวณวันที่ตัดรอบตาม selectedPeriod (เช่น ย้อนหลัง 7 วัน)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(selectedPeriod));

    Object.keys(apiStats).forEach(sensorKey => {
      const sensorData = apiStats[sensorKey].all_data;
      if (Array.isArray(sensorData)) {
        sensorData.forEach(point => {
          const dateStr = point.measured_at;
          const dateObj = new Date(dateStr);
          
          // กรองเอาเฉพาะข้อมูลที่อยู่ในช่วงเวลาที่เลือก
          if (dateObj >= cutoffDate) {
            const key = dateStr; 

            if (!dataMap.has(key)) {
              dataMap.set(key, {
                timestamp: dateObj.getTime(),
                date: dateObj.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }),
                fullDate: dateObj.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
              });
            }
            const entry = dataMap.get(key);
            entry[sensorKey] = point.value;
          }
        });
      }
    });

    // เรียงลำดับตามเวลา
    return Array.from(dataMap.values()).sort((a, b) => a.timestamp - b.timestamp);
  }, [apiStats, selectedPeriod]);

  const getSensorConfig = (sensorKey) => {
    const currentStats = apiStats && apiStats[sensorKey] ? apiStats[sensorKey] : { avg: 0, max: 0, min: 0, latest: 0, unit: '' };

    const configs = {
      "N": { title: 'Nitrogen (N)', unit: currentStats.unit || 'mg/kg', color: '#16a34a', icon: Sprout, stats: currentStats },
      "P": { title: 'Phosphorus (P)', unit: currentStats.unit || 'mg/kg', color: '#f97316', icon: Sprout, stats: currentStats },
      "K": { title: 'Potassium (K)', unit: currentStats.unit || 'mg/kg', color: '#9333ea', icon: Sprout, stats: currentStats },
      "Water Level": { title: 'ระดับน้ำ', unit: currentStats.unit || 'cm', color: '#3b82f6', icon: Droplets, stats: currentStats },
      "Soil Moisture": { title: 'ความชื้นดิน', unit: currentStats.unit || '%', color: '#854d0e', icon: Sun, stats: currentStats }
    };
    
    return configs[sensorKey] || { title: sensorKey, unit: '', color: '#6b7280', icon: Activity, stats: currentStats };
  };

  const config = getSensorConfig(selectedSensor);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ข้อมูลสถิติเซ็นเซอร์</h1>
          <p className="text-gray-600">ดูข้อมูลย้อนหลังและสถิติเชิงลึกจากอุปกรณ์ IoT</p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Device Selection: สร้างจาก allData */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                เลือกอุปกรณ์
              </label>
              <select 
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                disabled={isLoading}
              >
                {isLoading ? (
                  <option>กำลังโหลดข้อมูล...</option>
                ) : allData.length > 0 ? (
                  allData.map(device => (
                    <option key={device.device_ID} value={device.device_ID}>
                      {device.area_name} (ID: {device.device_ID})
                    </option>
                  ))
                ) : (
                  <option>ไม่พบข้อมูลอุปกรณ์</option>
                )}
              </select>
            </div>

            {/* Period Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                ช่วงเวลา
              </label>
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="7">7 วันที่ผ่านมา</option>
                <option value="15">15 วันที่ผ่านมา</option>
                <option value="30">30 วันที่ผ่านมา</option>
              </select>
            </div>

            {/* Sensor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                ประเภทเซ็นเซอร์
              </label>
              <select 
                value={selectedSensor}
                onChange={(e) => setSelectedSensor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                disabled={!apiStats} 
              >
                {apiStats ? (
                    Object.keys(apiStats).map(key => (
                        <option key={key} value={key}>{getSensorConfig(key).title}</option>
                    ))
                ) : (
                    <>
                        <option value="N">Nitrogen (N)</option>
                        <option value="P">Phosphorus (P)</option>
                        <option value="K">Potassium (K)</option>
                        <option value="Water Level">Water Level</option>
                        <option value="Soil Moisture">Soil Moisture</option>
                    </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-sm border border-gray-200">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
            <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-sm border border-red-200">
            <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
            <p className="text-red-500 font-medium">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">ค่าเฉลี่ย</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {config.stats.avg ? config.stats.avg.toFixed(1) : '-'}{config.unit}
                    </p>
                  </div>
                  <config.icon className="w-8 h-8" style={{ color: config.color }} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">ค่าสูงสุด</p>
                    <p className="text-2xl font-bold text-red-600">
                        {config.stats.max}{config.unit}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-red-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">ค่าต่ำสุด</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {config.stats.min}{config.unit}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500 transform rotate-180" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">ค่าล่าสุด</p>
                    <p className="text-2xl font-bold text-emerald-600">
                        {config.stats.latest}{config.unit}
                    </p>
                  </div>
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  กราฟแสดง{config.title} - {currentDevice ? currentDevice.area_name : ''}
                </h2>
                <button className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50">
                  <Download className="w-4 h-4" />
                  <span>ดาวน์โหลด</span>
                </button>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={displayData}>
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={config.color} stopOpacity={0.1}/>
                        <stop offset="95%" stopColor={config.color} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#666"
                      fontSize={12}
                      label={{ value: config.unit, angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}${config.unit}`, config.title]}
                      labelFormatter={(label) => `วันที่: ${label}`}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey={selectedSensor}
                      stroke={config.color}
                      fill="url(#colorGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* All Sensors Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">ภาพรวมเซ็นเซอร์ทั้งหมด</h2>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={displayData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="N" stroke="#16a34a" strokeWidth={2} name="Nitrogen" dot={false} />
                    <Line type="monotone" dataKey="P" stroke="#f97316" strokeWidth={2} name="Phosphorus" dot={false} />
                    <Line type="monotone" dataKey="K" stroke="#9333ea" strokeWidth={2} name="Potassium" dot={false} />
                    <Line type="monotone" dataKey="Water Level" stroke="#3b82f6" strokeWidth={2} name="Water Level" dot={false} />
                    <Line type="monotone" dataKey="Soil Moisture" stroke="#854d0e" strokeWidth={2} name="Soil Moisture" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}