const fs = require('fs');
const { createFolder, sanitizeFS } = require('./utility');
const { api: flac } = require('flac-bindings');
const axios = require('axios');
const ProgressBar = require('progress');

async function download (url, info) {
	await createFolder(null, true); //ensure download folder exists
	const albumName = sanitizeFS(info.album.title);
	const artistName = sanitizeFS(info.album.artist.name);
	const trackName = sanitizeFS(info.title);
	await createFolder(artistName, false);
	await createFolder(`${artistName}/${albumName}`, false);
	// console.log(`Downloading ${artistName} ( ${albumName} ) - ${trackName}`);
	const { data, headers } = await axios({
		url,
		method: 'GET',
		responseType: 'stream'
	});

	const totalLength = headers['content-length'];
	const green = '\u001b[42m \u001b[0m';
	const progressBar = new ProgressBar(trackName + '.flac [:bar] :percent :etas [:rate mb/s]', {
		width: 40,
		complete: green,
		incomplete: ' ',
		renderThrottle: 1,
		total: parseInt(totalLength / 1000 / 1000 * 8)
	});

	await new Promise(resolve => {
		const writer = fs.createWriteStream(`./Downloads/${artistName}/${albumName}/${trackName}.flac`);
		data.on('data', chunk => progressBar.tick(chunk.length / 1000 / 1000 * 8));
		data.pipe(writer);
		writer.on('finish', () => {
			console.log('\n');
			resolve();
		});
	});
	await writeTags(`./Downloads/${artistName}/${albumName}/${trackName}.flac`, info);
	return `Downloaded ${artistName}/${albumName}/${trackName}.flac`;
	// await new Promise((resolve, reject) => {
	// 	const fileStream = fs.createWriteStream(`./Downloads/${artistName}/${albumName}/${trackName}.flac`);
	// 	res.body.pipe(fileStream);
	// 	res.body.on('error', reject);
	// 	fileStream.on('finish', resolve);
	// });
	//
}

async function writeTags (filepath, info) {
	const { album, composer, title, performer, performers, track_number } = info;
	const { genres_list, artist, image, label, copyright, url, release_date_original } = album;
	const it = new flac.SimpleIterator();
	it.init(filepath);
	const vorbisComment = new flac.metadata.VorbisCommentMetadata();
	vorbisComment.appendComment('title=' + title);
	vorbisComment.appendComment('album=' + album.title);
	vorbisComment.appendComment('artist=' + performer.name);
	vorbisComment.appendComment('albumartist=' + artist.name);
	vorbisComment.appendComment('composer=' + composer.name);
	vorbisComment.appendComment('genre=' + genres_list);
	vorbisComment.appendComment('label=' + label.name);
	vorbisComment.appendComment('copyright=' + copyright);
	vorbisComment.appendComment('performer=' + performers);
	vorbisComment.appendComment('year=' + new Date(release_date_original).getFullYear());
	vorbisComment.appendComment('url=' + url);
	vorbisComment.appendComment('TRACKNUMBER=' + track_number);
	const picture = new flac.metadata.PictureMetadata();

	const { data } = await axios({
		url: image.large,
		method: 'GET',
		responseType: 'arraybuffer'
	});
	picture.data = data;
	it.insertBlockAfter(vorbisComment);
	it.insertBlockAfter(picture);
}
module.exports = download;
