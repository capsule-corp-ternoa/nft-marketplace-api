import FollowModel from "../../models/follow";
import { IUser } from "../../interfaces/IUser";
import { CustomResponse } from "../../interfaces/graphQL";
import fetch from "node-fetch";
import { TERNOA_API_URL } from '../../utils'

export class FollowService {
  /**
   * Create a new follow
   * @param followed - The followed's wallet id
   * @param follower - The follower's wallet id
   * @throws Will throw an error if user can't be followed
   */
  async follow(followed: string, follower: string): Promise<IUser> {
    try {
      let follow = await FollowModel.findOne({followed, follower})
      if (follow) throw new Error("user is already following")
      follow = new FollowModel({followed, follower});
      await follow.save()
      const data = await fetch(`${TERNOA_API_URL}/api/users/${followed}`)
      const userFollowed = await data.json() as IUser
      return userFollowed;
    } catch (err) {
      throw new Error("Couldn't follow user");
    }
  }

  /**
   * Delete a follow
   * @param followed - The followed's wallet id
   * @param follower - The follower's wallet id
   * @throws Will throw an error if user can't be followed
   */
     async unfollow(followed: string, follower: string): Promise<IUser> {
      try {
        const follow = await FollowModel.findOne({followed, follower})
        if (!follow) throw new Error("user is already not following")
        await follow.delete()
        const data = await fetch(`${TERNOA_API_URL}/api/users/${followed}`)
        const userFollowed = await data.json()
        return userFollowed as IUser;
      } catch (err) {
        throw new Error("Couldn't unfollow user");
      }
    }

  /**
   * Check if follower follows followed
   * @param followed - The followed's wallet id
   * @param follower - The follower's wallet id
   * @throws Will throw an error if user can't be followed
   */
    async isUserFollowing(follower: string, followed: string): Promise<{isFollowing: boolean}> {
      try {
        const follow = await FollowModel.findOne({followed, follower})
        if (follow){
          return {isFollowing: true}
        }else{
          return {isFollowing: false}
        }
      } catch (err) {
        throw new Error("Couldn't retrieve follow");
      }
    }

  /**
   * Returns all of user's followers
   * @param walletId - The user's wallet id
   * @throws Will throw an error if followers can't be fetched
   */
  async getUserFollowers(walletId: string, page?: string, limit?: string, certifiedOnly?: string, nameOrAddressSearch?: string): Promise<CustomResponse<IUser>> {
    try {
      const followerWalletIds: string[] = (await FollowModel.find({ followed: walletId })).map(x => x.follower)
      const searchQuery = {$and: [{walletId: {$in: followerWalletIds}}]} as any
      if (certifiedOnly) searchQuery.$and.push({verified: true})
      if (nameOrAddressSearch) searchQuery.$and.push({$or: [{name: {$regex: nameOrAddressSearch, $options: "i"}}, {walletId: {$regex: nameOrAddressSearch, $options: "i"}}]})
      if (!page || !limit){
        const data = await fetch(`${TERNOA_API_URL}/api/users/getUsers?query=${JSON.stringify(searchQuery)}`)
        const res = await data.json() as CustomResponse<IUser>
        return res;
      }else{
        const data = await fetch(`${TERNOA_API_URL}/api/users/getUsers?query=${JSON.stringify(searchQuery)}&page=${page}&limit=${limit}`)
        const res = await data.json() as CustomResponse<IUser>
        return res;
      }
    } catch (err) {
      throw new Error("Followers can't be fetched");
    }
  }

  /**
   * Returns all of users' followings
   * @param walletId - The user's wallet id
   * @throws Will throw an error if followings can't be fetched
   */
  async getUserFollowings(walletId: string, page?: string, limit?: string, certifiedOnly?: string, nameOrAddressSearch?: string): Promise<CustomResponse<IUser>> {
    try {
      const followedWalletIds: string[] = (await FollowModel.find({ follower: walletId })).map(x => x.followed)
      const searchQuery = {$and: [{walletId: {$in: followedWalletIds}}]} as any
      if (certifiedOnly) searchQuery.$and.push({verified: true})
      if (nameOrAddressSearch) searchQuery.$and.push({$or: [{name: {$regex: nameOrAddressSearch, $options: "i"}}, {walletId: {$regex: nameOrAddressSearch, $options: "i"}}]})
      if (!page || !limit){
        const data = await fetch(`${TERNOA_API_URL}/api/users/getUsers?query=${JSON.stringify(searchQuery)}`)
        const res = await data.json() as CustomResponse<IUser>
        return res;
      }else{
        const data = await fetch(`${TERNOA_API_URL}/api/users/getUsers?query=${JSON.stringify(searchQuery)}&page=${page}&limit=${limit}`)
        const res = await data.json() as CustomResponse<IUser>
        return res;
      }
    } catch (err) {
      throw new Error("Followings can't be fetched");
    }
  }

  /**
   * count user's followers
   * @param walletId - The user's wallet id
   * @throws Will throw an error if followers can't be fetched
   */
   async countUserFollowers(walletId: string): Promise<number> {
    try {
      const nbFollowers = (await FollowModel.find({ followed: walletId })).length
      return nbFollowers
    } catch (err) {
      throw new Error("Followers number can't be fetched");
    }
  }

  /**
   * count user's followers
   * @param walletId - The user's wallet id
   * @throws Will throw an error if followers can't be fetched
   */
   async countUserFollowing(walletId: string): Promise<number> {
    try {
      const nbFollowed = (await FollowModel.find({ follower: walletId })).length
      return nbFollowed
    } catch (err) {
      throw new Error("Followed number can't be fetched");
    }
  }
}

export default new FollowService();
