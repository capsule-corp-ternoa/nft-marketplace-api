export interface IUser {
  _id: string;
  walletId: string;
  nbFollowers?: number;
  nbFollowing?: number;
  likedNFTs?: string[]
}

export interface IUserDTO {
  walletId: string;
}
