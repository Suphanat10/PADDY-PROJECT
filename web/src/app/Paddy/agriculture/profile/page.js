"use client";
import React, { useState, useEffect } from "react";
import {
  Pencil, Phone, Mail, Save, X, Eye, EyeOff, Lock,
  MessageCircle, CheckCircle, Loader2, Calendar, User as UserIcon
} from "lucide-react";
import AlertBox from "@/app/components/AlertBox";
import Header from "../components/Header";
import Footer from "@/app/components/Footer";
import { changePassword } from "@/lib/user/changePassword";
import { updateProfile } from "@/lib/user/updateProfile";
import { fetchUser } from "@/lib/user/fetchUser";
import { toggleLine } from "@/lib/user/toggleLine";
import Swal from "sweetalert2";
import { apiFetch } from "@/lib/api";



export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLineConnected, setIsLineConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true); // สำหรับโหลดหน้าแรก
  const [isSubmitting, setIsSubmitting] = useState(false); // สำหรับตอนบันทึกข้อมูล
  const [alertData, setAlertData] = useState(null);

  const [formData, setFormData] = useState({
    first_name: "", last_name: "", birth_date: "", gender: "",
    phone_number: "", email: "", position: "", address: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // --- Load Data ---
  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      try {
        await fetchUser(setIsLoading, setFormData, setIsLineConnected);
      } finally {
        setTimeout(() => setIsLoading(false), 500);
      }
    }
    loadProfile();
  }, []);

  const formatThaiDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      day: "numeric", month: "short", year: "numeric",
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

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await updateProfile(e, formData, setIsSubmitting, setIsEditing);
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
       Swal.fire({
         icon: "warning",
         title: "รหัสผ่านไม่ตรงกัน",
         text: "กรุณาตรวจสอบรหัสผ่านใหม่อีกครั้ง",
       });  
      return;
    }
    setIsSubmitting(true);
    await changePassword(e, passwordForm, setPasswordForm, setIsChangingPassword, showAlert);
    setIsSubmitting(false);
  };


  function showAlert(title, message, type) {
    setAlertData({ title, message, type });
    setTimeout(() => setAlertData(null), 3000);
  }

  const Avatar = ({ firstName = "", lastName = "" }) => {
    const getInitials = () => {
      const f = firstName?.trim()?.[0] || "";
      const l = lastName?.trim()?.[0] || "";
      return (f + l).toUpperCase() || "?";
    };
    return (
      <div className="flex flex-col items-center mb-8">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-600 text-white border-4 border-white shadow-xl flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
            <span className="text-5xl font-bold select-none tracking-tighter">
              {getInitials()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // --- 1. หน้าจอ Loading ตอนดึงข้อมูล ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
            <UserIcon className="absolute text-emerald-600" size={24} />
          </div>
          <p className="mt-4 text-gray-500 font-medium animate-pulse">กำลังโหลดข้อมูลโปรไฟล์...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const ViewMode = () => (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100 p-8">
        <Avatar firstName={formData.first_name} lastName={formData.last_name} />
        
        <div className="flex justify-between items-center border-b border-gray-50 pb-4 mb-8">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
             <UserIcon size={20} className="text-emerald-500" /> ข้อมูลทั่วไป
          </h3>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-sm font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
          >
            <Pencil size={14} /> แก้ไขข้อมูล
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
          {[
            { label: "ชื่อ - นามสกุล", value: `${formData.first_name} ${formData.last_name}`, bold: true },
            { label: "ตำแหน่ง (Position)", value: formData.position || "-" },
            { label: "วัน เดือน ปีเกิด", value: formatThaiDate(formData.birth_date), icon: <Calendar size={14}/> },
            { label: "เบอร์โทรศัพท์มือถือ", value: formData.phone_number, icon: <Phone size={14}/> },
            { label: "อีเมล", value: formData.email, icon: <Mail size={14}/>, full: true }
          ].map((item, idx) => (
            <div key={idx} className={`flex flex-col ${item.full ? "md:col-span-2" : ""}`}>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{item.label}</span>
              <span className={`mt-1.5 flex items-center gap-2 ${item.bold ? "text-xl font-bold text-gray-900" : "text-gray-700 font-medium"}`}>
                {item.icon && <span className="text-gray-300">{item.icon}</span>}
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-8">
        <h3 className="text-lg font-bold text-gray-800 mb-8 border-b border-gray-50 pb-4 flex items-center gap-2">
          <Lock size={20} className="text-gray-400" /> ความปลอดภัยและการเชื่อมต่อ
        </h3>

        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="font-bold text-gray-800">รหัสผ่านบัญชี</p>
              <p className="text-sm text-gray-500">แนะนำให้เปลี่ยนรหัสผ่านทุกๆ 3 เดือนเพื่อความปลอดภัย</p>
            </div>
            <button
              onClick={() => setIsChangingPassword(true)}
              className="px-5 py-2 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all active:scale-95"
            >
              เปลี่ยนรหัสผ่าน
            </button>
          </div>
</div>
</div>
          
      
    </div>
  );

  const EditMode = () => (
    <form onSubmit={handleSaveProfile} className="bg-white shadow-sm rounded-2xl border border-gray-100 p-8 animate-in zoom-in-95 duration-300">
      <div className="mb-8 border-b border-gray-50 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">แก้ไขข้อมูลส่วนตัว</h2>
          <p className="text-gray-400 text-sm">ข้อมูลนี้จะถูกนำไปใช้ในรายงานและหน้าแดชบอร์ด</p>
        </div>
        <button type="button" onClick={() => setIsEditing(false)} className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-full transition-colors">
          <X size={24} />
        </button>
      </div>

      <Avatar firstName={formData.first_name} lastName={formData.last_name} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อ <span className="text-red-500">*</span></label>
            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full rounded-xl border border-gray-200 p-3.5 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">นามสกุล <span className="text-red-500">*</span></label>
            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full rounded-xl border border-gray-200 p-3.5 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">ตำแหน่ง (Position)</label>
          <input type="text" name="position" value={formData.position} disabled className="w-full rounded-xl border border-gray-100 p-3.5 bg-gray-50 text-gray-400 cursor-not-allowed" />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">เบอร์โทรศัพท์มือถือ</label>
          <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full rounded-xl border border-gray-200 p-3.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-2">อีเมล</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-xl border border-gray-200 p-3.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 mt-12 pt-8 border-t border-gray-50">
        <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all">
          ยกเลิก
        </button>
        <button type="submit" disabled={isSubmitting} className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
          {isSubmitting ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
        </button>
      </div>
    </form>
  );

  const ChangePasswordMode = () => (
    <form onSubmit={handleSavePassword} className="bg-white shadow-sm rounded-2xl border border-gray-100 p-8 animate-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8 border-b border-gray-50 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">เปลี่ยนรหัสผ่าน</h2>
          <p className="text-gray-400 text-sm">กรุณาใช้รหัสผ่านที่คาดเดายากเพื่อความปลอดภัย</p>
        </div>
        <button type="button" onClick={() => setIsChangingPassword(false)} className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-full transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="space-y-6 max-w-md mx-auto py-4">
        {[
          { label: "รหัสผ่านปัจจุบัน", name: "currentPassword" },
          { label: "รหัสผ่านใหม่", name: "newPassword" },
          { label: "ยืนยันรหัสผ่านใหม่", name: "confirmPassword" }
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-bold text-gray-700 mb-2">{field.label}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name={field.name}
                value={passwordForm[field.name]}
                onChange={handlePasswordChange}
                className="w-full rounded-xl border border-gray-200 p-3.5 pr-12 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              />
              {field.name === "confirmPassword" && (
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 pt-8 border-t border-gray-50">
        <button type="button" onClick={() => setIsChangingPassword(false)} className="w-full sm:w-auto px-10 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50">
          ยกเลิก
        </button>
        <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-10 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-70">
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle size={20} />}
          {isSubmitting ? "กำลังประมวลผล..." : "ยืนยันเปลี่ยนรหัสผ่าน"}
        </button>
      </div>
    </form>
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 text-center sm:text-left">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">ข้อมูลส่วนตัว</h1>
            <p className="text-gray-500 mt-2 text-lg font-medium">จัดการความปลอดภัยและข้อมูลส่วนตัวของคุณในที่เดียว</p>
          </div>

          {isEditing ? <EditMode /> : isChangingPassword ? <ChangePasswordMode /> : <ViewMode />}
        </div>
        
        {alertData && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10">
            <AlertBox {...alertData} />
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}