"use client";
import { useState } from "react";
import {
  X,
  Save,
  Plus,
  Edit,
  Trash2,
  Settings,
  Loader2,
  Tractor,
  LayoutGrid,
  User,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  KeyRound,
  Sparkles,
} from "lucide-react";

// Form Input Component - Matches design with icon container
const FormInput = ({
  label,
  required,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
  icon: Icon,
  className = "",
}) => (
  <div className={`${className}`}>
    <label className="block text-sm font-medium text-slate-600 mb-2">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className={`flex items-center border rounded-xl overflow-hidden transition-all ${
      disabled 
        ? "bg-emerald-50 border-emerald-200" 
        : "bg-white border-slate-200 hover:border-slate-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20"
    }`}>
      {Icon && (
        <div className={`w-12 h-12 flex items-center justify-center shrink-0 ${
          disabled ? "bg-emerald-100 text-emerald-500" : "bg-slate-50 text-slate-400"
        }`}>
          <Icon size={18} />
        </div>
      )}
      <input
        type={type}
        required={required}
        disabled={disabled}
        className={`flex-1 py-3 px-4 text-sm outline-none bg-transparent ${
          disabled ? "text-slate-500 cursor-not-allowed" : "text-slate-700"
        }`}
        placeholder={placeholder || label}
        value={value || ""}
        onChange={onChange}
      />
    </div>
  </div>
);

// Form Select Component
const FormSelect = ({
  label,
  value,
  onChange,
  options,
  icon: Icon,
  className = "",
}) => (
  <div className={`${className}`}>
    <label className="block text-sm font-medium text-slate-600 mb-2">
      {label}
    </label>
    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-slate-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
      {Icon && (
        <div className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 shrink-0">
          <Icon size={18} />
        </div>
      )}
      <select
        className="flex-1 py-3 px-4 text-sm outline-none bg-transparent appearance-none cursor-pointer text-slate-700"
        value={value}
        onChange={onChange}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="px-3 text-slate-400">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  </div>
);

// Farm Card Component
const FarmCard = ({ farm, index, onEdit, onDelete, onManageSubArea }) => (
  <div className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
    <div className="p-5">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Tractor className="text-emerald-600" size={20} />
          </div>
          <h3 className="text-base font-bold text-slate-800 line-clamp-1">
            {farm.farm_name}
          </h3>
        </div>
        <span
          className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
            farm.planting_method === "นาหว่าน"
              ? "bg-amber-50 text-amber-600 border border-amber-200"
              : "bg-sky-50 text-sky-600 border border-sky-200"
          }`}
        >
          {farm.planting_method}
        </span>
      </div>

      <div className="space-y-2.5 text-sm mb-4">
        <div className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg">
          <span className="text-slate-500">พื้นที่</span>
          <span className="font-bold text-slate-700">{farm.area} ไร่</span>
        </div>
        <div className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg">
          <span className="text-slate-500">พันธุ์ข้าว</span>
          <span className="font-bold text-slate-700">{farm.rice_variety || "-"}</span>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-slate-600 flex items-center gap-2 font-semibold">
            <LayoutGrid size={14} className="text-slate-400" />
            พื้นที่ย่อย ({farm.areas?.length || 0})
          </span>
          <button
            type="button"
            onClick={() => onManageSubArea(farm, index)}
            className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 font-semibold hover:underline"
          >
            <Settings size={12} /> จัดการ
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {farm.areas?.length > 0 ? (
            farm.areas.map((sub, i) => (
              <span
                key={i}
                className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-600 font-medium shadow-sm"
              >
                {sub.area_name}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic">ยังไม่มีพื้นที่ย่อย</span>
          )}
        </div>
      </div>
    </div>

    <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-100 flex justify-end gap-2">
      <button
        type="button"
        onClick={() => onEdit(index)}
        className="text-sm flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all font-medium"
      >
        <Edit size={14} /> แก้ไข
      </button>
      <button
        type="button"
        onClick={() => onDelete(index)}
        className="text-sm flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl hover:border-rose-400 hover:text-rose-500 hover:bg-rose-50 transition-all font-medium"
      >
        <Trash2 size={14} />
      </button>
    </div>
  </div>
);

// Main User Form Modal Component
export const UserFormModal = ({
  isOpen,
  onClose,
  mode,
  formData,
  setFormData,
  onSave,
  loading,
  onAddFarm,
  onEditFarm,
  onDeleteFarm,
  onManageSubArea,
}) => {
  const [activeTab, setActiveTab] = useState("personal");

  if (!isOpen) return null;

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let pass = "";
    for (let i = 0; i < 9; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password: pass });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
          {/* Header - Green Gradient */}
          <div className="px-6 py-4 flex justify-between items-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white shrink-0">
            <div>
              <h3 className="font-bold text-lg">
                {mode === "add" ? "เพิ่มข้อมูลผู้ใช้งานใหม่" : "จัดการข้อมูลเกษตรกร"}
              </h3>
              <p className="text-emerald-100 text-sm">
                {mode === "add" ? "กรอกข้อมูลเพื่อสร้างบัญชีใหม่" : "แก้ไขข้อมูลส่วนตัวและจัดการฟาร์ม"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs - Pill Style */}
          <div className="px-6 py-4 bg-white border-b border-slate-100 shrink-0">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("personal")}
                className={`px-5 py-2 text-sm font-semibold rounded-full transition-all ${
                  activeTab === "personal"
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                ข้อมูลส่วนตัว
              </button>
              {mode !== "add" && (
                <button
                  type="button"
                  onClick={() => setActiveTab("farm")}
                  className={`px-5 py-2 text-sm font-semibold rounded-full transition-all flex items-center gap-2 ${
                    activeTab === "farm"
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  รายการฟาร์ม
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === "farm" 
                      ? "bg-white/20 text-white" 
                      : "bg-slate-200 text-slate-500"
                  }`}>
                    {formData.Farm?.length || 0}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            {activeTab === "personal" ? (
              <form onSubmit={onSave} className="max-w-xl mx-auto">
                {/* Centered Icon & Title */}
                <div className="mb-8 text-center">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="text-emerald-600" size={24} />
                  </div>
                  <h4 className="font-bold text-lg text-slate-800">
                    {mode === "add" ? "เพิ่มข้อมูลเกษตรกร" : "แก้ไขข้อมูลเกษตรกร"}
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">
                    กรุณากรอกข้อมูลส่วนตัวของเกษตรกรให้ครบถ้วน
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Name Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="ชื่อจริง"
                      required
                      icon={User}
                      placeholder="กรอกชื่อจริง"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                    />
                    <FormInput
                      label="นามสกุล"
                      required
                      placeholder="กรอกนามสกุล"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                    />
                  </div>

                  {/* Gender & Phone Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect
                      label="เพศ"
                      value={formData.gender || "ชาย"}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      options={[
                        { value: "ชาย", label: "ชาย" },
                        { value: "หญิง", label: "หญิง" },
                        { value: "อื่นๆ", label: "อื่นๆ" },
                      ]}
                    />
                    <FormInput
                      label="เบอร์โทรศัพท์"
                      icon={Phone}
                      placeholder="0xx-xxx-xxxx"
                      value={formData.phone_number}
                      onChange={(e) =>
                        setFormData({ ...formData, phone_number: e.target.value })
                      }
                    />
                  </div>

                  {/* Position & Birthday Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="ตำแหน่ง"
                      icon={Briefcase}
                      value={formData.position}
                      disabled
                    />
                    <FormInput
                      label="วันเกิด"
                      type="date"
                      icon={Calendar}
                      value={formData.birth_date}
                      onChange={(e) =>
                        setFormData({ ...formData, birth_date: e.target.value })
                      }
                    />
                  </div>

                  {/* Email */}
                  <FormInput
                    label="อีเมล"
                    type="email"
                    icon={Mail}
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />

                  {/* Password (Add mode only) */}
                  {mode === "add" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">
                        รหัสผ่าน <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex gap-3">
                        <div className="flex-1 flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-slate-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                          <div className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 shrink-0">
                            <KeyRound size={18} />
                          </div>
                          <input
                            type="text"
                            required
                            placeholder="กำหนดรหัสผ่าน หรือกดปุ่มสุ่ม"
                            className="flex-1 py-3 px-4 text-sm outline-none bg-transparent"
                            value={formData.password || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, password: e.target.value })
                            }
                          />
                        </div>
                        <button
                          type="button"
                          onClick={generatePassword}
                          className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors text-sm font-medium flex items-center gap-2 whitespace-nowrap"
                        >
                          <Sparkles size={16} /> สุ่มรหัส
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        * รหัสผ่านจะแสดงเฉพาะตอนนี้เท่านั้น
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Save size={18} />
                    )}
                    บันทึกข้อมูลส่วนตัว
                  </button>
                </div>
              </form>
            ) : (
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h4 className="font-bold text-lg text-slate-800">
                      รายการฟาร์มทั้งหมด
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">
                      จัดการฟาร์มและพื้นที่ย่อยของเกษตรกร
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onAddFarm}
                    className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all text-sm font-semibold"
                  >
                    <Plus size={18} /> เพิ่มแปลงใหม่
                  </button>
                </div>

                {!formData.Farm || formData.Farm.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Tractor className="text-slate-300" size={32} />
                    </div>
                    <p className="text-slate-600 font-bold text-lg">
                      ไม่พบข้อมูลแปลงนา
                    </p>
                    <p className="text-slate-400 text-sm mt-1 mb-5">
                      เริ่มต้นสร้างฟาร์มแรกของเกษตรกร
                    </p>
                    <button
                      type="button"
                      onClick={onAddFarm}
                      className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-600 font-semibold text-sm inline-flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all"
                    >
                      <Plus size={18} /> เพิ่มแปลงใหม่
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {formData.Farm.map((farm, idx) => (
                      <FarmCard
                        key={farm.farm_id || idx}
                        farm={farm}
                        index={idx}
                        onEdit={onEditFarm}
                        onDelete={onDeleteFarm}
                        onManageSubArea={onManageSubArea}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
