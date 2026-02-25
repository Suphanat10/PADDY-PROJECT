


export async function loadGrowthAnalysis(fetcher) {
  const data = await fetcher();

  // ตรวจสอบความถูกต้องของข้อมูล
  if (data === undefined || !Array.isArray(data)) {
    return {
      devicesList: [],
      historyList: [],
      diseaseList: []
    };
  }

  const devicesList = [];
  const historyList = [];
  const diseaseList = [];

  data.forEach(device => {
    // เก็บรายชื่ออุปกรณ์/แปลงนา
    devicesList.push({
      reg_id: device.device_registrations_id,
      device_id: device.device_id,
      device_code: device.device_code,
      area_name: device.area_name,
      farm_name: device.farm_name,
    });

    // จัดการข้อมูลประวัติการเติบโต (growth_analysis)
    if (Array.isArray(device.growth_analysis)) {
      device.growth_analysis.forEach(ga => {

        let stageTh = ga.growth_stage;
        if (ga.growth_stage === 'Seedling stage') stageTh = 'ระยะต้นกล้า';
        else if (ga.growth_stage === 'Heading stage') stageTh = 'ระยะออกรวง';
        else if (ga.growth_stage === 'pregnant') stageTh = 'ระยะตั้งท้อง';
        else if (ga.growth_stage === 'Maturity') stageTh = 'ระยะสุกแก่ (พร้อมเก็บเกี่ยว)';

        historyList.push({
          analysis_id: ga.analysis_id,
          growth_stage: stageTh,
          image_url: ga.image_url,
          confidence: ga.confidence,
          advice: ga.advice,
          created_at: ga.created_at,
          device_info: {
            reg_id: device.device_registrations_id,
            device_code: device.device_code
          }
        });
      });
    }

    // จัดการข้อมูลการวิเคราะห์โรค (Disease_Analysis - D ตัวใหญ่ตาม JSON)
    if (Array.isArray(device.Disease_Analysis)) {
      device.Disease_Analysis.forEach((da, index) => {
        diseaseList.push({
          // สร้าง unique id สำหรับ React key
          id: `disease-${device.device_registrations_id}-${index}`,
          image_url: da.image_url,
          disease_name : da.disease_name,
          confidence: da.confidence,
          advice: da.advice,
          created_at: da.created_at,
          device_info: {
            reg_id: device.device_registrations_id,
            device_code: device.device_code
          }
        });
      });
    }
  });

  return {
    devicesList,
    historyList,
    diseaseList
  };
}