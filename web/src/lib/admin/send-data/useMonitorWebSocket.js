"use client";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:8000"; 

export function useMonitorWebSocket(deviceCodes = [], onMessage) {
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const socketRef = useRef(null);

  // แปลง Array เป็น String เพื่อใช้ใน Dependency Array ของ useEffect (ป้องกัน Loop)
  const devicesKey = JSON.stringify([...deviceCodes].sort());

  useEffect(() => {
    if (!Array.isArray(deviceCodes) || deviceCodes.length === 0) return;


    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      reconnectionAttempts: 5,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("🟢 Monitor Socket Connected:", socket.id);
      setIsSocketConnected(true);

      // 2. Join Room สำหรับทุกอุปกรณ์ที่ส่งมาใน Array
      deviceCodes.forEach((code) => {
        socket.emit("join-device", code);
      });
    });

    socket.on("sensorData", (payload) => {
      onMessage?.({
        type: "SENSOR_UPDATE",
        deviceId: payload.device_code,
        data: payload.data,
        measured_at: payload.measured_at
      });
    });


    socket.on("deviceStatus", (payload) => {
      onMessage?.({
        type: "DEVICE_STATUS",
        deviceId: payload.device_code,
        status: payload.status
      });
    });

    socket.on("disconnect", (reason) => {
      console.warn("🔴 Monitor Socket Disconnected:", reason);
      setIsSocketConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Monitor Socket Error:", err.message);
      setIsSocketConnected(false);
    });

    // ---------- CLEANUP ----------
    return () => {
      console.log("Cleanup Monitor Socket");
      if (socket) {
        socket.off("connect");
        socket.off("sensorData");
        socket.off("deviceStatus");
        socket.off("disconnect");
        socket.off("connect_error");
        socket.disconnect();
      }
    };
  }, [devicesKey]); 
  return { isSocketConnected };
}