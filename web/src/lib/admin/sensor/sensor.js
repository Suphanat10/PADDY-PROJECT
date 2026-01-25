import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";

export async function fetchSensorDetail(deviceCode) {
  const response = await apiFetch(`/api/admin/devicebyID`, {
    method: "POST",
    body: { device_code: deviceCode },
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    Swal.fire({
      icon: "error",
      title: "ข้อผิดพลาด",
      text: response.message || "Fetch failed",
    });
    return [];
  }

  return response.data;
}

export default function useSensorDetail(deviceCode) {
  const [currentData, setCurrentData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!deviceCode) return;

    let isMounted = true;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetchSensorDetail(deviceCode);

        if (res.length === 0) {
          if (isMounted) {
            setError("ไม่พบอุปกรณ์ที่ระบุ");
            setIsLoading(false);
          }
          return;
        }

        if (!isMounted) return;

        setDeviceInfo({
          device: res.device,
          area: res.area,
          owner: {
            user_id: res.owner.user_id,
            first_name: res.owner.first_name,
            last_name: res.owner.last_name,
          },
        });

        // --- 1. จัดการข้อมูลปัจจุบัน (Latest Data) ---
        const latestByType = {};
        let latestTime = "-";

        for (const row of res.sensor_data) {
          if (!latestByType[row.sensor_type]) {
            latestByType[row.sensor_type] = row;
            // เก็บเวลาจากข้อมูลตัวที่ใหม่ที่สุดที่เจอ (ตัวแรกใน Array มักจะใหม่สุด)
            if (latestTime === "-") {
                latestTime = row.measured_at.substring(0, 16).replace("T", " ");
            }
          }
        }

        setCurrentData({
          timestamp: latestTime, // ✅ เพิ่มเวลาล่าสุด
          nitrogen: {
            value: latestByType["Nitrogen (N)"]?.value ?? "-",
            unit: "mg/kg",
            trend: "stable",
          },
          phosphorus: {
            value: latestByType["Phosphorus (P)"]?.value ?? "-",
            unit: "mg/kg",
            trend: "stable",
          },
          potassium: {
            value: latestByType["Potassium (K)"]?.value ?? "-",
            unit: "mg/kg",
            trend: "stable",
          },
          humidity: {
            value: latestByType["Soil Moisture"]?.value ?? "-",
            unit: "%",
            trend: "stable",
          },
          waterLevel: {
            value: latestByType["Water Level"]?.value ?? "-",
            unit: "cm",
            trend: "stable",
          },
        });

        // --- 2. จัดการข้อมูลประวัติ (Historical Data) ตามวันเวลา ---
        const grouped = {};

        res.sensor_data.forEach((row) => {
          // ✅ จัดรูปแบบเวลาเป็น YYYY-MM-DD HH:mm
          const timeKey = row.measured_at.substring(0, 16).replace("T", " ");

          if (!grouped[timeKey]) {
              grouped[timeKey] = { time: timeKey };
          }

          // ตรวจสอบ sensor_type ให้ตรงกับที่ DB ส่งมา (N, P, K หรือชื่อเต็ม)
          switch (row.sensor_type) {
            case "Nitrogen (N)":
            case "N":
              grouped[timeKey].nitrogen = row.value;
              break;
            case "Phosphorus (P)":
            case "P":
              grouped[timeKey].phosphorus = row.value;
              break;
            case "Potassium (K)":
            case "K":
              grouped[timeKey].potassium = row.value;
              break;
            case "Soil Moisture":
            case "soil_moisture":
              grouped[timeKey].humidity = row.value;
              break;
            case "Water Level":
            case "water_level":
              grouped[timeKey].waterLevel = row.value;
              break;
          }
        });

        // แปลง Object เป็น Array และเรียงลำดับเวลา (ใหม่ไปเก่า)
        const sortedHistory = Object.values(grouped).sort((a, b) => 
            new Date(b.time) - new Date(a.time)
        );

        setHistoricalData(sortedHistory);

      } catch (err) {
        console.error(err);
        setError("ไม่สามารถโหลดข้อมูลอุปกรณ์ได้");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [deviceCode]);

  return {
    currentData,
    historicalData,
    deviceInfo,
    isLoading,
    error,
    isSocketConnected: false, 
  };
}


