import Swal from "sweetalert2";
import { apiFetch } from "@/lib/api";
import liff from "@line/liff";

export default async function handleLineRegister(setIsLoading) {
  try {
    setIsLoading(true);

    // 1. Init LIFF
    await liff.init({ 
      liffId: "2007854586-9ogoEj2j",
      withLoginOnExternalBrowser: true
    });

    if (!liff.isLoggedIn()) {
      liff.login({ scope: 'profile openid email' }); 
      return;
    }

    const accessToken = liff.getAccessToken();
    const profile = await liff.getProfile();
    
    // 3. ดึงข้อมูลจาก ID Token
    const idToken = liff.getDecodedIDToken();
    
    // ⚠️ Note: phone_number, birthdate, gender จะได้ค่าว่าง
    // ยกเว้นคุณเป็น LINE Partner ที่ได้รับอนุญาตพิเศษ
    const email = idToken?.email || ""; 
    
    // 4. เตรียม Payload
    const payload = {
      first_name: profile.displayName,
      last_name: "", // ให้ user กรอกเพิ่มทีหลัง
      email: email, 
      // ส่งค่าว่างไปก่อน เพราะดึงจาก LINE ไม่ได้ในบัญชีทั่วไป
      birthdate: "", 
      gender: "",
      phone_number: "", 
      accessToken : accessToken,
      user_id_line: profile.userId, // ควรส่ง userId ไปด้วย (หรือจะไปแกะจาก token หลังบ้านก็ได้)
      picture_url: profile.pictureUrl
    };

    // 5. ส่ง API
    // สมมติว่า apiFetch คืนค่า JSON object กลับมาเลย
    const result = await apiFetch("/api/auth/line-register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        ...payload
      }
    });
    
     if(!result.ok){
     Swal.fire({
        icon: "error",
        title: "ลงทะเบียนไม่สำเร็จ",
        text: result.message || "กรุณาลองใหม่อีกครั้งภายหลัง",
        confirmButtonText: "ตกลง"
      });
      return;
    }

    
    if (result) {
      Swal.fire({
        icon: "success",
        title: "ลงทะเบียนสำเร็จ",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        window.location.replace("/Paddy/agriculture/dashboard");
      });
    }

  } catch (error) {
    console.error("LINE REGISTER FAILED:", error);
    
    // ✅ เพิ่มการแจ้งเตือน Error ให้ User รู้ตัว
    Swal.fire({
      icon: "error",
      title: "ลงทะเบียนไม่สำเร็จ",
      text: error.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
      confirmButtonText: "ตกลง"
    });

  } finally {
    setIsLoading(false);
  }
}