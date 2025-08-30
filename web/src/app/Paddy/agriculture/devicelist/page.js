"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Thermometer,
  Droplets,
  Zap,
  Calendar,
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  Download,
  Settings,
  Trash2,
  Search,
  ScanQrCode
} from 'lucide-react';
import Header from '../components/Header';
import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

// ข้อมูลตัวอย่าง (fallback) ตามที่คุณให้มา
const SAMPLE_DEVICES = [
  {
    id: "VC2548-60",
    name: "อุปกรณ์ พื้นที่ A",
    status: "connected",
    description: "อุปกรณ์ IoT สำหรับเก็บข้อมูลแปลงนา",
    lastUpdate: "30 สิงหาคม 2568",
    sensor: []
  },
  {
    id: "VC2548-59",
    name: "อุปกรณ์ พื้นที่ B",
    status: "connected",
    description: "อุปกรณ์ IoT สำหรับเก็บข้อมูลแปลงนา",
    lastUpdate: "1 กันยายน 2568",
    sensor: [
      { type: "K Sensor", unit: "mg/kg", currentValue: "10", lastUpdate: "1 กันยายน 2568" },
      { type: "Water Level Sensor", unit: "cm", currentValue: "20", lastUpdate: "1 กันยายน 2568" },
      { type: "Moisture Sensor", unit: "%", currentValue: "32", lastUpdate: "1 กันยายน 2568" },
      { type: "N Sensor", unit: "mg/kg", currentValue: "15", lastUpdate: "1 กันยายน 2568" },
      { type: "P Sensor", unit: "mg/kg", currentValue: "7",  lastUpdate: "1 กันยายน 2568" }
    ]
  }
];

// --- Helpers ---
const getStatusBadge = (status) => {
  const statusConfig = {
    connected:    { text: 'เชื่อมต่อแล้ว',   color: 'bg-green-100 text-green-800',  icon: CheckCircle },
    disconnected: { text: 'ไม่ได้เชื่อมต่อ', color: 'bg-red-100 text-red-800',      icon: XCircle },
    warning:      { text: 'มีปัญหา',         color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle }
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

// ไอคอนตามประเภทเซ็นเซอร์ (รองรับ NPK)
const getSensorIcon = (type = '') => {
  const t = type.toLowerCase();
  if (t.includes('npk'))        return { icon: Thermometer, color: 'text-emerald-700', bgColor: 'bg-emerald-50' };
  if (t.includes('moisture'))   return { icon: Droplets,    color: 'text-blue-500',    bgColor: 'bg-blue-50'  };
  if (t.includes('water'))      return { icon: Activity,    color: 'text-cyan-600',    bgColor: 'bg-cyan-50'  };
  if (t.startsWith('k '))       return { icon: Thermometer, color: 'text-amber-600',   bgColor: 'bg-amber-50' };
  if (t.startsWith('n '))       return { icon: Thermometer, color: 'text-emerald-600', bgColor: 'bg-emerald-50' };
  if (t.startsWith('p '))       return { icon: Thermometer, color: 'text-fuchsia-600', bgColor: 'bg-fuchsia-50' };
  if (t === 'temperature')      return { icon: Thermometer, color: 'text-red-500',     bgColor: 'bg-red-50'   };
  if (t === 'humidity')         return { icon: Droplets,    color: 'text-blue-500',    bgColor: 'bg-blue-50'  };
  return { icon: Activity, color: 'text-gray-500', bgColor: 'bg-gray-50' };
};

const getSensorTypeName = (type = '') => {
  const t = type.toLowerCase();
  if (t.includes('npk'))        return 'ธาตุอาหารพืชรวม (NPK)';
  if (t === 'temperature')      return 'อุณหภูมิ';
  if (t === 'humidity')         return 'ความชื้น';
  if (t.includes('water'))      return 'ระดับน้ำ';
  if (t.includes('moisture'))   return 'ความชื้นดิน';
  return type || 'Sensor';
};

// รวม N / P / K ให้เป็นการ์ดเดียว (ไม่แก้ payload ต้นทาง)
function combineNPK(sensors = []) {
  const isN = (t='') => /^n\s*sensor$/i.test(t.trim());
  const isP = (t='') => /^p\s*sensor$/i.test(t.trim());
  const isK = (t='') => /^k\s*sensor$/i.test(t.trim());

  const n = sensors.find(s => isN(s.type));
  const p = sensors.find(s => isP(s.type));
  const k = sensors.find(s => isK(s.type));

  const others = sensors.filter(s => !(isN(s.type) || isP(s.type) || isK(s.type)));

  if (n || p || k) {
    const npkUnit = (n?.unit || p?.unit || k?.unit) || 'mg/kg';
    const npkLastUpdate = n?.lastUpdate || p?.lastUpdate || k?.lastUpdate || '-';

    const npkSensor = {
      type: 'NPK Sensor',
      unit: npkUnit,
      lastUpdate: npkLastUpdate,
      values: {
        N: n?.currentValue ?? '-',
        P: p?.currentValue ?? '-',
        K: k?.currentValue ?? '-',
      }
    };

    return [npkSensor, ...others];
  }

  return sensors;
}

// --- Page ---
export default function SensorDevicesPage() {
  const [selectedDevice, setSelectedDevice] = useState('VC2548-59');
  const [searchTerm, setSearchTerm] = useState('');
  const [sensorDevices, setSensorDevices] = useState([]);

  useEffect(() => {
    const fetchSensorDevices = async () => {
      try {
        // apiFetch คืน data (parsed) หรือ throw เมื่อ error
        const data = await apiFetch('/api/agriculture/data/device', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (Array.isArray(data) && data.length) {
          setSensorDevices(data);
        } else {
          setSensorDevices(SAMPLE_DEVICES);
        }
      } catch (error) {
        console.error('Error fetching sensor devices:', error);
        setSensorDevices(SAMPLE_DEVICES);
      }
    };

    fetchSensorDevices();
  }, []);

  const filteredDevices = sensorDevices.filter(device => {
    const name = (device?.name || '').toLowerCase();
    const id = (device?.id || '').toLowerCase();
    const type = (device?.type || '').toLowerCase();       // บาง payload ไม่มี
    const location = (device?.location || '').toLowerCase();// บาง payload ไม่มี
    const desc = (device?.description || '').toLowerCase();
    const q = (searchTerm || '').toLowerCase();
    return name.includes(q) || id.includes(q) || type.includes(q) || location.includes(q) || desc.includes(q);
  });

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
              <button
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => Swal.fire('ส่งออกข้อมูล', 'คุณสามารถเชื่อมต่อฝั่งแบ็กเอนด์เพื่อสร้างไฟล์ CSV/Excel ได้', 'info')}
              >
                <Download className="w-4 h-4 inline mr-2" />
                ส่งออกข้อมูล
              </button>
              <Link href="/Paddy/agriculture/registerdevice" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
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
                placeholder="ค้นหาด้วยรหัสอุปกรณ์, ชื่อ, ประเภท, ตำแหน่ง หรือคำอธิบาย..."
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

        {/* Device Info */}
        {(() => {
          const device = filteredDevices.find(d => d.id === selectedDevice);
          if (!device) {
            return (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500">ไม่พบอุปกรณ์ที่เลือก</p>
              </div>
            );
          }

          const derivedBattery = typeof device.batteryLevel === 'number' ? device.batteryLevel : 70; // fallback

          return (
            <div className="mb-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                      <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">รหัสอุปกรณ์</h3>
                        <div className="text-4xl font-bold text-gray-800 mb-4">
                          <ScanQrCode className="inline-block w-8 h-8 text-blue-600 mr-2" />
                          {device.id}
                        </div>
                        <div>{getStatusBadge(device.status)}</div>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-3">รายละเอียดอุปกรณ์</h3>
                          <p className="text-gray-600 leading-relaxed">
                            {device.description || '-'}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <Calendar className="w-5 h-5 text-gray-500 mr-3" />
                              <span className="text-sm text-gray-600">อัปเดตล่าสุด</span>
                            </div>
                            <span className="text-sm font-medium text-gray-800">{device.lastUpdate || '-'}</span>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <Zap className="w-5 h-5 text-gray-500 mr-3" />
                              <span className="text-sm text-gray-600">แบตเตอรี่</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                                <div
                                  className={`h-full rounded-full ${getBatteryColor(derivedBattery)}`}
                                  style={{ width: `${derivedBattery}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-800">{derivedBattery}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-3">
                    <Link
  href={`/Paddy/agriculture/sensor/${selectedDevice}`}
  className="flex-1 py-3 px-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium text-center"
>
  ดูรายละเอียดข้อมูล
</Link>

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
            const sensors = combineNPK(selectedDeviceData?.sensor || []);

            if (!sensors.length) {
              return (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <p className="text-gray-500">ไม่พบข้อมูลเซ็นเซอร์สำหรับอุปกรณ์ที่เลือก</p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sensors.map((sensor, idx) => {
                  const sensorIconConfig = getSensorIcon(sensor.type);
                  const IconComponent = sensorIconConfig.icon;
                  const isNPK = sensor.type?.toLowerCase().includes('npk');

                  return (
                    <div key={`${selectedDeviceData.id}-${sensor.type}-${idx}`} className="bg-white rounded-xl shadow-sm border border-gray-200">
                      <div className={`${sensorIconConfig.bgColor} p-4 rounded-t-xl`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm">
                              <IconComponent className={`w-6 h-6 ${sensorIconConfig.color}`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800">{sensor.type}</h3>
                              <p className="text-sm text-gray-600">{getSensorTypeName(sensor.type)}</p>
                            </div>
                          </div>
                          {getStatusBadge(selectedDeviceData.status)}
                        </div>
                      </div>

                      <div className="p-4">
                        {/* ค่าปัจจุบัน */}
                        {isNPK ? (
                          <div className="mb-4">
                            <div className="grid grid-cols-3 gap-3 text-center">
                              {['N','P','K'].map(k => (
                                <div key={k} className="p-3 rounded-lg bg-gray-50">
                                  <div className="text-xs text-gray-500 mb-1">{k}</div>
                                  <div className={`text-2xl font-bold ${sensorIconConfig.color}`}>
                                    {sensor.values?.[k] ?? '-'}
                                    <span className="text-sm text-gray-500 ml-1">{sensor.unit || 'mg/kg'}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <p className="mt-2 text-xs text-gray-500 text-center">ค่าธาตุอาหารพืชรวม</p>
                          </div>
                        ) : (
                          <div className="text-center mb-4">
                            <div className={`text-3xl font-bold ${sensorIconConfig.color} mb-1`}>
                              {sensor.currentValue}
                              <span className="text-lg text-gray-500 ml-1">{sensor.unit}</span>
                            </div>
                            <p className="text-sm text-gray-600">ค่าปัจจุบัน</p>
                          </div>
                        )}

                        {/* เมตา */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-gray-500">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>อัปเดตล่าสุด</span>
                            </div>
                            <span className="text-gray-700">{sensor.lastUpdate || '-'}</span>
                          </div>
                        </div>
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
