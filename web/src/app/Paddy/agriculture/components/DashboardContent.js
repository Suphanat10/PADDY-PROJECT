"use client";
import { useMemo, useRef, useState } from "react";
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Thermometer,
  Droplets,
  Sprout,
  BarChart3,
  TrendingUp,
  MapPin,
  Crosshair,
  Compass,
  Activity,
  Wifi,
  WifiOff,
  AlertTriangle,
} from "lucide-react";

/** =============== MOCK DATA =============== **/
const devices = [
  {
    id: 1,
    name: "Device A1",
    type: "temperature",
    value: "32°C",
    location: "แปลง A",
    farmName: "สวนลุงเล็ก",
    lastUpdate: "2025-09-02 10:15",
    status: "connected",
    battery: 85,
    x: 260,
    y: 480,
  },
  {
    id: 2,
    name: "Device B1",
    type: "humidity",
    value: "65%",
    location: "แปลง B",
    farmName: "สวนป้าจำปี",
    lastUpdate: "2025-09-02 10:12",
    status: "warning",
    battery: 45,
    x: 650,
    y: 780,
  },
  {
    id: 3,
    name: "Device C1",
    type: "soil",
    value: "45%",
    location: "แปลง C",
    farmName: "สวนลุงเล็ก",
    lastUpdate: "2025-09-02 09:58",
    status: "disconnected",
    battery: 12,
    x: 350,
    y: 520,
  },
  {
    id: 4,
    name: "Device D1",
    type: "temperature",
    value: "28°C",
    location: "แปลง D",
    farmName: "สวนป้าจำปี",
    lastUpdate: "2025-09-02 10:20",
    status: "connected",
    battery: 92,
    x: 680,
    y: 820,
  },
];

const farms = [
  {
    id: "farm-uncle-lek",
    name: "สวนลุงเล็ก",
    polygon: [
      [180, 420],
      [400, 410],
      [420, 580],
      [190, 590],
    ],
    color: "#10b981",
    deviceCount: 2,
  },
  {
    id: "farm-aunt-jumpee",
    name: "สวนป้าจำปี",
    polygon: [
      [540, 720],
      [760, 710],
      [780, 900],
      [560, 900],
    ],
    color: "#06b6d4",
    deviceCount: 2,
  },
];

/** =============== HELPERS =============== **/
const getStatusConfig = (status) => {
  const configs = {
    connected: {
      bg: "bg-emerald-500",
      glow: "shadow-emerald-500/50",
      pulse: "animate-pulse",
      icon: Wifi,
    },
    warning: {
      bg: "bg-amber-500",
      glow: "shadow-amber-500/50",
      pulse: "animate-bounce",
      icon: AlertTriangle,
    },
    disconnected: {
      bg: "bg-red-500",
      glow: "shadow-red-500/50",
      pulse: "",
      icon: WifiOff,
    },
  };
  return configs[status] || configs.disconnected;
};

const deviceIcon = (type) => {
  const icons = {
    temperature: <Thermometer className="w-3.5 h-3.5 text-white" />,
    humidity: <Droplets className="w-3.5 h-3.5 text-white" />,
    soil: <Sprout className="w-3.5 h-3.5 text-white" />,
    default: <BarChart3 className="w-3.5 h-3.5 text-white" />,
  };
  return icons[type] || icons.default;
};

const getBatteryColor = (battery) => {
  if (battery > 60) return "text-emerald-500";
  if (battery > 30) return "text-amber-500";
  return "text-red-500";
};

/** =============== ENHANCED MAP =============== **/
function EnhancedFakeMap() {
  const WORLD_W = 1000;
  const WORLD_H = 1000;

  const [zoom, setZoom] = useState(1.2);
  const [offset, setOffset] = useState({ x: -150, y: -100 });
  const [hover, setHover] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const dragRef = useRef({ dragging: false, sx: 0, sy: 0, ox: 0, oy: 0 });

  const onWheel = (e) => {
    e.preventDefault();
    const delta = -e.deltaY;
    const factor = delta > 0 ? 1.1 : 0.9;
    let next = Math.min(3, Math.max(0.6, zoom * factor));

    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const wxBefore = (cx - offset.x) / zoom;
    const wyBefore = (cy - offset.y) / zoom;

    const newOffsetX = cx - wxBefore * next;
    const newOffsetY = cy - wyBefore * next;

    setZoom(next);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  const onPointerDown = (e) => {
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    dragRef.current = {
      dragging: true,
      sx: e.clientX,
      sy: e.clientY,
      ox: offset.x,
      oy: offset.y,
    };
  };

  const onPointerMove = (e) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.sx;
    const dy = e.clientY - dragRef.current.sy;
    setOffset({ x: dragRef.current.ox + dx, y: dragRef.current.oy + dy });
  };

  const onPointerUp = (e) => {
    dragRef.current.dragging = false;
  };

  const resetView = () => {
    setZoom(1.2);
    setOffset({ x: -150, y: -100 });
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          แผนที่ฟาร์มอัจฉริยะ
        </h3>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center text-xs text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
            <Compass className="w-4 h-4 mr-1.5 text-blue-500" />
            <span className="font-medium">ทิศเหนือ</span>
          </div>
          
          <div className="flex items-center bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full overflow-hidden shadow-sm">
            <button
              className="px-3 py-1.5 text-sm font-medium border-r border-gray-200 hover:bg-blue-50 transition-colors"
              onClick={() => setZoom((z) => Math.min(3, z * 1.15))}
            >
              +
            </button>
            <div className="px-3 py-1.5 text-xs font-semibold w-16 text-center bg-gray-50">
              {(zoom * 100).toFixed(0)}%
            </div>
            <button
              className="px-3 py-1.5 text-sm font-medium border-l border-gray-200 hover:bg-blue-50 transition-colors"
              onClick={() => setZoom((z) => Math.max(0.6, z / 1.15))}
            >
              −
            </button>
          </div>
          
          <button
            className="px-4 py-1.5 text-sm font-medium bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full hover:bg-blue-50 transition-all duration-200 shadow-sm"
            onClick={resetView}
            title="รีเซ็ตมุมมอง"
          >
            รีเซ็ต
          </button>
        </div>
      </div>

      {/* Enhanced Map Viewport */}
      <div
        className="relative w-full h-96 sm:h-[500px] bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50 border-2 border-gray-200 rounded-2xl overflow-hidden select-none shadow-xl"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* Enhanced Background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(0deg, rgba(0,0,0,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px),
              radial-gradient(circle at 25% 25%, rgba(34,197,94,0.1), transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(59,130,246,0.08), transparent 45%),
              radial-gradient(circle at 50% 50%, rgba(168,85,247,0.05), transparent 60%)
            `,
            backgroundSize: "30px 30px, 30px 30px, 100% 100%, 100% 100%, 100% 100%",
          }}
        />

        {/* World Layer */}
        <div
          className="absolute top-0 left-0 origin-top-left transition-transform duration-100"
          style={{
            width: WORLD_W,
            height: WORLD_H,
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          }}
        >
          {/* Enhanced Rivers & Roads */}
          <svg width={WORLD_W} height={WORLD_H} className="absolute inset-0">
            <defs>
              <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            
            {/* River with gradient */}
            <path
              d="M 50 150 C 200 120, 260 220, 420 200 C 620 180, 700 260, 900 230"
              fill="none"
              stroke="url(#riverGrad)"
              strokeWidth="20"
            />
            
            {/* Main Road - avoiding farm areas */}
            <path
              d="M 100 950 L 140 900 L 120 400 L 150 350 L 200 300 L 400 250 L 500 200 L 600 150 L 850 100"
              stroke="#6b7280"
              strokeWidth="8"
              opacity="0.5"
              strokeDasharray="20,10"
            />
            
            {/* Secondary Road */}
            <path
              d="M 400 250 L 450 400 L 480 600"
              stroke="#9ca3af"
              strokeWidth="6"
              opacity="0.4"
              strokeDasharray="15,8"
            />
            
            {/* Farm Access Road */}
            <path
              d="M 480 600 L 520 650 L 600 680"
              stroke="#9ca3af"
              strokeWidth="4"
              opacity="0.4"
              strokeDasharray="10,5"
            />
          </svg>

          {/* Enhanced Farm Polygons */}
          {farms.map((f) => (
            <svg
              key={f.id}
              width={WORLD_W}
              height={WORLD_H}
              className="absolute inset-0 pointer-events-none"
            >
              <defs>
                <pattern id={`pattern-${f.id}`} patternUnits="userSpaceOnUse" width="4" height="4">
                  <rect width="4" height="4" fill={f.color + "15"} />
                  <path d="M 0,4 L 4,0" stroke={f.color} strokeWidth="0.5" opacity="0.3" />
                </pattern>
              </defs>
              
              <polygon
                points={f.polygon.map(([x, y]) => `${x},${y}`).join(" ")}
                fill={`url(#pattern-${f.id})`}
                stroke={f.color}
                strokeWidth="3"
                strokeDasharray="5,5"
                className="drop-shadow-sm"
              />
              
              {/* Farm Label */}
              <text
                x={f.polygon.reduce((acc, [x]) => acc + x, 0) / f.polygon.length}
                y={f.polygon.reduce((acc, [, y]) => acc + y, 0) / f.polygon.length}
                textAnchor="middle"
                className="fill-gray-700 text-sm font-semibold pointer-events-none"
                style={{ fontSize: '14px' }}
              >
                {f.name}
              </text>
            </svg>
          ))}

          {/* Enhanced Device Markers */}
          {devices.map((d) => {
            const config = getStatusConfig(d.status);
            return (
              <div
                key={d.id}
                className="absolute cursor-pointer group"
                style={{ left: d.x, top: d.y, transform: "translate(-50%, -100%)" }}
                onMouseEnter={() => setHover(d.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setSelectedDevice(d)}
              >
                {/* Enhanced Pin */}
                <div className="relative">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full shadow-lg ring-4 ring-white ${config.bg} ${config.glow} ${d.status === 'connected' ? 'shadow-lg' : ''} group-hover:scale-110 transition-transform duration-200`}
                  >
                    {deviceIcon(d.type)}
                  </div>
                  
                  {/* Status indicator */}
                  <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${config.bg} ring-2 ring-white ${config.pulse}`}>
                    {d.status === 'connected' && (
                      <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75"></div>
                    )}
                  </div>
                </div>

                {/* Enhanced Label */}
                <div className="mt-2 bg-white/95 backdrop-blur-sm border border-gray-200 text-xs px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap group-hover:bg-white transition-colors">
                  <div className="font-semibold text-gray-800">{d.name}</div>
                  <div className="text-gray-500 text-xs">{d.value}</div>
                </div>

                {/* Enhanced Tooltip */}
                {hover === d.id && (
                  <div className="absolute left-1/2 -translate-x-1/2 -translate-y-4 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 text-sm w-56 z-20 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-gray-800">{d.name}</div>
                      <div className={`flex items-center gap-1 ${getBatteryColor(d.battery)}`}>
                        <Activity className="w-3 h-3" />
                        <span className="text-xs font-medium">{d.battery}%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">ประเภท:</span>
                        <span className="font-medium capitalize">{d.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ค่าปัจจุบัน:</span>
                        <span className="font-bold text-blue-600">{d.value}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">สถานะ:</span>
                        <span className={`font-medium ${
                          d.status === 'connected' ? 'text-emerald-600' :
                          d.status === 'warning' ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {d.status === 'connected' ? 'เชื่อมต่อ' :
                           d.status === 'warning' ? 'มีปัญหา' : 'ไม่เชื่อมต่อ'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="text-gray-700 font-medium">{d.farmName}</div>
                      <div className="text-gray-500 text-xs">{d.location}</div>
                      <div className="text-gray-400 text-xs mt-1">อัปเดต: {d.lastUpdate}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Enhanced Status Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 text-sm shadow-xl">
          <div className="font-bold text-gray-800 mb-3 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-blue-500" />
            สถานะอุปกรณ์
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-sm"></div>
              <span className="text-gray-700">เชื่อมต่อปกติ</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-amber-500 shadow-sm"></div>
              <span className="text-gray-700">มีปัญหา/แจ้งเตือน</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm"></div>
              <span className="text-gray-700">ไม่เชื่อมต่อ</span>
            </div>
          </div>
        </div>

        {/* Enhanced Farm Legend */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 text-sm shadow-xl">
          <div className="font-bold text-gray-800 mb-3 flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-green-500" />
            พื้นที่ฟาร์ม
          </div>
          <div className="space-y-2">
            {farms.map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border shadow-sm"
                    style={{ backgroundColor: l.color }}
                  />
                  <span className="text-gray-700">{l.name}</span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {l.deviceCount} เครื่อง
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** =============== MAIN DASHBOARD =============== **/
export default function DashboardContent() {
  const countBy = (status) => devices.filter((d) => d.status === status).length;
  
  const dailyStats = {
    temperature: { avg: 30, min: 28, max: 34 },
    humidity: { avg: 65, min: 60, max: 70 },
    soilMoisture: { avg: 45, min: 40, max: 50 },
    dataPoints: devices.length * 24,
    alerts: countBy('warning') + countBy('disconnected'),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/30">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 p-6 sm:p-8 lg:p-10">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl mr-4">
                <Activity className="w-8 h-8 text-white" />
              </div>
              ระบบจัดการฟาร์มอัจฉริยะ
            </h1>
            <p className="text-gray-600">ติดตามและควบคุมอุปกรณ์ IoT ในฟาร์มแบบเรียลไทม์</p>
          </div>

          {/* Enhanced Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="group hover:scale-105 transition-transform duration-200">
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-emerald-500/25">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-bold mb-1">{countBy("connected")}</h3>
                    <p className="text-emerald-100 font-medium">เชื่อมต่อแล้ว</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-emerald-100 text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>ทำงานปกติ</span>
                </div>
              </div>
            </div>

            <div className="group hover:scale-105 transition-transform duration-200">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-amber-500/25">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-bold mb-1">{countBy("warning")}</h3>
                    <p className="text-amber-100 font-medium">มีปัญหา</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-amber-100 text-sm">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  <span>ต้องตรวจสอบ</span>
                </div>
              </div>
            </div>

            <div className="group hover:scale-105 transition-transform duration-200">
              <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-red-500/25">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-bold mb-1">{countBy("disconnected")}</h3>
                    <p className="text-red-100 font-medium">ไม่ได้เชื่อมต่อ</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <XCircle className="w-8 h-8" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-red-100 text-sm">
                  <WifiOff className="w-4 h-4 mr-1" />
                  <span>ออฟไลน์</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Map */}
          <EnhancedFakeMap />

          {/* Device List */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <BarChart3 className="w-6 h-6 mr-2" />
              รายชื่ออุปกรณ์ทั้งหมด
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {devices.map((device) => {
                const config = getStatusConfig(device.status);
                return (
                  <div key={device.id} className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config.bg}`}>
                          {deviceIcon(device.type)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{device.name}</h4>
                          <p className="text-sm text-gray-600">{device.farmName} • {device.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-800">{device.value}</div>
                        <div className={`text-xs ${getBatteryColor(device.battery)}`}>
                          แบตเตอรี่ {device.battery}%
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      อัปเดตล่าสุด: {device.lastUpdate}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}