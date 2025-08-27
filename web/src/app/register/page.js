"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

import liff from "@line/liff";
import {
  UserPlus,
  Sprout,
  MapPin,
  Home,
  Eye,
  EyeOff,
  User,
  Lock,
  Plus,
  Info,
  Phone,
  Mail,
  Calendar,
  Users,
  Banknote,
  FileText,
  Camera,
  Upload,
  MessageCircle,
} from "lucide-react";
import Swal from "sweetalert2";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    // Personal Information
    prefix: "",
    first_name: "",
    last_name: "",
    birth_date: "",
    gender: "",
    phone_number: "",

    // LINE and Login
    user_id_line: "",
    username: "",
    password: "",
    confirmPassword: "",
    position: "farmer", // default position

    // Farming Information
    plot_name: "",
    area: "",
    rice_variety: "",
    planting_method: "",
    soil_type: "",
    water_management: "",
    is_baac_member: false,

    // Address
    address: "",
    sub_district_id: "",

    // Agreement
    termsAccepted: false,
    dataProcessingConsent: false,
    marketingConsent: false,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lineConnected, setLineConnected] = useState(false);

  // Location data states
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);



  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
  try {
    setLocationLoading(true);
    const data = await apiFetch("/api/data/provinces", { method: "GET" });
    if (Array.isArray(data)) {
      setProvinces(data);
    } else {
      console.error("Unexpected response format:", data);
    }
  } catch (err) {
    console.error("Error fetching provinces");
  } finally {
    setLocationLoading(false);
  }
};


  const fetchDistricts = async (provinceId) => {
    try {
      setLocationLoading(true);
      const response = await apiFetch(`/api/data/districts/${provinceId}`, { method: "GET" });
      if (Array.isArray(response)) {
        setDistricts(response);
        setSubDistricts([]);
        setSelectedDistrict("");
        setFormData((prev) => ({ ...prev, sub_district_id: "" }));
      } else {
        console.error("Unexpected response format");
      }
    } catch (error) {
      console.error("Error fetching districts");
    } finally {
      setLocationLoading(false);
    }
  };

  const fetchSubDistricts = async (districtId) => {
    try {
      setLocationLoading(true);
      const response = await apiFetch(`/api/data/sub-districts/${districtId}`, { method: "GET" });
      if (Array.isArray(response)) {
        setSubDistricts(response);
        setFormData((prev) => ({ ...prev, sub_district_id: "" }));
      } else {
        console.error("Unexpected response format");
      }
    } catch (error) {
      console.error("Error fetching sub-districts");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    setSelectedProvince(provinceId);
    if (provinceId) {
      fetchDistricts(provinceId);
    } else {
      setDistricts([]);
      setSubDistricts([]);
      setSelectedDistrict("");
      setFormData((prev) => ({ ...prev, sub_district_id: "" }));
    }
  };

  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    setSelectedDistrict(districtId);
    if (districtId) {
      fetchSubDistricts(districtId);
    } else {
      setSubDistricts([]);
      setFormData((prev) => ({ ...prev, sub_district_id: "" }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLineConnect = async () => {
    try {
      await liff.init({ liffId: "2007854586-9ogoEj2j" });
      if (!liff.isLoggedIn()) {
        liff.login();
        return; 
      }
      const profile = await liff.getProfile();
      setFormData((prev) => ({
        ...prev,
        user_id_line: profile.userId,
      }));
      setLineConnected(true);
    } catch (error) {
      console.error("Error connecting to LINE:", error);
    }
  };

  const handleSubmit =  async () => { 
     try {
      setIsLoading(true);
      const response = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "ลงทะเบียนสำเร็จ",
        });
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep((s) => s + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const riceVarieties = [
    "ข้าวหอมมะลิ 105",
    "ข้าวขาวดอกมะลิ 105",
    "ข้าวเหนียวเคื่องและอัลกาไลน์",
    "ข้าวเหนียวอีกลิง",
    "ข้าวหอมปทุมธานี 1",
    "ข้าวกข 6",
    "ข้าวกข 23",
    "ข้าวกข 43",
    "ข้าวพันธุ์อื่น ๆ",
  ];

  const plantingMethods = [
    "การปลูกแบบดั้งเดิม (หว่านข้าว)",
    "การปลูกแบบดำนา",
    "การปลูกแบบแห้ง (Direct Seeding)",
    "การปลูกแบบระบบ SRI",
    "การปลูกแบบผสมผสาน",
  ];

  const soilTypes = [
    "ดินเหนียว",
    "ดินร่วน",
    "ดินทราย",
    "ดินร่วนเหนียว",
    "ดินร่วนทราย",
    "ดินอื่น ๆ",
  ];

  const waterManagements = [
    "ชลประทาน",
    "บ่อบาดาล",
    "สระเก็บน้ำ",
    "ระบบหยดน้ำ",
    "ฝน",
    "ระบบผสม",
  ];

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-left mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">ข้อมูลส่วนตัว</h2>
        <p className="text-gray-600">
          กรุณากรอกข้อมูลส่วนตัวของท่านเพื่อเริ่มต้นการลงทะเบียน
        </p>
      </div>

      {/* ชื่อ-นามสกุล */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            คำนำหน้าชื่อ <span className="text-red-500">*</span>
          </label>
          <select
            name="prefix"
            value={formData.prefix}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
            required
          >
            <option value="">เลือก</option>
            <option value="นาย">นาย</option>
            <option value="นาง">นาง</option>
            <option value="นางสาว">นางสาว</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            ชื่อ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
            placeholder="ชื่อจริง"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            นามสกุล <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
            placeholder="นามสกุล"
            required
          />
        </div>
      </div>

      {/* วันเกิดและเพศ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            วันเกิด <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="birth_date"
            value={formData.birth_date}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            เพศ <span className="text-red-500">*</span>
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
            required
          >
            <option value="">เลือกเพศ</option>
            <option value="ชาย">ชาย</option>
            <option value="หญิง">หญิง</option>
          </select>
        </div>
      </div>

      {/* เบอร์โทรศัพท์ */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          เบอร์โทรศัพท์ <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleInputChange}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
            placeholder="0xx-xxx-xxxx"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-left mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          ข้อมูลการเข้าใช้งานระบบ
        </h2>
        <p className="text-gray-600">
          กรุณากรอกข้อมูลการเข้าใช้งานระบบของท่าน
        </p>
      </div>

      {/* ชื่อผู้ใช้งาน */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <label className="block text-gray-700 font-medium mb-2">
          ชื่อผู้ใช้งาน <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
            placeholder="ชื่อผู้ใช้งาน (ภาษาอังกฤษ)"
            required
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          ใช้ตัวอักษรภาษาอังกฤษและตัวเลข 6-20 ตัวอักษร
        </p>
      </div>

      {/* รหัสผ่าน */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <label className="block text-gray-700 font-medium mb-2">
          รหัสผ่าน <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
            placeholder="รหัสผ่าน"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวอักษรและตัวเลข
        </p>
      </div>

      {/* ยืนยันรหัสผ่าน */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <label className="block text-gray-700 font-medium mb-2">
          ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
            placeholder="ยืนยันรหัสผ่าน"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {formData.password &&
          formData.confirmPassword &&
          formData.password !== formData.confirmPassword && (
            <p className="text-sm text-red-500 mt-2">รหัสผ่านไม่ตรงกัน</p>
          )}
      </div>

      {/* LINE Integration */}
      <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
        <div className="flex items-center mb-4">
          <MessageCircle className="w-6 h-6 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">
            เชื่อมต่อบัญชี LINE
          </h3>
        </div>

        <p className="text-gray-600 mb-4">
          เชื่อมต่อบัญชี LINE เพื่อรับการแจ้งเตือนข้อมูลสำคัญเกี่ยวกับการเกษตรของท่าน
        </p>

        {!lineConnected ? (
          <button
            type="button"
            onClick={handleLineConnect}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>เชื่อมต่อกับ LINE</span>
          </button>
        ) : (
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">เชื่อมต่อ LINE สำเร็จ</p>
                  <p className="text-sm text-gray-600">
                    LINE ID: {formData.user_id_line}
                  </p>
                </div>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-left mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          ข้อมูลฟาร์มและการเกษตร
        </h2>
        <p className="text-gray-600">
          กรุณากรอกข้อมูลเกี่ยวกับพื้นที่เพาะปลูกและการเกษตรของท่าน
        </p>
      </div>

      {/* ชื่อแปลงและพื้นที่ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            ชื่อแปลงนา <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="plot_name"
            value={formData.plot_name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
            placeholder="เช่น แปลงนาข้าวหอมมะลิ"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            พื้นที่การเพาะปลูก <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 pr-16"
              placeholder="0"
              min="0"
              step="0.1"
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
              ไร่
            </span>
          </div>
        </div>
      </div>

      {/* พันธุ์ข้าวและวิธีการปลูก */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            พันธุ์ข้าว <span className="text-red-500">*</span>
          </label>
          <select
            name="rice_variety"
            value={formData.rice_variety}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
            required
          >
            <option value="">เลือกพันธุ์ข้าว</option>
            {riceVarieties.map((variety) => (
              <option key={variety} value={variety}>
                {variety}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            วิธีการปลูก <span className="text-red-500">*</span>
          </label>
          <select
            name="planting_method"
            value={formData.planting_method}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
            required
          >
            <option value="">เลือกวิธีการปลูก</option>
            {plantingMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ประเภทดินและการจัดการน้ำ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            ประเภทดิน <span className="text-red-500">*</span>
          </label>
          <select
            name="soil_type"
            value={formData.soil_type}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
            required
          >
            <option value="">เลือกประเภทดิน</option>
            {soilTypes.map((soil) => (
              <option key={soil} value={soil}>
                {soil}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            การจัดการน้ำ <span className="text-red-500">*</span>
          </label>
          <select
            name="water_management"
            value={formData.water_management}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
            required
          >
            <option value="">เลือกวิธีการจัดการน้ำ</option>
            {waterManagements.map((water) => (
              <option key={water} value={water}>
                {water}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* สมาชิก ธ.ก.ส. */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">ข้อมูลสมาชิก</h3>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_baac_member"
            name="is_baac_member"
            checked={formData.is_baac_member}
            onChange={handleInputChange}
            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
          />
          <label htmlFor="is_baac_member" className="ml-3 text-gray-700">
            <span className="font-medium">
              เป็นสมาชิก ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (ธ.ก.ส.)
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-left mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">ข้อมูลที่อยู่</h2>
        <p className="text-gray-600">กรุณากรอกข้อมูลที่อยู่ของท่าน</p>
      </div>

      {/* ที่อยู่ */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">ที่อยู่ปัจจุบัน</h3>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            ที่อยู่ <span className="text-red-500">*</span>
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
            placeholder="บ้านเลขที่ หมู่ที่ ถนน"
            required
          />
        </div>

        {/* จังหวัด อำเภอ ตำบล */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              จังหวัด <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProvince}
              onChange={handleProvinceChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
              disabled={locationLoading}
              required
            >
              <option value="">เลือกจังหวัด</option>
              {provinces.map((province) => (
                <option key={province.province_id} value={province.province_id}>
                  {province.name_th}
                </option>
              ))}
            </select>
            {locationLoading && (
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                กำลังโหลดข้อมูล...
              </div>
            )}
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              อำเภอ <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedDistrict}
              onChange={handleDistrictChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
              disabled={!selectedProvince || locationLoading}
              required
            >
              <option value="">เลือกอำเภอ</option>
              {districts.map((district) => (
                <option key={district.district_id} value={district.district_id}>
                  {district.name_th}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              ตำบล <span className="text-red-500">*</span>
            </label>
            <select
              name="sub_district_id"
              value={formData.sub_district_id}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
              disabled={!selectedDistrict || locationLoading}
              required
            >
              <option value="">เลือกตำบล</option>
              {subDistricts.map((subDistrict) => (
                <option key={subDistrict.sub_district_id} value={subDistrict.sub_district_id}>
                  {subDistrict.name_th}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-left mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          ข้อตกลงและการให้ความยินยอม
        </h2>
        <p className="text-gray-600">กรุณาตรวจสอบและยอมรับข้อตกลงการใช้งาน</p>
      </div>

      {/* สรุปข้อมูล */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          สรุปข้อมูลการลงทะเบียน
        </h3>

        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">ชื่อ-นามสกุล:</span>
              <div className="font-medium">
                {formData.prefix} {formData.first_name} {formData.last_name}
              </div>
            </div>
            <div>
              <span className="text-gray-600">เบอร์โทรศัพท์:</span>
              <div className="font-medium">{formData.phone_number}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">ชื่อแปลงนา:</span>
              <div className="font-medium">{formData.plot_name}</div>
            </div>
            <div>
              <span className="text-gray-600">พื้นที่:</span>
              <div className="font-medium">{formData.area} ไร่</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">พันธุ์ข้าว:</span>
              <div className="font-medium">{formData.rice_variety}</div>
            </div>
            <div>
              <span className="text-gray-600">วิธีการปลูก:</span>
              <div className="font-medium">{formData.planting_method}</div>
            </div>
          </div>

          {lineConnected && (
            <div className="pt-2 border-t border-gray-200">
              <span className="text-gray-600">สถานะ LINE:</span>
              <div className="font-medium text-green-600">
                เชื่อมต่อแล้ว (ID: {formData.user_id_line})
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ข้อตกลงและการให้ความยินยอม */}
      <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          ข้อตกลงและการให้ความยินยอม
        </h3>

        <div className="space-y-4">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleInputChange}
              className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-1"
              required
            />
            <label htmlFor="terms" className="ml-3 text-gray-700">
              <span className="font-medium">
                ข้าพเจ้ายอมรับเงื่อนไขและข้อตกลงการใช้งาน
              </span>{" "}
              <span className="text-red-500">*</span>
              <br />
              <span className="text-sm text-gray-600">
                ได้อ่านและเข้าใจเงื่อนไขการใช้งานระบบ Smart Paddy และยอมรับที่จะปฏิบัติตามข้อกำหนดทั้งหมด
              </span>
            </label>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="dataConsent"
              name="dataProcessingConsent"
              checked={formData.dataProcessingConsent}
              onChange={handleInputChange}
              className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-1"
              required
            />
            <label htmlFor="dataConsent" className="ml-3 text-gray-700">
              <span className="font-medium">ยินยอมให้ประมวลผลข้อมูลส่วนบุคคล</span>{" "}
              <span className="text-red-500">*</span>
              <br />
              <span className="text-sm text-gray-600">
                ยินยอมให้ Smart Paddy เก็บรวบรวม ใช้ และประมวลผลข้อมูลส่วนบุคคลเพื่อการให้บริการและพัฒนาระบบ
              </span>
            </label>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="marketing"
              name="marketingConsent"
              checked={formData.marketingConsent}
              onChange={handleInputChange}
              className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-1"
            />
            <label htmlFor="marketing" className="ml-3 text-gray-700">
              <span className="font-medium">
                ยินยอมรับข้อมูลข่าวสารและการตลาด
              </span>
              <br />
              <span className="text-sm text-gray-600">
                ยินยอมให้ Smart Paddy ส่งข้อมูลข่าวสาร โปรโมชั่น และเทคนิคการเกษตรผ่านช่องทางต่างๆ
              </span>
            </label>
          </div>

          {/* LINE Integration Consent */}
          {lineConnected && (
            <div className="flex items-start">
              <input
                type="checkbox"
                id="lineConsent"
                checked={true}
                readOnly
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
              />
              <label htmlFor="lineConsent" className="ml-3 text-gray-700">
                <span className="font-medium">
                  ยินยอมการใช้งาน LINE สำหรับการแจ้งเตือน
                </span>
                <br />
                <span className="text-sm text-gray-600">
                  ยินยอมให้ Smart Paddy ส่งข้อความแจ้งเตือนผ่าน LINE เพื่อให้ข้อมูลการเกษตรและสภาพอากาศ
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* สรุปข้อมูลการเชื่อมต่อ */}
      {lineConnected && (
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-3">
            สรุปการเชื่อมต่อ LINE
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">สถานะการเชื่อมต่อ:</span>
              <span className="text-green-600 font-medium">เชื่อมต่อแล้ว</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">LINE User ID:</span>
              <span className="text-gray-800 font-mono text-xs">
                {formData.user_id_line}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="w-full px-4 py-3 flex justify-between items-center bg-gradient-to-r from-emerald-800 to-emerald-500 text-white">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
            <Sprout className="text-white w-6 h-6" />
          </div>
          <span className="font-semibold text-lg text-white">
            Smart Paddy (ระบบเกษตรอัจฉริยะ)
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center py-6">
          ลงทะเบียนเกษตรกรเพื่อรับบริการ Smart Paddy
        </h1>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <Info className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">ความคืบหน้าการลงทะเบียน</h3>
                <p className="text-sm text-gray-600">
                  ขั้นตอนที่ {currentStep} จาก 5 ขั้นตอน
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-600">
                {Math.round((currentStep / 5) * 100)}%
              </div>
              <div className="text-sm text-gray-500">เสร็จสิ้น</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 mt-6">
          {/* Render Current Step */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition duration-200 ${
                currentStep === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <span>← ย้อนกลับ</span>
            </button>

            <div className="flex space-x-4">
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-8 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
                >
                  <span>ถัดไป</span>
                  <span>→</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    !formData.termsAccepted || !formData.dataProcessingConsent || isLoading
                  }
                  className={`flex items-center space-x-2 font-medium py-3 px-8 rounded-lg transition duration-200 shadow-lg hover:shadow-xl ${
                    !formData.termsAccepted ||
                    !formData.dataProcessingConsent ||
                    isLoading
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>กำลังส่งข้อมูล...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      <span>ลงทะเบียน</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
