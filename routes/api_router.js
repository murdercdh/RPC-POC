var city = require("./city_router.js");

var passport = require("../middleware/passport.js");

module.exports = function (app) {
    //mark all the module for the common business code
    app.use(passport.passport.initialize());
    app.use("/v3/city", city);
};
