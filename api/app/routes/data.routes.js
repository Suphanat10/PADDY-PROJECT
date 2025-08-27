const controller = require("../controllers/data.controller");


module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/data/provinces", controller.getDataProvinces);
  app.get("/api/data/districts/:province_id", controller.getDataDistricts);
  app.get("/api/data/sub-districts/:district_id", controller.getDataSubDistricts);
};
