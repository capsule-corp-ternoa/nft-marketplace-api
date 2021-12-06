import { gql } from "graphql-request";
import { convertSortString, LIMIT_MAX_PAGINATION } from "../../utils";
import { getHistoryQuery, getSeriesStatusQuery, NFTBySeriesQuery, NFTQuery, NFTsQuery, statNFTsUserQuery } from "../validators/nftValidators";

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
        first: ${query.pagination?.limit ? query.pagination.limit : LIMIT_MAX_PAGINATION}
        offset: ${query.pagination?.page && query.pagination?.limit ? (query.pagination.page - 1) * query.pagination.limit : 0}
        filter:{
          and:[
            ${query.filter?.ids ? `{id: { in: ${JSON.stringify(query.filter.ids.map(x => String(x)))} }}` : ""}
            ${query.filter?.idsToExclude ? `{id: { notIn: ${JSON.stringify(query.filter.idsToExclude.map(x => String(x)))} }}` : ""}
            ${query.filter?.idsCategories ? `{id: { in: ${JSON.stringify(query.filter.idsCategories.map(x => String(x)))} }}` : ""}
            ${query.filter?.idsToExcludeCategories ? `{id: { notIn: ${JSON.stringify(query.filter.idsToExcludeCategories.map(x => String(x)))} }}` : ""}
            ${query.filter?.series ? `{serieId: { in: ${JSON.stringify(query.filter.series)} }}` : ""}
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
          ${query.pagination?.page && query.pagination?.limit ? `
            first: ${query.pagination.limit}
            offset: ${(query.pagination.page - 1) * query.pagination.limit}
          ` : ""}
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

  getHistory = (query: getHistoryQuery) => gql`
  {
    nftTransferEntities(
      ${query.pagination?.page && query.pagination?.limit ? `
            first: ${query.pagination.limit}
            offset: ${(query.pagination.page - 1) * query.pagination.limit}
        ` : ""}
      orderBy: ${query.sort ? `[${convertSortString(query.sort)}]` : "TIMESTAMP_DESC"}
      filter: {and:[
        ${query.filter?.onlyNftId ? 
          `{nftId: {equalTo: "${query.nftId}"}}`
        : 
          `{seriesId: {equalTo: "${query.seriesId}"}}`
        }
        ${query.filter?.from ? `{from: {equalTo: "${query.filter.from}"}}` : ``}
        ${query.filter?.to ? `{to: {equalTo: "${query.filter.to}"}}` : ``}
        ${query.filter?.typeOfTransaction ? `{typeOfTransaction: {equalTo: "${query.filter.typeOfTransaction}"}}` : ``}
        ${query.filter?.timestamp ? 
          `{timestamp: 
            {${query.filter?.timestampFilter ? query.filter?.timestampFilter : 'greaterThanOrEqualTo'}: "${query.filter.timestamp}"}
          }`
        : 
          ``
        }
        ${query.filter?.amount !== undefined ? 
          `{amount: 
            {${query.filter?.amountFilter ? query.filter.amountFilter : "isEqual"}: "${query.filter.amount}"}
          }`
        : 
          ""
        }
      ]}
    ){
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      nodes {
        id
        nftId
        seriesId
        from
        to
        timestamp
        typeOfTransaction
        amount
        extrinsic{
          id
        }
      }
    }
  }
`;

}

export default new GQLQueriesBuilder();
