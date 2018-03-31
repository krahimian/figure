/* global ActiveXObject, XMLHttpRequest */

(function (root, factory) {

    root.Request = factory(root);

})(this, function (root) {

    'use strict';

    function serialize(obj) {
	var str = [];
	for(var p in obj)
	    if (obj.hasOwnProperty(p)) {
		str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
	    }
	return str.join('&');
    }

    var parse = function (req) {
	var result;
	try {
	    result = JSON.parse(req.responseText);
	} catch (e) {
	    result = req.responseText;
	}
	return [result, req];
    };

    var getXHR = function() {
	if (root.XMLHttpRequest
	    && (!root.location || 'file:' !== root.location.protocol
		|| !root.ActiveXObject)) {
	    return new XMLHttpRequest();
	} else {
	    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
	}
	return false;
    };

    var xhr = function (type, url, data, headers, form) {
	var methods = {
	    success: function () {},
	    error: function () {}
	};
	var request = getXHR();

	if (!request) throw new Error('unable to detect XHR');

	request.withCredentials = true;

	request.open(type, url, true);

	if (headers) {
	    for (var k in headers) {
		request.setRequestHeader(k, headers[k]);
	    }
	}

	request.onreadystatechange = function () {
	    if (request.readyState === 4) {
		if (request.status === 200) {
		    methods.success.apply(methods, parse(request));
		} else {
		    methods.error.apply(methods, parse(request));
		}
	    }
	};

	if (form) {
	    var formData = new FormData();
	    for (var a in form) {
		formData.append(a, form[a]);
	    }
	    request.send(formData);
	} else {
	    request.send(serialize(data));
	}

	return {
	    success: function (callback) {
		methods.success = callback;
		return this;
	    },
	    error: function (callback) {
		methods.error = callback;
		return this;
	    }
	};
    };

    return {
	get: function(url, data, headers) {
	    if (data) url += '?' + serialize(data);
	    return xhr('GET', url, headers);
	},
	put: function(url, data, headers) {
	    return xhr('PUT', url, data, headers);
	},
	post: function(url, data, headers, form) {
	    return xhr('POST', url, data, headers, form);
	},
	del: function(url, data, headers) {
	    if (data) url += '?' + serialize(data);
	    return xhr('DELETE', url, headers);
	}
    };

});
