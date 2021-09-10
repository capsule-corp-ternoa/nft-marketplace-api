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
  }
`;

export class GQLQueriesBuilder {
  allNFTs = (first?: string, limit?: string, listed?: string) => gql`
    {
      distinctSerieNfts(
        ${first && limit ? `
            first: ${Number(first)}
            offset: ${(Number(limit) - 1) * Number(first)}
        ` : ""}
        ${listed && listed !== undefined ? `listed: ${Number(listed)}` : ""}
        filter:{
          and:[
          ]
        }
      ) {
        totalCount
        ${first && limit ? `
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

  NFTsFromOwnerId = (id: string, first?: string, limit?: string, listed?: string) => gql`
    {
      distinctSerieNfts(
        ${first && limit ? `
            first: ${Number(first)}
            offset: ${(Number(limit) - 1) * Number(first)}
        ` : ""}
        ${listed && listed !== undefined ? `listed: ${Number(listed)}` : ""}
        owner: "${id}"
        filter:{
          and:[
          ]
        }
      ) {
        totalCount
        ${first && limit ? `
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
        ` : ""}
        ${nodes}
      }
    }
  `;

  NFTsFromCreatorId = (id: string, first?: string, limit?: string, listed?: string) => gql`
    {
      distinctSerieNfts(
        ${first && limit ? `
            first: ${Number(first)}
            offset: ${(Number(limit) - 1) * Number(first)}
        ` : ""}
        ${listed && listed !== undefined ? `listed: ${Number(listed)}` : ""}
        filter: {
          and: [
            { creator: { equalTo: "${id}" } }
          ]
        }
      ) {
        totalCount
        ${first && limit ? `
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
        ` : ""}
        ${nodes}
      }
    }
  `;

  NFTsFromIds = (ids: string[], first?: string, limit?: string, listed?: string) => gql`
    {
      distinctSerieNfts(
        ${first && limit ? `
            first: ${Number(first)}
            offset: ${(Number(limit) - 1) * Number(first)}
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
        ${first && limit ? `
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
        ` : ""}
        ${nodes}
      }
    }
  `;

  NFTsNotInIds = (ids: string[], first?: string, limit?: string, listed?: string) => gql`
    {
      distinctSerieNfts(
        ${first && limit ? `
            first: ${Number(first)}
            offset: ${(Number(limit) - 1) * Number(first)}
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
        ${first && limit ? `
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
        ` : ""}
        ${nodes}
      }
    }
  `;

  NFTsForSerie = (serieId: string, first?: string, limit?: string) => {
    const nodesSerieData = `
      nodes {
        id
        owner
        listed
        price
        priceTiime
      }
    `;
    return gql`
      {
        nftEntities(
          ${first && limit ? `
              first: ${Number(first)}
              offset: ${(Number(limit) - 1) * Number(first)}
          ` : ""}
          filter: {
            and : [
              { timestampBurn:{ isNull:true } }
              { serieId:{ equalTo:"${serieId}" } }
            ]
          }
        )
        {
          totalCount
          ${first && limit ? `
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

  NFTsForSeries = (serieIds: string[], first?: string, limit?: string) => gql`
    {
      distinctSerieNfts(
        ${first && limit ? `
            first: ${Number(first)}
            offset: ${(Number(limit) - 1) * Number(first)}
        ` : ""}
        filter: {
          and: [
            { serieId: { in: ${JSON.stringify(serieIds)} } }
          ]
        }
      ) {
        totalCount
        ${first && limit ? `
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
        ` : ""}
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
