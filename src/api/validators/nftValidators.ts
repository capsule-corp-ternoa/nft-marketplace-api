import Joi from "joi";
import { validateQuery } from ".";
import { LIMIT_MAX_PAGINATION } from "../../utils";

export type NFTsQuery = {
  pagination?: {
    page?: number
    limit?: number
  }
  sort?: string
  sortMongo?: string
  filter?: {
    ids?: string[]
    idsToExclude?: string[]
    idsCategories?: string[]
    idsToExcludeCategories?: string[]
    liked?: string
    series?: string[]
    marketplaceId?: number
    listed?: boolean
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
  }
}
export const validationGetNFTs = (query: any) => {
  const { sort, sortMongo } = query
  let { pagination, filter } = query;
  if (pagination) pagination = JSON.parse(pagination);
  if (filter) filter = JSON.parse(filter);
  const validationSchema = Joi.object({
    pagination: Joi.object({
      page: Joi.number().integer().min(0),
      limit: Joi.number().integer().min(0).max(LIMIT_MAX_PAGINATION),
    }),
    sort: Joi.string().regex(/[a-zA-Z]{1,}:[a-zA-Z]{1,},{0,1}/),
    sortMongo: Joi.string(),
    filter: Joi.object({
      ids: Joi.array().items(Joi.number().integer().min(0)),
      idsToExclude: Joi.array().items(Joi.number().integer().min(0)),
      liked: Joi.string(),
      marketplaceId: Joi.number().integer().min(0),
      listed: Joi.boolean(),
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
  })
  return validateQuery(validationSchema, { pagination, sort, sortMongo, filter }) as NFTsQuery;
}


export type NFTQuery = {
  id: string
  viewerWalletId?: string
  viewerIp?: string
  incViews?: boolean
  filter?: {
    marketplaceId?: number
    noSeriesData?: boolean
  }
}
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
  })
  return validateQuery(validationSchema, { id, filter, incViews, viewerWalletId, viewerIp }) as NFTQuery;
}


export type statNFTsUserQuery = {
  id: string // wallet address
  filter?: {
    marketplaceId?: number
  }
}
export const validationGetStatNFTsUser = (query: any) => {
  const { id } = query;
  let { filter } = query
  if (filter) filter = JSON.parse(filter);
  const validationSchema = Joi.object({
    id: Joi.string().required(),
    filter: Joi.object({
      marketplaceId: Joi.number().integer().min(0),
    })
  })
  return validateQuery(validationSchema, { id, filter }) as statNFTsUserQuery;
}


export type NFTBySeriesQuery = {
  seriesIds: string[]
  pagination?: {
    page?: number
    limit?: number
  }
}
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
  })
  return validateQuery(validationSchema, { pagination, seriesIds }) as NFTBySeriesQuery;
}


export type addCategoriesNFTsQuery = {
  creator: string
  chainIds: string[]
  categories: string[]
  nftsAuthToken: string
}
export const validationAddCategoriesNFTs = (query: any) => {
  const validationSchema = Joi.object({
    creator: Joi.string().required(),
    chainIds: Joi.array().required().items(Joi.number().required()),
    categories: Joi.array().required().items(Joi.string().required()),
    nftsAuthToken: Joi.string().required()
  })
  return validateQuery(validationSchema, query) as addCategoriesNFTsQuery;
}

export type getSeriesStatusQuery = {
  seriesId: string
}
export const validationGetSeries = (query: any) => {
  const validationSchema = Joi.object({
    seriesId: Joi.string().required(),
  })
  return validateQuery(validationSchema, query) as getSeriesStatusQuery;
}

export type canAddToSeriesQuery = {
  seriesId: string
  walletId: string
}
export const validationCanAddToSeries = (query: any) => {
  const validationSchema = Joi.object({
    seriesId: Joi.string().required(),
    walletId: Joi.string().required(),
  })
  return validateQuery(validationSchema, query) as canAddToSeriesQuery;
}

export type getHistoryQuery = {
  seriesId: string
  nftId: string
  sort?: string
  pagination?: {
    page?: number
    limit?: number
  }
  filter?: {
    grouped?: boolean
    onlyNftId?: boolean
    from?: string
    to?: string
    typeOfTransaction?: string
    timestamp?: Date
    timestampFilter?: string
    amount?: number
    amountFilter?: string
  }
}
export const validationGetHistory = (query: any) => {
  const { sort } = query
  let { pagination, filter } = query;
  if (pagination) pagination = JSON.parse(pagination);
  if (filter) filter = JSON.parse(filter);
  const validationSchema = Joi.object({
    seriesId: Joi.string().required(),
    nftId: Joi.string().required(),
    sort: Joi.string(),
    pagination: Joi.object({
      page: Joi.number().integer().min(0),
      limit: Joi.number().integer().min(0).max(LIMIT_MAX_PAGINATION),
    }),
    filter: Joi.object({
      grouped: Joi.boolean(),
      onlyNftId: Joi.boolean(),
      from: Joi.string(),
      to: Joi.string(),
      typeOfTransaction: Joi.string(),
      timestamp: Joi.date(),
      timestampFilter: Joi.string(),
      amount: Joi.number(),
      amountFilter: Joi.string(),
    }),
  })
  return validateQuery(validationSchema, {seriesId: query.seriesId, nftId: query.nftId, pagination, sort, filter}) as getHistoryQuery;
}