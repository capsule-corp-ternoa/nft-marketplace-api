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
    serieId
  }
`;

export class GQLQueriesBuilder {
  allNFTs = () => gql`
    {
      nftEntities(orderBy: TIMESTAMP_BURN_ASC, filter: { timestampBurn: { isNull: true } }) {
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
        filter: { timestampBurn: { isNull: true } }
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
        filter: { 
          and: [
            { id: { equalTo: "${id}" } }
            { timestampBurn: { isNull: true } }
          ]
        }
      ) {
        ${nodes}
      }
    }
  `;

  NFTsFromOwnerId = (id: string) => gql`
    {
      nftEntities(
        orderBy: OWNER_ASC
        filter: {
          and: [
            { owner: { equalTo: "${id}" } }
            { timestampBurn: { isNull: true } }
          ]
        }
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
        filter: {
          and: [
            { owner: { equalTo: "${id}" } }
            { timestampBurn: { isNull: true } }
          ]
        }
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

  NFTsFromCreatorId = (id: string) => gql`
    {
      nftEntities(
        orderBy: CREATOR_ASC
        filter: {
          and: [
            { creator: { equalTo: "${id}" } }
            { timestampBurn: { isNull: true } }
          ]
        }
      ) {
        totalCount
        ${nodes}
      }
    }
  `;

  NFTsFromCreatorIdPaginated = (
    id: string,
    first: number,
    offset: number
  ) => gql`
    {
      nftEntities(
        orderBy: CREATOR_ASC
        filter: {
          and: [
            { creator: { equalTo: "${id}" } }
            { timestampBurn: { isNull: true } }
          ]
        }
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

  NFTsFromIds = (ids: string[]) => gql`
    {
      nftEntities(
        orderBy: ID_ASC
        filter: {
          and: [
            { id: { in: ${JSON.stringify(ids)} } }
            { timestampBurn: { isNull: true } }
          ]
        }
      ) {
        ${nodes}
      }
    }
  `;

  capsBalanceFromId = (id: string) => gql`
    {
      accountEntities(
        filter: {
          id: { equalTo: "${id}" }
        }
      ) {
        nodes {
          capsAmount
        }
      }
    }
  `;
}

export default new GQLQueriesBuilder();
