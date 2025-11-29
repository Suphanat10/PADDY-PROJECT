import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

export async function DeleteSubArea(
  farm_id,
  sub_area_id,
  setIsDeleting,
  currentFarmForSubArea,
  setCurrentFarmForSubArea,
  setFarms
) {

  if (!farm_id || !sub_area_id) {
    Swal.fire({
      icon: "warning",
      title: "ไม่พบรหัสฟาร์มหรือรหัสพื้นที่ย่อย",
      text: "กรุณาระบุรหัสฟาร์มและรหัสพื้นที่ย่อยที่ต้องการลบ",
    });
    return;
  }

  // ป้องกันการกดลบซ้ำ

  const confirm = await Swal.fire({
    title: "คุณแน่ใจหรือไม่?",
    text: "การลบพื้นที่ย่อยนี้จะไม่สามารถกู้คืนได้!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "ใช่, ลบพื้นที่ย่อยนี้!",
    cancelButtonText: "ยกเลิก",
  });

  if (!confirm.isConfirmed) {
    setIsDeleting(false);
    return;
  }

  try {
    const result = await apiFetch("/api/farm-area/delete-sub-area", {
      method: "POST",
      body: { area_id: sub_area_id },
    });

    Swal.fire({
      icon: "success",
      title: "ลบพื้นที่ย่อยสำเร็จ",
      text: result.message || "ข้อมูลพื้นที่ย่อยถูกลบแล้ว",
    });

    // 🔄 อัปเดต farms list
    setFarms((prev) =>
      prev.map((farm) =>
        farm.farm_id === farm_id
          ? {
              ...farm,
              sub_areas: farm.sub_areas.filter(
                (a) => a.area_id !== sub_area_id
              ),
            }
          : farm
      )
    );

    // 🔄 อัปเดตฟาร์มที่เปิด modal อยู่
    setCurrentFarmForSubArea({
      ...currentFarmForSubArea,
      sub_areas: currentFarmForSubArea.sub_areas.filter(
        (a) => a.area_id !== sub_area_id
      ),
    });
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
