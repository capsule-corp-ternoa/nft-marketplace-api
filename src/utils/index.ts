import fetch from 'node-fetch';
import AbortController from "abort-controller"
import { decodeAddress, signatureVerify } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';

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

export const validateEmail = (mail: string) => {
    const mailRegEx = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/
    return mail.match(mailRegEx)
}

export const validateTwitter = (twitterName: string) => {
    const twitterNameRegEx = /^@[a-zA-Z0-9_]/
    return twitterName.match(twitterNameRegEx)
}

export const validateUrl = (url: string) => {
    const urlRegEx = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
    return url.match(urlRegEx)
}

export const isValidSignature = (signedMessage: string, signature: string, address: string) => {
    const publicKey = decodeAddress(address);
    const hexPublicKey = u8aToHex(publicKey);
    return signatureVerify(signedMessage, signature, hexPublicKey).isValid;
}