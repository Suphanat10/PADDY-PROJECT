"use client";
import { Phone, Eye, Edit, Trash2, Cast, ChevronLeft, ChevronRight } from "lucide-react";

// User Avatar Component
const UserAvatar = ({ name, size = "md" }) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-emerald-700 font-bold border-2 border-white shadow-sm`}
    >
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
};

// Action Button Component
const ActionButton = ({ icon: Icon, onClick, title, hoverColor = "blue" }) => {
  const colorClasses = {
    blue: "hover:text-blue-600 hover:bg-blue-50",
    green: "hover:text-emerald-600 hover:bg-emerald-50",
    red: "hover:text-red-500 hover:bg-red-50",
    orange: "hover:text-orange-500 hover:bg-orange-50",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 text-slate-400 ${colorClasses[hoverColor]} rounded-lg transition-all cursor-pointer`}
      title={title}
    >
      <Icon size={18} />
    </button>
  );
};

// User Table Row Component
export const UserTableRow = ({
  user,
  index,
  onView,
  onEdit,
  onDelete,
  onImpersonate,
}) => (
  <tr className="group hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0">
    <td className="py-4 px-6 font-medium text-slate-600 w-16">
      {index + 1}
    </td>
    <td className="py-4 px-6">
      <div className="flex items-center gap-3">
        <UserAvatar name={user.first_name} />
        <div>
          <div className="font-semibold text-slate-800">
            {user.first_name} {user.last_name}
          </div>
          <div className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
            <Phone size={12} className="text-slate-400" />
            {user.phone_number || "-"}
          </div>
        </div>
      </div>
    </td>
    <td className="py-4 px-6">
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
        {user.position || "เกษตรกร"}
      </span>
    </td>
    <td className="py-4 px-6">
      <div className="flex items-center justify-end gap-1">
        <ActionButton
          icon={Eye}
          onClick={() => onView(user)}
          title="ดูข้อมูลฟาร์มและเซนเซอร์"
          hoverColor="blue"
        />
        <ActionButton
          icon={Edit}
          onClick={() => onEdit(user)}
          title="แก้ไขข้อมูล"
          hoverColor="green"
        />
        <ActionButton
          icon={Trash2}
          onClick={() => onDelete(user.user_ID)}
          title="ลบผู้ใช้"
          hoverColor="red"
        />
        <ActionButton
          icon={Cast}
          onClick={() => onImpersonate(user.user_ID)}
          title="เข้าสู่ระบบแทน"
          hoverColor="orange"
        />
      </div>
    </td>
  </tr>
);

// Pagination Component
export const Pagination = ({
  currentPage,
  totalPages,
  indexOfFirstItem,
  indexOfLastItem,
  totalItems,
  onPrevPage,
  onNextPage,
}) => {
  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 gap-4">
      <div className="text-sm text-slate-500">
        แสดง{" "}
        <span className="font-semibold text-slate-700">
          {indexOfFirstItem + 1}
        </span>{" "}
        ถึง{" "}
        <span className="font-semibold text-slate-700">
          {Math.min(indexOfLastItem, totalItems)}
        </span>{" "}
        จากทั้งหมด{" "}
        <span className="font-semibold text-slate-700">{totalItems}</span>{" "}
        รายการ
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevPage}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-lg border flex items-center gap-1.5 text-sm font-medium transition-all ${
            currentPage === 1
              ? "bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
          }`}
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">ก่อนหน้า</span>
        </button>

        <div className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg">
          {currentPage} / {totalPages}
        </div>

        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-lg border flex items-center gap-1.5 text-sm font-medium transition-all ${
            currentPage === totalPages
              ? "bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
          }`}
        >
          <span className="hidden sm:inline">ถัดไป</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// Main User Table Component
export const UserTable = ({
  users,
  currentPage,
  itemsPerPage,
  onView,
  onEdit,
  onDelete,
  onImpersonate,
  onPrevPage,
  onNextPage,
}) => {
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-16">
                #
              </th>
              <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                ชื่อ - นามสกุล
              </th>
              <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                ตำแหน่ง
              </th>
              <th className="py-4 px-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user, index) => (
                <UserTableRow
                  key={user.user_ID}
                  user={user}
                  index={indexOfFirstItem + index}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onImpersonate={onImpersonate}
                />
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                      <Eye size={24} className="text-slate-300" />
                    </div>
                    <p className="font-medium">ไม่พบข้อมูลที่ค้นหา</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
        totalItems={users.length}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
      />
    </div>
  );
};
