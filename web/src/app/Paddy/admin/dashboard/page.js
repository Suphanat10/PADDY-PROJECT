// "use client";

// import React, { useState } from 'react';
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
//   ArrowUp,
//   ArrowDown,
//   MoreVertical,
//   FileText,
//   MessageSquare,
//   Mail,
//   Sprout,
//   BarChart2,
//   ShoppingCart,
//   Layers,
//   PieChart,
//   Sparkles,
//   Loader2,
//   X,
//   AlertTriangle,
//   List,
//   UserPlus,
//   UserCheck
// } from 'lucide-react';

// // ==============================
// // 1. UI ATOM COMPONENTS
// // ==============================

// // 1.1 Sidebar Item
//    export function SidebarItem({ icon, text, active = false, badge, onClick, subItems }) {
//   const [isExpanded, setIsExpanded] = useState(false);

//   const handleClick = () => {
//     if (subItems) {
//       setIsExpanded(!isExpanded);
//     } else {
//       onClick && onClick();
//     }
//   };

//   const isParentActive = active || (subItems && isExpanded);

//   return (
//     <div className="mb-1">
//       <button
//         onClick={handleClick}
//         className={`group flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
//           active && !subItems
//             ? 'bg-emerald-600 text-white'
//             : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
//         } ${isParentActive && subItems ? 'bg-slate-50 text-emerald-700' : ''}`}
//       >
//         <div className="flex items-center gap-3">
//           <span className={active && !subItems ? 'text-white' : (isParentActive && subItems ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600')}>
//             {icon}
//           </span>
//           <span>{text}</span>
//         </div>
//         {subItems ? (
//           <ChevronDown 
//             size={16} 
//             className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-emerald-600' : ''}`} 
//           />
//         ) : badge && (
//           <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${active ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
//             {badge}
//           </span>
//         )}
//       </button>

//       {/* Submenu Items */}
//       <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
//         {subItems && subItems.map((item, index) => (
//           <button
//             key={index}
//             onClick={item.onClick}
//             className={`w-full flex items-center pl-12 pr-4 py-2 text-xs font-medium rounded-lg transition-colors mb-0.5 ${
//               item.active 
//                 ? 'text-emerald-600 bg-emerald-50' 
//                 : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
//             }`}
//           >
//             <span className={`w-1.5 h-1.5 rounded-full mr-2 ${item.active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
//             {item.text}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }

// const AdminSidebar = ({ sidebarOpen, setSidebarOpen, activeMenu, setActiveMenu }) => {
//   return (
//     <>
//       {/* Mobile Overlay */}
//       {sidebarOpen && (
//         <div 
//           className="fixed inset-0 z-20 bg-black/50 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         ></div>
//       )}

//       <aside 
//         className={`fixed inset-y-0 left-0 z-30 w-72 transform bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
//           sidebarOpen ? 'translate-x-0' : '-translate-x-full'
//         } border-r border-slate-200 flex flex-col`}
//       >
//         {/* Logo Section */}
//         <div className="flex h-20 items-center justify-between px-6 border-b border-slate-100 lg:border-none">
//           <div className="flex items-center gap-3">
//             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold shadow-emerald-200 shadow-lg">
//               <Sprout size={24} />
//             </div>
//             <span className="text-xl font-bold text-slate-800 tracking-tight">PaddySmart</span>
//           </div>
//           <button className="lg:hidden text-slate-500" onClick={() => setSidebarOpen(false)}>
//             <X size={24} />
//           </button>
//         </div>

//         {/* Menu Items */}
//         <div className="no-scrollbar flex-1 overflow-y-auto p-4 space-y-8">
//           <div>
//             <h3 className="mb-4 ml-4 text-xs font-bold text-slate-400 uppercase tracking-wider">MENU</h3>
//             <nav className="space-y-1">
//               <SidebarItem 
//                 icon={<LayoutDashboard size={20} />} text="Dashboard" 
//                 active={activeMenu === 'Dashboard'} onClick={() => setActiveMenu('Dashboard')}
//               />
//               <SidebarItem 
//                 icon={<Cpu size={20} />} text="IoT Devices" 
//                 active={activeMenu === 'IoT Devices'} onClick={() => setActiveMenu('IoT Devices')}
//               />
              
//               {/* Farmers Menu with Submenu */}
//               <SidebarItem 
//                 icon={<Users size={20} />} text="Farmers" 
//                 active={activeMenu.startsWith('Farmers')}
//                 subItems={[
//                   { 
//                     text: 'รายชื่อเกษตรกร', 
//                     active: activeMenu === 'Farmers-List',
//                     onClick: () => setActiveMenu('Farmers-List')
//                   },
//                   { 
//                     text: 'ลงทะเบียนใหม่', 
//                     active: activeMenu === 'Farmers-Add',
//                     onClick: () => setActiveMenu('Farmers-Add')
//                   },
//                   { 
//                     text: 'กลุ่มเกษตรกร', 
//                     active: activeMenu === 'Farmers-Groups',
//                     onClick: () => setActiveMenu('Farmers-Groups')
//                   }
//                 ]}
//               />

//               <SidebarItem 
//                 icon={<BarChart2 size={20} />} text="Analytics" 
//                 active={activeMenu === 'Analytics'} onClick={() => setActiveMenu('Analytics')}
//               />
//             </nav>
//           </div>

//           <div>
//             <h3 className="mb-4 ml-4 text-xs font-bold text-slate-400 uppercase tracking-wider">SUPPORT</h3>
//             <nav className="space-y-1">
//               <SidebarItem icon={<MessageSquare size={20} />} text="Chat" />
//               <SidebarItem icon={<Mail size={20} />} text="Email" badge="2" />
//               <SidebarItem icon={<Settings size={20} />} text="Settings" />
//             </nav>
//           </div>
//         </div>
        
//         {/* User Mini Profile & Logout */}
//         <div className="p-4 border-t border-slate-100">
//             <button 
//                 className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mb-3"
//                 onClick={() => alert("ออกจากระบบเรียบร้อยแล้ว")}
//             >
//                 <LogOut size={20} />
//                 <span>ออกจากระบบ</span>
//             </button>

//             <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100">
//                 <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
//                     A
//                 </div>
//                 <div className="flex-1 min-w-0">
//                     <p className="text-sm font-semibold text-slate-800 truncate">Admin User</p>
//                     <p className="text-xs text-slate-500 truncate">admin@paddysmart.com</p>
//                 </div>
//             </div>
//         </div>
//       </aside>
//     </>
//   );
// };


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
        
//         <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 w-80 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
//           <Search size={18} className="text-slate-400" />
//           <input 
//             type="text" placeholder="ค้นหา..." 
//             className="bg-transparent text-sm outline-none placeholder:text-slate-400 w-full"
//           />
//           <span className="text-xs text-slate-400 font-medium border border-slate-300 rounded px-1.5 py-0.5">⌘K</span>
//         </div>
//       </div>

//       <div className="flex items-center gap-4">
       

        
        
//         <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200">
//           <div className="text-right">
//             <p className="text-sm font-medium text-slate-700">Admin User</p>
//             <p className="text-xs text-slate-500">Super Admin</p>
//           </div>
//           <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm bg-slate-200">
//              <div className="w-full h-full bg-emerald-500 flex items-center justify-center text-white font-bold">A</div>
//           </div>
//           <ChevronDown size={16} className="text-slate-400 cursor-pointer" />
//         </div>
//       </div>
//     </header>
//   );
// };

// // ==============================
// // 4. PAGE SECTIONS
// // ==============================

// // ==============================
// // 5. MAIN PAGE COMPONENT
// // ==============================
// export default function AdminDashboardPage() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [activeMenu, setActiveMenu] = useState('Dashboard');

//   // AI State
//   const [isAiModalOpen, setIsAiModalOpen] = useState(false);
//   const [aiContent, setAiContent] = useState('');
//   const [isAiLoading, setIsAiLoading] = useState(false);

//   // Gemini API Function
//   const generateGeminiInsight = async () => {
//     setIsAiModalOpen(true);
//     setIsAiLoading(true);
//     setAiContent('');

//     const apiKey = ""; // System injected
//     const systemStats = `
//       System Status: Total Users: 2,543 (+12.5%), Online Devices: 1,890 (+8.2%), Today's Alerts: 15 (-2.1%), Data Usage: 45 GB (+5.4%).
//     `;
//     const prompt = `วิเคราะห์สถานะระบบ Paddy Smart จากข้อมูล: ${systemStats} สรุปสั้นๆ และแนะนำ Admin 3 ข้อ`;

//     try {
//       const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
//       });
//       if (!response.ok) throw new Error("API Request Failed");
//       const data = await response.json();
//       setAiContent(data.candidates?.[0]?.content?.parts?.[0]?.text || "No data");
//     } catch (error) {
//       setAiContent("เกิดข้อผิดพลาดในการเชื่อมต่อ AI");
//     } finally {
//       setIsAiLoading(false);
//     }
//   };

//   return (
//     <div className="flex h-screen bg-slate-100  text-slate-600">
      
   

//       <AdminSidebar 
//         sidebarOpen={sidebarOpen} 
//         setSidebarOpen={setSidebarOpen} 
//         activeMenu={activeMenu} 
//         setActiveMenu={setActiveMenu} 
//       />

//       <div className="flex flex-1 flex-col overflow-hidden">
//         <AdminHeader 
//           setSidebarOpen={setSidebarOpen} 
//           onAiClick={generateGeminiInsight} 
//         />

//         <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50">
          
//           <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//                 <h2 className="text-2xl font-bold text-slate-800">ภาพรวมระบบ (Overview)</h2>
//                 <p className="text-slate-500 text-sm mt-1">ยินดีต้อนรับกลับมา, นี่คือสถานะล่าสุดของ Paddy Smart</p>
//             </div>
            

//           </div>

//           {/* <StatsSection />
//           <ChartsSection /> */}

//         </main>
//       </div>
//     </div>
//   );
// }




"use client";

import React, { useState } from 'react';
import {
  Users,
  Cpu,
  Layers,
  AlertTriangle
} from 'lucide-react';

// นำเข้า Component ที่แยกไฟล์แล้วจากโฟลเดอร์ components/admin
import { StatCard, AIInsightModal } from '../../../components/admin/AdminUI';
import { AdminSidebar, AdminHeader } from '../../../components/admin/AdminLayout';
// import { AlertStatusChart, UserGrowthChart, DevicePerformanceChart, SystemUsageChart } from '../../components/admin/AdminCharts';

export default function AdminDashboardPage() {
  // State สำหรับจัดการ Sidebar และ Menu
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  // AI State สำหรับ Modal และข้อมูล
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiContent, setAiContent] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);



  return (
    <div className="flex h-screen bg-slate-100  text-slate-600">
   
      <AdminSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        
  
        <AdminHeader 
          setSidebarOpen={setSidebarOpen} 
        />


        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50">
          
   
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">ภาพรวมระบบ (Overview)</h2>
                <p className="text-slate-500 text-sm mt-1">ยินดีต้อนรับกลับมา, นี่คือสถานะล่าสุดของ Paddy Smart</p>
            </div>
           
          </div>

          


          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
    
          </div>

        </main>
      </div>
    </div>
  );
}