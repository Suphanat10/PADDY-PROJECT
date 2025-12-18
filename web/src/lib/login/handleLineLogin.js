import Swal from "sweetalert2";
import { ensureLiffLogin } from "@/lib/Linelogin";

export default async function handleLineLogin(setIsLoading) {
  try {
    setIsLoading(true);


    const result = await ensureLiffLogin();

    if (result) {
      Swal.fire({
        icon: "success",
        title: "เข้าสู่ระบบสำเร็จ",
      }).then(() => {
 const next =
        new URLSearchParams(window.location.search).get("next") ||
        "/Paddy/agriculture/dashboard";
      window.location.replace(next);      });
    }else{
      return;
    }


      
      
  } catch (error) {
    console.error("LINE LOGIN FAILED:", error);
    

    Swal.fire({
      icon: "error",
      title: "เข้าสู่ระบบไม่สำเร็จ",
      text: error.message || "กรุณาลองใหม่อีกครั้งภายหลัง",
      confirmButtonText: "ตกลง"
    });
  } finally {
    setIsLoading(false);
  }
}