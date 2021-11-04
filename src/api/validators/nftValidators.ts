import Joi from "joi";
import { validateQuery } from ".";
import { LIMIT_MAX_PAGINATION } from "../../utils";

export type NFTsQuery = {
  pagination?: {
    page?: number
    limit?: number
  };
  sort?: string
  filter?: {
    ids?: string[]
    idsToExclude?: string[]
    idsCategories?: string[]
    idsToExcludeCategories?: string[]
    liked?: string
    likedSeries?: string[]
    marketplaceId?: number
    listed?: number
    categories?: string[]
    owner?: string
    creator?: string
    price?: string
    priceFilter?: string
    priceTiime?: string
    priceTiimeFilter?: string
    locked?: boolean
    isCapsule?: boolean
    noSeriesData?: boolean
  };
};
export const validationGetNFTs = (query: any) => {
  const { sort } = query
  let { pagination, filter } = query;
  if (pagination) pagination = JSON.parse(pagination);
  if (filter) filter = JSON.parse(filter);
  const validationSchema = Joi.object({
    pagination: Joi.object({
      page: Joi.number().integer().min(0),
      limit: Joi.number().integer().min(0).max(LIMIT_MAX_PAGINATION),
    }),
    sort: Joi.string().regex(/[a-zA-Z]{1,}:[a-zA-Z]{1,},{0,1}/),
    filter: Joi.object({
      ids: Joi.array().items(Joi.number().integer().min(0)),
      idsToExclude: Joi.array().items(Joi.number().integer().min(0)),
      liked: Joi.string(),
      marketplaceId: Joi.number().integer().min(0),
      listed: Joi.number().integer().min(0).max(1),
      categories: Joi.array().items(Joi.string()),
      owner: Joi.string(),
      creator: Joi.string(),
      price: Joi.string(),
      priceFilter: Joi.string(),
      priceTiime: Joi.string(),
      priceTiimeFilter: Joi.string(),
      locked: Joi.boolean(),
      isCapsule: Joi.boolean(),
      noSeriesData: Joi.boolean(),
    }),
  });
  return validateQuery(validationSchema, { pagination, sort, filter }) as NFTsQuery;
};


export type NFTQuery = {
  id: string
  viewerWalletId?: string
  viewerIp?: string
  incViews?: boolean
  filter?: {
    marketplaceId?: number
    noSeriesData?: boolean
  };
};
export const validationGetNFT = (query: any) => {
  const { id, incViews, viewerWalletId, viewerIp } = query;
  let { filter } = query
  if (filter) filter = JSON.parse(filter);
  const validationSchema = Joi.object({
    id: Joi.number().required().integer().min(0),
    filter: Joi.object({
      marketplaceId: Joi.number().integer().min(0),
      noSeriesData: Joi.boolean(),
    }),
    incViews: Joi.boolean(),
    viewerWalletId: Joi.string(),
    viewerIp: Joi.string()
  });
  return validateQuery(validationSchema, { id, filter, incViews, viewerWalletId, viewerIp }) as NFTQuery;
};


export type statNFTsUserQuery = {
  id: string // wallet address
  filter?: {
    marketplaceId?: number
  };
};
export const validationGetStatNFTsUser = (query: any) => {
  const { id } = query;
  let { filter } = query
  if (filter) filter = JSON.parse(filter);
  const validationSchema = Joi.object({
    id: Joi.string().required(),
    filter: Joi.object({
      marketplaceId: Joi.number().integer().min(0),
    }),
  });
  return validateQuery(validationSchema, { id, filter }) as statNFTsUserQuery;
};


export type NFTBySeriesQuery = {
  seriesIds: string[]
  pagination?: {
    page?: number
    limit?: number
  };
};
export const validationNFTsBySeries = (query: any) => {
  let { pagination, seriesIds } = query
  seriesIds = typeof seriesIds === "string" ? [seriesIds] : seriesIds
  if (pagination) pagination = JSON.parse(pagination);
  const validationSchema = Joi.object({
    seriesIds: Joi.array().required().items(Joi.string().required()),
    pagination: Joi.object({
      page: Joi.number().integer().min(0),
      limit: Joi.number().integer().min(0).max(LIMIT_MAX_PAGINATION),
    })
  });
  return validateQuery(validationSchema, { pagination, seriesIds }) as NFTBySeriesQuery;
};


export type createNFTQuery = {
  chainId: string
  categories: string[]
};
export const validationCreateNFT = (query: any) => {
  const validationSchema = Joi.object({
    chainId: Joi.number().required(),
    categories: Joi.array().required().items(Joi.string().required())
  });
  return validateQuery(validationSchema, query) as createNFTQuery;
};