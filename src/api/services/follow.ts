import FollowModel from "../../models/follow";
import { IUser } from "../../interfaces/IUser";
import UserModel from "../../models/user";
import { PaginateResult } from "mongoose";

export class FollowService {
  /**
   * Create a new follow
   * @param followed - The followed's wallet id
   * @param follower - The follower's wallet id
   * @throws Will throw an error if user can't be followed
   */
  async follow(followed: string, follower: string): Promise<IUser> {
    try {
      const userFollowed = await UserModel.findOne({walletId: followed}) 
      const userFollower = await UserModel.findOne({walletId: follower}) 
      if (!userFollowed || !userFollower) throw new Error("user not found")
      let follow = await FollowModel.findOne({followed: userFollowed._id, follower: userFollower._id})
      if (follow) throw new Error("user is already following")
      follow = new FollowModel({followed: userFollowed._id, follower: userFollower._id});
      userFollowed.nbFollowers += 1
      userFollower.nbFollowing += 1
      await follow.save()
      await userFollowed.save()
      await userFollower.save()
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
        
        const userFollowed = await UserModel.findOne({walletId: followed}) 
        const userFollower = await UserModel.findOne({walletId: follower}) 
        if (!userFollowed || !userFollower) throw new Error("user not found")
        const follow = await FollowModel.findOne({followed: userFollowed._id, follower: userFollower._id})
        if (!follow) throw new Error("user is already not following")
        userFollowed.nbFollowers -= 1
        userFollower.nbFollowing -= 1
        await follow.delete()
        await userFollowed.save()
        await userFollower.save()
        return userFollowed
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
        const userFollowed = await UserModel.findOne({walletId: followed}) 
        const userFollower = await UserModel.findOne({walletId: follower}) 
        if (!userFollowed || !userFollower) throw new Error()
        const follow = await FollowModel.findOne({followed: userFollowed._id, follower: userFollower._id})
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
  async getUserFollowers(walletId: string, page?: string, limit?: string, certifiedOnly?: string, nameOrAddressSearch?: string): Promise<IUser[] | PaginateResult<IUser>> {
    try {
      const user = await UserModel.findOne({walletId}) 
      if (!user) throw new Error()
      const followerIds: any[] = (await FollowModel.find({ followed: user._id })).map(x => x.follower)
      const searchQuery = {$and: [{_id: {$in: followerIds}}]} as any
      if (certifiedOnly) searchQuery.$and.push({verified: true})
      if (nameOrAddressSearch) searchQuery.$and.push({$or: [{name: {$regex: nameOrAddressSearch, $options: "i"}}, {walletId: {$regex: nameOrAddressSearch, $options: "i"}}]})
      if (!page || !limit){
        const followers: any[] = await UserModel.find(searchQuery)
        return followers;
      }else{
        const followers: PaginateResult<IUser> = await UserModel.paginate(
          searchQuery, 
          {
            page: Number(page), 
            limit: Number(limit)
          }
        )
        return followers;
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
  async getUserFollowings(walletId: string, page?: string, limit?: string, certifiedOnly?: string, nameOrAddressSearch?: string): Promise<IUser[] | PaginateResult<IUser>> {
    try {
      const user = await UserModel.findOne({walletId}) 
      if (!user) throw new Error()
      const followedIds: any[] = (await FollowModel.find({ follower: user._id })).map(x => x.followed)
      const searchQuery = {$and: [{_id: {$in: followedIds}}]} as any
      if (certifiedOnly) searchQuery.$and.push({verified: true})
      if (nameOrAddressSearch) searchQuery.$and.push({$or: [{name: {$regex: nameOrAddressSearch, $options: "i"}}, {walletId: {$regex: nameOrAddressSearch, $options: "i"}}]})
      if (!page || !limit){
        const followers: any[] = await UserModel.find(searchQuery)
        return followers;
      }else{
        const followed: PaginateResult<IUser> = await UserModel.paginate(
          searchQuery, 
          {
            page: Number(page), 
            limit: Number(limit),
          }
        )
        return followed;
      }
    } catch (err) {
      throw new Error("Followings can't be fetched");
    }
  }
}

export default new FollowService();
