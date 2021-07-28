export interface IUser {
  _id: string;
  walletId: string;
  nbFollowers?: number;
  nbFollowing?: number;
}

export interface IUserDTO {
  walletId: string;
}
