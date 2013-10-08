window.keycloak = (function() {
	var kc = {};
	var config = null;

	kc.init = function(c) {
		config = c;

		var token = getTokenFromCode();
		if (token) {
			var t = parseToken(token);
			kc.user = t.prn;
			kc.authenticated = true;
		} else {
			kc.authenticated = false;
		}
	}

	kc.login = function() {
		var clientId = encodeURIComponent(config.clientId);
		var redirectUri = encodeURIComponent(window.location.href);
		var state = encodeURIComponent(createUUID());
		var realm = encodeURIComponent(config.realm);
		var url = config.baseUrl + '/rest/realms/' + realm + '/tokens/login?response_type=code&client_id=' + clientId + '&redirect_uri=' + redirectUri
				+ '&state=' + state;
		window.location.href = url;
	}

	return kc;

	function parseToken(token) {
		var t = base64Decode(token.split('.')[1]);
		return JSON.parse(t);
	}

	function getTokenFromCode() {
		var code = getQueryParam('code');
		if (code) {
			window.history.replaceState({}, document.title, location.protocol + "//" + location.host + location.pathname);
			
			var clientId = encodeURIComponent(config.clientId);
			var clientSecret = encodeURIComponent(config.clientSecret);
			var realm = encodeURIComponent(config.realm);

			var params = 'code=' + code + '&client_id=' + config.clientId + '&password=' + config.clientSecret;
			var url = config.baseUrl + '/rest/realms/' + realm + '/tokens/access/codes'

			var http = new XMLHttpRequest();
			http.open('POST', url, false);
			http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

			http.send(params);
			if (http.status == 200) {
				return JSON.parse(http.responseText)['access_token'];
			}
		}
		return undefined;
	}

	function getQueryParam(name) {
		var params = window.location.search.substring(1).split('&');
		for ( var i = 0; i < params.length; i++) {
			var p = params[i].split('=');
			if (decodeURIComponent(p[0]) == name) {
				return p[1];
			}
		}
	}

	function createUUID() {
		var s = [];
		var hexDigits = '0123456789abcdef';
		for ( var i = 0; i < 36; i++) {
			s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
		}
		s[14] = '4';
		s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
		s[8] = s[13] = s[18] = s[23] = '-';
		var uuid = s.join('');
		return uuid;
	}

	function base64Decode (data) {
		  var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
		    ac = 0,
		    dec = "",
		    tmp_arr = [];

		  if (!data) {
		    return data;
		  }

		  data += '';

		  do {
		    h1 = b64.indexOf(data.charAt(i++));
		    h2 = b64.indexOf(data.charAt(i++));
		    h3 = b64.indexOf(data.charAt(i++));
		    h4 = b64.indexOf(data.charAt(i++));

		    bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

		    o1 = bits >> 16 & 0xff;
		    o2 = bits >> 8 & 0xff;
		    o3 = bits & 0xff;

		    if (h3 == 64) {
		      tmp_arr[ac++] = String.fromCharCode(o1);
		    } else if (h4 == 64) {
		      tmp_arr[ac++] = String.fromCharCode(o1, o2);
		    } else {
		      tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
		    }
		  } while (i < data.length);

		  dec = tmp_arr.join('');

		  return dec;
		}
})();