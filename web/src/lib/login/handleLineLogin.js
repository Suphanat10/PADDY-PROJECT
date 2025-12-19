import Swal from "sweetalert2";
import { ensureLiffLogin } from "@/lib/Linelogin";

export default async function handleLineLogin(setIsLoading) {
  try {
    setIsLoading(true);

    // 1. เรียกใช้งาน ensureLiffLogin (ภายในมี liff.init และ apiFetch ไปที่ backend แล้ว)
    const result = await ensureLiffLogin();

    // 2. ตรวจสอบว่าได้ผลลัพธ์ (Login สำเร็จ) หรือไม่
    if (result && result.systemUser) {
      Swal.fire({
        icon: "success",
        title: "เข้าสู่ระบบสำเร็จ",
        confirmButtonText: "ตกลง",
      }).then(() => {
        const next =
          new URLSearchParams(window.location.search).get("next") ||
          "/Paddy/agriculture/dashboard";
        window.location.replace
(next);
      });
      
    } else {
      console.log("Waiting for LINE redirection or processing...");
    }

  } catch (error) {
    console.error("LINE LOGIN FAILED:", error);

    // ปิด Loading ก่อนแสดง Error
    setIsLoading(false);

    Swal.fire({
      icon: "error",
      title: "เข้าสู่ระบบไม่สำเร็จ",
      text: error.message || "ไม่สามารถเชื่อมต่อกับบัญชี LINE ได้",
      confirmButtonText: "ตกลง",
      confirmButtonColor: "#10b981"
    });
  } finally {

    setIsLoading(false);
  }
}
