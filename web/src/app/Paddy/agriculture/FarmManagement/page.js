"use client";

import React, { useState, useEffect } from "react";
import {
  Tractor,
  MapPin,
  Plus,
  Edit3,
  Trash2,
  X,
  Save,
  Search,
  Sprout,
  Droplets,
  Map as MapIcon,
  Layers,
  LayoutGrid,
  Check,
  Settings,
  Sparkles,
  Loader2,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "@/app/components/Footer";
import { getFarmAreas } from "@/lib/FarmManagement/getFarmArea";
import { creataFarm } from "@/lib/FarmManagement/creataFarm";
import { DeleteFarm } from "@/lib/FarmManagement/DeleteFarm";
import { DeleteSubArea } from "@/lib/FarmManagement/DeleteSubArea";
import { createSubArea } from "@/lib/FarmManagement/createSubArea";
import { updateFarm } from "@/lib/FarmManagement/updateFarm";
import Swal from "sweetalert2";
import { updateSubArea } from "@/lib/FarmManagement/updateSubArea";

export default function FarmManagement() {
  const [farms, setFarms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    farm_id: "",
    farm_name: "",
    area: "",
    rice_variety: "",
    planting_method: "นาหว่าน",
    soil_type: "ดินเหนียว",
    water_management: "น้ำฝน",
    address: "",
    sub_areas: [],
  });

  // --- Sub-Area Manager Modal State ---
  const [isSubAreaModalOpen, setIsSubAreaModalOpen] = useState(false);
  const [currentFarmForSubArea, setCurrentFarmForSubArea] = useState(null);
  const [newSubAreaName, setNewSubAreaName] = useState("");

  // Inline Edit State for Sub-areas
  const [editingSubAreaId, setEditingSubAreaId] = useState(null);
  const [tempSubAreaName, setTempSubAreaName] = useState("");

  useEffect(() => {
    async function loadFarmAreas() {
      await getFarmAreas(setIsLoading, setFarms);
    }
    loadFarmAreas();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      farm_id: "",
      farm_name: "",
      area: "",
      rice_variety: "",
      planting_method: "นาหว่าน",
      soil_type: "ดินเหนียว",
      water_management: "น้ำฝน",
      address: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (farm) => {
    setEditingId(farm.farm_id);
    setFormData({ ...farm, sub_areas: farm.sub_areas || [] });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    DeleteFarm(id, setIsLoading, setFarms);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateFarm(e, formData, setIsSaving, setIsEditing, setFarms, editingId);
    } else {
      creataFarm(e, formData, setIsSaving, setIsEditing, setFarms);
    }
    setIsModalOpen(false);
  };

  const openSubAreaManager = (farm) => {
    setCurrentFarmForSubArea(farm);
    setNewSubAreaName("");
    setEditingSubAreaId(null);
    setIsSubAreaModalOpen(true);
  };
  const handleAddSubArea = (farm_id) => {
    createSubArea(
      farm_id,
      newSubAreaName,
      setIsSaving, // ← ส่ง setIsSaving ไม่ใช่ isSaving
      currentFarmForSubArea,
      setCurrentFarmForSubArea,
      setFarms
    );
    setNewSubAreaName("");
  };

  const handleDeleteSubArea = (areaId) => {
    DeleteSubArea(
      currentFarmForSubArea.farm_id,
      areaId,
      setIsLoading,
      currentFarmForSubArea,
      setCurrentFarmForSubArea,
      setFarms
    );
  };

  const startEditSubArea = (area) => {
    setEditingSubAreaId(area.area_id);
    setTempSubAreaName(area.area_name);
  };

  const saveEditSubArea = (areaId) => {
    if (!tempSubAreaName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "ข้อผิดพลาด",
        text: "กรุณาระบุชื่อพื้นที่ย่อย",
      });
      return;
    }
    updateSubArea(
      currentFarmForSubArea.farm_id,
      areaId,
      tempSubAreaName.trim(),
      setIsSaving,
      currentFarmForSubArea,
      setCurrentFarmForSubArea,
      setFarms
    );

    setEditingSubAreaId(null);
  };

  const filteredFarms = farms.filter(
    (farm) =>
      farm.farm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farm.rice_variety.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50  text-gray-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              จัดการข้อมูลแปลงนา
            </h1>
            <p className="text-gray-500 mt-1">
              รายการแปลงนาและข้อมูลพื้นที่ย่อย
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-colors"
          >
            <Plus size={20} className="mr-2" />
            เพิ่มแปลงใหม่
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="ค้นหาชื่อแปลง, พันธุ์ข้าว..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : filteredFarms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <Sprout className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              ไม่พบข้อมูลแปลงนา
            </h3>
            <div className="mt-6">
              <button
                onClick={openAddModal}
                className="text-green-600 hover:text-green-800 font-medium"
              >
                + เพิ่มแปลงใหม่
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFarms.map((farm) => (
              <div
                key={farm.farm_id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden flex flex-col relative"
              >
                <div className="p-5 flex-grow">
                  <div className="flex justify-between items-start mb-4 pr-8">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                        {farm.farm_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          การปลูกแบบ
                          {farm.planting_method === "นาหว่าน" ? "หว่าน" : "ดำ"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="text-gray-500">ขนาดพื้นที่</span>
                      <span className="font-semibold text-gray-900">
                        {farm.area} ไร่
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="text-gray-500">พันธุ์ข้าว</span>
                      <span className="font-semibold text-gray-900">
                        {farm.rice_variety}
                      </span>
                    </div>

                    {/* Display Sub Areas */}
                    <div className="pt-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-500 flex items-center gap-1">
                          <LayoutGrid size={14} /> พื้นที่ย่อย (
                          {farm.sub_areas?.length || 0})
                        </span>
                        <button
                          onClick={() => openSubAreaManager(farm)}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                        >
                          <Settings size={12} /> จัดการพื้นที่
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {farm.sub_areas && farm.sub_areas.length > 0 ? (
                          farm.sub_areas.map((area) => (
                            <span
                              key={area.area_id}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
                            >
                              {area.area_name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">
                            - ไม่มีพื้นที่ย่อย -
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-start gap-2 text-xs text-gray-500">
                      <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{farm.address}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    onClick={() => openEditModal(farm)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center gap-1 text-sm font-medium"
                  >
                    <Edit3 size={16} /> แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(farm.farm_id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- MAIN MODAL (FARM INFO) --- */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background Overlay */}
            <div
              className="fixed inset-0 bg-[rgba(0,0,0,0.6)] transition-opacity"
              onClick={() => setIsModalOpen(false)}
            ></div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                    <h3
                      className="text-lg leading-6 font-bold text-gray-900"
                      id="modal-title"
                    >
                      {editingId ? "แก้ไขข้อมูลแปลงนา" : "เพิ่มแปลงนาใหม่"}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto px-1">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ชื่อแปลง / ฟาร์ม <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="farm_name"
                        required
                        value={formData.farm_name}
                        onChange={handleInputChange}
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        placeholder="เช่น แปลงนาทุ่งทอง 1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ขนาดพื้นที่รวม (ไร่){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="area"
                        required
                        value={formData.area}
                        onChange={handleInputChange}
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        placeholder="0.0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        พันธุ์ข้าว <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="rice_variety"
                        required
                        value={formData.rice_variety}
                        onChange={handleInputChange}
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        วิธีการปลูก
                      </label>

                      <select
                        id="planting_method"
                        name="planting_method"
                        value={formData.planting_method}
                        onChange={handleInputChange}
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
                        id="soil_type"
                        name="soil_type"
                        value={formData.soil_type}
                        onChange={handleInputChange}
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      >
                        <option value="ดินเหนียว">ดินเหนียว</option>
                        <option value="ดินร่วน">ดินร่วน</option>
                        <option value="ดินร่วนปนทราย">ดินร่วนปนทราย</option>
                        <option value="ดินทราย">ดินทราย</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        การจัดการน้ำ
                      </label>
                      <select
                        id="water_management"
                        name="water_management"
                        value={formData.water_management}
                        onChange={handleInputChange}
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
                        name="address"
                        rows="3"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm resize-none"
                        placeholder="บ้านเลขที่ หมู่ ตำบล อำเภอ จังหวัด..."
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    <Save size={18} className="mr-2" /> บันทึกข้อมูล
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
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

      {/* --- SUB-AREA MODAL --- */}
      {isSubAreaModalOpen && currentFarmForSubArea && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-[rgba(0,0,0,0.6)] transition-opacity"
              onClick={() => setIsSubAreaModalOpen(false)}
            ></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>
            {/* Added 'relative' here as well */}
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-green-600 px-4 py-3 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-bold text-white flex items-center gap-2">
                  <Layers size={20} /> จัดการพื้นที่ย่อย
                </h3>
                <button
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
                    onClick={() =>
                      handleAddSubArea(currentFarmForSubArea.farm_id)
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 flex items-center gap-1 shadow-sm"
                  >
                    <Plus size={16} /> เพิ่ม
                  </button>
                </div>
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    รายการพื้นที่ย่อย (
                    {currentFarmForSubArea.sub_areas?.length || 0})
                  </p>
                  {currentFarmForSubArea.sub_areas &&
                  currentFarmForSubArea.sub_areas.length > 0 ? (
                    currentFarmForSubArea.sub_areas.map((area) => (
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
                              className="flex-grow border border-blue-300 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                              autoFocus
                            />
                            <button
                              onClick={() => saveEditSubArea(area.area_id)}
                              className="text-green-600 hover:bg-green-100 p-1 rounded"
                            >
                              <Check size={16} />
                            </button>
                            <button
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
                            {/* <span className="text-[10px] text-gray-400 font-mono">
                              ID: {area.area_id}
                            </span> */}
                          </div>
                        )}
                        {editingSubAreaId !== area.area_id && (
                          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEditSubArea(area)}
                              className="text-gray-400 hover:text-blue-600 p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                              title="แก้ไขชื่อ"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteSubArea(area.area_id)}
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
      <Footer />
    </div>
  );
}
