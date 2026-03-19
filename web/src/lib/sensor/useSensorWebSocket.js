"use client";

import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

  const  SOCKET_URL =  "https://smart-paddy.space"


export function useSensorWebSocket(deviceId) {
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  
  const socketRef = useRef(null);

  useEffect(() => {
    if (!deviceId) return;


    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"], // บังคับใช้ WebSocket เพื่อ performance ที่ดี
      withCredentials: true,     // จำเป็นถ้ามีการจัดการ CORS แบบเข้มงวด
      reconnectionAttempts: 5,   // พยายามต่อใหม่ 5 ครั้งถ้าหลุด
    });

    const socket = socketRef.current;

    // 2. เมื่อเชื่อมต่อสำเร็จ
    socket.on("connect", () => {
      console.log("socket.IO Connected:", socket.id);
      setIsSocketConnected(true);

      socket.emit("join-device", deviceId);
    });

    socket.on("disconnect", () => {
      console.log("Socket.IO Disconnected");
      setIsSocketConnected(false);
    });

    socket.on("sensorData", (payload) => {      
      console.log("Sensor Update:", payload);

      if (payload && payload.data) {
        const data = payload.data;
        
        setCurrentData({
          nitrogen: { value: data.N || 0, unit: "mg/kg" },
          phosphorus: { value: data.P || 0, unit: "mg/kg" },
          potassium: { value: data.K || 0, unit: "mg/kg" },
          waterLevel: { value: data.water_level || 0, unit: "ซม." },
          
        });
      }
    });

    return () => {
      console.log("Disconnecting Socket...");
      if (socket) {
        socket.off("connect"); 
        socket.off("disconnect");
        socket.off("sensorData");
        socket.disconnect();       
      }
    };
  }, [deviceId]); 

  return { currentData, isSocketConnected };
}