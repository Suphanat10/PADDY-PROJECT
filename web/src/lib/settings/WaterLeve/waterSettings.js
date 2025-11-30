import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

export async function waterSettings( minLevel, maxLevel, selectedDeviceId, setLoading, setSaveStatus  , setSettings ) {
  try {



    if(!minLevel || !maxLevel){
      Swal.fire({
        icon: "error",
        title: "กรุณากรอกค่าระดับน้ำต่ำสุดและสูงสุด",
      });
      return;
    }
     if(!selectedDeviceId){
      Swal.fire({
        icon: "error",
        title: "กรุณาเลือกอุปกรณ์",
      });
      return;
    }

    if(minLevel >= maxLevel){
      Swal.fire({
        icon: "error",  
        title: "ระดับน้ำต่ำสุดต้องน้อยกว่าระดับน้ำสูงสุด",
      });
      return;
    }
    setLoading(true);

    const payload = {
      device_id: selectedDeviceId,
      Water_level_min: minLevel,
      Water_level_max: maxLevel,
    };

    console.log("Payload for water settings:", payload);

    const result = await apiFetch("/api/setting/update", {
      method: "POST",
      body: {
        ...payload,
      }
    });

    if (!result.ok) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาดในการบันทึกการตั้งค่าระดับน้ำ",
        text: result.message || "กรุณาลองใหม่อีกครั้งภายหลัง",
      });
      return;
    }


    if (result.ok) {
      Swal.fire({
        icon: "success",
        title: "บันทึกการตั้งค่าระดับน้ำสำเร็จ",
      });

       setSettings((prev) => ({
        ...prev,
        minLevel: minLevel,
        maxLevel: maxLevel,
      }));

      setSaveStatus(true);
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาดในการบันทึกการตั้งค่าระดับน้ำ",
      text: error.message,
    });
  }
  finally {
    setLoading(false);
  }
}

