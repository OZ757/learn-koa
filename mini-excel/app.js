const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const controller = require('./controller');
const rest = require('./rest');
const app = new Koa();	

app.use(async (ctx, next) => {
	await next();
	const rt = ctx.response.get('X-Response-Time');
	console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});
app.use(async (ctx, next) => {
	const start = new Date().getTime();
	await next();
	const ms = new Date().getTime() - start;
	ctx.set('X-Response-Time', `${ms}ms`);
});

const staticFiles = require('./static-files');
app.use(staticFiles('/static/', __dirname + '/static'));

app.use(async (ctx, next) => {
	if (ctx.request.path === '/') {
		ctx.response.redirect('/static/index.html');
	} else {
		await next();
	}
});

app.use(bodyParser());

app.use(rest.restify());

app.use(controller());

app.listen(3000);
console.log('app started at port 3000...');