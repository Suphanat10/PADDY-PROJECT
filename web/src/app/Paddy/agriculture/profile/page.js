"use client";
import React, { useState } from "react";
import { useEffect } from "react";
import {
  Pencil,
  User,
  Phone,
  Mail,
  Save,
  X,
  Eye,
  EyeOff,
  Lock,
  MessageCircle,
  CheckCircle,
} from "lucide-react";
import AlertBox from "@/app/components/AlertBox";
import Header from "../components/Header";
import { changePassword } from "@/lib/user/changePassword";
import { updateProfile } from "@/lib/user/updateProfile";
import { fetchUser } from "@/lib/user/fetchUser";
import Footer from "@/app/components/Footer";
import { toggleLine } from "@/lib/user/toggleLine";

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLineConnected, setIsLineConnected] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    birth_date: "",
    gender: "",
    phone_number: "",
    email: "",
    position: "",
    address: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      await fetchUser(setIsLoading, setFormData, setIsLineConnected);
    }
    loadProfile();
  }, []);

  const formatThaiDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile(e, formData, setIsLoading, setIsEditing);
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    changePassword(
      e,
      passwordForm,
      setPasswordForm,
      setIsChangingPassword,
      showAlert
    );
  };

  const toggleLineConnection = () => {
    if (isLineConnected) {
      if (confirm("ต้องการยกเลิกการเชื่อมต่อ LINE หรือไม่?")) {
        setIsLineConnected(false);
      }
    } else {
      setIsLineConnected(true);
      alert("เชื่อมต่อบัญชี LINE สำเร็จ");
    }
  };

  const [alertData, setAlertData] = useState(null);

  function showAlert(title, message, type) {
    setAlertData({ title, message, type });
  }

  const Avatar = ({ editable = false, firstName = "", lastName = "" }) => {
    // ฟังก์ชันสร้างตัวอักษรย่อ
    const getInitials = () => {
      const f = firstName?.trim();
      const l = lastName?.trim();

      if (!f && !l) return "?";
      if (!l) return f[0]?.toUpperCase();
      return (f[0] + l[0]).toUpperCase();
    };

    return (
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-green-500 text-white border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
            <span className="text-4xl font-bold select-none">
              {getInitials()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const ViewMode = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
        <div className="p-6">
          <Avatar
            firstName={formData.first_name}
            lastName={formData.last_name}
          />

          <div className="flex justify-between items-center border-b pb-4 mb-6">
            <h3 className="text-lg font-bold text-gray-800">ข้อมูลทั่วไป</h3>
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
            >
              <Pencil size={14} /> แก้ไข
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 font-medium">
                ชื่อ - นามสกุล
              </span>
              <span className="text-gray-900 mt-1 font-medium text-lg">
                {" "}
                {formData.first_name} {formData.last_name}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500 font-medium">
                ตำแหน่ง (Position)
              </span>
              <span className="text-gray-900 mt-1">
                {formData.position || "-"}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500 font-medium">
                วัน เดือน ปีเกิด
              </span>
              <span className="text-gray-900 mt-1">
                {formatThaiDate(formData.birth_date)}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500 font-medium">
                เบอร์โทรศัพท์มือถือ
              </span>
              <span className="text-gray-900 mt-1 flex items-center gap-2">
                <Phone size={14} className="text-gray-400" />
                {formData.phone_number}
              </span>
            </div>

            <div className="col-span-1 md:col-span-2 flex flex-col">
              <span className="text-sm text-gray-500 font-medium">อีเมล</span>
              <span className="text-gray-900 mt-1 flex items-center gap-2">
                <Mail size={14} className="text-gray-400" />
                {formData.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2 flex items-center gap-2">
            <Lock size={20} className="text-gray-600" />
            ความปลอดภัยและการเชื่อมต่อ
          </h3>

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="font-semibold text-gray-800">รหัสผ่าน</p>
                <p className="text-sm text-gray-500">
                  เปลี่ยนรหัสผ่านเพื่อความปลอดภัยของบัญชี
                </p>
              </div>
              <button
                onClick={() => setIsChangingPassword(true)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                เปลี่ยนรหัสผ่าน
              </button>
            </div>

            <hr className="border-gray-100" />

            {/* ส่วน LINE Connection */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isLineConnected ? "bg-[#06C755]" : "bg-gray-200"
                  }`}
                >
                  <MessageCircle
                    color="white"
                    fill={isLineConnected ? "white" : "none"}
                    size={24}
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 flex items-center gap-2">
                    บัญชี LINE
                    {isLineConnected && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        เชื่อมต่อแล้ว
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    {isLineConnected
                      ? "บัญชีของคุณเชื่อมต่อกับ LINE แล้ว"
                      : "เชื่อมต่อกับ LINE เพื่อรับการแจ้งเตือน"}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleLineConnection}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isLineConnected
                    ? "border border-red-200 text-red-600 hover:bg-red-50"
                    : "bg-[#06C755] text-white hover:bg-[#05b64d]"
                }`}
              >
                {isLineConnected ? "ยกเลิกการเชื่อมต่อ" : "เชื่อมต่อ LINE"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const EditMode = () => (
    <form
      onSubmit={handleSaveProfile}
      className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100 animate-fadeIn"
    >
      <div className="p-6">
        <div className="mb-6 border-b pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              แก้ไขข้อมูลส่วนตัว
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              กรุณากรอกข้อมูลให้เป็นปัจจุบัน
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <Avatar editable={true} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                เพศ <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-green-600 outline-none"
              >
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                ชื่อ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2.5 text-gray-900 focus:ring-2 focus:ring-green-600 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2.5 text-gray-900 focus:ring-2 focus:ring-green-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              ตำแหน่ง (Position)
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              disabled={true}
              className="w-full rounded-md border border-gray-300 p-2.5 text-gray-900 
        focus:ring-2 focus:ring-blue-500 outline-none
        disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              เบอร์โทรศัพท์มือถือ
            </label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2.5 text-gray-900 focus:ring-2 focus:ring-green-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              อีเมล
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2.5 text-gray-900 focus:ring-2 focus:ring-green-600 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-6 py-2.5 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 shadow-sm transition-colors flex items-center gap-2"
          >
            <Save size={18} />
            บันทึกการเปลี่ยนแปลง
          </button>
        </div>
      </div>
    </form>
  );

  // ส่วนเปลี่ยนรหัสผ่าน (แยกออกมา)
  const ChangePasswordMode = () => (
    <>
      <form
        onSubmit={handleSavePassword}
        className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100 animate-fadeIn"
      >
        <div className="p-6">
          <div className="mb-6 border-b pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                เปลี่ยนรหัสผ่าน
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                กำหนดรหัสผ่านใหม่เพื่อความปลอดภัย
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsChangingPassword(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4 max-w-lg mx-auto">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                รหัสผ่านปัจจุบัน
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full rounded-md border border-gray-300 p-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                รหัสผ่านใหม่
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full rounded-md border border-gray-300 p-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                ยืนยันรหัสผ่านใหม่
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full rounded-md border border-gray-300 p-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsChangingPassword(false)}
              className="px-6 py-2.5 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 shadow-sm transition-colors flex items-center gap-2"
            >
              <CheckCircle size={18} />
              ยืนยันเปลี่ยนรหัสผ่าน
            </button>
          </div>
        </div>
      </form>

      {alertData && (
        <AlertBox
          title={alertData.title}
          message={alertData.message}
          type={alertData.type}
        />
      )}
    </>
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 p-4  text-gray-900">
        <div className="max-w-4xl mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ข้อมูลส่วนตัว
            </h1>
            <p className="text-gray-500">
              จัดการข้อมูลส่วนตัวและความเป็นส่วนตัว
            </p>
          </div>

          {/* Conditional Rendering */}
          {isEditing ? (
            <EditMode />
          ) : isChangingPassword ? (
            <ChangePasswordMode />
          ) : (
            <ViewMode />
          )}
        </div>
        <Footer />
      </div>
    </>
  );
}
