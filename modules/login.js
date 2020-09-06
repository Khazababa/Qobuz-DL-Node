const fetch = require('node-fetch');
async function login (appID, email, password) {
	const session = await fetch('https://www.qobuz.com/api.json/0.2/user/login', {
		headers: {
			accept: '*/*',
			'content-type': 'application/x-www-form-urlencoded',
			'x-app-id': appID
		},
		referrer: 'https://play.qobuz.com/login',
		body: `username=${email}&email=${email}&password=${password}`,
		method: 'POST'
	}).then(res => res.json());
	// console.log(session);
	if (session.user.subscription.is_canceled === false && session.user.subscription.offer === 'studio') {
		return session.user_auth_token;
	} else {
		throw new Error('Not a Studio Subscriber');
	}
}
module.exports = login;
