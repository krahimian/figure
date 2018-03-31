/* Request, Q */
(function (root, factory) {

    root.MINT = factory(root);

})(this, function(root) {

    'use strict';

    var URL_BASE = 'https://wwws.mint.com/';
    var USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36';
    var BROWSER = 'safari';
    var BROWSER_VERSION = '9';
    var OS_NAME = 'iphone';
    var MINT_PN;

    var token, requestId = 42;

    function _merge(a, b) {
	if (a && b) {
	    for (var key in b) {
		a[key] = b[key];
	    }
	}
	return a;
    }

    function _random() {
	return new Date().getTime();
    }

    /** wrap a Promise with JSON body parsing on success */
    function _jsonify(promise) {
	return promise.then(function(body) {

	    if (typeof body === 'object') {
		return body;
	    } else if (~body.indexOf('Session has expired.')) {
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

    function _form(url, form) {
	return _jsonify(Q.Promise(function(resolve, reject) {	    
	    var fullUrl = URL_BASE + url;
	    var headers = {
		Accept: 'application/json',
		'User-Agent': USER_AGENT,
		'X-Request-With': 'XMLHttpRequest',
		'X-NewRelic-ID': 'UA4OVVFWGwEGV1VaBwc=',
		'Referrer': 'https://www.mint.com/login.event?task=L'
	    };

	    if (MINT_PN) headers.Cookie = 'mintPN=' + MINT_PN;

	    Request.post(fullUrl, null, headers, form).error(reject).success(resolve);

	}));
    }

    function _jsonForm(json) {
	var url = 'bundledServiceController.xevent?legacy=false';
	var reqId = '' + requestId++;
	json.id = reqId;	

	return Q.Promise(function(resolve, reject) {
	    var fullUrl = URL_BASE + url;
	    var headers = {
		Accept: 'application/json',
		'User-Agent': USER_AGENT,
		'X-Request-With': 'XMLHttpRequest',
		'X-NewRelic-ID': 'UA4OVVFWGwEGV1VaBwc=',
		Referrer: 'https://www.mint.com/login.event?task=L',
		'Content-Type': 'application/x-www-form-urlencoded',
		Origin: 'https://wwws.mint.com/',
		token: token
	    };

	    Request.post(fullUrl, {
		input: JSON.stringify([json])
	    }, headers, null).error(reject).success(resolve);

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

	return Q.Promise(function(resolve, reject) {
	    var fullUrl = URL_BASE + url;
	    var headers = {
		Accept: 'application/json',
		'User-Agent': USER_AGENT,
		'X-Request-With': 'XMLHttpRequest',
		'X-NewRelic-ID': 'UA4OVVFWGwEGV1VaBwc=',
		'Referrer': 'https://www.mint.com/login.event?task=L',
		'Content-Type': 'application/x-www-form-urlencoded',
		'Origin': 'https://wwws.mint.com/'
	    };

	    Request.post(fullUrl, {
		searchQuery: JSON.stringify(json),
		token: token
	    }, headers, null).error(reject).success(resolve);

	}).then(function(resp) {
	    return resp;
	});
    }

    function _get(url, qs) {
	return Q.Promise(function(resolve, reject) {
            Request.get(URL_BASE + url, qs).error(reject).success(resolve);
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

    function _refresh() {
	return Q.Promise(function(resolve, reject) {
	    var url = 'https://wwws.mint.com/refreshFILogins.xevent';
	    var headers = {
		'User-Agent': USER_AGENT,
		'X-Request-With': 'XMLHttpRequest',
		'X-NewRelic-ID': 'UA4OVVFWGwEGV1VaBwc=',
		'Referrer': 'https://www.mint.com/login.event?task=L',
		'Content-Type': 'application/x-www-form-urlencoded',
		Origin: 'https://wwws.mint.com/'
	    };
            Request.post(url, { token: token }, headers).error(reject).success(resolve);
	});
    }

    function _refreshed() {
	return _get('userStatus.xevent', { rnd: _random() }).delay(1500).then(function(json) {
	    return json.isRefreshing ? _refreshed() : json;
	});
    }

    function _getBudget(args) {
	args.rnd = _random();

	return _getJson('getBudget.xevent', args).then(function(json) {
	    return json.data;
	});
    }    

    return {
	initialize: function () {

	    App.receivedEvent('initializing');

	    return _form('getUserPod.xevent', {
	    	username: CONFIG.email
	    }).then(function(json) {

	    	MINT_PN = json.mintPN;

	    	// finally, login
	    	return _form('loginUserSubmit.xevent', {
	    	    username: CONFIG.email,
	    	    password: CONFIG.password,
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

		App.receivedEvent('initialized');

		Figure.initialize();

	    }).fail(function(err) {
		App.receivedEvent(err);
	    });
	},

	refresh: function() {
	    App.receivedEvent('refreshing accounts');

	    return _refresh('refreshFILogins.xevent', {
		token: token
	    }).then(function(json) {

		return _refreshed();

	    }).then(function(json) {

		App.receivedEvent('');

		Figure.initialize();

	    }).fail(function(err) {
		App.receivedEvent(err);
	    });
	},

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

	getCashFlow: function(args) {

	    args = args || {};
	    var params = {
		numMonths: 1
	    };

	    var obj = _merge(params, args);	    

	    return _jsonForm({
		args: obj,
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

	    var obj = _merge(params, args);

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

	    var obj = _merge(params, args);

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

	    var obj = _merge(params, args);

	    return _trendForm(obj);
	}

    };

});
