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
    priceTiime
    serieId
  }
`;

export class GQLQueriesBuilder {
  allNFTs = () => gql`
    {
      nftEntities(
        orderBy: TIMESTAMP_BURN_ASC, 
        filter: { 
          and: [
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
            { timestampBurn: { isNull: true } }
          ]
        }
      ) {
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
        filter: { 
          and: [
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
            { timestampBurn: { isNull: true } }
          ]
        }
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
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
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
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
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
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
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
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
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
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
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
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
            { id: { in: ${JSON.stringify(ids)} } }
            { timestampBurn: { isNull: true } }
          ]
        }
      ) {
        ${nodes}
      }
    }
  `;

  NFTsNotInIds = (ids: string[]) => gql`
    {
      nftEntities(
        orderBy: ID_ASC
        filter: {
          and: [
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
            { not: { id: { in: ${JSON.stringify(ids)} } } }
            { timestampBurn: { isNull: true } }
          ]
        }
      ) {
        ${nodes}
      }
    }
  `;

  NFTsNotInIdsPaginated = (ids: string[], first: number, offset: number) => gql`
    {
      nftEntities(
        orderBy: ID_ASC
        first: ${first}
        offset: ${offset}
        filter: { 
          and: [
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
            { not: { id: { in: ${JSON.stringify(ids)} } } }
            { timestampBurn: { isNull: true } }
          ]
        }
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

  capsBalanceFromId = (id: string) => gql`
    {
      accountEntities(
        filter: {
          id: { equalTo: "${id}" }
        }
      ) {
        nodes {
          capsAmount
          tiimeAmount
        }
      }
    }
  `;
  
  totalOnSaleCount = (serieId: string) => gql`
    {
      nftEntities(
        filter: { 
          and : [
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
            { listed: { equalTo: 1 } },
            { serieId:{ equalTo:"${serieId}" } }
            { timestampBurn:{ isNull:true } }
          ]
        }
      )
      {
        totalCount
      }
    }
  `;
}

export default new GQLQueriesBuilder();
