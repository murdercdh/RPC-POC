//var bcrypt = require('bcrypt');
var moment = require('moment');
var chance = require("chance");
var crypto = require("crypto");
var passwordhash = require("password-hash");
var Type = require('type-of-is');
var cache = require("../common/redis_helper.js").client();//require('../cache-client');
var _ = require('lodash');
var util = require("util");
var request = require("request");

moment.locale('zh-cn'); // 使用中文

var secretOptions = {
    algorithm: 'sha256',
    saltLength: 10,
    iterations: 1
}

// 格式化时间
exports.formatDate = function (date, friendly) {
    date = moment(date);
    if (friendly) {
        return date.fromNow();
    }
    else {
        return date.format('YYYY-MM-DD HH:mm:ss');
    }
};

exports.validateId = function (str) {
    return (/^[a-zA-Z0-9\-_]+$/i).test(str);
};

exports.generateHash = function (str) {
    return passwordhash.generate(str, secretOptions);
}

exports.verifyHash = function (str, secret) {
    return passwordhash.verify(str, secret);
}

//exports.bhash = function (str, callback) {
//    bcrypt.genSalt(10, function (err, salt) {
//        bcrypt.hash(str, salt, callback);
//    });
//};

//exports.bcompare = function (str, hash, callback) {
//    bcrypt.compare(str, hash, callback);
//};

exports.NewGuid = function () {
    return new chance().guid();
}

//生成验证码
exports.generateVerificationCode = function (num) {
    var codeSource = ['1', '2', '3', '4', '5', '6', '7', '8', '9',
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
        'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
    //'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    //'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    var codeText = '';
    for (var i = 0; i < num; i++) {
        var random = Number((Math.random() * 35).toFixed(0));
        codeText += codeSource[random];
    }
    return codeText;
}

exports.generateRandomToken = function (callback) {
    crypto.randomBytes(256, function (err, buffer) {
        if (err) return callback(err, null);
        var token = crypto
            .createHash('sha1')
            .update(buffer)
            .digest('hex');

        callback(null, token);
    });
};

exports.extractTokenFromHeader = function (headers) {
    if (headers == null) throw new Error('Header is null');
    if (headers.authorization == null) throw new Error('Authorization header is null');

    var authorization = headers.authorization;
    var authArr = authorization.split(' ');
    if (authArr.length != 2) throw new Error('Authorization header value is not of length 2');

    // retrieve token
    var token = authArr[1];

    //if (token.length != 10) throw new Error('Token length is not the expected one');

    return token;
};

exports.generateNewExpire = function () {
    return moment().add(global.config.TokenSettings.TokenSavePeriod, 'day').utc().format('YYYY-MM-DD HH:mm:ss');
}

exports.generateNewLocal = function () {
    return moment().utc().format('YYYY-MM-DD HH:mm:ss')
}

exports.generatePhoneVerificationCode = function (secret) {
    var hash = crypto.createHash('sha1');
    hash.update(secret, 'utf8');
    var buff = hash.digest();
    var number = buff.readUInt32LE(0);
    var verificationCode = '000000' + number.toString();
    return verificationCode.substring(verificationCode.length - 6, verificationCode.length);
}

exports.selfVerifyCodeAndToken = function (token, code) {

    var hmac, phone, ref, signature, timestamp, zone;

    ref = token.split(':'), zone = ref[0], phone = ref[1], timestamp = ref[2], signature = ref[3];
    if (new Date() > new Date(timestamp * 1000)) {
        return false;
    }
    hmac = crypto.createHmac('sha1', code);
    hmac.update(zone + ":" + phone + ":" + timestamp);
    return signature === hmac.digest('hex');
}

exports.dateToTimestamp = function (date) {
    return (date.getTime() - date.getMilliseconds()) / 1000;
}

exports.timestampToDate = function (timestamp) {
    var date;
    date = new Date(timestamp * 1000);
    if (Number.isNaN(date.getFullYear())) {
        throw 'timestamp cant to date';
    }
    return date;
}

exports.compareAcceptSubArray = function (firstArr, secondArr) {
    var tpArr = [];
    if (Type.is(firstArr, String)) {
        tpArr.push(firstArr);
    }
    else if (Type.is(firstArr, Array)) {
        tpArr = firstArr;
    }
    else {
        return false;
    }

    var tpObjArr = [];

    if (Type.is(secondArr, Object) && _.keys(secondArr).length > 0) {
        for (var i in secondArr) {
            if (secondArr[i] == true)
                tpObjArr.push(i);
        }
    }
    else {
        return true;
    }

    var tpResult = _.intersection(tpArr, tpObjArr);
    if (tpResult.length > 0) {
        return true;
    } else {
        return false;
    }
}

exports.formatMessageTypeArray = function (tpArr) {
    var resultArr = [];
    if (Type.is(tpArr, String)) {
        resultArr.push(tpArr)
    }
    else if (Type.is(tpArr, Array)) {
        resultArr = tpArr;
    }
    return resultArr;
}

exports.formatToDay = function () {
    return day = moment().format("YYYYMMDD");
}

exports.defaultTheAccept = function (notify) {
    if (!notify.accept) {
        return _.defaults({
            accept: {
                praise: true,
                follow: true,
                comment: true
            }
        }, notify);
    }
    else {
        return notify;
    }
}

exports.adapterPagination = function (req) {
    var pageNum = req.query.pagenum;
    var pageCount = req.query.pagecount;
    var pgOption = {};
    if (pageNum && pageCount) {
        pgOption.skip = (pageNum - 1) * pageCount;
        pgOption.limit = pageCount;
    }

    if (req.query.offset && req.query.limit) {
        pgOption.skip = req.query.offset;
        pgOption.limit = req.query.limit;
    }

    if (req.query.skip && req.query.limit) {
        pgOption.skip = req.query.skip;
        pgOption.limit = req.query.limit;
    }

    if (pgOption.skip == null && pgOption.limit == null) {
        //pgOption.skip = global.config.DEFAULT_DATA_SETTING.skip;
        //pgOption.limit = global.config.DEFAULT_DATA_SETTING.limit;
    }
    return pgOption;
}

exports.checkIntWithRange = function (str, begin, end) {
    if (isNaN(str)) return false;
    var number = parseInt(str, 10);
    return (number >= begin && number <= end);
};

exports.checkStrWithLength = function (str, shortest, longest) {
    console.log(str);
    if (str == null) return (shortest == 0);
    var length = str.length;
    console.log(shortest);
    console.log(longest);
    return (length >= shortest && length <= longest);
};

exports.getWeixinAccessToken = function (callback) {
    var GET_WECHAT_ACCESS_TOKEN = util.format(config.GET_WECHAT_ACCESS_TOKEN, config.WECHAT_FITCAMP_APP_ID, config.WECHAT_FITCAMP_APP_SECRET);
    cache.get(GET_WECHAT_ACCESS_TOKEN, function (err, reply) {
        var json;
        if (err) return callback(err);

        if (reply) {
            json = JSON.parse(reply);
            console.log('server cgi token ' + json.access_token);
            //console.log(json);
            callback(null, json.access_token);
        }
        else {
            request(GET_WECHAT_ACCESS_TOKEN, function (err, resp, body) {
                var e;
                if (err) return callback(new error.UpstreamError);
                if (resp.statusCode < 300) {
                    //console.log(body);
                    try {
                        console.log('server cgi token ' + body);
                        json = JSON.parse(body);
                        cache.multi()
                            .set(GET_WECHAT_ACCESS_TOKEN, body)
                            .expire(GET_WECHAT_ACCESS_TOKEN, json.expires_in)
                            .exec(function (err, reply) {
                                if (err) console.error(err);
                            });
                        callback(null, json.access_token);
                    }
                    catch (_error) {
                        e = _error;
                        return callback(new error.UpstreamError(body));
                    }
                }
                else {
                    callback(new error.ServerInternalError(resp.statusCode, resp.body));
                }
            });
        }
    });
}

exports.getWeixinJsApiTicket = function (accessToken, callback) {
    var GET_JSAPI_TICKET_KEY = util.format(config.GET_JSAPI_TICKET, accessToken);

    cache.get(GET_JSAPI_TICKET_KEY, function (err, reply) {
        var json;
        if (err) return callback(err);

        if (reply) {
            console.log('ticket -----' + reply);
            json = JSON.parse(reply);
            callback(null, json.ticket);
        }
        else {
            console.log('no ticket =====' + reply);
            request(GET_JSAPI_TICKET_KEY, function (err, resp, body) {
                var e;
                if (err) return callback(new error.UpstreamError(body));

                if (resp.statusCode < 300) {
                    console.log('ticket #####' + body);
                    try {
                        json = JSON.parse(body);
                        cache.multi()
                            .set(GET_JSAPI_TICKET_KEY, body)
                            .expire(GET_JSAPI_TICKET_KEY, json.expires_in)
                            .exec(function (err, reply) {
                                if (err) console.error(err);
                            });
                        callback(null, json.ticket);
                    } catch (_error) {
                        e = _error;
                        return callback(new error.UpstreamError(body));
                    }
                }
                else {
                    callback(new error.ServerInternalError(resp.statusCode, resp.body));
                }
            });
        }
    });
}

exports.randomValueHex = function (len) {
    return crypto.randomBytes(Math.ceil(len / 2))
        .toString('hex') // convert to hexadecimal format
        .slice(0, len);   // return required number of characters
}

