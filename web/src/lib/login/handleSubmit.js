import Swal from "sweetalert2";
import { apiFetch } from "@/lib/api";

export default async function handleSubmit(
  e,
  email,
  password,
  setIsLoading
) {
  e.preventDefault();
  setIsLoading(true);

  try {
    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
      });
      return;
    }

    const result = await apiFetch("/api/auth/login", {
      method: "POST",
      body: { email, password }
    });


    if (!result.ok) {
      Swal.fire({
        icon: "error",
        title: "เข้าสู่ระบบไม่สำเร็จ",
        text: result.message || "Invalid email or password",
      });
      return;
    }

    const payload = result.data;
    Swal.fire({
      icon: "success",
      title: payload.message || "เข้าสู่ระบบสำเร็จ",
    }).then(() => {
      const next =
        new URLSearchParams(window.location.search).get("next") ||
        "/Paddy/agriculture/dashboard";
      window.location.replace(next);
    });

  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: err.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
    });
  } finally {
    setIsLoading(false);
  }
}
