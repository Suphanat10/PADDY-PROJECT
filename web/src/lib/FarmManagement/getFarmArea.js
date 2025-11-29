import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

export async function getFarmAreas(setIsLoading, setFarms) {
  try {
    const res = await apiFetch("/api/farm-area/list", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.status === 404) {
      setFarms([]);
      setIsLoading(false);
      return;
    }

    if (!res.ok) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: res.message || "Fetch failed",
      });
      return;
    }

    setFarms(res.data);
    setIsLoading(false);

    console.log("USER DATA:", res.data);
  } catch (err) {
    console.error("FETCH USER ERROR:", err);
    alert(err.message || "ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
  } finally {
    setIsLoading(false);
  }
}
