import { request } from "graphql-request";
import { DistinctNFTListResponse, INFT, NFTListResponse, CustomResponse, ISeries, INFTTransfer } from "../../interfaces/graphQL";
import fetch from "node-fetch";
import { IMongoNft } from "../../interfaces/INft";
import FollowModel from "../../models/follow";
import NftModel from "../../models/nft";
import NftViewModel from "../../models/nftView";
import CategoryService from "./category"
import { populateNFT } from "../helpers/nftHelpers";
import QueriesBuilder from "./gqlQueriesBuilder";
import { TERNOA_API_URL, TIME_BETWEEN_SAME_USER_VIEWS } from "../../utils";
import { canAddToSeriesQuery, addCategoriesNFTsQuery, getHistoryQuery, getSeriesStatusQuery, NFTBySeriesQuery, NFTQuery, NFTsQuery, statNFTsUserQuery } from "../validators/nftValidators";
import { IUser } from "../../interfaces/IUser";
import CategoryModel from "../../models/category";
import { ICategory } from "../../interfaces/ICategory";

const indexerUrl = process.env.INDEXER_URL || "https://indexer.chaos.ternoa.com";

export class NFTService {
  /**
   * Requests NFTs from the indexer
   * @param query - query (see NFTsQuery)
   * @throws Will throw an error if can't request indexer
   */
  async getNFTs(query: NFTsQuery): Promise<CustomResponse<INFT>> {
    try {
      // Categories
      if (query.filter?.categories){
        const withNoCategories = query.filter.categories.includes("none")
        const categoriesCode = query.filter.categories.filter(x => x!=="none")
        const allCategories = await CategoryService.getCategories({})
        const categories = allCategories.map(x => x.code).filter(x => categoriesCode.includes(x))
        const mongoQuery = {categories: {$in: categories} }
        const mongoNfts = await NftModel.find(mongoQuery as any)
        const nftIds = mongoNfts.map((nft) => nft.chainId)
        if (withNoCategories){
          const categoriesToExclude = allCategories.map(x => x.code).filter(x => !categoriesCode.includes(x))
          const mongoQueryExclude = {$and: [{categories: {$in: categoriesToExclude}}, {chainId: {$nin: nftIds}}]}
          const mongoNFTsToExclude = await NftModel.find(mongoQueryExclude as any)
          const nftIdsToExclude = mongoNFTsToExclude.map((nft) => nft.chainId)
          query.filter.idsToExcludeCategories = nftIdsToExclude
        }else{
          query.filter.idsCategories = nftIds
        }
      }
      // Liked ?
      if (query.filter?.liked){
        const data = await fetch(`${TERNOA_API_URL}/api/users/${query.filter.liked}?removeBurned=${true}`)
        const user = await data.json() as IUser
        query.filter.likedSeries = user.likedNFTs.length > 0 ? user.likedNFTs.map(x=>x.serieId) : []
      }
      // Indexer data
      const gqlQuery = QueriesBuilder.NFTs(query);
      const res: DistinctNFTListResponse = await request(indexerUrl, gqlQuery);
      const NFTs = res.distinctSerieNfts.nodes;
      // Series Data
      const seriesData = await this.getNFTsForSeries({seriesIds: NFTs.map(x => x.serieId)})
      // Populate
      res.distinctSerieNfts.nodes = await Promise.all(NFTs.map(async (NFT) => populateNFT(NFT, seriesData, query)))
      // Result formatting
      const result: CustomResponse<INFT>={
        totalCount: res.distinctSerieNfts.totalCount,
        data: res.distinctSerieNfts.nodes,
        hasNextPage: res.distinctSerieNfts.pageInfo?.hasNextPage || undefined,
        hasPreviousPage: res.distinctSerieNfts.pageInfo?.hasPreviousPage || undefined
      }
      return result
    } catch (err) {
      throw new Error("Couldn't get NFTs");
    }
  }

  /**
   * Requests a single NFT from the indexer
   * @param query - query (see NFTQuery)
   * @throws Will throw an error if the NFT can't be found
   */
  async getNFT(
    query: NFTQuery
  ): Promise<INFT> {
    try {
      const gqlQuery = QueriesBuilder.NFTfromId(query);
      const result: NFTListResponse = await request(indexerUrl, gqlQuery);
      let NFT = result.nftEntities.nodes[0];
      if (!NFT) throw new Error();
      const seriesData = await this.getNFTsForSeries({seriesIds: [NFT.serieId]})
      NFT = await populateNFT(NFT, seriesData, query);
      let viewsCount = 0
      if (query.incViews){
        const date = +new Date()
        const views = await NftViewModel.find(NFT.serieId!=="0" ? {viewedSerie: NFT.serieId} : {viewedId: query.id})
        if (query.viewerIp && 
            (
              views.length === 0 || 
              date - Math.max.apply(null, views.filter(x => x.viewerIp === query.viewerIp).map(x => x.date)) > TIME_BETWEEN_SAME_USER_VIEWS
            )
        ) {
          const newView = new NftViewModel({viewedSerie: NFT.serieId, viewedId: query.id, viewer: query.viewerWalletId, viewerIp: query.viewerIp, date})
          await newView.save();
          viewsCount = views.length + 1
        }else{
          viewsCount = views.length
        }
      }
      return { ...NFT, viewsCount};
    } catch (err) {
      throw new Error("Couldn't get NFT");
    }
  }

  /**
   * Gets user stat (number of owned, created, listed, not listed, followers, followed)
   * @param query - query (see statNFTsUserQuery)
   * @throws Will throw an error if can't request indexer or db or user not find
   */
   async getStatNFTsUser(query: statNFTsUserQuery): Promise<{
    countOwned: number, 
    countOwnedListed: number, 
    countOwnedUnlisted: number, 
    countCreated: number, 
    countFollowers: number, 
    countFollowed: number
   }> {
    try {
      const [owned, ownedListed, ownedUnlisted, created, followers, followed] = await Promise.all([
        request(indexerUrl, QueriesBuilder.countOwnerOwned(query)),
        request(indexerUrl, QueriesBuilder.countOwnerOwnedListed(query)),
        request(indexerUrl, QueriesBuilder.countOwnerOwnedUnlisted(query)),
        request(indexerUrl, QueriesBuilder.countCreated(query)),
        FollowModel.find({ followed: query.id }),
        FollowModel.find({ follower: query.id })
      ])
      const countOwned: number = owned.nftEntities.totalCount;
      const countOwnedListed: number = ownedListed.nftEntities.totalCount;
      const countOwnedUnlisted: number = ownedUnlisted.nftEntities.totalCount;
      const countCreated: number = created.nftEntities.totalCount;
      const countFollowers: number = followers.length
      const countFollowed: number = followed.length
      return {countOwned, countOwnedListed, countOwnedUnlisted, countCreated, countFollowers, countFollowed}
    } catch (err) {
      throw new Error("Couldn't get users stat");
    }
  }

  /**
   * Creates a new nft document in DB (for offchain categories)
   * @param query - query (see addCategoriesNFTsQuery)
   * @throws Will throw an error if can't create NFT document
   */
  async addCategoriesNFTs(query: addCategoriesNFTsQuery): Promise<IMongoNft[]> {
    try {
      const categories = await CategoryService.getCategories({filter: {codes: query.categories}})
      const categoriesCodes = categories.map(x => x.code)
      const data: {chainId: string, categories: string[]}[] = query.chainIds.map(x => { return {chainId: x, categories: categoriesCodes} })
      const mongoNFTs: IMongoNft[] = await NftModel.insertMany(data)
      return mongoNFTs;
    } catch (err) {
      throw new Error("NFTs with categories can't be created");
    }
  }

  /**
   * Finds NFTs with series included in seriesIds array
   * @param query - query (see NFTBySeriesQuery)
   * @throws Will throw an error if nft ID doesn't exist
   */
   async getNFTsForSeries(query: NFTBySeriesQuery): Promise<CustomResponse<INFT>>{
    try{
      const gqlQuery = QueriesBuilder.NFTsForSeries(query)
      const res: NFTListResponse = await request(indexerUrl, gqlQuery);
      const result: CustomResponse<INFT>={
        totalCount: res.nftEntities.totalCount,
        data: res.nftEntities.nodes,
        hasNextPage: res.nftEntities.pageInfo?.hasNextPage || undefined,
        hasPreviousPage: res.nftEntities.pageInfo?.hasPreviousPage || undefined
      }
      return result
    }catch(err){
      throw new Error("Couldn't get NFTs for those series");
    }
  }

  /**
   * Finds a NFT in DB
   * @param nftId - NFT's blockchain id
   * @throws Will throw an error if nft ID doesn't exist
   */
  async findCategoriesFromNFTId(nftId: string): Promise<ICategory[]> {
    try {
      const nft = await NftModel.findOne({ chainId: nftId });
      if (!nft) return null;
      const categories = await CategoryModel.find({code: {$in: nft.categories}})
      return categories as ICategory[];
    } catch (err) {
      throw new Error("Couldn't get categories for this NFT");
    }
  }

  /**
   * Finds series and return its data
   * @param query - query (see getSeriesStatusQuery)
   * @throws Will throw an error if seriesId is not found
   */
   async getSeriesStatus(query: getSeriesStatusQuery): Promise<ISeries>{
    try{
      const gqlQuery = QueriesBuilder.getSeries(query)
      const res = await request(indexerUrl, gqlQuery);
      if (!res.serieEntities.nodes || res.serieEntities.nodes.length === 0) throw Error()
      return res.serieEntities.nodes[0]
    }catch(err){
      throw new Error("Couldn't get series status");
    }
  }

  /**
   * Returns true if specified walletId can add to series
   * @param query - query (see canAddToSeriesQuery)
   * @throws Will throw an error if seriesId is not found
   */
     async canAddToSeries(query: canAddToSeriesQuery): Promise<boolean>{
      try{
        const gqlQuery = QueriesBuilder.getSeries(query)
        const res = await request(indexerUrl, gqlQuery);
        if (!res.serieEntities.nodes || res.serieEntities.nodes.length === 0) return true
        const series:ISeries = res.serieEntities.nodes[0]
        if (series.locked || series.owner!==query.walletId) return false
        return true
      }catch(err){
        throw new Error("Couldn't get information about this series");
      }
    }

  /**
   * Return the history of the serie specified
   * @param query - query (see getHistoryQuery)
   * @throws Will throw an error if indexer is not reachable
   */
    async getHistory(query: getHistoryQuery): Promise<CustomResponse<INFTTransfer>>{
    try{
      const gqlQuery = QueriesBuilder.getHistory(query)
      const res = await request(indexerUrl, gqlQuery);
      const data: INFTTransfer[] = []
      if (query.filter?.grouped){
        let previousRow:INFTTransfer = null
        let tempQty = 1
        res.nftTransferEntities.nodes.forEach((x: INFTTransfer) => {
          const currentRow = x
          if (previousRow){
            if (
              currentRow.from === previousRow.from &&
              currentRow.to === previousRow.to && 
              currentRow.amount === previousRow.amount &&
              currentRow.seriesId === previousRow.seriesId &&
              currentRow.typeOfTransaction === previousRow.typeOfTransaction
            ){
              tempQty += 1
            }else{
              previousRow.quantity = tempQty
              data.push(previousRow)
              tempQty = 1
            }
          }
          previousRow = currentRow
        });
        if (previousRow){
          previousRow.quantity = tempQty
          data.push(previousRow)
        }
      }
      const result: CustomResponse<INFTTransfer>={
        totalCount: res.nftTransferEntities.totalCount,
        data: query.filter?.grouped ? data : res.nftTransferEntities.nodes,
        hasNextPage: res.nftTransferEntities.pageInfo?.hasNextPage || undefined,
        hasPreviousPage: res.nftTransferEntities.pageInfo?.hasPreviousPage || undefined
      }
      return result
    }catch(err){
      console.log(err)
      throw new Error("Couldn't get history information about this nft / series");
    }
  }
}

export default new NFTService();
