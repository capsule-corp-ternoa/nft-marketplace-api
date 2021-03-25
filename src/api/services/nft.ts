import fetch from "node-fetch";

import L from "../../common/logger";
import { request, gql } from "graphql-request";
import { ICompleteNFT, INFT, NFTListResponse } from "src/interfaces/graphQL";

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

      const NFTs = result.nftEntities.nodes;
      return Promise.all(NFTs.map(async (NFT) => this.populateNFTUri(NFT)));
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
      const query = gql`
        {
          nftEntities(
            orderBy: ID_ASC
            condition: { id: "${id}" }
          ) {
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
      let NFT = result.nftEntities.nodes[0];
      if (!NFT) throw new Error();

      NFT = await this.populateNFTUri(NFT);

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
      const query = gql`
        {
          nftEntities(
            orderBy: OWNER_ASC
            condition: { owner: "${ownerId}" }
          ) {
            totalCount
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

      const NFTs = result.nftEntities.nodes;
      return Promise.all(NFTs.map(async (NFT) => this.populateNFTUri(NFT)));
    } catch (err) {
      throw new Error("Couldn't get user's NFTs");
    }
  }

  /**
   * Populates an NFT object with data from its URI JSON
   * @param NFT NFT object with uri field
   * @returns NFT object with new fields, if uri was valid, object stays untouched otherwise
   */
  async populateNFTUri(NFT: INFT): Promise<ICompleteNFT | INFT> {
    try {
      const info = await (await fetch(NFT.uri)).json();
      return { ...NFT, ...info };
    } catch (err) {
      L.error({ err }, "invalid NFT uri");
      return NFT;
    }
  }
}

export default new NFTService();
