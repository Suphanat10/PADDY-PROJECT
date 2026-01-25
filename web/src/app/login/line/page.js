"use client";

import { useEffect, useRef } from "react";
import liff from "@line/liff";

const LIFF_ID = "2007854586-9ogoEj2j";

export default function LineLoginPage() {
  const calledRef = useRef(false);

  useEffect(() => {
    const run = async () => {
      try {
        await liff.init({ liffId: LIFF_ID });

        // ❌ ถ้าไม่เปิดผ่าน LINE → ไม่ต้องทำอะไร
        if (!liff.isInClient()) return;

        // 🔁 ถ้ายังไม่ login → เด้ง login LINE
        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        // 🔒 กันยิงซ้ำ
        if (calledRef.current) return;
        calledRef.current = true;

        const accessToken = liff.getAccessToken();

        const res = await fetch(
          "https://smart-paddy.space/api/auth/line-oa-login",
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken }),
          }
        );

        if (res.ok) {
          liff.closeWindow();
        }
      } catch (err) {
        console.error(err);
        liff.closeWindow(); // error ก็ปิดไปเลย
      }
    };

    run();
  }, []);

  // 👉 ไม่ render อะไรทั้งนั้น
  return null;
}
