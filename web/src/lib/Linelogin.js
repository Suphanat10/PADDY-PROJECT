import liff from "@line/liff";
import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

export async function ensureLiffLogin() {
  try {
    const liffId = "2007854586-9ogoEj2j";
    if (!liffId) {
      throw new Error("LIFF ID is missing in environment variables");
    }

    await liff.init({
      liffId: liffId,
      withLoginOnExternalBrowser: true, 
    });

    if (!liff.isLoggedIn()) {
      liff.login();
      return null; 
    }

    const accessToken = liff.getAccessToken();
    const profile = await liff.getProfile();

    if (!accessToken) {
      throw new Error("Failed to get access token");
    }


    const res = await apiFetch("/api/auth/line-login", {
      method: "POST",
      body: {  
        userId: profile.userId,
        accessToken: accessToken,  
      },
    });

    if(!res.ok){
     Swal.fire({
        icon: "error",
        title: "เข้าสู่ระบบไม่สำเร็จ",
        text: res.message || "กรุณาลองใหม่อีกครั้งภายหลัง",
        confirmButtonText: "ตกลง"
      });
      
    }

    return {
      lineToken: accessToken, 
      user: res.user,         
      profile: profile,       
    };

  } catch (error) {
    console.error("LIFF Login Error:", error);
    throw error;
  }
}