import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

export async function createSubArea(
  farm_id,
  sub_area_name,
  setIsSaving,
  currentFarmForSubArea,
  setCurrentFarmForSubArea,
  setFarms
) {
  if (!sub_area_name || !farm_id) {
    Swal.fire({
      icon: "warning",
      title: "ข้อผิดพลาด",
      text: "กรุณาระบุชื่อพื้นที่ย่อยและรหัสฟาร์ม",
    });
    return;
  }

  setIsSaving(true);

  try {
    const result = await apiFetch("/api/farm-area/create-sub-area", {
      method: "POST",
      body: {
        farm_id,
        area_name: sub_area_name,
      },
    });

    if (!result.ok) {
      Swal.fire({
        icon: "error",
        title: "สร้างพื้นที่ย่อยล้มเหลว",
        text: result.message || "เกิดข้อผิดพลาดในการสร้างข้อมูล",
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "สร้างพื้นที่ย่อยสำเร็จ",
      text: result.message || "บันทึกข้อมูลแล้ว",
    });

    const newSubArea = result.data?.sub_area;

    if (!newSubArea) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "ข้อมูลพื้นที่ย่อยใหม่ไม่ถูกต้อง",
      });

      return;
    }

    // อัปเดต farms list
    setFarms((prev) =>
      prev.map((farm) =>
        farm.farm_id === farm_id
          ? { ...farm, sub_areas: [...(farm.sub_areas || []), newSubArea] }
          : farm
      )
    );

    // อัปเดตฟาร์มที่เลือกอยู่ใน modal
    setCurrentFarmForSubArea((prev) => ({
      ...prev,
      sub_areas: [...(prev.sub_areas || []), newSubArea],
    }));
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: error.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
    });
  } finally {
    setIsSaving(false);
  }
}
