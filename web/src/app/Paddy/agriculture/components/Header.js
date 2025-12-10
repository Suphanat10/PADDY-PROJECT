"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  Bell, Settings, User, ChevronDown, Menu, X, Sprout, 
  LogOut, Shield, Activity, FileText, LayoutDashboard, 
  PlusCircle, Database, BarChart3, Map, ChevronRight 
} from "lucide-react";
import { apiFetch } from "@/lib/api"; // ตรวจสอบว่า path นี้ถูกต้องในโปรเจคของคุณ

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // State สำหรับเก็บข้อมูล
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const settingsRef = useRef(null);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  const pathname = usePathname();
  const router = useRouter();

  // --- รายการเมนูหลัก (แก้ที่นี่เปลี่ยนทั้ง Desktop และ Mobile) ---
  const NAV_ITEMS = [
    { name: "หน้าหลัก", href: "/Paddy/agriculture/dashboard", icon: LayoutDashboard },
    { name: "ลงทะเบียนอุปกรณ์", href: "/Paddy/agriculture/registerdevice", icon: PlusCircle },
    { name: "จัดการพื้นที่", href: "/Paddy/agriculture/FarmManagement", icon: Map },
    { name: "ข้อมูลอุปกรณ์", href: "/Paddy/agriculture/devicelist", icon: Database },
    { name: "สถิติ", href: "/Paddy/agriculture/statistics", icon: BarChart3 },
  ];

  // --- Helper Functions ---
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

  const getInitials = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  // --- Effects ---
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        // หมายเหตุ: หากยังไม่มี apiFetch ให้ใช้ fetch ธรรมดาแทน หรือตรวจสอบ path import
        const response = await apiFetch("/api/auth/me", { method: "GET" });
        const data = response?.data; // Optional chaining ป้องกัน error

        if (!cancelled && data) {
          // 1. จัดการข้อมูล Profile
          if (data.profile) {
            setUser({
                ...data.profile,
                fullName: `${data.profile.first_name || ''} ${data.profile.last_name || ''}`.trim() || "ผู้ใช้งาน"
            });
          }

          // 2. จัดการข้อมูล Notifications
          if (data.devices && Array.isArray(data.devices)) {
            let allAlerts = [];
            data.devices.forEach(device => {
                if (device.logs_alert && Array.isArray(device.logs_alert)) {
                    const alertsWithDeviceId = device.logs_alert.map(log => ({
                        ...log,
                        source_device_id: device.device_ID
                    }));
                    allAlerts = [...allAlerts, ...alertsWithDeviceId];
                }
            });

            allAlerts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            const formattedNotifications = allAlerts.map(log => ({
                id: log.logs_alert_ID,
                title: log.alert_message, 
                subTitle: `อุปกรณ์ ID: ${log.source_device_id}`,
                time: formatTimeAgo(log.created_at),
                rawTime: log.created_at,
                unread: true, 
                type: 'info'
            }));

            setNotifications(formattedNotifications);
            setUnreadCount(formattedNotifications.length);
          }
        }
      } catch (error) {
        console.error("Error fetching header data:", error);
        // กรณี Error อาจจะ set user เป็น null หรือ mock data ไว้ทดสอบ
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [pathname]);

  // Click Outside Logic
  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) setIsSettingsOpen(false);
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setIsNotificationOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setIsUserMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ปิด Mobile Menu เมื่อเปลี่ยนหน้า
  useEffect(() => { 
    setIsMobileMenuOpen(false); 
  }, [pathname]);

  // --- Handlers ---
  const toggleSettings = () => { setIsSettingsOpen(!isSettingsOpen); setIsNotificationOpen(false); setIsUserMenuOpen(false); };
  const toggleNotifications = () => { setIsNotificationOpen(!isNotificationOpen); setIsSettingsOpen(false); setIsUserMenuOpen(false); };
  const toggleUserMenu = () => { setIsUserMenuOpen(!isUserMenuOpen); setIsSettingsOpen(false); setIsNotificationOpen(false); };

  const logout = async () => {
    try { 
        await apiFetch("/api/auth/logout", { method: "POST" }); 
    } catch (error) {
        console.error("Logout error", error);
    } finally {
        // Redirect เสมอ แม้ API จะ error
        router.replace("/login");
        router.refresh();
    }
  };

  // --- Components ---
  const NavItem = ({ href, children }) => {
    const isActive = pathname === href;
    return (
      <Link href={href} className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:text-emerald-600 hover:bg-gray-50"}`}>
        <span>{children}</span>
      </Link>
    );
  };

  const MobileNavItem = ({ href, icon: Icon, children, onClick }) => {
    const isActive = pathname === href;
    return (
        <Link 
            href={href} 
            onClick={onClick}
            className={`flex items-center p-3 rounded-lg transition-all mb-1 ${
                isActive ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-emerald-600"
            }`}
        >
            {Icon && <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-emerald-600" : "text-gray-400"}`} />}
            <span className="text-sm">{children}</span>
            {isActive && <ChevronRight className="w-4 h-4 ml-auto text-emerald-600" />}
        </Link>
    );
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/Paddy/agriculture/dashboard" className="flex items-center group">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mr-3 shadow-md group-hover:shadow-lg transition-all">
                <Sprout className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-gray-900 font-bold text-lg leading-tight tracking-tight">Paddy Smart</h1>
                <p className="text-xs text-gray-500 font-medium">Agriculture IoT</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {NAV_ITEMS.map((item) => (
                <NavItem key={item.href} href={item.href}>{item.name}</NavItem>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            
            {/* Settings Dropdown */}
            <div className="relative hidden sm:block" ref={settingsRef}>
              <button onClick={toggleSettings} className={`p-2 rounded-full transition-colors ${isSettingsOpen ? 'bg-gray-100 text-emerald-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}>
                <Settings className="w-5 h-5" />
              </button>
              {isSettingsOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 py-2 origin-top-right animate-in fade-in zoom-in-95 duration-100">
                   <div className="px-4 py-2 border-b border-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider">การตั้งค่าระบบ</div>
                   <Link href="/Paddy/agriculture/settings/WaterLeve" onClick={() => setIsSettingsOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"><Activity className="w-4 h-4 mr-3 text-gray-400" /> ระดับน้ำในแปลงนา</Link>
                   <Link href="/Paddy/agriculture/settings/GrowthAnalysisSettings" onClick={() => setIsSettingsOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"><Shield className="w-4 h-4 mr-3 text-gray-400" /> ตั้งค่าการวิเคราะห์การเจริญเติบโตข้าว
</Link>
                   <Link href="/settings/system" onClick={() => setIsSettingsOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"><Database className="w-4 h-4 mr-3 text-gray-400" /> ตั้งค่าระบบ</Link>
                </div>
              )}
            </div>

            {/* Notifications Dropdown */}
            <div className="relative hidden sm:block" ref={notificationRef}>
              <button onClick={toggleNotifications} className={`p-2 rounded-full relative transition-colors ${isNotificationOpen ? 'bg-gray-100 text-emerald-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}>
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-100 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">การแจ้งเตือน</h3>
                    {unreadCount > 0 && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">{unreadCount} ใหม่</span>}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center justify-center text-gray-400">
                            <Bell className="w-8 h-8 mb-2 opacity-20" />
                            <span className="text-sm">ไม่มีการแจ้งเตือน</span>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                        <div key={notification.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${notification.unread ? 'bg-emerald-50/30' : ''}`}>
                            <div className="flex items-start">
                            <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${notification.unread ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                            <div className="ml-3 flex-1">
                                <p className={`text-sm ${notification.unread ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{notification.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{notification.subTitle}</p>
                                <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                            </div>
                            </div>
                        </div>
                        ))
                    )}
                  </div>
                  <Link href="/notifications" onClick={() => setIsNotificationOpen(false)} className="block px-4 py-3 text-center text-sm font-medium text-emerald-600 hover:text-emerald-800 hover:bg-gray-50 transition-colors">
                    ดูทั้งหมด
                  </Link>
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="hidden md:block w-px h-8 bg-gray-200 mx-2"></div>

            {/* User Menu Dropdown */}
            <div className="relative hidden md:block" ref={userMenuRef}>
              <button onClick={toggleUserMenu} className="flex items-center space-x-3 p-1.5 rounded-full hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold border border-emerald-200">
                  {loading ? <span className="animate-pulse w-full h-full rounded-full bg-gray-200"/> : getInitials(user?.fullName)}
                </div>
                <div className="hidden lg:flex flex-col items-start text-left">
                    <span className="text-sm font-medium text-gray-700 leading-none">
                        {loading ? "..." : user?.fullName}
                    </span>
                    <span className="text-[10px] text-gray-500 mt-0.5">{user?.position || "User"}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 py-1 origin-top-right animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link href="/Paddy/agriculture/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"><User className="w-4 h-4 mr-2" /> โปรไฟล์</Link>
                    <Link href="/Paddy/agriculture/activity" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"><FileText className="w-4 h-4 mr-2" /> ประวัติการใช้งาน</Link>
                  </div>
                  <div className="border-t border-gray-50 py-1">
                    <button onClick={logout} className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4 mr-2" /> ออกจากระบบ</button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button className="lg:hidden p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* --- Mobile Menu (ส่วนที่เคยขาดหายไป) --- */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg h-[calc(100vh-64px)] overflow-y-auto animate-in slide-in-from-top-5 duration-200 fixed w-full left-0">
           <div className="p-4 space-y-4">
              
              {/* Mobile: User Info Section */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-bold border border-emerald-200">
                  {getInitials(user?.fullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName || "Guest"}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || "No email"}</p>
                </div>
              </div>

              {/* Mobile: Notifications Summary */}
              {unreadCount > 0 && (
                 <Link href="/notifications" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 mb-2">
                    <div className="flex items-center">
                        <Bell className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">การแจ้งเตือนใหม่</span>
                    </div>
                    <span className="bg-red-200 text-red-800 text-xs font-bold px-2 py-1 rounded-full">{unreadCount}</span>
                 </Link>
              )}

              {/* Mobile: Main Navigation */}
              <div className="space-y-1">
                 <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">เมนูหลัก</p>
                 {NAV_ITEMS.map((item) => (
                    <MobileNavItem key={item.href} href={item.href} icon={item.icon} onClick={() => setIsMobileMenuOpen(false)}>
                        {item.name}
                    </MobileNavItem>
                 ))}
              </div>

              <div className="border-t border-gray-100 my-4"></div>

              {/* Mobile: Settings & Account */}
              <div className="space-y-1">
                 <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">บัญชีและการตั้งค่า</p>
                 <MobileNavItem href="/Paddy/agriculture/profile" icon={User} onClick={() => setIsMobileMenuOpen(false)}>โปรไฟล์</MobileNavItem>
                 <MobileNavItem href="/Paddy/agriculture/settings/WaterLeve" icon={Activity} onClick={() => setIsMobileMenuOpen(false)}>ระดับน้ำในแปลงนา</MobileNavItem>
                 <MobileNavItem href="/settings/system" icon={Settings} onClick={() => setIsMobileMenuOpen(false)}>ตั้งค่าระบบ</MobileNavItem>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100">
                <button onClick={logout} className="flex items-center w-full p-3 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                    <LogOut className="w-5 h-5 mr-3" />
                    <span className="font-medium">ออกจากระบบ</span>
                </button>
              </div>
           </div>
        </div>
      )}
    </header>
  );
}