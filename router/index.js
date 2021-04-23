let Router = require('koa-router')
let Jsdk = require('../controller/jsdk')

let router = new Router()


router.get('/jsapi', Jsdk.api.bind(Jsdk))


module.exports = router