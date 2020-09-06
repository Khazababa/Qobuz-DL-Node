const fetch = require('node-fetch');
const headers = require('./headers');

async function getTracks (appID, token, trackID) {
	const albumMeta = await fetch(`http://www.qobuz.com/api.json/0.2/album/get?app_id=${appID}&album_id=${trackID}`, {
		headers: headers(appID, token)
	}).then(res => res.json());
	// console.log(albumMeta);
	return albumMeta.tracks.items.map(track => track.id);
}

module.exports = getTracks;
