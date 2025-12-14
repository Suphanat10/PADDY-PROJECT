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
  Settings,
  Layers,
  Phone,
  User as UserIcon,
  Tractor,
  Loader2,
  Check,
  LayoutGrid,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Footer from "@/app/components/Footer";

import {
  AdminSidebar,
  AdminHeader,
} from "../../../components/admin/AdminLayout";
import {
  getUsers,
  createUser,
  deleteUser,
  updateUserList,
  createFarm,
  deleteFarm ,
  updateFarm,
  createSubArea ,
  updateSubArea , 
  deleteSubAreaAPI ,
} from "@/lib/admin/manage-users/user.api";
import Swal from "sweetalert2";


const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-slate-500 text-sm mb-6">{message}</p>
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
            >
              ยกเลิก
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "ยืนยันลบ"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AlertModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-xl p-6 animate-in zoom-in-95 duration-200 max-w-sm w-full">
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-800 mb-2">แจ้งเตือน</h3>
          <p className="text-slate-600 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="w-full py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
          >
            ตกลง
          </button>
        </div>
      </div>
    </div>
  );
};

export default function UserFarmManagement() {
  const [activeMenu, setActiveMenu] = useState("จัดการผู้ใช้งาน");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      getUsers(setUsers, setIsLoading);
    };
    fetchUsers();
  }, []);

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Modal States ---
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isFarmModalOpen, setIsFarmModalOpen] = useState(false);
  const [isSubAreaModalOpen, setIsSubAreaModalOpen] = useState(false);

  // --- Confirmation & Alert States ---
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    message: "",
  });

  // --- Data States ---
  const [activeTab, setActiveTab] = useState("personal");
  const [userFormData, setUserFormData] = useState({});
  const [userMode, setUserMode] = useState("add");
  const [editingFarmIndex, setEditingFarmIndex] = useState(-1);
  const [farmFormData, setFarmFormData] = useState({});
  const [currentFarmForSubArea, setCurrentFarmForSubArea] = useState(null);
  const [newSubAreaName, setNewSubAreaName] = useState("");
  const [editingSubAreaId, setEditingSubAreaId] = useState(null);
  const [tempSubAreaName, setTempSubAreaName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // --- AI States ---
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiContent, setAiContent] = useState("");

  const showAlert = (message) => setAlertConfig({ isOpen: true, message });
  const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });
  const showConfirm = (title, message, onConfirmAction) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      onConfirm: onConfirmAction,
    });
  };
  const closeConfirm = () =>
    setConfirmConfig({ ...confirmConfig, isOpen: false });

  const filteredUsers =
    users && users.length > 0
      ? users.filter(
          (u) =>
            u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // ================= USER LOGIC =================
  const handleOpenAddUser = () => {
    setUserMode("add");
    setUserFormData({
      first_name: "",
      last_name: "",
      phone_number: "",
      birth_date: "",
      email: "",
      position: "Agriculture",
      gender: "ชาย",
    });
    setActiveTab("personal");
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user) => {
    setUserMode("edit");
    let formattedUser = JSON.parse(JSON.stringify(user));
    if (formattedUser.birth_date && formattedUser.birth_date.includes("T")) {
      formattedUser.birth_date = formattedUser.birth_date.split("T")[0];
    }
    setUserFormData(formattedUser);
    setActiveTab("personal");
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (userMode === "add") {
        const response = await createUser(userFormData, setLoading, setUsers);
      } else if (userMode === "edit") {
        const response = await updateUserList(userFormData,setUsers);
     
      }
      setIsUserModalOpen(false);
    } catch (error) {
      console.error("Failed to save user:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let pass = "";
    for (let i = 0; i < 9; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setUserFormData({ ...userFormData, password: pass });
  };

  const handleDeleteUser = (id) => {
    try {
      deleteUser(id, setUsers, users);
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  // ================= FARM LOGIC (UPDATED FOR NEW KEYS) =================
  const openAddFarm = () => {
    // ใช้ key: area, areas
    setFarmFormData({
      farm_id: null,
      farm_name: "",
      area: "",
      address: "",
      rice_variety: "",
      planting_method: "นาหว่าน",
      soil_type: "ดินเหนียว",
      water_management: "น้ำฝน",
      areas: [],
    });
    setEditingFarmIndex(-1);
    setIsFarmModalOpen(true);
  };

  const openEditFarm = (index) => {
    setFarmFormData(JSON.parse(JSON.stringify(userFormData.Farm[index])));
    setEditingFarmIndex(index);
    setIsFarmModalOpen(true);
  };

  const handleSaveFarm = async (e) => {
    e.preventDefault();
    if (!farmFormData.farm_name) {
      showAlert("กรุณาระบุชื่อฟาร์ม");
      return;
    }
    setLoading(true);

    let resultFarm;
    if (editingFarmIndex >= 0) {
       resultFarm = await updateFarm(
        farmFormData.farm_id,
        farmFormData
      );

      if (!resultFarm) return;

      const updatedFarms = [...userFormData.Farm];
      updatedFarms[editingFarmIndex] = resultFarm;

      setUserFormData({ ...userFormData, Farm: updatedFarms });

      setUsers((prev) =>
        prev.map((u) =>
          u.user_ID === userFormData.user_ID
            ? { ...u, Farm: updatedFarms }
            : u
        )
      );
    } else {
     
       resultFarm = await createFarm(
        userFormData.user_ID,
        farmFormData
      );

      if (!resultFarm) return;

      const newFarms = [...(userFormData.Farm || []), resultFarm];

      setUserFormData({ ...userFormData, Farm: newFarms });
      setUsers(
        users.map((u) =>
          u.user_ID === userFormData.user_ID
            ? { ...u, Farm: newFarms }
            : u
        )
      );
    }
    setLoading(false);
    setIsFarmModalOpen(false);
  };


  const handleDeleteFarm = (index) => {
  const farmId = userFormData.Farm[index]?.farm_id;
  if (!farmId) return;

  Swal.fire({
    title: "ยืนยันการลบฟาร์ม?",
    text: "ข้อมูลฟาร์มและพื้นที่ย่อยทั้งหมดจะถูกลบ",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "ยืนยันลบ",
    cancelButtonText: "ยกเลิก",
  }).then(async (result) => {
    if (!result.isConfirmed) return;

    setLoading(true);

    try {
      const success = await deleteFarm(farmId);
      if (!success) return;

      const updatedFarms = userFormData.Farm.filter((_, i) => i !== index);

      setUserFormData({
        ...userFormData,
        Farm: updatedFarms,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.user_ID === userFormData.user_ID
            ? { ...u, Farm: updatedFarms }
            : u
        )
      );

    } finally {
      setLoading(false);
    }
  });
};

  const openSubAreaManager = (farm, index) => {
    setCurrentFarmForSubArea({ ...farm, _index: index });
    setNewSubAreaName("");
    setEditingSubAreaId(null);
    setIsSubAreaModalOpen(true);
  };


  const handleAddSubArea = async () => {
  if (!newSubAreaName.trim()) return;

  setLoading(true);

  try {
    const newSub = await createSubArea(
      currentFarmForSubArea.farm_id,
      newSubAreaName
    );

    if (!newSub) return;

    const updatedSubAreas = [
      ...(currentFarmForSubArea.areas || []),
      newSub,
    ];

    const updatedFarm = {
      ...currentFarmForSubArea,
      areas: updatedSubAreas,
    };

    setCurrentFarmForSubArea(updatedFarm);
    setNewSubAreaName("");

    const index = currentFarmForSubArea._index;

    const updatedFarms = [...userFormData.Farm];
    updatedFarms[index] = updatedFarm;

    setUserFormData({ ...userFormData, Farm: updatedFarms });

    setUsers((prev) =>
      prev.map((u) =>
        u.user_ID === userFormData.user_ID
          ? { ...u, Farm: updatedFarms }
          : u
      )
    );
  } finally {
    setLoading(false);
  }
};

  const startEditSubArea = (area) => {
    setEditingSubAreaId(area.area_id);
    setTempSubAreaName(area.area_name);
  };


  const saveEditSubArea = async (areaId) => {
  if (!tempSubAreaName.trim()) return;

  setLoading(true);

  try {
    const updatedArea = await updateSubArea(areaId, tempSubAreaName);

    if (!updatedArea) return;

    const updatedSubAreas = currentFarmForSubArea.areas.map((a) =>
      a.area_id === areaId
        ? { ...a, area_name: updatedArea.area_name }
        : a
    );

    const updatedFarm = {
      ...currentFarmForSubArea,
      areas: updatedSubAreas,
    };

    setCurrentFarmForSubArea(updatedFarm);
    setEditingSubAreaId(null);

    const index = currentFarmForSubArea._index;
    const updatedFarms = [...userFormData.Farm];
    updatedFarms[index] = updatedFarm;

    setUserFormData({ ...userFormData, Farm: updatedFarms });

    setUsers((prev) =>
      prev.map((u) =>
        u.user_ID === userFormData.user_ID
          ? { ...u, Farm: updatedFarms }
          : u
      )
    );
  } finally {
    setLoading(false);
  }
};

const deleteSubArea = (areaId) => {
  Swal.fire({
    title: "คุณแน่ใจหรือไม่?",
    text: "การลบพื้นที่ย่อยนี้จะไม่สามารถกู้คืนได้!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "ใช่, ลบพื้นที่ย่อยนี้!",
    cancelButtonText: "ยกเลิก",
  }).then(async (result) => {
    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      // ✅ เรียก API จริง (lib)
      const success = await deleteSubAreaAPI(areaId);
      if (!success) return;

      const updatedSubAreas = currentFarmForSubArea.areas.filter(
        (a) => a.area_id !== areaId
      );

      const updatedFarm = {
        ...currentFarmForSubArea,
        areas: updatedSubAreas,
      };

      setCurrentFarmForSubArea(updatedFarm);

      const index = currentFarmForSubArea._index;
      const updatedFarms = [...userFormData.Farm];
      updatedFarms[index] = updatedFarm;

      setUserFormData({ ...userFormData, Farm: updatedFarms });

      setUsers((prev) =>
        prev.map((u) =>
          u.user_ID === userFormData.user_ID
            ? { ...u, Farm: updatedFarms }
            : u
        )
      );
    } finally {
      setLoading(false);
    }
  });
};


  const generateGeminiInsight = async () => {
    setIsAiModalOpen(true);
    setIsAiLoading(true);
    setAiContent("");
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-600">
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <AdminHeader
          setSidebarOpen={setSidebarOpen}
          onAiClick={generateGeminiInsight}
        />

        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
            <Loader2 className="animate-spin text-green-600" size={48} />
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8 z-0">
          {/* Main User List Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
                รายชื่อเกษตรกร
              </h2>
              <p className="text-slate-500 mt-1">
                จัดการข้อมูลพื้นฐานและพื้นที่เพาะปลูก
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={handleOpenAddUser}
                className="bg-green-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-green-700 shadow-lg shadow-green-200 transition-all font-medium"
              >
                <Plus size={20} />{" "}
                <span className="hidden md:inline">เพิ่มผู้ใช้งาน</span>
              </button>
            </div>
          </div>

          {/* Stats (Updated keys) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users size={28} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">
                  {users.length}
                </div>
                <div className="text-xs text-slate-500 font-bold uppercase">
                  เกษตรกร (คน)
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <Sprout size={28} />
              </div>
              {/* Farm key */}
              <div>
                <div className="text-2xl font-bold text-slate-800">
                  {users.reduce(
                    (acc, u) => acc + (u.Farm ? u.Farm.length : 0),
                    0
                  )}
                </div>
                <div className="text-xs text-slate-500 font-bold uppercase">
                  ฟาร์ม (แห่ง)
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Layers size={28} />
              </div>
              {/* Farm key + area key */}
              <div>
                <div className="text-2xl font-bold text-slate-800">
                  {users
                    .reduce(
                      (acc, u) =>
                        acc +
                        (u.Farm
                          ? u.Farm.reduce((a, f) => a + Number(f.area || 0), 0)
                          : 0),
                      0
                    )
                    .toFixed(1)}
                </div>
                <div className="text-xs text-slate-500 font-bold uppercase">
                  พื้นที่ (ไร่)
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold tracking-wider">
                  <tr>
                    <th className="p-6 pl-8">ลำดับ</th>
                    <th className="p-6">ชื่อ - นามสกุล</th>
                    <th className="p-6">สิทธิการเข้าถึงระบบ</th>
                    <th className="p-6 text-right pr-8">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user, index) => (
                      <tr
                        key={user.user_ID}
                        className="group hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="p-6 pl-8 font-medium text-slate-800">
                          {index + 1}
                        </td>

                        <td className="p-6 pl-8">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-green-100 flex items-center justify-center text-green-500 font-bold border border-white shadow-sm">
                              {user.first_name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
                                <Phone size={10} /> {user.phone_number}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 align-top">
                          <div className="flex flex-col gap-2">
                            <div className="text-sm font-medium text-slate-700">
                              ตำแหน่ง: {user.position}
                            </div>
                            <div className="text-sm font-medium text-slate-700">
                              เพศ: {user.gender}
                            </div>
                          </div>
                        </td>
                        <td className="p-6 pr-8 text-right">
                          <div className="flex justify-end gap-2 relative z-10">
                            <button
                              type="button"
                              onClick={() => handleOpenEditUser(user)}
                              className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user.user_ID)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
                        colSpan="3"
                        className="p-8 text-center text-slate-400"
                      >
                        ไม่พบข้อมูลที่ค้นหา
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* --- Pagination Controls --- */}
            {filteredUsers.length > 0 && (
              <div className="flex items-center justify-between px-8 py-4 border-t border-slate-100 bg-white">
                <div className="text-sm text-slate-500">
                  แสดง{" "}
                  <span className="font-semibold text-slate-700">
                    {indexOfFirstItem + 1}
                  </span>{" "}
                  ถึง{" "}
                  <span className="font-semibold text-slate-700">
                    {Math.min(indexOfLastItem, filteredUsers.length)}
                  </span>{" "}
                  จากทั้งหมด{" "}
                  <span className="font-semibold text-slate-700">
                    {filteredUsers.length}
                  </span>{" "}
                  รายการ
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg border flex items-center gap-1 text-sm font-medium transition-colors ${
                      currentPage === 1
                        ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                  >
                    <ChevronLeft size={16} /> ก่อนหน้า
                  </button>

                  <div className="px-2 text-sm font-medium text-slate-600">
                    หน้า {currentPage} จาก {totalPages}
                  </div>

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg border flex items-center gap-1 text-sm font-medium transition-colors ${
                      currentPage === totalPages
                        ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                  >
                    ถัดไป <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
    
          </div>
              <Footer />
        </main>
            
      </div>

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        isLoading={loading}
      />

      {/* --- Global Alert Modal --- */}
      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={closeAlert}
        message={alertConfig.message}
      />

      {isUserModalOpen && (
        <div className="fixed inset-0 z-40 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm transition-opacity"
              onClick={() => setIsUserModalOpen(false)}
            ></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>

            <div className="relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl w-full h-[85vh] flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                <h3 className="font-bold text-xl text-slate-800">
                  {userMode === "add"
                    ? "เพิ่มข้อมูลผู้ใช้งานใหม่"
                    : "จัดการข้อมูลเกษตรกร"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Tabs */}
              <div className="px-6 py-2 bg-slate-50 border-b border-slate-100 shrink-0">
                <div className="flex p-1 bg-slate-200/50 rounded-lg w-fit">
                  <button
                    type="button"
                    onClick={() => setActiveTab("personal")}
                    className={`px-6 py-2 text-sm font-semibold rounded-md transition-all ${
                      activeTab === "personal"
                        ? "bg-white text-green-700 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    ข้อมูลส่วนตัว
                  </button>
                  {userMode !== "add" && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("farm")}
                      className={`px-6 py-2 text-sm font-semibold rounded-md transition-all ${
                        activeTab === "farm"
                          ? "bg-white text-green-700 shadow-sm"
                          : "text-slate-500"
                      }`}
                    >
                      รายการฟาร์ม (
                      {userFormData.Farm ? userFormData.Farm.length : 0})
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                {activeTab === "personal" ? (
                  <form onSubmit={handleSaveUser} className="max-w-4xl mx-auto">
                    <h3 className="font-bold text-lg text-slate-700 mb-4">
                      {userMode === "add"
                        ? "เพิ่มข้อมูลเกษตรกร"
                        : "แก้ไขข้อมูลเกษตรกร"}
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">
                      กรุณากรอกข้อมูลส่วนตัวของเกษตรกรให้ครบถ้วน
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* --- ชื่อ --- */}
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">
                          ชื่อจริง <span className="text-red-500">*</span>
                        </label>
                        <input
                          required
                          className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          value={userFormData.first_name || ""}
                          onChange={(e) =>
                            setUserFormData({
                              ...userFormData,
                              first_name: e.target.value,
                            })
                          }
                        />
                      </div>

                      {/* --- นามสกุล --- */}
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">
                          นามสกุล <span className="text-red-500">*</span>
                        </label>
                        <input
                          required
                          className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          value={userFormData.last_name || ""}
                          onChange={(e) =>
                            setUserFormData({
                              ...userFormData,
                              last_name: e.target.value,
                            })
                          }
                        />
                      </div>

                      {/* --- เพศ --- */}
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">
                          เพศ
                        </label>
                        <select
                          className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          value={userFormData.gender || "ชาย"}
                          onChange={(e) =>
                            setUserFormData({
                              ...userFormData,
                              gender: e.target.value,
                            })
                          }
                        >
                          <option value="ชาย">ชาย</option>
                          <option value="หญิง">หญิง</option>
                          <option value="อื่นๆ">อื่นๆ</option>
                        </select>
                      </div>

                      {/* --- เบอร์โทร --- */}
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">
                          เบอร์โทรศัพท์
                        </label>
                        <input
                          className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          value={userFormData.phone_number || ""}
                          onChange={(e) =>
                            setUserFormData({
                              ...userFormData,
                              phone_number: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">
                          ตำแหน่ง
                        </label>
                        <input
                          className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm"
                          value={userFormData.position || ""}
                          disabled
                        />
                      </div>

                      {/* --- วันเกิด --- */}
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">
                          วันเกิด
                        </label>
                        <input
                          type="date"
                          className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          value={userFormData.birth_date || ""}
                          onChange={(e) =>
                            setUserFormData({
                              ...userFormData,
                              birth_date: e.target.value,
                            })
                          }
                        />
                      </div>

                      {/* --- อีเมล --- */}
                      <div className="space-y-1 md:col-span-1">
                        <label className="text-sm font-medium text-slate-700">
                          อีเมล
                        </label>
                        <input
                          type="email"
                          className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          value={userFormData.email || ""}
                          onChange={(e) =>
                            setUserFormData({
                              ...userFormData,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>

                      {/* --- รหัสผ่าน (แสดงเฉพาะตอนเพิ่มข้อมูลใหม่) --- */}
                      {userMode === "add" && (
                        <div className="space-y-1 md:col-span-1">
                          <label className="text-sm font-medium text-slate-700">
                            รหัสผ่าน <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-3">
                            <input
                              type="text"
                              placeholder="กรุณากำหนดรหัสผ่าน หรือกดปุ่มสุ่ม"
                              className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                              value={userFormData.password || ""}
                              onChange={(e) =>
                                setUserFormData({
                                  ...userFormData,
                                  password: e.target.value,
                                })
                              }
                            />
                            <button
                              type="button"
                              onClick={generatePassword}
                              className="whitespace-nowrap px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                              <Settings
                                size={16}
                                className="animate-spin-slow"
                              />{" "}
                              สุ่มรหัส
                            </button>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            * รหัสผ่านจะถูกแสดงให้เห็น ณ ตอนนี้เท่านั้น
                          </p>
                        </div>
                      )}
                      <div className="md:col-span-2 flex justify-end pt-4 border-t border-slate-100 mt-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 shadow-lg shadow-green-200 transition-all font-medium flex items-center gap-2"
                        >
                          {loading ? (
                            <Loader2 className="animate-spin" size={18} />
                          ) : (
                            <Save size={18} />
                          )}{" "}
                          บันทึกข้อมูลส่วนตัว
                        </button>
                      </div>

           
                    </div>
                  </form>
                ) : (
                  <div className="max-w-5xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="font-bold text-slate-700 text-lg">
                        รายการฟาร์มทั้งหมด
                      </h4>
                      <button
                        type="button"
                        onClick={openAddFarm}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 shadow-sm transition-all text-sm font-medium"
                      >
                        <Plus size={18} /> เพิ่มแปลงใหม่
                      </button>
                    </div>

                    {/* Check Farm length (JSON uses Farm with capital F) */}
                    {!userFormData.Farm || userFormData.Farm.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                        <Tractor className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                        <p className="text-slate-500 font-medium">
                          ไม่พบข้อมูลแปลงนา
                        </p>
                        <button
                          type="button"
                          onClick={openAddFarm}
                          className="text-green-600 hover:underline text-sm mt-2"
                        >
                          เพิ่มแปลงใหม่
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userFormData.Farm.map((farm, idx) => (
                          <div
                            key={farm.farm_id || idx}
                            className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all flex flex-col overflow-hidden group"
                          >
                            <div className="p-5 flex-grow">
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-bold text-slate-800 line-clamp-1">
                                  {farm.farm_name}
                                </h3>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                    farm.planting_method === "นาหว่าน"
                                      ? "bg-amber-50 text-amber-700 border-amber-100"
                                      : "bg-blue-50 text-blue-700 border-blue-100"
                                  }`}
                                >
                                  {farm.planting_method}
                                </span>
                              </div>

                              <div className="space-y-2 text-sm text-slate-600 mb-4">
                                <div className="flex justify-between border-b border-slate-50 pb-1">
                                  <span className="text-slate-400">
                                    พื้นที่
                                  </span>
                                  <span className="font-medium">
                                    {farm.area} ไร่
                                  </span>
                                </div>
                                <div className="flex justify-between border-b border-slate-50 pb-1">
                                  <span className="text-slate-400">
                                    พันธุ์ข้าว
                                  </span>
                                  <span className="font-medium">
                                    {farm.rice_variety}
                                  </span>
                                </div>
                              </div>

                              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                  {/* Check areas length */}
                                  <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <LayoutGrid size={12} /> พื้นที่ย่อย (
                                    {farm.areas ? farm.areas.length : 0})
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openSubAreaManager(farm, idx)
                                    }
                                    className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <Settings size={10} /> จัดการพื้นที่
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {farm.areas && farm.areas.length > 0 ? (
                                    farm.areas.map((sub, i) => (
                                      <span
                                        key={i}
                                        className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600"
                                      >
                                        {sub.area_name}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[10px] text-slate-400 italic">
                                      - ว่าง -
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditFarm(idx)}
                                className="text-xs flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-md hover:border-green-500 hover:text-green-600 transition-colors"
                              >
                                <Edit size={14} /> แก้ไขข้อมูล
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteFarm(idx)}
                                className="text-xs flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-md hover:border-red-500 hover:text-red-600 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================================
          2. FARM INFO MODAL 
      ================================================================================== */}
      {isFarmModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-[rgba(0,0,0,0.6)] transition-opacity"
              onClick={() => setIsFarmModalOpen(false)}
            ></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>

            <div className="relative inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
              <form onSubmit={handleSaveFarm}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                  <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">
                      {editingFarmIndex >= 0
                        ? "แก้ไขข้อมูลแปลงนา"
                        : "เพิ่มแปลงนาใหม่"}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsFarmModalOpen(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ชื่อแปลง / ฟาร์ม <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        placeholder="เช่น แปลงนาทุ่งทอง 1"
                        value={farmFormData.farm_name || ""}
                        onChange={(e) =>
                          setFarmFormData({
                            ...farmFormData,
                            farm_name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      {/* Use area instead of total_area */}
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ขนาดพื้นที่รวม (ไร่){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        placeholder="0.0"
                        value={farmFormData.area || ""}
                        onChange={(e) =>
                          setFarmFormData({
                            ...farmFormData,
                            area: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        พันธุ์ข้าว <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        value={farmFormData.rice_variety || ""}
                        onChange={(e) =>
                          setFarmFormData({
                            ...farmFormData,
                            rice_variety: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        วิธีการปลูก
                      </label>
                      <select
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        value={farmFormData.planting_method || "นาหว่าน"}
                        onChange={(e) =>
                          setFarmFormData({
                            ...farmFormData,
                            planting_method: e.target.value,
                          })
                        }
                      >
                        <option value="นาหว่าน">นาหว่าน</option>
                        <option value="นาดำ">นาดำ</option>
                        <option value="นาหยอด">นาหยอด</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ชนิดดิน
                      </label>
                      <select
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        value={farmFormData.soil_type || "ดินเหนียว"}
                        onChange={(e) =>
                          setFarmFormData({
                            ...farmFormData,
                            soil_type: e.target.value,
                          })
                        }
                      >
                        <option value="ดินเหนียว">ดินเหนียว</option>
                        <option value="ดินร่วน">ดินร่วน</option>
                        <option value="ดินทราย">ดินทราย</option>
                        <option value="ดินร่วนปนทราย">ดินร่วนปนทราย</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        การจัดการน้ำ
                      </label>
                      <select
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        value={farmFormData.water_management || "น้ำฝน"}
                        onChange={(e) =>
                          setFarmFormData({
                            ...farmFormData,
                            water_management: e.target.value,
                          })
                        }
                      >
                        <option value="น้ำฝน">น้ำฝน</option>
                        <option value="ชลประทาน">ชลประทาน</option>
                        <option value="บ่อบาดาล">บ่อบาดาล</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ที่อยู่แปลงนา
                      </label>
                      <textarea
                        rows="3"
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm resize-none"
                        placeholder="บ้านเลขที่ หมู่ ตำบล อำเภอ จังหวัด..."
                        value={farmFormData.address || ""}
                        onChange={(e) =>
                          setFarmFormData({
                            ...farmFormData,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin mr-2" size={18} />
                    ) : (
                      <Save size={18} className="mr-2" />
                    )}{" "}
                    บันทึกข้อมูล
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFarmModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isSubAreaModalOpen && currentFarmForSubArea && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-[rgba(0,0,0,0.6)] transition-opacity"
              onClick={() => setIsSubAreaModalOpen(false)}
            ></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>

            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-green-600 px-4 py-3 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-bold text-white flex items-center gap-2">
                  <Layers size={20} /> จัดการพื้นที่ย่อย
                </h3>
                <button
                  type="button"
                  onClick={() => setIsSubAreaModalOpen(false)}
                  className="text-green-100 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <p className="text-sm text-gray-500">แปลงหลัก:</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {currentFarmForSubArea.farm_name}
                  </p>
                </div>

                <div className="flex gap-2 mb-6">
                  <input
                    type="text"
                    value={newSubAreaName}
                    onChange={(e) => setNewSubAreaName(e.target.value)}
                    placeholder="ชื่อพื้นที่ย่อยใหม่..."
                    className="flex-grow border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubArea}
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 flex items-center gap-1 shadow-sm"
                  >
                    <Plus size={16} /> เพิ่ม
                  </button>
                </div>

                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {/* Use areas */}
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    รายการพื้นที่ย่อย (
                    {currentFarmForSubArea.areas
                      ? currentFarmForSubArea.areas.length
                      : 0}
                    )
                  </p>

                  {currentFarmForSubArea.areas &&
                  currentFarmForSubArea.areas.length > 0 ? (
                    currentFarmForSubArea.areas.map((area) => (
                      <div
                        key={area.area_id}
                        className="flex justify-between items-center bg-gray-50 border border-gray-200 p-3 rounded-lg group hover:border-green-200 transition-colors"
                      >
                        {editingSubAreaId === area.area_id ? (
                          <div className="flex-grow flex gap-2 mr-2">
                            <input
                              type="text"
                              value={tempSubAreaName}
                              onChange={(e) =>
                                setTempSubAreaName(e.target.value)
                              }
                              autoFocus
                              className="flex-grow border border-blue-300 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => saveEditSubArea(area.area_id)}
                              className="text-green-600 hover:bg-green-100 p-1 rounded"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingSubAreaId(null)}
                              className="text-gray-500 hover:bg-gray-200 p-1 rounded"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-800">
                              {area.area_name}
                            </span>
                      
                          </div>
                        )}

                        {editingSubAreaId !== area.area_id && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => startEditSubArea(area)}
                              className="text-gray-400 hover:text-blue-600 p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                              title="แก้ไขชื่อ"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteSubArea(area.area_id)}
                              className="text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                              title="ลบ"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                      <Layers className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                      <p className="text-sm text-gray-400">
                        ยังไม่มีพื้นที่ย่อย
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsSubAreaModalOpen(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:w-auto sm:text-sm"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
