import { gql } from "graphql-request";

const nodes = `
  nodes {
    id
    owner
    creator
    listed
    timestampList
    uri
    price
  }
`;

export class GQLQueriesBuilder {
  allNFTs = () => gql`
    {
      nftEntities(orderBy: TIMESTAMP_BURN_ASC, condition: { timestampBurn: null }) {
        ${nodes}
      }
    }
  `;

  allNFTsPaginated = (first: number, offset: number) => gql`
    {
      nftEntities(
        orderBy: TIMESTAMP_BURN_ASC
        first: ${first}
        offset: ${offset}
        condition: { timestampBurn: null }
      ) {
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
        ${nodes}
      }
    }
  `;

  NFTfromId = (id: string) => gql`
    {
      nftEntities(
        orderBy: ID_ASC
        condition: { id: "${id}", timestampBurn: null }
      ) {
        ${nodes}
      }
    }
  `;

  NFTsFromOwnerId = (id: string) => gql`
    {
      nftEntities(
        orderBy: OWNER_ASC
        condition: { owner: "${id}", timestampBurn: null }
      ) {
        totalCount
        ${nodes}
      }
    }
  `;

  NFTsFromOwnerIdPaginated = (id: string, first: number, offset: number) => gql`
    {
      nftEntities(
        orderBy: OWNER_ASC
        condition: { owner: "${id}", timestampBurn: null }
        first: ${first}
        offset: ${offset}
      ) {
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
        ${nodes}
      }
    }
  `;
}

export default new GQLQueriesBuilder();
