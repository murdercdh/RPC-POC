/**
 * Created by donegalchen on 7/29/15.
 */
var LEVEL_ERROR, LEVEL_INFO, LEVEL_LOG, LEVEL_TRACE, LEVEL_WARN, buildString, oldError, oldInfo, oldLog, oldTrace, oldWarn, sentry, util,
    slice = [].slice;

util = require('util');

sentry = require('../middleware/sentry');

oldTrace = console.trace;

oldLog = console.log;

oldInfo = console.info;

oldWarn = console.warn;

oldError = console.error;

LEVEL_TRACE = module.exports.LEVEL_TRACE = '<7>';

LEVEL_LOG = module.exports.LEVEL_LOG = '<6>';

LEVEL_INFO = module.exports.LEVEL_INFO = '<5>';

LEVEL_WARN = module.exports.LEVEL_WARN = '<4>';

LEVEL_ERROR = module.exports.LEVEL_ERROR = '<3>';

buildString = function() {
    var args, i, len, ref, x, z;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    z = [];
    for (i = 0, len = args.length; i < len; i++) {
        x = args[i];
        if ((ref = typeof x) === 'object' || ref === 'function') {
            z.push(util.inspect(x, false, null));
        } else {
            z.push(x + '');
        }
    }
    return z.join(', ');
};

console.trace = function() {
    var args, msg;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    msg = buildString.apply(null, args);
    oldTrace(msg.replace(/(^|\n)/g, function(x) {
        return x + LEVEL_TRACE;
    }));
    return sentry.debug(msg);
};

console.log = function() {
    var args, msg;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    msg = buildString.apply(null, args);
    return oldLog(msg.replace(/(^|\n)/g, function(x) {
        return x + LEVEL_LOG;
    }));
};

console.info = function() {
    var args, msg;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    msg = buildString.apply(null, args);
    oldInfo(msg.replace(/(^|\n)/g, function(x) {
        return x + LEVEL_INFO;
    }));
    return sentry.info;
};

console.warn = function() {
    var args, msg;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    msg = buildString.apply(null, args);
    oldWarn(msg.replace(/(^|\n)/g, function(x) {
        return x + LEVEL_WARN;
    }));
    return sentry.warning(msg);
};

console.error = function() {
    var args, msg;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    msg = buildString.apply(null, args);
    oldError(msg.replace(/(^|\n)/g, function(x) {
        return x + LEVEL_ERROR;
    }));
    return sentry.error(msg);
};