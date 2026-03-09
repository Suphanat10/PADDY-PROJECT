"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export function useSensorHistory(deviceId) {
  const [isLoading, setIsLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState([]);

  useEffect(() => {
    if (!deviceId) return;

    const fetchApiData = async () => {
      setIsLoading(true);

      try {
        const res = await apiFetch(`/api/data/devicebyID`, {
          method: "POST",
          body: {
            device_code: deviceId,
          },
        });

        console.log("Raw API Response:", res);

        // ✅ ใช้ sensor_history จาก backend ใหม่
        const sensorHistory = res?.data?.sensor_history;

        if (!Array.isArray(sensorHistory)) {
          console.error("sensor_history missing or not array:", res);
          setHistoricalData([]);
          return;
        }

        // ✅ map format ให้ตรงกับกราฟ
        const formatted = sensorHistory
          .map((item) => ({
            timestamp: item.timestamp,
            time: item.time,
            nitrogen: item.N ?? null,
            phosphorus: item.P ?? null,
            potassium: item.K ?? null,
            humidity: item.S ?? null,
            waterLevel: item.W ?? null,
          }))
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        console.log("History for chart:", formatted);
        setHistoricalData(formatted);

      } catch (error) {
        console.error("Failed to fetch sensor data", error);
        setHistoricalData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiData();
  }, [deviceId]);

  return { historicalData, isLoading };
}