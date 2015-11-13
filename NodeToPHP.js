/**
 * Created by Administrator on 2015/11/12.
 */
var request = require("request");
var async = require("async");

function requestMainSite(cb) {
    var url = "http://api.renrenche.com/citylist";
    request(url, function (err, repo, body) {
        if (err) return cb(err, null);
        var ret = JSON.parse(body);
        //console.log(ret);
        cb(null, ret);
    })
}
function main() {
    console.time("100times");
    async.times(100, function (n, next) {
        requestMainSite(next);
    }, function (err, result) {
        if (err) return;
        console.log(result.length);
        console.timeEnd("100times");
    });
}
main();