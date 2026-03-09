import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";

export async function fetchSensorDetail(deviceCode) {
  const response = await apiFetch(`/api/admin/devicebyID`, {
    method: "POST",
    body: { device_code: deviceCode },
  });

  if (!response || response.status === 404) {
    return null;
  }

  if (!response.ok) {
    Swal.fire({
      icon: "error",
      title: "ข้อผิดพลาด",
      text: response.message || "Fetch failed",
    });
    return null;
  }

  return response.data;
}

export default function useSensorDetail(deviceCode) {
  const [currentData, setCurrentData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [diseaseHistory, setDiseaseHistory] = useState([]);
  const [growthHistory, setGrowthHistory] = useState([]);
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

        if (!res) {
          if (isMounted) {
            setError("ไม่พบอุปกรณ์ที่ระบุ");
            setIsLoading(false);
          }
          return;
        }

        if (!isMounted) return;

        // -----------------------
        // Device Info
        // -----------------------
        setDeviceInfo({
          device: res.device,
          area: res.area,
          owner: res.owner,
        });

        // -----------------------
        // Historical Data (ใช้ตรงจาก backend)
        // -----------------------
          const history = Array.isArray(res.sensor_history)
  ? res.sensor_history
      .map(item => ({
        time: item.time,
        nitrogen: item.N ?? 0,
        phosphorus: item.P ?? 0,
        potassium: item.K ?? 0,
        humidity: item.S ?? 0,
        waterLevel: item.W ?? 0,
        timestamp: item.timestamp, // เก็บไว้เผื่อใช้
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  : [];

setHistoricalData(history);

        // -----------------------
        // Current Data (ตัวล่าสุด)
        // -----------------------
        const latest = history[0];

        if (latest) {
          setCurrentData({
            timestamp: latest.time,
            nitrogen: {
              value: latest.N ?? "-",
              unit: "mg/kg",
              trend: "stable",
            },
            phosphorus: {
              value: latest.P ?? "-",
              unit: "mg/kg",
              trend: "stable",
            },
            potassium: {
              value: latest.K ?? "-",
              unit: "mg/kg",
              trend: "stable",
            },
            humidity: {
              value: latest.S ?? "-",
              unit: "%",
              trend: "stable",
            },
            waterLevel: {
              value: latest.W ?? "-",
              unit: "cm",
              trend: "stable",
            },
          });
        } else {
          setCurrentData(null);
        }

        // -----------------------
        // Other Histories
        // -----------------------
        setDiseaseHistory(res.disease_history || []);
        setGrowthHistory(res.growth_history || []);

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
    diseaseHistory,
    growthHistory,
    deviceInfo,
    isLoading,
    error,
    isSocketConnected: false,
  };
}