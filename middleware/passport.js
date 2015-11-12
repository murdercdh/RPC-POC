/**
 * Created by Administrator on 6/1/2015.
 */
//add the passport to support the three way of auth
//1 first is local auth for support the futhure web page.
//2,second support the oauth for the android and ios device
//3,thrid part weibo and weixin auth for the common user.

var passport = require("passport");

var BearerStrategy = require("passport-http-bearer").Strategy;
var request = require("request");
//var User = require("../models").User;
var config = require("../config.js");

passport.use("HttpBearerLogin", new BearerStrategy({}, function (token, done) {
    process.nextTick(function () {
        request.post(config.OAUTH_SERVER_URI + "/api/v2/verifyToken", {
            json: true,
            headers: {"Authorization": "Bearer " + token}
        }, function (err, response, body) {
            if (err) return done(err);
            if (!body) return done(err, false);
            done(err, body);
        });
    });
}));

// github oauth
passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (user, done) {
    done(null, user);
});

exports.passport = passport;
exports.isHttpBearerAuthenticated = passport.authenticate('HttpBearerLogin', {session: false});