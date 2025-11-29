import { apiFetch } from "@/lib/api";

export async function fetchUser(
  setIsLoading,
  setFormData,
  setIsLineConnected
) {
  setIsLoading(true);

  try {
    const res = await apiFetch("/api/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
      // Authorization auto-injected จาก apiFetch แล้ว
    });

    console.log("PROFILE RESPONSE:", res);

    // ❌ ถ้าไม่ ok → แสดง error
    if (!res.ok) {
      throw new Error(res.message || "Fetch failed");
    }

    // ⬇️ ข้อมูลจริงจาก backend
    const data = res.data;
    console.log("USER DATA:", data.profile);
    setFormData({
      first_name: data.profile.first_name || "",
      last_name: data.profile.last_name || "",
      phone_number: data.profile.phone_number || "",
      email: data.profile.email || "",
      position: data.profile.position || "",
      gender: data.profile.gender || "",
      birth_date: data.profile.birth_date || "",
    });

    setIsLineConnected(data.profile.user_id_line || false);

  } catch (err) {
    console.error("FETCH USER ERROR:", err);
    alert(err.message || "ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
  } finally {
    setIsLoading(false);
  }
}
