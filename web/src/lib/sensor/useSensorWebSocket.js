// "use client";

// import { useEffect, useState, useRef } from "react";

// export function useSensorWebSocket(deviceId) {
//   const [isSocketConnected, setIsSocketConnected] = useState(false);
//   const [currentData, setCurrentData] = useState(null);

//   const socketRef = useRef(null);
//   const reconnectTimerRef = useRef(null);
//   const isPageActiveRef = useRef(true);

//   // ⭐ ฟังก์ชันส่งข้อมูลแบบปลอดภัย
//   const safeSend = (msg) => {
//     const socket = socketRef.current;

//     if (!socket) return;

//     // ถ้า WebSocket พร้อม → ส่งเลย
//     if (socket.readyState === WebSocket.OPEN) {
//       socket.send(msg);
//       return;
//     }

//     // ถ้ายัง CONNECTING → รอให้ open ก่อนถึงส่งได้
//     if (socket.readyState === WebSocket.CONNECTING) {
//       console.warn("WS still connecting… queue send");

//       const interval = setInterval(() => {
//         if (socket.readyState === WebSocket.OPEN) {
//           clearInterval(interval);
//           socket.send(msg);
//         }
//       }, 50);
//     }
//   };

//   useEffect(() => {
//     if (!deviceId) return;

//     isPageActiveRef.current = true;

//     const connectSocket = () => {
//       if (!isPageActiveRef.current) return;
//       socketRef.current = new WebSocket("wss://smart-paddy.space/ws");

//       socketRef.current.onopen = () => {
//         console.log("WS Connected");
//         setIsSocketConnected(true);

//         // ⭐ ใช้ safeSend แทน send โดยตรง
//         safeSend(
//           JSON.stringify({
//             action: "SUBSCRIBE",
//             deviceIds: [deviceId],
//           })
//         );
//       };

//       socketRef.current.onmessage = (event) => {
//         try {
//           const msg = JSON.parse(event.data);

//           if (msg.type === "SENSOR_UPDATE") {
//             setCurrentData({
//               nitrogen: { value: msg.npk.N, unit: "mg/kg" },
//               phosphorus: { value: msg.npk.P, unit: "mg/kg" },
//               potassium: { value: msg.npk.K, unit: "mg/kg" },
//               humidity: { value: msg.soil_moisture, unit: "%" },
//               waterLevel: { value: msg.water_level, unit: "ซม." },
//               temperature: { value: msg.temperature ?? 28, unit: "°C" },
//               battery: { value: msg.battery, unit: "%" },
//             });
//           }
//         } catch (err) {
//           console.error("WS parse error:", err);
//         }
//       };

//       socketRef.current.onclose = () => {
//         setIsSocketConnected(false);

//         if (!isPageActiveRef.current) return;

//         reconnectTimerRef.current = setTimeout(connectSocket, 2000);
//       };

//       socketRef.current.onerror = () => {
//         socketRef.current.close();
//       };
//     };

//     connectSocket();

//     return () => {
//       console.log("Page closed → WebSocket disconnected!");

//       isPageActiveRef.current = false;

//       if (socketRef.current) {
//         socketRef.current.close();
//       }

//       clearTimeout(reconnectTimerRef.current);
//     };
//   }, [deviceId]);

//   return { currentData, isSocketConnected };
// }


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
          humidity: { value: data.soil_moisture || 0, unit: "%" }, 
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