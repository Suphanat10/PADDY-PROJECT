"use client";

import { useEffect, useMemo, useState } from 'react';
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



// ---------------- Helpers ----------------
const getStatusBadge = (status) => {
  const statusConfig = {
    connected:    { text: 'เชื่อมต่อแล้ว',   color: 'bg-green-100 text-green-800',  icon: CheckCircle },
    disconnected: { text: 'ไม่ได้เชื่อมต่อ', color: 'bg-red-100 text-red-800',      icon: XCircle },
   
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

export default function SensorDevicesPage() {
  const [selectedDevice, setSelectedDevice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sensorDevices, setSensorDevices] = useState([]);

  const [statusFilter, setStatusFilter] = useState('all');       
  const [farmFilter, setFarmFilter] = useState('ทั้งหมด');
  const [areaFilter, setAreaFilter] = useState('ทั้งหมด');

  useEffect(() => {
    const fetchSensorDevices = async () => {
      try {
        const data = await apiFetch('/api/agriculture/data/device', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (Array.isArray(data) && data.length) {
          setSensorDevices(data);
          setSelectedDevice(data[0].id); 
        } else {
          setSensorDevices([]);
        }
      } catch (error) {
        console.error('Error fetching sensor devices:', error);
        setSensorDevices([]);
      }
    };

    fetchSensorDevices();
  }, []);

  // รายชื่อฟาร์มแบบไดนามิก
  const farmOptions = useMemo(() => {
    const s = new Set();
    sensorDevices.forEach(d => {
      const name = d?.farm?.name;
      if (name) s.add(name);
    });
    return ['ทั้งหมด', ...Array.from(s)];
  }, [sensorDevices]);

  const areaOptions = useMemo(() => {
    const s = new Set();
    const source =
      farmFilter === 'ทั้งหมด'
        ? sensorDevices
        : sensorDevices.filter(d => d?.farm?.name === farmFilter);

    source.forEach(d => {
      const loc = d?.farm?.location || d?.location;
      if (loc) s.add(loc);
    });

    return ['ทั้งหมด', ...Array.from(s)];
  }, [sensorDevices, farmFilter]);


  const handleFarmChange = (e) => {
    const value = e.target.value;
    setFarmFilter(value);
    setAreaFilter('ทั้งหมด');
  };


  const filteredDevices = useMemo(() => {
    const q = (searchTerm || '').toLowerCase();

    return sensorDevices.filter(device => {
      const name = (device?.name || '').toLowerCase();
      const id = (device?.id || '').toLowerCase();
      const type = (device?.type || '').toLowerCase();
      const desc = (device?.description || '').toLowerCase();
      const farmName = (device?.farm?.name || '').toLowerCase();
      const area = (device?.farm?.location || device?.location || '').toLowerCase();

      const matchesSearch =
        name.includes(q) ||
        id.includes(q) ||
        type.includes(q) ||
        desc.includes(q) ||
        farmName.includes(q) ||
        area.includes(q);

      
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : (statusFilter === 'warning'
              ? (device.status === 'warning' || device.status === 'problem')
              : device.status === statusFilter);

  
      const matchesFarm =
        farmFilter === 'ทั้งหมด'
          ? true
          : (device?.farm?.name === farmFilter);

     
      const matchesArea =
        areaFilter === 'ทั้งหมด'
          ? true
          : ((device?.farm?.location || device?.location) === areaFilter);

      return matchesSearch && matchesStatus && matchesFarm && matchesArea;
    });
  }, [sensorDevices, searchTerm, statusFilter, farmFilter, areaFilter]);

  useEffect(() => {
    if (filteredDevices.length === 0) {
      setSelectedDevice('');
      return;
    }
    setSelectedDevice(prev =>
      filteredDevices.some(d => d.id === prev) ? prev : filteredDevices[0].id
    );
  }, [filteredDevices]);


  const handleDisconnect = async (device_code , user_id = 11) => {
    console.log("Disconnecting device:", device_code, "for user:", user_id);
    
    try {
     if(!device_code || !user_id){
      return Swal.fire('ข้อผิดพลาด', 'ไม่พบรหัสอุปกรณ์หรือรหัสผู้ใช้', 'error');
     }
     Swal.fire({
      title: 'ยืนยันการยกเลิกการเชื่อมต่อ',
      text: `คุณต้องการยกเลิกการเชื่อมต่ออุปกรณ์ ${device_code} ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ยกเลิกการเชื่อมต่อ',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
      }).then(async (result) => {
        if (result.isConfirmed) {
          const payload = { device_code, user_id };
          const response = await apiFetch('/api/agriculture/disconnect-device', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (response && response.success) {
            Swal.fire('สำเร็จ', response.message || 'ยกเลิกการเชื่อมต่ออุปกรณ์สำเร็จ', 'success');
  
            const updatedDevices = await apiFetch('/api/agriculture/data/device', {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
            });
            if (Array.isArray(updatedDevices)) {
              setSensorDevices(updatedDevices);
            }
          } else {
            Swal.fire('ข้อผิดพลาด', response.message || 'ยกเลิกการเชื่อมต่ออุปกรณ์ล้มเหลว', 'error');
          }
        }
      });
    } catch (error) {
      console.error('Error disconnecting device:', error);
      Swal.fire('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการยกเลิกการเชื่อมต่ออุปกรณ์', 'error');
    }

      
    
  };

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

          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหา: รหัส/ชื่อ/ประเภท/ฟาร์ม/พื้นที่/คำอธิบาย"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

      
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="connected">เชื่อมต่อแล้ว</option>
              <option value="disconnected">ไม่ได้เชื่อมต่อ</option>
            
            </select>

            <select
              value={farmFilter}
              onChange={handleFarmChange}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              {farmOptions.map(opt => (
                <option key={`farm-${opt}`} value={opt}>{opt}</option>
              ))}
            </select>

            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              {areaOptions.map(opt => (
                <option key={`area-${opt}`} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        
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
                              <span className="text-sm text-gray-600">ฟาร์ม</span>
                            </div>
                            <span className="text-sm font-medium text-gray-800">{device?.farm?.name || '-'}</span>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <span className="text-sm text-gray-600">พื้นที่</span>
                            </div>
                            <span className="text-sm font-medium text-gray-800">{device?.farm?.location || device?.location || '-'}</span>
                          </div>

                          
                        </div>
                      </div>
                    </div>
                  </div>

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
                      {(device.status === 'connected') && (
                      <button
                        onClick={() => handleDisconnect(device.id, device.user_id)}
                        className="py-3 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                      >
                        <Trash2 className="w-4 h-4 inline mr-2" />
                        ยกเลิกการเชื่อมต่อ
                      </button>

                      )}
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
