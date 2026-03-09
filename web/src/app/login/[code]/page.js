"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LineLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    // ส่ง query params ทั้งหมดไปหน้าหลักเพื่อให้จัดการ LINE callback
    const searchParams = window.location.search;
    router.replace("/" + searchParams);
  }, [router]);

  return null;
}
