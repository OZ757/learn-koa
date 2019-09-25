const path = require('path');
const mime = require('mime');
const fs = require('mz/fs');

function staticFiles(url, dir) {
	return async (ctx, next) => {
		const rpath = ctx.request.path;
		if (rpath.startsWith(url)) {
			const fp = path.join(dir, rpath.slice(url.length));
			if (await fs.exists(fp)) {
				ctx.response.type = mime.getType(rpath);
				ctx.response.body = await fs.readFile(fp);
			} else {
				await next();
			}
		} else {
			await next();
		}
	};
}

module.exports = staticFiles;