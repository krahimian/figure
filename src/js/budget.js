(function() {
    var lead = document.querySelector('#lead');
    var budgets = document.querySelector('#budgets');

    async.waterfall([

	// check for categories
	function(next) {
	    localforage.getItem('categories:1', next);
	},

	// get categories if needed
	function(value, next) {
	    if (!value) {
		d3.json('/api/categories', next);
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

	    d3.json('/api/budget', next);
	}

    ], function(err, res) {
	if (err) {
	    console.log(err);
	    return;
	}

	var income = res.income[Object.keys(res.income)[0]];
	var spending = res.spending[Object.keys(res.spending)[0]];

	console.log(spending);

	var base = Math.max(spending.tot.bu, spending.tot.amt) + spending.tot.ub;

	console.log(base);

	var saving_pct = 0.90;
	var projected_STS = (income.tot.bu * saving_pct) - base;
	var actual_STS = (income.tot.amt * saving_pct) - base;

	lead.appendChild(Elem.create({
	    className: 'col-sm col-xs-12',
	    childs: [{
		className: 'box ' + (projected_STS < 0 ? 'negative' : 'positive'),
		text: '$' + projected_STS.toFixed(2),
		attributes: {
		    title: 'Projected Safe-to-Spend'
		}		
	    }]
	}));

	lead.appendChild(Elem.create({
	    className: 'col-sm col-xs-12',
	    childs: [{
		className: 'box ' + (actual_STS < 0 ? 'negative' : 'positive'),
		text: '$' + actual_STS.toFixed(2),
		attributes: {
		    title: 'Actual Safe-to-Spend'
		}
	    }]
	}));

	var days = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
	var day = new Date().getDate();
	var currentDay = (day / days * 100).toFixed(2) + '%';

	spending.bu.forEach(function(b) {
	    localforage.getItem('categories:' + b.cat).then(function(value) {
		var col = Elem.create({
		    className: 'col-md col-sm-3 col-xs-6'
		});
		var budget = Elem.create({
		    className: 'box ' + (b.rbal < 0 ? 'negative' : 'positive'),
		    text: '$' + b.rbal,
		    attributes: {
			title: value
		    }
		});
		var progress = Elem.create({ className: 'progress' });
		var position = Elem.create({ className: 'position' });
		var today = Elem.create({ className: 'today' });

		today.style.left = currentDay;
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
})();
