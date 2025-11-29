import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

export async function updateSubArea(
  farm_id,
  sub_area_id,
  new_area_name,
  setIsSaving,
  currentFarmForSubArea,
  setCurrentFarmForSubArea,
  setFarms
) {
  if (!farm_id || !sub_area_id || !new_area_name) {
    Swal.fire({
      icon: "warning",
      title: "ข้อผิดพลาด",
      text: "กรุณาระบุรหัสฟาร์ม รหัสพื้นที่ย่อย และชื่อพื้นที่ย่อยใหม่",
    });
    return;
  }

  setIsSaving(true);

  try {
    const result = await apiFetch("/api/farm-area/update-sub-area", {
      method: "POST",
      body: {
        area_id: sub_area_id,
        new_area_name,
      },
    });

    Swal.fire({
      icon: "success",
      title: "อัปเดตพื้นที่ย่อยสำเร็จ",
      text: result.message || "บันทึกข้อมูลแล้ว",
    });

    // 🔄 อัปเดต farms list ใน state หลัก
    setFarms((prev) =>
      prev.map((farm) =>
        farm.farm_id === farm_id
          ? {
              ...farm,
              sub_areas: farm.sub_areas.map((area) =>
                area.area_id === sub_area_id
                  ? { ...area, area_name: new_area_name }
                  : area
              ),
            }
          : farm
      )
    );

    // 🔄 อัปเดตฟาร์มที่เลือกอยู่ใน modal (ถ้ามี)
    setCurrentFarmForSubArea((prev) => {
      if (!prev) return prev; // กัน null / undefined
      return {
        ...prev,
        sub_areas: prev.sub_areas.map((area) =>
          area.area_id === sub_area_id
            ? { ...area, area_name: new_area_name }
            : area
        ),
      };
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: error.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
    });
  } finally {
    setIsSaving(false); // ✅ ตรงนี้ไม่ต้องมี `);` ต่อท้ายแล้ว
  }
}


