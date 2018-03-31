var config = require('./config');
var mint = require('./mint');
var log = require('log')(config.log);
var express = require('express');
var compression = require('compression');
var Account = require('./account')

var router = express.Router();

var accounts = {}
Object.keys(config.accounts).forEach(function(id) {
  accounts[id] = Account(id)
})

router.get('/', function(req, res) {
  res.json({ message: 'hooray! welcome to our api!' });
});

router.get('/account/:id/income', function(req, res) {
  accounts[req.params.id].getIncome().then(function(data) {
    res.status(200).send(data);
  }).fail(function(err) {
    console.log(err);
    res.status(500).send({
      error: err
    });
  });
});

router.get('/account/:id/expense', function(req, res) {
  accounts[req.params.id].getExpense().then(function(data) {
    res.status(200).send(data);
  }).fail(function(err) {
    console.log(err);
    res.status(500).send({
      error: err
    });
  });
});

router.get('/budget', function(req, res) {

  mint.getBudget().then(function(data) {
    res.status(200).send(data);
  }).fail(function(err) {
    res.status(500).send({
      error: err
    });
  });

});

router.get('/assets', function(req, res) {
  mint.getTrend({
    reportType: 'AT',
    accounts: {
      groupIds: ['CS'],
      accountIds: [],
      count: 16
    }
  }).then(function(data) {
    res.status(200).send(data);
  }).fail(function(err) {
    res.status(500).send({
      error: err
    });
  });
});

router.get('/categories', function(req, res) {
  mint.getCategories().then(function(data) {
    res.status(200).send(data);
  }).fail(function(err) {
    res.status(500).send({
      error: err
    });
  });
});

router.get('/networth', function(req, res) {
  mint.getTrend().then(function(data) {
    res.status(200).send(data);
  }).fail(function(err) {
    res.status(500).send({
      error: err
    });
  });
});

router.get('/transactions', function(req, res) {
  var start = new Date();
  start.setDate(new Date().getDate() - 1);
  mint.getTransactions({
    startDate: start.toLocaleDateString('en-US'),
    endDate: new Date().toLocaleDateString('en-US')
  }).then(function(data) {
    res.status(200).send(data);
  }).fail(function(err) {
    res.status(500).send({
      error: err
    });
  });
});

var app = express();

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  if ('OPTIONS' === req.method || '/health_check' === req.path) {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(compression());
app.use(express.static('www'));
app.use('/api', router);

var port = config.port || process.env.PORT || 8080;
app.listen(port, function() {
  log.info('API listening on port:', port);
}).on('error', function(err) {
  log.error(err);
});
