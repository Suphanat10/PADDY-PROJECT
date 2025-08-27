"use client";

import Header from "../components/Header";
import MainHeader from "../components/MainHeader";
import DashboardContent from "../components/DashboardContent";
import WelcomeSection from "../components/WelcomeSection";



export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <MainHeader />
      <WelcomeSection />
      <DashboardContent />
    
    </div>
  );
}