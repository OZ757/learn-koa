const fs = require('fs');

function addMaping(router, mapping) {
	for (let url in mapping) {
		if (url.startsWith('GET ')) {
			const path = url.slice(4);
			router.get(path, mapping[url]);
			console.log(`register URL mapping: GET ${path}`);
		} else if (url.startsWith('POST ')) {
			const path = url.slice(5);
			router.post(path, mapping[url]);
			console.log(`register URL mapping: POST ${path}`);
		} else if (url.startsWith('PUT ')) {
			const path = url.slice(4);
			router.put(path, mapping[url]);
			console.log(`register URL mapping: PUT ${path}`);
		} else if (url.startsWith('DELETE ')) {
			const path = url.slice(7);
			router.delete(path, mapping[url]);
			console.log(`register URL mapping: DELETE ${path}`);
		} else {
			console.log(`invalid URL: ${url}`);
		}
	}
}

function addControllers(router, dir) {
	fs.readdirSync(__dirname + '/' + dir).filter(f => {
		return f.endsWith('.js');
	}).forEach(f => {
		console.log(`process constroller: ${f}...`);
		const mapping = require(__dirname + '/' + dir + '/' + f);
		addMaping(router, mapping);
	});
}

module.exports = function (dir) {
	const 
		controller_dir = dir || 'controllers',
		router = require('koa-router')();
	addControllers(router, controller_dir);
	return router.routes();	
};