const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const verifyToken = (req, res, next) => {
  const cookie = req.headers.cookie;

  if (!cookie) {
    return res.status(403).send({
      message: "No Token provided!",
    });
  }
  const arrTok = cookie.split(";").reduce((cookies, cookie) => {
    const [name, val] = cookie.split("=").map((c) => c.trim());
    cookies[name] = val;
    return cookies;
  }, {});
  const token = arrTok["accessToken"];
  if (!token) {
    return res.status(403).send({
      message: "No Token provided 2!",
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }

    req.user_id = decoded.id;
    next();
  });
};

const isAgriculturist = async (req, res, next) => {
  try {
    const user_id = parseInt(req.user_id);
    const user = await prisma.account.findMany({
      where: {
        user_id: user_id,
        role: "Agriculturist"
      }
    });
    if (user.length == 0) {
      return res.status(403).send({ message: "Require Agriculturist Role!" });
    }

    next();
  } catch (error) {
    return res.status(500).send({
      message: error.message,
      code: 500,
    });
  }
};


const authJwt = {
  verifyToken,
  isAgriculturist,
};



module.exports = authJwt;