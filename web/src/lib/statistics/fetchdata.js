import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";



export async function fetchdata (setIsLoading, setAllData, setError) {
  try {
    setIsLoading(true);
    const result =  await apiFetch("/api/data/static", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }); 
      if (!result.ok) {
         setError(result.message || "Fetch failed");
         return;
      }

       
       if(!result.data.stats || result.data.stats.length === 0) {
         setError("ไม่พบข้อมูลสถิติที่ทำการลงทะเบียนไว้");
         return;
       }


      setAllData(result.data);
   } catch (err) {
      console.error("FETCH STATISTICS DATA ERROR:", err);
      setError(err.message || "ไม่สามารถโหลดข้อมูลสถิติได้");
   } finally {
      setIsLoading(false);
   }
}

