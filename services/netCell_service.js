// 导入MySQL模块


var sd = require('silly-datetime');
var async = require("async");
var mysql = require('mysql');
var app = require('../app');
var uuid = require('node-uuid');


var mysqlPoll = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '198226198484dq',
    database: 'bg2020_data',
    port: 3306
});



/**
 * 保存单个测试报告
 * @param value
 * @param cb
 */

exports.save_report = function (value, cb) {


    var sql_check = 'INSERT INTO check_report(check_id,network_operator_name,address,eci,tac,bsss,gps,network_type,phone_type,coll_time,download_speed,upload_speed,bsss_check,datetime_check,ECI_check,gps_check,network_type_check,phonenumber,TAC_check,url_check,pcm_url,username)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';


    var sql_test = "INSERT INTO test_requirement(test_id,verify_bsss_value,verify_datetime_value,verify_ECI_value,verify_gps_value,verify_network_type_value,verify_TAC_value,verify_url_value,verify_system_mark)VALUES(?,?,?,?,?,?,?,?,?)";


    var sql_is_has_test = "SELECT * FROM  test_requirement WHERE test_id='" + value.test_id + "'";

    var sql_is_has_check = "SELECT * FROM check_report WHERE check_id='" + value.check_id + "'";

    var test_data = [value.test_id, value.verify_bsss_value, value.verify_datetime_value, value.verify_ECI_value, value.verify_gps_value, value.verify_network_type_value, value.verify_TAC_value, value.verify_url_value, value.verify_system_mark];
    var check_data = [value.check_id, value.network_operator_name, value.address, value.eci, value.tac, value.bsss, value.gps, value.network_type, value.phone_type, value.coll_time, value.download_speed, value.upload_speed, value.bsss_check, value.datetime_check, value.ECI_check, value.gps_check, value.network_type_check, value.phonenumber, value.TAC_check, value.url_check, value.test_id+"&"+value.check_id+".pcm.wav", value.username];

    /**
     * 该报告已上传成功，请勿重复上传 2
     * 该报告上传成功 1
     * 上传失败：
     * 未知失败 错误码0
     * 由于获取数据库接口导致失败 错误码401
     * test_id查询出错 402
     * test数据保存出错 403
     * check_id查询出错 404
     * check数据保存出错 405
     * 保存id出错 406
     *
     * @type {number}
     */
    var flag = -1;

    mysqlPoll.getConnection(function (err, con) {
        if (err) {
            app.logger.info("save_test_data" + err);
            flag = 401;
            cb(flag);
        }
        con.query(sql_is_has_test, [], function (err, row) {
            if (err) {
                app.logger.info("query_test_id:" + err);
                flag = 402;
                con.release();
                cb(flag);
            }
            else {
                /**
                 * test记录存在
                 */
                if (row[0]) {
                    /**
                     * 判断checkid是否存在
                     */

                    con.query(sql_is_has_check, [], function (err, row) {
                        if (err) {
                            app.logger.info("query_check_id:" + err);
                            flag = 404;
                            con.release();
                            cb(flag);
                        } else {
                            /**
                             * 存在就不做任何操作，返回即可
                             */
                            if (row[0]) {
                                flag = 2;
                                con.release();
                                cb(flag);
                            } else {
                                /**
                                 * 不存在就保存check数据
                                 */
                                con.query(sql_check, check_data,
                                    function (err, rows) {
                                        if (err) {
                                            app.logger.info("save_check_data:" + err);
                                            flag = 405;
                                            con.release();
                                            cb(flag);
                                        }
                                        else {
                                            /**
                                             * 并且将checkid与testid写入关系表
                                             */
                                            con.query("INSERT INTO test_and_check (test_id_f,check_id_f) VALUES (?,?)", [value.test_id, value.check_id], function (err, rows) {
                                                if (err) {
                                                    app.logger.info("save_id:" + err);
                                                    flag = 406;
                                                } else {
                                                    flag = 1;
                                                }
                                                con.release();
                                                cb(flag);
                                            });

                                        }
                                    });

                            }
                        }

                    });

                }
                /**
                 * test记录不存在，就保存test数据
                 */
                else {
                    con.query(sql_test, test_data, function (err, row) {
                        if (err) {
                            app.logger.info("save_test_data" + err);
                            flag = 403;
                            con.release();
                            cb(flag);
                        }
                        /**
                         * 查看check记录是否存在
                         */

                        con.query(sql_is_has_check, [], function (err, row) {
                            if (err) {
                                app.logger.info("query_check_id:" + err);
                                flag = 404;
                                con.release();
                                cb(flag);
                            } else {
                                /**
                                 * 存在就返回
                                 */
                                if (row[0]) {
                                    flag = 2;
                                    con.release();
                                    cb(flag);
                                } else {
                                    /**
                                     * 不存在就保存check数据
                                     */
                                    con.query(sql_check, check_data,
                                        function (err, rows) {
                                            if (err) {
                                                app.logger.info("save_check_data:" + err);
                                                flag = 405;
                                                con.release();
                                                cb(flag);
                                            }
                                            /**
                                             * 保存成功后在关系表中加入新的记录
                                             */
                                            else {
                                                con.query("INSERT INTO test_and_check (test_id_f,check_id_f) VALUES (?,?)", [value.test_id, value.check_id], function (err, rows) {
                                                    if (err) {
                                                        app.logger.info("save_id:" + err);
                                                        flag = 406;
                                                    } else {
                                                        flag = 1;
                                                    }
                                                    con.release();
                                                    cb(flag);
                                                });

                                            }
                                        });
                                }
                            }
                        });
                    });

                }
            }
        });


    });
};












