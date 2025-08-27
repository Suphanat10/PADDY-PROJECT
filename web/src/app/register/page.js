"use client";

import { useState } from "react";
import Link from "next/link";
import liff from '@line/liff';
import { UserPlus, Sprout, MapPin, Home, Eye, EyeOff, User, Lock, Plus, Info, Phone, Mail, Calendar, Users, Banknote, FileText, Camera, Upload, MessageCircle } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    // Personal Information
    citizenId: '',
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: '',
    laserCode: '',
    titleName: '',
    birthDate: '',
    gender: '',
    phone: '',
    email: '',
    emergencyContact: '',
    emergencyPhone: '',
    
    // LINE Integration
    lineId: '',
    lineNotification: true,
    
    // Farm Information
    farmingArea: '',
    riceType: '',
    plantingMethod: '',
    farmName: '',
    farmingExperience: '',
    irrigationSystem: '',
    soilType: '',
    previousYieldPerRai: '',
    farmingObjective: '',
    organicCertification: '',
    
    // Location Information
    district: '',
    subDistrict: '',
    province: '',
    address: '',
    postalCode: '',
    gpsCoordinates: '',
    
    // Financial Information
    bankAccount: '',
    bankName: '',
    monthlyIncome: '',
    farmingBudget: '',
    
    // Additional Information
    education: '',
    occupation: '',
    familyMembers: '',
    computerSkills: '',
    internetAccess: '',
    smartphoneUsage: '',
    agriculturalTraining: '',
    governmentSupport: '',
    cooperativeMember: '',
    
    // Agreement
    termsAccepted: false,
    dataProcessingConsent: false,
    marketingConsent: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lineConnected, setLineConnected] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLineConnect = async () => {
    // การเชื่อมต่อ LINE
      await liff.init({ liffId: '2007854586-9ogoEj2j' });
    if (!liff.isLoggedIn()) {
        liff.login();
    }
    const profile = await liff.getProfile();
    console.log("User profile:", profile);

    setFormData(prev => ({
      ...prev,
      lineId: profile.displayName
    }));
    setLineConnected(true);
  
    // alert('เชื่อมต่อ LINE สำเร็จ!');
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    alert('ข้อมูลถูกส่งเรียบร้อยแล้ว');
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const riceTypes = [
    'ข้าวหอมมะลิ 105',
    'ข้าวขาวดอกมะลิ 105',
    'ข้าวเหนียวเคื่องและอัลกาไลน์',
    'ข้าวเหนียวอีกลิง',
    'ข้าวหอมปทุมธานี 1',
    'ข้าวกข 6',
    'ข้าวกข 23',
    'ข้าวกข 43',
    'ข้าวพันธุ์อื่น ๆ'
  ];

  const plantingMethods = [
    'การปลูกแบบดั้งเดิม (หว่านข้าว)',
    'การปลูกแบบดำนา',
    'การปลูกแบบแห้ง (Direct Seeding)',
    'การปลูกแบบระบบ SRI',
    'การปลูกแบบผสมผสาน'
  ];

  const irrigationSystems = [
    'ชลประทาน',
    'บ่อบาดาล',
    'สระเก็บน้ำ',
    'ระบบหยดน้ำ',
    'ฝน',
    'ระบบผสม'
  ];

  const soilTypes = [
    'ดินเหนียว',
    'ดินร่วน',
    'ดินทราย',
    'ดินร่วนเหนียว',
    'ดินร่วนทราย',
    'ดินอื่น ๆ'
  ];

  const provinces = [
    'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร',
    'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท',
    'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง',
    'ตราด', 'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม',
    'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส',
    'น่าน', 'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์',
    'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พังงา', 'พัทลุง',
    'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่',
    'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน', 'ยโสธร',
    'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 'ราชบุรี',
    'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย', 'ศรีสะเกษ',
    'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ', 'สมุทรสงคราม',
    'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย',
    'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย', 'หนองบัวลำภู',
    'อ่างทอง', 'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี'
  ];

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-left mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">ข้อมูลส่วนตัว</h2>
        <p className="text-gray-600">กรุณากรอกข้อมูลส่วนตัวของท่านเพื่อเริ่มต้นการลงทะเบียน</p>
      </div>

      {/* ชื่อ-นามสกุล */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            คำนำหน้าชื่อ <span className="text-red-500">*</span>
          </label>
          <select
            name="titleName"
            value={formData.titleName}
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
            name="firstName"
            value={formData.firstName}
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
            name="lastName"
            value={formData.lastName}
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
            name="birthDate"
            value={formData.birthDate}
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

      {/* ข้อมูลติดต่อ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            เบอร์โทรศัพท์ <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
              placeholder="0xx-xxx-xxxx"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            อีเมล
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
              placeholder="example@email.com"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-left mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">ข้อมูลการเข้าใช้งานระบบ</h2>
        <p className="text-gray-600">กรุณากรอกข้อมูลการเข้าใช้งานระบบของท่าน</p>
      </div>

      {/* ชื่อผู้ใช้งาน */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <label className="block text-gray-700 font-medium mb-2">
          ชื่อผู้ใช้งาน <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
        <p className="text-sm text-gray-500 mt-2">ใช้ตัวอักษรภาษาอังกฤษและตัวเลข 6-20 ตัวอักษร</p>
      </div>

      {/* รหัสผ่าน */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <label className="block text-gray-700 font-medium mb-2">
          รหัสผ่าน <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวอักษรและตัวเลข</p>
      </div>

      {/* ยืนยันรหัสผ่าน */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <label className="block text-gray-700 font-medium mb-2">
          ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
          <p className="text-sm text-red-500 mt-2">รหัสผ่านไม่ตรงกัน</p>
        )}
      </div>

      {/* LINE Integration */}
      <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
        <div className="flex items-center mb-4">
          <MessageCircle className="w-6 h-6 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">เชื่อมต่อบัญชี LINE</h3>
        </div>
        
        <p className="text-gray-600 mb-4">
          เชื่อมต่อบัญชี LINE เพื่อรับการแจ้งเตือนข้อมูลสำคัญเกี่ยวกับการเกษตรของท่าน
        </p>

        {!lineConnected ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleLineConnect}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>เชื่อมต่อกับ LINE</span>
            </button>
           
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">เชื่อมต่อ LINE สำเร็จ</p>
                    <p className="text-sm text-gray-600">LINE ID: {formData.lineId}</p>
                  </div>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-gray-700 font-medium">การแจ้งเตือนผ่าน LINE</label>
              
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="lineNotification"
                  name="lineNotification"
                  checked={formData.lineNotification}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
                />
                <label htmlFor="lineNotification" className="text-gray-700 text-sm">
                  <span className="font-medium">รับการแจ้งเตือนผ่าน LINE</span>
                  <br />
                  <span className="text-gray-600">
                    รับข้อมูลสภาพอากาศ, คำแนะนำการเกษตร, และแจ้งเตือนสำคัญ
                  </span>
                </label>
              </div>
            </div>

            <div className="bg-green-100 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">ประโยชน์ของการเชื่อมต่อ LINE:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• รับการแจ้งเตือนสภาพอากาศรายวัน</li>
                <li>• คำแนะนำการดูแลพืชตามช่วงเวลา</li>
                <li>• ข้อมูลราคาข้าวในตลาด</li>
                <li>• แจ้งเตือนโรคและแมลงศัตรูพืช</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-left mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">ข้อมูลฟาร์มและการเกษตร</h2>
        <p className="text-gray-600">กรุณากรอกข้อมูลเกี่ยวกับพื้นที่เพาะปลูกและการเกษตรของท่าน</p>
      </div>

      {/* ชื่อฟาร์ม */}
      <div className="bg-green-50 p-6 rounded-lg">
        <label className="block text-gray-700 font-medium mb-2">
          ชื่อฟาร์ม
        </label>
        <input
          type="text"
          name="farmName"
          value={formData.farmName}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
          placeholder="ฟาร์มข้าวหอมมะลิ หรือ ไร่นาคุณสมชาย"
        />
      </div>

      {/* พื้นที่การเพาะปลูกและประสบการณ์ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            พื้นที่การเพาะปลูก <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              name="farmingArea"
              value={formData.farmingArea}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 pr-16"
              placeholder="0"
              min="0"
              step="0.1"
              required
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
              ไร่
            </span>
          </div>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            ประสบการณ์ทำการเกษตร
          </label>
          <div className="relative">
            <input
              type="number"
              name="farmingExperience"
              value={formData.farmingExperience}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 pr-16"
              placeholder="0"
              min="0"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
              ปี
            </span>
          </div>
        </div>
      </div>

      {/* ประเภทข้าวและวิธีการปลูก */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            ประเภทข้าว <span className="text-red-500">*</span>
          </label>
          <select
            name="riceType"
            value={formData.riceType}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
            required
          >
            <option value="">เลือกประเภทข้าว</option>
            {riceTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            วิธีการปลูก <span className="text-red-500">*</span>
          </label>
          <select
            name="plantingMethod"
            value={formData.plantingMethod}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
            required
          >
            <option value="">เลือกวิธีการปลูก</option>
            {plantingMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ระบบชลประทานและประเภทดิน */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            ระบบชลประทาน
          </label>
          <select
            name="irrigationSystem"
            value={formData.irrigationSystem}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
          >
            <option value="">เลือกระบบชลประทาน</option>
            {irrigationSystems.map(system => (
              <option key={system} value={system}>{system}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            ประเภทดิน
          </label>
          <select
            name="soilType"
            value={formData.soilType}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
          >
            <option value="">เลือกประเภทดิน</option>
            {soilTypes.map(soil => (
              <option key={soil} value={soil}>{soil}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ผลผลิตและวัตถุประสงค์ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            ผลผลิตเฉลี่ยต่อไร่ (ปีที่แล้ว)
          </label>
          <div className="relative">
            <input
              type="number"
              name="previousYieldPerRai"
              value={formData.previousYieldPerRai}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 pr-20"
              placeholder="0"
              min="0"
              step="0.1"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
              กิโลกรัม
            </span>
          </div>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            วัตถุประสงค์การเพาะปลูก
          </label>
          <select
            name="farmingObjective"
            value={formData.farmingObjective}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
          >
            <option value="">เลือกวัตถุประสงค์</option>
            <option value="บริโภคในครัวเรือน">บริโภคในครัวเรือน</option>
            <option value="จำหน่าย">จำหน่าย</option>
            <option value="ทั้งสองอย่าง">ทั้งสองอย่าง</option>
          </select>
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
        
        <div className="mb-4">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">ตำบล <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
              placeholder="ตำบล"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">อำเภอ <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="subDistrict"
              value={formData.subDistrict}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
              placeholder="อำเภอ"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">จังหวัด <span className="text-red-500">*</span></label>
            <select
              name="province"
              value={formData.province}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
              required
            >
              <option value="">เลือกจังหวัด</option>
              {provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">รหัสไปรษณีย์</label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
              placeholder="12345"
              maxLength="5"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">พิกัด GPS (ถ้ามี)</label>
            <input
              type="text"
              name="gpsCoordinates"
              value={formData.gpsCoordinates}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
              placeholder="13.7563, 100.5018"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-left mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">ข้อตกลงและการให้ความยินยอม</h2>
        <p className="text-gray-600">ข้อตกลงและการให้ความยินยอม</p>
      </div>

      {/* การฝึกอบรมและการสนับสนุน */}
      <div className="bg-orange-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">การฝึกอบรมและการสนับสนุน</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">เป็นสมาชิกสหกรณ์การเกษตรหรือไม่</label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="coop_yes"
                  name="cooperativeMember"
                  value="เป็นสมาชิก"
                  checked={formData.cooperativeMember === "เป็นสมาชิก"}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                />
                <label htmlFor="coop_yes" className="ml-2 text-gray-700">เป็นสมาชิก</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="coop_no"
                  name="cooperativeMember"
                  value="ไม่เป็นสมาชิk"
                  checked={formData.cooperativeMember === "ไม่เป็นสมาชิก"}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                />
                <label htmlFor="coop_no" className="ml-2 text-gray-700">ไม่เป็นสมาชิก</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ข้อตกลงและการให้ความยินยอม */}
      <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">ข้อตกลงและการให้ความยินยอม</h3>
        
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
              <span className="font-medium">ข้าพเจ้ายอมรับเงื่อนไขและข้อตกลงการใช้งาน</span> <span className="text-red-500">*</span>
              <br />
              <span className="text-sm text-gray-600">
                ได้อ่านและเข้าใจเงื่อนไขการใช้งานระบบ AgriSmart และยอมรับที่จะปฏิบัติตามข้อกำหนดทั้งหมด
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
              <span className="font-medium">ยินยอมให้ประมวลผลข้อมูลส่วนบุคคล</span> <span className="text-red-500">*</span>
              <br />
              <span className="text-sm text-gray-600">
                ยินยอมให้ AgriSmart เก็บรวบรวม ใช้ และประมวลผลข้อมูลส่วนบุคคลเพื่อการให้บริการและพัฒนาระบบ
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
              <span className="font-medium">ยินยอมรับข้อมูลข่าวสารและการตลาด</span>
              <br />
              <span className="text-sm text-gray-600">
                ยินยอมให้ AgriSmart ส่งข้อมูลข่าวสาร โปรโมชั่น และเทคนิคการเกษตรผ่านช่องทางต่างๆ
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
                <span className="font-medium">ยินยอมการใช้งาน LINE สำหรับการแจ้งเตือน</span>
                <br />
                <span className="text-sm text-gray-600">
                  ยินยอมให้ AgriSmart ส่งข้อความแจ้งเตือนผ่าน LINE เพื่อให้ข้อมูลการเกษตรและสภาพอากาศ
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* สรุปข้อมูลการเชื่อมต่อ */}
      {lineConnected && (
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-3">สรุปการเชื่อมต่อ LINE</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">สถานะการเชื่อมต่อ:</span>
              <span className="text-green-600 font-medium">เชื่อมต่อแล้ว</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">LINE ID:</span>
              <span className="text-gray-800 font-mono">{formData.lineId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">การแจ้งเตือน:</span>
              <span className={formData.lineNotification ? "text-green-600" : "text-gray-500"}>
                {formData.lineNotification ? "เปิดใช้งาน" : "ปิดใช้งาน"}
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
          <span className="font-semibold text-lg text-white">Smart Paddy (ระบบเกษตรอัจฉริยะ)</span>
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
                <p className="text-sm text-gray-600">ขั้นตอนที่ {currentStep} จาก 5 ขั้นตอน</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-600">{Math.round((currentStep / 5) * 100)}%</div>
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
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
                  disabled={!formData.termsAccepted || !formData.dataProcessingConsent || isLoading}
                  className={`flex items-center space-x-2 font-medium py-3 px-8 rounded-lg transition duration-200 shadow-lg hover:shadow-xl ${
                    !formData.termsAccepted || !formData.dataProcessingConsent || isLoading
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
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