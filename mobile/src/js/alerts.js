/* global Account */
(function(root, factory) {

    root.Alerts = factory(root);

})(this, function(root) {

    'use strict';

    var parent = document.getElementById('alerts');

    return {
	initialize: function() {
	    MINT.getAccounts().then(function(res) {
		for (var i=0; i<res.length; i++) {
		    var b = res[i];
		    if (!b.isActive) continue;

		    if (b.accountType === 'bank' && b.currentBalance < 1000) {
			parent.appendChild(Elem.create({
			    className: 'col-xs-12',
			    text: 'low balance (' + b.currentBalance + ') ' + b.fiLoginDisplayName + ' ' + b.accountName
			}));
		    } else if (b.accountType === 'credit' && b.currentBalance > 3000) {
			parent.appendChild(Elem.create({
			    className: 'col-xs-12',
			    text: 'high balance (' + b.currentBalance + ') ' + b.fiLoginDisplayName + ' ' + b.accountName
			}));
		    }
		}
	    }).fail(console.log);
	}
    };
});
