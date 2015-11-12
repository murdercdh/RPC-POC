/**
 * Created by donegalchen on 7/29/15.
 */

var raven = require('raven');
var config = require('../config.js');

var SENTRY_DSN = config.SENTRY_DSN;

var sentry = new raven.Client(SENTRY_DSN);

sentry.captureMessage("error init", {
    level: 'error'
});

sentry.captureMessage("warning init", {
    level: 'warning'
});

sentry.captureMessage("info init", {
    level: 'info'
});

sentry.captureMessage("debug init", {
    level: 'debug'
});

sentry.captureMessage("fatal init", {
    level: 'fatal'
});

module.exports.error = function (msg) {
    return sentry.captureMessage(msg, {
        level: 'error'
    });
};

module.exports.warning = function (msg) {
    return sentry.captureMessage(msg, {
        level: 'warning'
    });
};

module.exports.info = function (msg) {
    return sentry.captureMessage(msg, {
        level: 'info'
    });
};

module.exports.debug = function (msg) {
    return sentry.captureMessage(msg, {
        level: 'debug'
    });
};

module.exports.fatal = function (msg) {
    return sentry.captureMessage(msg, {
        level: 'fatal'
    });
};

module.exports.middleware = raven.middleware.express(SENTRY_DSN);
