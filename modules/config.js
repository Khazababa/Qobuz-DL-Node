const fs = require('fs');
async function writeConfig (email, password, appID, appSecret, token) {
	return new Promise(resolve => {
		fs.writeFile('./config.json', JSON.stringify({ email, password, appID, appSecret, token }), resolve);
	});
}
async function checkConfig () {
	return await new Promise(resolve => {
		fs.readFile('./config.json', (err, data) => {
			if (err) {
				resolve(false);
			} else {
				resolve(JSON.parse(data));
			}
		});
	});
}
module.exports = { writeConfig, checkConfig };
