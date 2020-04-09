var express = require('express');
var aes = require('../services/aes');
var service = require('../services/netCell_service');
var app = require('../app');
var crypto = require('crypto');
var fs = require("fs");
var path = require("path");


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
        var current_file_path = path.join("../uploads/", value.test_id + "&" + value.check_id + ".pcm.wav");

        app.logger.info("come in test_server");
        service.save_report(value, function (flag) {
            res.send(flag + "");
        })

    } catch (err) {
        app.logger.info("test_server-" + err);
        res.send('-1');
    }
});


var ftp_service = require("../services/ftp_service");
var config = require('../ConnConfig').config;
const multer = require('multer');
var upload = multer({dest: 'uploads/'}); // 文件储存路径
router.post('/uploader', upload.single('avatar'), function (req, res, next) {
    var filename = req.file.originalname;
    console.log(req.file.path);
    fs.exists(req.file.path, function (exists) {
        if (exists) {
            fs.rename(req.file.path, "uploads/" + filename, function (err) {
                if (err) {
                    app.logger.info(req.file.originalname + ":file_upload:文件更名出现异常");
                    res.send("301")
                } else {
                    res.send("300");
                    app.logger.info(req.file.originalname + ":file_upload:本部文件上传完成");

                    var ids = filename.split(".")[0].split("&");
                    var test_id = ids[0];
                    var check_id = ids[1];
                    var localfile_url="uploads/" + filename;
                    if (fs.existsSync(localfile_url)) {
                        service.upload_wav_data(localfile_url,function (ret) {
                            if(ret){
                                service.upload_json_data(test_id, check_id, function (err,res) {
                                    if (err) {
                                        service.write_upload_failure_list(test_id, check_id, 'json');
                                    } else {
                                        if(res.result!="1"){
                                            service.write_upload_failure_list(test_id, check_id, 'json');
                                            app.logger.info("json数据透传失败：")
                                            app.logger.info(res)
                                        }else{
                                            app.logger.info("json数据透传成功：")
                                            app.logger.info(res)
                                        }
                                    }
                                });


                            }else{
                                service.write_upload_failure_list(test_id,check_id,'wav');
                            }
                        })


                    } else {
                        console.log("录音文件不存在："+localfile_url)
                        service.write_upload_failure_list(test_id,check_id,'wav');
                    }



                }
            })
        } else {
            app.logger.info("file_upload:文件上传失败，文件上传后确不存在");
            res.send("302")
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


function do_conn_data(value) {
    var current_file = "../uploads/" + value.test_id + "&" + value.check_id + ".pcm.wav";
    console.log(current_file);
    fs.exists(current_file, function (exists) {
        if (exists) {
            service.upload_json_data(value, function (flag) {
                app.logger.info("data conn:" + flag)
            })

            // service.upload_wav_data(current_file,function (up_flag) {
            //
            //
            //     if(up_flag==1){
            //         service.upload_json_data("",function (flag) {
            //
            //
            //         })
            //     }else{
            //         /**
            //          * 录音文件上传成功才进行json上传
            //          */
            //     }
            // });

        } else {
            app.logger.info("没有对应文件")
        }

    });


}

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







