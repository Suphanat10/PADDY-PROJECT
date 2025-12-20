"use client";
import { useEffect, useRef, useState } from "react";

export function useSensorWebSocket(deviceId  ) {
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [currentData, setCurrentData] = useState(null);

  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const isPageActiveRef = useRef(true);

  const lastValueRef = useRef({});


  const calcTrend = (prev, next) => {
    if (prev === undefined || prev === null) return "stable";
    if (next > prev) return "up";
    if (next < prev) return "down";
    return "stable";
  };


  const safeSend = (msg) => {
    const socket = socketRef.current;
    if (!socket) return;

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(msg);
      return;
    }

    if (socket.readyState === WebSocket.CONNECTING) {
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
        console.log("🟢 WS Connected");
        setIsSocketConnected(true);

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
          if (msg.type !== "SENSOR_UPDATE") return;

          setCurrentData((prev) => {
            const next = {
              nitrogen: {
                value: msg.npk?.N ?? prev?.nitrogen?.value ?? "-",
                unit: "mg/kg",
                trend: calcTrend(lastValueRef.current.N, msg.npk?.N),
              },
              phosphorus: {
                value: msg.npk?.P ?? prev?.phosphorus?.value ?? "-",
                unit: "mg/kg",
                trend: calcTrend(lastValueRef.current.P, msg.npk?.P),
              },
              potassium: {
                value: msg.npk?.K ?? prev?.potassium?.value ?? "-",
                unit: "mg/kg",
                trend: calcTrend(lastValueRef.current.K, msg.npk?.K),
              },
              humidity: {
                value: msg.soil_moisture ?? prev?.humidity?.value ?? "-",
                unit: "%",
                trend: calcTrend(
                  lastValueRef.current.humidity,
                  msg.soil_moisture
                ),
              },
              waterLevel: {
                value: msg.water_level ?? prev?.waterLevel?.value ?? "-",
                unit: "cm",
                trend: calcTrend(
                  lastValueRef.current.waterLevel,
                  msg.water_level
                ),
              },
             
            };

            lastValueRef.current = {
              N: msg.npk?.N,
              P: msg.npk?.P,
              K: msg.npk?.K,
              humidity: msg.soil_moisture,
              waterLevel: msg.water_level,
              temperature: msg.temperature,
            };
             

            return next;
          });
        } catch (err) {
          console.error("WS parse error:", err);
        }
      };

      socketRef.current.onclose = () => {
        console.warn("WS Disconnected");
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
      console.log("Page unmount → close WebSocket");

      isPageActiveRef.current = false;

      socketRef.current?.close();
      clearTimeout(reconnectTimerRef.current);
    };
  }, [deviceId]);

  return {
    currentData,
    isSocketConnected,
  };
}
