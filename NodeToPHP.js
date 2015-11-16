/**
 * Created by Administrator on 2015/11/12.
 */
var request = require("request");
var async = require("async");

function requestMainSite(cb) {
    //var url = "http://api.renrenche.com/citylist";
    var url="http://localhost:9003/v3/city";
    request(url, function (err, repo, body) {
        if (err) return cb(err, null);
        var ret = JSON.parse(body);
        //console.log(ret);
        cb(null, ret);
    })
}
function main() {
    console.time("100 times");
    async.times(100, function (n, next) {
        requestMainSite(next);
    }, function (err, result) {
        if (err) return;
        console.log(result.length);
        console.timeEnd("100times");
    });
}
main();