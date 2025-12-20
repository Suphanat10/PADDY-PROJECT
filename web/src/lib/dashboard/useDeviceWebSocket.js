"use client";
import { useEffect, useRef } from "react";

export function useDeviceWebSocket({ deviceIds, onStatus }) {
  const wsRef = useRef(null);
  const isPageActive = useRef(false); // เช็คว่าหน้านี้ยังเปิดอยู่ไหม

  useEffect(() => {
    if (!deviceIds || deviceIds.length === 0) return;

    isPageActive.current = true;

    const connect = () => {
      if (!isPageActive.current) return; // ถ้าหน้าถูกปิด → ไม่ต้องเชื่อมต่อใหม่

     const ws = new WebSocket("wss://smart-paddy.space");
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WS Connected → SUBSCRIBE ONLY STATUS");

        ws.send(
          JSON.stringify({
            action: "SUBSCRIBE_STATUS", 
            deviceIds: deviceIds,
          })
        );
      };

      ws.onmessage = (event) => {
        if (!isPageActive.current) return;

        try {
          const msg = JSON.parse(event.data);

          if (msg.type === "DEVICE_STATUS") {
            onStatus?.(msg.deviceId, msg.status); 
          }
        } catch (err) {
          console.error("WS Parse Error:", err);
        }
      };

      ws.onerror = () => console.log("WS Error");

      ws.onclose = () => {
        console.log("WS Closed");

        if (!isPageActive.current) return;

        // Reconnect หลัง 1.2 วินาที
        setTimeout(() => connect(), 1200);
      };
    };

    connect();

    return () => {
      console.log("Page closed → stop WebSocket");

      isPageActive.current = false;

      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [deviceIds]);
}
