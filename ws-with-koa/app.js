const url = require('url');
const Cookies = require('cookies');

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const controller = require('./controller.js');
const templating = require('./templating.js');
const app = new Koa();

const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;

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

// 从 cookie 识别用户
app.use(async (ctx, next) => {
    ctx.state.user = parseUser(ctx.cookies.get('name') || '');
    await next();
})

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

// koa app的listen()方法返回http.Server
let server = app.listen(3000);

// 识别用户身份的逻辑
function parseUser(obj) {
    if (!obj) {
        return;
    }

    console.log('try parse: ' + obj);
    let s = '';
    if (typeof obj === 'string') {
        s = obj;
    } else if (obj.headers) {
        let cookies = new Cookies(obj, null);
        s = cookies.get('name');
    }
    if (s) {
        try {
            let user = JSON.parse(Buffer.from(s, 'base64').toString());
            console.log(`User: ${user.name}, ID: ${user.id}`);
            return user;
        } catch (e) {}
    }
}

function createWebSocketServer(server, onConnection, onMessage, onClose, onError) {
    // 创建WebSocketServer
    let wss = new WebSocketServer({
        server: server
    });

    // 为wss对象添加一个broadcase()方法 -- 把消息广播到所有WebSocket连接上
    wss.broadcast = function (data) {
        wss.clients.forEach((client) => {
            client.send(data);
        });
    };

    onConnection = onConnection || function () {
        console.log('[WebSocket] connected.');
    };
    onMessage = onMessage || function (msg) {
        console.log('[WebSocket] message received: ' + msg);
    };
    onClose = onClose || function (code, messgae) {
        console.log(`[WebSocket] closed: ${code} - ${messgae}`);
    };
    onError = onError || function (err) {
        console.log('[WebSocket] error: ' + err);
    };

    // 监听 connection 事件, 连接时
    wss.on('connection', function (ws, req) {
        // 请求地址
        let location = url.parse(req.url, true);
        console.log('[WebSocket] connection: ' + location.href);
        // 监听各种事件
        ws.on('message', onMessage);
        ws.on('close', onClose);
        ws.on('error', onError);
        
        // 是否为  ***
        if (location.pathname !== '/ws/chat') {
            // 停止 ws 请求
            ws.close(4000, 'Invalid URL');
        }

        // 识别用户
        let user = parseUser(req);
        if (!user) {
            // Cookie不存在或无效，直接关闭WebSocket
            ws.close(4001, 'Invalid user');
        }
        // 识别成功，把user绑定到该WebSocket对象
        ws.user = user;
        // 绑定WebSocketServer对象
        ws.wss = wss;
        onConnection.apply(ws);
    });
    // 已连接 WebSocketServer
    console.log('WebSocketServer was attached.')
    return wss;
}

// 消息ID
let messgaeIndex = 0;
// 以 JSON格式的字符串, 传递消息(不只是聊天的消息)
function createMessage(type, user, data) {
    messgaeIndex++;
    return JSON.stringify({
        id: messgaeIndex,
        type: type,
        user: user,
        data: data
    });
}

// 用户加入时的消息发送
function onConnect() {
    let user = this.user;
    let msg = createMessage('join', user, `${user.name} joined.`);
    this.wss.broadcast(msg);
}
// 用户聊天时的消息发送
function onMessage(messgae) {
    console.log(messgae);
    if (messgae && messgae.trim()) {
        let msg = createMessage('chat', this.user, messgae.trim());
        this.wss.broadcast(msg);
    }
}
// 用户退出时的消息发送
function onClose() {
    let user = this.user;
    let msg = createMessage('left', user, `${user.name} is left.`);
    this.wss.broadcast(msg);
}
        
app.wss = createWebSocketServer(server, onConnect, onMessage, onClose);
console.log('app started at port 3000...');