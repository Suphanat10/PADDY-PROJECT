import Swal from "sweetalert2";
import { apiFetch } from "@/lib/api";
import liff from "@line/liff";

export default async function handleLineRegister(setIsLoading) {
  try {
    setIsLoading(true);

    await liff.init({ liffId: "2007854586-9ogoEj2j" });

    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }

    const profile = await liff.getProfile();

    const payload = {
      first_name: profile.displayName,
      last_name: "",
      phone_number: "",
      username: `line_${profile.displayName}`,
      password: " ",
      user_id_line: profile.userId,
    };

    const result = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (result.success) {
      Swal.fire({
        icon: "success",
        title: "ลงทะเบียนด้วย LINE สำเร็จ",
      }).then(() => window.location.replace("/"));
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "เชื่อมต่อ LINE ไม่สำเร็จ",
      text: error.message,
    });
  } finally {
    setIsLoading(false);
  }
}
