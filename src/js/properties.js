(function() {

  //TODO: Pull from config
  var Properties = [];

  Properties.forEach(function(property) {

    async.parallel({
      income: function(next) {
	d3.json('/api/account/' + property.id + '/income', next);
      },
      expense: function(next) {
	d3.json('/api/account/' + property.id + '/expense', next);
      }
    }, function(err, results) {
      if (err) {
	console.log(err);
	return;
      }

      var p = Elem.create({ className: 'container' });
      var graph_row = Elem.create({ className: 'row' });
      var graph = Elem.create({ className: 'col-xs' });

      var details_row = Elem.create({ className: 'row end-sm' });
      var details = Elem.create({ className: 'col-md-8 col-sm-10 col-xs-12' });
      var summary = Elem.create({ className: 'row' });

      details.appendChild(summary);
      details_row.appendChild(details);

      graph_row.appendChild(graph);

      p.appendChild(graph_row);
      p.appendChild(details_row);

      document.body.appendChild(p);

      var data = [];
      data.push(MG.convert.date(results.income.trendList, 'dateString'));
      data.push(MG.convert.date(results.expense.trendList, 'dateString'));

      var ytd_income = 0;
      results.income.trendList.forEach(function(i) {
	ytd_income += i.value;
      });
      var mtd_income = results.income.trendList[results.income.trendList.length - 1].value;

      var ytd_expense = 0;
      results.expense.trendList.forEach(function(i) {
	ytd_expense += i.value;
      });
      var mtd_expense = results.expense.trendList[results.expense.trendList.length - 1].value;

      var ytd_profit = ytd_income - ytd_expense;
      var mtd_profit = mtd_income - mtd_expense;

      MG.data_graphic({
	title: 'Investment Property - ' + property.title,
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
	  }
	}]
      }));

      summary.appendChild(Elem.create({
	className: 'col-md col-sm-4 col-xs-6',
	childs: [{
	  className: 'box',
	  text: mtd_expense.toFixed(2),
	  attributes: {
	    title: 'MTD Expense'
	  }
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
	  className: 'box',
	  text: ytd_income.toFixed(2),
	  attributes: {
	    title: 'YTD Revenue'
	  }
	}]
      }));

      summary.appendChild(Elem.create({
	className: 'col-md col-sm-4 col-xs-6',
	childs: [{
	  className: 'box',
	  text: ytd_expense.toFixed(2),
	  attributes: {
	    title: 'YTD Expense'
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
    });
  });
})();
