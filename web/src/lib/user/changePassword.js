import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

export async function changePassword(
  e,
  passwordForm,
  setPasswordForm,
  setIsChangingPassword,
  showAlert   
) {
  e.preventDefault();

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "ข้อผิดพลาด",
        text: "รหัสผ่านใหม่กับยืนยันรหัสผ่านไม่ตรงกัน",
      });
    return;
  }

  if (passwordForm.newPassword.length < 8) {
      Swal.fire({
        icon: "warning",
        title: "ข้อผิดพลาด",
        text: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร",
      });
    return;
  }

  if (passwordForm.newPassword === passwordForm.currentPassword) {
      Swal.fire({
        icon: "warning",
        title: "ข้อผิดพลาด",
        text: "รหัสผ่านใหม่ต้องไม่เหมือนกับรหัสผ่านปัจจุบัน",
      });

     return;
  }

  if (
    !passwordForm.currentPassword ||
    !passwordForm.newPassword ||
    !passwordForm.confirmPassword
  ) {
    showAlert("ข้อผิดพลาด", "กรุณากรอกข้อมูลให้ครบถ้วน", "warning");
    return;
  }

  try {
    const result = await apiFetch("/api/profile/change-password", {
      method: "POST",
      body: {
        oldPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      },
    });

    if (!result.ok) {
      Swal.fire({
         icon: "error",
         title: "เปลี่ยนรหัสผ่านไม่สำเร็จ",
         text: result.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน",
      });
      return;
    }

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setIsChangingPassword(false);

   Swal.fire({
      icon: "success",
      title: "เปลี่ยนรหัสผ่านสำเร็จ",
      timer: 2000,
      showConfirmButton: false,
      });


  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: err.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
      });

  } finally {
  console.log("Change password process completed.");
  }
}
