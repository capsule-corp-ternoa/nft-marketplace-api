import { IUser } from "./IUser";

export interface INFT {
  id: string;
  owner: string;
  creator: string;
  listed: number;
  timestampList?: string | null;
  uri?: string;
  price: string;
}

export interface ICompleteNFT extends INFT {
  name?: string;
  media?: { url: string };
  cryptedMedia?: { url: string };
  ownerData?: IUser;
  creatorData: IUser;
}

export interface NFTListResponse {
  nftEntities: {
    nodes: INFT[];
  };
}

export interface NFTListPaginatedResponse {
  nftEntities: {
    totalCount: number;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    nodes: INFT[];
  };
}

export interface PaginationResponse<DataType> {
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  data: DataType;
}
