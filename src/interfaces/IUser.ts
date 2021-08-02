export interface IUser {
  _id: string;
  walletId: string;
  nbFollowers?: number;
  nbFollowing?: number;
  likedNFTs?: string[];
  viewsCount?: number;
}

export interface IUserDTO {
  walletId: string;
}
