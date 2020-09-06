const fetch = require('node-fetch');

const headers = require('./headers');

async function getTrackMeta (appID, token, trackID) {
	return await fetch(`http://www.qobuz.com/api.json/0.2/track/get?app_id=${appID}&track_id=${trackID}`, {
		headers: headers(appID, token)
	}).then(res => res.json());
}

module.exports = getTrackMeta;
