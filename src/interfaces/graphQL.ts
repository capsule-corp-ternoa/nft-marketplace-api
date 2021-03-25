export interface INFT {
  id: string;
  owner: string;
  listed: number;
  timeStampList?: string | string[];
  uri?: string;
}

export interface ICompleteNFT extends INFT {
  name: string;
  media: { url: string };
  cryptedMedia: { url: string };
}

export interface NFTListResponse {
  nftEntities: {
    nodes: INFT[];
  };
}
