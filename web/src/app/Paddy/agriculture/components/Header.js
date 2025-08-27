"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Settings, User, ChevronDown, Menu, X, Sprout } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const settingsRef = useRef(null);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch("/api/auth/me", { method: "GET" });
        if (!cancelled) setUser(data?.user ?? null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    })();
    return () => { cancelled = true; };
  }, [pathname]); // โหลดใหม่เมื่อเปลี่ยนหน้า

  // ปิด dropdown เมื่อคลิกนอกองค์ประกอบ
  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ปิดเมนูมือถือเมื่อเปลี่ยนเส้นทาง
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // ข้อมูลแจ้งเตือน (ตัวอย่าง)
  const notifications = [
    { id: 1, title: "อุปกรณ์ใหม่เชื่อมต่อเรียบร้อย", time: "5 นาทีที่แล้ว", unread: true },
    { id: 2, title: "ข้อมูลความชื้นผิดปกติ", time: "1 ชั่วโมงที่แล้ว", unread: true },
    { id: 3, title: "รายงานประจำวันพร้อมแล้ว", time: "2 ชั่วโมงที่แล้ว", unread: false },
  ];
  const unreadCount = notifications.filter((n) => n.unread).length;

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
    setIsNotificationOpen(false);
    setIsUserMenuOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsSettingsOpen(false);
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsSettingsOpen(false);
    setIsNotificationOpen(false);
  };

  const logout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {}
    router.replace("/login");
  };

  const displayName =
    user?.first_name || user?.last_name
      ? `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim()
      : "ผู้ใช้งาน";

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-full flex items-center justify-center mr-2 sm:mr-4">
              <Sprout className="text-white w-6 h-6" />
            </div>
            <Link
              href="/Paddy/agriculture/dashboard"
              className="text-gray-800 font-bold text-lg sm:text-xl"
            >
              Paddy Smart
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link
              href="/Paddy/agriculture/dashboard"
              className="text-gray-700 hover:text-emerald-600 font-medium text-sm xl:text-base"
            >
              หน้าหลัก
            </Link>
            <Link
              href="/Paddy/agriculture/registerdevice"
              className="text-gray-500 hover:text-emerald-600 text-sm xl:text-base"
            >
              ลงทะเบียนอุปกรณ์
            </Link>
            <Link
              href="/Paddy/agriculture/devicelist"
              className="text-gray-500 hover:text-emerald-600 text-sm xl:text-base"
            >
              ข้อมูลอุปกรณ์
            </Link>
            <Link
              href="/Paddy/agriculture/statistics"
              className="text-gray-500 hover:text-emerald-600 text-sm xl:text-base"
            >
              ข้อมูลสถิติ
            </Link>
          </nav>

          {/* Right controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Settings */}
            <div className="relative hidden sm:block" ref={settingsRef}>
              <button
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                onClick={toggleSettings}
                aria-haspopup="menu"
                aria-expanded={isSettingsOpen}
                aria-label="การตั้งค่า"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-100">
                      การตั้งค่า
                    </div>
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      ตั้งค่าโปรไฟล์
                    </Link>
                    <Link href="/settings/notifications" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      ตั้งค่าการแจ้งเตือน
                    </Link>
                    <Link href="/settings/security" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      ตั้งค่าความปลอดภัย
                    </Link>
                    <Link href="/settings/system" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      ตั้งค่าระบบ
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative hidden sm:block" ref={notificationRef}>
              <button
                className="p-2 text-gray-500 hover:text-gray-700 relative transition-colors"
                onClick={toggleNotifications}
                aria-haspopup="menu"
                aria-expanded={isNotificationOpen}
                aria-label="การแจ้งเตือน"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-100 flex items-center justify-between">
                      การแจ้งเตือน
                      {unreadCount > 0 && (
                        <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                          {unreadCount} ใหม่
                        </span>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 ${
                            notification.unread ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p
                                className={`text-sm ${
                                  notification.unread ? "font-medium text-gray-900" : "text-gray-700"
                                }`}
                              >
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                            {notification.unread && <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100">
                      <Link href="/notifications" className="text-sm text-emerald-600 hover:text-emerald-700">
                        ดูการแจ้งเตือนทั้งหมด
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative hidden md:block" ref={userMenuRef}>
              <button
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={toggleUserMenu}
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
                aria-label="เมนูผู้ใช้"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                <span className="text-gray-700 font-medium text-sm lg:text-base">
                  {loadingUser ? "กำลังโหลด..." : displayName}
                </span>
                <ChevronDown
                  className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-500 transition-transform ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-500">{user?.username || ""}</p>
                    </div>
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      โปรไฟล์ของฉัน
                    </Link>
                    <Link href="/activity" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      ประวัติการใช้งาน
                    </Link>
                    <Link href="/membership" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      การสมัครสมาชิก
                    </Link>
                    <div className="border-t border-gray-100 mt-2">
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        ออกจากระบบ
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="เมนู"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-3 mt-4">
              <Link href="/Paddy/agriculture/dashboard" className="text-gray-700 hover:text-emerald-600 font-medium">
                หน้าหลัก
              </Link>
              <Link href="/Paddy/agriculture/registerdevice" className="text-gray-500 hover:text-emerald-600">
                ลงทะเบียนอุปกรณ์
              </Link>
              <Link href="/Paddy/agriculture/devicelist" className="text-gray-500 hover:text-emerald-600">
                ข้อมูลอุปกรณ์
              </Link>
              <Link href="/Paddy/agriculture/statistics" className="text-gray-500 hover:text-emerald-600">
                ข้อมูลสถิติ
              </Link>
            </nav>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link href="/settings" className="flex items-center space-x-3 py-2 text-gray-700 hover:text-emerald-600">
                <Settings className="w-5 h-5" />
                <span>การตั้งค่า</span>
              </Link>
              <button
                onClick={toggleNotifications}
                className="flex items-center space-x-3 py-2 text-gray-700 hover:text-emerald-600"
              >
                <Bell className="w-5 h-5" />
                <span>การแจ้งเตือน</span>
                {unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
              <User className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700 font-medium">
                {loadingUser ? "กำลังโหลด..." : displayName}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
