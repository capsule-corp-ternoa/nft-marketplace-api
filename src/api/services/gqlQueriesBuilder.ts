import { gql } from "graphql-request";
import { convertSortString, LIMIT_MAX_PAGINATION } from "../../utils";
import { getSeriesStatusQuery, NFTBySeriesQuery, NFTQuery, NFTsQuery, statNFTsUserQuery } from "../validators/nftValidators";

const nodes = `
  nodes {
    id
    serieId
    listed
    owner
    creator
    timestampList
    nftIpfs
    capsuleIpfs
    isCapsule
    frozenCaps
    price
    priceTiime
    marketplaceId
  }
`;


export class GQLQueriesBuilder {
  NFTs = (query: NFTsQuery) => gql`
    {
      distinctSerieNfts(
        first: ${query.pagination?.limit ? Number(query.pagination.limit) : LIMIT_MAX_PAGINATION}
        offset: ${(query.pagination?.limit && query.pagination?.page) ? (Number(query.pagination.page) - 1) * Number(query.pagination.limit) : 0}
        filter:{
          and:[
            ${query.filter?.ids ? `{id: { in: ${JSON.stringify(query.filter.ids.map(x => String(x)))} }}` : ""}
            ${query.filter?.idsToExclude ? `{id: { notIn: ${JSON.stringify(query.filter.idsToExclude.map(x => String(x)))} }}` : ""}
            ${query.filter?.idsCategories ? `{id: { in: ${JSON.stringify(query.filter.idsCategories.map(x => String(x)))} }}` : ""}
            ${query.filter?.idsToExcludeCategories ? `{id: { notIn: ${JSON.stringify(query.filter.idsToExcludeCategories.map(x => String(x)))} }}` : ""}
            ${query.filter?.likedSeries ? `{serieId: { in: ${JSON.stringify(query.filter.likedSeries)} }}` : ""}
            ${query.filter?.creator ? `{creator: {equalTo: "${query.filter.creator}"}}` : ""}
            ${query.filter?.isCapsule !== undefined ? `{isCapsule: {isEqual: ${query.filter.isCapsule}}}` : ""}
            ${query.filter?.price !== undefined ? 
              `{price: 
                {${query.filter?.priceFilter ? query.filter.priceFilter : "isEqual"}: "${query.filter.price}"}
              }`
            : 
              ""
            }
            ${query.filter?.priceTiime !== undefined ? 
              `{priceTiime: 
                {${query.filter?.priceTiimeFilter ? query.filter.priceTiimeFilter : "isEqual"}: "${query.filter.priceTiime}"}
              }`
            : 
              ""
            }
          ]
        }
        ${query.filter?.owner ? `owner: "${query.filter.owner}"` : ""}
        ${query.filter?.marketplaceId!==undefined ? `marketplaceId: "${query.filter.marketplaceId}"` : ""}
        ${query.filter?.listed!==undefined ? `listed: ${!query.filter.listed ? 0 : 1}` : ""}
        ${query.sort ? `orderBy: [${convertSortString(query.sort)}]` : ""}
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

  NFTfromId = (query: NFTQuery) => gql`
    {
      nftEntities(
        filter: { 
          and: [
            { timestampBurn: { isNull: true } }
            { id: { equalTo: "${query.id}" } }
          ]
        }
      ) {
        ${nodes}
      }
    }
  `;

  NFTsForSeries = (query: NFTBySeriesQuery) => {
    const nodesSerieData = `
      nodes {
        id
        owner
        listed
        price
        priceTiime
        marketplaceId
        serieId
        isCapsule
      }
    `;
    return gql`
      {
        nftEntities(
          first: ${query.pagination?.limit ? Number(query.pagination.limit) : LIMIT_MAX_PAGINATION}
          offset: ${(query.pagination?.limit && query.pagination?.page) ? (Number(query.pagination.page) - 1) * Number(query.pagination.limit) : 0}
          filter: {
            and : [
              { timestampBurn: { isNull: true } }
              { serieId:{ in:${JSON.stringify(query.seriesIds)} } }
            ]
          }
        )
        {
          totalCount
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
          ${nodesSerieData}
        }
      }
    `;
  }

  countOwnerOwned = (query: statNFTsUserQuery) => gql`
    {
      nftEntities(
        filter: { 
          and: [
            { timestampBurn: { isNull: true } }
            { owner: { equalTo: "${query.id}" } }
          ]
        }
      ) {
        totalCount
      }
    }
  `;
  countOwnerOwnedListed = (query: statNFTsUserQuery) => gql`
    {
      nftEntities(
        filter: { 
          and: [
            { timestampBurn: { isNull: true } }
            ${query.filter?.marketplaceId ? `{ marketplaceId: { equalTo: "${query.filter.marketplaceId}"} }` : ""}
            { owner: { equalTo: "${query.id}" } }
            {listed: { equalTo: 1}}
          ]
        }
      ) {
        totalCount
      }
    }
  `;

  countOwnerOwnedUnlisted = (query: statNFTsUserQuery) => gql`
    {
      nftEntities(
        filter: { 
          and: [
            { timestampBurn: { isNull: true } }
            { owner: { equalTo: "${query.id}" } }
            {listed: { equalTo: 0}}
          ]
        }
      ) {
        totalCount
      }
    }
  `;

  countCreated = (query: statNFTsUserQuery) => gql`
    {
      nftEntities(
        filter: { 
          and: [
            { timestampBurn: { isNull: true } }
            { creator: { equalTo: "${query.id}" } }
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

  getSeries = (query: getSeriesStatusQuery) => gql`
    {
      serieEntities(
        filter: {and:[
          {id: {equalTo: "${query.seriesId}"}}
        ]}
      ){
        totalCount
        nodes{
          id
          owner
          locked
        }
      }
    }
  `;

}

export default new GQLQueriesBuilder();
