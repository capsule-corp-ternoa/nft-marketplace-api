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