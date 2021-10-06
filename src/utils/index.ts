import fetch from 'node-fetch';
import AbortController from "abort-controller"

export const TIME_BETWEEN_SAME_USER_VIEWS = 10000
export const LIMIT_MAX_PAGINATION = 50

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
