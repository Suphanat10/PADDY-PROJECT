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

        if (!res || !Array.isArray(res.data?.sensor_data)) {
          console.error("sensor_data missing or not array:", res);
          setHistoricalData([]);
          return;
        }

        const sensorData = res.data.sensor_data;

        const grouped = sensorData.reduce((acc, item) => {
          if (!item.measured_at) return acc;

const dateKey = item.measured_at.substring(0, 16).replace("T", " ");
          if (!acc[dateKey]) {
            acc[dateKey] = {
              time: dateKey,
              nitrogen: null,
              phosphorus: null,
              potassium: null,
              humidity: null,
              waterLevel: null,
              temperature: null,
            };
          }

          switch (item.sensor_type) {
            case "Nitrogen (N)":
              acc[dateKey].nitrogen = item.value;
              break;
            case "Phosphorus (P)":
              acc[dateKey].phosphorus = item.value;
              break;
            case "Potassium (K)":
              acc[dateKey].potassium = item.value;
              break;
            case "Soil Moisture":
              acc[dateKey].humidity = item.value;
              break;
            case "Water Level":
              acc[dateKey].waterLevel = item.value;
              break;
            case "Temperature":
              acc[dateKey].temperature = item.value;
              break;
            default:
              break;
          }

          return acc;
        }, {});



        const history = Object.values(grouped).sort((a, b) =>
          new Date(a.time) - new Date(b.time)
        );


        console.log("History for chart:", history);
        setHistoricalData(history);

      } catch (error) {
        console.error("❌ Failed to fetch sensor data", error);
        setHistoricalData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiData();
  }, [deviceId]);

  return { historicalData, isLoading };
}
