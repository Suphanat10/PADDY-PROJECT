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
      setAllData(result.data);
      console.log("STATISTICS DATA:", result.data);
   } catch (err) {
      console.error("FETCH STATISTICS DATA ERROR:", err);
      setError(err.message || "ไม่สามารถโหลดข้อมูลสถิติได้");
   } finally {
      setIsLoading(false);
   }
}

