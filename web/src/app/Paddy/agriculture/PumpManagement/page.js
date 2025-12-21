"use client";
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MapPin, 
  Edit3, 
  Trash2, 
  Search, 
  Settings, 
  Droplets, 
  X,
  Check,
  Save,
  ChevronRight,
  Hash,
  Tractor,
  Layers,
  Info
} from 'lucide-react';
import Header from '../components/Header';
import Swal from 'sweetalert2';
import { apiFetch } from '@/lib/api';
import Footer from '@/app/components/Footer';

const App = () => {
  // ข้อมูลเริ่มต้น (Master Data)
  const [farmAreas, setFarmAreas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState('add'); 
  const [addStep, setAddStep] = useState(1); 
  const [editingId, setEditingId] = useState(null);

   useEffect (() => {
      async function fetchFarmAreas() {
        const response = await apiFetch('/api/data/pump');
         if (response.ok) {
             setFarmAreas(response.data);
         } else {
             Swal.fire({
               icon: "error",
               title: "ข้อผิดพลาด",
               text: response.message || "ไม่สามารถดึงข้อมูลพื้นที่ได้",
             });
         }
      }

      fetchFarmAreas();
   }, []);


  const [formData, setFormData] = useState({
    reg_code: "",
    pump_name: "",
    farm_id: "",
    area_id: "",
    farm_name: "",
    area_name: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setMode('add');
    setAddStep(1);
    setFormData({
      reg_code: "",
      pump_name: "",
      farm_id: "",
      area_id: "",
      farm_name: "",
      area_name: "",
      pump_ID : ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (area) => {
    setMode('edit');
    setEditingId(area.area_id);
    setFormData({
      reg_code: area.devices[0]?.reg_code || "",
      pump_name: area.pumps[0]?.pump_name || "",
      farm_id: area.farm_id,
      area_id: area.area_id,
      farm_name: area.farm_name,
      area_name: area.area_name,
      pump_ID: area.pumps[0]?.pump_id || ""
    });
    setIsModalOpen(true);
  };

  const handleNextStep = () => {
    if (formData.reg_code.length === 6) {
      setAddStep(2);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();


  if (mode === "add") {
    if (
      !formData.pump_name ||
      !formData.area_id ||
      !formData.reg_code
    ) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        text: "กรุณากรอกข้อมูลให้ครบถ้วน",
      });
      return;
    }

    try {
      const res = await apiFetch("/api/esp32/check-pump", {
        method: "POST",
        body: {
          reg_code: formData.reg_code,
          pump_name: formData.pump_name,
          area_id: formData.area_id,
        },
      });

      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "ลงทะเบียนไม่สำเร็จ",
          text: res.message || "กรุณาลองใหม่อีกครั้ง",
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: "ลงทะเบียนสำเร็จ",
        text: "คุณได้ทำการลงทะเบียนปั๊มน้ำเรียบร้อยแล้ว",
      });

      setFarmAreas((prev) =>
        prev.map((item) =>
          item.area_id === Number(formData.area_id)
            ? {
                ...item,
                devices: [
                  ...(item.devices || []),
                  {
                    device_code: formData.device_code,
                    device_status: "active",
                  },
                ],
                pumps: [
                  ...(item.pumps || []),
                  {
                    pump_id: Date.now(),
                    pump_name: formData.pump_name,
                    pump_status: "WAITING",
                  },
                ],
              }
            : item
        )
      );

      setIsModalOpen(false);
    } catch (error) {
      console.error("REGISTER PUMP FAILED:", error);
      Swal.fire({
        icon: "error",
        title: "ลงทะเบียนไม่สำเร็จ",
        text: error.message || "เกิดข้อผิดพลาด กรุณาลองใหม่",
      });
    }

    return;
  }
  if (!formData.pump_name) {
    Swal.fire({
      icon: "warning",
      title: "ข้อมูลไม่ครบถ้วน",
      text: "กรุณากรอกชื่อปั๊มน้ำ",
    });
    return;
  }

  try {
    const res = await apiFetch("/api/esp32/update-pump", {
      method: "POST",
      body: {
        pump_ID: formData.pump_ID,
        pump_name: formData.pump_name,
      },
    });

    if (!res.ok) {
      Swal.fire({
        icon: "error",
        title: "อัปเดตไม่สำเร็จ",
        text: res.message || "กรุณาลองใหม่อีกครั้ง",
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "อัปเดตสำเร็จ",
      text: "คุณได้ทำการอัปเดตชื่อปั๊มน้ำเรียบร้อยแล้ว",
    });

    setFarmAreas((prev) =>
      prev.map((item) =>
        item.area_id === editingId
          ? {
              ...item,
              pumps: item.pumps.map((p) =>
                p.pump_id === formData.pump_ID
                  ? { ...p, pump_name: formData.pump_name }
                  : p
              ),
            }
          : item
      )
    );

    setIsModalOpen(false);
  } catch (error) {
    console.error("UPDATE PUMP FAILED:", error);
    Swal.fire({
      icon: "error",
      title: "อัปเดตไม่สำเร็จ",
      text: error.message || "เกิดข้อผิดพลาด กรุณาลองใหม่",
    });
  }
};


  const handleDelete = (id) => {
      Swal.fire({    
         title: 'ยืนยันการลบการติดตั้งปั๊มน้ำ?',
         text: "ข้อมูลที่ลบจะไม่สามารถกู้คืนได้",
         icon: 'warning',
         showCancelButton: true,
         confirmButtonColor: '#ef4444',
         cancelButtonColor: '#6b7280',
         confirmButtonText: 'ลบการติดตั้ง',
         cancelButtonText: 'ยกเลิก'
      }).then(async (result) => {
         if (result.isConfirmed) {
             const res = await apiFetch('/api/esp32/delete-pump', {
               method: 'POST',
               body: {
                   pump_ID: id
               }
               });
               if (!res.ok) {
                     Swal.fire({
                         icon: "error",
                           title: "ลบไม่สำเร็จ",
                           text: res.message || "กรุณาลองใหม่อีกครั้ง",
                     });
                     return;
               }
               Swal.fire({
                   icon: "success",
                     title: "ลบการติดตั้งสำเร็จ",
                     text: "คุณได้ทำการลบการติดตั้งปั๊มน้ำเรียบร้อยแล้ว",
               });
               setFarmAreas((prev) =>
                   prev.map((item) =>
                         ({
                               ...item,
                                 pumps: item.pumps.filter((p) => p.pump_id !== id)
                           })
                     )
               );
         }
      });

  };

  const uniqueFarms = Array.from(new Map(farmAreas.map(item => [item.farm_id, item])).values());
  const availableAreas = farmAreas.filter(item => item.farm_id === parseInt(formData.farm_id));

  const filteredData = farmAreas
    .filter(item => item.pumps && item.pumps.length > 0)
    .filter(item =>
      item.farm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.area_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.devices.some(d => d.device_code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" style={{ fontFamily: "'Kanit', sans-serif" }}>
      {/* Import Font Kanit */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');
      `}</style>

     <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
               จัดการการติดตั้งปั๊มน้ำ
            </h1>
            <p className="text-gray-500 mt-1">
              ตารางแสดงรายการพื้นที่ติดตั้งปั๊มน้ำทั้งหมดในระบบ
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm text-sm font-bold transition-all active:scale-95"
          >
            <Plus size={20} className="mr-2" />
            เพิ่มการติดตั้งใหม่
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50/50 focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm outline-none transition-all"
              placeholder="ค้นหารหัสอุปกรณ์, ชื่อปั๊ม, แปลงนา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ลำดับ</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ชื่อปั๊มน้ำ</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">แปลงนา / ฟาร์ม</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">พื้นที่</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">สถานะอุปกรณ์</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">จัดการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length > 0 ? filteredData.map((item, index) => (
                  <tr key={item.area_id} className="hover:bg-green-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-green-600 text-sm">
                     {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.pumps[0]?.pump_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Tractor size={14} className="text-gray-400" />
                        {item.farm_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Layers size={14} className="text-gray-400" />
                        {item.area_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        item.pumps[0]?.pump_status === 'ON' ? 'bg-green-100 text-green-700 border-green-200' :
                        item.pumps[0]?.pump_status === 'OFF' ? 'bg-red-100 text-red-700 border-red-200' :
                        'bg-yellow-100 text-yellow-700 border-yellow-200'
                        }`}>
                        {item.pumps[0]?.pump_status === 'ON' ? 'ทำงาน' :
                         item.pumps[0]?.pump_status === 'OFF' ? 'หยุดทำงาน' :
                         'รอคำสั่ง'}


                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openEditModal(item)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Edit3 size={18} />
                        </button>
                        <button onClick={() => handleDelete(item.pumps[0]?.pump_id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <Layers size={40} className="mb-2 opacity-20" />
                        <span>ไม่พบข้อมูลการติดตั้งปั๊มน้ำ</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ fontFamily: "'Kanit', sans-serif" }}>
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full border border-gray-200">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-6 pt-6 pb-4 sm:p-8 sm:pb-6">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                    <h3 className="text-xl leading-6 font-bold text-gray-900">
                      {mode === 'add' ? (addStep === 1 ? "ลงทะเบียนอุปกรณ์" : "เลือกพื้นที่ติดตั้ง") : "แก้ไขชื่อปั๊มน้ำ"}
                    </h3>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-green-600 transition-colors">
                      <X size={24} />
                    </button>
                  </div>

                  {mode === 'add' && addStep === 1 ? (
                    <div className="space-y-6 py-2">
                      <div className="text-center">
                        <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
                          <Hash className="text-green-600 w-10 h-10" />
                        </div>
                        <p className="text-gray-600 font-medium text-sm">กรอกรหัสอุปกรณ์ 6 หลักที่ตัวเครื่อง</p>
                      </div>
                      <div className="max-w-[280px] mx-auto">
                        <input 
                          autoFocus
                          type="text" 
                          maxLength={6}
                          placeholder="000000"
                          className="w-full text-center text-4xl font-bold tracking-[0.4em] py-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all placeholder:text-gray-100 shadow-sm"
                          value={formData.reg_code}
                          onChange={(e) => setFormData({...formData, reg_code: e.target.value.replace(/\D/g, '')})}
                        />
                      </div>
                      <button 
                        type="button"
                        disabled={formData.reg_code.length !== 6}
                        onClick={handleNextStep}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-green-100 hover:bg-green-700 active:scale-[0.98]"
                      >
                        ตรวจสอบรหัส <ChevronRight size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-5">
                      {mode === 'add' ? (
                        <>
                          <div className="p-4 bg-green-50 rounded-xl flex justify-between items-center border border-green-100">
                            <span className="text-xs font-bold text-green-400 tracking-wider uppercase">รหัสลงทะเบียนจาก ESP32</span>
                            <span className="font-mono font-bold text-green-700 text-xl">{formData.reg_code}</span>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1.5">เลือกแปลงนา / ฟาร์ม</label>
                              <select 
                                required 
                                name="farm_id" 
                                value={formData.farm_id} 
                                onChange={handleInputChange} 
                                className="block w-full border border-gray-300 rounded-xl py-3 px-4 shadow-sm focus:ring-2 focus:ring-green-500 outline-none bg-white sm:text-sm"
                              >
                                <option value="">-- เลือกฟาร์ม --</option>
                                {uniqueFarms.map(farm => (
                                  <option key={farm.farm_id} value={farm.farm_id}>{farm.farm_name}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1.5">เลือกพื้นที่ภายในแปลง</label>
                              <select 
                                required 
                                disabled={!formData.farm_id}
                                name="area_id" 
                                value={formData.area_id} 
                                onChange={handleInputChange} 
                                className="block w-full border border-gray-300 rounded-xl py-3 px-4 shadow-sm focus:ring-2 focus:ring-green-500 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400 sm:text-sm"
                              >
                                <option value="">-- เลือกพื้นที่ --</option>
                                {availableAreas.map(area => (
                                  <option key={area.area_id} value={area.area_id}>{area.area_name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-2">
                           <p className="text-xs font-bold text-gray-400 uppercase">ตำแหน่งปัจจุบัน</p>
                           <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                              <Tractor size={14} className="text-green-600" /> {formData.farm_name} / {formData.area_name}
                           </p>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">ชื่อปั๊มน้ำ <span className="text-red-500">*</span></label>
                        <input required type="text" name="pump_name" value={formData.pump_name} onChange={handleInputChange} className="block w-full border border-gray-300 rounded-xl py-3 px-4 shadow-sm focus:ring-2 focus:ring-green-500 sm:text-sm outline-none transition-all" placeholder="เช่น ปั๊มเมนหลัก 01" />
                      </div>
                    </div>
                  )}
                </div>

                {(mode !== 'add' || addStep === 2) && (
                  <div className="bg-gray-50 px-6 py-5 sm:px-8 sm:flex sm:flex-row-reverse border-t border-gray-100 gap-3">
                    <button type="submit" className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-lg px-6 py-3 bg-green-600 text-base font-bold text-white hover:bg-green-700 focus:outline-none sm:w-auto sm:text-sm transition-all active:scale-95">
                      <Save size={18} className="mr-2" /> บันทึกข้อมูล
                    </button>
                    <button type="button" onClick={() => mode === 'add' ? setAddStep(1) : setIsModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-bold text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm transition-all">
                      {mode === 'add' ? "ย้อนกลับ" : "ยกเลิก"}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;