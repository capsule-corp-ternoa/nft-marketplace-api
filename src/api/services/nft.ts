import { gql, request } from "graphql-request";
import {
  DistinctNFTListResponse,
  INFT,
  NFTListResponse,
  CustomResponse,
} from "../../interfaces/graphQL";
import fetch from "node-fetch";
import { IMongoNft } from "../../interfaces/INft";
import FollowModel from "../../models/follow";
import NftModel from "../../models/nft";
import NftViewModel from "../../models/nftView";
import CategoryService from "./category"
import { populateNFT } from "../helpers/nftHelpers";
import QueriesBuilder from "./gqlQueriesBuilder";
import { TERNOA_API_URL, TIME_BETWEEN_SAME_USER_VIEWS } from "../../utils";
import { createNFTQuery, NFTBySeriesQuery, NFTQuery, NFTsQuery, statNFTsUserQuery } from "../validators/nftValidators";
import { IUser } from "src/interfaces/IUser";

const indexerUrl =
  process.env.INDEXER_URL || "https://indexer.chaos.ternoa.com";

export class NFTService {
  /**
   * Requests all NFTs from the blockchain
   * @param page? - Page number
   * @param limit? - Number of elements per page
   * @param listed? - filter for listed (1) or non listed (0), undefined gets all
   * @throws Will throw an error if can't request indexer
   */
  async getNFTs(query: NFTsQuery): Promise<CustomResponse<INFT>> {
    try {
      // Categories
      if (query.filter.categories){
        const withNoCategories = query.filter.categories.includes("none")
        const categoriesCode = query.filter.categories.filter(x => x!=="none")
        const allCategories = await CategoryService.getCategories()
        if (withNoCategories){
          const categoriesToExclude = allCategories.filter(x => !categoriesCode.includes(x.code))
          const mongoQuery = {categories: {$in: categoriesToExclude} }
          const mongoNfts = await NftModel.find(mongoQuery as any)
          const nftIdsToExclude = mongoNfts.map((nft) => nft.chainId)
          query.filter.idsToExcludeCategories = nftIdsToExclude
        }else{
          const categories = allCategories.filter(x => categoriesCode.includes(x.code))
          const mongoQuery = {categories: {$in: categories} }
          const mongoNfts = await NftModel.find(mongoQuery as any)
          const nftIds = mongoNfts.map((nft) => nft.chainId)
          query.filter.idsCategories = nftIds
        }
      }
      // Liked ?
      if (query.filter.liked){
        const data = await fetch(`${TERNOA_API_URL}/api/users/${query.filter.liked}?removeBurned=${true}`)
        const user = await data.json() as IUser
        query.filter.likedSeries = user.likedNFTs.length > 0 ? user.likedNFTs.map(x=>x.serieId) : []
      }
      // Indexer data
      const gqlQuery = QueriesBuilder.NFTs(query);
      console.log(gqlQuery)
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
      console.log(err)
      throw new Error("Couldn't get NFTs");
    }
  }

  /**
   * Requests a single NFT from the blockchain
   * @param id - the NFT's id
   * @param incViews - flag to inform if view counter should be incremented
   * @param viewerWalletId - wallet of viewer
   * @param viewerIp - ip viewer, to prevent spam views
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
        if (query.viewerIp && (views.length === 0 || date - Math.max.apply(null, views.filter(x => x.viewerIp === query.viewerIp).map(x => x.date)) > TIME_BETWEEN_SAME_USER_VIEWS)){
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
   * @param userWalletId - The user's wallet address
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
   * Creates a new nft document in DB
   * @param nftDTO - NFT data
   * @throws Will throw an error if can't create NFT document
   */
  async createNFT(query: createNFTQuery): Promise<IMongoNft> {
    try {
      const categories = await CategoryService.getCategoriesByCode(query.categories) 
      const data = {
          chainId: query.chainId,
          categories
      }
      const newNft = new NftModel(data);
      return await newNft.save();
    } catch (err) {
      throw new Error("NFT can't be created");
    }
  }

  /**
   * Finds NFTs with series included in seriesIds array
   * @param seriesIds - SeriesId to find
   * @param page? - Page number
   * @param limit? - Number of elements per page
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
      console.log(err)
      throw new Error("Couldn't get NFTs for this serie");
    }
  }

  /**
   * Finds a NFT in DB
   * @param nftId - NFT's blockchain id
   * @throws Will throw an error if nft ID doesn't exist
   */
  async findMongoNftFromId(nftId: string): Promise<IMongoNft> {
    try {
      const nft = await NftModel.findOne({ chainId: nftId }).populate("categories");
      if (!nft) return null;
      return nft as IMongoNft;
    } catch (err) {
      throw new Error("Couldn't get mongo NFT");
    }
  }
}

export default new NFTService();
