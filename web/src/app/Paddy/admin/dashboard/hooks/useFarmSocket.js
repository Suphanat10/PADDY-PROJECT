"use client";
import { useEffect, useCallback, useRef, useState } from "react";
import { io } from "socket.io-client";
import { transformApiFarms } from "../utils/transformApiFarms";
import { apiFetch } from "../../../../../lib/api";

const SOCKET_URL = "https://smart-paddy.space";

const SOCKET_CONFIG = {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
};

// Timeout (ms) to wait for socket data before falling back to API
const SOCKET_DATA_TIMEOUT = 5000;

/**
 * Custom hook for managing farm WebSocket connections with improved stability
 * @param {Function} setFarmData - State setter for farm data
 * @returns {Object} Socket utilities and connection status
 */
export function useFarmSocket(setFarmData) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  
  // Track data source: "socket" = real-time, "database" = fetched from API
  const [dataSource, setDataSource] = useState("database");
  const [lastSocketUpdate, setLastSocketUpdate] = useState(null);
  const lastSocketDataRef = useRef(null);
  const fallbackTimeoutRef = useRef(null);

  // Handle device updates from socket
  const handleAllDevices = useCallback(
    (data) => {
      if (!Array.isArray(data)) return;

      // Mark data as coming from socket
      setDataSource("socket");
      setLastSocketUpdate(new Date());
      lastSocketDataRef.current = Date.now();

      setFarmData((prev) => {
        const copy = [...prev];

        data.forEach((device) => {
          const farmIdx = copy.findIndex((f) =>
            f.areas?.some((a) => a.device_code === device.device_code)
          );

          if (farmIdx !== -1) {
            copy[farmIdx] = {
              ...copy[farmIdx],
              areas: copy[farmIdx].areas.map((area) => {
                if (area.device_code !== device.device_code) return area;
                return {
                  ...area,
                  sensor: {
                    n: device.N ?? device.n ?? area.sensor.n,
                    p: device.P ?? device.p ?? area.sensor.p,
                    k: device.K ?? device.k ?? area.sensor.k,
                    ph: device.pH ?? device.ph ?? area.sensor.ph,
                    moisture: device.soil_moisture ?? device.S ?? device.moisture ?? area.sensor.moisture,
                    water_level: device.water_level ?? device.W ?? area.sensor.water_level,
                  },
                };
              }),
            };
          }
        });

        return copy;
      });
    },
    [setFarmData]
  );

  // Handle single farm update
  const handleFarmUpdate = useCallback(
    (msg) => {
      if (!msg?.farm) return;

      const transformed = transformApiFarms([msg.farm])[0];

      setFarmData((prev) => {
        const idx = prev.findIndex((f) => f.farm_id === transformed.farm_id);
        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = transformed;
          return copy;
        }
        return [transformed, ...prev];
      });
    },
    [setFarmData]
  );

  // Handle bulk update
  const handleBulkUpdate = useCallback(
    (msg) => {
      if (Array.isArray(msg?.farms)) {
        setDataSource("socket");
        setLastSocketUpdate(new Date());
        lastSocketDataRef.current = Date.now();
        setFarmData(transformApiFarms(msg.farms));
      }
    },
    [setFarmData]
  );


  const handleSensorData = useCallback(
    (payload) => {
      if (!payload?.device_code || !payload?.data) return;
      
      const { device_code, data } = payload;
      
      // Mark data as coming from socket
      setDataSource("socket");
      setLastSocketUpdate(new Date());
      lastSocketDataRef.current = Date.now();

      setFarmData((prev) =>
        prev.map((farm) => ({
          ...farm,
          areas: farm.areas.map((area) => {
            if (area.device_code !== device_code) return area;
            return {
              ...area,
              sensor: {
                n: data.N ?? data.n ?? area.sensor.n,
                p: data.P ?? data.p ?? area.sensor.p,
                k: data.K ?? data.k ?? area.sensor.k,
                ph: data.pH ?? data.ph ?? area.sensor.ph,
                moisture: data.soil_moisture ?? data.S ?? data.moisture ?? area.sensor.moisture,
                water_level: data.water_level ?? data.W ?? area.sensor.water_level,
              },
            };
          }),
        }))
      );
    },
    [setFarmData]
  );

  // Handle device status update
  // Payload format: { device_code, status: "online" | "offline" }
  const handleDeviceStatus = useCallback(
    (payload) => {
      if (!payload?.device_code || !payload?.status) return;
      
      const { device_code, status } = payload;

      setFarmData((prev) =>
        prev.map((farm) => {
          const hasDevice = farm.areas?.some(
            (a) => a.device_code === device_code
          );
          if (hasDevice) {
            return {
              ...farm,
              status: status === "online" ? "Online" : "Offline",
            };
          }
          return farm;
        })
      );
    },
    [setFarmData]
  );

  // Fetch latest data from database when socket is not available
  const fetchLatestFromDB = useCallback(async () => {
    try {
      console.log("📥 Fetching latest data from database...");
      const response = await apiFetch("/api/data/admin/analysis");
      const apiData = response?.data;
      const farms = apiData?.data || apiData?.farms || apiData || [];
      
      if (farms.length > 0) {
        setFarmData(transformApiFarms(farms));
        setDataSource("database");
        setLastSocketUpdate(new Date());
        console.log("✅ Loaded latest data from database");
      }
    } catch (err) {
      console.error("❌ Failed to fetch from database:", err);
    }
  }, [setFarmData]);

  // Fallback to database when socket doesn't provide data
  useEffect(() => {
    // If not connected, fetch from database
    if (!isConnected && connectionError) {
      fetchLatestFromDB();
    }
  }, [isConnected, connectionError, fetchLatestFromDB]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const socket = io(SOCKET_URL, SOCKET_CONFIG);
    socketRef.current = socket;

    // Emit join events when connected
    const emitJoinEvents = () => {
      socket.emit("join-all");
      console.log("📡 Emitted join-all");
    };

    // Connection events
    socket.on("connect", () => {
      console.log("✅ Farm Socket connected (ID:", socket.id, ")");
      setIsConnected(true);
      setConnectionError(null);
      emitJoinEvents();
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Farm Socket disconnected. Reason:", reason);
      setIsConnected(false);
      
      // If disconnected due to server or transport issues, socket.io will auto-reconnect
      if (reason === "io server disconnect") {
        // Server initiated disconnect, manually reconnect
        socket.connect();
      }
    });

    socket.on("connect_error", (error) => {
      console.error("🔴 Socket connection error:", error.message);
      setConnectionError(error.message);
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log("🔄 Socket reconnection attempt:", attemptNumber);
    });

    socket.on("reconnect_error", (error) => {
      console.error("🔴 Socket reconnection error:", error.message);
    });

    socket.on("reconnect_failed", () => {
      console.error("🔴 Socket reconnection failed after all attempts");
      setConnectionError("ไม่สามารถเชื่อมต่อได้ กรุณารีเฟรชหน้า");
    });

    // Data events
    socket.on("all-devices", handleAllDevices);
    socket.on("update", handleFarmUpdate);
    socket.on("bulk", handleBulkUpdate);
    socket.on("sensorData", handleSensorData);
    socket.on("deviceStatus", handleDeviceStatus);

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("reconnect");
      socket.off("reconnect_attempt");
      socket.off("reconnect_error");
      socket.off("reconnect_failed");
      socket.off("all-devices");
      socket.off("update");
      socket.off("bulk");
      socket.off("sensorData");
      socket.off("deviceStatus");
      socket.disconnect();
      
      // Clear fallback timeout on cleanup
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
      }
    };
  }, [
    handleAllDevices,
    handleFarmUpdate,
    handleBulkUpdate,
    handleSensorData,
    handleDeviceStatus,
  ]);

  // Set up timeout fallback: if no socket data within timeout, fetch from DB
  useEffect(() => {
    if (!isConnected) return;
    
    // Clear any existing timeout
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
    }
    
    // Set timeout to check if we receive socket data
    fallbackTimeoutRef.current = setTimeout(() => {
      // If no socket data received, fetch from database
      if (!lastSocketDataRef.current || Date.now() - lastSocketDataRef.current > SOCKET_DATA_TIMEOUT) {
        console.log("⏱️ No socket data received within timeout, fetching from database...");
        fetchLatestFromDB();
      }
    }, SOCKET_DATA_TIMEOUT);
    
    return () => {
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
      }
    };
  }, [isConnected, fetchLatestFromDB]);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.connect();
    }
  }, []);

  // Manual refresh from database
  const refreshFromDB = useCallback(() => {
    setDataSource("database");
    fetchLatestFromDB();
  }, [fetchLatestFromDB]);

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    reconnect,
    dataSource,          // "socket" | "database"
    lastSocketUpdate,    // Date object of last update
    refreshFromDB,       // Function to manually fetch from DB
  };
}
