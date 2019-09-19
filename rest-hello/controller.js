// 加载 controllers 文件夹中的 js 文件
const fs = require('fs');

function addMapping(router, mapping) {
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
			router.del(path, mapping[url]);
			console.log(`register URL mapping: DELETE ${path}`);
		} else {
			console.log(`invalid URL: ${url}`);
		}
	}
}

function addControllers(router, dir) {
	// 查找路径下的 js 文件
	fs.readdirSync(__dirname + '/' + dir).filter(f => {
		return f.endsWith('.js');
	}).forEach(f => {
		console.log(`process controller: ${f}...`);
		let mapping = require(__dirname + '/' + dir + '/' + f);
		addMapping(router, mapping);
	});
}

module.exports = function (dir) {
	let 
		controllers_dir = dir || 'controllers',
		router = require('koa-router')();
	addControllers(router, controllers_dir);
	return router.routes();	
};