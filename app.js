var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var log4js = require('log4js');
var index = require('./routes/index');

var app = express();




log4js.configure({
    "appenders": [
        {
            type: 'console'
        },
        {
            type: 'dateFile',
            filename: './logs/app',
            pattern: '-yyyy-MM-dd.log',
            alwaysIncludePattern: true,
            category: 'app'
        }
    ],
    "replaceConsole": true
});



module.exports.logger = log4js.getLogger('app');

app.use(log4js.connectLogger(this.logger,
    {level: 'ALL', format: ':remote-addr :method :url :status :response-time ms'}
));
process.on('uncaughtException', function (err) {
    this.logger.info('global Exception: ' + err);
});



var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));





// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);



app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});




module.exports = app;



