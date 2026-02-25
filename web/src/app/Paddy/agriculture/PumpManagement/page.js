"use client";
import React, { useState, useEffect } from 'react';
import { 
  Plus, MapPin, Edit3, Trash2, Search, Droplets, X,
  ChevronRight, Hash, Tractor, Info, ScanQrCode, 
  Clock, Sprout, Loader2, Power
} from 'lucide-react';
import Header from '../components/Header';
import Swal from 'sweetalert2';
import { apiFetch } from '@/lib/api';
import Footer from '@/app/components/Footer';

const App = () => {
  const [farmAreas, setFarmAreas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState('add'); 
  const [addStep, setAddStep] = useState(1); 
  const [loading, setLoading] = useState(true);

  const [selectedFarmId, setSelectedFarmId] = useState("all");
  const [selectedAreaId, setSelectedAreaId] = useState("all");

  const [formData, setFormData] = useState({
    reg_code: "", pump_name: "", farm_id: "", area_id: "", farm_name: "", area_name: "", pump_ID : ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const response = await apiFetch('/api/data/pump');
    if (response.ok) { setFarmAreas(response.data); }
    setLoading(false);
  }

  // --- Logic สำหรับ Filtering ---
  const uniqueFarms = Array.from(new Map(farmAreas.map(item => [item.farm_id, item])).values());
  const tabsAreas = selectedFarmId === "all" ? [] : farmAreas.filter(item => item.farm_id === parseInt(selectedFarmId));

  // --- แก้ไขจุดสำคัญ: กรองและกางข้อมูล (Flattening) กรณีมีหลายปั๊มใน 1 Area ---
  const displayRows = [];
  farmAreas.forEach(area => {
    if (area.pumps && area.pumps.length > 0) {
      area.pumps.forEach(pump => {
        // ตรวจสอบ Filter
        const matchSearch = pump.pump_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            area.farm_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchFarm = selectedFarmId === "all" || area.farm_id === parseInt(selectedFarmId);
        const matchArea = selectedAreaId === "all" || area.area_id === parseInt(selectedAreaId);

        if (matchSearch && matchFarm && matchArea) {
          displayRows.push({
            ...area,
            single_pump: pump // ส่งข้อมูลปั๊มตัวเดียวเข้าไปใน Row
          });
        }
      });
    }
  });

  const openEditModal = (area, pump) => {
    setMode('edit');
    setFormData({
      reg_code: area.devices[0]?.device_code || "N/A",
      pump_name: pump.pump_name,
      farm_id: area.farm_id,
      area_id: area.area_id,
      farm_name: area.farm_name,
      area_name: area.area_name,
      pump_ID: pump.pump_id
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "add") {
        try {
          const res = await apiFetch("/api/esp32/check-pump", {
            method: "POST",
            body: { reg_code: formData.reg_code, pump_name: formData.pump_name, area_id: formData.area_id },
          });
          if (!res.ok) throw new Error(res.message);
          Swal.fire("สำเร็จ", "ลงทะเบียนเรียบร้อย", "success");
          fetchData(); setIsModalOpen(false);
        } catch (err) { Swal.fire("ผิดพลาด", err.message, "error"); }
      } else {
        try {
          const res = await apiFetch("/api/esp32/update-pump", {
            method: "POST",
            body: { pump_ID: formData.pump_ID, pump_name: formData.pump_name },
          });
          if (!res.ok) throw new Error(res.message);
          Swal.fire("สำเร็จ", "อัปเดตเรียบร้อย", "success");
          fetchData(); setIsModalOpen(false);
        } catch (err) { Swal.fire("ผิดพลาด", err.message, "error"); }
      }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'ลบข้อมูล',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await apiFetch('/api/esp32/delete-pump', { method: 'POST', body: { pump_ID: id } });
        if (res.ok) { fetchData(); Swal.fire("ลบสำเร็จ", "", "success"); }
      }
    });
  };


  const Submit_ON_OFF = async (pump_id , cmnd) => {
    try {
      const res = await apiFetch("/api/on-off-pump", {
        method: "POST",
        body: { pump_ID: pump_id, command: cmnd },
      });
      if (!res.ok) throw new Error(res.message);
      fetchData();
    } catch (err) { Swal.fire("ผิดพลาด", err.message, "error"); }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans" style={{ fontFamily: "'Kanit', sans-serif" }}>
      <Header />
      <main className="container mx-auto px-4 pt-8 max-w-7xl flex-grow">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">สถานะและการควบคุมปั๊มน้ำ</h1>
            <p className="text-gray-500 text-sm mt-1">รายการปั๊มน้ำทั้งหมดในระบบ (พบ {displayRows.length} ปั๊ม)</p>
          </div>
          <button onClick={() => { setMode('add'); setAddStep(1); setIsModalOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 rounded-xl text-sm font-bold text-white hover:bg-emerald-700 transition-all shadow-sm">
            <Plus size={18} /> เพิ่มการติดตั้งใหม่
          </button>
        </div>

        {/* Filters Section */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="ค้นหาชื่อปั๊ม..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:bg-white"
              value={selectedFarmId}
              onChange={(e) => { setSelectedFarmId(e.target.value); setSelectedAreaId("all"); }}
            >
              <option value="all">เลือกฟาร์มทั้งหมด</option>
              {uniqueFarms.map(f => <option key={f.farm_id} value={f.farm_id}>{f.farm_name}</option>)}
            </select>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <button onClick={() => setSelectedAreaId("all")} className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${selectedAreaId === "all" ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                ทุกพื้นที่ย่อย
              </button>
              {tabsAreas.map((area) => (
                <button key={area.area_id} onClick={() => setSelectedAreaId(area.area_id)} className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${selectedAreaId === area.area_id ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {area.area_name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-12">
          <div className="overflow-x-auto max-h-[550px]">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="sticky top-0 bg-gray-50 z-10 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">ชื่อปั๊มน้ำ</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">สถานะ</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">คำสั่งควบคุม</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">พื้นที่ / ฟาร์ม</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-bold">กำลังโหลด...</td></tr>
                ) : displayRows.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400">ไม่พบข้อมูลปั๊มน้ำ</td></tr>
                ) : (
                  displayRows.map((row) => {
                    const pump = row.single_pump;
                    const status = pump.pump_status;
                    return (
                      <tr key={`${row.area_id}-${pump.pump_id}`} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${status === 'ON' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                              <Droplets size={20} />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-800">{pump.pump_name}</div>
                              <div className="text-[10px] font-mono text-gray-400">MAC: {pump.mac_address}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                            status === 'ON' ? 'bg-green-100 text-green-700' : 
                            status === 'OFF' ? 'bg-slate-100 text-slate-500' : 
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {status === 'ON' ? 'เปิดอยู่' : status === 'OFF' ? 'ปิดอยู่' : 'กำลังรอ...'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center">
                            {status === 'WAITING' ? (
                              <button disabled className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-xs font-bold cursor-not-allowed flex items-center gap-2">
                                <Loader2 size={14} className="animate-spin" /> กำลังรอ...
                              </button>
                            ) : status === 'ON' ? (
                              <button className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-2 transition-all active:scale-95"
                                onClick={() => Submit_ON_OFF(pump.pump_id , "OFF")}>
                                <Power size={14} /> ปิดปั๊มน้ำ
                              </button>
                            ) : (
                              <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-2 transition-all active:scale-95"
                                onClick={() => Submit_ON_OFF(pump.pump_id , "ON")}>
                                <Power size={14} /> เปิดปั๊มน้ำ
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-xs font-semibold text-gray-700">{row.farm_name}</div>
                          <div className="text-[10px] text-gray-400 flex items-center gap-1"><MapPin size={10} /> {row.area_name}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openEditModal(row, pump)} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Edit3 size={16} /></button>
                            <button onClick={() => handleDelete(pump.pump_id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />

      {/* Modal - ขั้นตอนการทำงานเหมือนเดิม */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white animate-in zoom-in-95 duration-200">
            <form onSubmit={handleSubmit}>
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    {mode === 'add' ? (addStep === 1 ? "1. ยืนยันอุปกรณ์" : "2. ระบุตำแหน่ง") : "แก้ไขข้อมูลปั๊ม"}
                  </h3>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400"><X size={20} /></button>
                </div>

                {mode === 'add' && addStep === 1 ? (
                  <div className="space-y-6">
                    <input autoFocus type="text" maxLength={6} placeholder="ระบุรหัส 6 หลัก" className="w-full text-center text-2xl  font-bold  py-5 border-2 border-gray-100 rounded-2xl focus:border-emerald-500 outline-none" value={formData.reg_code} onChange={(e) => setFormData({...formData, reg_code: e.target.value.replace(/\D/g, '')})} />
                    <button type="button" disabled={formData.reg_code.length !== 6} onClick={() => setAddStep(2)} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold shadow-lg">ถัดไป</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mode === 'add' ? (
                      <div className="grid grid-cols-1 gap-4">
                        <select required name="farm_id" value={formData.farm_id} onChange={(e) => setFormData({...formData, farm_id: e.target.value, area_id: ""})} className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm outline-none">
                          <option value="">เลือกฟาร์ม</option>
                          {uniqueFarms.map(f => <option key={f.farm_id} value={f.farm_id}>{f.farm_name}</option>)}
                        </select>
                        <select required disabled={!formData.farm_id} name="area_id" value={formData.area_id} onChange={(e) => setFormData({...formData, area_id: e.target.value})} className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm outline-none disabled:bg-gray-50">
                          <option value="">เลือกพื้นที่</option>
                          {farmAreas.filter(a => a.farm_id === parseInt(formData.farm_id)).map(a => <option key={a.area_id} value={a.area_id}>{a.area_name}</option>)}
                        </select>
                      </div>
                    ) : (
                       <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 mb-2">
                          <p className="text-[10px] text-emerald-600 font-bold uppercase">พื้นที่ติดตั้ง</p>
                          <p className="text-sm font-semibold">{formData.farm_name} / {formData.area_name}</p>
                       </div>
                    )}
                    <input required type="text" name="pump_name" value={formData.pump_name} onChange={(e) => setFormData({...formData, pump_name: e.target.value})} className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm outline-none" placeholder="ชื่อเรียกปั๊มน้ำ" />
                  </div>
                )}
              </div>
              {(mode !== 'add' || addStep === 2) && (
                <div className="p-8 bg-gray-50 flex gap-3">
                  <button type="submit" className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all">บันทึกข้อมูล</button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;