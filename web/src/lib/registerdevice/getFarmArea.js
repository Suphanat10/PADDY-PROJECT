import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

const extractList = (res) => {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
};

export default async function getFarmArea(
  setLoadingData,
  setFarms,
  setAlertMessage,
  setFarmId
) {
  try {
    const res = await apiFetch("/api/farm-area/list", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (res.status === 404) {
      setFarms([]);
      setLoadingData(false);
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

    let list = extractList(res);

    // ================================================
    //  ✅ Mark sub_areas ว่าอันไหนลงทะเบียนแล้ว
    // ================================================
    list = list.map((farm) => ({
      ...farm,
      sub_areas: farm.sub_areas.map((area) => {
        const isRegistered = area.device_registrations?.length > 0;

        return {
          ...area,
          isRegistered,
          disabled: isRegistered, // ใช้ปิด dropdown
          statusText: isRegistered ? "มีอุปกรณ์แล้ว" : "ว่าง",
        };
      }),
    }));

    setFarms(list);

    // ถ้ามีฟาร์มเดียว auto-select ฟาร์มแรก
    if (list.length === 1) {
      setFarmId(String(list[0].farm_id));
    }

    console.log("USER DATA (Processed):", list);
  } catch (err) {
    console.error("FETCH USER ERROR:", err);

    setAlertMessage({
      title: "ข้อผิดพลาด",
      message: err.message || "ไม่สามารถโหลดข้อมูลผู้ใช้ได้",
      type: "error",
    });
  } finally {
    setLoadingData(false);
  }
}
