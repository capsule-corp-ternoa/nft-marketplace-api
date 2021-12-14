import { IUser } from "./IUser";

export interface INFT {
  id: string;
  owner: string;
  creator?: string;
  listed: number;
  timestampList?: string | null;
  nftIpfs?: string;
  capsuleIpfs?: string;
  isCapsule?: boolean;
  frozenCaps?: string;
  price: string;
  priceTiime: string;
  serieId?: string;
  totalNft?: number;
  totalListedNft?: number;
  viewsCount?: number;
  serieData?: INFT[];
  marketplaceId?: string;
}

export interface ICompleteNFT extends INFT {
  name?: string;
  media?: { url: string };
  cryptedMedia?: { url: string };
  ownerData?: IUser;
  creatorData?: IUser;
  categories?: string[];
}

export interface ISeries {
  id: string;
  owner: string;
  locked: boolean;
}

export interface INFTTransfer {
  id: string;
  nftId: string;
  seriesId: string;
  from: string;
  to: string;
  timestamp: Date;
  typeOfTransaction: string;
  amount: string;
  quantity: number;
}

export interface NFTListResponse {
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

export interface CustomResponse<DataType> {
  totalCount?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  data: DataType[];
}

