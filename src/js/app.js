(function() {
    var growth = document.querySelector('#growth');
    var lead = document.querySelector('#lead');

    d3.json('/api/assets', function(err, res) {
	if (err) {
	    console.log(err);
	    return;
	}

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
    });

    d3.json('/api/networth', function(err, res) {
	if (err) {
	    console.log(err);
	    return;
	}

	console.log(res.trendList);

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
    });

})();
