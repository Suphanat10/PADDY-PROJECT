"use client";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// URL ของ Backend
const SOCKET_URL = "https://smart-paddy.space"; 

export function useSensorWebSocket(deviceId) {
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [currentData, setCurrentData] = useState(null);

  const socketRef = useRef(null);
  const lastValueRef = useRef({});

  // ฟังก์ชันคำนวณแนวโน้ม (เหมือนเดิม)
  const calcTrend = (prev, next) => {
    if (prev === undefined || prev === null) return "stable";
    if (next > prev) return "up";
    if (next < prev) return "down";
    return "stable";
  };

  useEffect(() => {
    if (!deviceId) return;

    // 1. สร้างการเชื่อมต่อ Socket.IO
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("🟢 Socket.IO Connected");
      setIsSocketConnected(true);
      
      // 2. Join Room แทนการส่ง SUBSCRIBE JSON
      socket.emit("join-device", deviceId);
    });

    // 3. รอรับข้อมูลเซนเซอร์ (Event: sensorData)
    socket.on("sensorData", (payload) => {
      // payload โครงสร้าง: { device_code, data: { N, P, K, water_level, soil_moisture } }
      if (!payload || payload.device_code !== deviceId) return;

      const msgData = payload.data;

      setCurrentData((prev) => {
        const next = {
          nitrogen: {
            value: msgData.N ?? prev?.nitrogen?.value ?? "-",
            unit: "mg/kg",
            trend: calcTrend(lastValueRef.current.N, msgData.N),
          },
          phosphorus: {
            value: msgData.P ?? prev?.phosphorus?.value ?? "-",
            unit: "mg/kg",
            trend: calcTrend(lastValueRef.current.P, msgData.P),
          },
          potassium: {
            value: msgData.K ?? prev?.potassium?.value ?? "-",
            unit: "mg/kg",
            trend: calcTrend(lastValueRef.current.K, msgData.K),
          },
          humidity: {
            value: msgData.soil_moisture ?? prev?.humidity?.value ?? "-",
            unit: "%",
            trend: calcTrend(lastValueRef.current.humidity, msgData.soil_moisture),
          },
          waterLevel: {
            value: msgData.water_level ?? prev?.waterLevel?.value ?? "-",
            unit: "cm",
            trend: calcTrend(lastValueRef.current.waterLevel, msgData.water_level),
          },
          timestamp: payload.measured_at // เวลาที่ Backend ส่งมา
        };

        // เก็บค่าล่าสุดไว้ใช้คำนวณ Trend ในรอบถัดไป
        lastValueRef.current = {
          N: msgData.N,
          P: msgData.P,
          K: msgData.K,
          humidity: msgData.soil_moisture,
          waterLevel: msgData.water_level,
        };

        return next;
      });
    });

    socket.on("disconnect", () => {
      console.warn("🔴 Socket.IO Disconnected");
      setIsSocketConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket Error:", err.message);
      setIsSocketConnected(false);
    });

    // 4. Cleanup เมื่อ Component Unmount
    return () => {
      console.log("Cleanup Socket.IO");
      socket.off("connect");
      socket.off("sensorData");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, [deviceId]);

  return {
    currentData,
    isSocketConnected,
  };
}