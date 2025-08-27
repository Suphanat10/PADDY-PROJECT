"use client";
import { useState } from "react"; 
import BalanceCard from "./BalanceCard"; 
import { CheckCircle, AlertCircle, XCircle, Camera, Thermometer, Droplets, Sprout, BarChart3, TrendingUp } from "lucide-react";

export default function DashboardContent() { 
  const [sensorDevices] = useState([ 
    { id: "1", name: "Sensor A", type: "Temperature", status: "connected", location: "Field 1", value: "28°C", lastUpdate: "2 นาทีที่แล้ว" }, 
    { id: "2", name: "Sensor B", type: "Humidity", status: "warning", location: "Field 2", value: "85%", lastUpdate: "5 นาทีที่แล้ว" }, 
    { id: "3", name: "Sensor C", type: "Soil Moisture", status: "disconnected", location: "Field 3", value: "N/A", lastUpdate: "30 นาทีที่แล้ว" }, 
    { id: "4", name: "Sensor D", type: "Temperature", status: "connected", location: "Field 1", value: "26°C", lastUpdate: "1 นาทีที่แล้ว" }, 
    { id: "5", name: "Sensor E", type: "Humidity", status: "warning", location: "Field 2", value: "78%", lastUpdate: "3 นาทีที่แล้ว" } 
  ]);

  const [cameraDevices] = useState([
    { id: "1", name: "Camera 1", location: "Field 1", status: "active", lastCapture: "10 นาทีที่แล้ว" },
    { id: "2", name: "Camera 2", location: "Field 2", status: "active", lastCapture: "8 นาทีที่แล้ว" },
    { id: "3", name: "Camera 3", location: "Field 3", status: "inactive", lastCapture: "2 ชั่วโมงที่แล้ว" }
  ]);

  const [dailyStats] = useState({
    temperature: { avg: 27, min: 22, max: 32 },
    humidity: { avg: 68, min: 45, max: 90 },
    soilMoisture: { avg: 55, min: 35, max: 75 },
    alerts: 3,
    dataPoints: 1250
  });

  // แก้ไขชื่อตัวแปร 
  const [currentBalance] = useState({ 
    earned: 10, 
    spent: 5, 
    overdue: 2, 
    total: 15 
  });

  const getSensorIcon = (type) => {
    switch(type) {
      case 'Temperature': return <Thermometer className="w-4 h-4" />;
      case 'Humidity': return <Droplets className="w-4 h-4" />;
      case 'Soil Moisture': return <Sprout className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'connected': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'disconnected': return 'text-red-600';
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return ( 
    <div className="container mx-auto px-4 -mt-6 sm:-mt-8"> 
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8"> 
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">สถานะอุปกรณ์</h2>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"> 
          <div className="bg-green-50 border border-green-200 rounded-lg p-4"> 
            <div className="flex items-center"> 
              <CheckCircle className="w-8 h-8 text-green-500 mr-3" /> 
              <div> 
                <h3 className="text-lg font-semibold text-green-800"> 
                  {sensorDevices.filter(d => d.status === 'connected').length} 
                </h3> 
                <p className="text-sm text-green-600">เชื่อมต่อแล้ว</p> 
              </div> 
            </div> 
          </div> 
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"> 
            <div className="flex items-center"> 
              <AlertCircle className="w-8 h-8 text-yellow-500 mr-3" /> 
              <div> 
                <h3 className="text-lg font-semibold text-yellow-800"> 
                  {sensorDevices.filter(d => d.status === 'warning').length} 
                </h3> 
                <p className="text-sm text-yellow-600">มีปัญหา</p> 
              </div> 
            </div> 
          </div> 
          <div className="bg-red-50 border border-red-200 rounded-lg p-4"> 
            <div className="flex items-center"> 
              <XCircle className="w-8 h-8 text-red-500 mr-3" /> 
              <div> 
                <h3 className="text-lg font-semibold text-red-800"> 
                  {sensorDevices.filter(d => d.status === 'disconnected').length} 
                </h3> 
                <p className="text-sm text-red-600">ไม่ได้เชื่อมต่อ</p> 
              </div> 
            </div> 
          </div> 
        </div>

        {/* Camera Section */}
        

        {/* Daily Statistics */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2" />
            สถิติรายวัน
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Thermometer className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-bold text-blue-800">{dailyStats.temperature.avg}°C</span>
              </div>
              <p className="text-sm text-blue-600 font-medium">อุณหภูมิเฉลี่ย</p>
              <p className="text-xs text-blue-500">
                ต่ำสุด {dailyStats.temperature.min}°C | สูงสุด {dailyStats.temperature.max}°C
              </p>
            </div>
            
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Droplets className="w-6 h-6 text-cyan-600" />
                <span className="text-lg font-bold text-cyan-800">{dailyStats.humidity.avg}%</span>
              </div>
              <p className="text-sm text-cyan-600 font-medium">ความชื้นเฉลี่ย</p>
              <p className="text-xs text-cyan-500">
                ต่ำสุด {dailyStats.humidity.min}% | สูงสุด {dailyStats.humidity.max}%
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Sprout className="w-6 h-6 text-green-600" />
                <span className="text-lg font-bold text-green-800">{dailyStats.soilMoisture.avg}%</span>
              </div>
              <p className="text-sm text-green-600 font-medium">ความชื้นดินเฉลี่ย</p>
              <p className="text-xs text-green-500">
                ต่ำสุด {dailyStats.soilMoisture.min}% | สูงสุด {dailyStats.soilMoisture.max}%
              </p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                <span className="text-lg font-bold text-purple-800">{dailyStats.dataPoints.toLocaleString()}</span>
              </div>
              <p className="text-sm text-purple-600 font-medium">ข้อมูลรวม</p>
              <p className="text-xs text-purple-500">แจ้งเตือน: {dailyStats.alerts} ครั้ง</p>
            </div>
          </div>
        </div>

        {/* Sensor Details */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">รายละเอียดเซนเซอร์</h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">อุปกรณ์</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ประเภท</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ค่าปัจจุบัน</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">สถานที่</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">อัพเดตล่าสุด</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sensorDevices.map(device => (
                  <tr key={device.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{device.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        {getSensorIcon(device.type)}
                        <span className="ml-2">{device.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{device.value}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{device.location}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{device.lastUpdate}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`font-medium ${getStatusColor(device.status)}`}>
                        {device.status === 'connected' ? 'เชื่อมต่อ' : 
                         device.status === 'warning' ? 'มีปัญหา' : 'ไม่เชื่อมต่อ'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div> 
    </div> 
  ); 
}