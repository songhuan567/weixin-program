let Koa = require('koa')
let path = require('path')
let static = require('koa-static')
let Router = require('koa-router')

let indexRouter = require('./router/index')

let app = new Koa()

// 配置静态资源
app.use(static(
    path.join( __dirname,  './public')
))

// 配置路由
let router =  new Router()
router.use('/test', indexRouter.routes())
app.use(router.routes())



// 监听窗口
app.listen(3030, ()=>{
    console.log('serve is running on 3030')
})