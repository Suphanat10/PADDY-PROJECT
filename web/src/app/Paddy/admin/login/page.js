"use client";
import React, { useState } from "react";
import { Eye, EyeOff, CheckCircle, Sprout } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (!email || !password) {
      setErrorMsg("กรุณากรอกข้อมูลให้ครบถ้วน");
      setLoading(false);
      return;
    }

    try {
      const result = await apiFetch("/api/auth/login-admin", {
        method: "POST",
        body: { email, password }, // apiFetch จะ JSON.stringify ให้เอง
        headers: {
          "Content-Type": "application/json", // ✅ เพื่อให้ server เข้าใจว่าเป็น JSON
        },
      });

      if (!result.ok) {
        setErrorMsg(result.data?.message || "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }

      Swal.fire({
        icon: "success",
        title: "เข้าสู่ระบบสำเร็จ",
      });

      const next =
        new URLSearchParams(window.location.search).get("next") ||
        "/Paddy/admin/dashboard";
      window.location.replace(next);
    } catch (err) {
      setErrorMsg(err.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-6 text-gray-800 bg-gradient-to-b from-green-50 via-white to-green-50 animate-fade-in">
      <div className="w-full max-w-[420px] p-8 bg-white rounded-2xl shadow-xl border border-white/50 backdrop-blur-sm">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <Sprout className="w-16 h-16 text-green-600" />
        </div>

        {/* Title */}
        <h2 className="text-xl md:text-2xl font-semibold text-center text-gray-800 mb-8 leading-snug">
          ระบบบริหารจัดการข้อมูลเพื่อการเกษตรอัจฉริยะ Smart Paddy (สำหรับ Admin)
        </h2>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-600 font-medium ml-1">
              อีเมล
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder-gray-400"
              placeholder="กรอกอีเมล"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-600 font-medium ml-1">
              รหัสผ่าน
            </label>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all pr-12 placeholder-gray-400"
                placeholder="กรอกรหัสผ่าน"
              />
              <button
                type="button"
                onClick={handleTogglePassword}
                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Error Message Display */}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`mt-2 w-full py-3 px-4 rounded-lg bg-green-600 text-white font-bold shadow-md hover:bg-green-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all flex justify-center items-center h-[48px] ${
              loading ? "opacity-80 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>กำลังเข้าสู่ระบบ...</span>
              </div>
            ) : (
              "เข้าสู่ระบบ"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2024 Smart Paddy. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
