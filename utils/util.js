let randomstring = require('randomstring')

exports.getTimestap = ()=>{
    return Math.floor(new Date().getTime() / 1000)
}

exports.randomStr = (len)=>{
    return randomstring.generate(len)
}