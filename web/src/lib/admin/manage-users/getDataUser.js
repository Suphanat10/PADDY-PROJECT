import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

export async function getDataUser(setIsLoading, setUsers) {
  try {
    const res = await apiFetch("/api/data/personal", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.status === 404) {
      setUsers([]);
      setIsLoading(false);
      Swal.fire({
         icon: "info",
         title: "ไม่พบข้อมูลผู้ใช้",
         text: "ยังไม่มีผู้ใช้ในระบบ",
      });

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
    if(!Array.isArray(res.data) || res.data.length === 0) {
      setUsers([]);
      setIsLoading(false);
      return;
    }

    setUsers(res.data);
    console.log("USER DATA:", res.data);
    setIsLoading(false);
    console.log("USER DATA:", res.data);
  } catch (err) {
    console.error("FETCH USER ERROR:", err);
    alert(err.message || "ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
  } finally {
    setIsLoading(false);
  }
}
