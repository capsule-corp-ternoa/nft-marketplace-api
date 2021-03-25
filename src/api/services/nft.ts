import L from "../../common/logger";
import { request, gql } from "graphql-request";
import { INFT, NFTListResponse } from "src/interfaces/graphQL";

export class NFTService {
  /**
   * Requests all NFTs from the blockchain
   * @throws Will throw an error if can't request indexer
   */
  async getAllNFTs(): Promise<INFT[]> {
    try {
      const query = gql`
        {
          nftEntities {
            nodes {
              id
              owner
              creator
              listed
              timestampList
              uri
            }
          }
        }
      `;
      const result: NFTListResponse = await request(
        "https://indexer.chaos.ternoa.com/",
        query
      );
      return result.nftEntities.nodes;
    } catch (err) {
      throw new Error("Couldn't get NFTs");
    }
  }

  /**
   * Requests a single NFT from the blockchain
   * @param id - the NFT's id
   * @throws Will throw an error if can't request indexer
   */
  async getNFT(id: string): Promise<INFT> {
    try {
      const query = gql`
        {
          nftEntities {
            nodes {
              id
              owner
              creator
              listed
              timestampList
              uri
            }
          }
        }
      `;
      /* finding nft based on id, temporary method */
      const result: NFTListResponse = await request(
        "https://indexer.chaos.ternoa.com/",
        query
      );
      return result.nftEntities.nodes.find((node) => node.id === id);
    } catch (err) {
      throw new Error("Couldn't get NFT");
    }
  }
}

export default new NFTService();
