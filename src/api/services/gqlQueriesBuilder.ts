import { gql } from "graphql-request";

const nodes = `
  nodes {
    id
    serieId
    listed
    owner
    creator
    timestampList
    uri
    price
    priceTiime
    marketplaceId
  }
`;

export class GQLQueriesBuilder {
  allNFTs = (marketplaceId: string | undefined, first?: string, page?: string, listed?: string) => gql`
    {
      distinctSerieNfts(
        ${marketplaceId && marketplaceId !== undefined ? `marketplaceId: "${marketplaceId}"` : ""}
        ${first && page ? `
            first: ${Number(first)}
            offset: ${(Number(page) - 1) * Number(first)}
        ` : ""}
        ${listed && listed !== undefined ? `listed: ${Number(listed)}` : ""}
        filter:{
          and:[
          ]
        }
      ) {
        totalCount
        ${first && page ? `
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
        ` : ""}
        ${nodes}
      }
    }
  `;

  NFTfromId = (id: string) => gql`
    {
      nftEntities(
        filter: { 
          and: [
            { timestampBurn: { isNull: true } }
            { id: { equalTo: "${id}" } }
          ]
        }
      ) {
        ${nodes}
      }
    }
  `;

  NFTsFromOwnerId = (marketplaceId: string | undefined, id: string, first?: string, page?: string, listed?: string) => gql`
    {
      distinctSerieNfts(
        ${marketplaceId && marketplaceId !== undefined ? `marketplaceId: "${marketplaceId}"` : ""}
        ${first && page ? `
            first: ${Number(first)}
            offset: ${(Number(page) - 1) * Number(first)}
        ` : ""}
        ${listed && listed !== undefined ? `listed: ${Number(listed)}` : ""}
        owner: "${id}"
        filter:{
          and:[
          ]
        }
      ) {
        totalCount
        ${first && page ? `
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
        ` : ""}
        ${nodes}
      }
    }
  `;

  NFTsFromCreatorId = (id: string, first?: string, page?: string, listed?: string) => gql`
    {
      distinctSerieNfts(
        ${first && page ? `
            first: ${Number(first)}
            offset: ${(Number(page) - 1) * Number(first)}
        ` : ""}
        ${listed && listed !== undefined ? `listed: ${Number(listed)}` : ""}
        filter: {
          and: [
            { creator: { equalTo: "${id}" } }
          ]
        }
      ) {
        totalCount
        ${first && page ? `
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
        ` : ""}
        ${nodes}
      }
    }
  `;

  NFTsFromIds = (ids: string[], first?: string, page?: string, listed?: string) => gql`
    {
      nftEntities(
        ${first && page ? `
            first: ${Number(first)}
            offset: ${(Number(page) - 1) * Number(first)}
        ` : ""}
        orderBy: ID_ASC
        filter: {
          and: [
            { timestampBurn: { isNull: true } }
            { id: { in: ${JSON.stringify(ids)} } }
            ${listed && listed !== undefined ? `{ listed: {equalTo: ${Number(listed)} }}` : ""}
          ]
        }
      ) {
        totalCount
        ${first && page ? `
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
        ` : ""}
        ${nodes}
      }
    }
  `;

  NFTsFromIdsDistinct = (marketplaceId: string | undefined, ids: string[], first?: string, page?: string, listed?: string) => gql`
    {
      distinctSerieNfts(
        ${marketplaceId && marketplaceId !== undefined ? `marketplaceId: "${marketplaceId}"` : ""}
        ${first && page ? `
            first: ${Number(first)}
            offset: ${(Number(page) - 1) * Number(first)}
        ` : ""}
        ${listed && listed !== undefined ? `listed: ${Number(listed)}` : ""}
        orderBy: ID_ASC
        filter: {
          and: [
            { id: { in: ${JSON.stringify(ids)} } }
          ]
        }
      ) {
        totalCount
        ${first && page ? `
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
        ` : ""}
        ${nodes}
      }
    }
  `;

  NFTsNotInIds = (marketplaceId: string | undefined, ids: string[], first?: string, page?: string, listed?: string) => gql`
    {
      distinctSerieNfts(
        ${marketplaceId && marketplaceId !== undefined ? `marketplaceId: "${marketplaceId}"` : ""}
        ${first && page ? `
            first: ${Number(first)}
            offset: ${(Number(page) - 1) * Number(first)}
        ` : ""}
        ${listed && listed !== undefined ? `listed: ${Number(listed)}` : ""}
        orderBy: ID_ASC
        filter: {
          and: [
            { not: { id: { in: ${JSON.stringify(ids)} } } }
          ]
        }
      ) {
        totalCount
        ${first && page ? `
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
        ` : ""}
        ${nodes}
      }
    }
  `;

  NFTsForSerie = (serieId: string, first?: string, page?: string) => {
    const nodesSerieData = `
      nodes {
        id
        owner
        listed
        price
        priceTiime
        marketplaceId
      }
    `;
    return gql`
      {
        nftEntities(
          ${first && page ? `
              first: ${Number(first)}
              offset: ${(Number(page) - 1) * Number(first)}
          ` : ""}
          filter: {
            and : [
              { timestampBurn: { isNull: true } }
              { serieId:{ equalTo:"${serieId}" } }
            ]
          }
        )
        {
          totalCount
          ${first && page ? `
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          ` : ""}
          ${nodesSerieData}
        }
      }
    `;
  }

  NFTsForSeries = (serieIds: string[], first?: string, page?: string) => {
    const nodesSerieData = `
      nodes {
        id
        owner
        listed
        price
        priceTiime
        marketplaceId
        serieId
      }
    `;
    return gql`
      {
        nftEntities(
          ${first && page ? `
              first: ${Number(first)}
              offset: ${(Number(page) - 1) * Number(first)}
          ` : ""}
          filter: {
            and : [
              { timestampBurn: { isNull: true } }
              { serieId:{ in:${JSON.stringify(serieIds)} } }
            ]
          }
        )
        {
          totalCount
          ${first && page ? `
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          ` : ""}
          ${nodesSerieData}
        }
      }
    `;
  }

  countOwnerOwned = (id: string) => gql`
    {
      nftEntities(
        filter: { 
          and: [
            { timestampBurn: { isNull: true } }
            { owner: { equalTo: "${id}" } }
          ]
        }
      ) {
        totalCount
      }
    }
  `;
  countOwnerOwnedListed = (marketplaceId: string | undefined, id: string) => gql`
    {
      nftEntities(
        filter: { 
          and: [
            { timestampBurn: { isNull: true } }
            ${marketplaceId && marketplaceId !== undefined ? `{ marketplaceId: { equalTo: "${marketplaceId}"} }` : ""}
            { owner: { equalTo: "${id}" } }
            {listed: { equalTo: 1}}
          ]
        }
      ) {
        totalCount
      }
    }
  `;

  countOwnerOwnedUnlisted = (id: string) => gql`
    {
      nftEntities(
        filter: { 
          and: [
            { timestampBurn: { isNull: true } }
            { owner: { equalTo: "${id}" } }
            {listed: { equalTo: 0}}
          ]
        }
      ) {
        totalCount
      }
    }
  `;

  countCreated = (id: string) => gql`
    {
      nftEntities(
        filter: { 
          and: [
            { timestampBurn: { isNull: true } }
            { creator: { equalTo: "${id}" } }
          ]
        }
      ) {
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
