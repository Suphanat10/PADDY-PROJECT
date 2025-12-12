import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";


// config.waterMin,
//       config.waterMax,
//       selectedRegID,

//       setIsLoading,
//       setSuccessMessage,
//       setConfig,
//       config.imageCaptureIntervalHours, 
//       dataDaysToSend 
export default async function GrowthSettings(
  waterMin,
  waterMax,
   selectedRegID,
   setIsLoading,
  setSuccessMessage,
  setConfig
  ,imageCaptureIntervalHours  ,
   dataDaysToSend
) {
  try {
    if (!waterMin || !waterMax) {
      Swal.fire({
        icon: "error",
        title: "กรุณากรอกค่าระดับน้ำต่ำสุดและสูงสุด",
      });
      return;
    }

    if (!selectedRegID) {
      Swal.fire({
        icon: "error",
        title: "กรุณาเลือกอุปกรณ์",
      });
      return;
    }

    if (waterMin >= waterMax) {
      Swal.fire({
        icon: "error",
        title: "ระดับน้ำต่ำสุดต้องน้อยกว่าระดับน้ำสูงสุด",
      });
      return;
    }

    setIsLoading(true);

    const payload = {
      device_registrations_id: selectedRegID,
      Water_level_min: waterMin,
      data_send_interval_days: dataDaysToSend,
      Water_level_max: waterMax,
      growth_analysis_period : imageCaptureIntervalHours,
      
    };

    const result = await apiFetch("/api/setting/update", {
      method: "POST",
      body: { ...payload }
    });

    if (!result.ok) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาดในการบันทึกการตั้งค่า",   
         text: result.message || "กรุณาลองใหม่อีกครั้งภายหลัง",
      });
      return;

    }

    setConfig(prev => ({
      ...prev,
      waterMin,
      imageCaptureIntervalHours,
      waterMax,
    }));


    Swal.fire({
      icon: "success",
      title: "บันทึกการตั้งค่าสำเร็จ",
    });

   window.location.reload();


  } catch (error) {
    console.error("Failed to save growth settings:", error);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
      text: error.message || "กรุณาลองใหม่อีกครั้งภายหลัง",
    });
  } finally {
    setIsLoading(false);
  }
}
