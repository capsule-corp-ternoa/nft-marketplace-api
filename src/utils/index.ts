import fetch from 'node-fetch';
import AbortController from "abort-controller"
import cryptoJs from 'crypto-js'

export const TIME_BETWEEN_SAME_USER_VIEWS = 10000
export const LIMIT_MAX_PAGINATION = 50

export const fetchTimeout = (url: string, options: any = null, timeoutLimit = 30000) => {
    console.log('fetchTimeout:'+url + '-='+timeoutLimit);
    
    const controller = new AbortController();
    const signal = controller.signal
    const timeout = setTimeout(() => {
        console.log('timeoutReached:'+url);
        controller.abort()
    }, timeoutLimit)
    return fetch(url, {
        ...options,
        signal
    }).finally(() => {
        clearTimeout(timeout);
    });
};

export const removeURLSlash = (url: string) => {
    if (url.length === 0) return url
    const lastChar = url.charAt(url.length -1)
    if (lastChar === "/"){
        return url.slice(0, -1)
    }else{
        return url
    }
}

export const TERNOA_API_URL = process.env.TERNOA_API_URL ? removeURLSlash(process.env.TERNOA_API_URL) : ""

export const decryptCookie = (cookie: string) => {
    try{
        if (!process.env.SECRET_COOKIE) return cookie
        const bytes = cryptoJs.AES.decrypt(cookie, process.env.SECRET_COOKIE)
        const decryptedCookie = bytes.toString(cryptoJs.enc.Utf8)
        return decryptedCookie
    }catch(err){
        return ""
    }
}
