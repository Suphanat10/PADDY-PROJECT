const controller = require("../controllers/agriculture.controller")


module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/agriculture/register-device", controller.register_device);
  app.get("/api/agriculture/data/device", controller.getDevice_data);
};
