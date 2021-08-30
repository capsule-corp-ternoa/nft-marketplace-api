export interface IUser {
  _id: string;
  walletId: string;
  nbFollowers?: number;
  nbFollowing?: number;
  likedNFTs?: { serieId: string, nftId: string }[];
  viewsCount?: number;
}

export interface IUserDTO {
  walletId: string;
}
