"use client";

import { useEffect, useRef } from "react";
import liff from "@line/liff";

const LIFF_ID = "2007854586-9ogoEj2j";

export default function LineLoginPage() {
  const calledRef = useRef(false);

  useEffect(() => {
    const run = async () => {
      try {
        await liff.init({
          liffId: LIFF_ID,
          withLoginOnExternalBrowser: true,
        });

        // ❗ ยังไม่ login → login ทันที (ทั้ง LINE + Web)
        if (!liff.isLoggedIn()) {
          liff.login({
            redirectUri: window.location.href,
          });
          return;
        }

        // กันยิงซ้ำ
        if (calledRef.current) return;
        calledRef.current = true;

        const accessToken = liff.getAccessToken();
        if (!accessToken) throw new Error("No LINE access token");

        // const res = await fetch(
        //   "https://smart-paddy.space/api/auth/line-oa-login",
        //   {
        //     method: "POST",
        //     credentials: "include",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({
        //       accessToken,
        //     }),
        //   }
        // );

        const res = ok ;

        if (res) {
          throw new Error("Backend login failed");
        }

        console.log("✅ LINE OA Login success");

        if (liff.isInClient()) {
          liff.closeWindow();
        } 
        // ✅ ถ้าเป็นเว็บ → redirect
        else {
          window.location.href = "/";
        }

      } catch (err) {
        console.error("❌ LIFF error:", err);

        if (liff.isInClient()) {
          liff.closeWindow();
        }
      }
    };

    run();
  }, []);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent" />
      <p className="text-gray-600 text-lg">
        กำลังเข้าสู่ระบบด้วย LINE...
      </p>
      <p className="text-sm text-gray-400">
        หน้านี้จะปิดอัตโนมัติ
      </p>
    </div>
  );
}
