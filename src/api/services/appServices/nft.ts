import { request } from "graphql-request";
import {
  INFT,
  NFTListPaginatedResponse,
  NFTListResponse,
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
}

export default new NFTService();
