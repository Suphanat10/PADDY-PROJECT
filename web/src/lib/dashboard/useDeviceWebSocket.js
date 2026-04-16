"use client";

import { useEffect, useMemo, useRef } from "react";
import { io } from "socket.io-client";

export function useDeviceWebSocket({ deviceIds, onStatus }) {
  const socketRef = useRef(null);
  const onStatusRef = useRef(onStatus);

  useEffect(() => {
    onStatusRef.current = onStatus;
  }, [onStatus]);

  const idsKey = useMemo(() => {
    if (!Array.isArray(deviceIds)) return "";
    return deviceIds
      .map((id) => String(id || "").trim().toUpperCase())
      .filter(Boolean)
      .sort()
      .join("|");
  }, [deviceIds]);

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
      const body = Array.isArray(msg) ? msg[1] : msg;
      if (body && body.device_code) {
        // Support both object and wrapped array payload formats.
        onStatusRef.current?.(body.device_code, body.status, body.reason, body.timestamp);
      }
    });

    socket.onAny((eventName, payload) => {
      if (!Array.isArray(payload)) return;
      if (payload[0] !== "deviceStatus") return;
      const body = payload[1];
      if (body && body.device_code) {
        onStatusRef.current?.(body.device_code, body.status, body.reason, body.timestamp);
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
        socket.offAny();
        socket.off("disconnect");
        socket.off("connect_error");
        socket.disconnect();
      }
    };
  }, [idsKey]); 
}