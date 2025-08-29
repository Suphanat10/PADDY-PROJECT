"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Eye, EyeOff, Sprout, FileText } from "lucide-react";
import liff from "@line/liff";
import Swal from "sweetalert2";
import AlertBox from "../components/AlertBox";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    username: "",
    password: "",
    confirmPassword: "",
    user_id_line: "",
    termsAccepted: false,
    dataProcessingConsent: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const phoneRegex = /^[0-9]{10}$/;

      if (
        !formData.first_name ||
        !formData.phone_number ||
        !formData.username ||
        !formData.password
      ) {
        setAlert({
          title: "ข้อมูลไม่ครบถ้วน",
          message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน",
          type: "warning",
        });
        return;
      }

      if (!phoneRegex.test(formData.phone_number)) {
        setAlert({
          title: "หมายเลขโทรศัพท์ไม่ถูกต้อง",
          message: "กรุณากรอกหมายเลขโทรศัพท์ 10 หลักให้ถูกต้อง",
          type: "warning",
        });
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setAlert({
          title: "รหัสผ่านไม่ตรงกัน",
          message: "กรุณาตรวจสอบรหัสผ่านอีกครั้ง",
          type: "warning",
        });
        return;
      }

      if (formData.password.length < 8) {
        setAlert({
          title: "รหัสผ่านไม่ถูกต้อง",
          message: "กรุณากรอกรหัสผ่านที่มีความยาวอย่างน้อย 8 ตัวอักษร",
          type: "warning",
        });
        return;
      }

      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name || "",
        phone_number: formData.phone_number,
        username: formData.username,
        password: formData.password,
        user_id_line: formData.user_id_line || null,
      };

      const response = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response.success === true) {
        Swal.fire({ icon: "success", title: "ลงทะเบียนสำเร็จ" }).then(() => {
          window.location.replace("/");
        });
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLineRegister = async () => {
    try {
      await liff.init({ liffId: "2007854586-9ogoEj2j" });
      if (!liff.isLoggedIn()) {
        liff.login();
        return;
      }
      const profile = await liff.getProfile();

      const payload = {
        first_name: profile.displayName,
        last_name: "",
        phone_number: "",
        username: `line_${profile.displayName}`,
        password: " ",
        user_id_line: profile.userId,
      };

      const response = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response.ok || response.success) {
        Swal.fire({ icon: "success", title: "ลงทะเบียนด้วย LINE สำเร็จ" }).then(
          () => {
            window.location.replace("/");
          }
        );
      } else {
        throw new Error("LINE Registration failed");
      }
    } catch (error) {
      console.error("Error connecting to LINE:", error);
      Swal.fire({
        icon: "error",
        title: "เชื่อมต่อ LINE ไม่สำเร็จ",
        text: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {alert && (
        <AlertBox
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              <Sprout className="text-white w-6 h-6" />
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ลงทะเบียน</h1>
            <p className="text-gray-600">สมัครสมาชิกเพื่อใช้งาน Smart Paddy</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ชื่อ *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="ชื่อจริง"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  นามสกุล
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="นามสกุล"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                เบอร์โทรศัพท์ *
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="0xx-xxx-xxxx"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ชื่อผู้ใช้งาน *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                pattern="[a-zA-Z0-9]{3,20}"
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="username"
                required
              />
            </div>

            {/* Password + Confirm Password */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  รหัสผ่าน *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="รหัสผ่าน"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ยืนยันรหัสผ่าน *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="ยืนยันรหัสผ่าน"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ปุ่มสมัคร */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 px-6 rounded-lg font-semibold shadow-md hover:from-emerald-700 hover:to-emerald-800 transition duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  กำลังลงทะเบียน...
                </div>
              ) : (
                <>
                  <FileText className="w-5 h-5 mr-2" /> ลงทะเบียน
                </>
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

            {/* ปุ่มลงทะเบียนด้วย LINE */}
            <button
              type="button"
              onClick={handleLineRegister}
              className="w-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-semibold shadow-md transition duration-200"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg"
                alt="LINE"
                className="w-5 h-5 mr-3"
              />
              ลงทะเบียนด้วย LINE
            </button>
          </form>

          {/* Link ไปหน้า Login */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              มีบัญชีแล้ว?{" "}
              <Link
                href="/"
                className="text-emerald-600 hover:text-emerald-700 font-semibold transition duration-200"
              >
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side */}

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
          <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">
            ระบบ Smart Paddy
          </h2>
          <div className="w-16 h-1 bg-white/60 mb-6"></div>
          <p className="text-lg leading-relaxed opacity-95 mb-8">
            สมัครสมาชิก Smart Paddy วันนี้ เพื่อเข้าถึงเทคโนโลยีเกษตรอัจฉริยะ
          </p>
        </div>
      </div>
    </div>
  );
}
