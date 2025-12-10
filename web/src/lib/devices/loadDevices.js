import { apiFetch } from "@/lib/api";

/**
 * โหลดรายการอุปกรณ์ทั้งหมดจาก API
 * แปลงให้อยู่ในโครงสร้างที่หน้า UI ใช้งานได้ทันที
 */
export async function loadDevicesService() {
  try {
    const res = await apiFetch("/api/data/devices");

    let list = [];
    if (res && Array.isArray(res.data)) {
      list = res.data;
    } else if (Array.isArray(res)) {
      list = res;
    }

    return list.map((d) => ({
      device_code: d.id,
      farm: d.farm?.name || "-",
      area: d.farm?.location || "-",
      description: d.description || "ไม่มีรายละเอียด",
      status: "disconnected",
      battery: 0,
      lastUpdate: "-",
      sensor: {},
    }));
  } catch (error) {
    console.error("❌ loadDevicesService error:", error);
    throw error;
  }
}
