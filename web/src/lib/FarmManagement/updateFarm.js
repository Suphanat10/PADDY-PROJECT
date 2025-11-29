import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

export async function updateFarm(
  e,
  formData,
  setIsSaving,
  setIsEditing,
  setFarms,
  editingId
) {
  e.preventDefault();
  setIsSaving(true);
  try {
    console.log("Form Data:", formData);
   
    if(!formData){
        Swal.fire({
          icon: "warning",
            title: "ข้อผิดพลาด",
            text: "กรุณากรอกข้อมูลให้ครบถ้วน",
         });   

      return;
    }
    

    const result = await apiFetch("/api/farm-area/update", {
      method: "POST",
      body: {
        farm_id: editingId,
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

        title: "อัปเดตฟาร์มล้มเหลว",
        text: result.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล",
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "อัปเดตฟาร์มสำเร็จ",
      text: "บันทึกข้อมูลแล้ว",
    });
    setFarms((prev) =>
      prev.map((f) => (f.farm_id === editingId ? formData : f))
    );

    setIsEditing(false);
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: err.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
    });
  } finally {
    console.log("Update farm process completed.");
    setIsSaving(false);
  }
}
