import liff from "@line/liff";
import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

let isLiffInitialized = false;

export async function ensureLiffLogin() {
  try {
    const liffId = "2007854586-9ogoEj2j";
    
    if (typeof window === 'undefined') return null;

    // 2. Initialize LIFF (ทำเพียงครั้งเดียวต่อการโหลดหน้า)
    if (!isLiffInitialized) {
      await liff.init({
        liffId: liffId,
        withLoginOnExternalBrowser: true, 
      });
      isLiffInitialized = true;
    }

    if (!liff.isLoggedIn()) {
      console.log("Redirecting to LINE Login...");
      liff.login({ 
        redirectUri: window.location.href 
      });
      return null; 
    }

    const accessToken = liff.getAccessToken();
    const profile = await liff.getProfile();

    if (!accessToken) {
      throw new Error("ไม่สามารถดึง Access Token จาก LINE ได้");
    }

    // 5. ส่งข้อมูลไปยัง Backend ของเราเพื่อสร้าง Session/Token ระบบ
    const res = await apiFetch("/api/auth/line-login", {
      method: "POST",
      body: {  
        userId: profile.userId,
        accessToken: accessToken,  
      },
    });
    if (!res.ok) {
      Swal.fire({
        icon: "error",
        title: "เชื่อมต่อระบบล้มเหลว",
        text: res.message || "บัญชี LINE นี้อาจยังไม่ได้ผูกกับระบบ",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#10b981"
      });
      return null;
    }

    return {
      systemUser: res.data.user,
    };

  } catch (error) {
    console.error("❌ LIFF Login Error:", error);

    if (error.message?.includes('code_verifier')) {
      sessionStorage.clear();
      localStorage.clear();
      window.location.reload();
      return null;
    }

    // แจ้งเตือนข้อผิดพลาดอื่นๆ
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถเริ่มต้นการเข้าสู่ระบบผ่าน LINE ได้",
      confirmButtonText: "รับทราบ"
    });
    
    return null;
  }
}