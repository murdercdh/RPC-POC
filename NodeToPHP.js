/**
 * Created by Administrator on 2015/11/12.
 */
var request = require("request");

function main() {
    var url = "http://api.renrenche.com/citylist";
    request(url, function (err, repo, body) {
        if(err) console.log(err);
        var ret=JSON.parse(body)
        console.log(ret);
    })
}

main();