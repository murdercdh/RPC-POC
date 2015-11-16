/**
 * Created by Administrator on 6/2/2015.
 */
var config = {

    APP_NAME: process.env.APP_NAME || 'rpc',

    MysqlSettings:{
        connectionLimit: 10,
        host: '101.200.220.24',
        port: '8111',
        user: 'root',
        password: '123456',
        database: 'rrc_front',
        multipleStatements: true
    },
    MongoSettings: {
        mongodb: "mongodb://localhost:27017/rpc",
        mongodbName: "rpc"
    },
    RedisSettings: {
        host: "127.0.0.1",
        port: 6379,
        expires: 60 * 60
    },
    TokenSettings: {
        TokenSaveDays: '90d',
        TokenSavePeriod: 90
    },

    WECHAT_FITCAMP_APP_ID: '',
    WECHAT_FITCAMP_APP_SECRET: '',
    WECHAT_FITCAMP_MCHID: "",

    MAX_LOGIN_ATTEMPTS: 500,
    DefaultPassword: "",
    OAUTH_TYPE: {
        WECHAT: "wechat",
        WEIBO: "weibo"
    },

    SYSTEM_SECRET: "rjfittime_key",
    PHONE_CODE_EXPIRE: "120",
    SERVER_URI: "http://localhost:9003",//"http://ppt.rjfittime.com",//"http://localhost:9001"//"https://oauthtest.rjft.net"////https://oauth.rjft.net
    FORWARD_PROXY_URI: "https://api.rjft.net",//"https://test.rjft.net"
    OAUTH_SERVER_URI: "http://internal-nginx.rjft.net",
    SENTRY_DSN: "http://17ec14e874bf4be1ba520f74069d77b5:415f305b5d1e49ec9bb8d5e615eed982@dev.rjft.net/4",

    QINIU_ACCESS_KEY: '',
    QINIU_SECRET_KEY: '',
    QINIU_BUCKET_NAME: '',

    AUTO_GROUP_SIZE:15,

    GET_WECHAT_ACCESS_TOKEN: "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s",
    GET_JSAPI_TICKET: "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=%s&type=jsapi"
}

if (process.env.NODE_ENV == "production") {
    //config.MongoSettings.mongodb = "mongodb://mongodb.rjft.net:27017,mongodb-01.rjft.net:27017/fit_camp?replset=rs0&readPreference=nearest";
    //config.RedisSettings.host = "user-cache.rjft.net";
}

module.exports = config;
global.config = config;
