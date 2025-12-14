"use client";

import React from 'react';
import {
  LayoutDashboard,
  Users,
  Cpu,
  Settings,
  Bell,
  Search,
  LogOut,
  Menu,
  ChevronDown,
  MessageSquare,
  Mail,
  Sprout,
  BarChart2,
  Sparkles,
  X
} from 'lucide-react';
import { SidebarItem } from './AdminUI';


const AdminSidebar = ({ sidebarOpen, setSidebarOpen, activeMenu, setActiveMenu }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-72 transform bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-200 flex flex-col`}
      >
        {/* Logo Section - ใช้ <a> เพื่อกดกลับหน้า Dashboard */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-100 lg:border-none">
          <a href="/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold shadow-emerald-200 shadow-lg">
              <Sprout size={24} />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">PaddySmart</span>
          </a>
          <button className="lg:hidden text-slate-500" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="no-scrollbar flex-1 overflow-y-auto p-4 space-y-8">
          <div>
            <h3 className="mb-4 ml-4 text-xs font-bold text-slate-400 uppercase tracking-wider">MENU</h3>
            <nav className="space-y-1">
              <SidebarItem 
                icon={<LayoutDashboard size={20} />} 
                text="Dashboard" 
                href="/Paddy/admin/dashboard" 
                active={activeMenu === 'Dashboard'} 
                onClick={() => setActiveMenu('Dashboard')}
              />
              <SidebarItem 
                icon={<Users size={20} />} 
                text="จัดการบัญชีผู้ใช้งาน"
                href="/Paddy/admin/manage-users" 
                active={activeMenu === 'ManageUsers'} 
                onClick={() => setActiveMenu('ManageUsers')}
              />
              
              {/* Farmers Menu with Submenu */}
              <SidebarItem 
                icon={<Users size={20} />} text="จัดการอุปกรณ์ IoT"
                active={activeMenu.startsWith('manageDevices')}
                subItems={[
                  { 
                    text: 'เพิ่ม/ลบ เเก้ไขอุปกรณ์', 
                    href: '/Paddy/admin/devices', 
                    active: activeMenu === 'manageDevices-List',
                    onClick: () => setActiveMenu('manageDevices-List')
                  },
                  { 
                    text: 'ข้อมูลอุปกรณ์ IOT',
                    href: '/Paddy/admin/manage-devices/new', 
                    active: activeMenu === 'manageDevices-Add',
                    onClick: () => setActiveMenu('manageDevices-Add')
                  },
                  { 
                    text: 'การส่งข้อมูลอุปกรณ์', 
                    href: '/Paddy/admin/manage-devices/data', 
                    active: activeMenu === 'manageDevices-Data',
                    onClick: () => setActiveMenu('manageDevices-Data')
                  }
                ]}
              />

              <SidebarItem 
                icon={<BarChart2 size={20} />} 
                text="AI Analytics"
                href="/admin/analytics" 
                active={activeMenu === 'Analytics'} 
                onClick={() => setActiveMenu('Analytics')}
              />
            </nav>
          </div>

          <div>
            <h3 className="mb-4 ml-4 text-xs font-bold text-slate-400 uppercase tracking-wider">SUPPORT</h3>
            <nav className="space-y-1">
              <SidebarItem icon={<MessageSquare size={20} />} text="Chat" href="/admin/chat" />
              <SidebarItem icon={<Mail size={20} />} text="Email" badge="2" href="/admin/email" />
              <SidebarItem icon={<Settings size={20} />} text="Settings" href="/admin/settings" />
            </nav>
          </div>
        </div>
        
        {/* User Mini Profile & Logout */}
        <div className="p-4 border-t border-slate-100">
            {/* Logout Button - ใช้ <a> เพื่อพากลับหน้า Login */}
            <a 
                href="/auth/login"
                className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mb-3"
            >
                <LogOut size={20} />
                <span>ออกจากระบบ</span>
            </a>

            <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    A
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">Admin User</p>
                    <p className="text-xs text-slate-500 truncate">admin@paddysmart.com</p>
                </div>
            </div>
        </div>
      </aside>
    </>
  );
};

// 3.2 Admin Header
const AdminHeader = ({ setSidebarOpen, onAiClick }) => {
  return (
    <header className="flex h-20 items-center justify-between bg-white px-6 shadow-sm z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <button 
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>
        
        <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 w-80 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" placeholder="ค้นหา..." 
            className="bg-transparent text-sm outline-none placeholder:text-slate-400 w-full"
          />
          <span className="text-xs text-slate-400 font-medium border border-slate-300 rounded px-1.5 py-0.5">⌘K</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* AI Button */}
       

        <button className="relative rounded-full bg-slate-50 p-2.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 transition-colors">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        
        <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-700">Admin User</p>
            <p className="text-xs text-slate-500">Super Admin</p>
          </div>
          <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm bg-slate-200">
             <div className="w-full h-full bg-emerald-500 flex items-center justify-center text-white font-bold">A</div>
          </div>
          <ChevronDown size={16} className="text-slate-400 cursor-pointer" />
        </div>
      </div>
    </header>
  );
};
export { AdminSidebar, AdminHeader };