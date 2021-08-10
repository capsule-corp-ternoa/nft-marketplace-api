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
import { populateNFT, groupNFTs } from "../../helpers/nftHelpers";
import QueriesBuilder from "../gqlQueriesBuilder";
import L from "../../../common/logger";
import fs from 'fs'

const indexerUrl =
  process.env.INDEXER_URL || "https://indexer.chaos.ternoa.com";

export class NFTService {

  /**
   * Returns several nfts from array of ids
   * @param ids - The nfts blockchain ids
   * @throws Will throw an error if can't request indexer
   */
   async getNFTsFromIds(ids: string[], listed?: string): Promise<INFT[]> {
    try {
      const query = QueriesBuilder.NFTsFromIds(ids, listed);
      const result: NFTListResponse = await request(indexerUrl, query);
      const NFTs = groupNFTs(result.nftEntities.nodes);
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
   async getNFTsNotInIds(ids: string[], listed?: string): Promise<INFT[]> {
    try {
      const query = QueriesBuilder.NFTsNotInIds(ids, listed);
      const result: NFTListResponse = await request(indexerUrl, query);
      const NFTs = groupNFTs(result.nftEntities.nodes);
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
   async getPaginatedNFTsNotInIds(ids: string[], page: number = 1, limit: number = 10, listed?: string): Promise<PaginationResponse<INFT[]>> {
    try {
      const query = QueriesBuilder.NFTsNotInIdsPaginated(ids, limit, (page - 1) * limit, listed);
      const result: NFTListPaginatedResponse = await request(indexerUrl, query);
      const ret: PaginationResponse<INFT[]> = {
        data: await Promise.all(
          groupNFTs(result.nftEntities.nodes).map(async (NFT) => populateNFT(NFT))
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
   async getNFTsFromCategories(codes: string[] | null, listed?: string): Promise<INFT[]> {
    try {
      if (codes===null){
        const query = {categories:{ $exists:true, $nin:[[] as any[], null ]} }
        const mongoNfts = await NftModel.find(query);
        const NFTs = await this.getNFTsNotInIds(
          mongoNfts.map((nft) => nft.chainId),
          listed
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
          mongoNfts.map((nft) => nft.chainId),
          listed
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
    limit: number = 10,
    listed?: string
  ): Promise<INFT[] | PaginationResponse<INFT[]>> {
    try {
      if (codes===null){
        const query = {categories:{ $exists:true, $nin:[[] as any[], null ]} }
        const mongoNfts = await NftModel.find(query);
        const NFTs = await this.getPaginatedNFTsNotInIds(
          mongoNfts.map((nft) => nft.chainId),
          page,
          limit,
          listed
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
          mongoNfts.docs.map((nft) => nft.chainId),
          listed
        );
        return NFTs;
      }
    } catch (err) {
      throw new Error("Couldn't get NFTs");
    }
  }

  /**
   * Returns an object with time engine ranked user's and their won nft(s)
   * @param serieId - The serie of the nft to win
   * @param usersNumber - The number of users to take account for
   * @param usersNumber - The users to exclude from the draw
   * @throws Will throw an error if can't request db or indexer
   */
   async getNFTsDistribution(serieId: string, usersNumber: number, usersToExclude: string[], specialNFTsIds: string[]): Promise<any> {
    try {
      const finalRes = [] as any
      let batchObject = {} as any
      const mongoInstance = new mongoose.Mongoose()
      const tmDB = mongoInstance.connection
      await new Promise((resolve, reject) => {
        L.info("Connecting to db...");
        mongoInstance.connect(process.env.MONGODB_TM_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        })
        tmDB.on("error", (err) => {
          L.error("db connection error:" + err);
          reject("db connection error")
        });
        tmDB.once("open", () => {
          L.info("db connection successfull");
          resolve();
        });
      });
      L.info("retrieving users...");const users = await (await tmDB.collection('users').find({_id: { $nin: usersToExclude}}, {projection: {_id: 1, tiimeAmount: 1}}))
        .sort({tiimeAmount: -1, lastClaimedAt: 1})
        .limit(usersNumber)
        .toArray()
      L.info("users retrieved, total : " + users.length);
      L.info("users excluded : " + usersToExclude);
      L.info("Give special NFT to random users, total special nft : " + specialNFTsIds.length);
      if (specialNFTsIds.length>0){
        specialNFTsIds.forEach(spNFTId => {
          const randomIndex = Math.floor(Math.random() * users.length)
          if (randomIndex>0) {
            batchObject[spNFTId] = users[randomIndex]._id
            users.splice(randomIndex, 1)
          }
          if (Object.keys(batchObject).length === 100){
            finalRes.push(batchObject)
            batchObject = {} as any
          }
        });
        if (Object.keys(batchObject).length > 0){
          finalRes.push(batchObject)
        }
        batchObject = {}
      }
      L.info("retrieving only classic nfts...");
      const nfts = (await this.getNFTsIdsForSerie(serieId)).nftEntities.nodes.filter(x => !specialNFTsIds.includes(x.id))
      L.info("nfts retrieved, total : " + nfts.length);
      L.info("building response...");
      nfts.forEach((nft, i) => {
        if (users[i]) batchObject[nft.id] = users[i]._id
        if (Object.keys(batchObject).length === 100){
          finalRes.push(batchObject)
          batchObject = {} as any
        }
      });
      if (Object.keys(batchObject).length > 0){
        finalRes.push(batchObject)
      }
      L.info("response ok");
      L.info("building file");
      fs.writeFile("nft-distribution-" + new Date().toISOString().split('T')[0] + ".json", JSON.stringify(finalRes), (err) => {
        if (err) throw err
        L.info("file saved");
      })
      return finalRes
    } catch (err) {
      L.info(err);
      throw new Error("Couldn't get NFTs distribution");
    }
  }

  /**
   * Finds NFTs with same serie
   * @param NFT serie - Serie of nft to give away
   * @throws Will throw an error if nft ID doesn't exist
   */
   async getNFTsForSerie(serieId: string): Promise<NFTListPaginatedResponse>{
    try{
      const query = QueriesBuilder.NFTsForSerie(serieId)
      const result: NFTListPaginatedResponse = await request(indexerUrl, query);
      return result
    }catch(err){
      throw new Error("Couldn't get total NFT");
    }
  }

  /**
   * Finds NFTs with same serie
   * @param NFT serie - Serie of nft to give away
   * @throws Will throw an error if nft ID doesn't exist
   */
   async getNFTsIdsForSerie(serieId: string): Promise<NFTListPaginatedResponse>{
    try{
      const query = QueriesBuilder.NFTsIdsForSerie(serieId)
      const result: NFTListPaginatedResponse = await request(indexerUrl, query);
      return result
    }catch(err){
      throw new Error("Couldn't get total NFT");
    }
  }

}

export default new NFTService();
