'use client';
import { useState } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Waves,
  Leaf,
  Calendar,
  MapPin,
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  Download,
  Settings,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Bell,
  Zap,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import {
  PieChart as RechartsPieChart,
  LineChart as RechartsLineChart,
  Pie,
  Line,
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import Header from '../components/Header';


export default function SensorDetailPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Sample sensor data
  const sensorInfo = {
    id: 'NPK-001',
    name: 'เซ็นเซอร์ NPK + ความชื้น + ระดับน้ำ',
    location: 'นาข้าว A1',
    status: 'connected',
    batteryLevel: 85,
    lastUpdate: '2 นาทีที่แล้ว',
    installDate: '15 มกราคม 2567'
  };

  // Current values
  const currentData = {
    nitrogen: { value: 45, unit: 'mg/kg', status: 'good', trend: 'up' },
    phosphorus: { value: 28, unit: 'mg/kg', status: 'good', trend: 'stable' },
    potassium: { value: 120, unit: 'mg/kg', status: 'excellent', trend: 'up' },
    humidity: { value: 65, unit: '%', status: 'good', trend: 'down' },
    waterLevel: { value: 10 , unit: 'ซม.', status: 'warning', trend: 'up' },
    temperature: { value: 28.5, unit: '°C', status: 'good', trend: 'up' }
  };

  // Historical data for charts
  const historicalData = [
    { time: '00:00', nitrogen: 42, phosphorus: 25, potassium: 115, humidity: 70, waterLevel: 80, temperature: 26.5 },
    { time: '04:00', nitrogen: 43, phosphorus: 26, potassium: 117, humidity: 68, waterLevel: 82, temperature: 27.2 },
    { time: '08:00', nitrogen: 44, phosphorus: 27, potassium: 118, humidity: 66, waterLevel: 84, temperature: 28.1 },
    { time: '12:00', nitrogen: 45, phosphorus: 28, potassium: 120, humidity: 65, waterLevel: 85, temperature: 28.5 },
    { time: '16:00', nitrogen: 46, phosphorus: 29, potassium: 122, humidity: 64, waterLevel: 83, temperature: 29.2 },
    { time: '20:00', nitrogen: 45, phosphorus: 28, potassium: 121, humidity: 66, waterLevel: 84, temperature: 28.8 },
  ];

  // NPK Distribution data for pie chart
  const npkDistribution = [
    { name: 'ไนโตรเจน', value: 45, color: '#10B981' },
    { name: 'ฟอสฟอรัส', value: 28, color: '#F59E0B' },
    { name: 'โพแทสเซียม', value: 120, color: '#8B5CF6' }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'danger': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'excellent': return 'ดีเยี่ยม';
      case 'good': return 'ดี';
      case 'warning': return 'ระวัง';
      case 'danger': return 'อันตราย';
      default: return 'ปกติ';
    }
  };

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <Minus className="w-4 h-4 text-gray-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getBatteryColor = (level) => {
    if (level > 60) return 'bg-green-500';
    if (level > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const WaterLevelCard = ({ title, icon: Icon, data, color, bgColor }) => {
    const getWaterLevelInfo = (level) => {
      if (level >= 61) return { range: '61-80 ซม.', sensors: 5, color: 'bg-gray-300', section: 'top' };
      if (level >= 21) return { range: '21-60 ซม.', sensors: 20, color: 'bg-teal-500', section: 'middle' };
      return { range: '0-20 ซม.', sensors: 10, color: 'bg-gray-200', section: 'bottom' };
    };

    const waterInfo = getWaterLevelInfo(data.value);
    const maxLevel = 15;
    const waterHeight = Math.min((data.value / maxLevel) * 100, 100); // Calculate water height percentage

    return (
      <div >
    
        
        <div className="p-4">
          {/* Water Tank Visualization */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              {/* Tank Container */}
              <div className="w-20 h-32 border-2 border-gray-400 rounded-b-lg bg-white relative overflow-hidden">
                
                {/* Water Level Sections - Background */}
                {/* Top section (61-80 cm) */}
                <div className="absolute top-0 w-full h-8 bg-gray-100 border-b border-gray-300 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600"></span>
                </div>
                
                {/* Middle section (21-60 cm) */}
                <div className="absolute top-8 w-full h-16 bg-gray-100 border-b border-gray-300 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600"></span>
                </div>
                
                {/* Bottom section (0-20 cm) */}
                <div className="absolute top-24 w-full h-8 bg-gray-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600"></span>
                </div>

                {/* Actual Water Level */}
                <div 
                  className="absolute bottom-0 w-full bg-gradient-to-t from-blue-400 to-blue-300 transition-all duration-500"
                  style={{ height: `${waterHeight}%` }}
                >
                  {/* Water surface effect */}
                  <div className="absolute top-0 w-full h-1 bg-blue-200 opacity-60"></div>
                </div>

                {/* Current Water Level Indicator Line */}
                <div 
                  className="absolute left-0 right-0 h-0.5 bg-red-500 z-20"
                  style={{ bottom: `${waterHeight}%` }}
                ></div>

                {/* Level markings on the side */}
               
              </div>

              {/* Current level indicator outside */}
              <div 
                className="absolute left-20 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-30"
                style={{ bottom: `${waterHeight}%`, transform: 'translateY(50%)' }}
              >
                {data.value} ซม.
              </div>

             
          
            </div>
          </div>

          {/* Status */}
          <div className="text-center">
            <div className={`text-2xl font-bold ${color} mb-1`}>
              {data.value} {data.unit}
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(data.status)}`}>
              {getStatusText(data.status)}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              ช่วง: {waterInfo.range} • {waterInfo.sensors} เซนเซอร์ทำงาน
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MetricCard = ({ title, icon: Icon, data, color, bgColor }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className={`${bgColor} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm">
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{title}</h3>
              <p className="text-sm text-gray-600">ค่าปัจจุบัน</p>
            </div>
          </div>
          {getTrendIcon(data.trend)}
        </div>
      </div>
      
      <div className="p-4">
        <div className="text-center mb-3">
          <div className={`text-3xl font-bold ${color} mb-1`}>
            {data.value}
            <span className="text-lg text-gray-500 ml-1">{data.unit}</span>
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(data.status)}`}>
            {getStatusText(data.status)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <Header />

      <div className="container mx-auto px-4 py-6 mt-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <MetricCard 
            title="ไนโตรเจน (N)" 
            icon={Leaf} 
            data={currentData.nitrogen}
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <MetricCard 
            title="ฟอสฟอรัส (P)" 
            icon={Leaf} 
            data={currentData.phosphorus}
            color="text-orange-600"
            bgColor="bg-orange-50"
          />
          <MetricCard 
            title="โพแทสเซียม (K)" 
            icon={Leaf} 
            data={currentData.potassium}
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
          <MetricCard 
            title="ความชื้นดิน" 
            icon={Droplets} 
            data={currentData.humidity}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
         
          <MetricCard 
            title="อุณหภูมิ" 
            icon={Thermometer} 
            data={currentData.temperature}
            color="text-red-600"
            bgColor="bg-red-50"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">ช่วงเวลา:</label>
            <select 
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="1h">1 ชั่วโมง</option>
              <option value="6h">6 ชั่วโมง</option>
              <option value="24h">24 ชั่วโมง</option>
              <option value="7d">7 วัน</option>
              <option value="30d">30 วัน</option>
            </select>
          </div>
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">แสดงข้อมูล:</label>
            <select 
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="all">ทั้งหมด</option>
              <option value="npk">NPK</option>
              <option value="environmental">สิ่งแวดล้อม</option>
            </select>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Main Line Chart */}
          <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <LineChart className="w-5 h-5 mr-2 text-blue-600" />
                แนวโน้มค่าเซ็นเซอร์
              </h3>
              <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                <Download className="w-4 h-4 inline mr-1" />
                ส่งออก
              </button>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="nitrogen" stroke="#10B981" strokeWidth={2} name="ไนโตรเจน" />
                  <Line type="monotone" dataKey="phosphorus" stroke="#F59E0B" strokeWidth={2} name="ฟอสฟอรัส" />
                  <Line type="monotone" dataKey="potassium" stroke="#8B5CF6" strokeWidth={2} name="โพแทสเซียม" />
                  <Line type="monotone" dataKey="humidity" stroke="#3B82F6" strokeWidth={2} name="ความชื้น" />
                  <Line type="monotone" dataKey="waterLevel" stroke="#06B6D4" strokeWidth={2} name="ระดับน้ำ" />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* NPK Distribution Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-purple-600" />
                ระดับน้ำในท่อ PVC 
              </h3>
            </div>
            <div className="h-64">
               <WaterLevelCard 
            data={currentData.waterLevel}
            color="text-cyan-600"
            bgColor="bg-cyan-50"
          />
            </div>
          </div>
        </div>

  

        {/* Environmental Data Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-cyan-600" />
              ข้อมูลสิ่งแวดล้อม
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="humidity" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="ความชื้น (%)" />
                <Area type="monotone" dataKey="waterLevel" stackId="2" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.6} name="ระดับน้ำ (%)" />
                <Area type="monotone" dataKey="temperature" stackId="3" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="อุณหภูมิ (°C)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Device Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">สถานะอุปกรณ์</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">รหัสอุปกรณ์</span>
                <span className="font-medium">{sensorInfo.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">สถานะการเชื่อมต่อ</span>
                <span className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  เชื่อมต่อแล้ว
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">แบตเตอรี่</span>
                <div className="flex items-center">
                  <div className="w-20 h-2 bg-gray-200 rounded-full mr-2">
                    <div 
                      className={`h-full rounded-full ${getBatteryColor(sensorInfo.batteryLevel)}`}
                      style={{ width: `${sensorInfo.batteryLevel}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{sensorInfo.batteryLevel}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">วันที่ติดตั้ง</span>
                <span className="font-medium">{sensorInfo.installDate}</span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">คำแนะนำ</h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">ระดับ NPK ดี</p>
                    <p className="text-xs text-green-600 mt-1">ค่าธาตุอาหารอยู่ในเกณฑ์ที่เหมาะสม</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <Droplets className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">ความชื้นเหมาะสม</p>
                    <p className="text-xs text-blue-600 mt-1">ระดับความชื้นดินอยู่ในช่วงที่ดี</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">ตรวจสอบระดับน้ำ</p>
                    <p className="text-xs text-yellow-600 mt-1">ควรเฝ้าระวังระดับน้ำในช่วงนี้</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}