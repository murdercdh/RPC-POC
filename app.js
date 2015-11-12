var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
//var sentry = require('./middleware/sentry.js');
//var log = require('./common/log');
var path = require('path');
//var routes = require('./routes/index');
//var users = require('./routes/users');

var app = express();
var apiRouter = require("./routes/api_router.js");

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'html');

// setup statsdKey for req object

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(sentry.middleware);
app.use(logger('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//engine = require('express-dot-engine');
//app.engine('dot', engine.__express);
//app.set('views', './views');
//app.set('view engine', 'dot');
//app.use('/', routes);
//app.use('/users', users);
//app.use("/", apiRouter);
apiRouter(app);
// catch 404 and forward to error handler
app.use(express.static(path.resolve(__dirname, 'public')));

app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        console.log(err);
        console.log(err.stack);
        res.send({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    console.log(err);
    res.send({
        message: err.message,
        error: err
    });
});


module.exports = app;
