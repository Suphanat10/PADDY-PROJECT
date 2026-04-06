"use client";

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export function useDeviceWebSocket({ deviceIds, onStatus }) {
  const socketRef = useRef(null);

  useEffect(() => {
    // 1. ตรวจสอบว่ามี ID อุปกรณ์ส่งมาหรือไม่
    if (!deviceIds || deviceIds.length === 0) return;


    const socket = io("https://smart-paddy.space", {
      transports: ["websocket"],
      withCredentials: true,
      reconnectionAttempts: 5, 
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket.IO Connected → Join Status Rooms");

      deviceIds.forEach((id) => {
        socket.emit("join-device", id);
      });
    });

    socket.on("deviceStatus", (msg) => {
      if (msg && msg.device_code) {
        // ✅ ส่ง device_code, status, reason, และ timestamp ไปที่ callback
        onStatus?.(msg.device_code, msg.status, msg.reason, msg.timestamp);
      }
    });

    socket.on("connect_error", (err) => {
      console.error("Socket.IO Connection Error:", err);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket.IO Disconnected:", reason);
    });

    return () => {
      console.log("Cleaning up Socket.IO Connection...");
      if (socket) {
        socket.off("connect");
        socket.off("deviceStatus");
        socket.off("disconnect");
        socket.off("connect_error");
        socket.disconnect();
      }
    };
  }, [deviceIds]); 
}