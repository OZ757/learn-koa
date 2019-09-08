const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const controller = require('./controller.js');
const templating = require('./templating.js');
const app = new Koa();

// 是否为生产环境
const isProduction = process.env.NODE_ENV === 'production';

// 记录URL以及页面执行时间
app.use(async (ctx, next) => {
    await next();
    const rt = ctx.response.get('X-Respose-Time');
    console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});
app.use(async (ctx, next) => {
    const start = new Date().getTime();
    await next();
    const ms = new Date().getTime() - start;
    ctx.set('X-Respose-Time', `${ms}ms`);
});

// 处理静态文件
if (! isProduction) {
    let staticFiles = require('./static-files.js');
    app.use(staticFiles('/static/', __dirname + '/static'));
}

// 解析POST请求
app.use(bodyParser());

// 使用nunjucks 模板引擎
app.use(templating('views',{
    noCache: !isProduction,
    watch: !isProduction,
}));

// 处理URL路由
app.use(controller());

app.listen(3000);
console.log('app started at port 3000...');