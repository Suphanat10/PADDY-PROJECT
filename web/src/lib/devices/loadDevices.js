import { apiFetch } from "@/lib/api";

/**
 * โหลดรายการอุปกรณ์ทั้งหมดจาก API
 * แปลงให้อยู่ในโครงสร้างที่หน้า UI ใช้งานได้ทันที
 */
export async function loadDevicesService() {
  try {
    const res = await apiFetch("/api/data/devices");

    const payload = res?.data ?? res;

    let rawDevices = [];
    let rawPumps = [];

    if (Array.isArray(payload)) {
      // Backward compatible: old API returned devices array directly.
      rawDevices = payload;
    } else if (payload && typeof payload === "object") {
      rawDevices = Array.isArray(payload.devices) ? payload.devices : [];
      rawPumps = Array.isArray(payload.pumps) ? payload.pumps : [];
    }

    const normalizedDevices = rawDevices.map((d) => ({
      device_code: d.device_code || d.id || "-",
      farm: {
        // New API can return farm/area as strings.
        name: typeof d.farm === "string" ? d.farm : d.farm?.name || "-",
        location: typeof d.area === "string" ? d.area : d.farm?.location || "-",
        address: d.farm?.address || "-",
      },
      description: d.description || "ไม่มีรายละเอียด",
      status:
        d.status === "online" || d.status === "connected"
          ? "connected"
          : "disconnected",
      battery: 0,
      lastUpdate: "-",
      sensor: {},
      pumps: Array.isArray(d.pumps)
        ? d.pumps.map((p) => ({
            pump_id: p.id || p.pump_id,
            name: p.name || "-",
            mac: p.mac || "-",
            status: p.status || "OFF",
            created_at: p.created_at || null,
          }))
        : [],
    }));

    const normalizedPumps = rawPumps.map((p) => ({
      pump_id: p.id || p.pump_id,
      name: p.name || "-",
      mac: p.mac || "-",
      status: p.status || "OFF",
      created_at: p.created_at || null,
      device_code: p.device_code || p.device_id || null,
    }));

    return {
      devices: normalizedDevices,
      pumps: normalizedPumps,
    };
  } catch (error) {
    console.error("❌ loadDevicesService error:", error);
    throw error;
  }
}
