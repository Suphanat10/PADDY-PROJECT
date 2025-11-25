"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { LogIn, Eye, EyeOff, Sprout } from "lucide-react";
import Login from "@/lib/login/handleSubmit";
import handleLoginLINE from "@/lib/login/handleLineLogin";




export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
 
    const handleSubmit = (e) =>
    Login(e, username, password, setIsLoading);
    
  const handleLogin = () =>
    handleLoginLINE(setIsLoading);  

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              <Sprout className="text-white w-6 h-6" />
            </div>
          </div>

          {/* Login Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ลงชื่อเข้าใช้งาน
            </h1>
            <p className="text-gray-600">เข้าสู่ระบบเพื่อใช้งาน Smart Paddy </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                ชื่อผู้ใช้งาน
              </label>
              <input
                id="email"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="กรุณาใส่ชื่อผู้ใช้งาน"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="กรุณาใส่รหัสผ่าน"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  กำลังเข้าสู่ระบบ...
                </div>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">หรือ</span>
              </div>
            </div>

            {/* LINE Login Button */}
            <button
              type="button"
              onClick={handleLogin}
              className="w-full flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 shadow-lg"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg"
                alt="LINE"
                className="w-5 h-5 mr-3"
              />
              เข้าสู่ระบบด้วย LINE
            </button>
          </form>

          {/* Additional Links */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              ยังไม่มีบัญชีผู้ใช้?{" "}
              <Link
                href="/register"
                className="text-emerald-600 hover:text-emerald-700 font-semibold transition duration-200"
              >
                ลงทะเบียนขอใช้บริการใหม่
              </Link>
            </p>
            <Link
              href="/forgot-password"
              className="text-sm text-gray-500 hover:text-gray-700 mt-2 inline-block transition duration-200"
            >
              ลืมรหัสผ่าน?
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/90 to-emerald-900/90"></div>

        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>

        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-emerald-900 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-20 h-32 bg-emerald-400/60 rounded-t-lg"></div>
        <div className="absolute bottom-0 left-16 w-16 h-40 bg-emerald-400/70 rounded-t-lg"></div>
        <div className="absolute bottom-0 left-28 w-24 h-28 bg-emerald-400/50 rounded-t-lg"></div>
        <div className="absolute bottom-0 right-0 w-32 h-36 bg-emerald-400/60 rounded-t-lg"></div>
        <div className="absolute bottom-0 right-24 w-20 h-32 bg-emerald-400/70 rounded-t-lg"></div>
        <div className="absolute bottom-0 right-16 w-16 h-44 bg-emerald-400/50 rounded-t-lg"></div>

        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">
              ระบบ Smart Paddy
            </h2>
            <div className="w-16 h-1 bg-white/60 mb-6"></div>
          </div>

          <p className="text-lg leading-relaxed opacity-95 mb-8">
            Smart Paddy
            คือระบบเทคโนโลยีเกษตรอัจฉริยะที่ถูกออกแบบมาเพื่อเพิ่มประสิทธิภาพในการจัดการและดำเนินงานด้านเกษตรกรรม
            ระบบนี้ผสานรวมเทคโนโลยีสมัยใหม่ เช่น ระบบเซ็นเซอร์ IoT
            เพื่อช่วยให้เกษตรกรสามารถตรวจสอบและควบคุมสภาพแวดล้อมในแปลงเพาะปลูกได้อย่างแม่นยำและรวดเร็ว
          </p>

          <div className="flex space-x-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex-1">
              <h4 className="font-semibold mb-1">IoT Sensors</h4>
              <p className="text-sm opacity-80">ตรวจสอบสภาพแวดล้อม</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex-1">
              <h4 className="font-semibold mb-1">Smart Control</h4>
              <p className="text-sm opacity-80">ควบคุมอัตโนมัติ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
