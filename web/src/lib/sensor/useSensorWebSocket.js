"use client";

import { useEffect, useState, useRef } from "react";

export function useSensorWebSocket(deviceId) {
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [currentData, setCurrentData] = useState(null);

  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const isPageActiveRef = useRef(true);

  // ⭐ ฟังก์ชันส่งข้อมูลแบบปลอดภัย
  const safeSend = (msg) => {
    const socket = socketRef.current;

    if (!socket) return;

    // ถ้า WebSocket พร้อม → ส่งเลย
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(msg);
      return;
    }

    // ถ้ายัง CONNECTING → รอให้ open ก่อนถึงส่งได้
    if (socket.readyState === WebSocket.CONNECTING) {
      console.warn("WS still connecting… queue send");

      const interval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          clearInterval(interval);
          socket.send(msg);
        }
      }, 50);
    }
  };

  useEffect(() => {
    if (!deviceId) return;

    isPageActiveRef.current = true;

    const connectSocket = () => {
      if (!isPageActiveRef.current) return;
      socketRef.current = new WebSocket("wss://smart-paddy.space/ws");

      socketRef.current.onopen = () => {
        console.log("WS Connected");
        setIsSocketConnected(true);

        // ⭐ ใช้ safeSend แทน send โดยตรง
        safeSend(
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

        reconnectTimerRef.current = setTimeout(connectSocket, 2000);
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
