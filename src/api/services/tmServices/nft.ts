import { request } from "graphql-request";
import mongoose from "mongoose";
import {
  INFT,
  NFTListPaginatedResponse,
  NFTListResponse,
  PaginationResponse,
} from "../../../interfaces/graphQL";
import NftModel from "../../../models/nft";
import CategoryService from "./category"
import { populateNFT } from "../../helpers/nftHelpers";
import QueriesBuilder from "../gqlQueriesBuilder";

const indexerUrl =
  process.env.INDEXER_URL || "https://indexer.chaos.ternoa.com";

export class NFTService {

  /**
   * Returns several nfts from array of ids
   * @param ids - The nfts blockchain ids
   * @throws Will throw an error if can't request indexer
   */
  async getNFTsFromIds(ids: string[]): Promise<INFT[]> {
    try {
      const query = QueriesBuilder.NFTsFromIds(ids);
      const result: NFTListResponse = await request(indexerUrl, query);

      const NFTs = result.nftEntities.nodes;
      return (
        await Promise.all(NFTs.map(async (NFT) => populateNFT(NFT)))
      );
    } catch (err) {
      throw new Error("Couldn't get NFTs");
    }
  }

  /**
   * Returns nfts not in array of specified ids
   * @param ids - The nfts blockchain ids
   * @throws Will throw an error if can't request indexer
   */
     async getNFTsNotInIds(ids: string[]): Promise<INFT[]> {
      try {
        const query = QueriesBuilder.NFTsNotInIds(ids);
        const result: NFTListResponse = await request(indexerUrl, query);
  
        const NFTs = result.nftEntities.nodes;
        return (
          await Promise.all(NFTs.map(async (NFT) => populateNFT(NFT)))
        );
      } catch (err) {
        throw new Error("Couldn't get NFTs");
      }
    }

  /**
   * Returns a limited amount nfts not in array of specified ids
   * @param ids - The nfts blockchain ids
   * @param page - Page number
   * @param limit - Number of elements per page
   * @throws Will throw an error if can't request indexer
   */
   async getPaginatedNFTsNotInIds(ids: string[], page: number = 1, limit: number = 10): Promise<PaginationResponse<INFT[]>> {
    try {
      const query = QueriesBuilder.NFTsNotInIdsPaginated(ids, limit, (page - 1) * limit);
      const result: NFTListPaginatedResponse = await request(indexerUrl, query);
      
      const ret: PaginationResponse<INFT[]> = {
        data: await Promise.all(
          result.nftEntities.nodes.map(async (NFT) => populateNFT(NFT))
        ),
        hasNextPage: result.nftEntities.pageInfo.hasNextPage,
        hasPreviousPage: result.nftEntities.pageInfo.hasPreviousPage,
        totalCount: result.nftEntities.totalCount,
      };
      return ret;
    } catch (err) {
      throw new Error("Couldn't get NFTs");
    }
  }

  /**
   * Gets all NFTs from one or many categories
   * @param codes - The codes of the categories, if not given return all nfts without categories
   * @throws Will throw an error if can't reach database or if given category does not exist
   */
  async getNFTsFromCategories(codes: string[] | null): Promise<INFT[]> {
    try {
      if (codes===null){
        const query = {categories:{ $exists:true, $nin:[[] as any[], null ]} }
        const mongoNfts = await NftModel.find(query);
        const NFTs = await this.getNFTsNotInIds(
          mongoNfts.map((nft) => nft.chainId)
        );
        return NFTs
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
        const NFTs = await this.getNFTsFromIds(
          mongoNfts.map((nft) => nft.chainId)
        );
        return NFTs
      }
    } catch (err) {
      throw new Error("Couldn't get NFTs");
    }
  }

  /**
   * Gets a fixed amount of NFTs from a category
   * @param codes - The codes of the categories, if not given return all nfts without categories
   * @param page - Page number
   * @param limit - Number of elements per page
   * @throws Will throw an error if can't reach database or if given category does not exist
   */
  async getPaginatedNFTsFromCategories(
    codes: string[] | null,
    page: number = 1,
    limit: number = 10
  ): Promise<INFT[] | PaginationResponse<INFT[]>> {
    try {
      if (codes===null){
        const query = {categories:{ $exists:true, $nin:[[] as any[], null ]} }
        const mongoNfts = await NftModel.find(query);
        const NFTs = await this.getPaginatedNFTsNotInIds(
          mongoNfts.map((nft) => nft.chainId),
          page,
          limit
        );
        return NFTs
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
        const mongoNfts = await NftModel.paginate(
          query,
          { page, limit }
        );
        const NFTs = await this.getNFTsFromIds(
          mongoNfts.docs.map((nft) => nft.chainId)
        );
        return NFTs;
      }
    } catch (err) {
      throw new Error("Couldn't get NFTs");
    }
  }

}

export default new NFTService();
