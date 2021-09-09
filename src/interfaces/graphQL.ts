import { IUser } from "./IUser";
import { ICategory } from "./ICategory";

export interface INFT {
  id: string;
  owner: string;
  creator?: string;
  listed: number;
  timestampList?: string | null;
  uri?: string;
  price: string;
  priceTiime: string;
  serieId?: string;
  totalNft?: number;
  totalListedNft?: number;
  viewsCount?: number;
  serieData?: INFT[]
}

export interface ICompleteNFT extends INFT {
  name?: string;
  media?: { url: string };
  cryptedMedia?: { url: string };
  ownerData?: IUser;
  creatorData?: IUser;
  categories?: ICategory[];
}

export interface NFTListResponse {
  nftEntities: {
    nodes: INFT[];
  };
}

export interface NFTListPaginatedResponse {
  nftEntities: {
    totalCount: number;
    pageInfo?: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    nodes: INFT[];
  };
}

export interface DistinctNFTListResponse {
  distinctSerieNfts: {
    nodes: INFT[];
  };
}

export interface DistinctNFTListPaginatedResponse {
  distinctSerieNfts: {
    totalCount: number;
    pageInfo?: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    nodes: INFT[];
  };
}

export interface Account {
  capsAmount: string;
  tiimeAmount: string;
  id?: string;
}

export interface AccountResponse {
  accountEntities: {
    nodes: Account[];
  };
}

export interface PaginationResponse<DataType> {
  totalCount: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  data: DataType;
}
