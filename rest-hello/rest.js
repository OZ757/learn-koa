// 中间件: 根据 path (/api/开头) 来判断当前请求是否是一个 REST 请求 
module.exports = {
	// 错误处理函数
	APIError: function (code, message) {
		// 错误代码大类 (非 APIError, 输出默认)
		this.code = code || 'internal:unknown_error'; 
		// 子类
		this.message = message || '';
	},
	// JSON 数据传递函数
	restify: (pathPrefix) => {
		// 设置 REST API 前缀，默认为 /api/
		pathPrefix = pathPrefix || '/api/';
		return async (ctx, next) => {
			// 判断 REST API 前缀
			if (ctx.request.path.startsWith(pathPrefix)) {
				// 绑定 rest() 传递 JSON 数据
				ctx.rest = data => {
					ctx.response.type = 'application/json';
					ctx.response.body = data;
				}
				try {
					await next();	
				} catch (e) {
					// 返回错误
					ctx.response.status = 400;
					ctx.response.type = 'application/json';
					ctx.response.body = {
						code: e.code || 'internal:unknown_error',
						message: e.message || ''
					};
				}
			} else {
				await next();
			}
		};
	}
};