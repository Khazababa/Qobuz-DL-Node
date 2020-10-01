const fetch = require('node-fetch');
const getSecrets = require('./modules/secrets');
const generateLink = require('./modules/generateLink');
const { writeConfig, checkConfig } = require('./modules/config');
const download = require('./modules/download');
const prompt = require('prompt-sync')({ sigint: true });
const parallelDownloadThreads = 4;

init().catch((e) => console.log(e));

async function init() {
	const config = await checkConfig();
	if (!config) {
		const email = prompt('Enter your email: ');
		const password = prompt('Enter your password: ');
		console.log('Logging in, please wait...');
		const { token, appID, appSecret } = await getSecrets(email, password);
		console.log('Login successful!');
		await writeConfig(email, password, appID, appSecret, token);
		console.log('Wrote Config file');
		init();
		return true;
	} else {
		const { appID, appSecret, token } = config;
		const toDownload = prompt('Enter URL: ');
		const downloadList = await generateLink(toDownload, appSecret, appID, token);

		let tasks = chunk(downloadList, parallelDownloadThreads);
		for (let task of tasks) {
			//synchronous loop to limit the number of downloads to the parallel tasks limit count
			await Promise.all(task.map(singleDownload));
		}
		console.log('\n');
		init();
	}
}
function chunk(arr, size) {
	const result = [];
	for (let i = 0; i < arr.length; i += size) {
		result.push(arr.slice(i, i + size));
	}
	return result;
}

async function singleDownload(track) {
	const fileInfo = await fetch(track.url, track.request).then((res) => res.json());
	await download(fileInfo.url, track.info);
}
