import Swal from "sweetalert2";
import { ensureLiffLogin } from "@/lib/Linelogin";

export default async function handleLineLogin(setIsLoading) {
  try {
    setIsLoading(true);

    Swal.fire({
      title: "กำลังเข้าสู่ระบบ...",
      text: "กรุณารอสักครู่ ระบบกำลังตรวจสอบข้อมูลจาก LINE",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const result = await ensureLiffLogin();
    Swal.close();

    const accessToken =
      result?.token || localStorage.getItem("access_token");

    if (accessToken && result?.user) {
      await Swal.fire({
        icon: "success",
        title: `ยินดีต้อนรับ ${
          result.user.first_name ||
          result.profile?.displayName ||
          "ผู้ใช้ใหม่"
        }!`,
        timer: 2000,
        showConfirmButton: false,
      });

      const params = new URLSearchParams(window.location.search);
      const next = params.get("next") || "/Paddy/agriculture/dashboard";
      window.location.href = next;
    } else {
      Swal.fire({
        icon: "warning",
        title: "ยังไม่ได้เข้าสู่ระบบ",
        text: "กรุณาลองอีกครั้ง",
      });
    }
  } catch (error) {
    console.error("LINE LOGIN FAILED:", error);
    Swal.fire({
      icon: "error",
      title: "เข้าสู่ระบบไม่สำเร็จ",
      text: "กรุณาลองใหม่อีกครั้งภายหลัง",
    });
  } finally {
    setIsLoading(false);
  }
}
