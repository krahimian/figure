(function() {

    var txs = document.getElementById('transactions');

    var table = Elem.create({
	tag: 'table',
	className: 'col-xs',
	childs: [{
	    tag: 'thead',
	    childs: [{
		tag: 'th',
		text: 'Date'
	    }, {
		tag: 'th',
		text: 'Merchant'
	    }, {
		tag: 'th',
		text: 'Category'
	    }, {
		tag: 'th',
		text: 'Account'
	    }, {
		tag: 'th',
		text: 'Amount'
	    }]
	}]
    });

    var tbody = Elem.create({ tag: 'tbody' });
    table.appendChild(tbody);

    d3.json('/api/transactions', function(err, res) {

	if (err) {
	    console.log(err);
	    return;
	}

	console.log(res);	

	res.forEach(function(tx) {
	    var row = Elem.create({
		tag: 'tr',
		childs: [{
		    tag: 'td',
		    text: tx.date
		}, {
		    tag: 'td',
		    text: tx.merchant,
		    childs: [{
			tag: 'small',
			text: tx.omerchant
		    }]
		}, {
		    tag: 'td',
		    text: tx.category
		}, {
		    tag: 'td',
		    text: tx.fi + ' - ' + tx.account
		}, {
		    tag: 'td',
		    text: tx.amount
		}]
	    });
	    if (!tx.isDebit && !tx.isTransfer) row.classList.add('positive');
	    tbody.appendChild(row);
	});

	txs.appendChild(table);
    });

})();
