import Joi from "joi";
import { validateQuery } from ".";

export type getUserQuery = {
    id: string,
    incViews?: boolean,
    walletIdViewer?: string,
    viewerIp?: string, 
    populateLikes?: boolean
}
export const validationGetUser = (query: any) => {
    const validationSchema = Joi.object({
        id: Joi.string().required(),
        incViews: Joi.boolean(),
        walletIdViewer: Joi.string(),
        viewerIp: Joi.string(),
        populateLikes: Joi.boolean(),
    });
    return validateQuery(validationSchema, query) as getUserQuery;
};


export type reviewRequestedQuery = {
    id: string,
    cookie: string,
}
export const validationReviewRequested = (query: any) => {
    const validationSchema = Joi.object({
        id: Joi.string().required(),
        cookie: Joi.string().required(),
    });
    return validateQuery(validationSchema, query) as reviewRequestedQuery;
};


export type getAccountBalanceQuery = {
    id: string,
}
export const validationGetAccountBalance = (query: any) => {
    const validationSchema = Joi.object({
        id: Joi.string().required(),
    });
    return validateQuery(validationSchema, query) as getAccountBalanceQuery;
};


export type likeUnlikeQuery = {
    walletId: string,
    cookie: string,
}
export const validationLikeUnlike = (query: any) => {
    const validationSchema = Joi.object({
        walletId: Joi.string().required(),
        cookie: Joi.string().required(),
    });
    return validateQuery(validationSchema, query) as likeUnlikeQuery;
};



