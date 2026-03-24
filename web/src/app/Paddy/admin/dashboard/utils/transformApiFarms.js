/**
 * Transform API response to internal farm data format
 * @param {Array|Object} apiFarms - Raw API response data
 * @returns {Array} Transformed farm data
 */
export function transformApiFarms(apiFarms = []) {
  // Handle different API response formats
  let farmsArray = apiFarms;
  
  if (!apiFarms) {
    return [];
  }
  
  // If it's an object with data property (API response format: { ok: true, data: [...] })
  if (apiFarms.data && Array.isArray(apiFarms.data)) {
    farmsArray = apiFarms.data;
  }
  // If it's an object with farms property
  else if (apiFarms.farms && Array.isArray(apiFarms.farms)) {
    farmsArray = apiFarms.farms;
  }
  // If it's not an array, wrap it
  else if (!Array.isArray(apiFarms)) {
    farmsArray = [apiFarms];
  }
  
  return farmsArray.map((farm) => ({
    farm_id: farm.farm_id,
    farm_name: farm.farm_name,
    location: farm.owner || "-",
    rice_variety: farm.rice_variety || "-",
    status: farm.device_count && farm.device_count > 0 ? "Online" : "Offline",
    latest_setting: farm.latest_setting,
    areas: (farm.areas || []).map((area) => {
      const primaryDevice =
        area.devices && area.devices.length > 0 ? area.devices[0] : null;
      const latestSensor = primaryDevice?.latest_sensor || null;
      const latestSensors = primaryDevice?.latest_sensors || null;
      const latest_growth = primaryDevice?.latest_growth || null;
      const latest_disease = primaryDevice?.latest_disease || null;
      const latest_setting = primaryDevice?.latest_setting || null;
      const latest_scheduler = primaryDevice?.latest_scheduler || null;

      return {
        area_id: area.area_id,
        area_name: area.area_name,
        device_code: primaryDevice?.device_code || "N/A",
        status: primaryDevice
          ? primaryDevice.status || "active"
          : area.device_count > 0
            ? "active"
            : "offline",
        thresholds: {
          min: latest_setting?.water_level_min ?? 0,
          max: latest_setting?.water_level_max ?? 100,
        },
        growth: {
          stage:
            latest_growth?.growth_stage ||
            latest_growth?.stage ||
            (primaryDevice
              ? `ก้าวที่ ${primaryDevice.growth_count || 0}`
              : "ไม่ระบุ"),
          progress: Math.min(100, (primaryDevice?.growth_count || 0) * 25),
        },
        disease: {
          status: latest_disease ? "warning" : "safe",
          name:
            latest_disease?.disease_name ||
            (primaryDevice &&
            primaryDevice.disease_count &&
            primaryDevice.disease_count > 0
              ? "พบความเสี่ยง"
              : "ปกติ"),
        },
        latest_growth,
        latest_disease,
        latest_setting,
        latest_scheduler,
        sensor: parseSensorData(latestSensors, latestSensor),
      };
    }),
  }));
}

/**
 * Parse sensor data from API response
 * New format: { N: { value, unit, measured_at }, P: {...}, K: {...}, W: {...}, S: {...} }
 * @param {Array} latestSensors - Array of sensor readings (legacy)
 * @param {Object} latestSensor - Sensor object with N, P, K, W, S keys
 * @returns {Object} Parsed sensor data
 */
function parseSensorData(latestSensors, latestSensor) {
  const sensorData = {
    water_level: 0,
    n: 0,
    p: 0,
    k: 0,
    humidity: 0,
    moisture: 0,
    temperature: 0,
  };

  // Handle new format: { N: { value, unit }, P: {...}, ... }
  if (latestSensor && typeof latestSensor === 'object') {
    // Check if it's the new format (has N, P, K, W, S keys)
    if ('N' in latestSensor || 'P' in latestSensor || 'K' in latestSensor || 'W' in latestSensor || 'S' in latestSensor) {
      sensorData.n = latestSensor.N?.value ?? 0;
      sensorData.p = latestSensor.P?.value ?? 0;
      sensorData.k = latestSensor.K?.value ?? 0;
      sensorData.water_level = latestSensor.W?.value ?? 0;
      sensorData.moisture = latestSensor.S?.value ?? 0; // S = Soil moisture
      return sensorData;
    }
    
    // Legacy format: { type, value }
    const applySensorReading = (reading) => {
      if (!reading) return;
      const type = String(reading.type || reading.sensor_type || "").toUpperCase();
      const value = reading.value ?? reading.val ?? 0;

      if (type === "W" || type.includes("WATER") || type === "WL") {
        sensorData.water_level = value;
      } else if (type === "N") {
        sensorData.n = value;
      } else if (type === "P") {
        sensorData.p = value;
      } else if (type === "K") {
        sensorData.k = value;
      } else if (type === "M" || type.includes("MOIST") || type === "MOISTURE" || type === "S") {
        sensorData.moisture = value;
      } else if (type === "H" || type.includes("HUMID")) {
        sensorData.humidity = value;
      } else if (type === "T" || type.includes("TEMP")) {
        sensorData.temperature = value;
      }
    };

    applySensorReading(latestSensor);
  }

  // Handle array format
  if (Array.isArray(latestSensors)) {
    latestSensors.forEach((reading) => {
      if (!reading) return;
      const type = String(reading.type || reading.sensor_type || "").toUpperCase();
      const value = reading.value ?? reading.val ?? 0;

      if (type === "W" || type.includes("WATER") || type === "WL") {
        sensorData.water_level = value;
      } else if (type === "N") {
        sensorData.n = value;
      } else if (type === "P") {
        sensorData.p = value;
      } else if (type === "K") {
        sensorData.k = value;
      } else if (type === "M" || type.includes("MOIST") || type === "MOISTURE" || type === "S") {
        sensorData.moisture = value;
      } else if (type === "H" || type.includes("HUMID")) {
        sensorData.humidity = value;
      } else if (type === "T" || type.includes("TEMP")) {
        sensorData.temperature = value;
      }
    });
  }

  return sensorData;
}
