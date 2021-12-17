import { NextFunction, Request, Response } from "express";
import apicache from 'apicache';

// apicache.options({debug: true})

const cache1 = apicache.middleware
const cache2 = apicache.clone().middleware
const cache3 = apicache.clone().middleware
const cache4 = apicache.clone().middleware
const cache5 = apicache.clone().middleware
const cache6 = apicache.clone().middleware
const cache7 = apicache.clone().middleware
const cache8 = apicache.clone().middleware

export const cacheMiddleware = (req:Request, res: Response, next: NextFunction) => {
    const paramName = firstQueryCacheParam(req.query)
    deleteParams(req)
    switch(paramName){
        case "useCache15":
            cache15(req, res, next);
            break;
        case "useCache30":
            cache30(req, res, next);
            break;
        case "useCache45":
            cache45(req, res, next);
            break;
        case "useCache60":
            cache60(req, res, next);
            break;
        case "useCache300":
            cache300(req, res, next);
            break;
        case "useCache600":
            cache600(req, res, next);
            break;
        case "useCache900":
            cache900(req, res, next);
            break;
        case "useCache1800":
            cache1800(req, res, next);
            break;
        default:
            next();
            break;
    }
}

const firstQueryCacheParam = (query: any) => {
    if (query.useCache15 && query.useCache15 === "true") return "useCache15"
    if (query.useCache30 && query.useCache30 === "true") return "useCache30"
    if (query.useCache45 && query.useCache45 === "true") return "useCache45"
    if (query.useCache60 && query.useCache60 === "true") return "useCache60"
    if (query.useCache300 && query.useCache300 === "true") return "useCache300"
    if (query.useCache600 && query.useCache600 === "true") return "useCache600"
    if (query.useCache900 && query.useCache900 === "true") return "useCache900"
    if (query.useCache1800 && query.useCache1800 === "true") return "useCache1800"
    return null
}

const deleteParams = (req: Request) => {
    delete req.query.useCache15
    delete req.query.useCache30
    delete req.query.useCache45
    delete req.query.useCache60
    delete req.query.useCache300
    delete req.query.useCache600
    delete req.query.useCache900
    delete req.query.useCache1800
}

const shouldCache = (_req:Request, res: Response) => {
    return res.statusCode.toString()[0] !== "4" && res.statusCode.toString()[0] !== "5"
}
const cacheMultiplier = process.env.CACHE_MULTIPLIER ? Number(process.env.CACHE_MULTIPLIER) : 1
const cacheDuration = (sec: number) => `${sec*cacheMultiplier} seconds` 

const cache15 = cache1(cacheDuration(15), shouldCache)
const cache30 = cache2(cacheDuration(30), shouldCache)
const cache45 = cache3(cacheDuration(45), shouldCache)
const cache60 = cache4(cacheDuration(60), shouldCache)
const cache300 = cache5(cacheDuration(300), shouldCache)
const cache600 = cache6(cacheDuration(600), shouldCache)
const cache900 = cache7(cacheDuration(900), shouldCache)
const cache1800 = cache8(cacheDuration(1800), shouldCache)