import { io } from "socket.io-client";
import Swal from "sweetalert2";

let socketInstance = null;
let lastDataTimers = {}; // ⭐ timer ต่อ device

const DATA_TIMEOUT = 15000; // 15 วินาที

export function createSensorWebSocket({
  url,
  deviceIds,
  onConnected,
  onDisconnected,
  onSensorUpdate,
  onStatusUpdate,
  onError,
}) {
  if (socketInstance && socketInstance.connected) {
    console.log("Socket.IO already connected.");
    return socketInstance;
  }

  const socket = io(url, {
    transports: ["websocket"],
    withCredentials: true,
  });

  socketInstance = socket;

  socket.on("connect", () => {
    console.log("Socket.IO Connected:", socket.id);
    onConnected?.();

    const ids = Array.isArray(deviceIds) ? deviceIds : [deviceIds];
    ids.forEach((id) => {
      socket.emit("join-device", id);

      // ⭐ ตั้ง timeout รอข้อมูล
      resetDeviceTimer(id, onStatusUpdate);
    });
  });

  socket.on("sensorData", (payload) => {
    try {
      const deviceId = payload.device_code;
      const rawData = payload.data;

      if (!deviceId || !rawData) return;

      // ⭐ reset timer เมื่อมีข้อมูล
      resetDeviceTimer(deviceId, onStatusUpdate);

      const data = {
        N: rawData.N,
        P: rawData.P,
        K: rawData.K,
        water_level: rawData.water_level,
        soil_moisture: rawData.soil_moisture,
      };

      const rawDate = payload.measured_at || new Date().toISOString();
      const timestamp = rawDate.substring(0, 19).replace("T", " ");

      onSensorUpdate?.(deviceId, data, timestamp);
      onStatusUpdate?.(deviceId, "online");

    } catch (err) {
      console.error("Sensor parse error:", err);
      onError?.(err);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket.IO Disconnected:", reason);
    onDisconnected?.();

    Object.keys(lastDataTimers).forEach((id) => {
      onStatusUpdate?.(id, "offline");
    });

    if (reason === "io server disconnect") {
      socket.connect();
    }
  });

  socket.on("connect_error", (err) => {
    console.error("Socket.IO Error:", err);
    onError?.(err);
  });

  return socket;
}

/* =========================
   ⏱️ TIMER HANDLER
========================= */
function resetDeviceTimer(deviceId, onStatusUpdate) {
  if (lastDataTimers[deviceId]) {
    clearTimeout(lastDataTimers[deviceId]);
  }

  lastDataTimers[deviceId] = setTimeout(() => {
    console.warn(`No data from ${deviceId} → OFFLINE`);
    onStatusUpdate?.(deviceId, "offline");
  }, DATA_TIMEOUT);
}

export function closeSensorWebSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  Object.values(lastDataTimers).forEach(clearTimeout);
  lastDataTimers = {};
}
