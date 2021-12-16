import { Request, Response } from "express";
import apicache from 'apicache';

export const cache = apicache.middleware

export const shouldCache = (req:Request, res: Response) => {
    console.log("req.query.useCache")
    let isShouldCache = false
    console.log(req.query.useCache)
    if (res.statusCode.toString()[0] !== "4" && res.statusCode.toString()[0] !== "5" && req.query.useCache && req.query.useCache === "true"){
        console.log(req.query.useCache)
        isShouldCache = true
        delete req.query.useCache
        console.log(req.query.useCache)
    }
    return isShouldCache
}

export const readyCache = cache(process.env.CACHE_DURATION,  shouldCache, {debug: true})
