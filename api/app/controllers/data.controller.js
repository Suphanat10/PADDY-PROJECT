const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()



exports.getDataProvinces = async (req, res) => {
  try {
    const rows = await prisma.provinces.findMany();

    res.json(rows);
  } catch (err) {
    console.error('getDataProvinces error:', err);
    res.status(500).json({ message: 'Failed to fetch provinces' });
  }
};

exports.getDataDistricts = async (req, res) => {
  const { province_id } = req.params;
  try {
    const rows = await prisma.districts.findMany({
      where: { province_id: Number(province_id) },
    });
    res.json(rows);
  } catch (err) {
    console.error('getDataDistricts error:', err);
    res.status(500).json({ message: 'Failed to fetch districts' });
  }
};


exports.getDataSubDistricts = async (req, res) => {
  const { district_id } = req.params;
  try {
    const rows = await prisma.sub_districts.findMany({
      where: { district_id: Number(district_id) },
    });
    res.json(rows);
  } catch (err) {
    console.error('getDataSubDistricts error:', err);
    res.status(500).json({ message: 'Failed to fetch sub-districts' });
  }
};
