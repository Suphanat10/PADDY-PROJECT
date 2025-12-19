import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

export default async function waterPlots(
  setDevices,
  setSettings,
  setSelectedDeviceId,
  setLoading
) {
  try {
    // 1. เริ่มต้น Loading
    setLoading(true);

    const result = await apiFetch("/api/setting/data", {
      method: "GET",
    });

    // 2. ตรวจสอบสถานะการตอบกลับของ API (Status Not OK)
    if (!result.ok) {
      console.error("Water Plots API error:", result);
      setDevices([]);
      setSelectedDeviceId(null);
      // ไม่ต้องโยน Error เพื่อให้แสดง UI เปล่าๆ ได้
      return;
    }

    // 3. ตรวจสอบว่ามีข้อมูล data หรือไม่
    if (!result?.data) {
      throw new Error("ไม่พบข้อมูลอุปกรณ์ในระบบ");
    }

    // 4. จัดการโครงสร้างข้อมูลให้เป็น Array เสมอ
    const devicesList = Array.isArray(result.data)
      ? result.data
      : (result.data.devices || []);

    setDevices(devicesList);

    // 5. ตั้งค่าอุปกรณ์ตัวแรกเป็นค่าเริ่มต้น
    if (devicesList.length > 0) {
      const firstDevice = devicesList[0];
      
      // เก็บ ID เป็น String เพื่อให้ตรงกับค่าใน <select> value
      const firstId = firstDevice.device_registrations_ID?.toString();
      setSelectedDeviceId(firstId);

      // ตั้งค่า Settings เริ่มต้นจากอุปกรณ์ตัวแรก (ถ้ามี)
      if (firstDevice.setting) {
        setSettings({
          minLevel: firstDevice.setting.Water_level_min ?? 0,
          maxLevel: firstDevice.setting.Water_level_mxm ?? 0,
          dataSendInterval: parseInt(firstDevice.setting.data_send_interval_days) || 1,
          notifyLine: true,
          notifyApp: true,
        });
      }
    } else {
      // กรณีไม่มีอุปกรณ์เลย
      setSelectedDeviceId(null);
    }

  } catch (err) {
    console.error("Failed to fetch water plots:", err);
    setDevices([]); // ล้างข้อมูลหากเกิด Error
    
    Swal.fire({
      icon: "error",
      title: "ดึงข้อมูลไม่สำเร็จ",
      text: err.message || "กรุณาลองใหม่อีกครั้งภายหลัง",
      confirmButtonColor: "#10b981", // สี Emerald
    });
  } finally {
    // 6. ปิด Loading เสมอไม่ว่าจะสำเร็จหรือพลาด
    setLoading(false);
  }
}