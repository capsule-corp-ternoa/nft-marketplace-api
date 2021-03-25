import { gql } from "graphql-request";

const nodes = `
  nodes {
    id
    owner
    creator
    listed
    timestampList
    uri
  }
`;

export class GQLQueriesBuilder {
  allNFTs = () => gql`
    {
      nftEntities {
        ${nodes}
      }
    }
  `;

  allNFTsPaginated = (first: number, offset: number) => gql`
    {
      nftEntities(
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

  NFTfromId = (id: string) => gql`
    {
      nftEntities(
        orderBy: ID_ASC
        condition: { id: "${id}" }
      ) {
        ${nodes}
      }
    }
  `;

  NFTsFromOwnerId = (id: string) => gql`
    {
      nftEntities(
        orderBy: OWNER_ASC
        condition: { owner: "${id}" }
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
        condition: { owner: "${id}" }
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
