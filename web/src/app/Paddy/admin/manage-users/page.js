"use client";

import React, { useState, useEffect } from "react";

import {
  Users,
  Sprout,
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  User,
} from "lucide-react";

import {
  AdminSidebar,
  AdminHeader,
} from "../../../components/admin/AdminLayout";

import  {getDataUser}  from "@/lib/admin/manage-users/getDataUser";

const initialUsers = [
  {
    user_ID: 1,
    first_name: "สมชาย",
    last_name: "ใจดี",
    birth_date: "1980-05-15",
    gender: "ชาย",
    phone_number: "0812345678",
    user_id_line: "somchai.line",
    email: "somchai@example.com",
    position: "เกษตรกร",
    farm: {
      farm_id: 101,
      farm_name: "ไร่สมชายพอเพียง",
      area: 15.5,
      rice_variety: "หอมมะลิ",
      planting_method: "นาดำ",
      soil_type: "ดินร่วนปนทราย",
      water_management: "คลองชลประทาน",
      address: "123 หมู่ 1 ต.ท่านา อ.เมือง จ.เชียงใหม่",
      gender: "ไม่ระบุ",
    },
  },
  {
    user_ID: 2,
    first_name: "วิไล",
    last_name: "รักถิ่น",
    birth_date: "1985-11-20",
    gender: "หญิง",
    phone_number: "0898765432",
    user_id_line: "wilai.farm",
    email: "wilai@example.com",
    position: "หัวหน้ากลุ่ม",
    farm: {
      farm_id: 102,
      farm_name: "สวนผักวิไล",
      area: 5.0,
      rice_variety: "ไรซ์เบอร์รี่",
      planting_method: "นาหว่าน",
      soil_type: "ดินเหนียว",
      water_management: "บ่อบาดาล",
      address: "44 หมู่ 5 ต.บ้านดอน อ.แม่ริม จ.เชียงใหม่",
      gender: "ไม่ระบุ",
    },
  },
];

export default function UserFarmManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("จัดการผู้ใช้งาน");

  // User Management State
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState("add");
  const [activeTab, setActiveTab] = useState("personal");
  const [searchTerm, setSearchTerm] = useState("");

  const emptyForm = {
    user_ID: null,
    first_name: "",
    last_name: "",
    birth_date: "",
    gender: "ชาย",
    phone_number: "",
    user_id_line: "",
    email: "",
    password: "",
    position: "เกษตรกร",
    farm: {
      farm_id: null,
      farm_name: "",
      area: "",
      rice_variety: "",
      planting_method: "",
      soil_type: "",
      water_management: "",
      address: "",
      gender: "",
    },
  };

  const [formData, setFormData] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
      
    function fetchData() {
      getDataUser(setIsLoading, setUsers);
       
      }
      fetchData();
}, []);



    



  const handleOpenAdd = () => {
    setCurrentMode("add");
    setFormData(emptyForm);
    setActiveTab("personal");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setCurrentMode("edit");
    setFormData(JSON.parse(JSON.stringify(user)));
    setActiveTab("personal");
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("คุณต้องการลบข้อมูลผู้ใช้งานนี้ใช่หรือไม่?")) {
      setUsers(users.filter((u) => u.user_ID !== id));
    }
  };

  const handleInputChange = (e, section = "personal") => {
    const { name, value } = e.target;
    if (section === "farm") {
      setFormData((prev) => ({
        ...prev,
        farm: { ...prev.farm, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentMode === "add") {
      const newUser = {
        ...formData,
        user_ID: Date.now(),
        farm: { ...formData.farm, farm_id: Date.now() + 1 },
      };
      setUsers([...users, newUser]);
    } else {
      setUsers(
        users.map((u) => (u.user_ID === formData.user_ID ? formData : u))
      );
    }
    setIsModalOpen(false);
  };

  // Filter users based on search
  const filteredUsers = users.filter(
    (user) =>
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.farm.farm_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateGeminiInsight = async () => {
    setIsAiModalOpen(true);
    setIsAiLoading(true);
    setAiContent("");
  };

  return (
    <div className="flex h-screen bg-slate-100  text-slate-600">
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader
          setSidebarOpen={setSidebarOpen}
          onAiClick={generateGeminiInsight}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {activeMenu}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {activeMenu === "Dashboard"
                  ? "ยินดีต้อนรับกลับมา, นี่คือสถานะล่าสุดของ Paddy Smart"
                  : "จัดการข้อมูลในระบบฐานข้อมูล"}
              </p>
            </div>
          </div>

          {/* --- Content Area based on Menu --- */}

          {/* User Management Content */}
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="text-gray-400" size={20} />
                </div>
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, นามสกุล หรือชื่อฟาร์ม..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-slate-50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button
                onClick={handleOpenAdd}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm w-full md:w-auto justify-center"
              >
                <Plus size={20} />
                <span>เพิ่มผู้ใช้งานใหม่</span>
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider border-b border-slate-200">
                      <th className="p-4 font-semibold">ชื่อ - นามสกุล</th>
                      <th className="p-4 font-semibold">ตำแหน่ง</th>
                      <th className="p-4 font-semibold">ชื่อฟาร์ม</th>
                      <th className="p-4 font-semibold">ติดต่อ</th>
                      <th className="p-4 font-semibold text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr
                          key={user.user_ID}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="bg-green-100 p-2 rounded-full text-green-700">
                                <User size={20} />
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">
                                  {user.first_name} {user.last_name}
                                </div>
                                <div className="text-xs text-slate-500">
                                  ID: {user.user_ID}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100">
                              {user.position || "-"}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              <div className="font-medium text-slate-800">
                                {user.farm?.farm_name || "-"}
                              </div>
                              <div className="text-xs text-slate-500">
                                {user.farm?.rice_variety
                                  ? `พันธุ์ข้าว: ${user.farm.rice_variety}`
                                  : ""}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-slate-600 space-y-1">
                            <div className="flex items-center space-x-2">
                              <Phone size={14} />{" "}
                              <span>{user.phone_number}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Mail size={14} />{" "}
                              <span>{user.email || "-"}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center space-x-3">
                              <button
                                onClick={() => handleOpenEdit(user)}
                                className="text-amber-500 hover:text-amber-700 transition-colors p-1 rounded hover:bg-amber-50"
                                title="แก้ไข"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(user.user_ID)}
                                className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50"
                                title="ลบ"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="p-8 text-center text-slate-500"
                        >
                          ไม่พบข้อมูลผู้ใช้งาน
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                {currentMode === "add" ? (
                  <Plus size={24} className="text-green-600" />
                ) : (
                  <Edit size={24} className="text-green-500" />
                )}
                <span>
                  {currentMode === "add"
                    ? "เพิ่มผู้ใช้งานใหม่"
                    : "แก้ไขข้อมูลผู้ใช้งาน"}
                </span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-1 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 py-4 text-center font-medium transition-colors border-b-2 ${
                  activeTab === "personal"
                    ? "border-green-600 text-green-700 bg-green-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("personal")}
              >
                <div className="flex items-center justify-center space-x-2">
                  <User size={18} />
                  <span>ข้อมูลส่วนตัว (Account)</span>
                </div>
              </button>
              <button
                className={`flex-1 py-4 text-center font-medium transition-colors border-b-2 ${
                  activeTab === "farm"
                    ? "border-green-600 text-green-700 bg-green-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("farm")}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Sprout size={18} />
                  <span>ข้อมูลเกษตร (Farm)</span>
                </div>
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Tab: Personal Info */}
              <div className={activeTab === "personal" ? "block" : "hidden"}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Row 1 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ชื่อจริง (First Name)
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      required
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      นามสกุล (Last Name)
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      required
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>

                  {/* Row 2 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      วันเกิด (Birth Date)
                    </label>
                    <input
                      type="date"
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      เพศ (Gender)
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                      <option value="ชาย">ชาย</option>
                      <option value="หญิง">หญิง</option>
                      <option value="อื่นๆ">อื่นๆ</option>
                    </select>
                  </div>

                  {/* Row 3 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      maxLength="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      LINE ID
                    </label>
                    <input
                      type="text"
                      name="user_id_line"
                      value={formData.user_id_line}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>

                  {/* Row 4 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      อีเมล (Email)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ตำแหน่ง (Position)
                    </label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                      <option value="เกษตรกร">เกษตรกร</option>
                      <option value="เจ้าหน้าที่">เจ้าหน้าที่</option>
                      <option value="ผู้ดูแลระบบ">ผู้ดูแลระบบ</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tab: Farm Info */}
              <div className={activeTab === "farm" ? "block" : "hidden"}>
                <div className=" p-4 rounded-lg mb-4">
                  <h3 className="text-green-800 font-semibold mb-2 flex items-center">
                    <MapPin size={18} className="mr-2" /> ข้อมูลแปลงเกษตรหลัก
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ชื่อฟาร์ม (Farm Name)
                      </label>
                      <input
                        type="text"
                        name="farm_name"
                        value={formData.farm.farm_name}
                        onChange={(e) => handleInputChange(e, "farm")}
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        placeholder="เช่น ไร่แสนสุข"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ขนาดพื้นที่ (ไร่/งาน)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="area"
                        value={formData.farm.area}
                        onChange={(e) => handleInputChange(e, "farm")}
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        พันธุ์ข้าว (Rice Variety)
                      </label>
                      <input
                        type="text"
                        name="rice_variety"
                        value={formData.farm.rice_variety}
                        onChange={(e) => handleInputChange(e, "farm")}
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        วิธีการปลูก (Planting Method)
                      </label>
                      <select
                        name="planting_method"
                        value={formData.farm.planting_method}
                        onChange={(e) => handleInputChange(e, "farm")}
                        className="w-full p-2 border rounded-lg focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">-- เลือก --</option>
                        <option value="นาหว่าน">นาหว่าน</option>
                        <option value="นาดำ">นาดำ</option>
                        <option value="นาหยอด">นาหยอด</option>
                        <option value="อื่นๆ">อื่นๆ</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ชนิดดิน (Soil Type)
                      </label>
                      <input
                        type="text"
                        name="soil_type"
                        value={formData.farm.soil_type}
                        onChange={(e) => handleInputChange(e, "farm")}
                        className="w-full p-2 border rounded-lg focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        การจัดการน้ำ (Water Mgt.)
                      </label>
                      <input
                        type="text"
                        name="water_management"
                        value={formData.farm.water_management}
                        onChange={(e) => handleInputChange(e, "farm")}
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ที่อยู่แปลงเกษตร (Address)
                      </label>
                      <textarea
                        name="address"
                        rows="3"
                        value={formData.farm.address}
                        onChange={(e) => handleInputChange(e, "farm")}
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Save size={18} />
                  <span>บันทึกข้อมูล</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
