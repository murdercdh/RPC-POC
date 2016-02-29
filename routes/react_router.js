/**
 * Created by donegalchen on 10/13/15.
 */
var express = require('express');
var passport = require('../middleware/passport.js');

var router = module.exports = express.Router();

router.get("/", function(req,res){
    var co=req.cookies;
    res.render('index',{name:co});
});
//router.post("/", cityCtl.add);

//router.route("/:id")
//    .get(cityCtl.getById)
//    .put(cityCtl.updateById)
//    .delete(cityCtl.deleteById);