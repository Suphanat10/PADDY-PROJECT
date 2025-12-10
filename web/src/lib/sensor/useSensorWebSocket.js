"use client";

import { useEffect, useState, useRef } from "react";

export function useSensorWebSocket(deviceId) {
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [currentData, setCurrentData] = useState(null);

  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const isPageActiveRef = useRef(true);  // ⬅️ ตัวบอกว่าหน้านี้ยังเปิดอยู่ไหม

  useEffect(() => {
    if (!deviceId) return;

    isPageActiveRef.current = true; // หน้านี้เปิดแล้ว

    const connectSocket = () => {
      if (!isPageActiveRef.current) return; // ถ้าหน้าถูกปิด → หยุดทันที

      socketRef.current = new WebSocket("ws://localhost:8000");

      socketRef.current.onopen = () => {
        setIsSocketConnected(true);

        socketRef.current.send(
          JSON.stringify({
            action: "SUBSCRIBE",
            deviceIds: [deviceId],
          })
        );
      };

      socketRef.current.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === "SENSOR_UPDATE") {
            setCurrentData({
              nitrogen: { value: msg.npk.N, unit: "mg/kg" },
              phosphorus: { value: msg.npk.P, unit: "mg/kg" },
              potassium: { value: msg.npk.K, unit: "mg/kg" },
              humidity: { value: msg.soil_moisture, unit: "%" },
              waterLevel: { value: msg.water_level, unit: "ซม." },
              temperature: { value: msg.temperature ?? 28, unit: "°C" },
              battery: { value: msg.battery, unit: "%" },
            });
          }
        } catch (err) {
          console.error("WS parse error:", err);
        }
      };

      socketRef.current.onclose = () => {
        setIsSocketConnected(false);

        if (!isPageActiveRef.current) return;

        reconnectTimerRef.current = setTimeout(() => {
          connectSocket();
        }, 2000);
      };

      socketRef.current.onerror = () => {
        socketRef.current.close();
      };
    };

    connectSocket();

    return () => {
      console.log("Page closed → WebSocket disconnected!");

      isPageActiveRef.current = false;   

      if (socketRef.current) {
        socketRef.current.close();
      }

      clearTimeout(reconnectTimerRef.current); 
    };
  }, [deviceId]);

  return { currentData, isSocketConnected };
}
