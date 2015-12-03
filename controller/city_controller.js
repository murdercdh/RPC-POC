/**
 * Created by Administrator on 2015/11/12.
 */
var error = require("../common/error.js");
var tools = require("../common/tools.js");
var db = require("../common/mysql_helper.js");
var util = require("util");
var _ = require("lodash");
var request = require("request");
var async = require("async");
var searchR=require("../raw/searchRaw.js");

exports.add = function (req, res, next) {
    var cp = req.body;
    if (cp) {
        Campaign.findOneAndUpdate({name: cp.name},
            cp,
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }).lean().exec(function (err, campaign) {
            if (err) return next(err);
            res.json(campaign);
        })
    }
    else {
        next(new error.BadRequest());
    }
}

exports.get = function (req, res, next) {
    var sqlQuery = "SELECT city,abbr FROM rrc_front.cm_cities where online = 1 and city!='全国' order by abbr asc";
    var ip = _.trim(req.ip, '.');
    ip = "";
    var result = {};
    if (ip) {
        getCityByIP(ip, function (err, result1) {
            if (err) return next(error.ServerInternalError);
            if (result1.length > 0) {
                result.current_city = result1[0].address;
            }
            getAbbr(null, function (err, result2) {
                if (err) return next(error.ServerInternalError);
                //result.cities = result2;
                if (result2.length > 0) {
                    result.cities = _.pluck(result2, 'city');
                    result.cities_abbr = _.pluck(result2, 'abbr');
                    res.json(result);
                }
            });
        })
    } else {
        next(error.BadRequest);
    }
}

function getAbbr(input, cb) {
    var sqlQuery = "SELECT city,abbr FROM rrc_front.cm_cities where online = 1 and city!='全国' order by abbr asc";
    db.ExecuteQuery(sqlQuery, cb);
}

function getCityByIP(ip, cb) {
    ip = db.pool.escape(ip);
    var sqlQuery = util.format("select address from (SELECT * FROM (cm_ip) WHERE ip1 <= '%s' order by ip1 desc limit 10) as a where a.ip2 >= '%s'", ip, ip);
    db.ExecuteQuery(sqlQuery, cb);
}

exports.rpcGet = function (req, res, next) {
    var url = "http://localhost:9003/v3/city";
    //var url="http://localhost;8081/citylist";
    request.get(url, function (err, response, body) {
        if (err) next(error.ServerInternalError);
        var rt = JSON.parse(body);
        res.json(rt);
    })
}

exports.mrpcGet = function (obj, cb) {
    var ip = obj;
    var result = {};
    if (ip) {
        async.series([function a(cb) {
            getAbbr(null, cb);
        }, function b(cb) {
            getCityByIP(ip, cb);
        }], function (err, result) {
            if (err) return cb(err, null);
            result.cities = result[0];
            result.current_city = result[1];
            cb(err, result);
        })
    } else {
        cb(null, null);
    }
}

exports.deleteById = function (req, res, next) {
    var id = req.params.id;
    if (id) {
        //Campaign.findByIdAndRemove(campaign_id).exec(function (err, result) {
        //    if (err) return next(err);
        //    res.json(result);
        //})
    }
    else {
        next(new error.BadRequest());
    }
}

exports.getById = function (req, res, next) {
    var id = req.params.id;
    if (id) {
        //Campaign.findById(campaign_id).exec(function (err, result) {
        //    if (err) return next(err);
        //    res.json(result);
        //});
    }
    else {
        next(new error.BadRequest());
    }
}

exports.updateById = function (req, res, next) {
    var id = req.params.id;
    var body = req.body;
    if (id && body) {
        //Campaign.findByIdAndUpdate(campaign_id, campaign, {new: true}).exec(function (err, result) {
        //    if (err) return next(err);
        //    res.json(result);
        //});
    }
    else {
        next(new error.BadRequest());
    }
}

exports.searchFilterRaw=function(req,res,next){
    if(searchR){
        res.json(searchR);
    }
}