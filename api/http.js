let axios = require('axios')

let get = (url, params) => {
    return axios.get(url, { params })
}

let post = (url, params) => {
    return axios.post(url, params )
}


module.exports = {
    get, post
}