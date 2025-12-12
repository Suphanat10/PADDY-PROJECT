import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";



export async function fetchGrowthAnalysisApi () {
  try {
    const result =  await apiFetch("/api/data/growth-analysis", {
      method: "GET",
    });

    if (!result?.data) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาดในการดึงข้อมูลการวิเคราะห์การเจริญเติบโต",
        text: result.message || "กรุณาลองใหม่อีกครั้งภายหลัง",
      });
      return;
    }
    return result.data;
  } catch (err) {
    console.error("Failed to fetch growth analysis data:", err);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
      text: err.message || "กรุณาลองใหม่อีกครั้งภายหลัง",
    });
  }
}




