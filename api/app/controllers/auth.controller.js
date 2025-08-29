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

    const { username, password, first_name, last_name, phone_number, user_id_line } = req.body;

      const phone_number_raw = String(req.body.phone_number ?? "");
    const phone_number_ = phone_number_raw.replace(/\D/g, "");
 

     const user = await prisma.account.findUnique({
       where: {
         username: username
       }
     });

     if (user) {
       return res.status(400).json({ message: "ชื่อผู้ใช้งานนี้มีอยู่แล้ว" });
     }

     const phone_exists = await prisma.account.findFirst({
       where: {
         phone_number: phone_number_ 
       }
     });

     if (phone_exists) {
       return res.status(400).json({ message: "หมายเลขโทรศัพท์นี้มีอยู่แล้ว" });
     }


  if(user_id_line!= null){
    const line_user = await prisma.lineUser.findUnique({
      where: {
        user_id: user_id_line
      }
    });

    if (!line_user) {
      return res.status(400).json({ message: "ไม่พบผู้ใช้ LINE" });
    }
    return;
  }
  

    const hashedPassword = bcrypt.hashSync(password, 8);

    const created_account = await prisma.account.create({
      data: {
        username: username,
        password: hashedPassword,
        first_name: first_name,
        last_name: last_name,
        phone_number: phone_number_,
        position: "Agriculture",
        user_id_line: user_id_line
      }
    });
  
    await prisma.logs.create({
      data: {
        user_id: created_account.account_id,
        action: "create_account",
        ip_address: req.ip,
        created_at: new Date()
      }
    });

    return res.status(200).json({ message: "สมัครสมาชิกสำเร็จ", success: true });

  } catch (error) {
    console.error("Error signing up:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.logout = (req, res) => {
   try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.clearCookie("accessToken");

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error logging out:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
