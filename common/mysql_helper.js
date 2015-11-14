var mysql = require("mysql");
var config = require("../config.js");
var redisHelper = require('./redis_helper.js');
var crypto = require('crypto');

function DbHelper() {
    this.pool = mysql.createPool(config.MysqlSettings);
    this.mysql = mysql;
}

DbHelper.prototype.ExecuteQuery = function (query, params, cb) {
    var that = this;

    if (typeof(params) == 'function') {
        cb = params;
        params = null;
    }
    if (query == null || query == "") {
        cb("error", "");
        return;
    }
    if (query.search(/update/i) >= 0 || query.search(/insert/i) >= 0 || query.search(/delete/i) >= 0) {
        that.pool.query(query, params, function (err, res) {
            //result = JSON.stringify(res);
            //redisHelper.set(redisKey, result, ConfigInfo.RedisSettings.dataExpires);
            cb(err, res);
        });
    }
    else {
        var redisKey = query;
        if (params) {
            redisKey += params.toString();
        }
        //console.log("Init Key:"+redisKey);
        var sha512 = crypto.createHash('sha1');
        redisKey = sha512.update(redisKey).digest('hex');
        //console.log("Redis Key: "+redisKey);
        redisKey = "rrc" + "_" + "dev" + "_" + redisKey;
        redisHelper.get(redisKey, function (value) {
            var result = "";
            if (value != null && value != false) {
                result = JSON.parse(value);
                cb("", result);
            }
            else {
                that.pool.query(query, params, function (err, res) {
                    if (err) {
                        cb(err, res);
                        return;
                    }
                    result = JSON.stringify(res);
                    redisHelper.set(redisKey, result, 60);
                    cb(err, res);
                });
            }
        });
    }
}

DbHelper.prototype.ExecuteQueryNoCache = function (query, params, cb) {
    var that = this;

    if (typeof(params) == 'function') {
        cb = params;
        params = null;
    }
    that.pool.query(query, params, function (err, res) {
        cb(err, res);
    });
}

module.exports = new DbHelper();