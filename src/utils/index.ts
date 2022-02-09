import fetch from "node-fetch";
import AbortController from "abort-controller";
import cryptoJs from "crypto-js";

export const TIME_BETWEEN_SAME_USER_VIEWS = 6 * (60 * 60 * 1000);
export const LIMIT_MAX_PAGINATION = 50;

export const fetchTimeout = async  (
  url: string,
  options: any = null,
  timeoutLimit = 30000
) => {
  const controller = new AbortController();
  const signal = controller.signal;
  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutLimit);
  return fetch(url, {
    ...options,
    signal,
  }).finally(() => {
    clearTimeout(timeout);
  });
};

export const isURL = (str: string) => {
  let url;
  try {
    url = new URL(str);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
};

export const removeURLSlash = (url: string) => {
  if (url.length === 0) return url;
  const lastChar = url.charAt(url.length - 1);
  if (lastChar === "/") {
    return url.slice(0, -1);
  } else {
    return url;
  }
};

export const TERNOA_API_URL = process.env.TERNOA_API_URL
  ? removeURLSlash(process.env.TERNOA_API_URL)
  : "";

export const decryptCookie = (cookie: string) => {
  try {
    if (!process.env.SECRET_COOKIE) return cookie;
    const bytes = cryptoJs.AES.decrypt(cookie, process.env.SECRET_COOKIE);
    const decryptedCookie = bytes.toString(cryptoJs.enc.Utf8);
    return decryptedCookie;
  } catch (err) {
    return "";
  }
};

export const convertSortString = (sortString: string) => {
  if (sortString) {
    const sortArray = sortString.split(",")
    let finalString = ""
    sortArray.forEach((x) => {
      const fieldArray = x.split(":");
      if (fieldArray[0]) {
        finalString += `${fieldArray[0].toUpperCase()}_${
          fieldArray[1] ? fieldArray[1].toUpperCase() : "ASC"
        },`;
      }
    });
    return finalString
  } else {
    return "";
  }
};

export const convertSortStringDistinct = (sortString: string) => {
  if (sortString) {
    const pluginFilters = ["TIMESTAMP_CREATE", "PRICE", "PRICE_ROUNDED", "LISTED", "IS_CAPSULE"]
    const sortArray = sortString.split(",")
    let regularFilterString = ""
    let customFilterString = ""
    sortArray.forEach((x) => {
      const fieldArray = x.split(":");
      if (fieldArray[0]) {
        if (!pluginFilters.includes(fieldArray[0])){
          regularFilterString += `${fieldArray[0].toUpperCase()}_${
            fieldArray[1] ? fieldArray[1].toUpperCase() : "ASC"
          },`;
        }else{
          switch(fieldArray[0]){
            case "LISTED":
              customFilterString += `listedSortOrder: ${fieldArray[1] ? fieldArray[1].toLowerCase() : "desc"} `;
              break;
            case "IS_CAPSULE":
              customFilterString += `isCapsuleSortOrder: ${fieldArray[1] ? fieldArray[1].toLowerCase() : "asc"} `;
              break;
            case "TIMESTAMP_CREATE":
              customFilterString += `timestampCreateSortOrder: ${fieldArray[1] ? fieldArray[1].toLowerCase() : "desc"} `;
              break;
            case "PRICE" || "PRICE_ROUNDED":
              customFilterString += `priceSortOrder: ${fieldArray[1] ? fieldArray[1].toLowerCase() : "asc"} `;
              break;
            default:
              break;
          }
        }
      }
    });
    return `
      ${customFilterString.length > 0 ? customFilterString : ""}
      ${regularFilterString.length > 0 ? `orderBy: [${regularFilterString}]` : ""}
    `;
  } else {
    return "";
  }
};
