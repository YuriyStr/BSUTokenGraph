const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const checker = require('./checker');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index', {title: 'Graph builder'});
});

app.get('/balances', (req, res) => {
   let address = req.query.address;
   checker.getBalanceChanges(address).then(() => {
       sendBalance(req, res);
   });
});

app.get('/updatedBalances', (req, res) => {
   sendBalance(req, res);
});

function sendBalance(req, res) {
    let timestamps = Array.from(checker.getBalances().keys());
    let balanceValues = Array.from(checker.getBalances().values());
    res.json( { dates: timestamps, balanceValues: balanceValues });
}

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
