const { userAgent } = require('./utility.js');
function headers (token, appID) {
	return {
		headers: {
			'User-Agent': userAgent,
			'X-User-Auth-Token': token,
			'X-App-Id': appID
		}
	};
}
module.exports = headers;
