export interface IMongoNft {
  _id: string;
  chainId: string;
  categories: string[];
}

export interface INftDto {
  chainId: string;
  categories?: string[];
}
