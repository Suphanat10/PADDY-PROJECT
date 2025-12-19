import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";
// ดึงข้อมูล Dashboard จาก API
export async function getDashboardData() {
  try {
    const res = await apiFetch("/api/data/dashboard");

    if (!res.ok) {
      console.error("Dashboard API error:", res);
      return null;
    }

    return res.data ;
  } catch (err) {
    console.error("Fetch dashboard error:", err);
    return null;
  }
}
