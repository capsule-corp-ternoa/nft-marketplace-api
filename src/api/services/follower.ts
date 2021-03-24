import L from "../../common/logger";
import FollowersModel from "../../models/followers";
import { IUser } from "src/interfaces/IUser";

export class FollowerService {
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

  async getUserFollowers(id: string): Promise<IUser[]> {
    try {
      const users: any[] = await FollowersModel.find({ _f: id })
        .select("_t -_id")
        .populate("_t");
      return users.map((e) => e._t);
    } catch (err) {
      throw new Error("Followers can't be fetched");
    }
  }

  async getUserFollowings(id: string): Promise<IUser[]> {
    try {
      const ids = await FollowersModel.find({ _t: id }).select("_f -_id");
      return [];
    } catch (err) {
      throw new Error("Followings can't be fetched");
    }
  }
}

export default new FollowerService();
