import Swal from "sweetalert2";
import { apiFetch } from "@/lib/api";

export default async function handleSubmit(
  e,
  username,
  password,
  setIsLoading
) {
  e.preventDefault();
  setIsLoading(true);

  try {
    if (!username || !password) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
      });
      return;
    }
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: { username, password },
    });

    Swal.fire({
      icon: "success",
      title: data.message || "เข้าสู่ระบบสำเร็จ",
    }).then(() => {
      const next =
        new URLSearchParams(window.location.search).get("next") ||
        "/Paddy/agriculture/dashboard";
      window.location.replace(next);
    });
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "เข้าสู่ระบบไม่สำเร็จ",
      text: err.message || "เกิดข้อผิดพลาด",
    });
  } finally {
    setIsLoading(false);
  }
}
