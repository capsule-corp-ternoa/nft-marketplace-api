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
  allNFTs = (listed?: string) => gql`
    {
      distinctSerieNfts(
        ${listed && listed !== undefined ? `listed: ${Number(listed)}` : ""}
        filter:{
          and:[
          ]
        }
      ) {
        ${nodes}
      }
    }
  `;

  allNFTsPaginated = (first: number, offset: number, listed?: string) => gql`
    {
      distinctSerieNfts(
        ${listed && listed !== undefined ? `listed: ${Number(listed)}` : ""}
        first: ${first}
        offset: ${offset}
        filter:{
          and:[
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

  NFTsFromOwnerId = (id: string, listed?: string) => gql`
    {
      distinctSerieNfts(
        ${listed && listed !== undefined ? `listed: ${Number(listed)}` : ""}
        owner: "${id}"
        filter:{
          and:[
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
      distinctSerieNfts(
        ${listed && listed !== undefined ? `listed: ${Number(listed)}` : ""}
        owner: "${id}"
        first: ${first}
        offset: ${offset}
        filter:{
          and:[
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

  NFTsFromCreatorId = (id: string, listed?: string) => gql`
    {
      distinctSerieNfts(
        ${listed && listed !== undefined ? `listed: ${Number(listed)}` : ""}
        filter: {
          and: [
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
    offset: number,
    listed?: string
  ) => gql`
    {
      distinctSerieNfts(
        ${listed && listed !== undefined ? `listed: ${Number(listed)}` : ""}
        orderBy: CREATOR_ASC
        filter: {
          and: [
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

  NFTsFromIds = (ids: string[], listed?: string) => gql`
    {
      distinctSerieNfts(
        ${listed && listed !== undefined ? `listed: ${Number(listed)}` : ""}
        orderBy: ID_ASC
        filter: {
          and: [
            { id: { in: ${JSON.stringify(ids)} } }
          ]
        }
      ) {
        ${nodes}
      }
    }
  `;

  NFTsFromIdsPaginated = (ids: string[], first: number, offset: number, listed?: string) => gql`
    {
      distinctSerieNfts(
        ${listed && listed !== undefined ? `listed: ${Number(listed)}` : ""}
        orderBy: ID_ASC
        first: ${first}
        offset: ${offset}
        filter: {
          and: [
            { id: { in: ${JSON.stringify(ids)} } }
          ]
        }
      ) {
        ${nodes}
      }
    }
  `;

  NFTsNotInIds = (ids: string[], listed?: string) => gql`
    {
      distinctSerieNfts(
        ${listed && listed !== undefined ? `listed: ${Number(listed)}` : ""}
        orderBy: ID_ASC
        filter: {
          and: [
            { not: { id: { in: ${JSON.stringify(ids)} } } }
          ]
        }
      ) {
        ${nodes}
      }
    }
  `;

  NFTsNotInIdsPaginated = (ids: string[], first: number, offset: number, listed?: string) => gql`
    {
      distinctSerieNfts(
        ${listed && listed !== undefined ? `listed: ${Number(listed)}` : ""}
        orderBy: ID_ASC
        first: ${first}
        offset: ${offset}
        filter: { 
          and: [
            { not: { id: { in: ${JSON.stringify(ids)} } } }
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

  NFTsForSerie = (serieId: string) => {
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
          filter: {
            and : [
              { timestampBurn:{ isNull:true } }
              { serieId:{ equalTo:"${serieId}" } }
            ]
          }
        )
        {
          totalCount
          ${nodesSerieData}
        }
      }
    `;
  }

  NFTsForSeries = (serieIds: string[]) => gql`
    {
      distinctSerieNfts(
        filter: {
          and: [
            { serieId: { in: ${JSON.stringify(serieIds)} } }
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
          tiimeAmount
        }
      }
    }
  `;
}

export default new GQLQueriesBuilder();
