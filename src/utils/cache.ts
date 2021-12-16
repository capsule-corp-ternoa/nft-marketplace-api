import { Request, Response } from "express";
import apicache from 'apicache';

// apicache.options({debug: true})

export const cache = apicache.middleware

export const shouldCache = (req:Request, res: Response) => {
    let isShouldCache = false
    if (res.statusCode.toString()[0] !== "4" && res.statusCode.toString()[0] !== "5" && req.query.useCache && req.query.useCache === "true"){
        isShouldCache = true
        delete req.query.useCache
    }
    return isShouldCache
}

export const readyCache = cache(process.env.CACHE_DURATION,  shouldCache)
