import React, { useState } from 'react';
import {
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Loader2,
  X
} from 'lucide-react';

// 1.1 Sidebar Item
export const SidebarItem = ({ icon, text, active = false, badge, onClick, subItems, href }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = (e) => {
    if (subItems) {
      // ถ้ามีเมนูย่อย ให้ toggle การแสดงผลแทนการลิ้งค์
      e.preventDefault();
      setIsExpanded(!isExpanded);
    } else {
      // ถ้าไม่มีเมนูย่อย ให้ทำงานตามปกติ (onClick)
      onClick && onClick();
    }
  };

  // เช็คสถานะ Active (รวมถึงกรณีที่เมนูย่อยเปิดอยู่)
  const isParentActive = active || (subItems && isExpanded);

  // Style สำหรับ Container หลัก
  const containerClass = `group flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
    active && !subItems
      ? 'bg-emerald-600 text-white'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  } ${isParentActive && subItems ? 'bg-slate-50 text-emerald-700' : ''}`;

  // Style สำหรับ Icon
  const iconClass = active && !subItems 
    ? 'text-white' 
    : (isParentActive && subItems ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600');

  // เนื้อหาภายในปุ่ม
  const ItemContent = () => (
    <>
      <div className="flex items-center gap-3">
        <span className={iconClass}>
          {icon}
        </span>
        <span>{text}</span>
      </div>
      {subItems ? (
        <ChevronDown 
          size={16} 
          className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-emerald-600' : ''}`} 
        />
      ) : badge && (
        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${active ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
          {badge}
        </span>
      )}
    </>
  );

  return (
    <div className="mb-1">
      {subItems ? (
        <div onClick={handleClick} className={containerClass}>
          <ItemContent />
        </div>
      ) : href ? (
        <a href={href} className={containerClass} onClick={onClick}>
          <ItemContent />
        </a>
      ) : (
        <div onClick={handleClick} className={containerClass}>
          <ItemContent />
        </div>
      )}

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
        {subItems && subItems.map((item, index) => {
          const subItemClass = `w-full flex items-center pl-12 pr-4 py-2 text-sm font-medium rounded-lg transition-colors mb-0.5 cursor-pointer ${
            item.active 
              ? 'text-emerald-600 bg-emerald-50' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`;

          return item.href ? (
            <a key={index} href={item.href} className={subItemClass} onClick={item.onClick}>
               <span className={`w-1.5 h-1.5 rounded-full mr-2 ${item.active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
               {item.text}
            </a>
          ) : (
            <div key={index} onClick={item.onClick} className={subItemClass}>
              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${item.active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
              {item.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};



