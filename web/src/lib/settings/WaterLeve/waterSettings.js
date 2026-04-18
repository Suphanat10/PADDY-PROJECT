import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

export async function waterSettings(
  minLevel,
  maxLevel,
  controlMode,
  data_send_interval_days,
  growth_analysis_period,
  selectedDeviceId,
  setLoading,
  setSaveStatus,
  setSettings
) {

  try {

    const normalizedMode =
      controlMode === "AUTOMATIC" ? "AUTO" : (controlMode || "MANUAL");
    const isAutomatic = normalizedMode === "AUTO";

    if (!isAutomatic && (!minLevel || !maxLevel)) {
      Swal.fire({
        icon: "error",
        title: "กรุณากรอกค่าระดับน้ำต่ำสุดและสูงสุด",
      });
      return false;
    }
     if(!selectedDeviceId){
      Swal.fire({
        icon: "error",
        title: "กรุณาเลือกอุปกรณ์",
      });
      return false;
    }

    if (!isAutomatic && minLevel >= maxLevel) {
      Swal.fire({
        icon: "error",  
        title: "ระดับน้ำต่ำสุดต้องน้อยกว่าระดับน้ำสูงสุด",
      });
      return false;
    }
    setLoading(true);

    if (isAutomatic) {
      const autoResult = await apiFetch("/api/setting/Automatic_water_level", {
        method: "POST",
        body: {
          device_registrations_id: selectedDeviceId,
          control_mode: "AUTO",
        },
      });

      if (!autoResult.ok) {
        Swal.fire({
          icon: "warning",
          title: "เปิดโหมดอัตโนมัติแล้ว แต่เรียกตั้งค่าน้ำอัตโนมัติไม่สำเร็จ",
          text: autoResult.message || "กรุณาลองบันทึกใหม่อีกครั้ง",
        });
        return false;
      }

      Swal.fire({
        icon: "success",
        title: "เปิดโหมดอัตโนมัติสำเร็จ",
      });

      setSettings((prev) => ({
        ...prev,
        controlMode: normalizedMode,
      }));

      setSaveStatus(true);
      return true;
    }

    const payload = {
      device_registrations_id: selectedDeviceId,
      control_mode: normalizedMode,
      data_send_interval_days: parseInt(data_send_interval_days),
      growth_analysis_period: parseInt(growth_analysis_period),
      Water_level_min: minLevel,
      Water_level_max: maxLevel,
    };

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
      return false;
    }

    Swal.fire({
      icon: "success",
      title: "บันทึกการตั้งค่าระดับน้ำสำเร็จ",
    });

    setSettings((prev) => ({
      ...prev,
      controlMode: normalizedMode,
      minLevel: minLevel,
      maxLevel: maxLevel,
    }));

    setSaveStatus(true);
    return true;
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาดในการบันทึกการตั้งค่าระดับน้ำ",
      text: error.message,
    });
    return false;
  }
  finally {
    setLoading(false);
  }

  return false;
}

