import Joi from "joi";
import { LIMIT_MAX_PAGINATION } from "../../utils";
import { validateQuery } from ".";

export type getUsersQuery = {
    populateLikes?: boolean
    filter?: {
        walletIds?: string[]
        artist?: boolean
        verified?: boolean
        searchText?: string
    },
    pagination?: {
        page?: number
        limit?: number
    }
}
export const validationGetUsers = (query: any) => {
    let { pagination, filter } = query;
    if (pagination) pagination = JSON.parse(pagination)
    if (filter) filter = JSON.parse(filter)
    const validationSchema = Joi.object({
        populateLikes: Joi.boolean(),
        filter: Joi.object({
            walletIds: Joi.array().items(Joi.string()),
            artist: Joi.boolean(),
            verified: Joi.boolean(),
            searchText: Joi.string()
        }),
        pagination: Joi.object({
            page: Joi.number().integer().min(0),
            limit: Joi.number().integer().min(0).max(LIMIT_MAX_PAGINATION),
        }),
    });
    return validateQuery(validationSchema, { pagination, filter }) as getUsersQuery;
};

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