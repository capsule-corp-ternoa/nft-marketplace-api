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
  allNFTs = (listed?: string) => gql`
    {
      nftEntities(
        orderBy: TIMESTAMP_BURN_ASC, 
        filter: { 
          and: [
            { timestampBurn: { isNull: true } }
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
            ${listed && listed !== undefined ? `{ listed: {equalTo: ${Number(listed)} } }` : ""}
          ]
        }
      ) {
        ${nodes}
      }
    }
  `;

  allNFTsPaginated = (first: number, offset: number, listed?: string) => gql`
    {
      nftEntities(
        orderBy: TIMESTAMP_BURN_ASC
        first: ${first}
        offset: ${offset}
        filter: { 
          and: [
            { timestampBurn: { isNull: true } }
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
            ${listed && listed !== undefined ? `{ listed: {equalTo: ${Number(listed)} } }` : ""}
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

  NFTsFromOwnerId = (id: string, listed?: string) => gql`
    {
      nftEntities(
        orderBy: OWNER_ASC
        filter: {
          and: [
            { timestampBurn: { isNull: true } }
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
            { owner: { equalTo: "${id}" } }
            ${listed && listed !== undefined ? `{ listed: {equalTo: ${Number(listed)} } }` : ""}
          ]
        }
      ) {
        totalCount
        ${nodes}
      }
    }
  `;

  NFTsFromOwnerIdPaginated = (id: string, first: number, offset: number, listed?:string) => gql`
    {
      nftEntities(
        orderBy: OWNER_ASC
        filter: {
          and: [
            { timestampBurn: { isNull: true } }
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
            { owner: { equalTo: "${id}" } }
            ${listed && listed !== undefined ? `{ listed: {equalTo: ${Number(listed)} } }` : ""}
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

  NFTsFromCreatorId = (id: string, listed?: string) => gql`
    {
      nftEntities(
        orderBy: CREATOR_ASC
        filter: {
          and: [
            { timestampBurn: { isNull: true } }
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
            { creator: { equalTo: "${id}" } }
            ${listed && listed !== undefined ? `{ listed: {equalTo: ${Number(listed)} } }` : ""}
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
    offset: number,
    listed?: string
  ) => gql`
    {
      nftEntities(
        orderBy: CREATOR_ASC
        filter: {
          and: [
            { timestampBurn: { isNull: true } }
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
            { creator: { equalTo: "${id}" } }
            ${listed && listed !== undefined ? `{ listed: {equalTo: ${Number(listed)} } }` : ""}
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

  NFTsFromIds = (ids: string[], listed?: string) => gql`
    {
      nftEntities(
        orderBy: ID_ASC
        filter: {
          and: [
            { timestampBurn: { isNull: true } }
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
            { id: { in: ${JSON.stringify(ids)} } }
            ${listed && listed !== undefined ? `{ listed: {equalTo: ${Number(listed)} } }` : ""}
          ]
        }
      ) {
        ${nodes}
      }
    }
  `;

  NFTsNotInIds = (ids: string[], listed?: string) => gql`
    {
      nftEntities(
        orderBy: ID_ASC
        filter: {
          and: [
            { timestampBurn: { isNull: true } }
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
            { not: { id: { in: ${JSON.stringify(ids)} } } }
            ${listed && listed !== undefined ? `{ listed: {equalTo: ${Number(listed)} } }` : ""}
          ]
        }
      ) {
        ${nodes}
      }
    }
  `;

  NFTsNotInIdsPaginated = (ids: string[], first: number, offset: number, listed?: string) => gql`
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
            ${listed && listed !== undefined ? `{ listed: {equalTo: ${Number(listed)} } }` : ""}
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

  NFTsForSerie = (serieId: string) => gql`
    {
      nftEntities(
        filter: { 
          and : [
            { timestampBurn:{ isNull:true } }
            { not: { id: { in: ${process.env.BAD_NFT_IDS===undefined || process.env.BAD_NFT_IDS==="" ? "[]" : process.env.BAD_NFT_IDS} } } }
            { serieId:{ equalTo:"${serieId}" } }
          ]
        }
      )
      {
        totalCount
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
