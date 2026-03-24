

// "use client";

// import React, { useState, useMemo, useEffect } from "react";
// import {
//   Sprout,
//   Search,
//   MapPin,
//   User,
//   LayoutGrid,
//   BarChart3,
//   History,
//   Info,
//   ImageIcon,
//   Loader2,
//   Filter,
//   ChevronDown,
//   ChevronLeft,
//   ChevronRight,
//   Leaf,
//   Bug,
//   Activity,
//   AlertTriangle,
//   CheckCircle,
//   Clock,
//   X,
//   Building2,
//   Layers
// } from "lucide-react";
// import { apiFetch } from "@/lib/api";
// import Swal from "sweetalert2";
// import Footer from "@/app/components/Footer";
// import { AdminSidebar, AdminHeader } from '../../../components/admin/AdminLayout';

// export default function GrowthAnalysisPage() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [RAW_DATA, setData] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);

//   // Filter states
//   const [selectedUser, setSelectedUser] = useState("all");
//   const [selectedFarm, setSelectedFarm] = useState("all");
//   const [selectedArea, setSelectedArea] = useState("all");
//   const [activeTab, setActiveTab] = useState("growth"); // "growth" or "disease"

//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true);
//       try {
//         const res = await apiFetch("/api/admin/get_data_growth_analysis", {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//           },
//         });
//         if (!res.ok) {
//           Swal.fire({
//             icon: "error",
//             title: "Fetch failed",
//             text: res.message || "Unknown error",
//           });
//           return;
//         }
//         // Handle nested data structure: res.data could be { data: [...] } or [...]
//         const rawData = res.data?.data || res.data || [];
//         setData(Array.isArray(rawData) ? rawData : []);
//         setIsLoading(false);
//       } catch (error) {
//         console.error("Error fetching growth analysis data:", error);
//         setIsLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   // ดึงรายชื่อ users ที่มีฟาร์ม
//   const users = useMemo(() => {
//     if (!RAW_DATA?.length) return [];
//     return RAW_DATA
//       .filter(u => u.farms?.length > 0)
//       .map(u => ({
//         id: u.user_id,
//         name: `${u.first_name} ${u.last_name}`
//       }));
//   }, [RAW_DATA]);

//   // ดึงรายชื่อฟาร์มตาม user ที่เลือก
//   const farms = useMemo(() => {
//     if (!RAW_DATA?.length) return [];
//     if (selectedUser === "all") {
//       return RAW_DATA.flatMap(u => 
//         u.farms?.map(f => ({ 
//           id: f.farm_id, 
//           name: f.farm_name,
//           userId: u.user_id 
//         })) || []
//       );
//     }
//     const user = RAW_DATA.find(u => u.user_id === parseInt(selectedUser));
//     return user?.farms?.map(f => ({ 
//       id: f.farm_id, 
//       name: f.farm_name,
//       userId: user.user_id 
//     })) || [];
//   }, [RAW_DATA, selectedUser]);

//   // ดึงรายชื่อ areas ตามฟาร์มที่เลือก
//   const areas = useMemo(() => {
//     if (!RAW_DATA?.length) return [];
//     if (selectedFarm === "all") {
//       return RAW_DATA.flatMap(u =>
//         u.farms?.flatMap(f =>
//           f.areas?.map(a => ({
//             id: a.area_id,
//             name: a.area_name,
//             farmId: f.farm_id
//           })) || []
//         ) || []
//       );
//     }
//     const farm = RAW_DATA.flatMap(u => u.farms || []).find(f => f.farm_id === parseInt(selectedFarm));
//     return farm?.areas?.map(a => ({
//       id: a.area_id,
//       name: a.area_name,
//       farmId: farm.farm_id
//     })) || [];
//   }, [RAW_DATA, selectedFarm]);

//   // Reset filters เมื่อเปลี่ยน parent filter
//   useEffect(() => {
//     setSelectedFarm("all");
//     setSelectedArea("all");
//   }, [selectedUser]);

//   useEffect(() => {
//     setSelectedArea("all");
//   }, [selectedFarm]);

//   // รวมข้อมูลทั้งหมดจาก devices
//   const allAnalysisData = useMemo(() => {
//     if (!RAW_DATA?.length) return { growth: [], disease: [] };

//     const growth = [];
//     const disease = [];

//     RAW_DATA.forEach(user => {
//       if (selectedUser !== "all" && user.user_id !== parseInt(selectedUser)) return;

//       user.farms?.forEach(farm => {
//         if (selectedFarm !== "all" && farm.farm_id !== parseInt(selectedFarm)) return;

//         farm.areas?.forEach(area => {
//           if (selectedArea !== "all" && area.area_id !== parseInt(selectedArea)) return;

//           area.devices?.forEach(device => {
//             // Growth analysis
//             device.growth_analysis?.forEach(g => {
//               growth.push({
//                 ...g,
//                 device_code: device.device.device_code,
//                 user_name: `${user.first_name} ${user.last_name}`,
//                 farm_name: farm.farm_name,
//                 area_name: area.area_name
//               });
//             });

//             // Disease analysis
//             device.disease_analysis?.forEach(d => {
//               disease.push({
//                 ...d,
//                 device_code: device.device.device_code,
//                 user_name: `${user.first_name} ${user.last_name}`,
//                 farm_name: farm.farm_name,
//                 area_name: area.area_name
//               });
//             });
//           });
//         });
//       });
//     });

//     // Sort by date descending
//     growth.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
//     disease.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

//     return { growth, disease };
//   }, [RAW_DATA, selectedUser, selectedFarm, selectedArea]);

//   const clearFilters = () => {
//     setSelectedUser("all");
//     setSelectedFarm("all");
//     setSelectedArea("all");
//   };

//   const hasActiveFilters = selectedUser !== "all" || selectedFarm !== "all" || selectedArea !== "all";

//   return (
//     <div className="flex h-screen bg-slate-50 text-slate-600 overflow-hidden">
//       <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="growth-analysis" />

//       <div className="flex flex-1 flex-col relative z-0">
//         <AdminHeader setSidebarOpen={setSidebarOpen} />

//         {isLoading && (
//           <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
//             <Loader2 className="animate-spin text-green-600" size={48} />
//           </div>
//         )}

//         <main className="flex-1 overflow-y-auto p-4 md:p-8">
//           <div className="max-w-7xl mx-auto space-y-6">

//             {/* Header */}
//             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//               <div>
//                 <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
//                   <BarChart3 className="w-7 h-7 text-green-600" />
//                    ประวัติการวิเคราะห์ระยะการเติบโตและโรคข้าว
//                 </h1>
               
//               </div>

//               {/* Tab Switch */}
//               <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
//                 <button
//                   onClick={() => setActiveTab("growth")}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
//                     activeTab === "growth"
//                       ? "bg-green-500 text-white shadow-sm"
//                       : "text-slate-600 hover:bg-slate-50"
//                   }`}
//                 >
//                   <Sprout className="w-4 h-4" />
//                   การเติบโต
//                   <span className={`px-1.5 py-0.5 rounded-full text-xs ${
//                     activeTab === "growth" ? "bg-white/20" : "bg-green-100 text-green-700"
//                   }`}>
//                     {allAnalysisData.growth.length}
//                   </span>
//                 </button>
//                 <button
//                   onClick={() => setActiveTab("disease")}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
//                     activeTab === "disease"
//                       ? "bg-rose-500 text-white shadow-sm"
//                       : "text-slate-600 hover:bg-slate-50"
//                   }`}
//                 >
//                   <Bug className="w-4 h-4" />
//                   โรคข้าว
//                   <span className={`px-1.5 py-0.5 rounded-full text-xs ${
//                     activeTab === "disease" ? "bg-white/20" : "bg-rose-100 text-rose-700"
//                   }`}>
//                     {allAnalysisData.disease.length}
//                   </span>
//                 </button>
//               </div>
//             </div>

//             {/* Filter Section */}
//             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
//               <div className="flex items-center gap-2 mb-4">
//                 <Filter className="w-4 h-4 text-slate-400" />
//                 <span className="text-sm font-medium text-slate-700">ตัวกรอง</span>
//                 {hasActiveFilters && (
//                   <button
//                     onClick={clearFilters}
//                     className="ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-rose-500 transition-colors"
//                   >
//                     <X className="w-3 h-3" />
//                     ล้างตัวกรอง
//                   </button>
//                 )}
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 {/* User Filter */}
//                 <div>
//                   <label className="block text-xs font-medium text-slate-500 mb-1.5">
//                     <User className="w-3 h-3 inline mr-1" />
//                     เจ้าของ
//                   </label>
//                   <div className="relative">
//                     <select
//                       value={selectedUser}
//                       onChange={(e) => setSelectedUser(e.target.value)}
//                       className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all"
//                     >
//                       <option value="all">ทั้งหมด</option>
//                       {users.map(u => (
//                         <option key={u.id} value={u.id}>{u.name}</option>
//                       ))}
//                     </select>
//                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
//                   </div>
//                 </div>

//                 {/* Farm Filter */}
//                 <div>
//                   <label className="block text-xs font-medium text-slate-500 mb-1.5">
//                     <Building2 className="w-3 h-3 inline mr-1" />
//                     ฟาร์ม
//                   </label>
//                   <div className="relative">
//                     <select
//                       value={selectedFarm}
//                       onChange={(e) => setSelectedFarm(e.target.value)}
//                       className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all"
//                     >
//                       <option value="all">ทั้งหมด</option>
//                       {farms.map(f => (
//                         <option key={f.id} value={f.id}>{f.name}</option>
//                       ))}
//                     </select>
//                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
//                   </div>
//                 </div>

//                 {/* Area Filter */}
//                 <div>
//                   <label className="block text-xs font-medium text-slate-500 mb-1.5">
//                     <Layers className="w-3 h-3 inline mr-1" />
//                     แปลง/พื้นที่
//                   </label>
//                   <div className="relative">
//                     <select
//                       value={selectedArea}
//                       onChange={(e) => setSelectedArea(e.target.value)}
//                       className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all"
//                     >
//                       <option value="all">ทั้งหมด</option>
//                       {areas.map(a => (
//                         <option key={a.id} value={a.id}>{a.name}</option>
//                       ))}
//                     </select>
//                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Timeline Content */}
//             {activeTab === "growth" ? (
//               <GrowthTimeline data={allAnalysisData.growth} />
//             ) : (
//               <DiseaseTimeline data={allAnalysisData.disease} />
//             )}

//           </div>
//         </main>
//         <Footer />
//       </div>
//     </div>
//   );
// }

// // Pagination Component
// function Pagination({ currentPage, totalPages, onPageChange }) {
//   if (totalPages <= 1) return null;

//   const pages = [];
//   const maxVisible = 5;
//   let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
//   let endPage = Math.min(totalPages, startPage + maxVisible - 1);

//   if (endPage - startPage + 1 < maxVisible) {
//     startPage = Math.max(1, endPage - maxVisible + 1);
//   }

//   for (let i = startPage; i <= endPage; i++) {
//     pages.push(i);
//   }

//   return (
//     <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-slate-100">
//       <button
//         onClick={() => onPageChange(currentPage - 1)}
//         disabled={currentPage === 1}
//         className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
//       >
//         <ChevronLeft className="w-4 h-4 text-slate-600" />
//       </button>

//       {startPage > 1 && (
//         <>
//           <button
//             onClick={() => onPageChange(1)}
//             className="w-9 h-9 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
//           >
//             1
//           </button>
//           {startPage > 2 && <span className="text-slate-400">...</span>}
//         </>
//       )}

//       {pages.map(page => (
//         <button
//           key={page}
//           onClick={() => onPageChange(page)}
//           className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
//             page === currentPage
//               ? 'bg-green-500 text-white shadow-sm'
//               : 'text-slate-600 hover:bg-slate-50'
//           }`}
//         >
//           {page}
//         </button>
//       ))}

//       {endPage < totalPages && (
//         <>
//           {endPage < totalPages - 1 && <span className="text-slate-400">...</span>}
//           <button
//             onClick={() => onPageChange(totalPages)}
//             className="w-9 h-9 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
//           >
//             {totalPages}
//           </button>
//         </>
//       )}

//       <button
//         onClick={() => onPageChange(currentPage + 1)}
//         disabled={currentPage === totalPages}
//         className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
//       >
//         <ChevronRight className="w-4 h-4 text-slate-600" />
//       </button>
//     </div>
//   );
// }

// // Growth Analysis Timeline Component
// function GrowthTimeline({ data }) {
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 5;

//   const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const paginatedData = (data || []).slice(startIndex, startIndex + itemsPerPage);

//   // Reset to page 1 if data changes and current page is out of range
//   React.useEffect(() => {
//     if (currentPage > totalPages && totalPages > 0) {
//       setCurrentPage(1);
//     }
//   }, [data?.length, totalPages, currentPage]);

//   if (!data?.length) {
//     return (
//       <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
//         <Sprout className="w-12 h-12 text-slate-300 mx-auto mb-3" />
//         <p className="text-slate-500 font-medium">ไม่พบข้อมูลการวิเคราะห์ระยะการเติบโต</p>
//         <p className="text-sm text-slate-400 mt-1">ลองเปลี่ยนตัวกรองเพื่อดูข้อมูลอื่น</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
//       <div className="flex items-center justify-between mb-6">
//         <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
//           <Sprout className="w-5 h-5 text-green-500" />
//           ไทม์ไลน์การวิเคราะห์ระยะการเติบโต
//         </h3>
//         <div className="flex items-center gap-3">
//           <span className="text-xs text-slate-400">
//             แสดง {startIndex + 1}-{Math.min(startIndex + itemsPerPage, data.length)} จาก
//           </span>
//           <span className="text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded-full font-medium">
//             {data.length} รายการ
//           </span>
//         </div>
//       </div>

//       <div className="relative">
//         {/* Timeline Line */}
//         <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-linear-to-b from-green-300 via-green-200 to-transparent" />

//         <div className="space-y-6">
//           {paginatedData.map((item, idx) => {
//             const isFirst = idx === 0 && currentPage === 1;
//             const date = new Date(item.created_at);

//             return (
//               <div key={item.analysis_id || idx} className="relative flex gap-5 group">
//                 {/* Timeline Node */}
//                 <div className="relative z-10 shrink-0">
//                   <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-all group-hover:scale-110 ${
//                     isFirst ? 'bg-green-500 ring-4 ring-green-100' : 'bg-white border-2 border-green-300'
//                   }`}>
//                     <Sprout className={`w-5 h-5 ${isFirst ? 'text-white' : 'text-green-500'}`} />
//                   </div>
//                 </div>

//                 {/* Content Card */}
//                 <div className="flex-1 pb-2">
//                   <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:border-green-200 hover:bg-green-50/20 transition-all">
//                     <div className="flex flex-col lg:flex-row gap-4">
//                       {/* Image */}
//                       {item.image_url && (
//                         <a href={item.image_url} target="_blank" rel="noreferrer" className="shrink-0">
//                           <img
//                             src={item.image_url}
//                             alt={item.growth_stage}
//                             className="w-full lg:w-48 h-32 object-cover rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
//                           />
//                         </a>
//                       )}

//                       {/* Info */}
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-start justify-between gap-2 mb-2">
//                           <div>
//                             <h4 className="text-base font-bold text-slate-800">{item.growth_stage}</h4>
//                             <div className="flex flex-wrap items-center gap-2 mt-1">
//                               <span className="inline-flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
//                                 <Activity className="w-3 h-3" />
//                                 {item.device_code}
//                               </span>
//                               <span className="text-xs text-slate-400">
//                                 {item.farm_name} • {item.area_name}
//                               </span>
//                             </div>
//                           </div>
//                           {item.confidence && (
//                             <span className="shrink-0 text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
//                               {(Number(item.confidence) * 100).toFixed(1)}%
//                             </span>
//                           )}
//                         </div>

//                         {/* Advice */}
//                         {item.advice && (
//                           <p className="text-sm text-slate-600 mt-3 p-3 bg-white rounded-lg border border-slate-100">
//                             {item.advice}
//                           </p>
//                         )}

//                         {/* Footer */}
//                         <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
//                           <div className="flex items-center gap-1 text-xs text-slate-400">
//                             <User className="w-3 h-3" />
//                             <span>{item.user_name}</span>
//                           </div>
//                           <div className="flex items-center gap-1 text-xs text-slate-400">
//                             <Clock className="w-3 h-3" />
//                             <span>{date.toLocaleString('th-TH')}</span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* Pagination */}
//       <Pagination
//         currentPage={currentPage}
//         totalPages={totalPages}
//         onPageChange={setCurrentPage}
//       />
//     </div>
//   );
// }

// // Disease Analysis Timeline Component
// function DiseaseTimeline({ data }) {
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 5;

//   const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const paginatedData = (data || []).slice(startIndex, startIndex + itemsPerPage);

//   // Reset to page 1 if data changes and current page is out of range
//   React.useEffect(() => {
//     if (currentPage > totalPages && totalPages > 0) {
//       setCurrentPage(1);
//     }
//   }, [data?.length, totalPages, currentPage]);

//   if (!data?.length) {
//     return (
//       <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
//         <Bug className="w-12 h-12 text-slate-300 mx-auto mb-3" />
//         <p className="text-slate-500 font-medium">ไม่พบข้อมูลการวิเคราะห์โรคข้าว</p>
//         <p className="text-sm text-slate-400 mt-1">ลองเปลี่ยนตัวกรองเพื่อดูข้อมูลอื่น</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
//       <div className="flex items-center justify-between mb-6">
//         <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
//           <Bug className="w-5 h-5 text-rose-500" />
//           ไทม์ไลน์การตรวจจับโรคข้าว
//         </h3>
//         <div className="flex items-center gap-3">
//           <span className="text-xs text-slate-400">
//             แสดง {startIndex + 1}-{Math.min(startIndex + itemsPerPage, data.length)} จาก
//           </span>
//           <span className="text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded-full font-medium">
//             {data.length} รายการ
//           </span>
//         </div>
//       </div>

//       <div className="relative">
//         {/* Timeline Line */}
//         <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-linear-to-b from-rose-300 via-rose-200 to-transparent" />

//         <div className="space-y-6">
//           {paginatedData.map((item, idx) => {
//             const isFirst = idx === 0 && currentPage === 1;
//             const date = new Date(item.created_at);
//             const isWarning = item.status === "warning";
//             const isGoodLeaf = item.disease_name === "ใบข้าวที่ดี";

//             // สีและไอคอนสำหรับใบข้าวที่ดี
//             const nodeClass = isGoodLeaf
//               ? (isFirst ? 'bg-green-500 ring-4 ring-green-100' : 'bg-white border-2 border-green-300')
//               : (isFirst ? 'bg-rose-500 ring-4 ring-rose-100' : 'bg-white border-2 border-rose-300');
//             const cardClass = isGoodLeaf
//               ? 'bg-green-50/50 border-green-200 hover:border-green-300'
//               : (isWarning
//                   ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
//                   : 'bg-slate-50 border-slate-100 hover:border-rose-200 hover:bg-rose-50/20');

//             return (
//               <div key={idx} className="relative flex gap-5 group">
//                 {/* Timeline Node */}
//                 <div className="relative z-10 shrink-0">
//                   <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-all group-hover:scale-110 ${nodeClass}`}>
//                     {isGoodLeaf ? (
//                       <CheckCircle className={`w-5 h-5 ${isFirst ? 'text-white' : 'text-green-500'}`} />
//                     ) : isWarning ? (
//                       <AlertTriangle className={`w-5 h-5 ${isFirst ? 'text-white' : 'text-amber-500'}`} />
//                     ) : (
//                       <Bug className={`w-5 h-5 ${isFirst ? 'text-white' : 'text-rose-500'}`} />
//                     )}
//                   </div>
//                 </div>

//                 {/* Content Card */}
//                 <div className="flex-1 pb-2">
//                   <div className={`rounded-2xl p-5 border transition-all ${cardClass}`}>
//                     <div className="flex flex-col lg:flex-row gap-4">
//                       {/* Image */}
//                       {item.image_url && (
//                         <a href={item.image_url} target="_blank" rel="noreferrer" className="shrink-0">
//                           <img
//                             src={item.image_url}
//                             alt={item.disease_name}
//                             className="w-full lg:w-48 h-32 object-cover rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
//                           />
//                         </a>
//                       )}

//                       {/* Info */}
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-start justify-between gap-2 mb-2">
//                           <div>
//                             <div className="flex items-center gap-2">
//                               <h4 className="text-base font-bold text-slate-800">{item.disease_name}</h4>
//                               {isGoodLeaf ? (
//                                 <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
//                                   <CheckCircle className="w-3 h-3" />
//                                   ปลอดภัย
//                                 </span>
//                               ) : isWarning && (
//                                 <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
//                                   <AlertTriangle className="w-3 h-3" />
//                                   เตือนภัย
//                                 </span>
//                               )}
//                             </div>
//                             <div className="flex flex-wrap items-center gap-2 mt-1">
//                               <span className="inline-flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
//                                 <Activity className="w-3 h-3" />
//                                 {item.device_code}
//                               </span>
//                               <span className="text-xs text-slate-400">
//                                 {item.farm_name} • {item.area_name}
//                               </span>
//                             </div>
//                           </div>
//                           {item.confidence && (
//                             <span className={`shrink-0 text-sm font-bold px-3 py-1 rounded-full ${isGoodLeaf ? 'text-green-600 bg-green-100' : 'text-rose-600 bg-rose-100'}`}> 
//                               {(Number(item.confidence) * 100).toFixed(1)}%
//                             </span>
//                           )}
//                         </div>

//                         {/* Advice */}
//                         {item.advice && (
//                           <p className="text-sm text-slate-600 mt-3 p-3 bg-white rounded-lg border border-slate-100">
//                             {item.advice}
//                           </p>
//                         )}

//                         {/* Footer */}
//                         <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
//                           <div className="flex items-center gap-1 text-xs text-slate-400">
//                             <User className="w-3 h-3" />
//                             <span>{item.user_name}</span>
//                           </div>
//                           <div className="flex items-center gap-1 text-xs text-slate-400">
//                             <Clock className="w-3 h-3" />
//                             <span>{date.toLocaleString('th-TH')}</span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* Pagination */}
//       <Pagination
//         currentPage={currentPage}
//         totalPages={totalPages}
//         onPageChange={setCurrentPage}
//       />
//     </div>
//   );
// }



"use client";
 
import React, { useState, useMemo, useEffect } from "react";
import {
  Sprout,
  MapPin,
  User,
  BarChart3,
  Loader2,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Bug,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Building2,
  Layers,
  Cpu,
  UserCircle,
  XCircle,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";
import Footer from "@/app/components/Footer";
import { AdminSidebar, AdminHeader } from "../../../components/admin/AdminLayout";
 
// ---- helper ----
const isFail = (name) => !name || name.includes("ไม่ผ่าน");
 
export default function GrowthAnalysisPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [RAW_DATA, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
 
  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedFarm, setSelectedFarm] = useState("all");
  const [selectedArea, setSelectedArea] = useState("all");
  const [activeTab, setActiveTab] = useState("growth");
 
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await apiFetch("/api/admin/get_data_growth_analysis", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          Swal.fire({ icon: "error", title: "Fetch failed", text: res.message || "Unknown error" });
          return;
        }
        const rawData = res.data?.data || res.data || [];
        setData(Array.isArray(rawData) ? rawData : []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching growth analysis data:", error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
 
  const users = useMemo(() => {
    if (!RAW_DATA?.length) return [];
    return RAW_DATA.filter((u) => u.farms?.length > 0).map((u) => ({
      id: u.user_id,
      name: `${u.first_name} ${u.last_name}`,
    }));
  }, [RAW_DATA]);
 
  const farms = useMemo(() => {
    if (!RAW_DATA?.length) return [];
    if (selectedUser === "all")
      return RAW_DATA.flatMap((u) => u.farms?.map((f) => ({ id: f.farm_id, name: f.farm_name })) || []);
    const user = RAW_DATA.find((u) => u.user_id === parseInt(selectedUser));
    return user?.farms?.map((f) => ({ id: f.farm_id, name: f.farm_name })) || [];
  }, [RAW_DATA, selectedUser]);
 
  const areas = useMemo(() => {
    if (!RAW_DATA?.length) return [];
    if (selectedFarm === "all")
      return RAW_DATA.flatMap((u) =>
        u.farms?.flatMap((f) => f.areas?.map((a) => ({ id: a.area_id, name: a.area_name })) || []) || []
      );
    const farm = RAW_DATA.flatMap((u) => u.farms || []).find((f) => f.farm_id === parseInt(selectedFarm));
    return farm?.areas?.map((a) => ({ id: a.area_id, name: a.area_name })) || [];
  }, [RAW_DATA, selectedFarm]);
 
  useEffect(() => { setSelectedFarm("all"); setSelectedArea("all"); }, [selectedUser]);
  useEffect(() => { setSelectedArea("all"); }, [selectedFarm]);
 
  const allAnalysisData = useMemo(() => {
    if (!RAW_DATA?.length) return { growth: [], disease: [] };
    const growth = [];
    const disease = [];
 
    RAW_DATA.forEach((user) => {
      if (selectedUser !== "all" && user.user_id !== parseInt(selectedUser)) return;
      user.farms?.forEach((farm) => {
        if (selectedFarm !== "all" && farm.farm_id !== parseInt(selectedFarm)) return;
        farm.areas?.forEach((area) => {
          if (selectedArea !== "all" && area.area_id !== parseInt(selectedArea)) return;
          area.devices?.forEach((device) => {
            device.growth_analysis?.forEach((g) => {
              growth.push({
                ...g,
                device_code: device.device.device_code,
                user_name: `${user.first_name} ${user.last_name}`,
                farm_name: farm.farm_name,
                area_name: area.area_name,
              });
            });
            device.disease_analysis?.forEach((d) => {
              disease.push({
                ...d,
                device_code: device.device.device_code,
                user_name: `${user.first_name} ${user.last_name}`,
                farm_name: farm.farm_name,
                area_name: area.area_name,
              });
            });
          });
        });
      });
    });
 
    growth.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    disease.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { growth, disease };
  }, [RAW_DATA, selectedUser, selectedFarm, selectedArea]);
 
  const clearFilters = () => { setSelectedUser("all"); setSelectedFarm("all"); setSelectedArea("all"); };
  const hasActiveFilters = selectedUser !== "all" || selectedFarm !== "all" || selectedArea !== "all";
 
  return (
    <div className="flex h-screen bg-slate-50 text-slate-600 overflow-hidden">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="growth-analysis" />
 
      <div className="flex flex-1 flex-col relative z-0">
        <AdminHeader setSidebarOpen={setSidebarOpen} />
 
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
            <Loader2 className="animate-spin text-green-600" size={48} />
          </div>
        )}
 
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
 
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="w-7 h-7 text-green-600" />
                  ประวัติการวิเคราะห์ระยะการเติบโตและโรคข้าว
                </h1>
              </div>
 
              {/* Tab Switch */}
              <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
                <button
                  onClick={() => setActiveTab("growth")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === "growth" ? "bg-green-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Sprout className="w-4 h-4" />
                  การเติบโต
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === "growth" ? "bg-white/20" : "bg-green-100 text-green-700"}`}>
                    {allAnalysisData.growth.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("disease")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === "disease" ? "bg-rose-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Bug className="w-4 h-4" />
                  โรคข้าว
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === "disease" ? "bg-white/20" : "bg-rose-100 text-rose-700"}`}>
                    {allAnalysisData.disease.length}
                  </span>
                </button>
              </div>
            </div>
 
            {/* Filter Section */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">ตัวกรอง</span>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-rose-500 transition-colors">
                    <X className="w-3 h-3" /> ล้างตัวกรอง
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FilterSelect label="เจ้าของ" icon={<User className="w-3 h-3 inline mr-1" />} value={selectedUser} onChange={setSelectedUser}>
                  <option value="all">ทั้งหมด</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </FilterSelect>
                <FilterSelect label="ฟาร์ม" icon={<Building2 className="w-3 h-3 inline mr-1" />} value={selectedFarm} onChange={setSelectedFarm}>
                  <option value="all">ทั้งหมด</option>
                  {farms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </FilterSelect>
                <FilterSelect label="แปลง/พื้นที่" icon={<Layers className="w-3 h-3 inline mr-1" />} value={selectedArea} onChange={setSelectedArea}>
                  <option value="all">ทั้งหมด</option>
                  {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </FilterSelect>
              </div>
            </div>
 
            {/* Timeline Content */}
            {activeTab === "growth" ? (
              <AnalysisTimeline data={allAnalysisData.growth} tab="growth" />
            ) : (
              <AnalysisTimeline data={allAnalysisData.disease} tab="disease" />
            )}
 
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
 
// ---- reusable filter select ----
function FilterSelect({ label, icon, value, onChange, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1.5">{icon}{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all"
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}
 
// ---- pagination ----
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage + 1 < maxVisible) startPage = Math.max(1, endPage - maxVisible + 1);
  for (let i = startPage; i <= endPage; i++) pages.push(i);
 
  return (
    <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-slate-100">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
        <ChevronLeft className="w-4 h-4 text-slate-600" />
      </button>
      {startPage > 1 && (<><button onClick={() => onPageChange(1)} className="w-9 h-9 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">1</button>{startPage > 2 && <span className="text-slate-400">...</span>}</>)}
      {pages.map((page) => (
        <button key={page} onClick={() => onPageChange(page)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${page === currentPage ? "bg-green-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}>
          {page}
        </button>
      ))}
      {endPage < totalPages && (<>{endPage < totalPages - 1 && <span className="text-slate-400">...</span>}<button onClick={() => onPageChange(totalPages)} className="w-9 h-9 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">{totalPages}</button></>)}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
        <ChevronRight className="w-4 h-4 text-slate-600" />
      </button>
    </div>
  );
}
 
// ---- unified timeline with 3 sections ----
function AnalysisTimeline({ data, tab }) {
  const [activeFilters, setActiveFilters] = useState({ user: true, esp: true, fail: true });
  const [pages, setPages] = useState({ user: 1, esp: 1, fail: 1 });
  const ITEMS_PER_PAGE = 5;
 
  const getName = (item) => tab === "growth" ? item.growth_stage : item.disease_name;
 
  const grouped = useMemo(() => ({
    user: (data || []).filter((i) => !isFail(getName(i)) && i.type !== "ESP32"),
    esp:  (data || []).filter((i) => !isFail(getName(i)) && i.type === "ESP32"),
    fail: (data || []).filter((i) => isFail(getName(i))),
  }), [data, tab]);
 
  // reset pages when data changes
  React.useEffect(() => { setPages({ user: 1, esp: 1, fail: 1 }); }, [data]);
 
  const toggleFilter = (key) => setActiveFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  const setPage = (key, p) => setPages((prev) => ({ ...prev, [key]: p }));
 
  const isGrowth = tab === "growth";
  const emptyIcon = isGrowth
    ? <Sprout className="w-12 h-12 text-slate-300 mx-auto mb-3" />
    : <Bug className="w-12 h-12 text-slate-300 mx-auto mb-3" />;
 
  if (!data?.length) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
        {emptyIcon}
        <p className="text-slate-500 font-medium">
          {isGrowth ? "ไม่พบข้อมูลการวิเคราะห์ระยะการเติบโต" : "ไม่พบข้อมูลการวิเคราะห์โรคข้าว"}
        </p>
        <p className="text-sm text-slate-400 mt-1">ลองเปลี่ยนตัวกรองเพื่อดูข้อมูลอื่น</p>
      </div>
    );
  }
 
  const sections = [
    {
      key: "user",
      label: "ผู้ใช้งานอัปโหลด",
      icon: <UserCircle className="w-4 h-4" />,
      headerColor: "bg-blue-50 text-blue-700 border-blue-200",
      dotColor: "bg-blue-500",
      timelineColor: "from-blue-300 via-blue-200",
      nodeActiveClass: "bg-blue-500 ring-4 ring-blue-100",
      nodeBorderClass: "bg-white border-2 border-blue-300",
      nodeIconActive: "text-white",
      nodeIconIdle: "text-blue-500",
    },
    {
      key: "esp",
      label: "อุปกรณ์อัตโนมัติ (ESP32)",
      icon: <Cpu className="w-4 h-4" />,
      headerColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dotColor: "bg-emerald-500",
      timelineColor: "from-emerald-300 via-emerald-200",
      nodeActiveClass: "bg-emerald-500 ring-4 ring-emerald-100",
      nodeBorderClass: "bg-white border-2 border-emerald-300",
      nodeIconActive: "text-white",
      nodeIconIdle: "text-emerald-500",
    },
    {
      key: "fail",
      label: "ไม่ผ่านเกณฑ์การวิเคราะห์",
      icon: <XCircle className="w-4 h-4" />,
      headerColor: "bg-red-50 text-red-600 border-red-200",
      dotColor: "bg-red-400",
      timelineColor: "from-red-300 via-red-200",
      nodeActiveClass: "bg-red-400 ring-4 ring-red-100",
      nodeBorderClass: "bg-white border-2 border-red-300",
      nodeIconActive: "text-white",
      nodeIconIdle: "text-red-400",
    },
  ];
 
  return (
    <div className="space-y-6">
 
      {/* Summary + Filter chips */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "ผู้ใช้งาน", count: grouped.user.length, num: "text-blue-600", bg: "bg-blue-50" },
            { label: "ESP32", count: grouped.esp.length,  num: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "ไม่ผ่านเกณฑ์", count: grouped.fail.length, num: "text-red-500", bg: "bg-red-50" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
              <p className={`text-2xl font-bold ${s.num}`}>{s.count}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
 
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">แสดง:</span>
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => toggleFilter(s.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                activeFilters[s.key]
                  ? `${s.headerColor}`
                  : "bg-white border-slate-200 text-slate-400"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeFilters[s.key] ? s.dotColor : "bg-slate-300"}`} />
              {s.label}
            </button>
          ))}
        </div>
      </div>
 
      {/* Sections */}
      {sections.map((sec) => {
        if (!activeFilters[sec.key] || grouped[sec.key].length === 0) return null;
        const items = grouped[sec.key];
        const currentPage = pages[sec.key];
        const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const paginated = items.slice(start, start + ITEMS_PER_PAGE);
 
        return (
          <div key={sec.key} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${sec.headerColor}`}>
                {sec.icon}
                {sec.label}
                <span className="bg-white bg-opacity-70 text-xs font-bold px-2 py-0.5 rounded-full ml-1">{items.length}</span>
              </div>
              <span className="text-xs text-slate-400">
                แสดง {start + 1}–{Math.min(start + ITEMS_PER_PAGE, items.length)} จาก {items.length} รายการ
              </span>
            </div>
 
            {/* Timeline */}
            <div className="relative">
              <div className={`absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b ${sec.timelineColor} to-transparent`} />
              <div className="space-y-6">
                {paginated.map((item, idx) => {
                  const isFirst = idx === 0 && currentPage === 1;
                  const date = new Date(item.created_at);
                  const name = getName(item);
                  const fail = isFail(name);
                  const isGoodLeaf = name === "ใบข้าวที่ดี";
                  const isWarning = item.status === "warning";
 
                  // card style
                  let cardClass = "bg-slate-50 border-slate-100 hover:border-slate-200";
                  if (fail) cardClass = "bg-red-50/40 border-red-100 hover:border-red-200";
                  else if (isGoodLeaf) cardClass = "bg-green-50/40 border-green-100 hover:border-green-200";
                  else if (isWarning) cardClass = "bg-amber-50/40 border-amber-100 hover:border-amber-200";
 
                  // node icon
                  const NodeIcon = fail ? XCircle : isGoodLeaf ? CheckCircle : isWarning ? AlertTriangle : (isGrowth ? Sprout : Bug);
                  const nodeIconColor = isFirst ? sec.nodeIconActive
                    : fail ? "text-red-400"
                    : isGoodLeaf ? "text-green-500"
                    : isWarning ? "text-amber-500"
                    : sec.nodeIconIdle;
 
                  // stage badge
                  let stageBg = "bg-violet-100 text-violet-700";
                  if (fail) stageBg = "bg-red-100 text-red-600";
                  else if (isGoodLeaf) stageBg = "bg-green-100 text-green-700";
 
                  return (
                    <div key={item.analysis_id || item.disease_id || idx} className="relative flex gap-5 group">
                      {/* Node */}
                      <div className="relative z-10 shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-all group-hover:scale-110 ${
                          isFirst ? sec.nodeActiveClass : sec.nodeBorderClass
                        }`}>
                          <NodeIcon className={`w-5 h-5 ${nodeIconColor}`} />
                        </div>
                      </div>
 
                      {/* Card */}
                      <div className="flex-1 pb-2">
                        <div className={`rounded-2xl p-5 border transition-all ${cardClass}`}>
                          <div className="flex flex-col lg:flex-row gap-4">
                            {/* Image */}
                            {item.image_url && (
                              <a href={item.image_url} target="_blank" rel="noreferrer" className="shrink-0">
                                <img
                                  src={item.image_url}
                                  alt={name}
                                  className="w-full lg:w-48 h-32 object-cover rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                                />
                              </a>
                            )}
 
                            <div className="flex-1 min-w-0">
                              {/* Top row */}
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-base font-bold text-slate-800">{name}</h4>
                                    {isGoodLeaf && (
                                      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                        <CheckCircle className="w-3 h-3" /> ปลอดภัย
                                      </span>
                                    )}
                                    {!isGoodLeaf && isWarning && (
                                      <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                        <AlertTriangle className="w-3 h-3" /> เตือนภัย
                                      </span>
                                    )}
                                    {fail && (
                                      <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                        <XCircle className="w-3 h-3" /> ไม่ผ่านเกณฑ์
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <span className="inline-flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                      <Activity className="w-3 h-3" /> {item.device_code}
                                    </span>
                                    <span className="text-xs text-slate-400">{item.farm_name} • {item.area_name}</span>
                                  </div>
                                </div>
                                {item.confidence != null && (
                                  <span className={`shrink-0 text-sm font-bold px-3 py-1 rounded-full ${
                                    isGoodLeaf ? "text-green-600 bg-green-100"
                                    : fail ? "text-slate-400 bg-slate-100"
                                    : "text-rose-600 bg-rose-100"
                                  }`}>
                                    {(Number(item.confidence) * 100).toFixed(1)}%
                                  </span>
                                )}
                              </div>
 
                              {/* Advice */}
                              {item.advice ? (
                                <p className="text-sm text-slate-600 mt-3 p-3 bg-white rounded-lg border border-slate-100">
                                  {item.advice}
                                </p>
                              ) : fail ? (
                                <p className="text-sm text-red-500 italic mt-3 p-3 bg-white rounded-lg border border-red-100">
                                  รูปภาพนี้ไม่ผ่านเกณฑ์การวิเคราะห์ 
                                </p>
                              ) : null}
 
                              {/* Footer */}
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                  <User className="w-3 h-3" />
                                  <span>{item.user_name}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                  <Clock className="w-3 h-3" />
                                  <span>{date.toLocaleString("th-TH")}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
 
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(p) => setPage(sec.key, p)} />
          </div>
        );
      })}
 
      {/* all hidden */}
      {sections.every((s) => !activeFilters[s.key] || grouped[s.key].length === 0) && (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
          <p className="text-slate-500">ไม่พบข้อมูลในหมวดที่เลือก</p>
        </div>
      )}
    </div>
  );
}