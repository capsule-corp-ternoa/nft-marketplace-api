import { gql } from "graphql-request";
import { convertSortString, convertSortStringDistinct, LIMIT_MAX_PAGINATION } from "../../utils";
import { getFiltersQuery, getHistoryQuery, getSeriesStatusQuery, NFTBySeriesQuery, NFTQuery, NFTsQuery, statNFTsUserQuery } from "../validators/nftValidators";
// import L from '../../common/logger';

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
    marketplaceId
  }
`;


export class GQLQueriesBuilder {
  distinctNFTs = (query: NFTsQuery) => gql`
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
          ]
        }
        ${query.filter?.owner ? `owner: "${query.filter.owner}"` : ""}
        ${query.filter?.marketplaceId!==undefined ? `marketplaceId: "${query.filter.marketplaceId}"` : ""}
        ${query.filter?.listed!==undefined ? `listed: ${!query.filter.listed ? 0 : 1}` : ""}
        ${query.filter?.isCapsule!==undefined ? `isCapsule: ${!query.filter.isCapsule ? false : true}` : ""}
        ${query.filter?.priceStartRange!==undefined ? `priceStartRange: ${query.filter.priceStartRange}` : ""}
        ${query.filter?.priceEndRange!==undefined ? `priceEndRange: ${query.filter.priceEndRange}` : ""}
        ${query.filter?.timestampCreateStartRange!==undefined ? `timestampCreateStartRange: "${query.filter.timestampCreateStartRange.toJSON().split('T')[0]}"` : ""}
        ${query.filter?.timestampCreateEndRange!==undefined ? `timestampCreateEndRange: "${query.filter.timestampCreateEndRange.toJSON().split('T')[0]}"` : ""}
        ${query.sort ? convertSortStringDistinct(query.sort) : ""}
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

  NFTs = (query: NFTsQuery) => gql`
  {
    nftEntities(
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
          ${query.filter?.owner ? `{owner: {equalTo: "${query.filter.owner}"}}` : ""}
          ${query.filter?.marketplaceId ? `{marketplaceId: {equalTo: "${query.filter.marketplaceId}"}}` : ""}
          ${query.filter?.listed ? `{listed: {equalTo: ${!query.filter.listed ? 0 : 1}}}` : ""}
          ${query.filter?.isCapsule ? `{isCapsule: {equalTo: ${!query.filter.isCapsule ? 0 : 1}}}` : ""}
          ${query.filter?.priceStartRange ? `{priceRounded: {greaterThanOrEqualTo: ${query.filter.priceStartRange}}}` : ""}
          ${query.filter?.priceEndRange ? `{priceRounded: {lessThanOrEqualTo: ${query.filter.priceEndRange}}}` : ""}
          ${query.filter?.timestampCreateStartRange ? `{timestampCreate: {greaterThanOrEqualTo: "${query.filter.priceStartRange}"}}` : ""}
          ${query.filter?.timestampCreateEndRange ? `{timestampCreate: {lessThanOrEqualTo: "${query.filter.timestampCreateEndRange}"}}` : ""}
        ]
      }
      ${query.sort ? convertSortString(query.sort) : ""}
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
        marketplaceId
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
              ${query.filter?.owner ? `{ owner: { equalTo: "${query.filter.owner}" } }` : ""}
            ]
          }
          orderBy: [IS_CAPSULE_ASC, LISTED_DESC]
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
      orderBy: ${query.sort ? `[${convertSortStringDistinct(query.sort)}]` : "TIMESTAMP_DESC"}
      filter: {and:[
        ${query.filter?.onlyNftId ? 
          `{nftId: {equalTo: "${query.filter.nftId}"}}`
        : 
          `{seriesId: {equalTo: "${query.filter.seriesId}"}}`
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
        extrinsicId
      }
    }
  }
`;

countTotal = (seriesId: string) => gql`
  {
    nftEntities(
      filter: { 
        and: [
          { timestampBurn: { isNull: true } }
          { serieId: { equalTo: "${seriesId}" } }
        ]
      }
    ) {
      totalCount
    }
  }
`;

countTotalListed = (seriesId: string) => gql`
  {
    nftEntities(
      filter: { 
        and: [
          { timestampBurn: { isNull: true } }
          { serieId: { equalTo: "${seriesId}" } }
          { listed: { equalTo: 1} }
        ]
      }
    ) {
      totalCount
    }
  }
`;

countTotalListedInMarketplace = (seriesId: string, marketplaceId: number) => gql`
  {
    nftEntities(
      filter: { 
        and: [
          { timestampBurn: { isNull: true } }
          { serieId: { equalTo: "${seriesId}" } }
          { listed: { equalTo: 1} }
          { marketplaceId: { equalTo: "${marketplaceId}" } }
        ]
      }
    ) {
      totalCount
    }
  }
`;

countTotalOwned = (seriesId: string, owner: string) => gql`
  {
    nftEntities(
      filter: { 
        and: [
          { timestampBurn: { isNull: true } }
          { serieId: { equalTo: "${seriesId}" } }
          { owner: { equalTo: "${owner}" } }
        ]
      }
    ) {
      totalCount
    }
  }
`;

countTotalOwnedListed = (seriesId: string, owner: string) => gql`
  {
    nftEntities(
      filter: { 
        and: [
          { timestampBurn: { isNull: true } }
          { serieId: { equalTo: "${seriesId}" } }
          { listed: { equalTo: 1} }
          { owner: { equalTo: "${owner}" } }
        ]
      }
    ) {
      totalCount
    }
  }
`;

countTotalOwnedListedInMarketplace = (seriesId: string, owner: string, marketplaceId: number) => gql`
  {
    nftEntities(
      filter: { 
        and: [
          { timestampBurn: { isNull: true } }
          { serieId: { equalTo: "${seriesId}" } }
          { listed: { equalTo: 1} }
          { owner: { equalTo: "${owner}" } }
          { marketplaceId: { equalTo: "${marketplaceId}" } }
        ]
      }
    ) {
      totalCount
    }
  }
`;

countSmallestPrice = (seriesId: string, marketplaceId: number=null) => gql`
  {
    nftEntities(
      filter: { 
        and: [
          { timestampBurn: { isNull: true } }
          { serieId: { equalTo: "${seriesId}" } }
          { listed: { equalTo: 1} }
          ${marketplaceId ? `{ marketplaceId: {equalTo: ${marketplaceId}} }` : ``}
        ]
      }
    ) {
      nodes{
        price
      }
    }
  }
`;

countAllListedInMarketplace = (marketplaceId: number) => gql`
  {
    nftEntities(
      filter: { 
        and: [
          { timestampBurn: { isNull: true } }
          { listed: { equalTo: 1} }
          { marketplaceId: { equalTo: "${marketplaceId}" } }
        ]
      }
    ) {
      totalCount
    }
  }
`;

getMostSold = (query: getFiltersQuery) => gql`
  {
    mostSold(
      first: ${query.pagination?.limit ? query.pagination.limit : LIMIT_MAX_PAGINATION}
      offset: ${query.pagination?.page && query.pagination?.limit ? (query.pagination.page - 1) * query.pagination.limit : 0}
      typeOfTransaction: "sale"
      orderBy: OCCURENCES_DESC
    ) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      nodes {
        id
        occurences
      }
    }
  }
`;

getMostSoldSeries = (query: getFiltersQuery) => gql`
  {
    mostSoldSeries(
      first: ${query.pagination?.limit ? query.pagination.limit : LIMIT_MAX_PAGINATION}
      offset: ${query.pagination?.page && query.pagination?.limit ? (query.pagination.page - 1) * query.pagination.limit : 0}
      typeOfTransaction: "sale"
      orderBy: OCCURENCES_DESC
    ) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      nodes {
        id
        occurences
      }
    }
  }
`;

getTopSellers = (query: getFiltersQuery) => gql`
  {
    topSeller(
      first: ${query.pagination?.limit ? query.pagination.limit : LIMIT_MAX_PAGINATION}
      offset: ${query.pagination?.page && query.pagination?.limit ? (query.pagination.page - 1) * query.pagination.limit : 0}
      orderBy: OCCURENCES_DESC
    ) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      nodes {
        id
        occurences
      }
    }
  }
`;
}

export default new GQLQueriesBuilder();
