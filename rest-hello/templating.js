// 使用 nunjucks 加载模板
const nunjucks = require('nunjucks');

function createEnv(path, opts) {
	const 
		autoescape = opts.autoescape === undefined ? true : opts.autoescape,
		noCache = opts.noCache || false,
		watch = opts.watch || false,
		throwOnUndefined = opts.throwOnUndefined || false,
		env = new nunjucks.Environment(
			new nunjucks.FileSystemLoader(path, {
				noCache: noCache,
				watch: watch,
			}), {
				autoescape: autoescape,
				throwOnUndefined: throwOnUndefined
		});
	if (opts.filters) {
		for (let f in opts.filters) {
			env.addFilter(f, opts.filters[f]);
		}
	}
	return env;	

}

function templating(path, opts) {
	const env = createEnv(path, opts);
	return async (ctx, next) => {
		ctx.render = (view, model) => {
			ctx.response.body = env.render(view, Object.assign({}, ctx.state || {}, model || {}));
			ctx.response.type = 'text/html';
		};
		await next();
	};
}

module.exports = templating;