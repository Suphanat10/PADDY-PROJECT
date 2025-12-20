import Swal from "sweetalert2";
import { apiFetch } from "@/lib/api";

export default async function handleSubmit(
  e,
  formData,
  setAlert,
  setIsLoading
) {
  e.preventDefault();

  try {
    setIsLoading(true);

    if (!formData.first_name || !formData.phone_number || !formData.password) {
      return setAlert({
        title: "ข้อมูลไม่ครบถ้วน",
        message: "กรุณากรอกข้อมูลให้ครบถ้วน",
        type: "warning",
      });
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone_number)) {
      return setAlert({
        title: "เบอร์โทรศัพท์ไม่ถูกต้อง",
        message: "กรุณากรอกเบอร์ 10 หลัก",
        type: "warning",
      });
    }

    if (formData.password !== formData.confirmPassword) {
      return setAlert({
        title: "รหัสผ่านไม่ตรงกัน",
        message: "กรุณาตรวจสอบอีกครั้ง",
        type: "warning",
      });
    }

    if (formData.password.length < 8) {
      return setAlert({
        title: "รหัสผ่านสั้นเกินไป",
        message: "ต้องยาวอย่างน้อย 8 ตัวอักษร",
        type: "warning",
      });
    }

    const payload = {
      first_name: formData.first_name,
      last_name: formData.last_name || "",
      phone_number: formData.phone_number,
      email: formData.email,
      password: formData.password,
      user_id_line: formData.user_id_line || null,
    };

    const response = await apiFetch("/api/auth/register", {
      method: "POST",
      body: {
        ...payload
      },
    });

    if (!response.ok) {
      return setAlert({
        title: "ลงทะเบียนไม่สำเร็จ",
        message: response.message || "กรุณาลองใหม่อีกครั้งภายหลัง",
        type: "error",
      });
    }

    Swal.fire({
      icon: "success",
      title: "ลงทะเบียนสำเร็จ",
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      window.location.replace("/");
    });

  } catch (err) {
    Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: err.message });
  } finally {
    setIsLoading(false);
  }
}
