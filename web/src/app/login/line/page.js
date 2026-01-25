"use client";

import { useEffect, useState } from "react";
import liff from "@line/liff";

const LIFF_ID = "2007854586-9ogoEj2j";

export default function LineLoginPage() {
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: LIFF_ID });

        if (!liff.isInClient()) {
          alert("กรุณาเปิดผ่าน LINE OA");
          setLoading(false); // ⭐ สำคัญมาก
          return;
        }

        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        setReady(true);
        setLoading(false);
      } catch (err) {
        console.error("LIFF error:", err);
        alert("เชื่อมต่อ LINE ไม่สำเร็จ");
        setLoading(false);
      }
    };

    initLiff();
  }, []);

  const handleLogin = async () => {
    try {
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

      if (!res.ok) {
        alert("Login failed");
        return;
      }

      liff.closeWindow();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    }
  };

  // auto login
  useEffect(() => {
    if (ready) handleLogin();
  }, [ready]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        กำลังเชื่อมต่อ LINE...
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <button
        onClick={handleLogin}
        className="rounded bg-green-500 px-6 py-3 text-white"
      >
        Login with LINE
      </button>
    </div>
  );
}
