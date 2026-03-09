"use client";
import { X, Save, Loader2, Tractor } from "lucide-react";

// Form Input Component
const FormInput = ({
  label,
  required,
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
}) => (
  <div className={`${className}`}>
    <label className="block text-sm font-medium text-slate-600 mb-2">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input
      type={type}
      required={required}
      className="block w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white transition-all outline-none hover:border-slate-300"
      placeholder={placeholder}
      value={value || ""}
      onChange={onChange}
    />
  </div>
);

// Form Select Component
const FormSelect = ({ label, value, onChange, options, className = "" }) => (
  <div className={`${className}`}>
    <label className="block text-sm font-medium text-slate-600 mb-2">
      {label}
    </label>
    <div className="relative">
      <select
        className="block w-full border border-slate-200 rounded-xl py-3 px-4 pr-10 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white transition-all outline-none appearance-none cursor-pointer hover:border-slate-300"
        value={value}
        onChange={onChange}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  </div>
);

// Form Textarea Component
const FormTextarea = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 mb-2">
      {label}
    </label>
    <textarea
      rows={rows}
      className="block w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white transition-all outline-none resize-none hover:border-slate-300"
      placeholder={placeholder}
      value={value || ""}
      onChange={onChange}
    />
  </div>
);

// Main Farm Form Modal Component
export const FarmFormModal = ({
  isOpen,
  onClose,
  isEditing,
  formData,
  setFormData,
  onSave,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
          <form onSubmit={onSave}>
            {/* Header - Green Gradient */}
            <div className="px-6 py-4 flex justify-between items-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
              <div>
                <h3 className="font-bold text-lg">
                  {isEditing ? "แก้ไขข้อมูลแปลงนา" : "เพิ่มแปลงนาใหม่"}
                </h3>
                <p className="text-emerald-100 text-sm">
                  {isEditing ? "แก้ไขรายละเอียดฟาร์ม" : "กรอกข้อมูลเพื่อสร้างฟาร์มใหม่"}
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

            {/* Content */}
            <div className="p-6">
              {/* Centered Icon & Title */}
              <div className="mb-6 text-center">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Tractor className="text-emerald-600" size={24} />
                </div>
                <h4 className="font-bold text-lg text-slate-800">
                  {isEditing ? "แก้ไขข้อมูลแปลงนา" : "เพิ่มแปลงนาใหม่"}
                </h4>
                <p className="text-sm text-slate-500 mt-1">
                  กรอกข้อมูลรายละเอียดของแปลงนา
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="ชื่อแปลง / ฟาร์ม"
                  required
                  placeholder="เช่น แปลงนาทุ่งทอง 1"
                  value={formData.farm_name}
                  onChange={(e) =>
                    setFormData({ ...formData, farm_name: e.target.value })
                  }
                  className="md:col-span-2"
                />
                <FormInput
                  label="ขนาดพื้นที่รวม (ไร่)"
                  required
                  type="number"
                  placeholder="0.0"
                  value={formData.area}
                  onChange={(e) =>
                    setFormData({ ...formData, area: e.target.value })
                  }
                />
                <FormInput
                  label="พันธุ์ข้าว"
                  required
                  placeholder="เช่น กข15, หอมมะลิ"
                  value={formData.rice_variety}
                  onChange={(e) =>
                    setFormData({ ...formData, rice_variety: e.target.value })
                  }
                />
                <FormSelect
                  label="วิธีการปลูก"
                  value={formData.planting_method || "นาหว่าน"}
                  onChange={(e) =>
                    setFormData({ ...formData, planting_method: e.target.value })
                  }
                  options={[
                    { value: "นาหว่าน", label: "นาหว่าน" },
                    { value: "นาดำ", label: "นาดำ" },
                    { value: "นาหยอด", label: "นาหยอด" },
                  ]}
                />
                <FormSelect
                  label="ชนิดดิน"
                  value={formData.soil_type || "ดินเหนียว"}
                  onChange={(e) =>
                    setFormData({ ...formData, soil_type: e.target.value })
                  }
                  options={[
                    { value: "ดินเหนียว", label: "ดินเหนียว" },
                    { value: "ดินร่วน", label: "ดินร่วน" },
                    { value: "ดินทราย", label: "ดินทราย" },
                    { value: "ดินร่วนปนทราย", label: "ดินร่วนปนทราย" },
                  ]}
                />
                <FormSelect
                  label="การจัดการน้ำ"
                  value={formData.water_management || "น้ำฝน"}
                  onChange={(e) =>
                    setFormData({ ...formData, water_management: e.target.value })
                  }
                  options={[
                    { value: "น้ำฝน", label: "น้ำฝน" },
                    { value: "ชลประทาน", label: "ชลประทาน" },
                    { value: "บ่อบาดาล", label: "บ่อบาดาล" },
                  ]}
                  className="md:col-span-2"
                />
                <div className="md:col-span-2">
                  <FormTextarea
                    label="ที่อยู่แปลงนา"
                    placeholder="บ้านเลขที่ หมู่ ตำบล อำเภอ จังหวัด..."
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                บันทึกข้อมูล
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
