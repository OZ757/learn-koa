const path = require('path');
const mime = require('mime');
const fs = require('mz/fs');

function staticFiles(url, dir) {
    return async (ctx, next) => {
        let rpath = ctx.request.path;
        // startsWith() 是否以给定字符串为开头
        if (rpath.startsWith(url)) {
                // substring() 提取字符串，从指定位置开始
                let fp = path.join(dir, rpath.substring(url.length));
                 if (await fs.exists(fp)) {
                    // 查找文件的mime (文件类型)
                    ctx.response.type = mime.getType(rpath);
                    // 读取文件内容并赋值给response.body
                    ctx.response.body = await fs.readFile(fp);
                } else {
                    // 文件不存在
                    ctx.response.status = 404;
                }
        } else {
            // 不是指定前缀的URL，继续处理下一个middleware
            await next();
        }
    };
}

module.exports = staticFiles;