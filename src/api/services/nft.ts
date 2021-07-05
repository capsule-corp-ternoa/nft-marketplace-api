import { request } from "graphql-request";
import {
  ICompleteNFT,
  INFT,
  NFTListPaginatedResponse,
  NFTListResponse,
  PaginationResponse,
} from "src/interfaces/graphQL";
import { IMongoNft, INftDto } from "../../interfaces/INft";
import NftModel from "../../models/nft";
import { populateNFT } from "../helpers/nftHelpers";
import QueriesBuilder from "./gqlQueriesBuilder";

const indexerUrl =
  process.env.INDEXER_URL || "https://indexer.chaos.ternoa.com";

export class NFTService {
  /**
   * Requests all NFTs from the blockchain
   * @throws Will throw an error if can't request indexer
   */
  async getAllNFTs(): Promise<INFT[]> {
    try {
      const query = QueriesBuilder.allNFTs();
      const result: NFTListResponse = await request(indexerUrl, query);

      const NFTs = result.nftEntities.nodes;
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
    limit: number = 10
  ): Promise<PaginationResponse<INFT[]>> {
    try {
      const query = QueriesBuilder.allNFTsPaginated(limit, (page - 1) * limit);
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
   * Requests a single NFT from the blockchain
   * @param id - the NFT's id
   * @throws Will throw an error if the NFT can't be found
   */
  async getNFT(id: string): Promise<INFT> {
    try {
      const query = QueriesBuilder.NFTfromId(id);
      const result: NFTListResponse = await request(indexerUrl, query);
      let NFT = result.nftEntities.nodes[0];
      if (!NFT) throw new Error();

      NFT = await populateNFT(NFT);

      return NFT;
    } catch (err) {
      throw new Error("Couldn't get NFT");
    }
  }

  /**
   * Gets all NFTs owned by a user
   * @param ownerId - The user's blockchain id
   * @throws Will throw an error if can't request indexer
   */
  async getNFTsFromOwner(ownerId: string): Promise<INFT[]> {
    try {
      const query = QueriesBuilder.NFTsFromOwnerId(ownerId);
      const result: NFTListResponse = await request(indexerUrl, query);

      const NFTs = result.nftEntities.nodes;
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
    limit: number = 10
  ): Promise<PaginationResponse<INFT[]>> {
    try {
      const query = QueriesBuilder.NFTsFromOwnerIdPaginated(
        ownerId,
        limit,
        (page - 1) * limit
      );
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
      throw new Error("Couldn't get user's NFTs");
    }
  }

  /**
   * Gets all NFTs created by a user
   * @param creatorId - The user's blockchain id
   * @throws Will throw an error if can't request indexer
   */
  async getNFTsFromCreator(creatorId: string): Promise<INFT[]> {
    try {
      const query = QueriesBuilder.NFTsFromCreatorId(creatorId);
      const result: NFTListResponse = await request(indexerUrl, query);

      const NFTs = result.nftEntities.nodes;
      return (
        await Promise.all(NFTs.map(async (NFT) => populateNFT(NFT)))
      ).filter((n) => Number(n.id) !== 0);
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
    limit: number = 10
  ): Promise<PaginationResponse<INFT[]>> {
    try {
      const query = QueriesBuilder.NFTsFromCreatorIdPaginated(
        creatorId,
        limit,
        (page - 1) * limit
      );
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
      throw new Error("Couldn't get creator's NFTs");
    }
  }

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
      ).filter((n) => Number(n.id) !== 0);
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
   * @throws Will throw an error if can't reach database
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
        const query = {categories: {$in: codes}}
        const mongoNfts = await NftModel.find(query);
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
   * @throws Will throw an error if can't reach database
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
        const query = {categories: {$in: codes}}
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

  /**
   * Creates a new nft document in DB
   * @param nftDTO - NFT data
   * @throws Will throw an error if can't create NFT document
   */
  async createNFT(nftDTO: INftDto): Promise<IMongoNft> {
    try {
      const newNft = new NftModel(nftDTO);
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
  async findNftFromId(nftId: string): Promise<IMongoNft> {
    try {
      const nft = await NftModel.findOne({ chainId: nftId }).lean();
      if (!nft) throw new Error();
      return (nft as unknown) as IMongoNft;
    } catch (err) {
      throw new Error("Couldn't get mongo NFT");
    }
  }

  /**
   * Gets the total number on sale for a NFT serie 
   * @param serieId - NFT Serie id 
   * @throws Will throw an error if can't request indexer
   */
  async getNFTTotalOnSaleCount(serieId: string): Promise<number> {
    try {
      const query = QueriesBuilder.totalOnSaleCount(serieId);
      const result: NFTListPaginatedResponse = await request(indexerUrl, query);
      const totalCount = result.nftEntities.totalCount;
      return totalCount
    } catch (err) {
      throw new Error("Couldn't get total number on sale");
    }
  }
}

export default new NFTService();
