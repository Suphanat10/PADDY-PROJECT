const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const config = require("../config/auth.config");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");



exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await prisma.account.findUnique({
      where: {
        username: username
      }
    });

    if (!user) {
      return res.status(401).json({ message: "ไม่พบบัญชีผู้ใช้" });
    }

   let  passwordIsValid = bcrypt.compareSync(password, user.password);

   if (!passwordIsValid) {
     return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
   }

   const token = jwt.sign({ id: user.account_id }, config.secret, {
      expiresIn: 86400,
   });

   res.status(200)
      .cookie("accessToken", token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         maxAge: 86400 * 1000, 
      })
      .send({ 
         message: "เข้าสู่ระบบสำเร็จ", 
         user: { 
            id: user.account_id, 
            first_name: user.first_name,
            last_name: user.last_name,
            position: user.position
         } });

     const saveLogs = await prisma.logs.create({
        data: {
           user_id: user.account_id,
           action: "login",
           ip_address: req.ip,
           created_at: new Date()
        }
     });

  } catch (error) {
    console.error("Error signing up:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.register = async (req, res) => {
  try {
    const { 
      prefix, first_name, last_name, birth_date, gender, phone_number, 
      user_id_line, username, password, position, 
      plot_name, area, rice_variety, planting_method,
      soil_type, water_management, is_baac_member,  
      address, sub_district_id 
    } = req.body || {};

    if (
      prefix == null || first_name == null || last_name == null || birth_date == null ||
      gender == null || phone_number == null || user_id_line == null ||
      username == null || password == null || position == null ||
      plot_name == null || area == null || rice_variety == null ||
      planting_method == null || soil_type == null || water_management == null ||
      is_baac_member == null || address == null || sub_district_id == null
    ) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }


    if (password.length < 8) {
      return res.status(400).json({ message: "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร" });
    }
    if (!/^[0-9]+$/.test(phone_number) || phone_number.length < 10) {
      return res.status(400).json({ message: "หมายเลขโทรศัพท์ต้องเป็นตัวเลขและมีความยาวอย่างน้อย 10 ตัว" });
    }

   
    const existingUser = await prisma.account.findUnique({
      where: { username }
    });
    if (existingUser) {
      return res.status(400).json({ message: "ชื่อผู้ใช้งานนี้มีในระบบแล้ว" });
    }

   
    const existingLineId = await prisma.account.findFirst({
      where: { user_id_line }
    });
    if (existingLineId) {
      return res.status(400).json({ message: "User ID Line นี้มีในระบบแล้ว" });
    }

 
    const birthDate = new Date(birth_date);
    const passwordHash = bcrypt.hashSync(password, 10);
    const subDistrictIdNum = parseInt(sub_district_id, 10);
    const areaNum = typeof area === "string" ? parseFloat(area) : area;

    if (Number.isNaN(subDistrictIdNum)) {
      return res.status(400).json({ message: "sub_district_id ต้องเป็นตัวเลข" });
    }
    if (Number.isNaN(areaNum)) {
      return res.status(400).json({ message: "พื้นที่ (area) ต้องเป็นตัวเลข" });
    }

    const isBascMember = (typeof is_baac_member === "string")
      ? is_baac_member.trim().toLowerCase() === "true"
      : Boolean(is_baac_member);

 
    const created_account = await prisma.account.create({
      data: {  
        prefix,
        first_name,
        last_name,
        birth_date: birthDate,
        gender,
        phone_number,
        user_id_line,
        username,
        password: passwordHash,
        position,
        agriculture_info: {
          create: {
            plot_name,
            area: areaNum,
            rice_variety,
            planting_method,
            soil_type,
            water_management,
            is_basc_member: isBascMember,    
            address,
            sub_district_id: subDistrictIdNum
          }
        }
      },
      include: { agriculture_info: true }
    });

   
    await prisma.logs.create({
      data: {
        user_id: created_account.account_id,
        action: "create_account",
        ip_address: req.ip,
        created_at: new Date()
      }
    });

    return res.status(200).json({ message: "สมัครสมาชิกสำเร็จ", user: created_account });

  } catch (error) {
    console.error("Error signing up:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
