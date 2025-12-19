import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";


export async function updateProfile(e, formData, setIsSaving, setIsEditing) {
  e.preventDefault();
  setIsSaving(true);

  try {

   if(!formData){
       Swal.fire({
         icon: "warning",
         title: "ข้อผิดพลาด",
         text: "กรุณากรอกข้อมูลให้ครบถ้วน",
       });
     return;
   }

      const result = await apiFetch("/api/profile/update", {
        method: "POST",
        body: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone_number: formData.phone_number,
            address: formData.address,
            email: formData.email,

        }
      });



      if (!result.ok) {
        Swal.fire({
          icon: "error",
          title: "อัปเดตข้อมูลล้มเหลว",
          text: result.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล",
        });
        return;
      }
      Swal.fire({
         icon: "success",
         title: "อัปเดตข้อมูลสำเร็จ",
         text: "บันทึกข้อมูลแล้ว",
       });
      setIsEditing(false);
  } catch (err) {
    console.error(err);
      Swal.fire({
         icon: "error",
         title: "เกิดข้อผิดพลาด",
         text: err.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
         });

  } finally {
console.log("Update profile process completed.");
//    setIsSaving(false);
  }
}
