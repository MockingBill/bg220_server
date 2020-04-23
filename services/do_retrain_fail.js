let Client = require('ftp');
let config = require('../ConnConfig').config;
var c = new Client();
let app = require('../app');
var mysql = require('mysql');
var mysqlPoll = mysql.createPool(config.mysql_config);
var http = require('http');
var ftp_service = require("./ftp_service");
var path = require('path');
var date = require("silly-datetime");


/**
 * 自动按周期执行失败透传重传机制
 */

var time_interval = 1000 * 60 * 5;

setInterval(function () {
    do_main();
}, time_interval);

function do_main() {
    mysqlPoll.getConnection(function (err, con) {
        if (err) {
            console.log("query_fail_list" + err);
        } else {
            var sql = "select * from failure_list";
            con.query(sql, [], function (err, row) {
                con.release();
                var loop_num = row.length;
                var loop_item = 0;
                var interval = 1;
                (function schedule() {
                    setTimeout(function do_it() {
                        if (loop_item < loop_num) {
                            var test_id = row[loop_item].test_id;
                            var check_id = row[loop_item].check_id;
                            var type = row[loop_item].type;
                            var local_url = test_id + "&" + check_id + ".pcm.wav";
                            if (type == 'json') {
                                do_json_upload(test_id, check_id, function (error) {
                                    if (error) {
                                        console.log(error);
                                        console.log(test_id+" "+check_id+" json失败");
                                        console.log("--------------*****-----------------------*****------------------");
                                    } else {
                                        console.log(test_id+" "+check_id+" json成功");
                                        do_delete(test_id, check_id, type, function (err) {
                                            if (err) {

                                            } else {
                                                console.log("删除失败记录成功");
                                            }

                                        });
                                        console.log("--------------*****-----------------------*****------------------");
                                    }
                                    loop_item++;
                                    schedule();
                                })
                            } else if (type == 'wav') {
                                do_wav_upload(local_url, function (err) {
                                    if (err) {
                                        console.log(local_url + " 失败");
                                        console.log("--------------*****-----------------------*****------------------");
                                    } else {
                                        console.log(local_url + " 成功");
                                        do_delete(test_id, check_id, type, function (err) {
                                            if (err) {

                                            } else {
                                                console.log("删除失败记录成功");
                                            }
                                        });
                                        console.log("--------------*****-----------------------*****------------------");

                                    }
                                    loop_item++;
                                    schedule();
                                })
                            } else {
                                loop_item++;
                                schedule();
                            }
                        } else {
                            console.log("本期循环结束。")
                        }
                    }, interval)
                }());
            });
        }
    });
}


function do_json_upload(test_id, check_id, cb) {
    return new Promise(function (resolve, reject) {
        sql = "select * from check_report where check_id=?";
        mysqlPoll.getConnection(function (err, con) {
            if (err) {
                console.log("upload_json_data_获取连接失败" + err);
                cb(err);
            } else {
                con.query(sql, [check_id], function (err, row) {
                    con.release();
                    if (err) {
                        console.log("upload_json_data_数据查询失败" + err);
                        cb(err);
                    }
                    else {
                        if (row != undefined && row.length > 0) {
                            resu_data = row[0];
                            var content = JSON.stringify({
                                'test_id': test_id,
                                'check_id': check_id,
                                'address': resu_data.address,
                                'eci': resu_data.eci,
                                'tac': resu_data.tac,
                                'bsss': resu_data.bsss,
                                'gps': resu_data.gps,
                                'network_type': resu_data.network_type,
                                'phone_type': resu_data.phone_type,
                                'coll_time': resu_data.coll_time,
                                'download_speed': resu_data.download_speed,
                                'upload_speed': resu_data.upload_speed,
                                'pcm_filepath': resu_data.pcm_filepath,
                                'username': resu_data.username,
                                'phonenumber': resu_data.phonenumber,
                                'bsss_check': resu_data.bsss_check,
                                'network_type_check': resu_data.network_type_check,
                                'gps_check': resu_data.gps_check,
                                'ECI_check': resu_data.ECI_check,
                                'TAC_check': resu_data.TAC_check,
                                'datetime_check': resu_data.datetime_check,
                                'url_check': resu_data.url_check
                            });
                            var http_config = {
                                host: config.json_upload_host,
                                port: config.json_upload_json_upload_port,
                                path: config.json_upload_path,
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            };
                            var req = http.request(http_config, function (res) {
                                if (res.statusCode == 200) {
                                    var _data = '';
                                    res.on('data', function (chunk) {
                                        _data += chunk;
                                    });
                                    res.on('end', function () {
                                        _data = JSON.parse(_data);
                                        console.log("类型:", typeof _data);
                                        if (_data.result && _data.result == "1") {
                                            console.log("数据透传成功:", _data);
                                            cb(null)
                                        } else {
                                            console.log("数据透传失败:", _data);
                                            cb("error");
                                        }

                                    });


                                } else {
                                    console.log("透传接口返回响应码:", res.statusCode);
                                    cb("error");
                                }
                            });
                            req.on('error', function (e) {
                                cb(e)
                            });
                            req.write(content);
                            req.end();
                        } else {
                            console.log("upload_json_data_查询结果为空" + err);
                            cb("error");
                        }
                    }

                });
            }
        });
    });
}


function do_wav_upload(url, cb) {
    var dir_name = path.join(config.ftp_path, "/dir_" + date.format(new Date(), 'YYYYMMDD'));
    var local_file = url;
    var remote_file = path.join(dir_name, path.basename(local_file));

    ftp_service.about_dir(dir_name, function (flag) {
        if (flag) {
            console.log("localfile:" + local_file);
            console.log("remote_file:" + remote_file);

            ftp_service.do_put(local_file, remote_file, function (err) {
                if (err) {
                    console.log(path.basename(url) + " :ftp上传失败：" + err);
                    cb(true);
                } else {
                    console.log(path.basename(url) + " :ftp上传成功");
                    cb(false);
                }
            });
        } else {
            console.log(path.basename(url) + " :目录检测失败");
            cb(true);
        }
    });
}

function do_delete(test_id, check_id, type, cb) {
    mysqlPoll.getConnection(function (err, con) {
        if (err) {
            console.log("删除失败记录失败" + err);
            cb(err);
        } else {
            con.query("delete from failure_list where test_id=? and check_id=? and type=?", [test_id, check_id, type], function (err, row) {
                con.release();
                if (err) {
                    console.log("删除失败记录失败" + err);
                    cb(err);
                } else {
                    cb(false);
                }
            })
        }

    })

}