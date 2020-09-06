const { unix, userAgent, parseURL } = require('./utility');
const getTrackMeta = require('./getTrackMeta');
const md5 = require('md5');
const getTracks = require('./getTracks');
async function generateLink (url, appSecret, appID, token) {
	const { type, id } = parseURL(url);
	if (type === 'album') {
		const trackIDList = await getTracks(appID, token, id);
		const trackList = await Promise.all(
			trackIDList.map(async track => {
				return await helper(track, appSecret, appID, token);
			})
		);
		return trackList;
	} else if (type === 'track') {
		const data = await helper(id, appSecret, appID, token);
		return [ data ];
	}
}
async function helper (trackID, appSecret, appID, token) {
	const trackMeta = await getTrackMeta(appID, token, trackID);
	const ts = unix();
	const sig = md5(`trackgetFileUrlformat_id27track_id${trackID}${ts}${appSecret}`);
	return {
		url: `https://www.qobuz.com/api.json/0.2/track/getFileUrl?track_id=${trackID}&format_id=27&app_id=${appID}&request_ts=${ts}&request_sig=${sig}`,
		request: {
			headers: {
				'User-Agent': userAgent,
				'X-User-Auth-Token': token,
				'X-App-Id': appID
			}
		},
		info: trackMeta
	};
}
module.exports = generateLink;
