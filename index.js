const crypto = require("crypto");
const request = require("request-promise-native");

var publicApiRequest = function (endpoint, params) {
    let uri = "https://tradesatoshi.com/api/public/" + endpoint;
    if(typeof params === 'object')
        params = Object.entries(params).map(([key, val]) => `${key}=${val}`).join('&');
    return request(uri + "?" + params);
}

var privateApiRequest = function (api, secret, endpoint, params) {
    let nonce = Date.now();
    let uri = "https://tradesatoshi.com/api/private/" + endpoint;
    let postParams = Buffer.from(JSON.stringify(params)).toString("base64");

    let signatureUnsigned = api + "POST" + encodeURIComponent(uri).toLowerCase() + nonce + postParams;
    let decodedSecret = Buffer.from(secret, 'base64');
    let hmac = crypto.createHmac("sha512", decodedSecret);
    let signature = hmac.update(signatureUnsigned).digest("base64");
    let authHeader = "Basic " + api + ":" + signature + ":" + nonce;

    let options = {
        method: 'POST',
        uri: uri,
        headers : {
            "Authorization" : authHeader,
            "Content-Type":"application/json; charset=utf-8"
        },
        body: params,
        json: true
    };

    return request(options);
}

module.exports = {
    publicApiRequest: publicApiRequest,
    privateApiRequest: privateApiRequest
}
