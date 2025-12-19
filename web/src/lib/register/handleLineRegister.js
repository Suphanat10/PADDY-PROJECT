import Swal from "sweetalert2";
import { apiFetch } from "@/lib/api";
import liff from "@line/liff";

export default async function handleLineRegister(setIsLoading) {
  try {
    setIsLoading(true);

    // 1. เริ่มต้น LIFF
    await liff.init({ 
      liffId: "2007854586-9ogoEj2j",
      withLoginOnExternalBrowser: true
    });

    // 2. ตรวจสอบการ Login ของ LINE
    if (!liff.isLoggedIn()) {
      // ระบุ redirectUri เป็นหน้าปัจจุบัน เพื่อให้กลับมาทำงานต่อได้ถูกต้อง
      liff.login({ 
        redirectUri: window.location.href,
        scope: 'profile openid email' 
      }); 
      return;
    }

    const accessToken = liff.getAccessToken();
    const profile = await liff.getProfile();
    const idToken = liff.getDecodedIDToken();
    const email = idToken?.email || ""; 
    
    // 3. เตรียม Payload
    const payload = {
      first_name: profile.displayName,
      last_name: "", 
      email: email, 
      birthdate: "", 
      gender: "",
      phone_number: "", 
      accessToken: accessToken, 
      user_id_line: profile.userId,
      picture_url: profile.pictureUrl
    };

    // 4. ยิง API ไปที่ Backend ของคุณ
    const result = await apiFetch("/api/auth/line-register", {
      method: "POST",
      body: { ...payload }
    });
    
    // 5. ตรวจสอบ Error จาก API
    if (!result.ok) {
      throw new Error(result.message || "ลงทะเบียนไม่สำเร็จ กรุณาตรวจสอบข้อมูล");
    }

    // 6. แจ้งเตือนสำเร็จและดีดไปหน้า Dashboard
    // แนะนำให้ใช้ Swal แบบมีปุ่ม 'ตกลง' เพื่อให้ Browser มีเวลาจัดการ Cookie ให้เสร็จ
    Swal.fire({
      icon: "success",
      title: "ลงทะเบียนสำเร็จ",
      text: "ยินดีต้อนรับเข้าสู่ระบบ Smart Paddy",
      confirmButtonText: "ตกลง",
      confirmButtonColor: "#10b981", 
    }).then((res) => {
      if (res.isConfirmed || res.isDismissed) {
        // ✅ ใช้ window.location.replace เพื่อล้างค่า ?code=... ออกจาก URL
        window.location.replace("/Paddy/agriculture/dashboard");
      }
    });

  } catch (error) {
    console.error("LINE REGISTER FAILED:", error);
    
    Swal.fire({
      icon: "error",
      title: "ลงทะเบียนไม่สำเร็จ",
      text: error.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่",
      confirmButtonText: "ตกลง",
      confirmButtonColor: "#ef4444"
    });

  } finally {
    setIsLoading(false);
  }
}