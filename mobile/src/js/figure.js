/* global Elem, Account */
(function(root, factory) {

    root.Figure = factory(root);

})(this, function(root) {

    'use strict';

    var growth = document.querySelector('#growth');
    var lead = document.querySelector('#lead');    

    return {
	initialize: function() {

	    this.cashflow();
	    this.budget();

	    Alerts.initialize();

	    Properties.initialize();

	    //this.assets();
	    //this.networth();
	},

	spending: function(done) {
	    async.series({
		citi: function(cb) {
		    Account.credit.citi.current_month().then(function(res) {
			cb(null, res);
		    }).fail(function(err) {
			cb(err);
		    });
		},
		chase: function(cb) {
		    Account.credit.chase.current_month().then(function(res) {
			cb(null, res);
		    }).fail(function(err) {
			cb(err);
		    });
		}
	    }, done);
	},

	cashflow: function() {
	    MINT.getCashFlow().then(function(data) {

		var cf = data.monthlySavings[0].delta;
		var y = data.monthlySavings[0].income;
		var exp = data.monthlySavings[0].expenses;

		document.getElementById('cashflow').appendChild(Elem.create({
		    className: 'col-sm col-xs-12',
		    childs: [{
			className: 'box ' + (cf < 0 ? 'negative' : 'positive'),
			text: cf,
			attributes: {
			    title: 'Net Cash Flow (This Month)'
			},
			childs: [{
			    tag: 'small',
			    text: 'Earned: ' + y
			}, {
			    tag: 'small',
			    text: 'Spent: ' + exp
			}]
		    }]
		}));		
		
	    }).fail(console.log);
	},

	budget: function() {
	    var self = this;
	    async.waterfall([

		// check for categories
		function(next) {
		    localforage.getItem('categories:1', next);
		},

		// get categories if needed
		function(value, next) {
		    if (!value) {
			MINT.getCategories().then(function(data) {
			    next(null, data);
			}).fail(next);
		    } else {
			next(null, []);
		    }
		},

		// load budgets
		function(res, next) {
		    var save = function(c) {
			localforage.setItem('categories:' + c.id, c.value, function(err) {
			    if (err) console.log(err);
			});
		    };

		    res.forEach(function(i) {
			save(i);
			i.children.forEach(save);
		    });

		    async.series({
			budget: function(cb) {
			    MINT.getBudget().then(function(data) {
				cb(null, data);
			    }).fail(cb);
			},
			spending: self.spending
		    }, next);
		}

	    ], function(err, res) {
		if (err) {
		    console.log(err);
		    return;
		}

		var date_end_of_month = moment().endOf('month');
		var date_today = moment().today;
		var days_left = date_end_of_month.diff(date_today, 'days');
		var days_in_month = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
		var day_in_month = new Date().getDate();
		var month_percentage = (day_in_month / days_in_month * 100).toFixed(2) + '%';

		var txs = [];
		txs = txs.concat(res.spending.citi);
		txs = txs.concat(res.spending.chase);

		var excluded_categories = [
		    7, // Food & Dining
		    704, // Coffee Shops
		    706, // Fast Food
		    701, // Groceries
		    707, // Restaurants
		    1401, // Gas & Fuel
		    2101, // Credit Card Payment
		    506, // Health Insurance
		    1304, // Mobile Phone
		    1406 // Public Transportation
		];

		var fun_txs = txs.filter(function(tx) {
		    return excluded_categories.indexOf(tx.categoryId) === -1;
		});

		var fun_money_spent_total = 0.00;
		var fun_money_spent_today = 0.00;
		fun_txs.forEach(function(tx) {
		    var amt = parseFloat(tx.amount.replace(/[^0-9\.]+/g,""));
		    fun_money_spent_total += amt;
		    if (moment(tx.date, 'MMM D').isSame(date_today, 'day')) fun_money_spent_today += amt;
		});

		lead.appendChild(Elem.create({
		    className: 'col-sm col-xs-12',
		    childs: [{
			className: 'box ',
			text: fun_money_spent_today.toFixed(2),
			attributes: {
			    title: 'Fun Money Spent Today'
			},
			childs: [{
			    tag: 'small',
			    text: 'Total: ' + fun_money_spent_total.toFixed(2)
			}]
		    }]
		}));

		var income = res.budget.income[Object.keys(res.budget.income)[0]];
		var spending = res.budget.spending[Object.keys(res.budget.spending)[0]];

		var projected_spending = 0;
		var projected_income = Math.max(income.tot.bu, income.tot.amt);

		spending.bu.forEach(function(b) {
		    projected_spending += Math.max(b.amt, b.bgt);
		});

		projected_spending += spending.tot.ub;

		var saving_pct = 0.90;
		var projected_STS = (projected_income * saving_pct) - projected_spending;

		lead.appendChild(Elem.create({
		    className: 'col-sm col-xs-12',
		    childs: [{
			className: 'box ' + (projected_STS < 0 ? 'negative' : 'positive'),
			text: projected_STS < 0 ? '0.00' : (projected_STS / days_left).toFixed(2),
			attributes: {
			    title: 'Projected Safe-to-Spend Today'
			},
			childs: [{
			    tag: 'small',
			    text: 'Total: ' + projected_STS.toFixed(2)
			}]
		    }]
		}));

		var selected_categories = [1401,7];
		var selected_budgets = spending.bu.filter(function(b) {
		    return selected_categories.indexOf(b.cat) !== -1;
		});

		selected_budgets.forEach(function(b) {
		    localforage.getItem('categories:' + b.cat).then(function(value) {
			var col = Elem.create({
			    className: 'col-md col-sm-3 col-xs-6'
			});
			var budget = Elem.create({
			    className: 'box ' + (b.rbal < 0 ? 'negative' : 'positive'),
			    text: '$' + b.rbal < 0 ? b.rbal : (b.rbal / days_left).toFixed(2),
			    attributes: {
				title: value
			    },
			    childs: [{
				tag: 'small',
				text: 'Total: $' + b.rbal
			    }]
			});
			var progress = Elem.create({ className: 'progress' });
			var position = Elem.create({ className: 'position' });
			var today = Elem.create({ className: 'today' });

			today.style.left = month_percentage;
			progress.appendChild(today);

			var width = b.amt / b.bgt;

			position.style.width = width > 1 ? '100%' : (width * 100) + '%';
			progress.appendChild(position);
			
			budget.appendChild(progress);
			col.appendChild(budget);
			budgets.appendChild(col);

		    });
		});

	    });
	    
	},

	assets: function() {
	    Account.assets().then(function(res) {
		var data = res.trendList;

		var y0 = data[0].value;
		var m0 = data[data.length - 2].value;
		var b1 = data[data.length - 1].value;

		var ytd = b1 / y0 - 1;
		var mtd = b1 / m0 - 1;

		growth.appendChild(Elem.create({
		    className: 'col-sm col-xs-12',
		    childs: [{
			className: 'box ' + (ytd < 0 ? 'negative' : 'positive'),
			text: (ytd * 100).toFixed(2) + '%',
			attributes: {
			    title: 'YTD Liquid Asset Growth'
			}
		    }]
		}));

		growth.appendChild(Elem.create({
		    className: 'col-sm col-xs-12',
		    childs: [{
			className: 'box ' + (mtd < 0 ? 'negative' : 'positive'),
			text: (mtd * 100).toFixed(2) + '%',
			attributes: {
			    title: 'MTD Liquid Asset Growth'
			}
		    }]
		}));

		var STI = b1 - 60000 + 120000; //TODO

		lead.appendChild(Elem.create({
		    className: 'col-sm col-xs-12',
		    childs: [{
			className: 'box ' + (STI < 0 ? 'negative' : 'positive'),
			text: '$' + STI,
			attributes: {
			    title: 'Actual Safe-to-Invest'
			}
		    }]
		}));
		
	    }).fail(function(err) {
		console.log(err);
	    });
	},

	networth: function() {
	    Account.networth().then(function(res) {
		var data = [];
		res.trendList.forEach(function(d) {
		    data.push({
			value: d[0].value + d[1].value,
			dateString: d[0].dateString
		    });
		});

		var y0 = data[0].value;
		var m0 = data[data.length - 2].value;
		var b1 = data[data.length - 1].value;

		var ytd = b1 / y0 - 1;
		var mtd = b1 / m0 - 1;

		var elem = Elem.create({ className: 'col-sm col-xs-12' });
		growth.appendChild(elem);

		var box = Elem.create({
		    className: 'box ' + (ytd < 0 ? 'negative' : 'positive'),
		    text: (ytd * 100).toFixed(2) + '%',
		    attributes: {
			title: 'YTD Net Worth Growth'
		    }
		});

		elem.appendChild(box);

		growth.appendChild(Elem.create({
		    className: 'col-sm col-xs-12',
		    childs: [{
			className: 'box ' + (mtd < 0 ? 'negative' : 'positive'),
			text: (mtd * 100).toFixed(2) + '%',
			attributes: {
			    title: 'MTD Net Worth Growth'
			}
		    }]
		}));

	    }).fail(function(e) {
		console.log(e);
	    });
	}
    };

});
