import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

export default async function waterPlots(
  setDevices,
  setSettings,
  setSelectedDeviceId
) {
  try {
    const result = await apiFetch("/api/setting/data", {
      method: "GET",
    });

    if (!result?.data) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาดในการดึงข้อมูลแปลงน้ำ",
        text: result.message || "กรุณาลองใหม่อีกครั้งภายหลัง",
      });
      return;
    }

    const devicesList = Array.isArray(result.data) 
      ? result.data 
      : (result.data.devices || []);


    setDevices(devicesList);

    // ตั้งค่า device ตัวแรกเป็นค่าเริ่มต้น (ถ้ามีข้อมูล)
    if (devicesList.length > 0) {
      const firstDevice = devicesList[0];
      
      // ตั้งค่า ID ของอุปกรณ์ที่เลือก
      setSelectedDeviceId(firstDevice.device_registrations_ID.toString());
      
      // ตั้งค่า Settings เริ่มต้นจากอุปกรณ์ตัวแรก
      if (firstDevice.setting) {
        setSettings({
          minLevel: firstDevice.setting.Water_level_min,
          maxLevel: firstDevice.setting.Water_level_mxm,
          // แปลงเป็น int เพื่อความชัวร์
          dataSendInterval: parseInt(firstDevice.setting.data_send_interval_days) || 1, 
          notifyLine: true,
          notifyApp: true,
        });
      }
    }
  } catch (err) {
    console.error("Failed to fetch water plots:", err);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
      text: err.message || "กรุณาลองใหม่อีกครั้งภายหลัง",
    });

  }
}
