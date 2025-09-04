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

exports.get_farm = async (req, res) => {
  try {
    const user_id = req.params.user_id;

    if (!user_id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const datafarm = await prisma.farms.findMany({
      where: { user_id: Number(user_id) },
    });

      if (!datafarm || datafarm.length === 0) {
        return res.status(404).json({ message: 'No farms found' });
      }


    res.json(datafarm);
  } catch (err) {
    console.error('get_farm error:', err);
    res.status(500).json({ message: 'Failed to fetch farms' });
  }
};


exports.get_farm_plots = async (req, res) => {
  const { farm_id } = req.params;

  try {
    if (!farm_id) {
      return res.status(400).json({ message: 'Farm ID is required' });
    }
    const rows = await prisma.farm_plots.findMany({
      where: { farm_id: Number(farm_id) },
    });

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'No farm plots found' });
    }

    res.json(rows);
  } catch (err) {
    console.error('get_farm_plots error:', err);
    res.status(500).json({ message: 'Failed to fetch farm plots' });
  }
};