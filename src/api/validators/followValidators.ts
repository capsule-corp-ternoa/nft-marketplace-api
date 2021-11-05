import Joi from "joi";
import { validateQuery } from ".";
import { LIMIT_MAX_PAGINATION } from "../../utils";

export type getFollowersFollowingQuery = {
    walletId: string
    pagination?: {
        page?: number
        limit?: number
    }
    filter?: {
        certifiedOnly?: boolean
        nameOrAddressSearch?: string
    }
}
export const validationGetFollowersFollowing = (query: any) => {
    const { walletId } = query;
    let { filter, pagination } = query
    if (filter) filter = JSON.parse(filter);
    if (pagination) pagination = JSON.parse(pagination);
    const validationSchema = Joi.object({
        walletId: Joi.string().required(),
        pagination: Joi.object({
            page: Joi.number().integer().min(0),
            limit: Joi.number().integer().min(0).max(LIMIT_MAX_PAGINATION),
        }),
        filter: Joi.object({
            certifiedOnly: Joi.bool(),
            nameOrAddressSearch: Joi.string(),
        }),
    });
    return validateQuery(validationSchema, { walletId, filter, pagination }) as getFollowersFollowingQuery;
};


export type countFollowersFollowingQuery = {
    walletId: string
}
export const validationCountFollowersFollowing = (query: any) => {
    const validationSchema = Joi.object({
        walletId: Joi.string().required(),
    });
    return validateQuery(validationSchema, query) as countFollowersFollowingQuery;
};


export type isUserFollowingQuery = {
    walletIdFollowed: string
    walletIdFollower: string
}
export const validationIsUserFollowing = (query: any) => {
    const validationSchema = Joi.object({
        walletIdFollowed: Joi.string().required(),
        walletIdFollower: Joi.string().required(),
    });
    return validateQuery(validationSchema, query) as isUserFollowingQuery;
};


export type followUnfollowQuery = {
    walletIdFollowed: string
    walletIdFollower: string
    cookie: string
}
export const validationFollowUnfollow = (query: any) => {
    const validationSchema = Joi.object({
        walletIdFollowed: Joi.string().required(),
        walletIdFollower: Joi.string().required(),
        cookie: Joi.string().required(),
    });
    return validateQuery(validationSchema, query) as followUnfollowQuery;
};