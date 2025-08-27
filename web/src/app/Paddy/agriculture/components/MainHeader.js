"use client";

import Link from "next/link";
import { ChevronDown, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function MainHeader() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          
            <div className="flex items-center justify-between">

            </div>
          

        
          <div className="text-white text-left lg:text-right">
            <div className="text-xs sm:text-sm opacity-90">บัญชีส่วนตัว</div>
            <div className="font-medium text-sm sm:text-base">บัญชีสำนักศึกษา : 1056028157</div>
          </div>
        </div>

     
      </div>
    </div>
  );
}