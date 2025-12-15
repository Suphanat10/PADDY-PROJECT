import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";


export async function fetchSensorDetail(deviceCode) {
   const response = await apiFetch(`/api/admin/devicebyID`, {
    method: "POST",
    body: { device_code: deviceCode },
  });


  if(response.status === 404) {
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

      
        const latestByType = {};
        for (const row of res.sensor_data) {
          if (!latestByType[row.sensor_type]) {
            latestByType[row.sensor_type] = row;
          }
        }

        setCurrentData({
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

      
        const grouped = {};

        res.sensor_data.forEach((row) => {
          const time = new Date(row.measured_at).toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });

          if (!grouped[time]) grouped[time] = { time };

          switch (row.sensor_type) {
            case "Nitrogen (N)":
              grouped[time].nitrogen = row.value;
              break;
            case "Phosphorus (P)":
              grouped[time].phosphorus = row.value;
              break;
            case "Potassium (K)":
              grouped[time].potassium = row.value;
              break;
            case "Soil Moisture":
              grouped[time].humidity = row.value;
              break;
            case "Water Level":
              grouped[time].waterLevel = row.value;
              break;
          }
        });

        setHistoricalData(
          Object.values(grouped).slice(-24) 
        );
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



