/**
 *   Javascript Library - Remember The Milk
 *
 *   @author Michael Day
 *   @since January 27th, 2013
 *   @see http://www.rememberthemilk.com/services/api/
 *
 *   Uses crypto module under node.js. Requires a global
 *   md5 function on other platforms. I recommend this one:
 *   http://www.myersdaily.org/joseph/javascript/md5-text.html
 *
 *   Based on RTM PHP Library by Adam Magaña
 *   @see https://github.com/adammagana/rtm-php-library
 *
 *   License (The MIT License)
 *   
 *   Copyright (c) 2011 Michael Day <manveru.alma@gmail.com>
 *   
 *   Permission is hereby granted, free of charge, to any person obtaining
 *   a copy of this software and associated documentation files (the
 *   'Software'), to deal in the Software without restriction, including
 *   without limitation the rights to use, copy, modify, merge, publish,
 *   distribute, sublicense, and/or sell copies of the Software, and to
 *   permit persons to whom the Software is furnished to do so, subject to
 *   the following conditions:
 *   
 *   The above copyright notice and this permission notice shall be
 *   included in all copies or substantial portions of the Software.
 *   
 *   THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 *   EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 *   MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 *   IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 *   CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 *   TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 *   SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function (root, factory) {
	if (typeof exports === "object" && exports) {
		module.exports = factory; // CommonJS
	} else if (typeof define === "function" && define.amd) {
		define(factory); // AMD
	} else {
		root.RememberTheMilk = factory; // <script>
	}
}(this, (function () {
	var exports = function (appKey, appSecret, permissions, format) {
		var https, crypt;

		this.authUrl = 'https://www.rememberthemilk.com/services/auth/';
		this.baseUrl = 'https://api.rememberthemilk.com/services/rest/';

		this.isWinJS = (typeof WinJS !== 'undefined');
		this.isNode = (typeof module !== 'undefined' && module.exports);

		if (this.isNode) {
			https = require('https');
			crypto = require('crypto');
		}

		this.md5 = (!this.isNode)
			? md5
			: function(string) {
				return crypto.createHash('md5').update(string, 'utf8').digest("hex");
			}

		var appKey = (appKey) ? appKey : '',
			appSecret = (appSecret) ? appSecret : '',
			permissions = (permissions) ? permissions : 'read',
			format = (format) ? format : 'json';

		if (!appKey || !appSecret) {
			throw 'Error: App Key and Secret Key must be defined.';
		}

		this.appKey = appKey;
		this.appSecret = appSecret;
		this.permissions = permissions;
		this.format = format;

		/**
		 * Encodes request parameters into URL format 
		 * 
		 * @param params    Array of parameters to be URL encoded
		 * @param signed    Boolean specfying whether or not the URL should be signed
		 * @return          Returns the URL encoded string of parameters
		 */
		this.encodeUrlParams = function (params, signed) {
			var params = (params) ? params : {},
				signed = (signed) ? signed : false,
				paramString = '',
				count;

			params.format = this.format;
			params.api_key = this.appKey;

			count = 0;

			// Encode the parameter keys and values
			for (key in params) {
				if (count == 0) {
					paramString += '?' + key + '=' + encodeURIComponent(params[key]);
				} else {
					paramString += '&' + key + '=' + encodeURIComponent(params[key]);
				}

				count++;
			}

			// Append an auth signature if needed
			if (signed) {
				paramString += this.generateSig(params);
			}

			return paramString;
		};

		/**
		 * Generates a URL encoded authentication signature
		 * 
		 * @param params    The parameters used to generate the signature
		 * @return          Returns the URL encoded authentication signature
		 */
		this.generateSig = function (params) {
			var params = (params) ? params : {},
				signature,
				signatureUrl,
				i,
				k;

			signature = '';
			signatureUrl = '&api_sig=';

			keys = Object.keys(params),
			keys.sort();

			for (i = 0; i < keys.length; i++) {
				signature += keys[i] + params[keys[i]];
			}

			signature = this.appSecret + signature;
			signatureUrl += this.md5(signature);

			return signatureUrl;
		};

		/**
		 * Generates a RTM authentication URL
		 * 
		 * @param frob Optional frob for use in desktop applications
		 * @return     Returns the reponse from the RTM API
		 */
		this.getAuthUrl = function (frob) {
			var params, url;

			params = {
				api_key: this.appKey,
				perms: this.permissions
			};

			if (frob) {
				params.frob = frob;
			}

			url = this.authUrl + this.encodeUrlParams(params, true);

			return url;
		};

		/**
		 * Main method for making API calls
		 * 
		 * @param method    Specifies what API method to be used
		 * @param params    Array of API parameters to accompany the method parameter
		 * @param callback  Callback to fire after the request comes back
		 * @return          Returns the reponse from the RTM API
		 */
		this.get = function (method, params, callback) {
			var method = (method) ? method : '',
				params = (params) ? params : {},
				callbackName,
				requestUrl,
				s;

			if (!callback && typeof params == 'function') {
				callback = params;
				params = {};
			}

			if (!callback) {
				callback = function () {};
			}

			if (!method) {
				throw 'Error: API Method must be defined.';
			}

			params.method = method;

			if (!this.isWinJS && !this.isNode) {
				callbackName = 'RememberTheMilk' + new Date().getTime();
				params.callback = callbackName;
			}

			if (this.auth_token) {
				params.auth_token = this.auth_token;
			}

			requestUrl = this.baseUrl + this.encodeUrlParams(params, true);

			if (this.isWinJS) {
				return WinJS.xhr({responseType: 'json', url: requestUrl}).done(
					function completed(resp) {
						callback.call(this, JSON.parse(resp.responseText));
					}
				);
			} else if (this.isNode) {
				https.get(requestUrl, function(response){
					var resp = '';

					response.on('data', function (chunk) {
						resp += chunk;
					});

					response.on('end', function () {
						resp = JSON.parse(resp);
						callback.call(this, resp)
					});
				}).end();
			} else {
				window[callbackName] = function (resp) {
					callback.call(this, resp);
					window[callbackName] = null;
				}

				s = document.createElement('script');
				s.src = requestUrl;
				document.body.appendChild(s);
			}
		};
	}

	return exports;
}())));