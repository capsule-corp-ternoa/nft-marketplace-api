import { request } from "graphql-request";
import mongoose from "mongoose";
import {
  DistinctNFTListResponse,
  INFT,
  NFTListResponse,
  CustomResponse,
} from "../../interfaces/graphQL";
import { IMongoNft, INftDto } from "../../interfaces/INft";
import FollowModel from "../../models/follow";
import NftModel from "../../models/nft";
import NftViewModel from "../../models/nftView";
import CategoryService from "./category"
import { populateNFT } from "../helpers/nftHelpers";
import QueriesBuilder from "./gqlQueriesBuilder";
import { TIME_BETWEEN_SAME_USER_VIEWS } from "../../utils";

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
  async getAllNFTs(marketplaceId: string|undefined, page?: string, limit?: string, listed?: string): Promise<CustomResponse<INFT>> {
    try {
      console.log('getAllNFTs');
      console.time('indexer')
      const query = QueriesBuilder.allNFTs(marketplaceId, limit, page, listed);
      const res: DistinctNFTListResponse = await request(indexerUrl, query);
      console.timeEnd('indexer')
      const NFTs = res.distinctSerieNfts.nodes;
      console.time('map')
      res.distinctSerieNfts.nodes = await Promise.all(NFTs.map(async (NFT) => populateNFT(NFT)))
      console.timeEnd('map')
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
   * Requests a single NFT from the blockchain
   * @param id - the NFT's id
   * @param incViews - flag to inform if view counter should be incremented
   * @param viewerWalletId - wallet of viewer
   * @param viewerIp - ip viewer, to prevent spam views
   * @throws Will throw an error if the NFT can't be found
   */
  async getNFT(
    id: string, 
    incViews: boolean = false, 
    viewerWalletId: string = null,
    viewerIp: string = null, 
  ): Promise<INFT> {
    try {
      const query = QueriesBuilder.NFTfromId(id);
      const result: NFTListResponse = await request(indexerUrl, query);
      let NFT = result.nftEntities.nodes[0];
      if (!NFT) throw new Error();
      NFT = await populateNFT(NFT);
      let viewsCount = 0
      if (incViews){
        const date = +new Date()
        const views = await NftViewModel.find(NFT.serieId!=="0" ? {viewedSerie: NFT.serieId} : {viewedId: id})
        if (viewerIp && (views.length === 0 || date - Math.max.apply(null, views.filter(x => x.viewerIp === viewerIp).map(x => x.date)) > TIME_BETWEEN_SAME_USER_VIEWS)){
          const newView = new NftViewModel({viewedSerie: NFT.serieId, viewedId: id, viewer: viewerWalletId, viewerIp, date})
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
   * Gets all NFTs owned by a user
   * @param ownerId - The user's blockchain id
   * @param page? - Page number
   * @param limit? - Number of elements per page
   * @param listed? - filter for listed (1) or non listed (0), undefined gets all
   * @throws Will throw an error if can't request indexer
   */
  async getNFTsFromOwner(marketplaceId: string|undefined, ownerId: string, page?: string, limit?: string, listed?: string): Promise<CustomResponse<INFT>> {
    try {
      const query = QueriesBuilder.NFTsFromOwnerId(marketplaceId, ownerId, limit, page, listed);
      const res: DistinctNFTListResponse = await request(indexerUrl, query);
      const NFTs = res.distinctSerieNfts.nodes;
      res.distinctSerieNfts.nodes = await Promise.all(NFTs.map(async (NFT) => populateNFT(NFT)))
      const result: CustomResponse<INFT>={
        totalCount: res.distinctSerieNfts.totalCount,
        data: res.distinctSerieNfts.nodes,
        hasNextPage: res.distinctSerieNfts.pageInfo?.hasNextPage || undefined,
        hasPreviousPage: res.distinctSerieNfts.pageInfo?.hasPreviousPage || undefined
      }
      return result;
    } catch (err) {
      throw new Error("Couldn't get user's owned NFTs");
    }
  }

  /**
   * Gets all NFTs created by a user
   * @param creatorId - The user's blockchain id
   * @param page? - Page number
   * @param limit? - Number of elements per page
   * @param listed? - filter for listed (1) or non listed (0), undefined gets all
   * @throws Will throw an error if can't request indexer
   */
  async getNFTsFromCreator(creatorId: string, page?: string, limit?: string, listed?: string): Promise<CustomResponse<INFT>> {
    try {
      const query = QueriesBuilder.NFTsFromCreatorId(creatorId, limit, page, listed);
      const res: DistinctNFTListResponse = await request(indexerUrl, query);
      const NFTs = res.distinctSerieNfts.nodes;
      res.distinctSerieNfts.nodes = await Promise.all(NFTs.map(async (NFT) => populateNFT(NFT)))
      const result: CustomResponse<INFT>={
        totalCount: res.distinctSerieNfts.totalCount,
        data: res.distinctSerieNfts.nodes,
        hasNextPage: res.distinctSerieNfts.pageInfo?.hasNextPage || undefined,
        hasPreviousPage: res.distinctSerieNfts.pageInfo?.hasPreviousPage || undefined
      }
      return result
    } catch (err) {
      throw new Error("Couldn't get creator's NFTs");
    }
  }

  /**
   * Gets user stat (number of owned, created, listed, not listed, followers, followed)
   * @param userWalletId - The user's wallet address
   * @throws Will throw an error if can't request indexer or db or user not find
   */
   async getStatNFTsUser(marketplaceId: string|undefined, userWalletId: string): Promise<{
    countOwned: number, 
    countOwnedListed: number, 
    countOwnedUnlisted: number, 
    countCreated: number, 
    countFollowers: number, 
    countFollowed: number
   }> {
    try {
      const [owned, ownedListed, ownedUnlisted, created, followers, followed] = await Promise.all([
        request(indexerUrl, QueriesBuilder.countOwnerOwned(userWalletId)),
        request(indexerUrl, QueriesBuilder.countOwnerOwnedListed(marketplaceId, userWalletId)),
        request(indexerUrl, QueriesBuilder.countOwnerOwnedUnlisted(userWalletId)),
        request(indexerUrl, QueriesBuilder.countCreated(userWalletId)),
        FollowModel.find({ followed: userWalletId }),
        FollowModel.find({ follower: userWalletId })
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
   * Returns several nfts from array of ids
   * @param ids - The nfts blockchain ids
   * @param page? - Page number
   * @param limit? - Number of elements per page
   * @param listed? - filter for listed (1) or non listed (0), undefined gets all
   * @throws Will throw an error if can't request indexer
   */
   async getNFTsFromIds(ids: string[], page?: string, limit?: string, listed?: string): Promise<CustomResponse<INFT>> {
    try {
      const query = QueriesBuilder.NFTsFromIds(ids, limit, page, listed);
      const res: NFTListResponse = await request(indexerUrl, query);
      const NFTs = res.nftEntities.nodes;
      res.nftEntities.nodes = await Promise.all(NFTs.map(async (NFT) => populateNFT(NFT)))
      const result: CustomResponse<INFT>={
        totalCount: res.nftEntities.totalCount,
        data: res.nftEntities.nodes,
        hasNextPage: res.nftEntities.pageInfo?.hasNextPage || undefined,
        hasPreviousPage: res.nftEntities.pageInfo?.hasPreviousPage || undefined
      }
      return result
    } catch (err) {

      throw new Error("Couldn't get NFTs from ids");
    }
  }

  /**
   * Returns several nfts from array of ids
   * @param ids - The nfts blockchain ids
   * @param page? - Page number
   * @param limit? - Number of elements per page
   * @param listed? - filter for listed (1) or non listed (0), undefined gets all
   * @throws Will throw an error if can't request indexer
   */
   async getNFTsFromIdsDistinct(marketplaceId: string|undefined, ids: string[], page?: string, limit?: string, listed?: string): Promise<CustomResponse<INFT>> {
    try {
      const query = QueriesBuilder.NFTsFromIdsDistinct(marketplaceId, ids, limit, page, listed);
      const res: DistinctNFTListResponse = await request(indexerUrl, query);
      const NFTs = res.distinctSerieNfts.nodes;
      res.distinctSerieNfts.nodes = await Promise.all(NFTs.map(async (NFT) => populateNFT(NFT)))
      const result: CustomResponse<INFT>={
        totalCount: res.distinctSerieNfts.totalCount,
        data: res.distinctSerieNfts.nodes,
        hasNextPage: res.distinctSerieNfts.pageInfo?.hasNextPage || undefined,
        hasPreviousPage: res.distinctSerieNfts.pageInfo?.hasPreviousPage || undefined
      }
      return result
    } catch (err) {
      throw new Error("Couldn't get  distinct NFTs from ids");
    }
  }

  /**
   * Returns nfts not in array of specified ids
   * @param ids - The nfts blockchain ids
   * @param page? - Page number
   * @param limit? - Number of elements per page
   * @param listed? - filter for listed (1) or non listed (0), undefined gets all
   * @throws Will throw an error if can't request indexer
   */
    async getNFTsNotInIds(marketplaceId: string|undefined, ids: string[], page?: string, limit?: string, listed?: string): Promise<CustomResponse<INFT>> {
    try {
      const query = QueriesBuilder.NFTsNotInIds(marketplaceId, ids, limit, page, listed);
      const res: DistinctNFTListResponse  = await request(indexerUrl, query);
      const NFTs = res.distinctSerieNfts.nodes;
      res.distinctSerieNfts.nodes = await Promise.all(NFTs.map(async (NFT) => populateNFT(NFT)))
      const result: CustomResponse<INFT>={
        totalCount: res.distinctSerieNfts.totalCount,
        data: res.distinctSerieNfts.nodes,
        hasNextPage: res.distinctSerieNfts.pageInfo?.hasNextPage || undefined,
        hasPreviousPage: res.distinctSerieNfts.pageInfo?.hasPreviousPage || undefined
      }
      return result
    } catch (err) {
      throw new Error("Couldn't get NFTs not in ids");
    }
  }

  /**
   * Gets all NFTs from one or many categories
   * @param codes - The codes of the categories, if not given return all nfts without categories
   * @param page? - Page number
   * @param limit? - Number of elements per page
   * @param listed? - filter for listed (1) or non listed (0), undefined gets all
   * @throws Will throw an error if can't reach database or if given category does not exist
   */
  async getNFTsFromCategories(marketplaceId: string|undefined, codes: string[] | null, page?: string, limit?: string, listed?: string): Promise<CustomResponse<INFT>> {
    try {
      if (codes===null){
        const query = {categories:{ $exists:true, $nin:[[] as any[], null ]} }
        const mongoNfts = await NftModel.find(query);
        const result = await this.getNFTsNotInIds(
          marketplaceId, 
          mongoNfts.map((nft) => nft.chainId),
          page,
          limit,
          listed
        );
        return result
      }else{
        const categories = await Promise.all(
          codes.map(async (x) => {
            const category = await CategoryService.getCategoryByCode(x)
            if (category) {
              return mongoose.Types.ObjectId(category._id)
            }
          })
        )
        const query = {categories: {$in: categories} }
        const mongoNfts = await NftModel.find(query)
        const result = await this.getNFTsFromIdsDistinct(
          marketplaceId, 
          mongoNfts.map((nft) => nft.chainId),
          page,
          limit,
          listed
        );
        return result
      }
    } catch (err) {
      throw new Error("Couldn't get NFTs by categories");
    }
  }

  /**
   * Creates a new nft document in DB
   * @param nftDTO - NFT data
   * @throws Will throw an error if can't create NFT document
   */
  async createNFT(nftDTO: INftDto): Promise<IMongoNft> {
    try {
      const categories = await Promise.all(
        nftDTO.categories.map(async (x) => CategoryService.getCategoryByCode(x))
      )
      const data = {
          chainId: nftDTO.chainId,
          categories
      }
      const newNft = new NftModel(data);
      return await newNft.save();
    } catch (err) {
      throw new Error("NFT can't be created");
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

  /**
   * Finds NFTs with same serie
   * @param NFT - NFT with serie
   * @param page? - Page number
   * @param limit? - Number of elements per page
   * @throws Will throw an error if nft ID doesn't exist
   */
   async getNFTsForSerie(NFT: INFT, page?: string, limit?: string): Promise<CustomResponse<INFT>>{
    try{
      const query = QueriesBuilder.NFTsForSerie(NFT.serieId, limit, page)
      const res: NFTListResponse = await request(indexerUrl, query);
      const result: CustomResponse<INFT>={
        totalCount: res.nftEntities.totalCount,
        data: res.nftEntities.nodes,
        hasNextPage: res.nftEntities.pageInfo?.hasNextPage || undefined,
        hasPreviousPage: res.nftEntities.pageInfo?.hasPreviousPage || undefined
      }
      return result
    }catch(err){
      throw new Error("Couldn't get NFTs for this serie");
    }
  }

}

export default new NFTService();
