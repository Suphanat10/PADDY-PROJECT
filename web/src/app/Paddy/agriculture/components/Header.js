"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell, Settings, User, ChevronDown, Menu, X, Sprout,
  LogOut, Shield, Activity, FileText, LayoutDashboard,
  PlusCircle, Database, BarChart3, Map, ChevronRight,
  Clock, Droplets
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const settingsRef = useRef(null);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  const pathname = usePathname();
  const router = useRouter();

  const NAV_ITEMS = [
    { name: "หน้าหลัก", href: "/Paddy/agriculture/dashboard", icon: LayoutDashboard },
    { name: "ลงทะเบียนอุปกรณ์", href: "/Paddy/agriculture/registerdevice", icon: PlusCircle },
    { name: "จัดการพื้นที่", href: "/Paddy/agriculture/FarmManagement", icon: Map },
    { name: "ข้อมูลอุปกรณ์", href: "/Paddy/agriculture/devicelist", icon: Database },
    { name: "จัดการปั๊มน้ำ", href: "/Paddy/agriculture/PumpManagement", icon: Droplets },
    { name: "AI", href: "/Paddy/agriculture/AI", icon: BarChart3 },
  ];

  // --- Helpers ---
  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return "เมื่อสักครู่";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} นาทีที่แล้ว`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ชั่วโมงที่แล้ว`;
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
  };

  const handleMarkAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif => notif.id === id ? { ...notif, unread: false } : notif)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // --- API Actions ---
  const handleAuthAction = async (url, successMsg, redirectPath) => {
    const result = await apiFetch(url, { method: "POST" });
    if (result.ok) {
      Swal.fire({ icon: "success", title: successMsg, timer: 1500, showConfirmButton: false })
        .then(() => router.replace(redirectPath));
    } else {
      Swal.fire({ icon: "error", title: "ผิดพลาด", text: result.message || "ลองใหม่อีกครั้ง" });
    }
  };

  // --- Data Fetching ---
  const fetchData = useCallback(async (isMounted) => {
    try {
      const response = await apiFetch("/api/auth/me", { method: "GET" });
      const data = response?.data;
      if (!isMounted || !data) return;

      if (data.profile) {
        setUser({
          ...data.profile,
          fullName: `${data.profile.first_name || ''} ${data.profile.last_name || ''}`.trim() || "ผู้ใช้งาน",
          impersonated_by: data.impersonated_by || null
        });
      }

      if (data.devices && Array.isArray(data.devices)) {
        const allAlerts = data.devices.flatMap(device => 
          (device.logs_alert || []).map(log => ({
            id: log.logs_alert_ID,
            title: log.alert_message,
            subTitle: `อุปกรณ์ ID: ${device.device_ID}`,
            time: formatTimeAgo(log.created_at),
            unread: true,
            created_at: log.created_at
          }))
        ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setNotifications(allAlerts);
        setUnreadCount(allAlerts.filter(n => n.unread).length);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchData(isMounted);
    return () => { isMounted = false; };
  }, [pathname, fetchData]);

  // Click Outside logic
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) setIsSettingsOpen(false);
      if (notificationRef.current && !notificationRef.current.contains(e.target)) setIsNotificationOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setIsUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Sub-Components ---
  const NavItem = ({ href, children }) => (
    <Link href={href} className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${pathname === href ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:text-emerald-600 hover:bg-gray-50"}`}>
      {children}
    </Link>
  );

  const MobileNavItem = ({ href, icon: Icon, children, onClick, variant = "default" }) => (
    <Link href={href} onClick={onClick} className={`flex items-center p-3 rounded-lg transition-all mb-1 ${variant === 'danger' ? 'text-red-600 bg-red-50' : pathname === href ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>
      {Icon && <Icon className={`w-5 h-5 mr-3 ${variant === 'danger' ? 'text-red-600' : pathname === href ? "text-emerald-600" : "text-gray-400"}`} />}
      <span className="text-sm">{children}</span>
      {pathname === href && <ChevronRight className="w-4 h-4 ml-auto" />}
    </Link>
  );

  return (
    <>
      {user?.impersonated_by && (
        <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-center py-2 text-sm font-semibold shadow-md sticky top-0 z-50  px-4">
          ⚠️ โหมดผู้ดูแลระบบ: กำลังใช้งานแทน {user.fullName}
        </div>
      )}

      <header className={`bg-white border-b border-gray-200 sticky ${user?.impersonated_by ? 'top-9' : 'top-0'} z-40 shadow-sm`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Brand */}
          <Link href="/Paddy/agriculture/dashboard" className="flex items-center group">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center mr-3 shadow-md group-hover:scale-105 transition-transform">
              <Sprout className="text-white w-6 h-6" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-gray-900 font-bold text-lg leading-tight">Paddy Smart</h1>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">IoT Agriculture</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-1">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.href} href={item.href}>{item.name}</NavItem>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center space-x-2">
            
            {/* Settings */}
            <div className="relative" ref={settingsRef}>
              <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className={`p-2 rounded-full hover:bg-gray-100 ${isSettingsOpen ? 'text-emerald-600' : 'text-gray-500'}`}>
                <Settings className="w-5 h-5" />
              </button>
              {isSettingsOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-xl shadow-xl py-2 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">การตั้งค่าระบบ</div>
                  <Link href="/Paddy/agriculture/settings/WaterLeve" onClick={() => setIsSettingsOpen(false)} className="flex items-center px-4 py-2.5 text-sm hover:bg-emerald-50 text-gray-700"><Activity className="w-4 h-4 mr-3" /> ระดับน้ำในแปลงนา</Link>
                  <Link href="/Paddy/agriculture/settings/GrowthAnalysisSettings" onClick={() => setIsSettingsOpen(false)} className="flex items-center px-4 py-2.5 text-sm hover:bg-emerald-50 text-gray-700"><Shield className="w-4 h-4 mr-3" /> วิเคราะห์การเจริญเติบโต</Link>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className={`p-2 rounded-full relative hover:bg-gray-100 ${isNotificationOpen ? 'text-emerald-600' : 'text-gray-500'}`}>
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>}
              </button>
              {isNotificationOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900">การแจ้งเตือน</h3>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center text-gray-400 text-sm">ไม่มีการแจ้งเตือน</div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} onClick={() => handleMarkAsRead(notif.id)} className={`px-4 py-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${notif.unread ? 'bg-emerald-50/30' : ''}`}>
                          <div className="flex items-start">
                            <div className={`w-2 h-2 mt-1.5 rounded-full ${notif.unread ? 'bg-emerald-500' : 'bg-transparent'}`}></div>
                            <div className="ml-3 flex-1">
                              <p className={`text-sm leading-tight ${notif.unread ? 'font-bold text-gray-900' : 'text-gray-500'}`}>{notif.title}</p>
                              <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:block w-px h-6 bg-gray-200 mx-1"></div>

            {/* User Menu */}
            <div className="relative hidden md:block" ref={userMenuRef}>
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded-full transition-all">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {user?.fullName?.charAt(0).toUpperCase() || "U"}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-1 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-sm font-bold text-gray-900 truncate">{user?.fullName}</p>
                    <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <Link href="/Paddy/agriculture/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50"><User className="w-4 h-4 mr-3" /> โปรไฟล์</Link>
                  <Link href="/Paddy/agriculture/activity" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50"><FileText className="w-4 h-4 mr-3" /> ประวัติการใช้งาน</Link>
                  
                  {user?.impersonated_by ? (
                    <button onClick={() => handleAuthAction("/api/admin/exit-impersonation", "ออกจากโหมดสวมสิทธิ์สำเร็จ", "/Paddy/admin/dashboard")} className="flex w-full items-center px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50 border-t border-gray-50 mt-1">
                      <Shield className="w-4 h-4 mr-3" /> ออกจากโหมดสวมสิทธิ์
                    </button>
                  ) : (
                    <button onClick={() => handleAuthAction("/api/auth/logout", "ออกจากระบบสำเร็จ", "/")} className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-50 mt-1">
                      <LogOut className="w-4 h-4 mr-3" /> ออกจากระบบ
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button className="lg:hidden p-2 text-gray-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white fixed inset-0 top-16 z-50 overflow-y-auto p-4 animate-in slide-in-from-top-5">
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl font-bold">
                  {user?.fullName?.charAt(0).toUpperCase() || "U"}
                </div>
                <div><p className="font-bold text-gray-900">{user?.fullName}</p><p className="text-xs text-gray-500">{user?.email}</p></div>
              </div>
              <div className="space-y-1">
                <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">เมนูหลัก</p>
                {NAV_ITEMS.map((item) => (
                  <MobileNavItem key={item.href} href={item.href} icon={item.icon} onClick={() => setIsMobileMenuOpen(false)}>{item.name}</MobileNavItem>
                ))}
              </div>
              <div className="space-y-1">
                <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">ตั้งค่าและบัญชี</p>
                <MobileNavItem href="/Paddy/agriculture/profile" icon={User} onClick={() => setIsMobileMenuOpen(false)}>โปรไฟล์</MobileNavItem>
                <MobileNavItem href="/Paddy/agriculture/settings/WaterLeve" icon={Activity} onClick={() => setIsMobileMenuOpen(false)}>ระดับน้ำในแปลงนา</MobileNavItem>
                
                {user?.impersonated_by ? (
                  <button onClick={() => handleAuthAction("/api/admin/exit-impersonation", "ออกจากโหมดสวมสิทธิ์สำเร็จ", "/Paddy/admin/dashboard")} className="flex w-full items-center p-3 text-yellow-600 bg-yellow-50 rounded-lg mt-2 font-medium">
                    <Shield className="w-5 h-5 mr-3" /> ออกจากโหมดสวมสิทธิ์
                  </button>
                ) : (
                  <button onClick={() => handleAuthAction("/api/auth/logout", "ออกจากระบบสำเร็จ", "/")} className="flex w-full items-center p-3 text-red-600 bg-red-50 rounded-lg mt-2 font-medium">
                    <LogOut className="w-5 h-5 mr-3" /> ออกจากระบบ
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}