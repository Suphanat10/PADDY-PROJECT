"use client";

import { useEffect, useState } from "react";

const LIFF_ID = "2007854586-9ogoEj2j";

export default function LineLoginPage() {
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initLiff = async () => {
      if (!window.liff) {
        const script = document.createElement("script");
        script.src = "https://static.line-scdn.net/liff/edge/2/sdk.js";
        script.onload = () => init();
        document.body.appendChild(script);
      } else {
        init();
      }
    };

    const init = async () => {
      await window.liff.init({ liffId: LIFF_ID });

      // เปิดจาก LINE OA เท่านั้น
      if (!window.liff.isInClient()) {
        alert("กรุณาเปิดผ่าน LINE");
        return;
      }

      if (!window.liff.isLoggedIn()) {
        window.liff.login();
        return;
      }

      setReady(true);
      setLoading(false);
    };

    initLiff();
  }, []);

  const handleLogin = async () => {
    try {
      const accessToken = window.liff.getAccessToken();

      const res = await fetch(
        "https://smart-paddy.space/api/lineOA-login",
        {
          method: "POST",
          credentials: "include", // ⭐ สำคัญมาก (cookie)
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ accessToken }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // ปิด LIFF → กลับไปที่ LINE OA
      window.liff.closeWindow();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    }
  };

  // ⭐ auto login (ไม่ต้องกดปุ่ม)
  useEffect(() => {
    if (ready) {
      handleLogin();
    }
  }, [ready]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        กำลังเชื่อมต่อ LINE...
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-green-600">
          Smart Paddy
        </h1>

        <button
          onClick={handleLogin}
          className="w-full rounded-xl bg-green-500 py-4 text-lg font-semibold text-white transition hover:bg-green-600"
        >
          Login with LINE
        </button>

        <p className="mt-4 text-center text-sm text-gray-400">
          กำลังเข้าสู่ระบบ...
        </p>
      </div>
    </div>
  );
}
