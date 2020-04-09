var config={
    mysql_config:{
        host: 'mysqlIP',
        user: 'root',
        password: '198226198484dq',
        database: 'bg2020_data',
        port: 3306
    },
    // ftp_config: {
    //     host: "10.211.55.8",
    //     user: 'ftp_user',
    //     password: '198226198484dq'
    // },
    ftp_config: {
        host: "10.211.55.8",
        user: 'ftptest1',
        prot:60022,
        password: 'ftptest1'
    },


    json_upload_url:"http://121.28.209.22:7899/EOM_CM_MANAGE/EOM/dailtestFdbk",
    json_upload_host:'121.28.209.22',
    json_upload_json_upload_port:7899,
    json_upload_path:'/EOM_CM_MANAGE/EOM/dailtestFdbk',
    ftp_path:"/home/ftptest1"
};
exports.config=config;




