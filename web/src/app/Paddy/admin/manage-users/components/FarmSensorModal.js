"use client";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import {
  X,
  Loader2,
  Tractor,
  MapPin,
  Wheat,
  ChevronDown,
  Sprout,
  Bug,
  Droplets,
  Zap,
  Flame,
  Leaf,
  Clock,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Radio,
} from "lucide-react";

const SOCKET_URL = "https://smart-paddy.space";

// Water Level Visual Component
const WaterLevelCard = ({ value, minLevel = 5, maxLevel = 15, tankHeight = 30, isLive = false }) => {
  const numValue = parseFloat(value) || 0;
  // Calculate percentage based on tank height (30cm)
  const percentage = Math.min(Math.max((numValue / tankHeight) * 100, 0), 100);
  const minPercent = (minLevel / tankHeight) * 100;
  const maxPercent = (maxLevel / tankHeight) * 100;
  
  // Status calculation
  let statusText = "ปกติ";
  let statusColor = "bg-emerald-500";
  
  if (numValue < minLevel) {
    statusText = "ต่ำ";
    statusColor = "bg-amber-500";
  } else if (numValue > maxLevel) {
    statusText = "สูง";
    statusColor = "bg-rose-500";
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
          ระดับน้ำ (Live)
        </h3>
        {isLive && (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span className="text-xs font-semibold text-rose-500">LIVE</span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center">
        {/* Water Tank Visual */}
        <div className="relative">
          <div className="w-28 h-40 border-2 border-slate-300 rounded-xl bg-slate-50 overflow-hidden relative">
            {/* Water fill */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-cyan-400 transition-all duration-500"
              style={{ height: `${percentage}%` }}
            >
              {/* Wave effect */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
            </div>
            
            {/* MAX line */}
            <div 
              className="absolute left-0 right-0 border-t-2 border-dashed border-rose-400 z-10"
              style={{ bottom: `${maxPercent}%` }}
            ></div>
            
            {/* MIN line */}
            <div 
              className="absolute left-0 right-0 border-t-2 border-dashed border-rose-400 z-10"
              style={{ bottom: `${minPercent}%` }}
            ></div>
          </div>
          
          {/* Level Labels - Outside tank */}
          <div className="absolute -right-12 top-0 bottom-0 flex flex-col justify-between text-[10px] font-bold py-1">
            <span className="text-slate-400">{tankHeight}</span>
            <span className="text-rose-500" style={{ position: 'absolute', bottom: `${maxPercent}%`, transform: 'translateY(50%)' }}>MAX</span>
            <span className="text-rose-500" style={{ position: 'absolute', bottom: `${minPercent}%`, transform: 'translateY(50%)' }}>MIN</span>
            <span className="text-slate-400">0</span>
          </div>
        </div>

        {/* Value & Status - Below tank */}
        <div className="text-center mt-4">
          <div className="text-3xl font-black text-slate-800">
            {numValue.toFixed(0)}
            <span className="text-base font-medium text-slate-400 ml-1">ซม.</span>
          </div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${statusColor} text-white text-xs font-semibold mt-2`}>
            <CheckCircle size={12} />
            {statusText}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            เกณฑ์ {minLevel} - {maxLevel} ซม.
          </div>
        </div>
      </div>
    </div>
  );
};

// NPK & Humidity Sensor Card
const SensorDisplayCard = ({ label, value, unit, icon: Icon, gradientFrom, gradientTo }) => {
  const v = Number(value ?? 0);

  // Compute level label for N/P/K
  let levelLabel = null;
  if (label.includes("ไนโตรเจน") || label.includes("N")) {
    const calculatedOM = v / 500;
    levelLabel = calculatedOM < 1.0 ? "ต่ำ" : calculatedOM <= 2.0 ? "ปานกลาง" : "สูง";
    levelLabel = `ระดับ: OM ${levelLabel}`;
  } else if (label.includes("ฟอสฟอรัส") || label.includes("P")) {
    levelLabel = v < 5 ? "ต่ำ" : v <= 10 ? "ปานกลาง" : "สูง";
    levelLabel = `ระดับ: ${levelLabel}`;
  } else if (label.includes("โพแทสเซียม") || label.includes("K")) {
    levelLabel = v < 60 ? "ต่ำ" : v <= 80 ? "ปานกลาง" : "สูง";
    levelLabel = `ระดับ: ${levelLabel}`;
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center`}>
          <Icon size={16} className="text-white" />
        </div>
        <span className="text-sm font-semibold text-slate-600">{label}</span>
      </div>
      <div className="mt-auto text-right">
        <div>
          <span className="text-3xl font-black text-slate-800">
            {value !== null && value !== undefined ? value : "-"}
          </span>
          <span className="text-sm font-medium text-slate-400 ml-1">{unit}</span>
        </div>
        {levelLabel && (
          <div className="mt-2">
            <span className={`text-xs font-bold ${label.includes("ไนโตรเจน") ? "text-emerald-600" : label.includes("ฟอสฟอรัส") ? "text-orange-600" : label.includes("โพแทสเซียม") ? "text-purple-600" : "text-slate-500"}`}>
              {levelLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Growth Info Card
const GrowthInfoCard = ({ growth }) => {
  if (!growth) {
    return (
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 text-center">
        <Sprout className="mx-auto text-slate-300 mb-2" size={32} />
        <p className="text-slate-400 text-sm">ยังไม่มีข้อมูลระยะการเจริญเติบโต</p>
      </div>
    );
  }

  return (
    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
      <div className="flex items-start gap-4">
        {growth.image_url && (
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-white border border-emerald-200 shrink-0">
            <img
              src={growth.image_url}
              alt="Growth"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Sprout className="text-emerald-600" size={18} />
            <span className="font-bold text-emerald-800">{growth.stage}</span>
            {growth.progress !== undefined && (
              <span className="text-xs bg-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full">
                {growth.progress}%
              </span>
            )}
          </div>
          {growth.advice && (
            <p className="text-xs text-emerald-700 line-clamp-3">{growth.advice}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Disease Info Card
const DiseaseInfoCard = ({ disease }) => {
  if (!disease) {
    return (
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 text-center">
        <Bug className="mx-auto text-slate-300 mb-2" size={32} />
        <p className="text-slate-400 text-sm">ยังไม่มีข้อมูลสถานะโรค</p>
      </div>
    );
  }

  const isWarning = disease.status === "warning";

  return (
    <div className={`rounded-xl p-4 border ${isWarning ? "bg-rose-50 border-rose-200" : "bg-emerald-50 border-emerald-200"}`}>
      <div className="flex items-start gap-4">
        {disease.image_url && (
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-white border shrink-0">
            <img
              src={disease.image_url}
              alt="Disease"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {isWarning ? (
              <AlertTriangle className="text-rose-600" size={18} />
            ) : (
              <CheckCircle className="text-emerald-600" size={18} />
            )}
            <span className={`font-bold ${isWarning ? "text-rose-800" : "text-emerald-800"}`}>
              {disease.name || "ปกติ"}
            </span>
          </div>
          {disease.advice && (
            <p className={`text-xs ${isWarning ? "text-rose-700" : "text-emerald-700"} line-clamp-3`}>
              {disease.advice}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Timeline Card
const TimelineCard = ({ title, icon: Icon, iconBg, borderColor, bgColor, items = [], emptyText }) => (
  <div className={`bg-white rounded-xl border ${borderColor} overflow-hidden`}>
    <div className="px-4 py-3 flex items-center gap-2 border-b border-slate-100">
      <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center`}>
        <Icon size={16} className="text-white" />
      </div>
      <h4 className="font-semibold text-slate-700 text-sm">{title}</h4>
      <span className="ml-auto text-xs text-slate-400">{items.length} รายการ</span>
    </div>
    <div className={`p-4 ${bgColor} max-h-60 overflow-y-auto`}>
      {items.length === 0 ? (
        <div className="text-center py-8">
          <Icon className="mx-auto text-slate-200 mb-2" size={32} strokeWidth={1} />
          <p className="text-slate-400 text-sm">{emptyText}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="bg-white rounded-lg p-3 border border-slate-100 flex items-start gap-3">
              {item.image_url && (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={item.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-800 text-sm">
                    {item.stage || item.name}
                  </span>
                  {item.confidence && (
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      {item.confidence}%
                    </span>
                  )}
                </div>
                {item.date && (
                  <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                    <Clock size={10} /> {item.date}
                  </div>
                )}
                {item.advice && (
                  <p className="text-[11px] text-slate-500 line-clamp-2">{item.advice}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// Main Farm Sensor Modal Component
export const FarmSensorModal = ({
  isOpen,
  onClose,
  selectedUser,
  farmData,
  loading,
}) => {
  const [selectedFarmIndex, setSelectedFarmIndex] = useState(0);
  const [selectedAreaIndex, setSelectedAreaIndex] = useState(0);
  const [showFarmDropdown, setShowFarmDropdown] = useState(false);
  
  // Socket.io states
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [liveData, setLiveData] = useState(null);
  const socketRef = useRef(null);

  // Reset selections when modal opens or data changes
  useEffect(() => {
    setSelectedFarmIndex(0);
    setSelectedAreaIndex(0);
    setLiveData(null);
  }, [farmData, isOpen]);

  // Socket.io connection
  useEffect(() => {
    if (!isOpen) return;
    
    const selectedFarm = farmData?.[selectedFarmIndex];
    const selectedArea = selectedFarm?.areas?.[selectedAreaIndex];
    const deviceId = selectedArea?.device_code;
    
    if (!deviceId) return;

    // Create socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("🟢 FarmSensor Socket Connected");
      setIsSocketConnected(true);
      socket.emit("join-device", deviceId);
    });

    socket.on("sensorData", (payload) => {
      if (!payload || payload.device_code !== deviceId) return;
      
      const msgData = payload.data;
      setLiveData({
        N: msgData.N,
        P: msgData.P,
        K: msgData.K,
        water_level: msgData.water_level,
        timestamp: payload.measured_at,
      });
    });

    socket.on("disconnect", () => {
      console.warn("🔴 FarmSensor Socket Disconnected");
      setIsSocketConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket Error:", err.message);
      setIsSocketConnected(false);
    });

    return () => {
      console.log("Cleanup FarmSensor Socket");
      socket.off("connect");
      socket.off("sensorData");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, [isOpen, selectedFarmIndex, selectedAreaIndex, farmData]);

  if (!isOpen) return null;

  const selectedFarm = farmData?.[selectedFarmIndex] || null;
  const selectedArea = selectedFarm?.areas?.[selectedAreaIndex] || null;

  // Get sensor data (live data takes priority over historical)
  const latestSensor = selectedArea?.sensor_history?.[selectedArea.sensor_history.length - 1] || selectedArea?.sensor || {};
  const sensorData = liveData || latestSensor;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative bg-slate-100 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 flex justify-between items-center bg-white border-b border-slate-200 shrink-0">
            <div>
              <h3 className="font-bold text-lg text-slate-800">ข้อมูลฟาร์ม</h3>
              {selectedUser && (
                <p className="text-slate-500 text-sm">
                  {selectedUser.first_name} {selectedUser.last_name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Socket Status */}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${isSocketConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                <Radio size={12} className={isSocketConnected ? 'animate-pulse' : ''} />
                {isSocketConnected ? 'เชื่อมต่อแล้ว' : 'ไม่ได้เชื่อมต่อ'}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
                <p className="text-slate-500">กำลังโหลดข้อมูล...</p>
              </div>
            ) : !farmData || farmData.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tractor className="text-slate-400" size={32} />
                </div>
                <p className="text-slate-500 font-semibold">ไม่พบข้อมูลฟาร์ม</p>
                <p className="text-slate-400 text-sm mt-1">ผู้ใช้งานนี้ยังไม่มีฟาร์มในระบบ</p>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                {/* Farm Selector */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">เลือกฟาร์ม</label>
                    <button
                      type="button"
                      onClick={() => setShowFarmDropdown(!showFarmDropdown)}
                      className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-400 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Tractor className="text-emerald-600" size={18} />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{selectedFarm?.farm_name}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-2">
                            <MapPin size={10} /> {selectedFarm?.location || "-"}
                            <span className="mx-1">•</span>
                            <Wheat size={10} /> {selectedFarm?.rice_variety || "-"}
                          </div>
                        </div>
                      </div>
                      <ChevronDown className={`text-slate-400 transition-transform ${showFarmDropdown ? 'rotate-180' : ''}`} size={18} />
                    </button>
                    
                    {showFarmDropdown && farmData.length > 1 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
                        {farmData.map((farm, idx) => (
                          <button
                            key={farm.farm_id}
                            type="button"
                            onClick={() => {
                              setSelectedFarmIndex(idx);
                              setSelectedAreaIndex(0);
                              setShowFarmDropdown(false);
                              setLiveData(null);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left ${idx === selectedFarmIndex ? 'bg-emerald-50' : ''}`}
                          >
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <Tractor className="text-emerald-600" size={16} />
                            </div>
                            <div>
                              <div className="font-medium text-slate-800 text-sm">{farm.farm_name}</div>
                              <div className="text-xs text-slate-400">{farm.areas?.length || 0} พื้นที่</div>
                            </div>
                            {idx === selectedFarmIndex && (
                              <CheckCircle className="ml-auto text-emerald-500" size={16} />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Area Tabs */}
                {selectedFarm?.areas && selectedFarm.areas.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2">เลือกพื้นที่ย่อย</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedFarm.areas.map((area, idx) => (
                        <button
                          key={area.area_id}
                          type="button"
                          onClick={() => {
                            setSelectedAreaIndex(idx);
                            setLiveData(null);
                          }}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            idx === selectedAreaIndex
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                          }`}
                        >
                          {area.area_name}
                          <span className={`ml-2 text-xs ${idx === selectedAreaIndex ? 'text-emerald-100' : 'text-slate-400'}`}>
                            ({area.device_code})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Area Content */}
                {selectedArea && (
                  <>
                    {/* Sensor Data Grid - New Design */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Water Level - Takes more space */}
                      <div className="lg:row-span-2">
                        <WaterLevelCard 
                          value={sensorData.water_level ?? sensorData.W} 
                          isLive={isSocketConnected && liveData !== null}
                          minLevel={5}
                          maxLevel={15}
                          tankHeight={30}
                        />
                      </div>
                      
                      {/* NPK & Humidity Cards */}
                      <SensorDisplayCard
                        label="ไนโตรเจน (N)"
                        value={sensorData.N ?? sensorData.n}
                        unit="mg/kg"
                        icon={Leaf}
                        gradientFrom="from-emerald-400"
                        gradientTo="to-teal-500"
                      />
                      <SensorDisplayCard
                        label="ฟอสฟอรัส (P)"
                        value={sensorData.P ?? sensorData.p}
                        unit="mg/kg"
                        icon={Flame}
                        gradientFrom="from-orange-400"
                        gradientTo="to-rose-500"
                      />
                      <SensorDisplayCard
                        label="โพแทสเซียม (K)"
                        value={sensorData.K ?? sensorData.k}
                        unit="mg/kg"
                        icon={Zap}
                        gradientFrom="from-amber-400"
                        gradientTo="to-yellow-500"
                      />
                      {/* soil moisture display removed */}
                    </div>

                    {/* Growth & Disease Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <Sprout size={16} className="text-emerald-500" />
                          ระยะการเจริญเติบโต
                        </h4>
                        <GrowthInfoCard growth={selectedArea.growth} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <Bug size={16} className="text-rose-500" />
                          สถานะโรค/แมลงศัตรูพืช
                        </h4>
                        <DiseaseInfoCard disease={selectedArea.disease} />
                      </div>
                    </div>

                    {/* Timelines */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TimelineCard
                        title="ไทม์ไลน์ระยะเจริญเติบโต"
                        icon={Sprout}
                        iconBg="bg-emerald-500"
                        borderColor="border-emerald-200"
                        bgColor="bg-emerald-50/30"
                        items={selectedArea.growth_timeline || []}
                        emptyText="ยังไม่มีข้อมูลไทม์ไลน์"
                      />
                      <TimelineCard
                        title="ไทม์ไลน์สถานะโรค"
                        icon={Bug}
                        iconBg="bg-rose-500"
                        borderColor="border-rose-200"
                        bgColor="bg-rose-50/30"
                        items={selectedArea.disease_timeline || []}
                        emptyText="ยังไม่มีข้อมูลไทม์ไลน์"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SensorCard2 = SensorDisplayCard;
export const AreaSensorCard = () => null;
