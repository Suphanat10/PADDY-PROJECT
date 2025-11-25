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
    <>
    </>  );
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
    // 
    <>
    </>
  );
}