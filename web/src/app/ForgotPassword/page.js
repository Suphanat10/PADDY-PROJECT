"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mail,
  Lock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Sprout,
  Info,
  Import,
} from "lucide-react";
import Link from "next/link";
import Footer from "../components/Footer";
import Swal from "sweetalert2";
import { apiFetch } from "@/lib/api";

export default function ForgotPasswordPage() {
  // --- LOGIC SECTION ---
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password, 4: Success
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // 6 digits
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  const otpInputRefs = useRef([]);

  // Timer for OTP resend
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("กรุณากรอกอีเมลให้ถูกต้อง");
      return;
    }
    setLoading(true);

    try {
      const response = await apiFetch("/api/auth/request-otp", {
        method: "POST",
        body: { email },
      });

      if (!response.ok) {
        setError(response.message || "ไม่สามารถส่งรหัส OTP ได้");
        setLoading(false);
        return;
      }
      setTimeLeft(60);
      setStep(2); // Move to OTP Verification Step
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2: Verify OTP Only ---
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("กรุณากรอกรหัส OTP ให้ครบ 6 หลัก");
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch("/api/auth/verify-otp", {
        method: "POST",
        body: { otp: otpValue },
      });
      if (!response.ok) {
        setError(response.message || "รหัส OTP ไม่ถูกต้อง");
        setLoading(false);
        return;
      }
      setStep(3);
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 3: Reset Password ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านยืนยันไม่ตรงกัน");
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: { new_password: newPassword, otp: otp.join("") },
      });
      if (!response.ok) {
        setError(response.message || "ไม่สามารถรีเซ็ตรหัสผ่านได้");
        setLoading(false);
        return;
      }
      setStep(4);
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Move to prev input on Backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col ">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/" className="flex items-center group">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mr-3 shadow-md group-hover:shadow-lg transition-all">
                  <Sprout className="text-white w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-gray-900 font-bold text-lg leading-tight tracking-tight">
                    Paddy Smart
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">
                    Agriculture IoT
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-grow flex items-start justify-center pt-12 sm:pt-20 px-4 pb-12">
        <div className="w-full max-w-2xl">
          {/* Form Container */}
          <div className="bg-white p-8 sm:p-10 shadow-xl shadow-emerald-900/5 rounded-2xl border border-gray-100 relative">
            {/* --- Step 1: Input Email --- */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ลืมรหัสผ่าน
                </h2>
                <p className="text-gray-500 mb-8 font-light">
                  กรอกข้อมูลส่วนตัวที่ได้ลงทะเบียนไว้เพื่อทำการตั้งรหัสผ่านใหม่
                </p>

                <form
                  onSubmit={handleSendOtp}
                  className="space-y-6 max-w-md mx-auto sm:mx-0"
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-bold text-gray-700 mb-2"
                    >
                      อีเมล หรือ เบอร์โทรศัพท์มือถือ{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                      placeholder="ระบุอีเมลของคุณ"
                    />
                  </div>

                  {/* Info Box - Changed to emerald/green theme */}
                  <div className="flex items-start gap-3 bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                    <Info className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-emerald-800">
                      กรุณากรอกอีเมลหรือเบอร์โทรศัพท์ที่คุณใช้ลงทะเบียนไว้กับระบบ
                      เพื่อที่เราจะได้ส่งรหัส OTP
                      สำหรับการตั้งรหัสผ่านใหม่ให้กับคุณ
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 animate-in shake">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="pt-4">
                    {/* Button - Changed to emerald/green theme */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto px-8 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-all shadow-md shadow-emerald-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:translate-y-[-1px]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4" />{" "}
                          กำลังตรวจสอบ...
                        </>
                      ) : (
                        "ถัดไป"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* --- Step 2: Verify OTP Only --- */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="text-center mb-8">
                  {/* Icon - Changed to emerald theme */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-4 ring-8 ring-emerald-50/50">
                    <ShieldCheck className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    ยืนยันตัวตน
                  </h2>
                  <p className="text-gray-500 font-light">
                    กรอกรหัส OTP ที่ส่งไปยัง{" "}
                    <span className="font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                      {email}
                    </span>
                  </p>
                  {/* Link - Changed to emerald theme */}
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm text-emerald-600 hover:text-emerald-800 font-medium mt-3 flex items-center justify-center gap-1 mx-auto transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" /> แก้ไขอีเมล
                  </button>
                </div>

                <form
                  onSubmit={handleVerifyOtp}
                  className="space-y-8 max-w-md mx-auto"
                >
                  {/* OTP Section - Changed focus ring to emerald */}
                  <div className="bg-gray-50/80 p-8 rounded-2xl border border-gray-100">
                    <div className="flex justify-center gap-2 sm:gap-3">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (otpInputRefs.current[idx] = el)}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none bg-white shadow-sm transition-all"
                        />
                      ))}
                    </div>
                    <div className="text-center mt-6">
                      {/* Resend Link - Changed to emerald theme */}
                      <button
                        type="button"
                        disabled={timeLeft > 0}
                        onClick={() => {
                          setTimeLeft(60);
                          setError("");
                            handleSendOtp(new Event("submit"));
                        }}
                        className={`text-sm ${
                          timeLeft > 0
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-emerald-600 hover:text-emerald-800 font-semibold"
                        }`}
                      >
                        {timeLeft > 0
                          ? `ขอรหัสใหม่ได้ใน ${timeLeft} วินาที`
                          : "ขอรหัส OTP ใหม่"}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center justify-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 animate-in shake">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  <div className="flex justify-center gap-4 pt-2">
                    {/* Buttons - Changed to emerald theme */}
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-3 border border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      ย้อนกลับ
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-all shadow-md shadow-emerald-900/20 disabled:opacity-70 flex items-center gap-2 min-w-[160px] justify-center hover:translate-y-[-1px]"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : (
                        "ยืนยันรหัส OTP"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* --- Step 3: Reset Password --- */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="text-center mb-8">
                  {/* Icon - Changed to emerald theme */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-4 ring-8 ring-emerald-50/50">
                    <KeyRound className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    ตั้งรหัสผ่านใหม่
                  </h2>
                  <p className="text-gray-500 font-light">
                    กรุณาระบุรหัสผ่านใหม่เพื่อใช้ในการเข้าสู่ระบบครั้งต่อไป
                  </p>
                </div>

                <form
                  onSubmit={handleResetPassword}
                  className="space-y-6 max-w-md mx-auto"
                >
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        รหัสผ่านใหม่
                      </label>
                      <div className="relative group">
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                          placeholder="ระบุรหัสผ่านใหม่ (6 ตัวอักษรขึ้นไป)"
                        />
                        <Lock className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        ยืนยันรหัสผ่านใหม่
                      </label>
                      <div className="relative group">
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                          placeholder="ระบุรหัสผ่านใหม่อีกครั้ง"
                        />
                        <ShieldCheck className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 animate-in shake">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="pt-4">
                    {/* Button - Changed to emerald theme */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-all shadow-md shadow-emerald-900/20 disabled:opacity-70 flex items-center justify-center gap-2 hover:translate-y-[-1px]"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : (
                        "ยืนยันและเปลี่ยนรหัสผ่าน"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* --- Step 4: Success --- */}
            {step === 4 && (
              <div className="text-center animate-in fade-in zoom-in duration-500 py-10">
                {/* Icon - Changed to emerald theme */}
                <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-emerald-50 mb-6 ring-8 ring-emerald-50/50">
                  <CheckCircle className="h-16 w-16 text-emerald-500 drop-shadow-sm" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  เปลี่ยนรหัสผ่านสำเร็จ!
                </h2>
                <p className="text-gray-500 mb-10 text-lg">
                  คุณสามารถใช้รหัสผ่านใหม่เพื่อเข้าสู่ระบบได้ทันที
                </p>

                {/* Button - Changed to emerald theme */}
                <a
                  href="/auth/login"
                  className="inline-block px-10 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-all shadow-md shadow-emerald-900/20 hover:translate-y-[-2px]"
                >
                  กลับไปหน้าเข้าสู่ระบบ
                </a>
              </div>
            )}
          </div>

          {/* Back to Login (Global) - Changed to emerald theme */}
          {step !== 4 && (
            <div className="mt-8 text-center">
              <a
                href="/"
                className="text-gray-500 hover:text-emerald-600 text-sm font-medium flex items-center justify-center gap-2 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />{" "}
                ยกเลิกรายการ
              </a>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
