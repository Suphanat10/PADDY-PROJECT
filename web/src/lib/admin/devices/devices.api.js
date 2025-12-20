import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";



export async  function getdataDevices(setIsLoading, setDevices) {
  try {
    const res = await apiFetch("/api/admin/devices", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
      if (res.status === 404) {
      setDevices([]);
      setIsLoading(false);
      return;
      }
      if (!res.ok) {
      Swal.fire({
         icon: "error",
         title: "ข้อผิดพลาด",
         text: res.message || "Fetch failed",
      });
       setIsLoading(false);
      return;
      }
      setDevices(res.data);
      setIsLoading(false);
      console.log("DEVICES DATA:", res.data);
   } catch (err) {
      console.error("FETCH DEVICES ERROR:", err);
      } finally {
      setIsLoading(false);
   }
}


export async function  createDevice (device_code, setDevices) {
  if (!device_code) {
    Swal.fire({
      icon: "warning",
      title: "ไม่พบรหัสอุปกรณ์",
      text: "กรุณาระบุรหัสอุปกรณ์ที่ต้องการเพิ่ม",
    });
    return;
  }
   try {
      const result = await apiFetch("/api/admin/device/create", {
         method: "POST",
         body: { device_code },
      });
    
      if (!result.ok) {
         Swal.fire({
            icon: "error",
            title: "ข้อผิดพลาด",
            text: result.message || "Create failed",
         });
         return;
      
      }

      Swal.fire({
         icon: "success",
         title: "เพิ่มอุปกรณ์สำเร็จ",
         text: result.message || "อุปกรณ์ถูกเพิ่มแล้ว",
      });
      setDevices((prev) => [...prev, result.data.device]);
   } catch (err) {
      console.error("Create error:", err);
      Swal.fire({
         icon: "error",
         title: "เกิดข้อผิดพลาด",
         text: err.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
      });
   }
   finally {
   (false);
   }
}


export async function  deleteDevice (device_id, setDevices) {
  if (!device_id) {
    Swal.fire({
      icon: "warning",
      title: "ไม่พบรหัสอุปกรณ์",
      text: "กรุณาระบุรหัสอุปกรณ์ที่ต้องการลบ",
    });
    return;
  }
   const confirm = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "การลบอุปกรณ์นี้จะไม่สามารถกู้คืนได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ใช่, ลบอุปกรณ์นี้!",
      cancelButtonText: "ยกเลิก",
   });
   if (!confirm.isConfirmed) {
      return;
   }
   try {
      const result = await apiFetch("/api/admin/device/delete", {
         method: "POST",   
         body: { device_id },
      });
      if (!result.ok) {
         Swal.fire({
            icon: "error",
            title: "ข้อผิดพลาด",
            text: result.message || "Delete failed",
         });
         return;
      }

      Swal.fire({
         icon: "success",
         title: "ลบอุปกรณ์สำเร็จ",
         text: result.message || "อุปกรณ์ถูกลบแล้ว",

      });
      setDevices((prev) => prev.filter((d) => d.device_ID !== device_id));
   } catch (err) {
      console.error("Delete error:", err);
      Swal.fire({
         icon: "error",
         title: "เกิดข้อผิดพลาด",
         text: err.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
      });
   }
}
  

export async function updateDevice(device_id, device_code, setDevices) {
  try {
    const result = await apiFetch("/api/admin/device/update", {
      method: "POST",
      body: { device_id, device_code },
    });
      if (!result.ok) {
      Swal.fire({
         icon: "error",
         title: "ข้อผิดพลาด",
         text: result.message || "Update failed",
      });
      return;
      }
      Swal.fire({
      icon: "success",
      title: "อัปเดตอุปกรณ์สำเร็จ",
      text: result.message || "ข้อมูลอุปกรณ์ถูกอัปเดตแล้ว",
      });
      setDevices((prev) => 
         prev.map((device) =>
            device.device_ID === device_id
               ? { ...device, device_code: device_code }
               : device
         )
      );
   }
   catch (err) {
      console.error("Update error:", err);
      Swal.fire({
         icon: "error",
         title: "เกิดข้อผิดพลาด",
         text: err.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
      });
   }
}
