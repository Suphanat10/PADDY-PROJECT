'use client'
import React, { useState } from 'react';
import Header from "../components/Header";
import { User, Edit2, Save, X, MapPin, Sprout, Droplets } from 'lucide-react';

const FarmerProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    title: 'นาย',
    firstName: 'สมชาย',
    lastName: 'เกษตรกร',
    birthDate: '1985-05-15',
    gender: 'ชาย',
    phone: '081-234-5678',
    email: 'somchai.farmer@gmail.com',
    username: 'somchai_farm01',
    password: '********',
    farmName: 'ฟาร์มข้าวหอมมะลิสมชาย',
    farmArea: '25',
    experience: '15',
    riceType: 'ข้าวหอมมะลิ 105',
    plantingMethod: 'ปักดำ',
    irrigationSystem: 'น้ำฝน + ชลประทาน',
    soilType: 'ดินเหนียว',
    lastYearYield: '550',
    purpose: 'เพื่อการขาย, บริโภคในครัวเรือน',
    subDistrict: 'บ้านใหม่',
    district: 'เมือง',
    province: 'นครราชสีมา',
    gpsLat: '14.9799',
    gpsLng: '102.0977',
    coopMember: 'สหกรณ์การเกษตรเมืองนครราชสีมา จำกัด'
  });

  const [editedProfile, setEditedProfile] = useState({ ...profile });

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile({ ...profile });
  };

  const handleSave = () => {
    setProfile({ ...editedProfile });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile({ ...profile });
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const InputField = ({ label, field, type = "text", options = null }) => {
    const value = isEditing ? editedProfile[field] : profile[field];
    
    if (isEditing) {
      if (options) {
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <select
              value={value}
              onChange={(e) => handleChange(field, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      }
      
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <input
            type={type}
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      );
    }

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
        <p className="text-gray-900 font-medium">{type === 'password' ? '••••••••' : value}</p>
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.title} {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-gray-600">{profile.farmName}</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    บันทึก
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    ยกเลิก
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  แก้ไข
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* ข้อมูลส่วนตัว */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              ข้อมูลส่วนตัว
            </h2>
            
            <div className="grid grid-cols-3 gap-4">
              <InputField 
                label="คำนำหน้า" 
                field="title" 
                options={['นาย', 'นาง', 'นางสาว']} 
              />
              <InputField label="ชื่อ" field="firstName" />
              <InputField label="นามสกุล" field="lastName" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <InputField label="วันเกิด" field="birthDate" type="date" />
              <InputField 
                label="เพศ" 
                field="gender" 
                options={['ชาย', 'หญิง']} 
              />
            </div>
            
            <InputField label="เบอร์โทรศัพท์" field="phone" />
            <InputField label="อีเมล" field="email" type="email" />
            <InputField label="ชื่อผู้ใช้งาน" field="username" />
            <InputField label="รหัสผ่าน" field="password" type="password" />
          </div>

          {/* ข้อมูลฟาร์ม */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Sprout className="w-5 h-5 mr-2 text-green-600" />
              ข้อมูลฟาร์ม
            </h2>
            
            <InputField label="ชื่อฟาร์ม" field="farmName" />
            
            <div className="grid grid-cols-2 gap-4">
              <InputField label="พื้นที่การเพาะปลูก (ไร่)" field="farmArea" type="number" />
              <InputField label="ประสบการณ์ทำการเกษตร (ปี)" field="experience" type="number" />
            </div>
            
            <InputField label="ประเภทข้าว" field="riceType" />
            <InputField 
              label="วิธีการปลูก" 
              field="plantingMethod" 
              options={['หว่านข้าว', 'ปักดำ', 'หว่านแห้ง']} 
            />
            <InputField label="ระบบชลประทาน" field="irrigationSystem" />
            <InputField 
              label="ประเภทดิน" 
              field="soilType" 
              options={['ดินเหนียว', 'ดินร่วน', 'ดินทราย', 'ดินร่วนเหนียว']} 
            />
            <InputField label="ผลผลิตเฉลี่ยต่อไร่ (กก./ปีที่แล้ว)" field="lastYearYield" type="number" />
            <InputField label="วัตถุประสงค์การเพาะปลูก" field="purpose" />
          </div>

          {/* ที่อยู่และพิกัด */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-red-600" />
              ที่อยู่และพิกัด
            </h2>
            
            <InputField label="ตำบล" field="subDistrict" />
            <InputField label="อำเภอ" field="district" />
            <InputField label="จังหวัด" field="province" />
            
            <div className="grid grid-cols-2 gap-4">
              <InputField label="พิกัด GPS (ละติจูด)" field="gpsLat" type="number" step="0.000001" />
              <InputField label="พิกัด GPS (ลองติจูด)" field="gpsLng" type="number" step="0.000001" />
            </div>
          </div>

          {/* ข้อมูลสหกรณ์ */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Droplets className="w-5 h-5 mr-2 text-purple-600" />
              ข้อมูลสหกรณ์
            </h2>
            
            <InputField label="สมาชิกสหกรณ์การเกษตร" field="coopMember" />
            
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">สรุปข้อมูลฟาร์ม</h3>
              <div className="text-sm text-green-700 space-y-1">
                <p>• พื้นที่เพาะปลูก: {profile.farmArea} ไร่</p>
                <p>• ประสบการณ์: {profile.experience} ปี</p>
                <p>• ผลผลิตปีที่แล้ว: {profile.lastYearYield} กก./ไร่</p>
                <p>• ผลผลิตรวม: {(parseFloat(profile.farmArea) * parseFloat(profile.lastYearYield)).toLocaleString()} กก.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default FarmerProfile;