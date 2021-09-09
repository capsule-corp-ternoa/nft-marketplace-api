import { request } from "graphql-request";
import {
  DistinctNFTListResponse,
  INFT,
  DistinctNFTListPaginatedResponse,
  PaginationResponse,
} from "../../../interfaces/graphQL";
import { populateNFT } from "../../helpers/nftHelpers";
import QueriesBuilder from "../gqlQueriesBuilder";

const indexerUrl =
  process.env.INDEXER_URL || "https://indexer.chaos.ternoa.com";

export class NFTService {
  /**
   * Gets all NFTs owned by a user
   * @param ownerId - The user's blockchain id
   * @throws Will throw an error if can't request indexer
   */
  async getNFTsFromOwner(ownerId: string, listed?: string): Promise<INFT[]> {
    try {
      const query = QueriesBuilder.NFTsFromOwnerId(ownerId, listed);
      const result: DistinctNFTListResponse = await request(indexerUrl, query);
      const NFTs = result.distinctSerieNfts.nodes;
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
    listed?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginationResponse<INFT[]>> {
    try {
      const query = QueriesBuilder.NFTsFromOwnerIdPaginated(
        ownerId,
        limit,
        (page - 1) * limit,
        listed
      );
      const result: DistinctNFTListPaginatedResponse = await request(indexerUrl, query);
      const ret: PaginationResponse<INFT[]> = {
        data: await Promise.all(
          result.distinctSerieNfts.nodes.map(async (NFT) => populateNFT(NFT))
        ),
        hasNextPage: result.distinctSerieNfts.pageInfo.hasNextPage,
        hasPreviousPage: result.distinctSerieNfts.pageInfo.hasPreviousPage,
        totalCount: result.distinctSerieNfts.totalCount,
      };
      return ret;
    } catch (err) {
      throw new Error("Couldn't get user's NFTs");
    }
  }
}

export default new NFTService();
