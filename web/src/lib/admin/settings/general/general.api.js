import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";


export async function fetchGeneralSettings( ) {
   try {
      const res = await apiFetch("/api/admin/get_system_settings", {
         method: "GET",
         headers: {
            "Content-Type": "application/json",
         },
      });

      if(!res.ok) {
         Swal.fire({
            icon: "error",
            title: "ข้อผิดพลาด",
            text: res.message || "Fetch failed",
         });
         return;
      }

  return res.data;
   }
   catch (error) {
      console.error("Fetch general settings failed:", error);
      throw error;
   }
}


export async function updateGeneralSettings(config , setConfig) {

   try {
      const res = await apiFetch("/api/admin/update_system_settings", {
         method: "POST",
         body: config,
      });

      if (!res.ok) {
         Swal.fire({
            icon: "error",
            title: "ข้อผิดพลาด",
            text: res.message || "Update failed",
         });
         return;
      }
      setConfig(res.data);
      Swal.fire({
         icon: "success",
         title: "สำเร็จ",
         text: "อัปเดตการตั้งค่าระบบเรียบร้อยแล้ว",
      });
   } catch (error) {
      console.error("Update general settings failed:", error);

      Swal.fire({
         icon: "error",
         title: "ข้อผิดพลาด",
         text: error.message || "ไม่สามารถอัปเดตการตั้งค่าระบบได้",
      });
   }
}





