var mint = require('./mint')

module.exports = function(id) {
    return {
	aid: id,
	txs: function(args) {
	    args = args || {};
	    args.accountId = id;
	    return mint.getTransactions(args);
	},
	flow: function(args) {
	    args = args || {};
	    args.accountId = id;
	    return mint.getCashFlow(args);
	},
	getIncome: function() {
	    var args = {
		reportType: 'IT',
		accounts: {
		    groupIds:[],
		    accountIds: [this.aid],
		    count: 1
		}
	    };

	    return mint.getTrend(args);
	},
	getExpense: function() {
	    var args = {
		reportType: 'ST',
		accounts: {
		    groupIds: [],
		    accountIds: [this.aid],
		    count: 1
		}
	    };

	    return mint.getTrend(args);
	},
	today: function() {
	    return this.txs({
		startDate: new Date().toLocaleDateString('en-US'),
		endDate: new Date().toLocaleDateString('en-US')
	    });
	},
	week: function() {
	    var start = new Date();
	    start.setDate(new Date().getDate() - 7);
	    return this.txs({
		startDate: start.toLocaleDateString('en-US'),
		endDate: new Date().toLocaleDateString('en-US')
	    });
	}
    };
}
