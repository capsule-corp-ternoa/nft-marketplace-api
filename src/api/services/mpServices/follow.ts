import FollowModel from "../../../models/follow";
import { IUser } from "../../../interfaces/IUser";
import UserModel from "../../../models/user";
import { IFollow } from "src/interfaces/IFollow";

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
      if (!userFollowed || !userFollower) throw new Error()
      let follow = await FollowModel.findOne({followed: userFollowed._id, follower: userFollower._id})
      if (follow) throw new Error()
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
        if (!userFollowed || !userFollower) throw new Error()
        const follow = await FollowModel.findOne({followed: userFollowed._id, follower: userFollower._id})
        if (!follow) throw new Error()
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
        throw new Error("Couldn't follow user");
      }
    }

  /**
   * Returns all of user's followers
   * @param walletId - The user's wallet id
   * @throws Will throw an error if followers can't be fetched
   */
  async getUserFollowers(walletId: string): Promise<IFollow[]> {
    try {
      const user = await UserModel.findOne({walletId}) 
      if (!user) throw new Error()
      const follows: any[] = await FollowModel.find({ followed: user._id })
        .populate("follower");
      return follows;
    } catch (err) {
      throw new Error("Followers can't be fetched");
    }
  }

  /**
   * Returns all of users' followings
   * @param walletId - The user's wallet id
   * @throws Will throw an error if followings can't be fetched
   */
  async getUserFollowings(walletId: string): Promise<IFollow[]> {
    try {
      const user = await UserModel.findOne({walletId}) 
      if (!user) throw new Error()
      const follows: any[] = await FollowModel.find({ follower: user._id })
        .populate("followed");
      return follows;
    } catch (err) {
      throw new Error("Followings can't be fetched");
    }
  }
}

export default new FollowService();
