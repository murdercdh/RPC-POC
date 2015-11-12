var express = require('express');
var router = module.exports = express.Router();

var _ = require('lodash');
var FormData = require('form-data');
var uuid = require('node-uuid');
var BusBoy = require('busboy');
var qiniu = require('qiniu');
var config = require("../config.js");

//var QINIU_BUCKET = 'ppt-cdn';
var QINIU_URLBASE = 'http://7xk7z1.com2.z0.glb.qiniucdn.com/';//http://7xk7z1.com2.z0.glb.qiniucdn.com/QRCode/9187f2f0667911e5aeb143b258c188a3
qiniu.conf.ACCESS_KEY = config.QINIU_ACCESS_KEY;//"zeTgpUmrngNlxdek38_vi-sABFknlxrpMwTzhLaV";
qiniu.conf.SECRET_KEY = config.QINIU_SECRET_KEY;//"5TT67ebzZwj9oEBkSObVsG49i4NFcxAaqy9YbnpU";

function generateResourceID() {
    var buff = new Buffer(16);
    uuid.v1(null, buff, null);
    return buff.toString('hex');
}

router.post('/', function (req, res, next) {

    function next_once(e) {
        if (next) {
            next(e);
            next = null;
        }
    }

    var busboy = new BusBoy({headers: req.headers});
    var prefix = '';
    var form = null;
    busboy.on('field', function (fieldname, value) {
        if (fieldname == 'Prefix' && typeof (value) === 'string' && value != '') {
            prefix = value + '/'
        }
    });

    busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        console.log(fieldname, encoding);
        console.log(file);

        var chunks = [];
        file.on('data', function (chunk) {
            chunks.push(chunk);
        });
        file.on('error', next_once);

        file.on('end', function () {
            var fileBuffer = Buffer.concat(chunks);

            form = new FormData();
            form.append('file', fileBuffer);
        });
    });
    busboy.on('finish', function () {
        if (!form) {
            res.status(400).send();
        } else {
            var resourceId = prefix + generateResourceID();
            var policy = new qiniu.rs.PutPolicy(config.QINIU_BUCKET_NAME + ":" + resourceId);
            //policy.persistentOps = "vframe/jpg/offset/7/w/480/h/360";
            form.append('key', resourceId);
            form.append('token', policy.token());
            form.submit('http://upload.qiniu.com/', function (err, response) {
                if (err) return next_once(err);
                console.log(response.statusCode);
                if (response.statusCode > 300) {
                    res.status(502).send(response.body);
                } else {
                    res.json({location: QINIU_URLBASE + resourceId});
                }
                response.pipe(process.stdout);
                //response.resume();
            });
        }
    });
    busboy.on('error', function (e) {
        console.log('error: ' + e);
        next_once(e);
    });
    req.pipe(busboy);
});

module.exports = router;