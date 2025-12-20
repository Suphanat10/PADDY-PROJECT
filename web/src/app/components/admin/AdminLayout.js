// "use client";

// import React from "react";
// import {
//   LayoutDashboard,
//   Users,
//   Cpu,
//   Settings,
//   Bell,
//   Search,
//   LogOut,
//   Menu,
//   ChevronDown,
//   MessageSquare,
//   Mail,
//   Sprout,
//   BarChart2,
//   AlarmClock,
//   Send,
//   Computer,
//   ClipboardClock,
//   Bot,
//   X,
// } from "lucide-react";
// import { SidebarItem } from "./AdminUI";

// const AdminSidebar = ({
//   sidebarOpen,
//   setSidebarOpen,
//   activeMenu,
//   setActiveMenu,
// }) => {
//   return (
//     <>
   
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 z-20 bg-black/50 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         ></div>
//       )}

//       <aside
//         className={`fixed inset-y-0 left-0 z-30 w-72 transform bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
//           sidebarOpen ? "translate-x-0" : "-translate-x-full"
//         } border-r border-slate-200 flex flex-col`}
//       >
//         {/* Logo Section - ใช้ <a> เพื่อกดกลับหน้า Dashboard */}
//         <div className="flex h-20 items-center justify-between px-6 border-b border-slate-100 lg:border-none">
//           <a
//             href="/admin"
//             className="flex items-center gap-3 hover:opacity-80 transition-opacity"
//           >
//             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold shadow-emerald-200 shadow-lg">
//               <Sprout size={24} />
//             </div>
//             <span className="text-xl font-bold text-slate-800 tracking-tight">
//               PaddySmart
//             </span>
//           </a>
//           <button
//             className="lg:hidden text-slate-500"
//             onClick={() => setSidebarOpen(false)}
//           >
//             <X size={24} />
//           </button>
//         </div>

//         {/* Menu Items */}
//         <div className="no-scrollbar flex-1 overflow-y-auto p-4 space-y-8">
//           <div>
//             <h3 className="mb-4 ml-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
//               เมนู
//             </h3>
//             <nav className="space-y-1">
//               <SidebarItem
//                 icon={<LayoutDashboard size={20} />}
//                 text="Dashboard"
//                 href="/Paddy/admin/dashboard"
//                 active={activeMenu === "Dashboard"}
//                 onClick={() => setActiveMenu("Dashboard")}
//               />
//               <SidebarItem
//                 icon={<Users size={20} />}
//                 text="จัดการบัญชีผู้ใช้งาน"
//                 href="/Paddy/admin/manage-users"
//                 active={activeMenu === "ManageUsers"}
//                 onClick={() => setActiveMenu("ManageUsers")}
//               />

//               {/* Farmers Menu with Submenu */}
//               <SidebarItem
//                 icon={<Computer size={20} />}
//                 text="จัดการอุปกรณ์ IoT"
//                 active={activeMenu.startsWith("manageDevices")}
//                 subItems={[
//                   {
//                     text: "เพิ่ม/ลบ เเก้ไขอุปกรณ์",
//                     href: "/Paddy/admin/devices",
//                     active: activeMenu === "manageDevices-List",
//                     onClick: () => setActiveMenu("manageDevices-List"),
//                   },
//                   {
//                     text: "ข้อมูลการลงทะเบียนอุปกรณ์",
//                     href: "/Paddy/admin/registered-devices",
//                     active: activeMenu === "registered-devices",
//                     onClick: () => setActiveMenu("registered-devices"),
//                   },
//                 ]}
//               />

//               <SidebarItem
//                 icon={<Send size={20} />}
//                 text="ภาพรวมการส่งข้อมูล"
//                 href="/Paddy/admin/send-data"
//                 active={activeMenu === "SendData"}
//                 onClick={() => setActiveMenu("SendData")}
//               />
//               <SidebarItem
//                 icon={<Bot size={20} />}
//                 text="การวิเคราะห์ขการเจริญเติบโต"
//                 href="/Paddy/admin/analytics"
//                 active={activeMenu === "Analytics"}
//                 onClick={() => setActiveMenu("Analytics")}
//               />
//             </nav>
//           </div>

//           <div>
//             <h3 className="mb-4 ml-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
//               ประวัติ/การตั้งค่า
//             </h3>
//             <nav className="space-y-1">
//               <SidebarItem
//                 icon={<ClipboardClock size={20} />}
//                 text="ประวัติการเข้าใช้งานระบบ"
//                 href="/Paddy/admin/activity-log"
//                 active={activeMenu === "ActivityLog"}
//                 onClick={() => setActiveMenu("ActivityLog")}
//               />
//               <SidebarItem
//                 icon={<AlarmClock size={20} />}
//                 text="ประวัติการส่งแจ้งเตือน"
//                 href="/Paddy/admin/notification/"
//                 active={activeMenu === "notification"}
//                 onClick={() => setActiveMenu("notification")}
//               />
//               <SidebarItem
//                 icon={<Settings size={20} />}
//                 text="Settings"
//                 setActiveMenu={() => setActiveMenu("Settings")}
//                 subItems={[
//                   {
//                     text: "ตั้งค่าทั่วไป",
//                     href: "/Paddy/admin/settings/general",
//                     active: activeMenu === "Settings-General",
//                     onClick: () => setActiveMenu("Settings-General"),
//                   },
//                 ]}
//               />
//             </nav>
//           </div>
//         </div>

//         {/* User Mini Profile & Logout */}
//         <div className="p-4 border-t border-slate-100">
//           {/* Logout Button - ใช้ <a> เพื่อพากลับหน้า Login */}
//           <a
//             href="/auth/login"
//             className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mb-3"
//           >
//             <LogOut size={20} />
//             <span>ออกจากระบบ</span>
//           </a>

//           <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100">
//             <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
//               A
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-sm font-semibold text-slate-800 truncate">
//                 Admin User
//               </p>
//               <p className="text-xs text-slate-500 truncate">
//                 admin@paddysmart.com
//               </p>
//             </div>
//           </div>
//         </div>
//       </aside>
//     </>
//   );
// };

// // 3.2 Admin Header
// const AdminHeader = ({ setSidebarOpen, onAiClick }) => {
//   return (
//     <header className="flex h-20 items-center justify-between bg-white px-6 shadow-sm z-10 sticky top-0">
//       <div className="flex items-center gap-4">
//         <button
//           className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
//           onClick={() => setSidebarOpen(true)}
//         >
//           <Menu size={24} />
//         </button>
//       </div>

//       <div className="flex items-center gap-4">
//         <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200">
//           <div className="text-right">
//             <p className="text-sm font-medium text-slate-700">Admin User</p>
//             <p className="text-xs text-slate-500">Super Admin</p>
//           </div>
//           <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm bg-slate-200">
//             <div className="w-full h-full bg-emerald-500 flex items-center justify-center text-white font-bold">
//               A
//             </div>
//           </div>
//           <ChevronDown size={16} className="text-slate-400 cursor-pointer" />
//         </div>
//       </div>
//     </header>
//   );
// };
// export { AdminSidebar, AdminHeader };


"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  // ... imports อื่นๆ ที่คุณมีอยู่แล้ว
  Settings,
  LogOut,
  Menu,
  ChevronDown,
  Sprout,
  AlarmClock,
  Send,
  Computer,
  ClipboardClock,
  Bot,
  X,
} from "lucide-react";
import { SidebarItem } from "./AdminUI";
import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";


const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {

        const response = await apiFetch("/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json", },
        });

        if (response.ok) {
          const data = response.data;
          setUserProfile(response.data.profile);
         }
      } catch (error) {
          Swal.fire({
            icon: "error",
            title: "ข้อผิดพลาด",
            text: error.message || "ไม่สามารถโหลดข้อมูลผู้ใช้ได้",
          });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { userProfile, loading };
};


const logout = async () => {
  try {
    const response = await apiFetch("/api/auth/logout", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(response.message || "ไม่สามารถออกจากระบบได้");
    }

    Swal.fire({
      icon: "success",
      title: "ออกจากระบบสำเร็จ",
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      window.location.replace("/Paddy/admin/login");
    });
    
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "ข้อผิดพลาด",
      text: error.message || "ไม่สามารถออกจากระบบได้",
    });
  }
};


const getInitial = (name) => {
  return name ? name.charAt(0).toUpperCase() : "U";
};

// --- 3. AdminSidebar (Updated) ---
const AdminSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  activeMenu,
  setActiveMenu,
}) => {
  // เรียกใช้ Hook
  const { userProfile, loading } = useUserProfile();

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 transform bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } border-r border-slate-200 flex flex-col`}
      >
        {/* Logo Section */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-100 lg:border-none">
          <a
            href="/Paddy/admin/dashboard"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold shadow-emerald-200 shadow-lg">
              <Sprout size={24} />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">
              PaddySmart
            </span>
          </a>
          <button
            className="lg:hidden text-slate-500"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu Items (ส่วนนี้เหมือนเดิม) */}
        <div className="no-scrollbar flex-1 overflow-y-auto p-4 space-y-8">
          <div>
            <h3 className="mb-4 ml-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
              เมนู
            </h3>
            <nav className="space-y-1">
              <SidebarItem
                icon={<LayoutDashboard size={20} />}
                text="Dashboard"
                href="/Paddy/admin/dashboard"
                active={activeMenu === "Dashboard"}
                onClick={() => setActiveMenu("Dashboard")}
              />
              <SidebarItem
                icon={<Users size={20} />}
                text="จัดการบัญชีผู้ใช้งาน"
                href="/Paddy/admin/manage-users"
                active={activeMenu === "ManageUsers"}
                onClick={() => setActiveMenu("ManageUsers")}
              />
              <SidebarItem
                icon={<Computer size={20} />}
                text="จัดการอุปกรณ์ IoT"
                active={activeMenu.startsWith("manageDevices")}
                subItems={[
                  {
                    text: "เพิ่ม/ลบ เเก้ไขอุปกรณ์",
                    href: "/Paddy/admin/devices",
                    active: activeMenu === "manageDevices-List",
                    onClick: () => setActiveMenu("manageDevices-List"),
                  },
                  {
                    text: "ข้อมูลการลงทะเบียนอุปกรณ์",
                    href: "/Paddy/admin/registered-devices",
                    active: activeMenu === "registered-devices",
                    onClick: () => setActiveMenu("registered-devices"),
                  },
                ]}
              />
              <SidebarItem
                icon={<Send size={20} />}
                text="ภาพรวมการส่งข้อมูล"
                href="/Paddy/admin/send-data"
                active={activeMenu === "SendData"}
                onClick={() => setActiveMenu("SendData")}
              />
              <SidebarItem
                icon={<Bot size={20} />}
                text="การวิเคราะห์การเจริญเติบโต"
                href="/Paddy/admin/analytics"
                active={activeMenu === "Analytics"}
                onClick={() => setActiveMenu("Analytics")}
              />
            </nav>
          </div>

          <div>
            <h3 className="mb-4 ml-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
              ประวัติ/การตั้งค่า
            </h3>
            <nav className="space-y-1">
              <SidebarItem
                icon={<ClipboardClock size={20} />}
                text="ประวัติการเข้าใช้งานระบบ"
                href="/Paddy/admin/activity-log"
                active={activeMenu === "ActivityLog"}
                onClick={() => setActiveMenu("ActivityLog")}
              />
              <SidebarItem
                icon={<AlarmClock size={20} />}
                text="ประวัติการส่งแจ้งเตือน"
                href="/Paddy/admin/notification/"
                active={activeMenu === "notification"}
                onClick={() => setActiveMenu("notification")}
              />
              <SidebarItem
                icon={<Settings size={20} />}
                text="Settings"
                setActiveMenu={() => setActiveMenu("Settings")}
                subItems={[
                  {
                    text: "ตั้งค่าทั่วไป",
                    href: "/Paddy/admin/settings/general",
                    active: activeMenu === "Settings-General",
                    onClick: () => setActiveMenu("Settings-General"),
                  },
                ]}
              />
            </nav>
          </div>
        </div>

        {/* User Mini Profile & Logout (Updated Dynamic Data) */}
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={logout}

             className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mb-3"
          >
            <LogOut size={20} />
            <span>ออกจากระบบ</span>
          </button>

          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0">
              {/* แสดงตัวอักษรแรกของชื่อ */}
              {loading ? "..." : getInitial(userProfile?.first_name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {/* แสดงชื่อ-นามสกุล */}
                {loading
                  ? "Loading..."
                  : userProfile
                  ? `${userProfile.first_name} ${userProfile.last_name}`
                  : "Admin User"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {/* แสดงอีเมล */}
                {loading
                  ? "..."
                  : userProfile?.email || "admin@paddysmart.com"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

// --- 4. AdminHeader (Updated) ---
const AdminHeader = ({ setSidebarOpen, onAiClick }) => {
  const { userProfile, loading } = useUserProfile();

  return (
    <header className="flex h-20 items-center justify-between bg-white px-6 shadow-sm z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-700">
              {/* แสดงชื่อ */}
              {loading
                ? "Loading..."
                : userProfile
                ? `${userProfile.first_name} ${userProfile.last_name}`
                : "Admin User"}
            </p>
            <p className="text-xs text-slate-500">
              {/* แสดงตำแหน่ง */}
              {loading
                ? "..."
                : userProfile?.position || "Super Admin"}
            </p>
          </div>
          <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm bg-slate-200">
            <div className="w-full h-full bg-emerald-500 flex items-center justify-center text-white font-bold">
              {/* แสดงตัวอักษรแรก */}
              {loading ? "" : getInitial(userProfile?.first_name)}
            </div>
          </div>
          {/* <ChevronDown size={16} className="text-slate-400 cursor-pointer" /> */}
        </div>
      </div>
    </header>
  );
};

export { AdminSidebar, AdminHeader };