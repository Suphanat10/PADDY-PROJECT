import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";



export async function  GatDataDeviceRegistration(user_ID, reg_id) {
  try {
    const result = await apiFetch("/api/admin/get_farm_areas", {
      method: "POST",
      body: { user_id : user_ID,  },
      });

      if (!result.ok) {
      Swal.fire({
         icon: "error",
         title: "ข้อผิดพลาด",
         text: result.message || "Fetch failed",
      });
      return;
      }

      return result.data;
   } catch (err) {
      console.error("Fetch error:", err);
      Swal.fire({
         icon: "error",
         title: "เกิดข้อผิดพลาด",
         text: err.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
      });
   }
}


export async function  MoveDeviceRegistration (user_ID, reg_id, new_farm_id, new_area_id) {
   if (!user_ID || !reg_id || !new_farm_id || !new_area_id) {
      Swal.fire({
         icon: "warning",
         title: "ข้อมูลไม่ครบถ้วน",
         text: "กรุณาระบุข้อมูลให้ครบถ้วนก่อนดำเนินการ",
      });
      return;
   }
   try {
      const result = await apiFetch("/api/admin/transfer_device", {
         method: "POST",
         body: { user_id :parseInt( user_ID), 
            device_registrations_ID : parseInt(reg_id),
            area_id : parseInt(new_area_id),
            farm_id : parseInt(new_farm_id)
         },
      });
      if (!result.ok) {
         Swal.fire({
            icon: "error",
            title: "ข้อผิดพลาด",
            text: result.message || "Move failed",
         });
         return;
      }
 
      return true;
   } catch (err) {
      console.error("Move error:", err);
      Swal.fire({
         icon: "error",
         title: "เกิดข้อผิดพลาด",
         text: err.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
      });
      return false;
   }
}



