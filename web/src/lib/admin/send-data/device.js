import { apiFetch } from "@/lib/api";

export async function fetchDevices() {
   try {
      const res = await apiFetch("/api/admin/devices", {
         method: "GET",
         headers: {
             "Content-Type": "application/json",
         },
      });

      if (res.status === 404) {
         return [];
      }

      if (!res.ok) {
         throw new Error(res.message || "Fetch failed");
      }

      return res.data;
   } catch (err) {
      console.error("FETCH DEVICES ERROR:", err);
      throw err;
   }
}


