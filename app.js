var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

app.use(express.static(__dirname + '/public'))

const users = {}

io.sockets.on('connection', (client) => {
    const broadcast = (event, data) => {
        client.emit(event, data)
        client.broadcast.emit(event, data)
    }

    broadcast('user', users)

    client.on('message', (message) => {
        if (users[client.id] !== message.name) {
            users[client.id] = message.name
            broadcast('user', users)
        }
        broadcast('message', message)
    })

    client.on('disconnect', () => {
        delete users[client.id]
        client.broadcast.emit('user', users)
    })
})

module.exports = app;
