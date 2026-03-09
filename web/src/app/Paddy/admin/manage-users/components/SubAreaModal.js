"use client";
import { X, Plus, Check, Edit, Trash2, Layers } from "lucide-react";

// Sub Area Item Component
const SubAreaItem = ({
  area,
  isEditing,
  tempName,
  setTempName,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}) => (
  <div className="flex justify-between items-center bg-white border border-slate-200 p-3.5 rounded-xl group hover:border-emerald-300 hover:shadow-sm transition-all">
    {isEditing ? (
      <div className="flex-1 flex gap-2 mr-2">
        <input
          type="text"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          autoFocus
          className="flex-1 border border-emerald-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
        />
        <button
          type="button"
          onClick={onSaveEdit}
          className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg transition-colors"
        >
          <Check size={16} />
        </button>
        <button
          type="button"
          onClick={onCancelEdit}
          className="text-slate-500 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    ) : (
      <>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium text-slate-700">{area.area_name}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onStartEdit(area)}
            className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-all"
            title="แก้ไขชื่อ"
          >
            <Edit size={15} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(area.area_id)}
            className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all"
            title="ลบ"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </>
    )}
  </div>
);

// Main Sub Area Modal Component
export const SubAreaModal = ({
  isOpen,
  onClose,
  farm,
  newSubAreaName,
  setNewSubAreaName,
  editingSubAreaId,
  tempSubAreaName,
  setTempSubAreaName,
  onAddSubArea,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  loading,
}) => {
  if (!isOpen || !farm) return null;

  return (
    <div className="fixed inset-0 z-70 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          {/* Header - Green Gradient */}
          <div className="px-6 py-4 flex justify-between items-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Layers size={20} />
              </div>
              <div>
                <h3 className="font-bold">จัดการพื้นที่ย่อย</h3>
                <p className="text-emerald-100 text-sm">{farm.farm_name}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Add New SubArea */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubAreaName}
                onChange={(e) => setNewSubAreaName(e.target.value)}
                placeholder="ชื่อพื้นที่ย่อยใหม่..."
                className="flex-1 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white hover:border-slate-300 transition-all"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onAddSubArea();
                  }
                }}
              />
              <button
                type="button"
                onClick={onAddSubArea}
                disabled={loading || !newSubAreaName.trim()}
                className="bg-emerald-500 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-600 flex items-center gap-1.5 shadow-lg shadow-emerald-200 disabled:opacity-50 transition-all"
              >
                <Plus size={16} /> เพิ่ม
              </button>
            </div>
          </div>

          {/* Sub Area List */}
          <div className="p-5">
            <p className="text-sm font-medium text-slate-600 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold">
                {farm.areas?.length || 0}
              </span>
              รายการพื้นที่ย่อย
            </p>

            <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1">
              {farm.areas?.length > 0 ? (
                farm.areas.map((area) => (
                  <SubAreaItem
                    key={area.area_id}
                    area={area}
                    isEditing={editingSubAreaId === area.area_id}
                    tempName={tempSubAreaName}
                    setTempName={setTempSubAreaName}
                    onStartEdit={onStartEdit}
                    onSaveEdit={() => onSaveEdit(area.area_id)}
                    onCancelEdit={onCancelEdit}
                    onDelete={onDelete}
                  />
                ))
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Layers className="text-slate-300" size={24} />
                  </div>
                  <p className="text-slate-500 font-medium">ยังไม่มีพื้นที่ย่อย</p>
                  <p className="text-slate-400 text-xs mt-1">เพิ่มพื้นที่ย่อยเพื่อเริ่มต้น</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-5 py-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
