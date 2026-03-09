"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
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
  deleteFarm,
  updateFarm,
  createSubArea,
  updateSubArea,
  deleteSubAreaAPI,
  getUserFarmSensorData,
} from "@/lib/admin/manage-users/user.api";
import Swal from "sweetalert2";
import { apiFetch } from "@/lib/api";

// Import Components
import { ConfirmModal, AlertModal } from "./components/Modals";
import { StatsGrid } from "./components/StatCard";
import { UserTable } from "./components/UserTable";
import { UserFormModal } from "./components/UserFormModal";
import { FarmFormModal } from "./components/FarmFormModal";
import { SubAreaModal } from "./components/SubAreaModal";
import { FarmSensorModal } from "./components/FarmSensorModal";

// Page Header Component
const PageHeader = ({ searchTerm, setSearchTerm, onAddUser }) => (
  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
    <div>
      <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
        จัดการข้อมูลเกษตรกร
      </h1>
      <p className="text-slate-500 mt-1 text-sm md:text-base">
        จัดการข้อมูลพื้นฐาน ฟาร์ม และพื้นที่เพาะปลูก
      </p>
    </div>
    <div className="flex gap-3 w-full lg:w-auto">
      <div className="relative flex-1 lg:w-72">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          placeholder="ค้นหาชื่อเกษตรกร..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <button
        onClick={onAddUser}
        className="bg-emerald-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all font-semibold whitespace-nowrap"
      >
        <Plus size={20} />
        <span className="hidden md:inline">เพิ่มผู้ใช้งาน</span>
      </button>
    </div>
  </div>
);

// Main Component
export default function UserFarmManagement() {
  // UI States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("ManageUsers");
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Data States
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isFarmModalOpen, setIsFarmModalOpen] = useState(false);
  const [isSubAreaModalOpen, setIsSubAreaModalOpen] = useState(false);
  const [isFarmSensorModalOpen, setIsFarmSensorModalOpen] = useState(false);

  // Form Data States
  const [userFormData, setUserFormData] = useState({});
  const [userMode, setUserMode] = useState("add");
  const [farmFormData, setFarmFormData] = useState({});
  const [editingFarmIndex, setEditingFarmIndex] = useState(-1);

  // Sub Area States
  const [currentFarmForSubArea, setCurrentFarmForSubArea] = useState(null);
  const [newSubAreaName, setNewSubAreaName] = useState("");
  const [editingSubAreaId, setEditingSubAreaId] = useState(null);
  const [tempSubAreaName, setTempSubAreaName] = useState("");

  // Farm Sensor Modal States
  const [farmSensorData, setFarmSensorData] = useState([]);
  const [farmSensorLoading, setFarmSensorLoading] = useState(false);
  const [selectedUserForFarmSensor, setSelectedUserForFarmSensor] = useState(null);

  // Confirmation & Alert States
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

  // Fetch users on mount
  useEffect(() => {
    getUsers(setUsers, setIsLoading);
  }, []);

  // Reset page on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filter users based on search
  const filteredUsers = users?.filter(
    (u) =>
      u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Alert/Confirm helpers
  const showAlert = (message) => setAlertConfig({ isOpen: true, message });
  const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });
  const closeConfirm = () => setConfirmConfig({ ...confirmConfig, isOpen: false });

  // ============== USER HANDLERS ==============
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
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user) => {
    setUserMode("edit");
    let formattedUser = JSON.parse(JSON.stringify(user));
    if (formattedUser.birth_date?.includes("T")) {
      formattedUser.birth_date = formattedUser.birth_date.split("T")[0];
    }
    setUserFormData(formattedUser);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (userMode === "add") {
        await createUser(userFormData, setLoading, setUsers);
      } else {
        await updateUserList(userFormData, setUsers);
      }
      setIsUserModalOpen(false);
    } catch (error) {
      console.error("Failed to save user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (id) => {
    try {
      deleteUser(id, setUsers, users);
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleImpersonate = async (userId) => {
    try {
      const response = await apiFetch("/api/admin/impersonate", {
        method: "POST",
        body: { target_user_id: userId },
      });

      if (!response.ok) {
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด",
          text: "ไม่สามารถเข้าสู่ระบบในฐานะผู้ใช้ได้",
        });
        return;
      }
      window.location.href = "/Paddy/agriculture/dashboard";
    } catch (error) {
      console.error("Impersonate Error:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
      });
    }
  };

  // ============== FARM HANDLERS ==============
  const openAddFarm = () => {
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

    try {
      let resultFarm;
      if (editingFarmIndex >= 0) {
        resultFarm = await updateFarm(farmFormData.farm_id, farmFormData);
        if (!resultFarm) return;

        const updatedFarms = [...userFormData.Farm];
        updatedFarms[editingFarmIndex] = resultFarm;
        setUserFormData({ ...userFormData, Farm: updatedFarms });
        setUsers((prev) =>
          prev.map((u) =>
            u.user_ID === userFormData.user_ID ? { ...u, Farm: updatedFarms } : u
          )
        );
      } else {
        resultFarm = await createFarm(userFormData.user_ID, farmFormData);
        if (!resultFarm) return;

        const newFarms = [...(userFormData.Farm || []), resultFarm];
        setUserFormData({ ...userFormData, Farm: newFarms });
        setUsers((prev) =>
          prev.map((u) =>
            u.user_ID === userFormData.user_ID ? { ...u, Farm: newFarms } : u
          )
        );
      }
      setIsFarmModalOpen(false);
    } finally {
      setLoading(false);
    }
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
        setUserFormData({ ...userFormData, Farm: updatedFarms });
        setUsers((prev) =>
          prev.map((u) =>
            u.user_ID === userFormData.user_ID ? { ...u, Farm: updatedFarms } : u
          )
        );
      } finally {
        setLoading(false);
      }
    });
  };

  // ============== SUB AREA HANDLERS ==============
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
      const newSub = await createSubArea(currentFarmForSubArea.farm_id, newSubAreaName);
      if (!newSub) return;

      const updatedSubAreas = [...(currentFarmForSubArea.areas || []), newSub];
      const updatedFarm = { ...currentFarmForSubArea, areas: updatedSubAreas };

      setCurrentFarmForSubArea(updatedFarm);
      setNewSubAreaName("");

      const updatedFarms = [...userFormData.Farm];
      updatedFarms[currentFarmForSubArea._index] = updatedFarm;

      setUserFormData({ ...userFormData, Farm: updatedFarms });
      setUsers((prev) =>
        prev.map((u) =>
          u.user_ID === userFormData.user_ID ? { ...u, Farm: updatedFarms } : u
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
        a.area_id === areaId ? { ...a, area_name: updatedArea.area_name } : a
      );
      const updatedFarm = { ...currentFarmForSubArea, areas: updatedSubAreas };

      setCurrentFarmForSubArea(updatedFarm);
      setEditingSubAreaId(null);

      const updatedFarms = [...userFormData.Farm];
      updatedFarms[currentFarmForSubArea._index] = updatedFarm;

      setUserFormData({ ...userFormData, Farm: updatedFarms });
      setUsers((prev) =>
        prev.map((u) =>
          u.user_ID === userFormData.user_ID ? { ...u, Farm: updatedFarms } : u
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
        const success = await deleteSubAreaAPI(areaId);
        if (!success) return;

        const updatedSubAreas = currentFarmForSubArea.areas.filter(
          (a) => a.area_id !== areaId
        );
        const updatedFarm = { ...currentFarmForSubArea, areas: updatedSubAreas };

        setCurrentFarmForSubArea(updatedFarm);

        const updatedFarms = [...userFormData.Farm];
        updatedFarms[currentFarmForSubArea._index] = updatedFarm;

        setUserFormData({ ...userFormData, Farm: updatedFarms });
        setUsers((prev) =>
          prev.map((u) =>
            u.user_ID === userFormData.user_ID ? { ...u, Farm: updatedFarms } : u
          )
        );
      } finally {
        setLoading(false);
      }
    });
  };

  // ============== FARM SENSOR HANDLERS ==============
  const handleViewFarmSensor = async (user) => {
    setSelectedUserForFarmSensor(user);
    setIsFarmSensorModalOpen(true);
    setFarmSensorLoading(true);
    setFarmSensorData([]);

    try {
      const data = await getUserFarmSensorData(user.user_ID);
      if (data) setFarmSensorData(data);
    } catch (error) {
      console.error("Failed to fetch farm sensor data:", error);
    } finally {
      setFarmSensorLoading(false);
    }
  };

  // Pagination handlers
  const goToNextPage = () => {
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-600">
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      <div className="flex flex-1 flex-col overflow-hidden relative">
        <AdminHeader setSidebarOpen={setSidebarOpen} />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-emerald-600" size={48} />
              <p className="text-slate-500 font-medium">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8 z-0">
          {/* Page Header */}
          <PageHeader
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAddUser={handleOpenAddUser}
          />

          {/* Stats Grid */}
          <StatsGrid users={users} />

          {/* User Table */}
          <UserTable
            users={filteredUsers}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onView={handleViewFarmSensor}
            onEdit={handleOpenEditUser}
            onDelete={handleDeleteUser}
            onImpersonate={handleImpersonate}
            onPrevPage={goToPrevPage}
            onNextPage={goToNextPage}
          />

          <Footer />
        </main>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        isLoading={loading}
      />

      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={closeAlert}
        message={alertConfig.message}
      />

      <UserFormModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        mode={userMode}
        formData={userFormData}
        setFormData={setUserFormData}
        onSave={handleSaveUser}
        loading={loading}
        onAddFarm={openAddFarm}
        onEditFarm={openEditFarm}
        onDeleteFarm={handleDeleteFarm}
        onManageSubArea={openSubAreaManager}
      />

      <FarmFormModal
        isOpen={isFarmModalOpen}
        onClose={() => setIsFarmModalOpen(false)}
        isEditing={editingFarmIndex >= 0}
        formData={farmFormData}
        setFormData={setFarmFormData}
        onSave={handleSaveFarm}
        loading={loading}
      />

      <SubAreaModal
        isOpen={isSubAreaModalOpen}
        onClose={() => setIsSubAreaModalOpen(false)}
        farm={currentFarmForSubArea}
        newSubAreaName={newSubAreaName}
        setNewSubAreaName={setNewSubAreaName}
        editingSubAreaId={editingSubAreaId}
        tempSubAreaName={tempSubAreaName}
        setTempSubAreaName={setTempSubAreaName}
        onAddSubArea={handleAddSubArea}
        onStartEdit={startEditSubArea}
        onSaveEdit={saveEditSubArea}
        onCancelEdit={() => setEditingSubAreaId(null)}
        onDelete={deleteSubArea}
        loading={loading}
      />

      <FarmSensorModal
        isOpen={isFarmSensorModalOpen}
        onClose={() => setIsFarmSensorModalOpen(false)}
        selectedUser={selectedUserForFarmSensor}
        farmData={farmSensorData}
        loading={farmSensorLoading}
      />
    </div>
  );
}
