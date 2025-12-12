import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

/**
 * ลบข้อมูลของอุปกรณ์ โดยไม่ลบตัว Device
 */
export async function deleteDeviceByCode({
  deviceCode,
  onSuccess,
  onError,
  setIsLoading,
}) {
  try {
    if (!deviceCode) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "ไม่พบรหัสอุปกรณ์",
      });
      return;
    }

    // ยืนยันการลบ
    const confirm = await Swal.fire({
      title: "ต้องการลบข้อมูลอุปกรณ์นี้หรือไม่?",
      text: "ข้อมูลทั้งหมดที่เชื่อมกับอุปกรณ์จะถูกลบ แต่ตัวอุปกรณ์จะยังคงอยู่",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบข้อมูล",
      cancelButtonText: "ยกเลิก",
    });

    if (!confirm.isConfirmed) return;

    setIsLoading?.(true);

    const res = await apiFetch("/api/delete-device", {
      method: "POST",
      body: { device_code: deviceCode },
    });

    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: "ยกเลิกการลงทะเบียนอุปกรณ์สำเร็จ",
        text: res.message,
      });

      onSuccess?.(res);
    } else {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: res?.message || "เกิดข้อผิดพลาด",
      });
      onError?.(res);
    }
  } catch (err) {
    console.error("Delete device error:", err);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: err?.message || "ไม่สามารถลบข้อมูลได้",
    });
    onError?.(err);
  } finally {
    setIsLoading?.(false);
  }
}
