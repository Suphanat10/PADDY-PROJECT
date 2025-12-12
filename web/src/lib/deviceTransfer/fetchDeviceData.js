import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

export async function loadDeviceTransferData() {


  const fetchDeviceData = async () => {
    const response = await apiFetch("/api/farm-area/list", {
      method: "GET",
    });

      if (!response.ok) {
      Swal.fire({
         icon: "error",
         title: "เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์",

         text: response.message || "กรุณาลองใหม่อีกครั้งภายหลัง",
      });
      return [];
    }
      return response.data || [];
  };


  const rawData = await fetchDeviceData();

  const processedDevices = [];
  const processedFarms = [];
  const occupiedAreaIds = new Set();

  rawData.forEach((farm) => {
    const farmObj = {
      id: farm.farm_id,
      name: farm.farm_name,
      areas: farm.sub_areas.map((area) => {
        const hasActiveDevice =
          area.device_registrations &&
          area.device_registrations.some((d) => d.status === "active");

        if (hasActiveDevice) occupiedAreaIds.add(area.area_id);

        return {
          id: area.area_id,
          name: area.area_name,
          isOccupied: hasActiveDevice,
        };
      }),
    };

    processedFarms.push(farmObj);

    farm.sub_areas.forEach((area) => {
      if (
        area.device_registrations &&
        area.device_registrations.length > 0
      ) {
        area.device_registrations.forEach((dev) => {
          if (dev.status === "active") {
            processedDevices.push({
              id: dev.device_ID,
              reg_id: dev.device_registrations_ID,
              name: `Device #${dev.device_ID}`,
              current_farm_id: farm.farm_id,
              current_farm_name: farm.farm_name,
              current_area_id: area.area_id,
              current_area_name: area.area_name,
              status: dev.status,
            });
          }
        });
      }
    });
  });

  let autoSelectedDevice = null;

   processedDevices.forEach((device) => {
      if (!autoSelectedDevice) {
         autoSelectedDevice = device;
      }
   });

  return {
    devices: processedDevices,
    farms: processedFarms,
    occupiedAreaIds,
    autoSelectedDevice: autoSelectedDevice?.id || null,
  };
}
