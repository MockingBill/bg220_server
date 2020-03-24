var express = require('express');
var aes = require('../services/aes');
var service = require('../services/netCell_service');
var app = require('../app');
var crypto = require('crypto');
var fs = require("fs");


var router = express.Router();

var KEY = "bXlEZWFyTFdX132df6bVGhlV2FudGVy";
var vi = new Buffer("1234567812345678");
var SALT = "QWER!@#$ASDF";

/**
 * 请求解密及token认证
 */
router.use(function (req, res, next) {
    if (req.method == "GET" || req.method == "get") {
        next();
    }
    else if (req.method == "post" || req.method == "POST") {
        try {

            var token = req.headers.token;
            if ((getMd5() + "1366") == token) {
                next();
            } else {
                var postValue = Object.keys(req.body)[0];
                if ((typeof postValue) === "string") {
                    var value = aes.decrypt(KEY, vi, postValue);
                    console.log(value);
                    value = JSON.parse(value);
                    req.body = value;


                    //请求合法性判断
                    var headToken = req.headers.authorization;

                    // var appToken=value.token;
                    var serverToken = getMd5();
                    if (headToken == serverToken) {
                        next();
                    } else {
                        res.send("0");
                    }
                } else {
                    res.send("0");
                }

            }


        } catch (err) {
            app.logger.info(err);
            res.send("0");
        }
    } else {
        res.render("error", {message: "404"});
    }
});


/**
 * 上传测试结果
 *
 */
router.post('/test_server', function (req, res, next) {
    try {
        var value = req.body;
        console.log("test_server");
        service.save_report(value, function (flag) {
            res.send(flag + "")
        })

    } catch (err) {
        app.logger.info("test_server-" + err);
        res.send('-1');
    }
});

const multer = require('multer');

var upload = multer({dest: 'uploads/'}); // 文件储存路径
router.post('/uploader', upload.single('avatar'), function (req, res, next) {
    fs.exists(req.file.path, function (exists) {
        if (exists) {
            fs.rename(req.file.path, "uploads/" + req.file.originalname, function (err) {
                if (err) {
                    res.send("300")
                } else {
                    res.send("302")
                }
            })
        } else {
            res.send("301")
        }


    });
});


/**
 * compire version number
 * check version for download
 */
router.post('/getCheckVersion', function (req, res, next) {
    var data = aes.aesEncrypt(JSON.stringify({

        appName: "bg2020",

        serverVersion: "1.0",

        updateUrl: "http://192.168.1.105:5000/bg2020.apk",

        upgradeinfo: "有新的更新,请安装。"
    }), KEY);
    res.send(data);
});


function getMd5() {
    Date.prototype.format = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1,                 //月份
            "d+": this.getDate(),                    //日
            "h+": this.getHours(),                   //小时
            "m+": this.getMinutes(),                 //分
            "s+": this.getSeconds(),                 //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    };

    var str = new Date().format("yyyy-MM-dd-hh");
    try {
        return crypto.createHash('md5').update(SALT + str + SALT).digest('hex');
    } catch (err) {
        app.logger.info("create md5 token-" + err);
        return "0";
    }

}


module.exports = router;







