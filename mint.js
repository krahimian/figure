// Reference & Credit to - https://github.com/dhleong/pepper-mint

var config = require('./config');
var request = require('request');
var merge = require('merge');
var Q = require('q');

var URL_BASE = 'https://wwws.mint.com/';
var USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36';
var BROWSER = 'chrome';
var BROWSER_VERSION = 35;
var OS_NAME = 'mac';

var j = request.jar();
request = request.defaults({ jar : j });

var token, requestId = 42;

function _random() {
    return new Date().getTime();
}

/** wrap a Promise with JSON body parsing on success */
function _jsonify(promise) {
    return promise.then(function(body) {
        if (~body.indexOf('Session has expired.')) {
            throw new Error('Session has expired');
	}

        try {
            return JSON.parse(body);
        } catch (e) {
            console.error('Unable to parse', body);
            throw e;
        }
    });
}

function _login() {

    console.log('logging in');

    return _form('getUserPod.xevent', {
	username: config.email
    }).then(function(json) {

	console.log(json);

	// save the pod number (or whatever) in a cookie
	var cookie = request.cookie('mintPN=' + json.mintPN);
	j.setCookie(cookie, URL_BASE);

	// finally, login
	return _form('loginUserSubmit.xevent', {
	    username: config.email,
	    password: config.password,
	    task: 'L',
	    browser: BROWSER,
	    browserVersion: BROWSER_VERSION,
	    os: OS_NAME
	});

    }).then(function(json) {
	if (json.error && json.error.vError)
	    throw new Error(json.error.vError.copy);

	if (!(json.sUser && json.sUser.token))
	    throw new Error('Unable to obtain token');

	token = json.sUser.token;
	console.log('token: ', token);

    }).fail(function(err) {
	throw err;
    });
}

function _form(url, form) {
    return _jsonify(Q.Promise(function(resolve, reject) {	    
	var fullUrl = URL_BASE + url;
	request({
	    url: fullUrl,
	    method: 'POST',
	    form: form,
	    headers: {
		Accept: 'application/json',
		'User-Agent': USER_AGENT,
		'X-Request-With': 'XMLHttpRequest',
		'X-NewRelic-ID': 'UA4OVVFWGwEGV1VaBwc=',
		'Referrer': 'https://www.mint.com/login.event?task=L&messageId=1&country=US&nextPage=overview.event'
	    }
	}, function(err, response, body) {
	    if (err) {
		reject(err);
		return;
	    }

	    if (response.statusCode > 204) {
		var error = new Error('Failed to load ' + fullUrl);
		error.response = response;
		error.body = body;
		reject(error);
		return;
	    }
	    
	    resolve(body);

	});
    }));
}

function _jsonForm(json) {
    var reqId = '' + requestId++;
    json.id = reqId;
    var url = 'bundledServiceController.xevent?legacy=false&token=' + token;

    return _form(url, {
	input: JSON.stringify([json]) // weird
    }).then(function(resp) {
	if (!resp.response) {
	    var task = json.service + '/' + json.task;
	    throw new Error('Unable to parse response for ' + task);
	}

	return resp.response[reqId].response;
    });
}

function _trendForm(json) {
    var url = 'trendData.xevent';

    return _form(url, {
	searchQuery: JSON.stringify(json), // weird
	token: token
    }).then(function(resp) {

	return resp;
    });
}

function _get(url, qs) {
    return Q.Promise(function(resolve, reject) {
        var fullUrl = URL_BASE + url;
        var args = { url: fullUrl };

        if (qs) args.qs = qs;

        request(args, function(err, response, body) {
            if (err) {
		reject(err);
		return;
	    }

            if (200 != response.statusCode) {
                reject(new Error('Failed to load ' + fullUrl));
		return;
	    }

            resolve(body);
        });
    });
}

function _getJson(url, qs) {
    return _jsonify(_get(url, qs));
}

function _getJsonData(args) {
    if ('string' === typeof(args))
        args = {task: args};
    args.rnd = _random();

    return _getJson('getJsonData.xevent', args).then(function(json) {
        return json.set[0].data;
    });

}

function _getBudget(args) {
    args.rnd = _random();

    return _getJson('getBudget.xevent', args).then(function(json) {
	return json.data;
    });
}

var MINT = {
    getAccounts: function() {
	return _jsonForm({
            args: {
		types: [
                    'BANK', 
                    'CREDIT', 
                    'INVESTMENT', 
                    'LOAN', 
                    'MORTGAGE', 
                    'OTHER_PROPERTY', 
                    'REAL_ESTATE', 
                    'VEHICLE', 
                    'UNCLASSIFIED'
		]
            }, 
            service: 'MintAccountService', 
            task: 'getAccountsSortedByBalanceDescending'
	});
    },
    getCashFlow: function() {
	return _jsonForm({
	    args: {
		numMonths: 6
	    },
	    service: 'MintTransactionService',
	    task: 'getCashFlow'
	});
    },
    getTransactions: function(args) {
	
	args = args || {};
	var params = {
	    offset: 0,
	    comparableType: 8, // ?
	    acctChanged: 'T',  // ?
	    task: 'transactions'
	};

	var obj = merge(params, args);

	return _getJsonData(obj);

    },
    getCategories: function() {
	return _getJsonData('categories');
    },
    getTags: function() {
	return _getJsonData('tags');
    },
    getBudget: function(args) {
	var now = new Date();
	var month = now.getMonth() + 1;
	var year = now.getFullYear();

	var date = month + '/01/' + year;

	args = args || {};
	var params = {
	    startDate: date,
	    endDate: date
	};

	var obj = merge(params, args);

	console.log(obj);

	return _getBudget(obj);
    },
    getTrend: function(args) {
	args = args || {};
	var params = {
	    reportType: 'NW',
	    comparison:'',
	    accounts: {
		groupIds:['AA'],
		accountIds:[]
	    },
	    dateRange:{
		period: {
		    label:'This year',
		    value:'TY'
		},
		start: '1/1/' + new Date().getFullYear(),
		end: new Date().toLocaleDateString('en-US')
	    },
	    categoryTypeFilter:'all'
	};

	var obj = merge(params, args);

	console.log(obj);

	return _trendForm(obj);
    }
};

_login();

module.exports = MINT;
