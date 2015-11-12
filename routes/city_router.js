/**
 * Created by donegalchen on 10/13/15.
 */
var express = require('express');
var cityCtl = require("../controller/city_controller.js");
var passport = require('../middleware/passport.js');

var router = module.exports = express.Router();

router.get("/", cityCtl.get);
router.get("/rpc",cityCtl.rpcGet);
//router.post("/", cityCtl.add);

//router.route("/:id")
//    .get(cityCtl.getById)
//    .put(cityCtl.updateById)
//    .delete(cityCtl.deleteById);

module.exports = router;