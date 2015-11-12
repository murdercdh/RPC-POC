/**
 * Created by Wanji on 2014/9/11.
 */
var config = require('../config.js');
var redis = require("redis");

module.exports = new RedisHelper();

function RedisHelper() {
    //this.client = redis.createClient(config.RedisSettings.port, config.RedisSettings.host);
    //this.client.on('error', function (err) {
    //    console.log("Connection Error:", err);
    //});
};

RedisHelper.prototype.incr = function (key) {
    var client = redis.createClient(config.RedisSettings.port, config.RedisSettings.host);
    client.on("error", function (err) {
        console.log("Error " + err);
        //callback(err, null);
        client.quit();
    });
    client.incr(key, function (err, item) {
        //callback(err, item);
        client.quit();
    })
}

RedisHelper.prototype.keys = function (key, callback) {
    var client = redis.createClient(config.RedisSettings.port, config.RedisSettings.host);
    client.on("error", function (err) {
        console.log("Error " + err);
        callback(err, null);
        client.quit();
    });
    client.keys(key, function (err, items) {
        callback(null, items);
        client.quit();
    })
}

RedisHelper.prototype.set = function (key, value) {
    var client = redis.createClient(config.RedisSettings.port, config.RedisSettings.host);
    client.on("error", function (err) {
        client.quit();
        console.log("Error " + err);
    });
    client.set(key, value);
    //client.expire(key, config.RedisSettings.expires);
    client.quit();
};

RedisHelper.prototype.setex = function (key, value, ttl) {
    var client = redis.createClient(config.RedisSettings.port, config.RedisSettings.host);
    client.on("error", function (err) {
        client.quit();
        console.log("Error " + err);
    });
    client.setex(key, ttl, value);
    //client.expire(key, ttl);
    client.quit();
}

RedisHelper.prototype.get = function (key, callback) {
    var client = redis.createClient(config.RedisSettings.port, config.RedisSettings.host);
    client.on("error", function (err) {
        console.log("Error " + err);
        callback(err, null);
        client.quit();
    });
    client.get(key, function (err, value) {
        callback(err, value);
        client.quit();
    });
};

RedisHelper.prototype.del = function (key, callback) {
    var client = redis.createClient(config.RedisSettings.port, config.RedisSettings.host);
    client.on("error", function (err) {
        callback(err);
        client.quit();
        console.log("Error " + err);
    });
    client.del(key, function (err, reply) {
        callback(err, reply);
        client.quit();
    });

};

RedisHelper.prototype.client = function () {
    var client = redis.createClient(config.RedisSettings.port, config.RedisSettings.host);
    return client;
}
//RedisHelper.prototype.queuePop = function (callback) {
//    var client = redis.createClient(config.RedisSettings.port, config.RedisSettings.host);
//    client.on("error", function (err) {
//        console.log("Error " + err);
//        callback(err, null);
//        client.quit();
//    });
//    client.select(config.NotificationSettings.Notification_Queue_DB_Index, function (err) {
//        client.brpop(config.NotificationSettings.Notification_Queue_Name, 0, function (err, data) {
//            //if (err) return callback(err, null);
//            callback(err, data);
//            client.quit();
//        })
//    })
//}
//RedisHelper.prototype.queuePush = function (obj, callback) {
//    var client = redis.createClient(config.RedisSettings.port, config.RedisSettings.host);
//    client.on("error", function (err) {
//        console.log("Error " + err);
//        callback(err, null);
//        client.quit();
//    });
//    client.select(config.NotificationSettings.Notification_Queue_DB_Index, function (err) {
//        client.lpush(config.NotificationSettings.Notification_Queue_Name, JSON.stringify(obj), function (err, dt) {
//            //if (err) return callback(err, null);
//            callback(err, dt);
//            client.quit();
//        })
//    })
//}
//RedisHelper.prototype.queueLength = function (callback) {
//    var client = redis.createClient(config.RedisSettings.port, config.RedisSettings.host);
//    client.on("error", function (err) {
//        client.quit();
//        console.log("Error " + err);
//        callback(err, null);
//    });
//    client.select(config.NotificationSettings.Notification_Queue_DB_Index, function (err) {
//        client.llen(config.NotificationSettings.Notification_Queue_Name, function (err, dt) {
//            //if (err) return callback(err, null);
//            callback(null, dt);
//            client.quit();
//        })
//    })
//}


