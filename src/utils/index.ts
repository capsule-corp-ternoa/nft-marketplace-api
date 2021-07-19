import fetch from 'node-fetch';
import AbortController from "abort-controller"
export const fetchTimeout = (url: string, options: any = null, timeoutLimit = 30000) => {
    const controller = new AbortController();
    const signal = controller.signal
    const timeout = setTimeout(() => {
        controller.abort()
    }, timeoutLimit)
    return fetch(url, {
        ...options,
        signal
    }).finally(() => {
        clearTimeout(timeout);
    });
};

export function validateEmail(mail: string){
    const mailRegEx = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/
    return mail.match(mailRegEx)
}

export function validateTwitter(twitterName: string){
    const twitterNameRegEx = /^@[a-zA-Z0-9_]/
    return twitterName.match(twitterNameRegEx)
}

export function validateUrl(url: string){
    const urlRegEx = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
    return url.match(urlRegEx)
}