import { apiFetch } from "@/lib/api";

// ดึงข้อมูล Dashboard จาก API
export async function getDashboardData() {
  try {
    const res = await apiFetch("/api/data/dashboard");

    if (!res || res.error) {
      console.error("Dashboard API error:", res);
      return null;
    }

    return res.data || res;
  } catch (err) {
    console.error("Fetch dashboard error:", err);
    return null;
  }
}
