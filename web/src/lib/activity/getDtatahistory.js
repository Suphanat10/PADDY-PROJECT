import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";


export async function getDataHistory(setIsLoading, setLogs) {
   try {
      const res = await apiFetch("/api/data/history", {
         method: "GET",
         headers: {
            "Content-Type": "application/json",
         },
      });
      if (res.status === 404) {
         setLogs([]);
         setIsLoading(false);
         Swal.fire({
            icon: "info",
            title: "ไม่พบข้อมูลประวัติการใช้งาน",
            text: "ยังไม่มีประวัติการใช้งานในระบบ",
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

      setLogs(res.data);
      console.log("HISTORY DATA:", res.data);
      setIsLoading(false);
   }
   catch (err) {
      console.error("FETCH HISTORY ERROR:", err);
      Swal.fire({
         icon: "error",
         title: "ข้อผิดพลาด",
         text: err.message || "ไม่สามารถโหลดข้อมูลประวัติการใช้งานได้",
      });

   } finally {
      setIsLoading(false);
   }
}
