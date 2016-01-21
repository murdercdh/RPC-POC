# RPC-POC

[![Build Status](https://travis-ci.org/murdercdh/RPC-POC.svg?branch=master)](https://travis-ci.org/murdercdh/RPC-POC)
[![node version][node-image]][node-url]

其实这就是一个简单的RPC原型验证，JSON-RPC

    数据协议格式JSON，
    传输协议HTTP，

* 第一路径，采用默认的HTTP request进行内部的api调用，一般云服务内网万兆，所以网络开销可以忽略不计，各个语言对restful的实现基本都ok.
* 第二路径，面向业务平台的核心RPC服务调用，目前rpc中心rpc选型还未完毕，原型里面nodejs推荐采用gRpc框架，（考虑点，go 1.5的稳定，以及后续密集业务数据处理，多种语言的接入比较完备）
* 第三路径，面向终端的公有api的调用，主流服务目前基本以api形式提供给三端使用，（web，Android，ios），对tps要求较高，对于原生nodejs 并发行api组件的调用采用uber开源的mult-rpc框架，比路径1理论上要快10倍。
