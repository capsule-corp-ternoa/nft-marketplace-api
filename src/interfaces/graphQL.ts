export interface INFT {
  id: string;
  owner: string;
  listed: number;
  timeStampList?: string | string[];
  uri?: string;
}

export interface NFTListResponse {
  nftEntities: {
    nodes: INFT[];
  };
}
