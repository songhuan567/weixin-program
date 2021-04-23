const crypto = require("crypto")
let { appId, appsecret, curUrl } = require('../config/config')
let { get } = require('../api/http')
let { getTimestap, randomStr } = require('../utils/util')
const db = require('../model/db')

class Jsdk {
    // https 请求方式: GET https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
    // GET https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=ACCESS_TOKEN&type=jsapi
    async api (ctx) {
        // let {access_token, ticket, expires_in} = await this.get_Token_Ticket()
        // ctx.body = {
        //     access_token,
        //     ticket,
        //     expires_in
        // }
        let timestamp = getTimestap()
        let options = {}
        let rs = await db('select * from ticket')
        // 如果数据库中有记录则判断是否过期，没有的话就将这个记录存起来
        if(rs.length > 0) {
            let start_time = rs[0].start_time
            let expires_in = rs[0].expires_in
            // 如果为真表示过期了，假 就是没有过期
            if(timestamp - start_time > expires_in) {
                // 过期的话需要重新的保存
                options = await this.get_Token_Ticket()
                let { access_token,ticket,expires_in} = options;
                db("update ticket set access_token=?,ticket=?,expires_in=?,start_time=?",[access_token,ticket,expires_in,timestamp])
            } else {
                options = rs[0]
            }
        } else {
            options = await this.get_Token_Ticket()
            await db('insert into ticket set ?', {...options, start_time: timestamp})
        }
        // 数据已经获得 可以计算 签名了
        // console.log(options)
        // 随机字符串
        let noncestr = randomStr(32)
        // 计算签名的 算法
        // jsapi_ticket=sM4AOVdWfPE4DxkXGEs8VMCPGGVi4C3VM0P37wVUCFvkVAy_90u5h9nbSlYy3-Sl-HhTdfl2fzFy1AOcHKP7qg&noncestr=Wm3WZYTPz0wzccnW&timestamp=1414587457&url=http://mp.weixin.qq.com?params=value

        let string1 = `jsapi_ticket=${options.ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${curUrl}`
        
        let signature = crypto.createHash("sha1").update(string1).digest("hex")

        ctx.body = {
            appId,
            timestamp,
            noncestr,
            signature

        }
    }
    
    // 获取token 和 票据
    async get_Token_Ticket () {
        let { access_token } = await this.get_accessToken()
        let { ticket, expires_in } = await this.get_getTicket(access_token)
        return {
            access_token, 
            ticket,
            expires_in,
        }
    }

    // 获取 token
    async get_accessToken () {
        let url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${ appId }&secret=${ appsecret }`
        let result = await get(url)
        return result.data
    }

    // 获取 票据
    async get_getTicket (access_token) {
        let url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${access_token}&type=jsapi`
        let result = await get(url)
        // console.log(result)
        return result.data
    }
}

module.exports = new Jsdk()