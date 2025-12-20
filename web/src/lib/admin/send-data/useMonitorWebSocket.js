"use client";
import { useEffect, useRef, useState } from "react";

export function useMonitorWebSocket(deviceCodes = [], onMessage) {
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const isMountedRef = useRef(false);

  // ---------- safe send ----------
  const safeSend = (payload) => {
    const socket = socketRef.current;
    if (!socket) return;

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(payload);
      return;
    }

    if (socket.readyState === WebSocket.CONNECTING) {
      const interval = setInterval(() => {
        if (!socketRef.current) {
          clearInterval(interval);
          return;
        }

        if (socketRef.current.readyState === WebSocket.OPEN) {
          clearInterval(interval);
          socketRef.current.send(payload);
        }
      }, 50);
    }
  };

  useEffect(() => {
    if (!Array.isArray(deviceCodes) || deviceCodes.length === 0) return;

    isMountedRef.current = true;

    const connect = () => {
      if (!isMountedRef.current) return;

const ws = new WebSocket("wss://smart-paddy.space");
      socketRef.current = ws;

      ws.onopen = () => {
        if (!isMountedRef.current) return;

        setIsSocketConnected(true);

        safeSend(
          JSON.stringify({
            action: "SUBSCRIBE",
            deviceIds: deviceCodes,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          // 🔥 ส่ง message เต็ม ๆ ให้คนเรียกใช้
          onMessage?.(msg);
        } catch (err) {
          console.error("WS parse error:", err);
        }
      };

      ws.onclose = () => {
        setIsSocketConnected(false);

        if (isMountedRef.current) {
          reconnectTimerRef.current = setTimeout(connect, 2000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    // ---------- CLEANUP (สำคัญมาก) ----------
    return () => {
      isMountedRef.current = false;

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }

      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.onerror = null;
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [JSON.stringify([...deviceCodes].sort())]); // กัน rerender แปลก ๆ

  return { isSocketConnected };
}
