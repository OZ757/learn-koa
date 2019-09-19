const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const controller = require('./controller.js');
const templating = require('./templating.js');
const rest = require('./rest.js');
const app = new Koa();

// 输出请求 HTTP 方法 和 路径
app.use(async (ctx, next) => {
	console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
	await next();
});

// 路由添加静态资源
const staticFiles = require('./static-files.js');
app.use(staticFiles('/static/', __dirname + '/static'));

app.use(bodyParser());

// 添加模板
app.use(templating('views', {
	noCache: true,
	watch: true
}));

// 添加 REST, 处理 JSON 请求
app.use(rest.restify());

// 添加 controllers 下的 js 文件
app.use(controller());

app.listen(3000);
console.log('app started at port 3000...');