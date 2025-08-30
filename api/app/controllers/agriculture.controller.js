const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()


exports.register_device = async (req, res) => {
  try {
    const { device_code, device_name, user_id } = req.body ?? {};

    if (!device_code || !device_name || !user_id) {
      return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
    }

    const device = await prisma.devices.findUnique({
      where: { device_code: device_code },
    });

   if (!device) {
     return res.status(404).json({ message: 'ไม่พบอุปกรณ์นี้ในระบบ', success: false });
   }

   if(device.status == 'active'){
     return res.status(403).json({ message: 'อุปกรณ์นี้ถูกลงทะเบียนแล้ว', success: false });
   }

    const result = await prisma.device_registrations.create({
      data: {
        device_id: device.device_id,
        user_id: user_id,
        status:"active",
        name_device: device_name,
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
        created_at: new Date()
      }
    });



    return res.status(200).json({ message: 'ลงทะเบียนอุปกรณ์สำเร็จ', data: result  , success: true });

  } catch (err) {
    console.error('register_device error:', err);
    return res.status(500).json({ error: 'ลงทะเบียนอุปกรณ์ล้มเหลว' });
  }
};


exports.getDevice_data = async (req, res) => {
  try {
    const user_id = 11 

    if (!user_id) {
      return res.status(400).json({ error: 'กรุณาระบุรหัสผู้ใช้' });
    }

    const deviceData = await prisma.device_registrations.findMany({
      where: { user_id },
      include: {
        devices: true,
        user_device_settings: true,
        sensor_readings: {
          include: { sensor_type: true },
          orderBy: { measured_at: 'desc' },
        },
      },
      orderBy: { registered_at: 'desc' },
    });

    const formatThaiDate = (iso) => {
      if (!iso) return "-";
      return new Date(iso).toLocaleDateString("th-TH", {
        year: "numeric", month: "long", day: "numeric",
      });
    };

    function groupLatestByType(readings) {
      const map = new Map();
      readings.forEach(r => {
        const prev = map.get(r.sensor_type_id);
        if (!prev || new Date(r.measured_at) > new Date(prev.measured_at)) {
          map.set(r.sensor_type_id, r);
        }
      });
      return Array.from(map.values());
    }


    const cards = deviceData.map(row => {
      const deviceCode = row.devices?.device_code || `DEV-${row.device_registrations_id}`;
      const location   = row.name_device || "-";
      const status     = row.status === "active" ? "connected" : "warning";

      const latestReadings = groupLatestByType(row.sensor_readings);

   
      const lastUpdateISO = latestReadings.length > 0
        ? latestReadings[0].measured_at
        : row.registered_at;

      return {
        id: deviceCode,
        name: `อุปกรณ์ ${location}`,
        status,
        description: "อุปกรณ์ IoT สำหรับเก็บข้อมูลแปลงนา",
        lastUpdate: formatThaiDate(lastUpdateISO),
        sensor: latestReadings.map(r => ({
          type: r.sensor_type?.name,
          unit: r.unit,
          currentValue: String(r.value ?? ""),
          lastUpdate: formatThaiDate(r.measured_at),
        })),
      };
    });

    return res.json(cards);

  } catch (err) {
    console.error("getDevice_data error:", err);
    return res.status(500).json({ error: "ไม่สามารถดึงข้อมูลอุปกรณ์ได้" });
  }
};
