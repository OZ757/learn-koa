var index = 0;

module.exports = {
    'GET /signin': async (ctx, next) => {
        let names = 'ABCDEFGHIJ';
        let name = names[index % 10];
        ctx.render('signin.html', {
            name: `路人${name}`
        });
    },
    'POST /signin': async (ctx, next) => {
       index++;
       let name = ctx.request.body.name || '路人A';
       let user = {
            id: index,
            name: name,
            image: index % 10
       };
       let value = Buffer.from(JSON.stringify(user)).toString('base64');
       console.log(`Set cookie value: ${value}`);
       ctx.cookies.set('name', value);
       // 重定向
       ctx.response.redirect('/');
    },
    'GET /signout': async (ctx, next) => {
        ctx.cookies.set('name', '');
        ctx.response.redirect('/signin');
    }
};