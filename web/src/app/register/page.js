"use client";

import { useState , useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, Sprout, FileText } from "lucide-react";
import Swal from "sweetalert2";
import AlertBox from "../components/AlertBox";

import handleInputChangeFn from "@/lib/register/handleInputChange";
import handleSubmitFn from "@/lib/register/handleSubmit";
import handleLineRegisterFn from "@/lib/register/handleLineRegister";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    gender: "",
    date_of_birth: "",
    user_id_line: "",
    termsAccepted: false,
    dataProcessingConsent: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("code")) {
    handleLineRegister(setIsLoading);
  }
}, []);




  const handleInputChange = (e) => handleInputChangeFn(e, setFormData);

  const handleSubmit = (e) =>
    handleSubmitFn(e, formData, setAlert, setIsLoading);

  const handleLineRegister = () => handleLineRegisterFn(setIsLoading);

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

      {/* Left Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="ชื่อจริง"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="นามสกุล"
                />
              </div>
            </div>

                        <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  เพศ 
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="">เลือกเพศ</option>
                  <option value="male">ชาย</option>
                  <option value="female">หญิง</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                วันเกิด 
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>


            {/* เบอร์โทร */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                เบอร์โทรศัพท์ *
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="0xx-xxx-xxxx"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                อีเมล
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="example@mail.com"
              />
            </div>

            {/* Password + Confirm */}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="รหัสผ่าน"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="ยืนยันรหัสผ่าน"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center bg-emerald-600 text-white py-3 rounded-lg"
            >
              {isLoading ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
            </button>

            {/* Divider */}
            <div className="text-center text-gray-500 my-4">หรือ</div>

            {/* ลงทะเบียนด้วย LINE */}
            <button
              type="button"
              onClick={handleLineRegister}
              className="w-full flex justify-center items-center bg-green-500 text-white py-3 rounded-lg"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg"
                className="w-5 h-5 mr-3"
              />
              ลงทะเบียนด้วย LINE
            </button>
          </form>

          {/* Go to Login */}
          <div className="mt-8 text-center">
            <p className="text-sm">
              มีบัญชีแล้ว?{" "}
              <Link href="/" className="text-emerald-600 font-semibold">
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ขวา */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/90 to-emerald-900/90"></div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-emerald-900 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-20 h-32 bg-emerald-400/60 rounded-t-lg"></div>
        <div className="absolute bottom-0 left-16 w-16 h-40 bg-emerald-400/70 rounded-t-lg"></div>{" "}
        <div className="absolute bottom-0 left-28 w-24 h-28 bg-emerald-400/50 rounded-t-lg"></div>
        <div className="absolute bottom-0 right-0 w-32 h-36 bg-emerald-400/60 rounded-t-lg"></div>
        <div className="absolute bottom-0 right-24 w-20 h-32 bg-emerald-400/70 rounded-t-lg"></div>
        <div className="absolute bottom-0 right-16 w-16 h-44 bg-emerald-400/50 rounded-t-lg"></div>
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          {" "}
          <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">
            ระบบ Smart Paddy
          </h2>
          <div className="w-16 h-1 bg-white/60 mb-6"></div>
          <p className="text-lg leading-relaxed opacity-95 mb-8">
            Smart Paddy คือระบบเทคโนโลยีเกษตรอัจฉริยะที่ถูกออกแบบมาเพื่อเพิ่มประสิทธิภาพในการจัดการและดำเนินงานด้านเกษตรกรรม ระบบนี้ผสานรวมเทคโนโลยีสมัยใหม่ เช่น ระบบเซ็นเซอร์ IoT เพื่อช่วยให้เกษตรกรสามารถตรวจสอบและควบคุมสภาพแวดล้อมในแปลงเพาะปลูกได้อย่างแม่นยำและรวดเร็ว
          </p>
        </div>
      </div>
    </div>
  );
}
