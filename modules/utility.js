/* eslint-disable no-unused-vars */
const fs = require('fs');
const progress = require('progress');
const multiProgress = require('multi-progress');
const MultiProgress = multiProgress(progress);

const progressBar = new MultiProgress(process.stderr);
function capitalize(word) {
	return word[0].toUpperCase() + word.slice(1).toLowerCase();
}

function unix() {
	return `${Math.ceil(Date.now() / 1000)}`;
}

function parseURL(url) {
	if (url.includes('track')) {
		return {
			type: 'track',
			id: url.split('/')[4],
		};
	} else if (url.includes('album')) {
		return {
			type: 'album',
			id: url.split('/')[4],
		};
	}
}

async function createFolder(name, isDownload) {
	if (isDownload) {
		return new Promise((resolve) => {
			fs.access('./Downloads', fs.constants.F_OK | fs.constants.W_OK, (err) => {
				if (err) {
					fs.mkdir('./Downloads', { recursive: true }, (err, _path) => {
						if (!err) {
							resolve();
						}
					});
				} else {
					resolve();
				}
			});
		});
	} else {
		return new Promise((resolve) => {
			fs.access(`./Downloads/${name}`, fs.constants.F_OK | fs.constants.W_OK, (err) => {
				if (err) {
					fs.mkdir(`./Downloads/${name}`, { recursive: true }, (err, _path) => {
						if (!err) {
							resolve();
						}
					});
				} else {
					resolve();
				}
			});
		});
	}
}
const userAgent =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) qobuz-dwp-desktop/5.4.3-b006 Chrome/69.0.3497.106 Electron/4.0.2 Safari/537.36';
module.exports = { capitalize, unix, userAgent, parseURL, createFolder, progressBar };
