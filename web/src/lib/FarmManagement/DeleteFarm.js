import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

export async function DeleteFarm(farm_id, setIsDeleting, setFarms) {
  if (!farm_id) {
    Swal.fire({
      icon: "warning",
      title: "ไม่พบรหัสฟาร์ม",
      text: "กรุณาระบุรหัสฟาร์มที่ต้องการลบ",
    });
    return;
  }



  const confirm = await Swal.fire({
    title: "คุณแน่ใจหรือไม่?",
    text: "การลบฟาร์มนี้จะไม่สามารถกู้คืนได้!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "ใช่, ลบฟาร์มนี้!",
    cancelButtonText: "ยกเลิก",
  });

  if (!confirm.isConfirmed) {
    setIsDeleting(false);
    return;
  }

  try {
    const result = await apiFetch("/api/farm-area/delete", {
      method: "POST",   
      body: { farm_id },
    });

    Swal.fire({
      icon: "success",
      title: "ลบฟาร์มสำเร็จ",
      text: result.message || "ข้อมูลฟาร์มถูกลบแล้ว",
    });

    setFarms((prev) => prev.filter((f) => f.farm_id !== farm_id));
  setIsDeleting(true);

  } catch (err) {
    console.error("Delete error:", err);

    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: err.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
    });

  } finally {
    setIsDeleting(false);
  }
}
