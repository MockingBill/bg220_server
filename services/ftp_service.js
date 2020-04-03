let config = require('../ConnConfig').config;
let app = require('../app');
let fs = require("fs");
let Client = require('ftp');
let path = require('path');

function is_exsit_date_dir(dir_name, cb) {
    var c = new Client();
    c.connect(config.ftp_config);
    c.on('ready', function () {
        c.list(function (err, list) {
            if (err) {
                c.end();
                console.log(err);
                cb(true, false);
            } else {
                flag = false;
                for (var i in list) {
                    if (list[i].name == dir_name && list[i].type == 'd') {
                        flag = true;
                    }
                }
                c.end();
                cb(false, flag)
            }


        });
    });
}
function create_dir(dir_path, cb) {
    var c = new Client();
    c.connect(config.ftp_config);
    c.on('ready', function () {
        c.mkdir(dir_path, true, function (err) {
            if (err) {
                c.end();
                console.log(err);
                cb(true, false);
            } else {
                c.end();
                cb(false, true)
            }


        });
    });
}
exports.do_put = function (local_file, remote_file, cb) {
    var c = new Client();
    c.connect(config.ftp_config);
    c.on('ready', function () {
        c.put(local_file, remote_file, function (err) {
            if (err) {
                c.end();
                console.log(err);
                cb(err);
            } else {
                c.end();
                cb(undefined)
            }
        });
    });

}


exports.about_dir = function (dir_name) {
    is_exsit_date_dir(dir_name, function (err, flag) {
        if (err) {
            console.log(dir_name + ":判断目录是否存在异常")
        } else {
            if (flag) {
                console.log(dir_name + ":目录已存在");
            } else {
                create_dir(dir_name, function (err, flag) {
                    if (err) {
                        console.log(dir_name + ":由于创建目录异常，目录未创建");
                    } else {
                        if (flag) {
                            console.log(dir_name + ":目录不存在，但创建成功");
                        } else {
                            console.log(dir_name + ":目录不存在，创建失败");
                        }
                    }

                })
            }
        }
    });
}











