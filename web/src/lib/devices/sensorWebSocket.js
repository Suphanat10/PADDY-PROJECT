import { io } from "socket.io-client";

let socketInstance = null;
let lastDataTimers = {}; 

const DATA_TIMEOUT = 60000; 

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
      resetDeviceTimer(id, onStatusUpdate);
    });
  });

 socket.on("sensorData", (payload) => {
  try {
    const deviceId = payload.device_code;
    const rawData = payload.data;
    if (!deviceId || !rawData) return;

    console.log("📥 SENSOR:", payload);

    resetDeviceTimer(deviceId, onStatusUpdate);

    const data = {
      N: rawData.N,
      P: rawData.P,
      K: rawData.K,
      water_level: rawData.water_level,
    };

    const timestamp =
      payload.measured_at ||
      new Date().toISOString().substring(0, 19).replace("T", " ");

    onSensorUpdate?.(deviceId, data, timestamp);
    onStatusUpdate?.(deviceId, "online");

  } catch (err) {
    console.error("❌ Sensor parse error:", err);
    onError?.(err);
  }
});

  socket.on("deviceStatus", (payload) => {
    try {
      // Support both formats:
      // 1) { device_code, status, timestamp, reason }
      // 2) ["deviceStatus", { device_code, status, timestamp, reason }]
      const body = Array.isArray(payload)
        ? payload[1]
        : payload;

      const deviceId = body?.device_code;
      const status = body?.status;
      const timestamp = body?.timestamp || new Date().toISOString();
      const reason = body?.reason;

      if (!deviceId || !status) return;

      resetDeviceTimer(deviceId, onStatusUpdate);
      onStatusUpdate?.(deviceId, status, reason, timestamp);
    } catch (err) {
      console.error("❌ deviceStatus parse error:", err);
      onError?.(err);
    }
  });

  socket.onAny((eventName, payload) => {
    try {
      // Some backends may wrap as: ["deviceStatus", {...}] under generic events.
      const isWrappedStatusPacket =
        Array.isArray(payload) &&
        payload[0] === "deviceStatus" &&
        payload[1] &&
        typeof payload[1] === "object";

      if (!isWrappedStatusPacket) return;

      const body = payload[1];
      const deviceId = body?.device_code;
      const status = body?.status;
      const timestamp = body?.timestamp || new Date().toISOString();
      const reason = body?.reason;

      if (!deviceId || !status) return;

      resetDeviceTimer(deviceId, onStatusUpdate);
      onStatusUpdate?.(deviceId, status, reason, timestamp);
    } catch (err) {
      console.error("❌ onAny status parse error:", err, eventName);
      onError?.(err);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("⚠️ Socket.IO Disconnected:", reason);
    onDisconnected?.();
    Object.keys(lastDataTimers).forEach((id) => onStatusUpdate?.(id, "offline"));
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket.IO Connect Error:", err);
    onError?.(err);
  });

  return socket;
}

function resetDeviceTimer(deviceId, onStatusUpdate) {
  if (lastDataTimers[deviceId]) {
    clearTimeout(lastDataTimers[deviceId]);
  }

  lastDataTimers[deviceId] = setTimeout(() => {
    console.warn(`⏳ No data from ${deviceId} → Setting OFFLINE`);
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