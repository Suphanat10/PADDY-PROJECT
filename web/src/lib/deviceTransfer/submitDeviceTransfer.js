import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

export async function submitDeviceTransfer({
  selectedDeviceId,
  targetFarmId,
  targetAreaId,
  setIsLoading,
  setSuccessMsg,
}) {
  try {
    // ============================
    // 1) Validate Input
    // ============================
    if (!selectedDeviceId) {
      Swal.fire({
        icon: "error",
        title: "กรุณาเลือกอุปกรณ์ที่ต้องการโอนย้าย",
      });
      return;
    }

    if (!targetFarmId || !targetAreaId) {
      Swal.fire({
        icon: "error",
        title: "กรุณาเลือกฟาร์มและพื้นที่เป้าหมาย",
      });
      return;
    }

    // ============================
    // 2) Loading state
    // ============================
    setIsLoading(true);

    // ============================
    // 3) Popup ยืนยัน
    // ============================
    const confirm = await Swal.fire({
      title: "คุณแน่ใจหรือไม่ที่จะโอนย้ายอุปกรณ์นี้?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, โอนย้าย",
      cancelButtonText: "ยกเลิก",
      text: "การดำเนินการนี้ไม่สามารถย้อนกลับได้ และข้อมูลในอุปกรณ์จะถูกลบทั้งหมด",
    });

    if (!confirm.isConfirmed) {
      setIsLoading(false);
      return;
    }

    // ============================
    // 4) สร้าง Payload ให้ตรง Backend
    // backend ใช้: device_id , area_id , farm_id
    // ============================
    const payload = {
      device_id: Number(selectedDeviceId),
      area_id: Number(targetAreaId),
      farm_id: Number(targetFarmId),
    };

    // ============================
    // 5) Call API
    // ============================
    const response = await apiFetch("/api/transfer-device", {
      method: "POST",
      body: payload,
    });

 if (response.ok) {
   Swal.fire({
     icon: "success",
     title: "โอนย้ายอุปกรณ์สำเร็จ",
     text: "อุปกรณ์ถูกโอนย้ายไปยังฟาร์มและพื้นที่เป้าหมายเรียบร้อยแล้ว",
   });

   setSuccessMsg("โอนย้ายอุปกรณ์สำเร็จ");
   setIsLoading(false);
   return;
 }


     Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาดในการโอนย้ายอุปกรณ์",
      text: response?.message || "กรุณาลองใหม่อีกครั้งภายหลัง",
    });

    setIsLoading(false);
  } catch (error) {
    
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาดในการโอนย้ายอุปกรณ์",
      text: error.message,
    });
    setIsLoading(false);
  }
}
