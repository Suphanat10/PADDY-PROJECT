let wsInstance = null; // ⭐ ป้องกัน WebSocket ถูกสร้างซ้ำ

export function createSensorWebSocket({
  url,
  deviceIds,
  onConnected,
  onDisconnected,
  onSensorUpdate,
  onError,
}) {
  // ถ้ามี WebSocket อยู่แล้ว → ไม่สร้างใหม่
  if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
    console.log("WS already connected. Reuse instance.");
    return wsInstance;
  }

  console.log("Connecting WebSocket →", url);

  const ws = new WebSocket(url);
  wsInstance = ws;

  ws.onopen = () => {
    console.log("WebSocket Connected");

    onConnected?.();

    ws.send(
      JSON.stringify({
        action: "SUBSCRIBE",
        device_ids: deviceIds,
      })
    );
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      const deviceId = msg.deviceId || msg.device_id;

      if (msg.type !== "SENSOR_UPDATE" || !deviceId) return;

      const data = {
        N: msg.npk?.N ?? msg.data?.N,
        P: msg.npk?.P ?? msg.data?.P,
        K: msg.npk?.K ?? msg.data?.K,
        water_level: msg.water_level ?? msg.data?.water_level,
        soil_moisture: msg.soil_moisture ?? msg.data?.soil_moisture,
        battery: msg.battery ?? msg.data?.battery ?? 0,
      };

      const timestamp = new Date().toLocaleString("th-TH", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      onSensorUpdate?.(deviceId, data, timestamp);
    } catch (err) {
      console.error("WS Parse Error:", err);
      onError?.(err);
    }
  };

  ws.onclose = () => {
    console.log("WebSocket Closed");
    onDisconnected?.();
    wsInstance = null;       // ⭐ ป้องกัน zombie connection
  };

  ws.onerror = (err) => {
    console.error("WebSocket Error:", err);
    onError?.(err);
  };

  return ws;
}

/**
 * ปิด WebSocket (เมื่อออกจากหน้า)
 */
export function closeSensorWebSocket() {
  if (wsInstance) {
    console.log("Closing WebSocket...");
    wsInstance.close();
    wsInstance = null;
  }
}
