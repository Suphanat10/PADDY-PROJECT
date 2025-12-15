
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Thermometer,
  Droplets,
  Leaf,
  CheckCircle,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  Bell,
  BarChart3,
  PieChart,
  LineChart,
  Wifi,
  WifiOff,
  User,
  Sprout,
  Activity,
  History,
  Cpu,
  FileX,
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import Header from "../../components/Header";
import { apiFetch } from "@/lib/api";
import Footer from "@/app/components/Footer";
import { useSensorWebSocket } from "@/lib/sensor/useSensorWebSocket";
import { useSensorHistory } from "@/lib/sensor/useSensorHistory";



export default function SensorDetailPage() {

const { id } = useParams();
  const { historicalData, isLoading } = useSensorHistory(id);
  const { currentData, isSocketConnected ,  } = useSensorWebSocket(id);
  const [sensorInfo, setSensorInfo] = useState(null);

  

  
  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case "stable":
        return <Minus className="w-4 h-4 text-gray-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };


  const WaterLevelCard = ({ data, color, bgColor }) => {
    if (!data) return null;


    const maxLevel = 30;
    const waterHeight = Math.min((data.value / maxLevel) * 100, 100);


    return (
      <div>
        <div className="p-4">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-32 border-2 border-gray-400 rounded-b-lg bg-white relative overflow-hidden">
                <div className="absolute top-0 w-full h-8 bg-gray-100 border-b border-gray-300"></div>
                <div className="absolute top-8 w-full h-16 bg-gray-100 border-b border-gray-300"></div>
                <div className="absolute top-24 w-full h-8 bg-gray-100"></div>
                <div
                  className="absolute bottom-0 w-full bg-gradient-to-t from-blue-400 to-blue-300 transition-all duration-700 ease-in-out"
                  style={{ height: `${waterHeight}%` }}
                >
                  <div className="absolute top-0 w-full h-1 bg-blue-200 opacity-60 animate-pulse"></div>
                </div>

                <div
                  className="absolute left-0 right-0 h-0.5 bg-red-500 z-20 transition-all duration-700 ease-in-out"
                  style={{ bottom: `${waterHeight}%` }}
                ></div>
              </div>

              <div
                className="absolute left-20 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-30 transition-all duration-700 ease-in-out shadow-sm"
                style={{
                  bottom: `${waterHeight}%`,
                  transform: "translateY(50%)",
                }}
              >
               {data.value} ซม.
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className={`text-2xl font-bold ${color} mb-1`}>
              ระดับน้ำ  {data.value} {data.unit}
            </div>
          
            
          </div>
        </div>
      </div>
    );
  };

  const MetricCard = ({ title, icon: Icon, data, color, bgColor }) => {
    if (!data)
      return <div className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>;

    return (
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
            <div
              className={`text-3xl font-bold ${color} mb-1 flex items-end justify-center gap-1`}
            >
              {data.value}
              <span className="text-lg text-gray-500 mb-1">{data.unit}</span>
            </div>
           
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 animate-pulse">กำลังโหลดข้อมูลอุปกรณ์...</p>
      </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-12">
      <Header />

      <div className="container mx-auto px-4 py-6 mt-4 space-y-8">
     

        {/* =================================================================================
            SECTION 1: REAL-TIME DATA (WebSocket)
           ================================================================================= */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Activity className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                การติดตามผลแบบเรียลไทม์ (Live Monitoring)
              </h2>
              <p className="text-sm text-gray-500">
                ข้อมูลล่าสุดที่ได้รับจากเซ็นเซอร์ผ่าน WebSocket
              </p>
            </div>
          </div>

          {/* ===== Skeleton Loading ระหว่างรอ WebSocket ===== */}
          {currentData === null && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-pulse">
              {/* Skeleton WaterLevel */}
              <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>

              {/* Skeleton Metric Cards */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                  >
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="h-10 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== แสดงผลจริงเมื่อได้ข้อมูล ===== */}
          {currentData && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Water Level Monitor */}
              <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <PieChart className="w-5 h-5 mr-2 text-purple-600" />
                    ระดับน้ำ (Live)
                  </h3>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-red-500">
                      LIVE
                    </span>
                  </div>
                </div>
                <div className="h-64">
                  <WaterLevelCard
                    data={currentData.waterLevel}
                    color="text-cyan-600"
                    bgColor="bg-cyan-50"
                  />
                </div>
              </div>

              {/* Sensor Cards Grid */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                {/* <MetricCard
                  title="เเบตเตอรี่"
                  icon={Cpu}
                  data={currentData.battery}
                  color="text-cyan-600"
                  bgColor="bg-cyan-50"
                /> */}
              </div>
            </div>
          )}
        </section>
        {/* =================================================================================
            SECTION 2: HISTORICAL DATA (API)
           ================================================================================= */}
        <section className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <History className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                ข้อมูลย้อนหลัง (Historical Analysis)
              </h2>
              <p className="text-sm text-gray-500">
                กราฟแสดงแนวโน้มข้อมูล 24 ชั่วโมงย้อนหลัง (จาก API)
              </p>
            </div>
          </div>

          {/* ถ้ามีข้อมูลย้อนหลัง ให้แสดงกราฟ ถ้าไม่มีให้แสดงข้อความแจ้งเตือน */}
          {historicalData && historicalData.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 xl:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <PieChart className="w-5 h-5 mr-2 text-emerald-600" />
                    กราฟรวม NPK + ความชื้น + ระดับน้ำ (Stacked Area)
                  </h3>
                </div>

                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="time" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Legend />

                      <Area
                        type="monotone"
                        dataKey="nitrogen"
                        stackId="1"
                        stroke="#666600"
                        fill="#666600"
                        fillOpacity={0.6}
                        name="ไนโตรเจน (N)"
                      />

                      {/* P (ส้ม) */}
                      <Area
                        type="monotone"
                        dataKey="phosphorus"
                        stackId="1"
                        stroke="#F59E0B"
                        fill="#F59E0B"
                        fillOpacity={0.6}
                        name="ฟอสฟอรัส (P)"
                      />

                      {/* K (ม่วง) */}
                      <Area
                        type="monotone"
                        dataKey="potassium"
                        stackId="1"
                        stroke="#666699"
                        fill="#666699"
                        fillOpacity={0.6}
                        name="โพแทสเซียม (K)"
                      />

                      {/* ความชื้น (ฟ้า) */}
                      <Area
                        type="monotone"
                        dataKey="humidity"
                        stackId="1"
                        stroke="#6666CC"
                        fill="#6666CC"
                        fillOpacity={0.6}
                        name="ความชื้น (%)"
                      />

                      {/* ระดับน้ำ (น้ำเงินอมเขียว) */}
                      <Area
                        type="monotone"
                        dataKey="waterLevel"
                        stackId="1"
                        stroke="#6666FF"
                        fill="#6666FF"
                        fillOpacity={0.6}
                        name="ระดับน้ำ (cm)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-cyan-600" />
                    สภาพแวดล้อม (ระดับน้ำ )
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
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="waterLevel"
                        stackId="1"
                        stroke="#06B6D4"
                        fill="#06B6D4"
                        fillOpacity={0.6}
                        name="ระดับน้ำ (%)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Droplets className="w-5 h-5 mr-2 text-blue-600" />
                    ความชื้นดิน (Humidity)
                  </h3>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                      <XAxis dataKey="time" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="humidity"
                        stroke="#0ea5e9"
                        strokeWidth={2}
                        name="ความชื้น (%)"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 xl:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <LineChart className="w-5 h-5 mr-2 text-blue-600" />
                    แนวโน้มค่า NPK
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
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="nitrogen"
                        stroke="#10B981"
                        strokeWidth={2}
                        name="N"
                      />
                      <Line
                        type="monotone"
                        dataKey="phosphorus"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        name="P"
                      />
                      <Line
                        type="monotone"
                        dataKey="potassium"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        name="K"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500">
              <FileX className="w-12 h-12 mb-3 text-gray-300" />
              <p className="font-medium">
                ไม่พบข้อมูลย้อนหลัง (No Historical Data)
              </p>
              <p className="text-sm mt-1 text-gray-400">
                ยังไม่มีการบันทึกข้อมูลสำหรับช่วงเวลานี้
              </p>
            </div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
}
