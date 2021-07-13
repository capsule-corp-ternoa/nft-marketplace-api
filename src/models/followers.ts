import mongoose, { PaginateModel } from "mongoose";
import { IFollower } from "../interfaces/IFollower";
import mongoosePaginate from "mongoose-paginate-v2";

/* based on socialite implementation https://github.com/mongodb-labs/socialite/blob/master/docs/graph.md */

const Follower = new mongoose.Schema({
  _f: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
    unique: false,
  },
  _t: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
    unique: false,
  },
});

Follower.index({ _f: 1, _t: 1 }, { unique: true });
Follower.plugin(mongoosePaginate);

const FollowerModel = mongoose.model<IFollower & mongoose.Document>(
  "Follower",
  Follower
) as PaginateModel<IFollower & mongoose.Document>;

export default FollowerModel;
