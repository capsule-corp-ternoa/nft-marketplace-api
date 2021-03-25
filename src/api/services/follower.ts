import L from "../../common/logger";
import FollowersModel from "../../models/followers";
import { IUser } from "src/interfaces/IUser";

export class FollowerService {
  /**
   * Creates a following connection in DB
   * @param _f - The followed user's mongo id
   * @param _t - The follower's mongo id
   * @throws Will throw an error if user can't be followed
   */
  async newFollow(_f: string, _t: string): Promise<void> {
    try {
      const follow = new FollowersModel({
        _f,
        _t,
      });
      await follow.save();
    } catch (err) {
      throw new Error("Couldn't follow user");
    }
  }

  /**
   * Returns all of user's followers
   * @param id - The user's mongo id
   * @throws Will throw an error if followers can't be fetched
   */
  async getUserFollowers(id: string): Promise<IUser[]> {
    try {
      const users: any[] = await FollowersModel.find({ _f: id })
        .select("_t -_id")
        .populate("_t");
      return users;
    } catch (err) {
      throw new Error("Followers can't be fetched");
    }
  }

  /**
   * Returns all of users' followings
   * @param id - The user's mongo id
   * @throws Will throw an error if followings can't be fetched
   */
  async getUserFollowings(id: string): Promise<IUser[]> {
    try {
      const users: any[] = await FollowersModel.find({ _t: id })
        .select("_f -_id")
        .populate("_f");
      return users;
    } catch (err) {
      throw new Error("Followings can't be fetched");
    }
  }
}

export default new FollowerService();
