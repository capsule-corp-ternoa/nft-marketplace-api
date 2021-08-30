import { request } from "graphql-request";
import mongoose from "mongoose";
import {
  INFT,
  NFTListPaginatedResponse,
  NFTListResponse,
  PaginationResponse,
} from "../../../../interfaces/graphQL";
import { IMongoNft, INftDto } from "../../../../interfaces/INft";
import NftModel from "../../../../models/nft";
import NftViewModel from "../../../../models/nftView";
import CategoryService from "./category"
import { populateNFT, groupNFTs } from "../../../helpers/nftHelpers";
import QueriesBuilder from "../../gqlQueriesBuilder";
import { TIME_BETWEEN_SAME_USER_VIEWS } from "../../../../utils";

const indexerUrl =
  process.env.INDEXER_URL || "https://indexer.chaos.ternoa.com";

export class NFTService {
  /**
   * Requests all NFTs from the blockchain
   * @throws Will throw an error if can't request indexer
   */
  async getAllNFTs(listed?: string): Promise<INFT[]> {
    try {
      const query = QueriesBuilder.allNFTs(listed);
      const result: NFTListResponse = await request(indexerUrl, query);
      const NFTs = groupNFTs(result.nftEntities.nodes);
      return Promise.all(NFTs.map(async (NFT) => populateNFT(NFT)));
    } catch (err) {
      throw new Error("Couldn't get NFTs");
    }
  }

  /**
   * Returns a limited amount of all NFTs
   * @param page - Page number
   * @param limit - Number of elements per page
   * @throws Will throw an error if can't request indexer
   * @returns - A paginated array of nfts
   */
  async getPaginatedNFTs(
    page: number = 1,
    limit: number = 10,
    listed?: string
  ): Promise<PaginationResponse<INFT[]>> {
    try {
      const query = QueriesBuilder.allNFTsPaginated(limit, (page - 1) * limit, listed);
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
   * Requests a single NFT from the blockchain
   * @param id - the NFT's id
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
   * @throws Will throw an error if can't request indexer
   */
  async getNFTsFromOwner(ownerId: string, listed?: string): Promise<INFT[]> {
    try {
      const query = QueriesBuilder.NFTsFromOwnerId(ownerId, listed);
      const result: NFTListResponse = await request(indexerUrl, query);
      const NFTs = groupNFTs(result.nftEntities.nodes);
      return Promise.all(NFTs.map(async (NFT) => populateNFT(NFT)));
    } catch (err) {
      throw new Error("Couldn't get user's NFTs");
    }
  }

  /**
   * Returns a limited amount of user's NFTs
   * @param ownerId - The user's blockchain id
   * @param page - Page number
   * @param limit - Number of elements per page
   * @throws Will throw an error if can't request indexer
   * @returns - A paginated array of nfts
   */
  async getPaginatedNFTsFromOwner(
    ownerId: string,
    page: number = 1,
    limit: number = 10,
    listed?: string
  ): Promise<PaginationResponse<INFT[]>> {
    try {
      const query = QueriesBuilder.NFTsFromOwnerIdPaginated(
        ownerId,
        limit,
        (page - 1) * limit,
        listed
      );
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
      throw new Error("Couldn't get user's NFTs");
    }
  }

  /**
   * Gets all NFTs created by a user
   * @param creatorId - The user's blockchain id
   * @throws Will throw an error if can't request indexer
   */
  async getNFTsFromCreator(creatorId: string, listed?: string): Promise<INFT[]> {
    try {
      const query = QueriesBuilder.NFTsFromCreatorId(creatorId, listed);
      const result: NFTListResponse = await request(indexerUrl, query);
      const NFTs = groupNFTs(result.nftEntities.nodes);
      return (
        await Promise.all(NFTs.map(async (NFT) => populateNFT(NFT)))
      );
    } catch (err) {
      throw new Error("Couldn't get creator's NFTs");
    }
  }

  /**
   * Returns a limited amount of creator's NFTs
   * @param creatorId - The user's blockchain id
   * @param page - Page number
   * @param limit - Number of elements per page
   * @throws Will throw an error if can't request indexer
   * @returns - A paginated array of nfts
   */
  async getPaginatedNFTsFromCreator(
    creatorId: string,
    page: number = 1,
    limit: number = 10,
    listed?: string
  ): Promise<PaginationResponse<INFT[]>> {
    try {
      const query = QueriesBuilder.NFTsFromCreatorIdPaginated(
        creatorId,
        limit,
        (page - 1) * limit,
        listed
      );
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
      throw new Error("Couldn't get creator's NFTs");
    }
  }

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
   * Finds NFTs with same serie / owner / price as the nft in param
   * @param NFT - NFT with owner serie price
   * @throws Will throw an error if nft ID doesn't exist
   */
  async getNFTsForSerieOwnerPrice(NFT: INFT): Promise<NFTListPaginatedResponse>{
    try{
      const query = QueriesBuilder.NFTsForSerieOwnerPrice(NFT.serieId, NFT.owner, NFT.price, NFT.priceTiime)
      const result: NFTListPaginatedResponse = await request(indexerUrl, query);
      return result
    }catch(err){
      throw new Error("Couldn't get NFT with serie, owner and price");
    }
  }

  /**
   * Finds NFTs with same serie
   * @param NFT - NFT with serie
   * @throws Will throw an error if nft ID doesn't exist
   */
   async getNFTsForSerie(NFT: INFT): Promise<NFTListPaginatedResponse>{
    try{
      const query = QueriesBuilder.NFTsForSerie(NFT.serieId)
      const result: NFTListPaginatedResponse = await request(indexerUrl, query);
      return result
    }catch(err){
      throw new Error("Couldn't get NFTs for this serie");
    }
  }

  /**
   * Finds NFTs with serie included in serie ids array
   * @param serieIds - NFTs serie ids
   * @throws Will throw an error if nft ID doesn't exist
   */
   async getNFTsForSeries(serieIds: string[]): Promise<INFT[]>{
    try{
      const query = QueriesBuilder.NFTsForSeries(serieIds)
      const result: NFTListResponse = await request(indexerUrl, query);
      const NFTs = groupNFTs(result.nftEntities.nodes);
      return (
        await Promise.all(NFTs.map(async (NFT) => populateNFT(NFT)))
      );
    }catch(err){
      throw new Error("Couldn't get NFTs for these series");
    }
  }
}

export default new NFTService();
