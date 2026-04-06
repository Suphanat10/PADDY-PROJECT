


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

  const normalizeConfidence = (value) => {
    if (value === null || value === undefined || value === "") return null;
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return null;
    return numeric > 1 ? numeric / 100 : numeric;
  };

  const getLink = (item) => item?.Link ?? item?.LInk ?? item?.link ?? null;

  data.forEach(device => {
    // รองรับโครงสร้างใหม่: farm -> areas -> growth_timeline/disease_timeline
    if (Array.isArray(device.areas)) {
      device.areas.forEach((area) => {
        const resolvedRegId = area.device_registrations_id ?? area.area_id;

        devicesList.push({
          reg_id: resolvedRegId,
          device_id: area.device_id ?? area.area_id,
          device_code: area.device_code,
          area_name: area.area_name,
          farm_name: device.farm_name,
        });

        if (Array.isArray(area.growth_timeline) && area.growth_timeline.length > 0) {
          area.growth_timeline.forEach((ga, index) => {
            historyList.push({
              analysis_id: ga.analysis_id ?? `growth-${area.area_id}-${index}`,
              growth_stage: ga.stage,
              image_url: ga.image_url,
              type: ga.type || "TIMELINE",
              Link: getLink(ga),
              confidence: normalizeConfidence(ga.confidence),
              advice: ga.advice,
              created_at: ga.date || ga.created_at,
              device_info: {
                reg_id: resolvedRegId,
                device_code: area.device_code,
                farm_name: device.farm_name,
                area_name: area.area_name,
              }
            });
          });
        } else if (area.growth) {
          historyList.push({
            analysis_id: `growth-current-${area.area_id}`,
            growth_stage: area.growth.stage,
            image_url: area.growth.image_url,
            type: area.growth.type || "CURRENT",
            Link: getLink(area.growth),
            confidence: normalizeConfidence(area.growth.confidence ?? area.growth.progress),
            advice: area.growth.advice,
            created_at: area.growth.date || area.growth.created_at,
            device_info: {
              reg_id: resolvedRegId,
              device_code: area.device_code,
              farm_name: device.farm_name,
              area_name: area.area_name,
            }
          });
        }

        if (Array.isArray(area.disease_timeline) && area.disease_timeline.length > 0) {
          area.disease_timeline.forEach((da, index) => {
            diseaseList.push({
              id: da.disease_id ?? `disease-${area.area_id}-${index}`,
              disease_id: da.disease_id,
              image_url: da.image_url,
              disease_name: da.name,
              confidence: normalizeConfidence(da.confidence),
              type: da.type || "TIMELINE",
              Link: getLink(da),
              advice: da.advice,
              created_at: da.date || da.created_at,
              device_info: {
                reg_id: resolvedRegId,
                device_code: area.device_code,
                farm_name: device.farm_name,
                area_name: area.area_name,
              }
            });
          });
        } else if (area.disease) {
          diseaseList.push({
            id: `disease-current-${area.area_id}`,
            disease_id: `disease-current-${area.area_id}`,
            image_url: area.disease.image_url,
            disease_name: area.disease.name,
            confidence: normalizeConfidence(area.disease.confidence),
            type: area.disease.type || "CURRENT",
            Link: getLink(area.disease),
            advice: area.disease.advice,
            created_at: area.disease.date || area.disease.created_at,
            device_info: {
              reg_id: resolvedRegId,
              device_code: area.device_code,
              farm_name: device.farm_name,
              area_name: area.area_name,
            }
          });
        }
      });

      return;
    }

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
          type: ga.type,
          Link: getLink(ga),
          confidence: normalizeConfidence(ga.confidence),
          advice: ga.advice,
          created_at: ga.created_at,
          device_info: {
            reg_id: device.device_registrations_id,
            device_code: device.device_code,
            farm_name: device.farm_name,
            area_name: device.area_name,
          }
        });
      });
    }

    // จัดการข้อมูลการวิเคราะห์โรค (Disease_Analysis - D ตัวใหญ่ตาม JSON)
    if (Array.isArray(device.Disease_Analysis)) {
      device.Disease_Analysis.forEach((da, index) => {
        // แสดงเฉพาะ USER_UPLOAD และ ESP32 เท่านั้น
        if (da.type === 'USER_UPLOAD' || da.type === 'ESP32') {
          diseaseList.push({
            id: `disease-${device.device_registrations_id}-${index}`,
            image_url: da.image_url,
            disease_name : da.disease_name,
            confidence: normalizeConfidence(da.confidence),
            type: da.type,
            Link: getLink(da),
            advice: da.advice,
            created_at: da.created_at,
            device_info: {
              reg_id: device.device_registrations_id,
              device_code: device.device_code,
              farm_name: device.farm_name,
              area_name: device.area_name,
            }
          });
        }
      });
    }
  });

  return {
    devicesList,
    historyList,
    diseaseList
  };
}