import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

export default async function reghandleSubmit(
  device_code,
  area_id,
  setIsLoading ,
  setData,
  setCurrentStep
) {
  try {
    if (!device_code || !area_id) {
      Swal.fire({
        icon: "error",
        title: "กรุณากรอกชื่ออุปกรณ์และเลือกฟาร์ม",
      });
      return;
    }

    setIsLoading(true);

    const payload = {
      device_code,
      area_id,
    };

    const result = await apiFetch("/api/register-device", {
      method: "POST",
      body: {
        ...payload,
      },
    });

    if (!result.ok) {
      if (result.status === 400) {
        Swal.fire({
          icon: "warning",
          title: "ลงทะเบียนอุปกรณ์ไม่สำเร็จ",
          text: result.message,
        });
        return;
      } else if (result.status === 404) {
        Swal.fire({
          icon: "error",
          title: "ลงทะเบียนอุปกรณ์ไม่สำเร็จ",
          text: result.message,
        });
        return;
      }else {
        Swal.fire({
          icon: "error",
          title: "ลงทะเบียนอุปกรณ์ไม่สำเร็จ",
          text: result.message || "Registration failed",
        });
        return;
      }
    }

    setIsLoading(false);
    if (result.ok) {
      await Swal.fire({
        icon: "success",
        title: "ลงทะเบียนอุปกรณ์สำเร็จ",
        text: result.message || "อุปกรณ์ถูกลงทะเบียนแล้ว",
      });

    }
    // setData({
    //   device_code: device_code, 
    //   plot_name: result.data.deviceRegistration.plot_name,
    //   farm_name: result.data.deviceRegistration.farm_name,
    //   });
    setCurrentStep(3);
   
     
  } catch (err) {
    console.error("Device registration error:", err);

    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
    });
  } finally {
    setIsLoading(false); // ✅ ใช้ตัวนี้ ไม่ใช่ setIsSubmitting
  }
}
