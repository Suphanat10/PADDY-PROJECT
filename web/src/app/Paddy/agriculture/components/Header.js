"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  Bell, Settings, User, ChevronDown, Menu, X, Sprout, 
  LogOut, Shield, Activity, FileText, LayoutDashboard, 
  PlusCircle, Database, BarChart3, ChevronRight 
} from "lucide-react";
import { apiFetch } from "@/lib/api";

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

  // --- ส่วนสำคัญ: ฟังก์ชันแปลงวันที่ ---
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "เมื่อสักครู่";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} นาทีที่แล้ว`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ชั่วโมงที่แล้ว`;
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
  };

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const response = await apiFetch("/api/auth/me", { method: "GET" }); // เรียก API เส้นเดียว

        const  data  = response.data;

        if (!cancelled && data) {
          // 1. จัดการข้อมูล Profile
          if (data.profile) {
            setUser({
                ...data.profile,
                // สร้างชื่อเต็มรอไว้เลย
                fullName: `${data.profile.first_name || ''} ${data.profile.last_name || ''}`.trim()
            });
          }

          // 2. จัดการข้อมูล Notifications (ดึง logs_alert จากทุก devices มารวมกัน)
          if (data.devices && Array.isArray(data.devices)) {
            let allAlerts = [];

            // วนลูปทุก Device เพื่อเอา log ออกมา
            data.devices.forEach(device => {
                if (device.logs_alert && Array.isArray(device.logs_alert)) {
                    // เพิ่มชื่อ Device ID เข้าไปใน log ด้วย เพื่อให้รู้ว่ามาจากตัวไหน
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
                subTitle: `อุปกรณ์ ID: ${log.source_device_id}`, // เพิ่มบรรทัดย่อยบอกว่ามาจากเครื่องไหน
                time: formatTimeAgo(log.created_at),
                rawTime: log.created_at, // เก็บเวลาดิบไว้เช็ค
                unread: true, // *หมายเหตุ: API ไม่มี field is_read สมมติว่าเป็น true ไปก่อน
                type: 'info'
            }));

            setNotifications(formattedNotifications);
            setUnreadCount(formattedNotifications.length); // นับจำนวนทั้งหมดเป็น Unread
          }
        }
      } catch (error) {
        console.error("Error fetching header data:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [pathname]);

  // Click Outside logic (เหมือนเดิม)
  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) setIsSettingsOpen(false);
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setIsNotificationOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setIsUserMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { setIsMobileMenuOpen(false); }, [pathname]);

  const toggleSettings = () => { setIsSettingsOpen(!isSettingsOpen); setIsNotificationOpen(false); setIsUserMenuOpen(false); };
  const toggleNotifications = () => { setIsNotificationOpen(!isNotificationOpen); setIsSettingsOpen(false); setIsUserMenuOpen(false); };
  const toggleUserMenu = () => { setIsUserMenuOpen(!isUserMenuOpen); setIsSettingsOpen(false); setIsNotificationOpen(false); };

  const logout = async () => {
    try { await apiFetch("/api/auth/logout", { method: "POST" }); } catch {}
    router.replace("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  // Helper สำหรับเมนู
  const NavItem = ({ href, children, icon: Icon }) => {
    const isActive = pathname === href;
    return (
      <Link href={href} className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:text-emerald-600 hover:bg-gray-50"}`}>
        <span>{children}</span>
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
            <NavItem href="/Paddy/agriculture/dashboard">หน้าหลัก</NavItem>
            <NavItem href="/Paddy/agriculture/registerdevice">ลงทะเบียนอุปกรณ์</NavItem>
            <NavItem href="/Paddy/agriculture/FarmManagement">จัดการพื้นที่</NavItem>
            <NavItem href="/Paddy/agriculture/devicelist">ข้อมูลอุปกรณ์</NavItem>
            <NavItem href="/Paddy/agriculture/statistics">สถิติ</NavItem>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            
            {/* Settings */}
            <div className="relative hidden sm:block" ref={settingsRef}>
              <button onClick={toggleSettings} className={`p-2 rounded-full transition-colors ${isSettingsOpen ? 'bg-gray-100 text-emerald-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}>
                <Settings className="w-5 h-5" />
              </button>
              {isSettingsOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 py-2 transform opacity-100 scale-100 origin-top-right transition-all">
                   {/* ... เนื้อหา Settings เหมือนเดิม ... */}
                   <div className="px-4 py-2 border-b border-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider">การตั้งค่าระบบ</div>
                   <Link href="/Paddy/agriculture/settings/WaterLeve" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"><Activity className="w-4 h-4 mr-3 text-gray-400" /> ระดับน้ำในแปลงนา</Link>
                   <Link href="/settings/security" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"><Shield className="w-4 h-4 mr-3 text-gray-400" /> ความปลอดภัย</Link>
                   <Link href="/settings/system" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"><Database className="w-4 h-4 mr-3 text-gray-400" /> ตั้งค่าระบบ</Link>
                </div>
              )}
            </div>

            {/* Notifications */}
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
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-100 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 overflow-hidden origin-top-right">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">การแจ้งเตือน</h3>
                    {unreadCount > 0 && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">{unreadCount} ใหม่</span>}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">ไม่มีการแจ้งเตือน</div>
                    ) : (
                        notifications.map((notification) => (
                        <div key={notification.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${notification.unread ? 'bg-emerald-50/30' : ''}`}>
                            <div className="flex items-start">
                            <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${notification.unread ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                            <div className="ml-3 flex-1">
                                <p className={`text-sm ${notification.unread ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{notification.title}</p>
                                {/* เพิ่มบรรทัดย่อย เพื่อบอกว่ามาจากอุปกรณ์ตัวไหน */}
                                <p className="text-xs text-gray-500 mt-0.5">{notification.subTitle}</p>
                                <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                            </div>
                            </div>
                        </div>
                        ))
                    )}
                  </div>
                  <Link href="/notifications" className="block px-4 py-3 text-center text-sm font-medium text-emerald-600 hover:text-emerald-800 hover:bg-gray-50 transition-colors">
                    ดูทั้งหมด
                  </Link>
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="hidden md:block w-px h-8 bg-gray-200 mx-2"></div>

            {/* User Menu */}
            <div className="relative hidden md:block" ref={userMenuRef}>
              <button onClick={toggleUserMenu} className="flex items-center space-x-3 p-1.5 rounded-full hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold border border-emerald-200">
                  {loading ? <span className="animate-pulse w-full h-full rounded-full bg-gray-200"/> : getInitials(user?.fullName)}
                </div>
                <div className="hidden lg:flex flex-col items-start text-left">
                    <span className="text-sm font-medium text-gray-700 leading-none">
                        {loading ? "..." : user?.fullName}
                    </span>
                    {/* ใช้ข้อมูล Position จาก JSON */}
                    <span className="text-[10px] text-gray-500 mt-0.5">{user?.position || "User"}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 py-1 origin-top-right">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link href="/Paddy/agriculture/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"><User className="w-4 h-4 mr-2" /> โปรไฟล์</Link>
                    <Link href="/Paddy/agriculture/activity" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"><FileText className="w-4 h-4 mr-2" /> ประวัติการใช้งาน</Link>
                  </div>
                  <div className="border-t border-gray-50 py-1">
                    <button onClick={logout} className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4 mr-2" /> ออกจากระบบ</button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button className="lg:hidden p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-inner animate-in slide-in-from-top-2 duration-200">
           {/* ... โค้ดส่วน Mobile Menu เดิม (ใช้ตัวแปร user เหมือนกัน) ... */}
           {/* ผมละไว้เพื่อไม่ให้โค้ดยาวเกินไป แต่หลักการคือใช้ user.fullName, user.email, unreadCount เหมือนข้างบนครับ */}
        </div>
      )}
    </header>
  );
}