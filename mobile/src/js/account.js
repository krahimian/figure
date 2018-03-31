(function(root, factory) {

    root.Account = factory(root);

})(this, function(root) {

    'use strict';
    var Account = function(id) {
	return {
	    aid: id,
	    txs: function(args) {
		args = args || {};
		args.accountId = id;
		return MINT.getTransactions(args);
	    },
	    flow: function(args) {
		args = args || {};
		args.accountId = id;
		return MINT.getCashFlow(args);
	    },
	    income: function() {
		var args = {
		    reportType: 'IT',
		    accounts: {
			groupIds:[],
			accountIds: [this.aid],
			count: 1
		    }
		};

		return MINT.getTrend(args);
	    },
	    expense: function() {
		var args = {
		    reportType: 'ST',
		    accounts: {
			groupIds: [],
			accountIds: [this.aid],
			count: 1
		    }
		};

		return MINT.getTrend(args);
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
	    },
	    current_month: function() {
		var startDate = moment().startOf('month');
		var endDate = moment().endOf('month');
		return this.txs({
		    startDate: startDate.format('L'),
		    endDate: endDate.format('L')
		});
	    },
	    current_year: function() {
		var startDate = moment().startOf('year');
		var endDate = moment().endOf('year');
		return this.txs({
		    startDate: startDate.format('L'),
		    endDate: endDate.format('L')
		});
	    }
	};
    };

    ///// Business
    var Business = {
	'55': Account(9387188),
	'14': Account(9387189),
	'40': Account(9387191),
	'11510': Account(9387190),
	'11508': Account(9387186),
	'2914': Account(9387187)
    };

    return {

	credit: {
	    citi: Account(9120292),
	    chase: Account(9567227)
	},

	business: function(id) {
	    return Business[id];
	},

	budget: function() {
	    return MINT.getTrend({
		reportType: 'AT',
		accounts: {
		    groupIds: ['CS'],
		    accountIds: [],
		    count: 16
		}
	    });
	},

	assets: function() {
	    return MINT.getTrend({
		reportType: 'AT',
		accounts: {
		    groupIds: ['CS'],
		    accountIds: [],
		    count: 16
		}
	    });
	},

	networth: function() {
	    return MINT.getTrend();
	},

	transactions: function() {
	    var start = new Date();
	    start.setDate(new Date().getDate() - 1);

	    return MINT.getTransactions({
		startDate: start.toLocaleDateString('en-US'),
		endDate: new Date().toLocaleDateString('en-US')
	    });
	}
    };
});
