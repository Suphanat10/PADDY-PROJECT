'use client'
import React, { useState, useRef, useEffect } from 'react';
import Link from "next/link";
import { Bell, Settings, User, ChevronDown, Menu, X, Calendar, Filter, Download, TrendingUp, Thermometer, Droplets, Sun, AlertCircle } from 'lucide-react';
import { Sprout } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import Header from "../components/Header";

// ข้อมูลตัวอย่างสำหรับสถิติ
const generateSampleData = (deviceId, days = 30) => {
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }),
      fullDate: date.toLocaleDateString('th-TH'),
      temperature: Math.round((25 + Math.random() * 10) * 10) / 10,
      humidity: Math.round((60 + Math.random() * 30) * 10) / 10,
      soilMoisture: Math.round((40 + Math.random() * 40) * 10) / 10,
    });
  }
  
  return data;
};

const devices = [
  { id: 'DEV001', name: 'เซ็นเซอร์นาข้าว A1', location: 'แปลงที่ 1' },
  { id: 'DEV002', name: 'เซ็นเซอร์นาข้าว B2', location: 'แปลงที่ 2' },
  { id: 'DEV003', name: 'เซ็นเซอร์นาข้าว C3', location: 'แปลงที่ 3' },
  { id: 'DEV004', name: 'เซ็นเซอร์นาข้าว D4', location: 'แปลงที่ 4' },
];

export default function StatisticsPage() {
  const [selectedDevice, setSelectedDevice] = useState('DEV001');
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedSensor, setSelectedSensor] = useState('temperature');
  
  const [deviceData, setDeviceData] = useState(() => {
    const data = {};
    devices.forEach(device => {
      data[device.id] = generateSampleData(device.id, 30);
    });
    return data;
  });

  const currentData = deviceData[selectedDevice] || [];
  const displayData = currentData.slice(-parseInt(selectedPeriod));

  // คำนวณสถิติสรุป
  const calculateStats = (data, sensorType) => {
    if (!data.length) return { avg: 0, max: 0, min: 0, latest: 0 };
    
    const values = data.map(d => d[sensorType]);
    return {
      avg: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10,
      max: Math.max(...values),
      min: Math.min(...values),
      latest: values[values.length - 1]
    };
  };

  const tempStats = calculateStats(displayData, 'temperature');
  const humidityStats = calculateStats(displayData, 'humidity');
  const soilStats = calculateStats(displayData, 'soilMoisture');

  const getSensorConfig = (sensor) => {
    const configs = {
      temperature: {
        title: 'อุณหภูมิ',
        unit: '°C',
        color: '#ef4444',
        icon: Thermometer,
        stats: tempStats
      },
      humidity: {
        title: 'ความชื้นอากาศ',
        unit: '%',
        color: '#3b82f6',
        icon: Droplets,
        stats: humidityStats
      },
      soilMoisture: {
        title: 'ความชื้นดิน',
        unit: '%',
        color: '#10b981',
        icon: Sun,
        stats: soilStats
      }
    };
    return configs[sensor];
  };

  const config = getSensorConfig(selectedSensor);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ข้อมูลสถิติเซ็นเซอร์</h1>
          <p className="text-gray-600">ดูข้อมูลย้อนหลังและสถิติของเซ็นเซอร์ต่างๆ</p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Device Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                เลือกอุปกรณ์
              </label>
              <select 
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                {devices.map(device => (
                  <option key={device.id} value={device.id}>
                    {device.id} - {device.name}
                  </option>
                ))}
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
              >
                <option value="temperature">อุณหภูมิ</option>
                <option value="humidity">ความชื้นอากาศ</option>
                <option value="soilMoisture">ความชื้นดิน</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">ค่าเฉลี่ย</p>
                <p className="text-2xl font-bold text-gray-900">{config.stats.avg}{config.unit}</p>
              </div>
              <config.icon className="w-8 h-8" style={{ color: config.color }} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">ค่าสูงสุด</p>
                <p className="text-2xl font-bold text-red-600">{config.stats.max}{config.unit}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">ค่าต่ำสุด</p>
                <p className="text-2xl font-bold text-blue-600">{config.stats.min}{config.unit}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500 transform rotate-180" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">ค่าล่าสุด</p>
                <p className="text-2xl font-bold text-emerald-600">{config.stats.latest}{config.unit}</p>
              </div>
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              กราฟแสดง{config.title} - {devices.find(d => d.id === selectedDevice)?.name}
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
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="อุณหภูมิ (°C)"
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="ความชื้นอากาศ (%)"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="soilMoisture" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="ความชื้นดิน (%)"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

       
       
      
    
      </div>
    </div>
  );
}