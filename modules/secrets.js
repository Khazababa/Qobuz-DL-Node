const login = require('./login');
const { capitalize } = require('./utility');
const checkSecrets = require('./checkSecrets');
const fetch = require('node-fetch');

async function getSecrets (email, password) {
	const data = await fetch('https://play.qobuz.com/login').then(res => res.text()).then(async data => {
		const bundleURL = data
			.match(/<script src="(\/resources\/\d+\.\d+\.\d+-[a-z]\d{3}\/bundle\.js)"><\/script>/g)[0]
			.match(/(?<=<script src=").*?(?=")/g)[0];

		const bundleSrc = await fetch('https://play.qobuz.com' + bundleURL).then(res => res.text());
		const appObject = bundleSrc.match(
			/{app_id:"(\d{9})",app_secret:"\w{32}",base_port:"80",base_url:"https:\/\/www\.qobuz\.com",base_method:"\/api\.json\/0\.2\/"},n\.base_url="https:\/\/play\.qobuz\.com"/g
		)[0];

		const appID = appObject.match(/(?<=app_id:").*?(?=")/g)[0];
		const appSecret = appObject.match(/(?<=app_secret:").*?(?=")/g)[0];
		const initialSeedList = bundleSrc.match(/(?<=h.initialSeed\(")(.*?)(?=\))/g);
		const initialSeeds = initialSeedList.map(e => {
			const arr = e.replace('",window.utimezone.', ' ').split(' ');
			return {
				timeZone: arr[1],
				seed: arr[0]
			};
		});
		const sigs = initialSeeds.map(e => {
			let timeZone = capitalize(e.timeZone);
			if (e.timeZone === 'algier') timeZone = 'Algiers';
			const reg = new RegExp(
				`name:"\\w+\\/(?<timezone>${timeZone})",info:"(?<info>[\\w=]+)",extras:"(?<extras>[\\w=]+)"`,
				'g'
			);
			const match = reg.exec(bundleSrc);
			const str = e.seed + match.groups.info + match.groups.extras;
			const reducedString = str.split('').slice(0, -44).join('');
			const buff = new Buffer.from(reducedString, 'base64');
			return buff.toString();
		});
		return { appID, appSecret, sigs };
	});
	const token = await login(data.appID, email, password);
	const appSecret = await checkSecrets(data.sigs, token, data.appID);
	return {
		appID: data.appID,
		token,
		appSecret
	};
}
module.exports = getSecrets;
