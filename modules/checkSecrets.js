const { unix, userAgent } = require('./utility');
const md5 = require('md5');
const fetch = require('node-fetch');
async function checkSecrets (sigs, token, appID) {
	let secret;
	const url = 'https://www.qobuz.com/api.json/0.2/userLibrary/getAlbumsList';
	const request = {
		headers: {
			'User-Agent': userAgent,
			'X-User-Auth-Token': token,
			'X-App-Id': appID
		}
	};

	for (let sec of sigs) {
		const sigmd5 = md5(`userLibrarygetAlbumsList${unix()}${sec}`);
		const urlString = `${url}?app_id=${appID}&request_ts=${unix()}&request_sig=${sigmd5}`;
		let res = await fetch(urlString, request).then(res => res.json());
		if (res.code !== 400) {
			secret = sec;
		}
	}
	return secret;
}
module.exports = checkSecrets;
