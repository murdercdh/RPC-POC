/**
 * Created by root on 16-2-29.
 */
//Converter Class

var db = require("../common/mysql_helper.js");
var Converter = require("csvtojson").Converter;
var converter = new Converter({});
var async = require('async');
var _ = require('lodash');

converter.transform = function (json, row, index) {
    json["最低首付"] = _.toNumber(_.trimEnd(json["最低首付"], '%'));
    //json["年手续费率"] = _.toNumber(_.trimEnd(json["年手续费率"],'%'));
    /* some other examples:
     delete json["myfield"]; //remove a field
     json["dateOfBirth"]=new Date(json["dateOfBirth"]); // convert a field type
     */
};

converter.fromFile("../raw/installment.csv", function (err, result) {
    if (err) return console.log(err.message);
    async.each(result, function (re, cb) {
        var insertSql = 'INSERT INTO cm_installment_new SET ?';
        //'product,' +
        //'institution,' +
        //'city,' +
        //'down_payment,' +
        //'interest_rate,' +
        //'month_limits,' +
        //'price_limits,' +
        //'rates,' +
        //'description,' +
        //'requirement,' +
        //'sample,' +
        //‘sample_image’ +
        //'url,' +
        //'fee' +
        //') values ?';
        var itemArr = {};
        itemArr.product = re['产品名称'];
        itemArr.institution = re['金融机构'];
        itemArr.city = re['城市'];
        itemArr.down_payment = re['最低首付'];
        itemArr.interest_rate = re['年手续费'];
        itemArr.month_limits = re['分期期限'];
        itemArr.price_limits = re['贷款限额'];
        itemArr.rates = re['产品费率/期限'];
        itemArr.description = re['产品说明'];
        itemArr.requirement = re['申请条件'];
        itemArr.sample = re['例子'];
        itemArr.sample_image = re['例子图片'];
        itemArr.url = re['更多车源链接'];
        itemArr.fee = re['贷款手续费'];

        db.ExecuteQueryNoCache(insertSql, itemArr, function (err, res) {
            if (err) return console.log(err.message);
            console.log(res);
        });
    });
});