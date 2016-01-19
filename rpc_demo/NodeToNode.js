/**
 * Created by Administrator on 2015/11/12.
 */

var jsonrpc = require('multitransport-jsonrpc'); // Get the multitransport JSON-RPC suite
var cityCtl = require("./controller/city_controller.js");
var Server = jsonrpc.server; // The server constructor function
var Client = jsonrpc.client; // The client constructor function

var ServerHttp = jsonrpc.transports.server.http; // The server HTTP transport constructor function
var ServerTcp = jsonrpc.transports.server.tcp; // The server TCP transport constructor function
//var ServerMiddleware = jsonrpc.transports.server.middleware; // The server Middleware transport constructor function (for Express/Connect)
//var Loopback = jsonrpc.transports.shared.loopback; // The Loopback transport for mocking clients/servers in tests

var ClientHttp = jsonrpc.transports.client.http;
var ClientTcp = jsonrpc.transports.client.tcp;

// Setting up servers
var jsonRpcHttpServer = new Server(new ServerHttp(8000), {
    loopback: function (obj, callback) {
        callback(undefined, obj);
    },
    cityinfo: function (obj, callback) {
        cityCtl.mrpcGet(obj, callback)
    }
});

//var jsonRpcTcpServer = new Server(new ServerTcp(8001), {
//    loopback: function (obj, callback) {
//        callback(undefined, obj);
//    }
//});

//var express = require('express');
//var app = express();
//var bodyParser = require('body-parser');
//
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: false}));
//
//var jsonRpcMiddlewareServer = new Server(new ServerMiddleware(), {
//    loopback: function(obj, callback) { callback(undefined, obj); }
//});
//app.use('/rpc', jsonRpcMiddlewareServer.transport.middleware);
//app.listen(8002);

//var loopback = new Loopback();
//var jsonRpcLoopbackServer = new Server(loopback, {
//    loopback: function(obj, callback) { callback(undefined, obj); }
//});

// Setting up and using the clients

// Either explicitly register the remote methods
var jsonRpcHttpClient = new Client(new ClientHttp('localhost', 8000));
jsonRpcHttpClient.register('loopback');
jsonRpcHttpClient.register("cityinfo");

//jsonRpcHttpClient.loopback('foo', function (err, val) {
//    console.log(val); // Prints 'foo'
//});
console.time("1000 times");
for (var i = 0; i < 1000; i++) {
    (function a(obj) {
        jsonRpcHttpClient.cityinfo(obj, function (err, result) {
            if(err) return;
            //console.log(result.length);
            console.timeEnd("1000 times");
        })
    })(i);
}

// Or wait for the "auto-register" functionality do that for you
//new Client(new ClientTcp('localhost', 8001), {}, function(jsonRpcTcpClient) {
//    jsonRpcTcpClient.loopback('foo', function(err, val) {
//        console.log(val); // Prints 'foo'
//    });
//});

//var jsonRpcExpressClient = new Client(new ClientHttp('localhost', 8002, { path: '/rpc' }));
//jsonRpcExpressClient.register('loopback');
//jsonRpcExpressClient.loopback('foo', function(err, val) {
//    console.log(val); // Prints 'foo'
//});
//
//new Client(loopback, {}, function(jsonRpcLoopbackClient) {
//    jsonRpcLoopbackClient.loopback('foo', function(err, val) {
//        console.log(val); // Prints 'foo'
//    });
//});

// The server can run multiple transports simultaneously, too
//var jsonRpcMultitransportServer = new Server([new ServerTcp(9000), new ServerHttp(9090)], {
//    loopback: function(obj, callback) { callback(undefined, obj); }
//});
//var client1 = new Client(new ClientTcp('localhost', 9000));
//var client2 = new Client(new ClientHttp('localhost', 9090));
