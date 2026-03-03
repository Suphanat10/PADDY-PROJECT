"use client";

import Link from 'next/link';
import {
  AdminSidebar,
  AdminHeader,
} from "../../../components/admin/AdminLayout";
import Footer from "@/app/components/Footer";
import { apiFetch } from "../../../../lib/api";






import React, { useState, useMemo , useEffect } from "react";
import { io } from 'socket.io-client';
import { 
  LayoutDashboard, 
  Sprout, 
  Activity, ShieldCheck ,AlertCircle ,
  Wifi, 
  ChevronDown, 
  Waves, 
  Bug, 
  Target, 
  Search, 
  AlertTriangle, 
  WifiOff, 
  ArrowRight, 
  Loader2, 
  MapPin, 
  Leaf, 
  Droplets, // แก้จาก Drop
  Zap,      // แก้จาก Lightning
  Thermometer 
} from 'lucide-react';
import { 
  BarChart, 
  LineChart,
  Line,
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, Cell 
} from 'recharts';


const COLORS = ['#10b981', '#ef4444'];
const FARM_DATA = [];

export default function FarmDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [farmData, setFarmData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFarmId, setExpandedFarmId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRisks, setExpandedRisks] = useState([]);


  const transformApiFarms = (apiFarms = []) => {
    return apiFarms.map(farm => ({
      farm_id: farm.farm_id,
      farm_name: farm.farm_name,
      location: farm.owner || '-',
      rice_variety: farm.rice_variety || '-',
      status: (farm.device_count && farm.device_count > 0) ? 'Online' : 'Offline',
      areas: (farm.areas || []).map(area => {
        const primaryDevice = (area.devices && area.devices.length > 0) ? area.devices[0] : null;
        const latestSensor = primaryDevice?.latest_sensor || null;
        const latestSensors = primaryDevice?.latest_sensors || null;
        // derive growth/disease summaries from device latest readings when available
        const latest_growth = primaryDevice?.latest_growth || null;
        const latest_disease = primaryDevice?.latest_disease || null;
        const latest_setting = primaryDevice?.latest_setting || null;
        return {
          area_id: area.area_id,
          area_name: area.area_name,
          device_code: primaryDevice?.device_code || 'N/A',
          status: primaryDevice ? (primaryDevice.status || 'active') : (area.device_count > 0 ? 'active' : 'offline'),
          thresholds: { min: 0, max: 100 },
          growth: {
            stage: latest_growth?.growth_stage || latest_growth?.stage || (primaryDevice ? `ก้าวที่ ${primaryDevice.growth_count || 0}` : 'ไม่ระบุ'),
            progress: Math.min(100, (primaryDevice?.growth_count || 0) * 25)
          },
          disease: {
            status: latest_disease ? 'warning' : 'safe',
            name: latest_disease?.disease_name || (primaryDevice && primaryDevice.disease_count && primaryDevice.disease_count > 0 ? 'พบความเสี่ยง' : 'ปกติ')
          },
          latest_growth,
          latest_disease,
          latest_setting,
          sensor: (() => {
            const s = { water_level: 0, n: 0, p: 0, k: 0, humidity: 0, moisture: 0, temperature: 0 };
            const apply = (reading) => {
              if (!reading) return;
              const type = String(reading.type || reading.sensor_type || '').toUpperCase();
              const value = reading.value ?? reading.val ?? 0;
              if (type === 'W' || type.includes('WATER') || type === 'WL') s.water_level = value;
              else if (type === 'N') s.n = value;
              else if (type === 'P') s.p = value;
              else if (type === 'K') s.k = value;
              else if (type === 'M' || type.includes('MOIST') || type === 'MOISTURE') s.moisture = value;
              else if (type === 'H' || type.includes('HUMID')) s.humidity = value;
              else if (type === 'T' || type.includes('TEMP')) s.temperature = value;
            };
            if (Array.isArray(latestSensors)) {
              latestSensors.forEach(apply);
            } else {
              apply(latestSensor);
            }
            return s;
          })()
        };
      })
    }));
  };

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/data/admin/analysis');
      console.debug('apiFetch /api/farms ->', res);
      if (!res.ok) throw new Error(res.message || 'ไม่สามารถโหลดข้อมูลได้');
      const body = res.data;
      const apiFarms = Array.isArray(body?.data) ? body.data : (Array.isArray(body) ? body : []);
      const transformed = transformApiFarms(apiFarms);
      console.debug('Transformed Farm Data:', transformed);
      setFarmData(transformed);
    } catch (err) {
      const msg = err?.message || String(err);
      setError(msg);
      setFarmData(FARM_DATA);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  // Socket.IO: connect to server and join 'all-devices' room
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let socket;
    try {
      socket = io('http://localhost:8000', { transports: ['websocket'] });
    } catch (e) {
      console.error('Socket.IO init failed', e);
      return;
    }

    socket.on('connect', () => {
      console.debug('socket.io connected', socket.id);
      socket.emit('join', 'all-devices');
      // Some servers expect 'join-all' without payload
      try { socket.emit('join-all'); } catch (e) { /* ignore */ }
    });

    // Debug / error handlers
    socket.on('connect_error', (err) => console.error('socket.io connect_error', err));
    socket.on('connect_timeout', (err) => console.error('socket.io connect_timeout', err));
    socket.on('error', (err) => console.error('socket.io error', err));

    // Server may emit the full farms list
    socket.on('all-devices', (payload) => {
      try {
        const data = Array.isArray(payload) ? payload : (payload?.data || payload);
        setFarmData(transformApiFarms(Array.isArray(data) ? data : [data]));
      } catch (e) { console.error('Failed handle all-devices', e); }
    });

    // Generic update message with a farm or partial update
    socket.on('update', (msg) => {
      try {
        if (msg?.farm) {
          const transformed = transformApiFarms([msg.farm])[0];
          setFarmData(prev => {
            const idx = prev.findIndex(f => f.farm_id === transformed.farm_id);
            if (idx !== -1) {
              const copy = [...prev]; copy[idx] = transformed; return copy;
            }
            return [transformed, ...prev];
          });
        } else if (Array.isArray(msg)) {
          setFarmData(transformApiFarms(msg));
        }
      } catch (e) { console.error('Failed handle update', e); }
    });

    // sensorData: server may send cached or live sensor readings
    socket.on('sensorData', (payload) => {
      try {
        const deviceCode = payload?.device_code || payload?.device?.device_code || payload?.device_code?.toString();
        const dat = payload?.data || payload;
        setFarmData(prev => prev.map(f => ({
          ...f,
          areas: (f.areas || []).map(a => {
            if (!a.device_code) return a;
            const match = deviceCode && (a.device_code === deviceCode || a.device_code === (payload?.device?.device_code));
            if (!match) return a;
            const s = { ...a.sensor };
            if (dat?.N != null) s.n = dat.N;
            if (dat?.P != null) s.p = dat.P;
            if (dat?.K != null) s.k = dat.K;
            if (dat?.W != null) s.water_level = dat.W;
            if (dat?.water_level != null) s.water_level = dat.water_level;
            if (dat?.S != null) s.moisture = dat.S;
            if (dat?.soil_moisture != null) s.moisture = dat.soil_moisture;
            if (dat?.H != null) s.humidity = dat.H;
            if (dat?.T != null) s.temperature = dat.T;
            return { ...a, sensor: s };
          })
        })));
      } catch (e) { console.error('sensorData handler error', e); }
    });

    // deviceStatus: server may emit device online/offline statuses
    socket.on('deviceStatus', (status) => {
      try {
        setFarmData(prev => prev.map(f => ({
          ...f,
          areas: (f.areas || []).map(a => {
            const match = a.device_code && status && (a.device_code === status.device_code || a.device_code === status.device?.device_code);
            if (!match) return a;
            return { ...a, status: status.status || status.state || a.status };
          })
        })));
      } catch (e) { console.error('deviceStatus handler error', e); }
    });

    socket.on('disconnect', (reason) => console.debug('socket.io disconnected', reason));

    return () => {
      try { socket.off(); socket.disconnect(); } catch (e) {}
    };
  }, [/* run once */]);

  // Retry helper
  const handleRetry = () => {
    setError(null);
    fetchFarms();
  };

  // WebSocket: subscribe to real-time updates for farms
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let ws;
    let reconnectTimer = null;

    const startSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const host = window.location.host;
      const url = `${protocol}://${host}/api/ws/farms`;
      try {
        ws = new WebSocket(url);
      } catch (e) {
        console.error('WebSocket init failed', e);
        return;
      }

      ws.onopen = () => {
        console.debug('Farm WS connected');
      };

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          // Accept API-shaped messages: { type: 'update', farm: {...api shape...} }
          if (msg.type === 'update' && msg.farm) {
            const transformed = transformApiFarms([msg.farm])[0];
            setFarmData(prev => {
              const idx = prev.findIndex(f => f.farm_id === transformed.farm_id);
              if (idx !== -1) {
                const copy = [...prev];
                copy[idx] = transformed;
                return copy;
              }
              return [transformed, ...prev];
            });
          } else if (msg.type === 'bulk' && Array.isArray(msg.farms)) {
            setFarmData(transformApiFarms(msg.farms));
          } else if (Array.isArray(msg.data)) {
            setFarmData(transformApiFarms(msg.data));
          }
        } catch (e) {
          console.error('Failed parse WS message', e);
        }
      };

      ws.onclose = () => {
        console.debug('Farm WS closed — reconnecting in 5s');
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(startSocket, 5000);
      };

      ws.onerror = (e) => {
        console.error('Farm WS error', e);
        try { ws.close(); } catch (e) {}
      };
    };

    startSocket();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      try { if (ws) ws.close(); } catch (e) {}
    };
  }, []);

  // 2. คำนวณสถิติจากข้อมูลที่โหลดมา
  const stats = useMemo(() => {
    const totalFarms = farmData.length;
    const totalAreas = farmData.reduce((acc, farm) => acc + (farm.areas?.length || 0), 0);
    const warningDiseases = farmData.reduce((acc, farm) => 
      acc + (farm.areas?.filter(a => a.disease.status === 'warning').length || 0), 0
    , 0);
    const onlineFarms = farmData.filter(f => f.status === 'Online').length;
    
    return { totalFarms, totalAreas, warningDiseases, onlineFarms, offlineFarms: totalFarms - onlineFarms };
  }, [farmData]);

  const statusData = [
    { name: 'Online', value: stats.onlineFarms },
    { name: 'Offline', value: stats.offlineFarms },
  ];

  const chartData = farmData.map(farm => ({
    name: farm.farm_name.length > 8 ? farm.farm_name.substring(0, 8) + ".." : farm.farm_name,
    count: farm.areas?.length || 0
  }));

  const filteredFarms = farmData.filter(farm => 
    farm.farm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- UI จังหวะโหลดข้อมูล ---
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
      <p className="text-slate-500 font-bold animate-pulse">กำลังดึงข้อมูลจากเซิร์ฟเวอร์...</p>
    </div>
  );


  return (
    <div className="flex h-screen bg-slate-50 text-slate-600 overflow-hidden">
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeMenu="FarmDashboard"
      />

      <div className="flex flex-1 flex-col relative z-0">
        <AdminHeader setSidebarOpen={setSidebarOpen} />


        <main className="flex-1 overflow-y-auto p-4 md:p-12">
        {/* Title & Search */}
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
              <LayoutDashboard className="text-emerald-600" size={32} /> 
              แผงควบคุมภาพรวม
            </h1>
            <p className="text-slate-500 mt-1">ติดตามสถานะการเจริญเติบโตและระบบเซนเซอร์แบบ Real-time</p>
          </div>
          
          {/* search moved below */}
        </header>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 flex items-center justify-between">
            <div className="text-sm font-bold">ไม่สามารถโหลดข้อมูล: {error}</div>
            <button onClick={handleRetry} className="ml-4 bg-rose-600 text-white px-3 py-1 rounded">ลองใหม่</button>
          </div>
        )}

        {/* 1️⃣ Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="ฟาร์มทั้งหมด" value={stats.totalFarms} icon={<Sprout />} unit="ฟาร์ม" color="text-emerald-600" />
          <StatCard title="พื้นที่ดูแล" value={stats.totalAreas} icon={<Target />} unit="แปลง" color="text-blue-600" />
          <StatCard title="ความเสี่ยงโรค" value={stats.warningDiseases} icon={<Bug />} unit="จุด" color="text-rose-500" isAlert={stats.warningDiseases > 0} />
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-black mb-2 tracking-widest">การเชื่อมต่อ</p>
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-emerald-500 leading-none">{stats.onlineFarms}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Online</span>
                </div>
                <div className="h-8 w-[1px] bg-slate-100"></div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-rose-400 leading-none">{stats.offlineFarms}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Offline</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl text-slate-300"><Wifi size={28} /></div>
          </div>
        </div>

        {/* 2️⃣ Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
            <h3 className="text-sm font-black text-slate-700 uppercase mb-6 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div> สถานะอุปกรณ์
            </h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value">
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} stroke="none" />)}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
               <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                 <div className="w-3 h-3 rounded-full bg-emerald-500"></div> เชื่อมต่อ
               </div>
               <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                 <div className="w-3 h-3 rounded-full bg-rose-500"></div> ขาดการติดต่อ
               </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
            <h3 className="text-sm font-black text-slate-700 uppercase mb-4 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div> พื้นที่เสี่ยงในแต่ละฟาร์ม (ระดับน้ำ & โรค) + latest_setting
            </h3>
            <div className="text-xs text-slate-500 mb-3">ค่าตั้งต้น: </div>
            <div className="max-h-[250px] overflow-y-auto space-y-3">
              {farmData.map(f => {
                const s = f.latest_setting || { data_send_interval_days:1, growth_analysis_period:7, water_level_max:10, water_level_min:5 };
                const reasons = [];
                (f.areas || []).forEach(a => {
                  const code = String(a.device_code ?? '').trim().toUpperCase();
                  if (!code || code === 'N/A' || code === 'NA') return; // skip unregistered areas

                  if (a.latest_disease || a.disease?.status === 'warning') {
                    const name = a.latest_disease?.disease_name || a.disease?.name || 'ความเสี่ยงโรค';
                    reasons.push({ type: 'disease', text: `${a.area_name}: พบโรค ${name}` });
                  }

                  const wl = a.sensor?.water_level;
                  if (wl != null && (wl > (s.water_level_max ?? 10) || wl < (s.water_level_min ?? 5))) {
                    const type = wl > (s.water_level_max ?? 10) ? 'water-high' : 'water-low';
                    const dir = type === 'water-high' ? 'สูงกว่า' : 'ต่ำกว่า';
                    reasons.push({ type, text: `${a.area_name}: ระดับน้ำ ${wl}cm (${dir}เกณฑ์)` });
                  }
                });
                const riskCount = reasons.length;
                return (
                  <div key={f.farm_id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 truncate">{f.farm_name}</div>
                        <div className="text-[11px] text-slate-400 mt-1">พื้นที่เสี่ยง: <span className="font-black text-rose-500">{riskCount}</span></div>
                                {reasons.length > 0 && (() => {
                                  const isExpanded = expandedRisks.includes(f.farm_id);
                                  const shown = isExpanded ? reasons : reasons.slice(0,3);
                                  return (
                                    <div className="mt-2">
                                      <ul className="text-[12px] text-slate-600 space-y-1">
                                        {shown.map((r, i) => (
                                          <li key={i} className="truncate flex items-center gap-2">
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${r.type === 'disease' ? 'bg-rose-100 text-rose-600' : r.type === 'water-high' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>{r.type === 'disease' ? 'โรค' : r.type === 'water-high' ? 'น้ำ-สูง' : 'น้ำ-ต่ำ'}</span>
                                            <span className="truncate">{r.text}</span>
                                          </li>
                                        ))}
                                      </ul>
                                      {reasons.length > 3 && (
                                        <div className="mt-1">
                                          <button
                                            onClick={() => setExpandedRisks(prev => prev.includes(f.farm_id) ? prev.filter(id => id !== f.farm_id) : [...prev, f.farm_id])}
                                            className="text-xs text-emerald-600 hover:underline"
                                          >
                                            {isExpanded ? 'ย่อ' : `ดูทั้งหมด (${reasons.length})`}
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                      </div>
                      <div className="text-right text-[11px] text-slate-500">
                        <div>W max: <span className="font-bold text-slate-700">{s.water_level_max}</span></div>
                        <div>W min: <span className="font-bold text-slate-700">{s.water_level_min}</span></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3️⃣ List Accordion */}
        <section className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black text-slate-800">รายชื่อฟาร์มในระบบ ({filteredFarms.length})</h2>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full italic">อัปเดตล่าสุด: เมื่อสักครู่</span>
           </div>
           
           {filteredFarms.length > 0 ? (
             filteredFarms.map(farm => (
               <FarmAccordion 
                 key={farm.farm_id} 
                 farm={farm} 
                 isExpanded={expandedFarmId === farm.farm_id}
                 onToggle={() => setExpandedFarmId(expandedFarmId === farm.farm_id ? null : farm.farm_id)}
               />
             ))
           ) : (
             <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-200">
                <Search size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 font-bold">ไม่พบข้อมูลฟาร์มที่ค้นหา</p>
             </div>
           )}
        </section>
      </main>

      
 <Footer />

      </div>
     
    </div>

           
  );
}



// --- Sub-components ---

const StatCard = ({ title, value, icon, unit, color, isAlert }) => (
  <div className={`bg-white p-6 rounded-[24px] shadow-sm border transition-all duration-300 hover:shadow-md ${isAlert ? 'border-rose-200 bg-rose-50/20' : 'border-slate-100'}`}>
    <div className="flex justify-between items-start mb-4">
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <div className={`p-2.5 rounded-xl ${isAlert ? 'bg-rose-100 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
        {icon}
      </div>
    </div>
    <div className="flex items-baseline gap-2">
      <span className={`text-3xl font-black ${color}`}>{value}</span>
      <span className="text-xs text-slate-400 font-bold">{unit}</span>
    </div>
  </div>
);
const FarmAccordion = ({ farm, isExpanded, onToggle }) => {
  return (
    <div className={`mb-4 overflow-hidden transition-all duration-400 ${
      isExpanded 
        ? 'bg-white rounded-[1.5rem] shadow-lg border border-slate-200' 
        : 'bg-white/80 rounded-xl border border-slate-200 shadow-sm hover:shadow-md'
    }`}>
      {/* Header - Farm Summary (Compact) */}
      <button onClick={onToggle} className="w-full flex items-center justify-between p-3 md:p-4 outline-none">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
            isExpanded ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
          }`}>
            <Sprout size={24} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-lg text-slate-800 tracking-tight">{farm.farm_name}</h4>
              <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">
                {farm.areas?.length || 0} แปลง
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin size={12} /> {farm.location}
              </span>
              <span className={`text-[10px] font-bold ${farm.status === 'Online' ? 'text-emerald-500' : 'text-rose-500'}`}>
                ● {farm.status}
              </span>
            </div>
          </div>
        </div>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
          isExpanded ? 'bg-slate-800 text-white rotate-180' : 'bg-slate-50 text-slate-400'
        }`}>
          <ChevronDown size={18} />
        </div>
      </button>

      {/* Content */}
      <div className={`transition-all duration-500 ${isExpanded ? 'max-h-[2500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-6 md:p-6 pt-0 space-y-6">
          {farm.areas.map((area, idx) => (
            <div key={area.area_id} className="pt-4 border-t border-slate-50">
              
              {/* Area Sub-header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                  <h5 className="font-bold text-slate-800 text-base">{area.area_name}</h5>
                  <span className="text-[10px] text-slate-400 font-mono">#{area.device_code}</span>
                </div>
                {area.latest_growth && (
                  <span className="text-[14px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                    {area.latest_growth.growth_stage || area.latest_growth.stage}
                  </span>
                )}
              </div>

              {(!area.device_code || String(area.device_code).toUpperCase() === 'N/A') ? (
                <div className="p-6 bg-slate-50/60 rounded-2xl border border-slate-100 text-center">
                  <div className="text-sm font-bold text-slate-700">พื้นที่นี้ยังไม่มีการลงทะเบียนเชื่อมต่อกับอุปกรณ์ IoT</div>
                  <div className="text-xs text-slate-400 mt-2">โปรดลงทะเบียนอุปกรณ์เพื่อรับข้อมูลเรียลไทม์</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* 1. Water Level (Small) - lg:col-span-3 */}
                  <div className="lg:col-span-3 bg-slate-50/80 rounded-2xl p-4 border border-slate-100 flex flex-col items-center">
                    <div className="w-full flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-600">ระดับน้ำ</span>
                      <span className="text-[9px] font-bold text-rose-500 animate-pulse">LIVE</span>
                    </div>
                    <div className="relative w-16 h-28 bg-white rounded-2xl border-2 border-white shadow-inner overflow-hidden flex flex-col justify-end">
                      <div 
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-300 transition-all duration-1000"
                        style={{ height: `${Math.min((area.sensor.water_level / 40) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="mt-3 text-center">
                      <span className="text-xl font-black text-slate-800">{area.sensor.water_level}</span>
                      <span className="text-xs text-slate-400 ml-1">cm</span>
                    </div>
                  </div>

                  {/* 2. NPK Grid - lg:col-span-6 */}
                  <div className="lg:col-span-6 grid grid-cols-2 gap-3">
                    {[
                      { label: 'ไนโตรเจน (N)', value: area.sensor.n, color: 'emerald', icon: <Sprout size={16}/> },
                      { label: 'ฟอสฟอรัส (P)', value: area.sensor.p, color: 'orange', icon: <Droplets size={16}/> },
                      { label: 'โพแทสเซียม (K)', value: area.sensor.k, color: 'purple', icon: <Zap size={16}/> },
                      { label: 'ความชื้นดิน', value: area.sensor.moisture , color: 'blue', icon: <Thermometer size={16}/> }
                    ].map((s, i) => (
                      <div key={i} className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`text-${s.color}-500`}>{s.icon}</div>
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{s.label}</span>
                        </div>
                        <div className="mt-3 flex items-baseline justify-end gap-1">
                          <span className="text-2xl font-black text-slate-800">{s.value}</span>
                          <span className="text-[9px] font-bold text-slate-300">mg/kg</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 3. Rice Disease (เอาคืนมา) - lg:col-span-3 */}
                  <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldCheck size={18} className="text-emerald-500" />
                      <span className="text-xs font-bold text-slate-700">การตรวจจับโรค</span>
                    </div>
                    
                    {/* แสดงผลโรคที่ตรวจพบ */}
                    <div className={`p-3 rounded-xl border ${(area.latest_disease || area.disease?.status === 'warning') ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                      <div className="flex flex-col items-center text-center">
                        {area.latest_disease ? (
                          <>
                            <AlertCircle size={24} className="text-rose-500 mb-1" />
                            <div className="text-[11px] font-bold text-rose-600">พบความเสี่ยง!</div>
                            <div className="text-xs font-black text-rose-700 uppercase">{area.latest_disease.disease_name || area.disease?.name || 'ไม่ระบุโรค'}</div>
                            {area.latest_disease.confidence != null && (
                              <div className="text-[10px] text-rose-600 mt-1">ความมั่นใจ: {(area.latest_disease.confidence * 100).toFixed(1)}%</div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="text-[11px] font-bold text-emerald-600">สภาพปกติ</div>
                            <div className="text-xs font-black text-emerald-700">ไม่พบโรคพืช</div>
                            <div className="text-[9px] text-emerald-500 mt-1 uppercase">Checked 100%</div>
                          </>
                        )}
                      </div>
                    </div>


                    {/* ปุ่มดูรายละเอียดเพิ่มเติม - ปรับให้ชิดขวาและแก้ Error */}
<div className="flex items-center justify-center mt-6">
    <Link
        // เปลี่ยนจาก to เป็น href และใส่ fallback กรณี device_code ไม่มีค่า
        href={`/Paddy/admin/sensor/${area?.device_code || 'default'}`}
        className="inline-flex items-center gap-2 bg-slate-800 text-white px-6 py-2 rounded-xl text-[11px] font-bold hover:bg-slate-700 active:scale-95 transition-all shadow-sm"
    >
        ดูรายละเอียดเพิ่มเติม
        <ChevronDown size={14} className="-rotate-90" />
    </Link>
</div>
                    

                  </div>

                  
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


