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
            { timestampBurn: { isNull: true } }
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
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
            { timestampBurn: { isNull: true } }
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
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
            { timestampBurn: { isNull: true } }
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
            { id: { equalTo: "${id}" } }
          ]
        }
      ) {
        ${nodes}
      }
    }
  `;

  NFTsFromOwnerId = (id: string, listedFilter:string) => gql`
    {
      nftEntities(
        orderBy: OWNER_ASC
        filter: {
          and: [
            { timestampBurn: { isNull: true } }
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
            { owner: { equalTo: "${id}" } }
            ${listedFilter} 
          ]
        }
      ) {
        totalCount
        ${nodes}
      }
    }
  `;

  NFTsFromOwnerIdPaginated = (id: string, first: number, offset: number, listedFilter:string) => gql`
    {
      nftEntities(
        orderBy: OWNER_ASC
        filter: {
          and: [
            { timestampBurn: { isNull: true } }
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
            { owner: { equalTo: "${id}" } }
            ${listedFilter} 
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
            { timestampBurn: { isNull: true } }
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
            { creator: { equalTo: "${id}" } }
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
            { timestampBurn: { isNull: true } }
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
            { creator: { equalTo: "${id}" } }
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
            { timestampBurn: { isNull: true } }
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
            { id: { in: ${JSON.stringify(ids)} } }
            { listed: { equalTo: 1 } },
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
            { timestampBurn: { isNull: true } }
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
            { not: { id: { in: ${JSON.stringify(ids)} } } }
            { listed: { equalTo: 1 } },
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
            { timestampBurn: { isNull: true } }
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
            { not: { id: { in: ${JSON.stringify(ids)} } } }
            { listed: { equalTo: 1 } },
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

  
  NFTsForSerieOwnerPrice = (serieId: string, ownerId: string, price: string, priceTiime: string) => gql`
    {
      nftEntities(
        filter: { 
          and : [
            { timestampBurn:{ isNull:true } }
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
            { serieId:{ equalTo:"${serieId}" } }
            { owner: { equalTo: "${ownerId}" } }
            { price:{ 
              ${price !== null ? 
                (price !== "" ? 
                  `equalTo:${price}`
                :
                  `equalTo:""`
                )
              : 
                "isNull: true"
              } 
            } }
            { priceTiime:{ 
              ${priceTiime !== null ? 
                (priceTiime !== "" ? 
                  `equalTo:${priceTiime}`
                :
                  `equalTo:""`
                )
              : 
                "isNull: true"
              } 
            } }
          ]
        }
      )
      {
        totalCount
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
}

export default new GQLQueriesBuilder();
