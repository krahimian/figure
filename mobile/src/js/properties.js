(function(root, factory) {

    root.Properties = factory(root);

})(this, function(root) {

    'use strict';

    return {

	initialize: function() {
	    async.eachSeries([{
		id: 40,
		title: '40 Rhode Island Ave NE'
	    }, {
		id: 14,
		title: '14 N ST NW'
	    }, {
		id: 55,
		title: '55 U ST NW'
	    }, {
		id: 11510,
		title: '11510 Seven Locks Rd'
	    }, {
		id: 11508,
		title: '11508 Seven Locks Rd'
	    }, {
		id: 2914,
		title: '2914 Dawson Ave'
	    }], function(property, done) {
		async.series({
		    income: function(next) {
			Account.business(property.id).income().then(function(res) {
			    next(null, res);
			}).fail(function(err) {
			    next(err);
			});
		    },
		    expense: function(next) {
			Account.business(property.id).expense().then(function(res) {
			    next(null, res);
			}).fail(function(err) {
			    next(err);
			});
		    },
		    txs: function(next) {
			Account.business(property.id).current_year().then(function(res) {
			    next(null, res);
			}).fail(function(err) {
			    next(err);
			});
		    }
		}, function(err, results) {
		    if (err) {
			console.log(err);
			return;
		    }

		    var date_today = moment().today;

		    var section = Elem.create();
		    var graph_row = Elem.create({ className: 'row' });
		    var graph = Elem.create({ className: 'col-xs' });

		    var details_row = Elem.create({ className: 'row end-sm' });
		    var details = Elem.create({ className: 'col-md-8 col-sm-10 col-xs-12' });
		    var summary = Elem.create({ className: 'row' });
		    
		    details.appendChild(summary);
		    details_row.appendChild(details);

		    graph_row.appendChild(graph);

		    section.appendChild(graph_row);
		    section.appendChild(details_row);
		    document.querySelector('#properties').appendChild(section);

		    var income = results.income;
		    var expense = results.expense;

		    var data = [];

		    console.log(results.txs);

		    var excluded_categories = [
			1206, // Home Insurance
			3007, // Rental Income
			30, // Income
			1306, // Utilities
			21, // Transfer
			1207, // Mortgage & Rent
			1905 // Property Tax
		    ];

		    var maintenance_txs = results.txs.filter(function(tx) {
			return excluded_categories.indexOf(tx.categoryId) === -1;
		    });

		    console.log(maintenance_txs);

		    var maintenance_total = 0.00;
		    var maintenance_total_month = 0.00;
		    maintenance_txs.forEach(function(tx) {
			var amt = parseFloat(tx.amount.replace(/[^0-9\.]+/g,""));
			if (tx.isDebit)
			    maintenance_total -= amt;
			else
			    maintenance_total += amt;

			if (moment(tx.date, 'MMM D').isSame(date_today, 'month')) {
			    if (tx.isDebit)
				maintenance_total_month -= amt;
			    else
				maintenance_total_month += amt;
			}
		    });

		    data.push(MG.convert.date(income.trendList, 'dateString'));
		    data.push(MG.convert.date(expense.trendList, 'dateString'));

		    var ytd_income = 0;
		    income.trendList.forEach(function(i) {
			ytd_income += i.value;
		    });
		    var mtd_income = income.trendList.length ? income.trendList.slice(-1).pop().value : 0;

		    var ytd_expense = 0;
		    expense.trendList.forEach(function(i) {
			ytd_expense += i.value;
		    });
		    var mtd_expense = expense.trendList.length ? expense.trendList.slice(-1).pop().value : 0;

		    var ytd_profit = ytd_income - ytd_expense;
		    var mtd_profit = mtd_income - mtd_expense;


		    // TODO - exclude mortgage payments
		    var ytd_oer = ytd_expense / ytd_income;
		    var mtd_oer = mtd_expense / mtd_income;

		    MG.data_graphic({
			title: property.title,
			data: data,
			width: 600,
			height: 200,
			show_tooltips: false,
			right: 40,
			target: graph,
			full_width: true,
			y_extended_ticks: true,
			show_year_markers: false,
			small_text: true,
			area: true,
			aggregate_rollover: true,
			legend: ['Y', 'EXPS'],
			x_accessor: 'dateString',
			yax_units: '$',
			y_accessor: 'value'
		    });

		    summary.appendChild(Elem.create({
			className: 'col-md col-sm-4 col-xs-6',
			childs: [{
			    className: 'box',
			    text: mtd_income.toFixed(2),
			    attributes: {
				title: 'MTD Revenue'
			    },
			    childs: [{
				tag: 'small',
				text: 'YTD: ' + ytd_income.toFixed(2)
			    }]
			}]
		    }));

		    summary.appendChild(Elem.create({
			className: 'col-md col-sm-4 col-xs-6',
			childs: [{
			    className: 'box',
			    text: mtd_expense.toFixed(2),
			    attributes: {
				title: 'MTD Expense'
			    },
			    childs: [{
				tag: 'small',
				text: 'YTD: ' + ytd_expense.toFixed(2)
			    }]
			}]
		    }));

		    summary.appendChild(Elem.create({
			className: 'col-md col-sm-4 col-xs-6',
			childs: [{
			    className: 'box ' + (mtd_profit < 0 ? 'negative' : 'positive'),
			    text: mtd_profit.toFixed(2),
			    attributes: {
				title: 'MTD Profit'
			    }
			}]
		    }));

		    summary.appendChild(Elem.create({
			className: 'col-md col-sm-4 col-xs-6',
			childs: [{
			    className: 'box ' + (ytd_profit < 0 ? 'negative' : 'positive'),
			    text: ytd_profit.toFixed(2),
			    attributes: {
				title: 'YTD Profit'
			    }
			}]
		    }));

		    summary.appendChild(Elem.create({
			className: 'col-md col-sm-4 col-xs-6',
			childs: [{
			    className: 'box',
			    text: maintenance_total_month.toFixed(2),
			    attributes: {
				title: 'MTD Maintenance'
			    },
			    childs: [{
				tag: 'small',
				text: 'YTD: ' + maintenance_total.toFixed(2)
			    }]
			}]
		    }));

		    summary.appendChild(Elem.create({
			className: 'col-md col-sm-4 col-xs-6',
			childs: [{
			    className: 'box',
			    text: (mtd_oer * 100).toFixed(2),
			    attributes: {
				title: 'MTD OER'
			    },
			    childs: [{
				tag: 'small',
				text: 'YTD: ' + (ytd_oer * 100).toFixed(2)
			    }]
			}]
		    }));

		    done();
		    
		});
		
	    }, function(err) {
		if (err) console.log(err);
	    });
	}
    };
});
