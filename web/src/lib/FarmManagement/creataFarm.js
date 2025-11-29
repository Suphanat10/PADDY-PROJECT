import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

export async function creataFarm(
  e,
  formData,
  setIsSaving,
  setIsEditing,
  setFarms
) {
  e.preventDefault();
  setIsSaving(true);
  try {


    if (
      !formData.farm_name ||
      !formData.area ||
      !formData.rice_variety ||
      !formData.planting_method ||
      !formData.soil_type ||
      !formData.water_management ||
      !formData.address
    ) {
      Swal.fire({
        icon: "warning",
        title: "ข้อผิดพลาด",
        text: "กรุณากรอกข้อมูลให้ครบถ้วน",
      });
      return;
    }

    if (!formData) {
      Swal.fire({
        icon: "warning",
        title: "ข้อผิดพลาด",
        text: "กรุณากรอกข้อมูลให้ครบถ้วน",
      });
      return;
    }

    const result = await apiFetch("/api/farm-area/create", {
      method: "POST",
      body: {
        farm_name: formData.farm_name,
        area: formData.area,
        rice_variety: formData.rice_variety,
        planting_method: formData.planting_method,
        soil_type: formData.soil_type,
        water_management: formData.water_management,
        address: formData.address,
      },
    });
    if (!result.ok) {
      Swal.fire({
        icon: "error",
        title: "สร้างฟาร์มล้มเหลว",
        text: result.message || "เกิดข้อผิดพลาดในการสร้างข้อมูล",
      });
      return;
    }

   
    Swal.fire({
      icon: "success",
      title: "สร้างฟาร์มสำเร็จ",
      text: "บันทึกข้อมูลแล้ว",
    });

    setFarms((prev) => [
      ...prev,
      {
        farm_id: result.data.farmArea.farm_id,  
        farm_name: formData.farm_name,
        area: formData.area,
        rice_variety: formData.rice_variety,
        planting_method: formData.planting_method,
        soil_type: formData.soil_type,
        water_management: formData.water_management,
        address: formData.address,
      },
    ]);
    setIsEditing(false);
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: err.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
    });
  } finally {
    console.log("Create farm process completed.");
    setIsSaving(false);
  }
}
