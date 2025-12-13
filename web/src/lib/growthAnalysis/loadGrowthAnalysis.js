export async function loadGrowthAnalysis(fetcher) {
  const data = await fetcher();

  const devicesList = [];
  const historyList = [];

  data.forEach(device => {

    devicesList.push({
      reg_id: device.device_registrations_id,
      device_id : device.device_id,
      device_code: device.device_code,
      area_name: device.area_name,
      farm_name: device.farm_name,
      has_growth_analysis:
        Array.isArray(device.growth_analysis) &&
        device.growth_analysis.length > 0
    });
    if (
      !Array.isArray(device.growth_analysis) ||
      device.growth_analysis.length === 0
    ) {
      return;
    }
    device.growth_analysis.forEach(ga => {
      historyList.push({
        analysis_id: ga.analysis_id,
        growth_stage: ga.growth_stage,
        image_url: ga.image_url,
        created_at: ga.created_at,
        device_info: {
          reg_id: device.device_registrations_id,
          device_code: device.device_code,
          area_name: device.area_name,
          farm_name: device.farm_name
        }
      });
    });
  });

  return {
    devicesList,
    historyList
  };
}
