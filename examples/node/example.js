var api_key = 'API_KEY',
	api_secret = 'API_SECRET',
	http = require('http'),
	stdin = process.stdin,
	RememberTheMilk = require('../../rtm.js');

rtm = new RememberTheMilk(api_key, api_secret, 'delete');

rtm.get('rtm.auth.getFrob', function(resp){
	frob = resp.rsp.frob;

	var authUrl = rtm.getAuthUrl(frob);

	console.log('Please visit the following URL in your browser to authenticate:\n');
	console.log(authUrl, '\n');
	console.log('After authenticating, press any key to resume...');

	stdin.resume();

	stdin.on('data', function() {
		rtm.get('rtm.auth.getToken', {frob: frob}, function(resp){
			if (!resp.rsp.auth) {
				console.log('Auth token not found. Did you authenticate?\n');
				process.exit(1);
			}

			rtm.auth_token = resp.rsp.auth.token;

			console.log('Lists:');

			rtm.get('rtm.lists.getList', function(resp){
				var i, list;

				for (i = 0; i < resp.rsp.lists.list.length; i++) {
					list = resp.rsp.lists.list[i];
					console.log(list.name + ' (id: ' + list.id + ')');
				}

				console.log();

				process.exit();
			});
		});
	});
});
