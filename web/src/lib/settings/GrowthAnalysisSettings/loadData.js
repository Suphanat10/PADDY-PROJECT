import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

export default async function loadData(
  setDevices , setSelectedFarm ,  setSelectedRegID , setIsPageLoading
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
         setSelectedFarm(firstDevice.farm_name || "");
         setSelectedRegID(firstDevice.device_registrations_ID.toString());
      }
   

      setIsPageLoading(false);
  } catch (err) {
    console.error("Failed to fetch water plots:", err);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
      text: err.message || "กรุณาลองใหม่อีกครั้งภายหลัง",
    });

  }
}
