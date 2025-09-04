const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.register_device = async (req, res) => {
  try {
    const { device_code, farm_plot_id, user_id } = req.body;
    console.log("Registering device:", { device_code, farm_plot_id, user_id });

    if (!device_code || !farm_plot_id || !user_id) {
      return res.status(400).json({ error: "ข้อมูลไม่ครบถ้วน" });
    }

    const device = await prisma.devices.findUnique({
      where: { device_code: device_code },
    });

    if (!device) {
      return res
        .status(404)
        .json({ message: "ไม่พบอุปกรณ์นี้ในระบบ", success: false });
    }

    if (device.status == "active") {
      return res
        .status(403)
        .json({ message: "อุปกรณ์นี้ถูกลงทะเบียนแล้ว", success: false });
    }

    const result = await prisma.device_registrations.create({
      data: {
        device_id: device.device_id,
        user_id: user_id,
        status: "active",
        farm_plot_id: parseInt(farm_plot_id),
        registered_at: new Date(),
      },
    });

    const updatedDevice = await prisma.devices.update({
      where: { device_id: device.device_id },
      data: { status: "active" },
    });

    await prisma.logs.create({
      data: {
        user_id: user_id,
        action: "register_device",
        ip_address: req.ip,
        created_at: new Date(),
      },
    });

    return res
      .status(200)
      .json({ message: "ลงทะเบียนอุปกรณ์สำเร็จ", data: result, success: true });
  } catch (err) {
    console.error("register_device error:", err);
    return res.status(500).json({ error: "ลงทะเบียนอุปกรณ์ล้มเหลว" });
  }
};

exports.getDevice_data_byID = async (req, res) => {
  try {
    const device_code = req.params.id;
    const user_id = 11;

    if (!device_code) {
      return res.status(400).json({ error: "กรุณาระบุรหัสอุปกรณ์" });
    }

    const deviceForUser = await prisma.devices.findFirst({
      where: {
        device_code,
        device_registrations: {
          some: { user_id },
        },
      },
      select: { device_id: true },
    });

    if (!deviceForUser) {
      return res.status(403).json({ error: "ไม่พบการลงทะเบียนอุปกรณ์นี้" });
    }

    const deviceData = await prisma.devices.findUnique({
      where: { device_code },
      include: {
        device_registrations: {
          include: {
            sensor_readings: {
              include: { sensor_type: true },
              orderBy: { measured_at: "desc" },
            },
          },
          orderBy: { registered_at: "desc" },
        },
      },
    });

    if (!deviceData) {
      return res.status(404).json({ error: "ไม่พบข้อมูลอุปกรณ์" });
    }

    return res.json(deviceData);
  } catch (err) {
    console.error("getDevice_data_byID error:", err);
    return res.status(500).json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
};


exports.disconnected_device = async (req, res) => {
  try {
    const { device_code, user_id } = req.body;
    console.log("Disconnecting device:", { device_code, user_id });
    if (!device_code || !user_id) {
      return res.status(400).json({ error: "ข้อมูลไม่ครบถ้วน" });
    }
    const device = await prisma.devices.findUnique({
      where: { device_code: device_code },
    });
    if (!device) {
      return res
        .status(404)
        .json({ message: "ไม่พบอุปกรณ์นี้ในระบบ", success: false });
    }
    const registration = await prisma.device_registrations.findFirst({
      where: { device_id: device.device_id, user_id: user_id },
    });
    if (!registration) {
      return res
        .status(403)
        .json({ message: "ไม่พบการลงทะเบียนอุปกรณ์นี้", success: false });
    }

    if (registration.status === "inactive") {
      return res
        .status(400)
        .json({ message: "อุปกรณ์นี้ถูกตัดการเชื่อมต่อแล้ว", success: false });
    }

    const result = await prisma.device_registrations.update({
      where: { device_registrations_id: registration.device_registrations_id },
      data: { status: "inactive" },
    });

    /// mcu offline ด้วย
    
    return res
      .status(200)
      .json({ message: "ตัดการเชื่อมต่ออุปกรณ์สำเร็จ", success: true });
  } catch (err) {
    console.error("disconnect_device error:", err);
    return res.status(500).json({ error: "ตัดการเชื่อมต่ออุปกรณ์ล้มเหลว" });
  }
};




exports.getDevice_data = async (req, res) => {
  try {
    const user_id = 11;

    if (!user_id) {
      return res.status(400).json({ error: "กรุณาระบุรหัสผู้ใช้" });
    }

    const deviceData = await prisma.device_registrations.findMany({
      where: { user_id },
      include: {
        devices: true,
        user_device_settings: true,
        farm_plots: {
          include: {
            farms: true,
          },
        },
        sensor_readings: {
          include: { sensor_type: true },
          orderBy: { measured_at: "desc" },
        },
      },
      orderBy: { registered_at: "desc" },
    });

    const formatThaiDate = (iso) => {
      if (!iso) return "-";
      return new Date(iso).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    function groupLatestByType(readings) {
      const map = new Map();
      readings.forEach((r) => {
        const prev = map.get(r.sensor_type_id);
        if (!prev || new Date(r.measured_at) > new Date(prev.measured_at)) {
          map.set(r.sensor_type_id, r);
        }
      });
      return Array.from(map.values());
    }

    const cards = deviceData.map((row) => {
      const deviceCode =
        row.devices?.device_code || `DEV-${row.device_registrations_id}`;
      const location = row.name_device || "-";
      const status = row.status === "active" ? "connected" : "disconnected";

      const latestReadings = groupLatestByType(row.sensor_readings);

      const lastUpdateISO =
        latestReadings.length > 0
          ? latestReadings[0].measured_at
          : row.registered_at;

      const DEFAULT_SENSOR_PLACEHOLDERS = [
        {
          type: "Water Level Sensor",
          unit: "cm",
          currentValue: null,
          lastUpdate: null,
        },
        {
          type: "Moisture Sensor",
          unit: "%",
          currentValue: null,
          lastUpdate: null,
        },
        {
          type: "N Sensor",
          unit: "mg/kg",
          currentValue: null,
          lastUpdate: null,
        },
        {
          type: "P Sensor",
          unit: "mg/kg",
          currentValue: null,
          lastUpdate: null,
        },
        {
          type: "K Sensor",
          unit: "mg/kg",
          currentValue: null,
          lastUpdate: null,
        },
      ];

      return {
        id: deviceCode,
        name: `อุปกรณ์ ${location}`,
        status,
        farm: {
          name: row.farm_plots.farms.farm_name,
          location: row.farm_plots.plot_name,
        },
        description: "อุปกรณ์ IoT สำหรับเก็บข้อมูลแปลงนา",
        lastUpdate: formatThaiDate(lastUpdateISO),
        sensor: latestReadings?.length
          ? latestReadings.map((r) => ({
              type: r.sensor_type?.name,
              unit: r.unit ?? "",
              // คงเป็น string สำหรับค่าที่มีจริง แต่ถ้าไม่มีให้เป็น null
              currentValue:
                r.value !== undefined && r.value !== null
                  ? String(r.value)
                  : null,
              lastUpdate: r.measured_at ? formatThaiDate(r.measured_at) : null,
            }))
          : DEFAULT_SENSOR_PLACEHOLDERS,
      };
    });

    return res.json(cards);
  } catch (err) {
    console.error("getDevice_data error:", err);
    return res.status(500).json({ error: "ไม่สามารถดึงข้อมูลอุปกรณ์ได้" });
  }
};
