
import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

export async function fetchDeviceRegistrations() {
  try {
    const res = await apiFetch("/api/admin/device_registrations", {
      method: "GET",
    });
    if (!res.ok) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด", 
         text: res.message || "Fetch failed",
      });
      return;
      }


    return res.data; 
  } catch (error) {
    console.error("Fetch device registrations failed:", error);
    throw error;
  }
}
