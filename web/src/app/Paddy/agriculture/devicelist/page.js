"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  Thermometer, 
  Droplets, 
  Zap, 
  Calendar,
  MapPin,
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreVertical,
  Download,
  Settings,
  Trash2,
  Search,
  ScanQrCode
} from 'lucide-react';
import Header from '../components/Header';


export default function SensorDevicesPage() {
  const [selectedDevice, setSelectedDevice] = useState('VC2548-59');
  const [searchTerm, setSearchTerm] = useState('');

  const sensorDevices = [
    {
      id: 'VC2548-59',
      name: 'เซ็นเซอร์อุณหภูมิดิน A1',
      type: 'อุณหภูมิ',
      status: 'connected',
      batteryLevel: 85,
      lastUpdate: '24 ตุลาคม 2548',
      location: 'นาข้าว A1',
      description: 'เป็นอุปกรณ์วัดอุณหภูมิดินเพื่อควบคุมการให้น้ำและปุ๋ยอย่างเหมาะสมสำหรับการปลูกข้าว',
      currentValue: '28.5°C',
      icon: Thermometer,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      sensor: [
        {
          id: 'VC2548-59',
          type: 'Temperature',
          unit: '°C',
          currentValue: '28.5',
          lastUpdate: '24 ตุลาคม 2548',
          batteryLevel: 85,
          location: 'นาข้าว A1'
        },
        {
          id: 'VC2548-60',
          type: 'Humidity',
          unit: '%',
          currentValue: '65',
          lastUpdate: '24 ตุลาคม 2548',
          batteryLevel: 78,
          location: 'นาข้าว A1'
        },
        {
          id: 'VC2548-61',
          type: 'Temperature',
          unit: '°C',
          currentValue: '27.8',
          lastUpdate: '23 ตุลาคม 2548',
          batteryLevel: 45,
          location: 'นาข้าว B1'
        },
      ]
    },
    {
      id: 'VC2548-60',
      name: 'เซ็นเซอร์อุณหภูมิดิน A2',
      type: 'อุณหภูมิ',
      status: 'connected',
      batteryLevel: 78,
      lastUpdate: '24 ตุลาคม 2548',
      location: 'นาข้าว A2',
      description: 'เซ็นเซอร์วัดอุณหภูมิดินเพื่อควบคุมการให้น้ำและปุ๋ยอย่างเหมาะสม',
      currentValue: '29.2°C',
      icon: Thermometer,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      sensor: [
        {
          id: 'VC2548-62',
          type: 'Temperature',
          unit: '°C',
          currentValue: '29.2',
          lastUpdate: '24 ตุลาคม 2548',
          batteryLevel: 78,
          location: 'นาข้าว A2'
        }
      ]
    },
    {
      id: 'VC2548-61',
      name: 'เซ็นเซอร์อุณหภูมิดิน B1',
      type: 'อุณหภูมิ',
      status: 'warning',
      batteryLevel: 45,
      lastUpdate: '23 ตุลาคม 2548',
      location: 'นาข้าว B1',
      description: 'เซ็นเซอร์วัดอุณหภูมิดินในแปลงทดลองสำหรับการวิจัย',
      currentValue: '27.8°C',
      icon: Thermometer,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      sensor: [
        {
          id: 'VC2548-63',
          type: 'Temperature',
          unit: '°C',
          currentValue: '27.8',
          lastUpdate: '23 ตุลาคม 2548',
          batteryLevel: 45,
          location: 'นาข้าว B1'
        }
      ]
    },
    {
      id: 'VC2549-62',
      name: 'เซ็นเซอร์ความชื้นดิน A1',
      type: 'ความชื้น',
      status: 'connected',
      batteryLevel: 72,
      lastUpdate: '24 ตุลาคม 2548',
      location: 'นาข้าว A1',
      description: 'เซ็นเซอร์วัดความชื้นในดินสำหรับการจัดการระบบน้ำอัตโนมัติ',
      currentValue: '65%',
      icon: Droplets,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      sensor: [
        {
          id: 'VC2549-64',
          type: 'Humidity',
          unit: '%',
          currentValue: '65',
          lastUpdate: '24 ตุลาคม 2548',
          batteryLevel: 72,
          location: 'นาข้าว A1'
        }
      ]
    },
    {
      id: 'VC2549-63',
      name: 'เซ็นเซอร์ความชื้นดิน A2',
      type: 'ความชื้น',
      status: 'connected',
      batteryLevel: 89,
      lastUpdate: '24 ตุลาคม 2548',
      location: 'นาข้าว A2',
      description: 'เซ็นเซอร์วัดความชื้นในดินเพื่อเพิ่มประสิทธิภาพการใช้น้ำ',
      currentValue: '58%',
      icon: Droplets,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      sensor: [
        {
          id: 'VC2549-65',
          type: 'Humidity',
          unit: '%',
          currentValue: '58',
          lastUpdate: '24 ตุลาคม 2548',
          batteryLevel: 89,
          location: 'นาข้าว A2'
        }
      ]
    },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      connected: {
        text: 'เชื่อมต่อแล้ว',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle
      },
      disconnected: {
        text: 'ไม่ได้เชื่อมต่อ',
        color: 'bg-red-100 text-red-800',
        icon: XCircle
      },
      warning: {
        text: 'มีปัญหา',
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertCircle
      }
    };

    const config = statusConfig[status] || statusConfig.disconnected;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getBatteryColor = (level) => {
    if (level > 60) return 'bg-green-500';
    if (level > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSensorIcon = (type) => {
    switch(type.toLowerCase()) {
      case 'temperature':
        return { icon: Thermometer, color: 'text-red-500', bgColor: 'bg-red-50' };
      case 'humidity':
        return { icon: Droplets, color: 'text-blue-500', bgColor: 'bg-blue-50' };
      default:
        return { icon: Activity, color: 'text-gray-500', bgColor: 'bg-gray-50' };
    }
  };

  const getSensorTypeName = (type) => {
    switch(type.toLowerCase()) {
      case 'temperature':
        return 'อุณหภูมิ';
      case 'humidity':
        return 'ความชื้น';
      default:
        return type;
    }
  };

  const filteredDevices = sensorDevices.filter(device =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <Header />
    
           
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">ข้อมูลอุปกรณ์</h1>
              <p className="text-gray-600">จัดการและตรวจสอบสถานะเซ็นเซอร์ทั้งหมด ({sensorDevices.length} อุปกรณ์)</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4 inline mr-2" />
                ส่งออกข้อมูล
              </button>
              <Link href="/Paddy/agriculture/registerdevice" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"  >
                + เพิ่มอุปกรณ์
              </Link>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาด้วยรหัสอุปกรณ์, ชื่อ, ประเภท หรือตำแหน่ง..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
              <option>สถานะทั้งหมด</option>
              <option>เชื่อมต่อแล้ว</option>
              <option>ไม่ได้เชื่อมต่อ</option>
              <option>มีปัญหา</option>
            </select>
            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
              <option>พื้นที่ทั้งหมด</option>
              <option>นาข้าว A1</option>
              <option>นาข้าว A2</option>
              <option>นาข้าว A3</option>
            </select>
          </div>
        </div>

        {/* Device Selection Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
            <div className="flex flex-wrap gap-2">
              {filteredDevices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => setSelectedDevice(device.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedDevice === device.id
                      ? 'bg-emerald-400 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {device.id}
                </button>
              ))}
            </div>
          </div>
        </div>

        {(() => {
          const device = filteredDevices.find(d => d.id === selectedDevice);
          if (!device) return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500">ไม่พบอุปกรณ์ที่เลือก</p>
            </div>
          );

          return (
            <div className="mb-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                      <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">รหัสอุปกรณ์</h3>
                        <div className={`text-4xl font-bold text-gray-800 mb-4`}>
                          <ScanQrCode className={`inline-block w-8 h-8 text-blue-600 mr-2`} />
                          {device.id}
                        </div>
                      </div>
                    </div>

                    {/* Device Info */}
                    <div className="lg:col-span-2">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-3">รายละเอียดอุปกรณ์</h3>
                          <p className="text-gray-600 leading-relaxed">
                            {device.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <Calendar className="w-5 h-5 text-gray-500 mr-3" />
                              <span className="text-sm text-gray-600">อัปเดตล่าสุด</span>
                            </div>
                            <span className="text-sm font-medium text-gray-800">{device.lastUpdate}</span>
                          </div>
                          
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <Zap className="w-5 h-5 text-gray-500 mr-3" />
                              <span className="text-sm text-gray-600">แบตเตอรี่</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                                <div 
                                  className={`h-full rounded-full ${getBatteryColor(device.batteryLevel)}`}
                                  style={{ width: `${device.batteryLevel}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-800">{device.batteryLevel}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button className="flex-1 py-3 px-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium">
                        ดูข้อมูลเซ็นเซอร์
                      </button>
                      <button className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                        <Settings className="w-4 h-4 inline mr-2" />
                        ตั้งค่าอุปกรณ์
                      </button>
                      <button className="py-3 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
                        <Trash2 className="w-4 h-4 inline mr-2" />
                        ลบอุปกรณ์
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Sensors Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6">เซ็นเซอร์ทั้งหมด</h2>

          {(() => {
            const selectedDeviceData = filteredDevices.find(d => d.id === selectedDevice);
            if (!selectedDeviceData || !selectedDeviceData.sensor) {
              return (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <p className="text-gray-500">ไม่พบข้อมูลเซ็นเซอร์สำหรับอุปกรณ์ที่เลือก</p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedDeviceData.sensor.map((sensor) => {
                  const sensorIconConfig = getSensorIcon(sensor.type);
                  const IconComponent = sensorIconConfig.icon;
                  
                  return (
                    <div key={sensor.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                      <div className={`${sensorIconConfig.bgColor} p-4 rounded-t-xl`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm`}>
                              <IconComponent className={`w-6 h-6 ${sensorIconConfig.color}`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800">{sensor.id}</h3>
                              <p className="text-sm text-gray-600">{getSensorTypeName(sensor.type)}</p>
                            </div>
                          </div>
                          {getStatusBadge('connected')}
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="text-center mb-4">
                          <div className={`text-3xl font-bold ${sensorIconConfig.color} mb-1`}>
                            {sensor.currentValue}
                            <span className="text-lg text-gray-500 ml-1">{sensor.unit}</span>
                          </div>
                          <p className="text-sm text-gray-600">ค่าปัจจุบัน</p>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-gray-500">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>อัปเดตล่าสุด</span>
                            </div>
                            <span className="text-gray-700">{sensor.lastUpdate}</span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-gray-500">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>ตำแหน่ง</span>
                            </div>
                            <span className="text-gray-700">{sensor.location}</span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-gray-500">
                              <Zap className="w-4 h-4 mr-1" />
                              <span>แบตเตอรี่</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-12 h-2 bg-gray-200 rounded-full mr-2">
                                <div 
                                  className={`h-full rounded-full ${getBatteryColor(sensor.batteryLevel)}`}
                                  style={{ width: `${sensor.batteryLevel}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600">{sensor.batteryLevel}%</span>
                            </div>
                          </div>
                        </div>

                        {/* <button className="w-full mt-4 py-2 px-4 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium">
                          ดูรายละเอียด
                        </button> */}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}